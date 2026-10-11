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
  timestamp: Date;
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

function formatTimestamp(date: Date) {
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function DashboardPage() {
  const [measurement, setMeasurement] = useState<Measurement>({
    temperature: 26.4,
    humidity: 58,
    lowWater: true,
    highWater: false,
    relayOn: false,
    timestamp: new Date(),
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

        <section className="mb-6 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Water level monitor
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Electrode status and estimated tank level
                </p>
              </div>
              <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                <Waves size={21} />
              </span>
            </div>

            <div className="grid gap-3">
              <SensorIndicator
                name="LOW"
                gpio={19}
                wet={measurement.lowWater}
                description="Minimum level"
              />
              <SensorIndicator
                name="HIGH"
                gpio={18}
                wet={measurement.highWater}
                description="Full level"
              />
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">
                  Tank level indicator
                </span>
                <span className="font-bold text-slate-900">
                  {waterLevelPercent}%
                </span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${impossibleState ? "bg-red-500" : waterLevelPercent === 100 ? "bg-emerald-500" : waterLevelPercent > 20 ? "bg-cyan-500" : "bg-amber-500"}`}
                  style={{ width: `${waterLevelPercent}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-xs text-slate-400">
                <span>LOW</span>
                <span>HIGH / FULL</span>
              </div>
              <p
                className={`mt-4 flex items-center gap-2 text-sm font-semibold ${impossibleState ? "text-red-700" : "text-slate-700"}`}
              >
                {impossibleState ? (
                  <AlertTriangle size={17} />
                ) : (
                  <CheckCircle2 size={17} />
                )}
                {tankStatus}
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  System status
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Latest controller and connection information
                </p>
              </div>
              <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                <ShieldCheck size={21} />
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  {online ? (
                    <Wifi className="text-emerald-600" size={19} />
                  ) : (
                    <WifiOff className="text-red-600" size={19} />
                  )}
                  <div>
                    <p className="text-sm font-semibold">Device connection</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      ESP32 telemetry
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold ${online ? "text-emerald-700" : "text-red-700"}`}
                >
                  {online ? "ONLINE" : "OFFLINE"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <Clock3 className="text-slate-500" size={19} />
                  <div>
                    <p className="text-sm font-semibold">Last measurement</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Most recent sample time
                    </p>
                  </div>
                </div>
                <span className="text-right text-xs font-medium text-slate-600">
                  {formatTimestamp(measurement.timestamp)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <Zap
                    className={
                      measurement.relayOn ? "text-amber-600" : "text-slate-500"
                    }
                    size={19}
                  />
                  <div>
                    <p className="text-sm font-semibold">Pump relay</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      GPIO 13 · status only
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${measurement.relayOn ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-700"}`}
                >
                  {measurement.relayOn ? "ON" : "OFF"}
                </span>
              </div>
            </div>
          </article>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent measurements
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                The latest simulated samples from this session
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Time</th>
                  <th className="px-5 py-3 font-semibold">Temperature</th>
                  <th className="px-5 py-3 font-semibold">Humidity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-cyan-50/40">
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {formatTimestamp(measurement.timestamp)}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {measurement.temperature.toFixed(1)} °C
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {measurement.humidity}%
                  </td>
                </tr>
                {history.map((item, index) => (
                  <tr
                    key={`${item.timestamp.getTime()}-${index}`}
                    className="hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatTimestamp(item.timestamp)}
                    </td>
                    <td className="px-5 py-4">
                      {item.temperature.toFixed(1)} °C
                    </td>
                    <td className="px-5 py-4">{item.humidity}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-6 flex flex-col justify-between gap-2 pb-6 text-xs text-slate-500 sm:flex-row">
          <span>Climate Monitor</span>
        </footer>
      </div>
    </main>
  );
}
