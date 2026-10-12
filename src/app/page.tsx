"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  Droplets,
  Thermometer,
  Waves,
  Zap,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";

type Reading = {
  id: string;
  temperature: number;
  humidity: number;
  createdAt: string;
};

type Measurement = {
  temperature: number;
  humidity: number;
  lowWater: boolean;
  highWater: boolean;
  relayOn: boolean;
};

function MetricCard({
  label,
  value,
  unit,
  description,
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  unit: string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`rounded-xl p-2.5 ${iconClass}`}>{icon}</span>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-4xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        <span className="text-sm font-medium text-slate-500">{unit}</span>
      </div>

      <p className="mt-3 text-xs text-slate-500">{description}</p>
    </article>
  );
}

export default function DashboardPage() {
  const [reading, setReading] = useState<Reading | null>(null);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Water-level and relay data are not stored in Neon yet.
  const [measurement] = useState<Measurement>({
    temperature: 0,
    humidity: 0,
    lowWater: false,
    highWater: false,
    relayOn: false,
  });

  const fetchLatestReading = useCallback(async () => {
    try {
      const response = await fetch("/api/readings", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`API request failed (${response.status})`);
      }

      const data: Reading[] = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected API response");
      }

      if (data.length > 0) {
        setReading(data[0]);
      }

      setOnline(true);
      setAlert(null);
      setLastChecked(new Date());
    } catch (error) {
      console.error("Unable to load sensor readings:", error);
      setOnline(false);
      setAlert(
        "Unable to retrieve measurements. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadReadings = async () => {
      try {
        const response = await fetch("/api/readings", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`API request failed (${response.status})`);
        }

        const data: Reading[] = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected API response");
        }

        if (cancelled) return;

        if (data.length > 0) {
          setReading(data[0]);
        }

        setOnline(true);
        setAlert(null);
        setLastChecked(new Date());
      } catch (error) {
        if (cancelled) return;

        console.error("Unable to load sensor readings:", error);
        setOnline(false);
        setAlert(
          "Unable to retrieve measurements. Check your connection and try again.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadReadings();

    const intervalId = window.setInterval(() => {
      void loadReadings();
    }, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const impossibleState = !measurement.lowWater && measurement.highWater;

  const tankStatus = impossibleState
    ? "Sensor conflict"
    : measurement.lowWater && measurement.highWater
      ? "Tank full"
      : measurement.lowWater
        ? "Water above LOW"
        : "Demo data · not connected";

  const displayAlert = alert;

  const formattedReadingTime = reading
    ? new Date(reading.createdAt).toLocaleString()
    : "No measurements saved";

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-7 flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-700">
              <Activity size={17} />
              ENVIRONMENT MONITORING
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Climate Monitor
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Temperature, humidity and water tank status
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${
                online
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {online ? <Wifi size={16} /> : <WifiOff size={16} />}
              {online ? "API connected" : "API disconnected"}
            </div>

            <button
              onClick={() => void fetchLatestReading()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </header>

        {displayAlert && (
          <section
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-red-100 p-2 text-red-700">
                <AlertTriangle size={21} />
              </div>
              <div>
                <p className="font-bold text-red-900">Connection alert</p>
                <p className="mt-1 text-sm text-red-800">{displayAlert}</p>
              </div>
            </div>

            <button
              onClick={() => setAlert(null)}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 sm:self-center"
            >
              <Check size={15} />
              Dismiss
            </button>
          </section>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Temperature"
            value={
              reading ? reading.temperature.toFixed(1) : loading ? "..." : "--"
            }
            unit="°C"
            description="Latest saved DHT11 measurement"
            icon={<Thermometer size={20} />}
            iconClass="bg-orange-100 text-orange-700"
          />

          <MetricCard
            label="Relative humidity"
            value={
              reading ? reading.humidity.toFixed(0) : loading ? "..." : "--"
            }
            unit="%"
            description="Latest saved DHT11 measurement"
            icon={<Droplets size={20} />}
            iconClass="bg-cyan-100 text-cyan-700"
          />

          <MetricCard
            label="Water tank"
            value="DEMO"
            unit=""
            description={tankStatus}
            icon={<Waves size={20} />}
            iconClass="bg-blue-100 text-blue-700"
          />

          <MetricCard
            label="Pump relay"
            value="DEMO"
            unit=""
            description="Not connected to the database"
            icon={<Zap size={20} />}
            iconClass="bg-emerald-100 text-emerald-700"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Latest measurement
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Retrieved from your Neon database through the API
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">
                Measurement timestamp
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {formattedReadingTime}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500">Database record ID</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {reading ? reading.id : loading ? "Loading..." : "No data"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500">Last API check</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {lastChecked ? lastChecked.toLocaleTimeString() : "Checking..."}
              </p>
            </div>
          </div>

          {!reading && !loading && online && (
            <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              No measurements have been saved yet. Send a reading to your API to
              display it here.
            </p>
          )}
        </section>

        <p className="mt-5 text-center text-xs text-slate-500">
          Dashboard refreshes every 60 seconds. Water-level and relay monitoring
          are not connected to live data yet.
        </p>
      </div>
    </main>
  );
}
