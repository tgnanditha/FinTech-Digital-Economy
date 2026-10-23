import React from 'react';
import { useSteady } from '../../context/SteadyContext';
import { formatINR } from '../../utils/finance';
import {
  TrendingUp,
  PiggyBank,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertCircle,
  Coins,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { FinancialGoals } from './FinancialGoals';

export const DashboardOverview: React.FC = () => {
  const {
    activeWorker,
    filteredEarnings,
    dateRange,
    setDateRange,
    simulationResult,
    safeToSpendResult,
    steadyScoreResult,
    setCurrentView,
    loanOffers
  } = useSteady();

  // Metric derivations
  const latestDay = filteredEarnings[filteredEarnings.length - 1] || { grossEarnings: 0, netEarnings: 0 };
  const totalNetPeriod = filteredEarnings.reduce((sum, d) => sum + d.netEarnings, 0);
  const avgDailyNet = Math.round(totalNetPeriod / Math.max(1, filteredEarnings.length));
  const weekEarnings = filteredEarnings.slice(-7).reduce((sum, d) => sum + d.netEarnings, 0);

  // Chart data: compare actual net with smoothed target
  const chartData = filteredEarnings.map((d, index) => {
    const simEntry = simulationResult.ledger[index % simulationResult.ledger.length];
    return {
      date: d.date.slice(5), // MM-DD
      day: d.dayOfWeek,
      actualNet: d.netEarnings,
      smoothedIncome: simEntry ? simEntry.effectiveIncome : d.netEarnings,
      targetBaseline: 950,
      eventLabel: d.eventLabel
    };
  });

  return (
    <div className="space-y-6">
      {/* Header with Title and Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-charcoal-muted mb-1">
            <span>Welcome back</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-forest">{activeWorker.platform}</span>
            <span aria-hidden="true">·</span>
            <span>{activeWorker.city}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-charcoal">
            {activeWorker.name}
          </h1>
        </div>

        {/* Date-range segmented control */}
        <div className="flex items-center gap-1 p-1 bg-white border border-neutral-200 rounded-lg shadow-2xs self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-charcoal-muted ml-2 mr-1" />
          <button
            onClick={() => setDateRange('7d')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              dateRange === '7d' ? 'bg-forest text-white' : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDateRange('30d')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              dateRange === '30d' ? 'bg-forest text-white' : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setDateRange('90d')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              dateRange === '90d' ? 'bg-forest text-white' : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (5 core cards) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {/* KPI 1: Today's Earnings */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs font-medium text-charcoal-muted mb-1 flex items-center justify-between">
            <span>Today's Net</span>
            <TrendingUp className="w-4 h-4 text-forest" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-charcoal font-mono tabular-nums">
            {formatINR(latestDay.netEarnings)}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1 flex items-center gap-1">
            <span className="text-forest font-medium flex items-center">
              <ArrowUpRight className="w-3 h-3" /> Gross {formatINR(latestDay.grossEarnings)}
            </span>
          </div>
        </div>

        {/* KPI 2: Earnings this week */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs font-medium text-charcoal-muted mb-1 flex items-center justify-between">
            <span>Past 7 Days</span>
            <Calendar className="w-4 h-4 text-forest" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-charcoal font-mono tabular-nums">
            {formatINR(weekEarnings)}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1">
            Avg: <span className="font-mono tabular-nums font-medium text-charcoal">{formatINR(Math.round(weekEarnings / 7))}</span>/day
          </div>
        </div>

        {/* KPI 3: Available buffer balance */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs font-medium text-charcoal-muted mb-1 flex items-center justify-between">
            <span>Buffer Balance</span>
            <PiggyBank className="w-4 h-4 text-forest" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-forest font-mono tabular-nums">
            {formatINR(simulationResult.finalBufferBalance)}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1">
            {simulationResult.daysSupported} lean days protected
          </div>
        </div>

        {/* KPI 4: Steady Score */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs font-medium text-charcoal-muted mb-1 flex items-center justify-between">
            <span>Steady Score</span>
            <Sparkles className="w-4 h-4 text-forest" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-charcoal font-mono tabular-nums flex items-baseline gap-1">
            {steadyScoreResult.score}
            <span className="text-xs font-normal text-charcoal-muted">/ 900</span>
          </div>
          <div className="text-[11px] text-forest font-medium mt-1">
            {steadyScoreResult.band} Rating
          </div>
        </div>

        {/* KPI 5: Safe-to-spend today */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs col-span-2 md:col-span-1">
          <div className="text-xs font-medium text-charcoal-muted mb-1 flex items-center justify-between">
            <span>Safe-to-Spend</span>
            <Coins className="w-4 h-4 text-forest" />
          </div>
          <div className={`text-xl sm:text-2xl font-bold font-mono tabular-nums ${safeToSpendResult.isNegative ? 'text-amber-700' : 'text-charcoal'}`}>
            {formatINR(safeToSpendResult.dailySafeToSpend)}
            <span className="text-xs font-normal text-charcoal-muted">/day</span>
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1 truncate">
            Obligations subtracted
          </div>
        </div>
      </div>

      {/* Prominent Callout */}
      <div className="bg-forest-surface border border-forest/20 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-forest/10 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-forest" />
          </div>
          <div>
            <div className="text-sm font-semibold text-forest">
              Your buffer could help cover a lower-earning week.
            </div>
            <div className="text-xs text-charcoal-muted mt-0.5 max-w-2xl leading-relaxed">
              Based on your 30-day baseline, your accumulated safety buffer of {formatINR(simulationResult.finalBufferBalance)} provides an estimated {Math.max(1, Math.floor(simulationResult.finalBufferBalance / 450))} days of emergency earnings replenishment during rainy or low-demand shifts.
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('worker-savings')}
          className="px-4 py-2 text-xs font-semibold text-white bg-forest hover:bg-forest-dark rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Configure Auto-Save Rules
        </button>
      </div>

      {/* Main Income Chart: Actual Irregular Earnings vs Smoothed Target */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-charcoal">
              Earnings Smoothing Simulation ({dateRange.toUpperCase()})
            </h2>
            <div className="text-xs text-charcoal-muted mt-0.5">
              Green bars represent actual erratic earnings; dark line demonstrates effective pay after buffer top-up and surplus savings.
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-mint-dark rounded-xs inline-block" />
              <span className="text-charcoal-muted">Actual Net</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-forest inline-block" />
              <span className="text-charcoal-muted">Smoothed Take-Home</span>
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5A6E65' }} stroke="#CBD5CD" />
              <YAxis
                tick={{ fontSize: 11, fill: '#5A6E65' }}
                stroke="#CBD5CD"
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-lg text-xs space-y-1">
                        <div className="font-semibold text-charcoal flex items-center justify-between gap-4">
                          <span>{data.date} ({data.day})</span>
                          {data.eventLabel && (
                            <span className="text-amber-800 text-[10px] font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                              {data.eventLabel}
                            </span>
                          )}
                        </div>
                        <div className="text-charcoal-muted">
                          Actual Net: <strong className="font-mono text-charcoal">{formatINR(data.actualNet)}</strong>
                        </div>
                        <div className="text-charcoal-muted">
                          Smoothed Pay: <strong className="font-mono text-forest">{formatINR(data.smoothedIncome)}</strong>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="actualNet" name="Actual Net" fill="#B9F3D0" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Line
                type="monotone"
                dataKey="smoothedIncome"
                name="Smoothed Pay"
                stroke="#145C46"
                strokeWidth={2.5}
                dot={{ r: 2, fill: '#145C46' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-charcoal-muted">
          <div>
            Volatility Reduced By:{' '}
            <strong className="text-forest font-semibold">{simulationResult.stabilityImprovementPercent}%</strong>
          </div>
          <div>
            Total Surplus Saved:{' '}
            <strong className="text-charcoal font-mono tabular-nums font-semibold">{formatINR(simulationResult.totalSaved)}</strong>
          </div>
          <div>
            Emergency Buffer Top-Ups:{' '}
            <strong className="text-charcoal font-mono tabular-nums font-semibold">{formatINR(simulationResult.totalWithdrawn)}</strong>
          </div>
        </div>
      </div>

      {/* Time-Bound Financial Goals Section */}
      <FinancialGoals />

      {/* Two-Column Auxiliary Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Financial Health & Score Factors */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-charcoal">
              Steady Score Breakdown
            </h3>
            <button
              onClick={() => setCurrentView('worker-score')}
              className="text-xs font-semibold text-forest hover:text-forest-dark flex items-center gap-1 cursor-pointer"
            >
              Full Score Analysis <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {steadyScoreResult.components.map((comp) => (
              <div key={comp.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-charcoal">{comp.name}</span>
                  <span className="font-mono tabular-nums text-forest font-bold">
                    {comp.rawScore} / 100 ({Math.round(comp.weight * 100)}% wt)
                  </span>
                </div>
                <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden mb-1">
                  <div
                    className="bg-forest h-full rounded-full transition-all duration-300"
                    style={{ width: `${comp.rawScore}%` }}
                  />
                </div>
                <div className="text-[11px] text-charcoal-muted leading-tight">
                  {comp.insight}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Upcoming Expenses & Pre-Approved Flexible Loan */}
        <div className="space-y-6">
          {/* Safe-to-Spend Quick Card */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-charcoal">
                Safe-to-Spend Breakdown
              </h3>
              <button
                onClick={() => setCurrentView('worker-savings')}
                className="text-xs font-semibold text-forest hover:text-forest-dark flex items-center gap-1 cursor-pointer"
              >
                Adjust Obligations <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {safeToSpendResult.breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 border-b border-neutral-100 last:border-0">
                  <div>
                    <div className="font-medium text-charcoal">{item.label}</div>
                    <div className="text-[11px] text-charcoal-muted">{item.description}</div>
                  </div>
                  <div className={`font-mono tabular-nums font-semibold ${item.amount < 0 ? 'text-amber-800' : 'text-charcoal'}`}>
                    {formatINR(item.amount)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-charcoal">Net Discretionary Surplus:</span>
              <span className="font-mono tabular-nums font-bold text-forest text-sm">
                {formatINR(safeToSpendResult.netDiscretionarySurplus)}
              </span>
            </div>
          </div>

          {/* Flexible Loan Eligibility Preview */}
          <div className="bg-forest text-white p-5 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-mint mb-1">
              <span>Illustrative Credit Pre-Assessment</span>
              <span className="font-mono tabular-nums">Score {steadyScoreResult.score}</span>
            </div>
            <h4 className="text-lg font-bold">
              {loanOffers[0].lenderName}
            </h4>
            <div className="text-xs text-mint/80 mt-1 leading-relaxed">
              Based on your verified {activeWorker.tenureMonths}-month platform record, you qualify for an income-linked credit line of up to <strong>{formatINR(loanOffers[0].maxAmount)}</strong> with variable weekly relief installments.
            </div>

            <div className="mt-4 pt-3 border-t border-forest-light flex items-center justify-between">
              <div className="text-xs">
                Weekly from: <strong className="text-mint font-mono tabular-nums">{formatINR(loanOffers[0].minWeeklyFloor)}</strong>
              </div>
              <button
                onClick={() => setCurrentView('worker-loans')}
                className="px-3.5 py-1.5 text-xs font-bold text-forest bg-mint hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                View Loan Offers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
