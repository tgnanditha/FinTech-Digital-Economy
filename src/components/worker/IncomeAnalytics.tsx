import React, { useState } from 'react';
import { useSteady } from '../../context/SteadyContext';
import { formatINR, calculateRollingBaseline, calculateStandardDeviation } from '../../utils/finance';
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  Umbrella,
  Zap,
  Clock,
  ArrowUpDown,
  Filter,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export const IncomeAnalytics: React.FC = () => {
  const {
    activeWorker,
    activeEarnings,
    workers,
    activeWorkerId,
    setActiveWorkerId
  } = useSteady();

  // Metrics calculation
  const totalGross = activeEarnings.reduce((s, d) => s + d.grossEarnings, 0);
  const totalExpenses = activeEarnings.reduce((s, d) => s + d.workExpenses, 0);
  const totalNet = activeEarnings.reduce((s, d) => s + d.netEarnings, 0);
  const totalHours = activeEarnings.reduce((s, d) => s + d.hoursWorked, 0);

  const avgDailyNet = Math.round(totalNet / Math.max(1, activeEarnings.length));
  const avgWeeklyNet = avgDailyNet * 7;
  const netEarningsList = activeEarnings.map(d => d.netEarnings);
  const volatility = calculateStandardDeviation(netEarningsList);

  // Highest and lowest earning days
  let highestDay = activeEarnings[0];
  let lowestDay = activeEarnings[0];
  for (const d of activeEarnings) {
    if (d.netEarnings > highestDay.netEarnings) highestDay = d;
    if (d.netEarnings < lowestDay.netEarnings && d.netEarnings > 0) lowestDay = d;
  }

  // 7-day rolling baselines
  const baselines = calculateRollingBaseline(netEarningsList, 7);

  // Illustrative 7-day forecast (transparent rolling-average, NOT guaranteed)
  const last7Average = Math.round(
    activeEarnings.slice(-7).reduce((s, d) => s + d.netEarnings, 0) / 7
  );
  const forecastDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2026, 9, 31 + i);
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    // Expected variation based on day of week pattern
    const factor = isWeekend ? 1.25 : 0.95;
    const projectedNet = Math.round(last7Average * factor);
    return {
      day: dayOfWeek,
      date: `Nov ${(i + 1).toString().padStart(2, '0')}`,
      projectedNet,
      projectedGross: Math.round(projectedNet * 1.25),
      projectedExpenses: Math.round(projectedNet * 0.25)
    };
  });

  // Table sorting & event filtering
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'gross' | 'net' | 'hours'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const filteredTableDays = activeEarnings
    .filter(d => {
      if (filterCategory === 'all') return true;
      if (filterCategory === 'events') return !!d.eventLabel;
      return d.eventCategory === filterCategory;
    })
    .sort((a, b) => {
      let valA: number | string = a.date;
      let valB: number | string = b.date;
      if (sortField === 'gross') {
        valA = a.grossEarnings;
        valB = b.grossEarnings;
      } else if (sortField === 'net') {
        valA = a.netEarnings;
        valB = b.netEarnings;
      } else if (sortField === 'hours') {
        valA = a.hoursWorked;
        valB = b.hoursWorked;
      }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const chartData = activeEarnings.map((d, i) => ({
    date: d.date.slice(5),
    day: d.dayOfWeek,
    gross: d.grossEarnings,
    expenses: d.workExpenses,
    net: d.netEarnings,
    baseline: baselines[i],
    event: d.eventLabel,
    category: d.eventCategory
  }));

  return (
    <div className="space-y-6">
      {/* Top Profile Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
        <div>
          <div className="text-xs font-semibold text-forest uppercase tracking-wider">
            Income Analytics Engine
          </div>
          <h1 className="text-xl font-bold text-charcoal mt-0.5">
            30-Day Earnings & Volatility Analysis
          </h1>
          <div className="text-xs text-charcoal-muted mt-1">
            Analyzing deterministic synthetic telemetry across weekdays, surge festivals, and weather disruptions.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="worker-select-top" className="text-xs font-medium text-charcoal-muted whitespace-nowrap">
            Active Worker:
          </label>
          <select
            id="worker-select-top"
            value={activeWorkerId}
            onChange={(e) => setActiveWorkerId(e.target.value)}
            className="text-xs font-semibold text-charcoal bg-forest-surface border border-forest/20 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
          >
            {workers.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} — {w.category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-charcoal-muted">Total Gross Earnings</div>
          <div className="text-xl sm:text-2xl font-bold text-charcoal font-mono tabular-nums mt-1">
            {formatINR(totalGross)}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1">
            Across {totalHours.toFixed(0)} clocked hours
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-charcoal-muted">Operating Expenses</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-800 font-mono tabular-nums mt-1">
            {formatINR(totalExpenses)}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1">
            {Math.round((totalExpenses / Math.max(1, totalGross)) * 100)}% of gross (fuel & repairs)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-charcoal-muted">Net Take-Home</div>
          <div className="text-xl sm:text-2xl font-bold text-forest font-mono tabular-nums mt-1">
            {formatINR(totalNet)}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1">
            Daily average: <strong className="font-mono text-charcoal">{formatINR(avgDailyNet)}</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-charcoal-muted">Income Volatility (Std Dev)</div>
          <div className="text-xl sm:text-2xl font-bold text-charcoal font-mono tabular-nums mt-1">
            ±{formatINR(volatility)}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1">
            High: <span className="font-mono text-forest font-semibold">{formatINR(highestDay.netEarnings)}</span> · Low: <span className="font-mono text-amber-800 font-semibold">{formatINR(lowestDay.netEarnings)}</span>
          </div>
        </div>
      </div>

      {/* 30-Day Gross vs Net vs Rolling Baseline Chart */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-charcoal">
              30-Day Daily Gross & Net Trend with 7-Day Rolling Baseline
            </h2>
            <div className="text-xs text-charcoal-muted mt-0.5">
              Notice external weather disruptions causing temporary sharp drops that recover into weekend surges.
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-charcoal-muted">
              <span className="w-3 h-3 bg-mint-light border border-mint-dark rounded-xs" /> Gross
            </span>
            <span className="flex items-center gap-1.5 text-charcoal-muted">
              <span className="w-3 h-3 bg-mint-dark rounded-xs" /> Net
            </span>
            <span className="flex items-center gap-1.5 text-charcoal-muted">
              <span className="w-3.5 h-0.5 bg-forest" /> 7D Rolling Baseline
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5A6E65' }} stroke="#CBD5CD" />
              <YAxis tick={{ fontSize: 11, fill: '#5A6E65' }} stroke="#CBD5CD" tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-md text-xs space-y-1">
                        <div className="font-semibold text-charcoal flex items-center justify-between gap-3">
                          <span>{d.date} ({d.day})</span>
                          {d.event && (
                            <span className="text-[10px] bg-amber-50 text-amber-800 font-medium px-1.5 py-0.5 rounded">
                              {d.event}
                            </span>
                          )}
                        </div>
                        <div className="text-charcoal-muted">Gross: <strong className="font-mono text-charcoal">{formatINR(d.gross)}</strong></div>
                        <div className="text-charcoal-muted">Fuel & Expenses: <strong className="font-mono text-amber-800">-{formatINR(d.expenses)}</strong></div>
                        <div className="text-charcoal-muted">Net Earnings: <strong className="font-mono text-forest">{formatINR(d.net)}</strong></div>
                        <div className="text-charcoal-muted">7D Rolling Baseline: <strong className="font-mono text-charcoal">{formatINR(d.baseline)}</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="gross" fill="#E9FAF1" maxBarSize={28} />
              <Bar dataKey="net" fill="#1D785B" maxBarSize={28} />
              <Line type="monotone" dataKey="baseline" stroke="#17231E" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Illustrative 7-Day Rolling Forecast Section */}
      <div className="bg-forest-surface border border-forest/20 rounded-xl p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-forest" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-forest">
              Illustrative 7-Day Income Forecast (Transparent Rolling Baseline)
            </h3>
            <div className="text-xs text-charcoal-muted mt-0.5 max-w-3xl leading-relaxed">
              Steady uses an explainable 7-day weighted moving baseline ({formatINR(last7Average)}/day recent mean) combined with day-of-week demand multipliers. This is an <strong>illustrative projection</strong> to guide auto-save targets—never a guaranteed contractual prediction.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {forecastDays.map((fc, i) => (
            <div key={i} className="bg-white p-3 rounded-lg border border-neutral-200 text-center shadow-2xs">
              <div className="text-xs font-semibold text-charcoal">{fc.day}</div>
              <div className="text-[10px] text-charcoal-muted">{fc.date}</div>
              <div className="text-base font-bold text-forest font-mono tabular-nums mt-1.5">
                {formatINR(fc.projectedNet)}
              </div>
              <div className="text-[10px] text-charcoal-muted mt-0.5">
                Exp: ~{formatINR(fc.projectedExpenses)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Granular Daily Earnings Ledger Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-charcoal">
              30-Day Daily Earning Records
            </h3>
            <div className="text-xs text-charcoal-muted">
              Inspect gross revenues, vehicle fuel expenses, and contextual real-world events.
            </div>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterCategory === 'all' ? 'bg-white text-charcoal shadow-2xs font-semibold' : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              All Days ({activeEarnings.length})
            </button>
            <button
              onClick={() => setFilterCategory('events')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterCategory === 'events' ? 'bg-white text-charcoal shadow-2xs font-semibold' : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              Context Events
            </button>
            <button
              onClick={() => setFilterCategory('weather')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterCategory === 'weather' ? 'bg-white text-charcoal shadow-2xs font-semibold' : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              Weather Drops
            </button>
            <button
              onClick={() => setFilterCategory('surge')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterCategory === 'surge' ? 'bg-white text-charcoal shadow-2xs font-semibold' : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              Surge Days
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-charcoal-muted uppercase text-[10px] tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Date & Day</th>
                <th className="py-2.5 px-4 font-semibold text-right">Gross Earnings</th>
                <th className="py-2.5 px-4 font-semibold text-right">Work Expenses</th>
                <th className="py-2.5 px-4 font-semibold text-right">Net Take-Home</th>
                <th className="py-2.5 px-4 font-semibold text-right">Hours</th>
                <th className="py-2.5 px-4 font-semibold">Contextual Event Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono">
              {filteredTableDays.map((day, idx) => {
                const isDisruption = day.eventCategory === 'weather' || day.eventCategory === 'outage';
                const isSurge = day.eventCategory === 'surge';

                return (
                  <tr key={idx} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-sans text-charcoal font-medium">
                      {day.date}{' '}
                      <span className="text-charcoal-muted text-[11px]">({day.dayOfWeek})</span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-charcoal tabular-nums">
                      {formatINR(day.grossEarnings)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-amber-800 tabular-nums">
                      -{formatINR(day.workExpenses)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-forest tabular-nums">
                      {formatINR(day.netEarnings)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-charcoal-muted tabular-nums">
                      {day.hoursWorked}h
                    </td>
                    <td className="py-2.5 px-4 font-sans">
                      {day.eventLabel ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          isDisruption
                            ? 'bg-amber-50 text-amber-900 border border-amber-200'
                            : isSurge
                            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                            : 'bg-neutral-100 text-charcoal'
                        }`}>
                          {isDisruption ? <Umbrella className="w-3 h-3 text-amber-700" /> : <Zap className="w-3 h-3 text-emerald-700" />}
                          {day.eventLabel}
                        </span>
                      ) : (
                        <span className="text-charcoal-muted text-[11px]">Regular Shift</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
