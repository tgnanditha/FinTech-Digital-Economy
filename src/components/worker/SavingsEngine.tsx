import React, { useState } from 'react';
import { useSteady } from '../../context/SteadyContext';
import { formatINR } from '../../utils/finance';
import {
  PiggyBank,
  RotateCcw,
  Play,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export const SavingsEngine: React.FC = () => {
  const {
    smoothingConfig,
    updateSmoothingConfig,
    simulationResult,
    resetSimulation,
    showToast,
    addAuditLog
  } = useSteady();

  // Local state for smooth slider controls before or during live simulation
  const [targetPay, setTargetPay] = useState<number>(smoothingConfig.targetDailyIncome);
  const [surplusPercent, setSurplusPercent] = useState<number>(smoothingConfig.surplusSavePercent);
  const [safetyFloor, setSafetyFloor] = useState<number>(smoothingConfig.safetyFloor);
  const [maxContribution, setMaxContribution] = useState<number>(smoothingConfig.maxDailyContribution);
  const [maxWithdrawal, setMaxWithdrawal] = useState<number>(smoothingConfig.maxDailyWithdrawal);

  // Sync to global context
  const handleApplySimulation = () => {
    updateSmoothingConfig({
      targetDailyIncome: targetPay,
      surplusSavePercent: surplusPercent,
      safetyFloor: safetyFloor,
      maxDailyContribution: maxContribution,
      maxDailyWithdrawal: maxWithdrawal
    });
    addAuditLog('SIMULATED', `Re-ran 30-Day Income Smoothing Simulation with target ₹${targetPay}/day and ${surplusPercent}% surplus rate.`);
    showToast('Simulation updated with new parameters!');
  };

  const handleReset = () => {
    resetSimulation();
    setTargetPay(950);
    setSurplusPercent(25);
    setSafetyFloor(500);
    setMaxContribution(400);
    setMaxWithdrawal(450);
  };

  const chartData = simulationResult.ledger.map((entry) => ({
    date: entry.date.slice(5),
    day: entry.dayOfWeek,
    actualNet: entry.net,
    effectiveIncome: entry.effectiveIncome,
    contribution: entry.contribution,
    withdrawal: entry.withdrawal,
    bufferBalance: entry.closingBalance,
    shortfall: entry.shortfall,
    eventLabel: entry.eventLabel
  }));

  return (
    <div className="space-y-6">
      {/* Page Title & Explanation */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-forest uppercase tracking-wider">
              Auto-Save & Income Smoothing Engine
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-charcoal mt-0.5">
              Rules-Based Safety Buffer Simulator
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 max-w-3xl leading-relaxed">
              Gig earnings fluctuate day-to-day. Steady's auto-save algorithm skims a calibrated fraction of high-income surplus and stores it in your safety buffer. When adverse weather or low platform demand strikes, funds top up your daily earnings to your chosen target—guaranteeing <strong>zero negative balances</strong> and <strong>honest shortfall accounting</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={handleApplySimulation}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-charcoal bg-mint hover:bg-mint-light rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-charcoal" />
              Run 30-Day Simulation
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-charcoal-muted hover:text-charcoal bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
              title="Reset rules to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Disclaimer Callout */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2 text-[11px] text-charcoal-muted">
          <HelpCircle className="w-3.5 h-3.5 text-forest shrink-0" />
          <span>
            <strong>Accounting Prototype Notice:</strong> The buffer is an illustrative mathematical simulation. It does not transfer fiat bank balances or create real electronic money.
          </span>
        </div>
      </div>

      {/* Simulator Sliders & Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Control 1: Target steady pay */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-charcoal mb-1">
            <label htmlFor="target-pay-slider" className="font-semibold">Target Daily Pay</label>
            <span className="font-mono tabular-nums font-bold text-forest">{formatINR(targetPay)}</span>
          </div>
          <input
            id="target-pay-slider"
            type="range"
            min={700}
            max={1500}
            step={50}
            value={targetPay}
            onChange={(e) => {
              const val = Number(e.target.value);
              setTargetPay(val);
              updateSmoothingConfig({ targetDailyIncome: val });
            }}
            className="w-full accent-forest cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-charcoal-muted mt-1">
            <span>₹700</span>
            <span>Target/day</span>
            <span>₹1,500</span>
          </div>
        </div>

        {/* Control 2: Surplus savings percentage */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-charcoal mb-1">
            <label htmlFor="surplus-pct-slider" className="font-semibold">Surplus Save %</label>
            <span className="font-mono tabular-nums font-bold text-forest">{surplusPercent}%</span>
          </div>
          <input
            id="surplus-pct-slider"
            type="range"
            min={10}
            max={50}
            step={5}
            value={surplusPercent}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSurplusPercent(val);
              updateSmoothingConfig({ surplusSavePercent: val });
            }}
            className="w-full accent-forest cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-charcoal-muted mt-1">
            <span>10%</span>
            <span>Of surplus</span>
            <span>50%</span>
          </div>
        </div>

        {/* Control 3: Safety Floor */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-charcoal mb-1">
            <label htmlFor="safety-floor-slider" className="font-semibold">Min Safety Floor</label>
            <span className="font-mono tabular-nums font-bold text-forest">{formatINR(safetyFloor)}</span>
          </div>
          <input
            id="safety-floor-slider"
            type="range"
            min={300}
            max={800}
            step={50}
            value={safetyFloor}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSafetyFloor(val);
              updateSmoothingConfig({ safetyFloor: val });
            }}
            className="w-full accent-forest cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-charcoal-muted mt-1">
            <span>₹300</span>
            <span>Protected net</span>
            <span>₹800</span>
          </div>
        </div>

        {/* Control 4: Max daily contribution cap */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-charcoal mb-1">
            <label htmlFor="max-contrib-slider" className="font-semibold">Max Daily Save</label>
            <span className="font-mono tabular-nums font-bold text-forest">{formatINR(maxContribution)}</span>
          </div>
          <input
            id="max-contrib-slider"
            type="range"
            min={200}
            max={800}
            step={50}
            value={maxContribution}
            onChange={(e) => {
              const val = Number(e.target.value);
              setMaxContribution(val);
              updateSmoothingConfig({ maxDailyContribution: val });
            }}
            className="w-full accent-forest cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-charcoal-muted mt-1">
            <span>₹200</span>
            <span>Cap/day</span>
            <span>₹800</span>
          </div>
        </div>

        {/* Control 5: Max daily withdrawal cap */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-charcoal mb-1">
            <label htmlFor="max-withdr-slider" className="font-semibold">Max Daily Payout</label>
            <span className="font-mono tabular-nums font-bold text-forest">{formatINR(maxWithdrawal)}</span>
          </div>
          <input
            id="max-withdr-slider"
            type="range"
            min={200}
            max={800}
            step={50}
            value={maxWithdrawal}
            onChange={(e) => {
              const val = Number(e.target.value);
              setMaxWithdrawal(val);
              updateSmoothingConfig({ maxDailyWithdrawal: val });
            }}
            className="w-full accent-forest cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-charcoal-muted mt-1">
            <span>₹200</span>
            <span>Cap/day</span>
            <span>₹800</span>
          </div>
        </div>
      </div>

      {/* Simulation Results Scoreboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-charcoal-muted">Total Surplus Saved</div>
          <div className="text-xl sm:text-2xl font-bold text-forest font-mono tabular-nums mt-1">
            {formatINR(simulationResult.totalSaved)}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1">
            From high-demand shifts
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-charcoal-muted">Total Buffer Payouts</div>
          <div className="text-xl sm:text-2xl font-bold text-charcoal font-mono tabular-nums mt-1">
            {formatINR(simulationResult.totalWithdrawn)}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1">
            Supplemented {simulationResult.daysSupported} lean shifts
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-charcoal-muted">Ending Buffer Balance</div>
          <div className="text-xl sm:text-2xl font-bold text-forest font-mono tabular-nums mt-1">
            {formatINR(simulationResult.finalBufferBalance)}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1">
            Never negative · Safety reserve
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-charcoal-muted">Stability Gain</div>
          <div className="text-xl sm:text-2xl font-bold text-forest font-mono tabular-nums mt-1">
            +{simulationResult.stabilityImprovementPercent}%
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1">
            Volatility: ±{formatINR(simulationResult.incomeVolatilityBefore)} → ±{formatINR(simulationResult.incomeVolatilityAfter)}
          </div>
        </div>
      </div>

      {/* Synchronized Simulation Chart */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-charcoal">
              30-Day Before & After Smoothing Comparison
            </h2>
            <div className="text-xs text-charcoal-muted mt-0.5">
              Notice how the dark line stabilizes across rainy or outage days where the buffer automatically provides payouts.
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-charcoal-muted">
              <span className="w-3 h-3 bg-neutral-200 rounded-xs" /> Unsmoothed Net
            </span>
            <span className="flex items-center gap-1.5 text-charcoal-muted">
              <span className="w-3.5 h-0.5 bg-forest" /> Smoothed Pay
            </span>
            <span className="flex items-center gap-1.5 text-charcoal-muted">
              <span className="w-3 h-3 bg-mint-light border border-forest rounded-xs" /> Buffer Balance
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
                          {d.eventLabel && (
                            <span className="text-[10px] bg-amber-50 text-amber-800 font-medium px-1.5 py-0.5 rounded">
                              {d.eventLabel}
                            </span>
                          )}
                        </div>
                        <div className="text-charcoal-muted">Actual Net: <strong className="font-mono text-charcoal">{formatINR(d.actualNet)}</strong></div>
                        {d.contribution > 0 && (
                          <div className="text-forest font-medium">Surplus Auto-Saved: <strong className="font-mono">+{formatINR(d.contribution)}</strong></div>
                        )}
                        {d.withdrawal > 0 && (
                          <div className="text-amber-800 font-medium">Buffer Top-Up: <strong className="font-mono">+{formatINR(d.withdrawal)}</strong></div>
                        )}
                        {d.shortfall > 0 && (
                          <div className="text-red-700 font-medium">Target Shortfall: <strong className="font-mono">-{formatINR(d.shortfall)}</strong></div>
                        )}
                        <div className="text-charcoal font-semibold pt-1 border-t border-neutral-100">
                          Effective Take-Home: <span className="font-mono text-forest">{formatINR(d.effectiveIncome)}</span>
                        </div>
                        <div className="text-charcoal-muted text-[10px]">
                          Closing Buffer: <span className="font-mono">{formatINR(d.bufferBalance)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="actualNet" fill="#E2E8F0" maxBarSize={20} />
              <Line type="monotone" dataKey="effectiveIncome" stroke="#145C46" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="bufferBalance" stroke="#2F9460" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Day-by-Day Transaction Ledger */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-charcoal">
              Day-by-Day Buffer Accounting Ledger (30 Days)
            </h3>
            <div className="text-xs text-charcoal-muted">
              Live synchronized ledger: Opening balance, surplus saves, lean-day payouts, and closing balance.
            </div>
          </div>
          <div className="text-xs font-mono text-charcoal-muted">
            30 Entries · Initial Buffer: ₹2,400
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs text-left font-mono">
            <thead className="sticky top-0 bg-neutral-50 text-charcoal-muted uppercase text-[10px] tracking-wider border-b border-neutral-200 z-10 font-sans">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Day</th>
                <th className="py-2.5 px-3 font-semibold text-right">Net Earned</th>
                <th className="py-2.5 px-3 font-semibold text-right">Opening Buffer</th>
                <th className="py-2.5 px-3 font-semibold text-right">Auto-Save (+)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Buffer Payout (-)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Effective Pay</th>
                <th className="py-2.5 px-3 font-semibold text-right">Closing Buffer</th>
                <th className="py-2.5 px-3 font-semibold">Shortfall / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {simulationResult.ledger.map((entry) => (
                <tr key={entry.dayIndex} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-2 px-3 font-sans text-charcoal">
                    {entry.date.slice(5)} <span className="text-charcoal-muted text-[10px]">({entry.dayOfWeek})</span>
                  </td>
                  <td className="py-2 px-3 text-right text-charcoal tabular-nums">
                    {formatINR(entry.net)}
                  </td>
                  <td className="py-2 px-3 text-right text-charcoal-muted tabular-nums">
                    {formatINR(entry.openingBalance)}
                  </td>
                  <td className="py-2 px-3 text-right text-forest font-semibold tabular-nums">
                    {entry.contribution > 0 ? `+${formatINR(entry.contribution)}` : '—'}
                  </td>
                  <td className="py-2 px-3 text-right text-amber-800 font-semibold tabular-nums">
                    {entry.withdrawal > 0 ? `-${formatINR(entry.withdrawal)}` : '—'}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-forest tabular-nums">
                    {formatINR(entry.effectiveIncome)}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-charcoal tabular-nums">
                    {formatINR(entry.closingBalance)}
                  </td>
                  <td className="py-2 px-3 font-sans">
                    {entry.shortfall > 0 ? (
                      <span className="text-red-700 text-[10px] font-semibold bg-red-50 px-1.5 py-0.5 rounded">
                        Shortfall {formatINR(entry.shortfall)}
                      </span>
                    ) : entry.eventLabel ? (
                      <span className="text-amber-800 text-[10px] bg-amber-50 px-1.5 py-0.5 rounded">
                        {entry.eventLabel}
                      </span>
                    ) : (
                      <span className="text-charcoal-muted text-[10px]">Target achieved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
