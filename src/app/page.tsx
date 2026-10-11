"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  Droplets,
  RefreshCw,
  ShieldCheck,
  Thermometer,
  Waves,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";

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

function SensorIndicator({
  name,
  gpio,
  wet,
  description,
}: {
  name: string;
  gpio: number;
  wet: boolean;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${wet ? "bg-cyan-100 text-cyan-700" : "bg-slate-200 text-slate-500"}`}
        >
          <Droplets size={19} />
        </div>
        <div>
          <p className="font-semibold text-slate-800">{name} sensor</p>
          <p className="mt-0.5 text-xs text-slate-500">
            GPIO {gpio} · {description}
          </p>
        </div>
      </div>
      <span
        className={`inline-flex min-w-20 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${wet ? "bg-cyan-100 text-cyan-800" : "bg-slate-200 text-slate-600"}`}
      >
        <span
          className={`h-2 w-2 rounded-full ${wet ? "bg-cyan-600" : "bg-slate-400"}`}
        />
        {wet ? "WATER" : "DRY"}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [measurement, setMeasurement] = useState<Measurement>({
    temperature: 26.4,
    humidity: 58,
    lowWater: true,
    highWater: false,
    relayOn: false,
  });
  const [online, setOnline] = useState(true);
  const [alert, setAlert] = useState<string | null>(null);
  const [history, setHistory] = useState<Measurement[]>([]);
  const [notice, setNotice] = useState("Demo mode · values are simulated");

  const impossibleState = !measurement.lowWater && measurement.highWater;
  const tankStatus = impossibleState
    ? "Sensor conflict"
    : measurement.lowWater && measurement.highWater
      ? "Tank full"
      : measurement.lowWater
        ? "Water above LOW"
        : "Below LOW · tank needs filling";

  const waterLevelPercent = measurement.highWater
    ? 100
    : measurement.lowWater
      ? 55
      : 15;
  const displayAlert =
    alert && !online
      ? "Device connection lost. No new measurements are being received."
      : alert;

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
                <p className="font-bold text-red-900">System alert</p>
                <p className="mt-1 text-sm text-red-800">{displayAlert}</p>
              </div>
            </div>
            <button
              onClick={() => setAlert(null)}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 sm:self-center"
            >
              <Check size={15} />
              Acknowledge
            </button>
          </section>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Temperature"
            value={measurement.temperature.toFixed(1)}
            unit="°C"
            description="Latest DHT11 measurement"
            icon={<Thermometer size={20} />}
            iconClass="bg-orange-100 text-orange-700"
          />
          <MetricCard
            label="Relative humidity"
            value={String(measurement.humidity)}
            unit="%"
            description="Latest DHT11 measurement"
            icon={<Droplets size={20} />}
            iconClass="bg-cyan-100 text-cyan-700"
          />
          <MetricCard
            label="Water tank"
            value={
              measurement.highWater
                ? "FULL"
                : measurement.lowWater
                  ? "MID"
                  : "LOW"
            }
            unit=""
            description={tankStatus}
            icon={<Waves size={20} />}
            iconClass="bg-blue-100 text-blue-700"
          />
          <MetricCard
            label="Pump relay"
            value={measurement.relayOn ? "ON" : "OFF"}
            unit=""
            description="Status only · demo controller"
            icon={<Zap size={20} />}
            iconClass={
              measurement.relayOn
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }
          />
        </section>
      </div>
    </main>
  );
}
