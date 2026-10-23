import React from 'react';
import { useSteady } from '../../context/SteadyContext';
import { formatINR } from '../../utils/finance';
import {
  Coins,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Shield,
  Calendar,
  Wallet,
  ArrowRight
} from 'lucide-react';

export const SafeToSpendView: React.FC = () => {
  const {
    safeToSpendInputs,
    updateSafeToSpendInputs,
    safeToSpendResult,
    simulationResult
  } = useSteady();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="text-xs font-semibold text-forest uppercase tracking-wider">
          Daily Cash-Flow Governance
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-charcoal mt-0.5">
          Safe-to-Spend Daily Calculator
        </h1>
        <p className="text-xs text-charcoal-muted mt-1 max-w-3xl leading-relaxed">
          Avoid spending cash that has already been earmarked for upcoming room rent, bike loan installments, or grocery advances. This tool isolates immediately spendable liquid cash from locked safety reserves and obligations.
        </p>
      </div>

      {/* Main Safe-To-Spend Result Banner */}
      <div className={`p-6 rounded-xl border ${
        safeToSpendResult.isNegative
          ? 'bg-amber-50/70 border-amber-300'
          : 'bg-forest-surface border-forest/20'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              <Coins className="w-4 h-4 text-forest" />
              <span>Recommended Daily Spend Ceiling</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-charcoal mt-1 flex items-baseline gap-2">
              {formatINR(safeToSpendResult.dailySafeToSpend)}
              <span className="text-sm font-normal text-charcoal-muted font-sans">per day for {safeToSpendInputs.daysUntilNextPayout} days</span>
            </div>
            <div className="text-xs text-charcoal-muted mt-2 flex items-center gap-1.5">
              {safeToSpendResult.isNegative ? (
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
              )}
              <span className={safeToSpendResult.isNegative ? 'text-amber-800 font-medium' : 'text-forest font-medium'}>
                {safeToSpendResult.statusText}
              </span>
            </div>
          </div>

          {/* Quick Comparison to Locked Buffer */}
          <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs text-xs space-y-2 shrink-0 md:w-64">
            <div className="font-semibold text-charcoal flex items-center justify-between">
              <span>Restricted Buffer:</span>
              <span className="font-mono text-forest font-bold">{formatINR(simulationResult.finalBufferBalance)}</span>
            </div>
            <div className="text-[11px] text-charcoal-muted leading-tight">
              (Inaccessible for routine discretionary spending—reserved exclusively for rainy or zero-earning shift top-ups.)
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Form & Live Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Controls */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-charcoal">
            Adjust Cash Flow & Committed Obligations
          </h2>

          {/* Input 1: Liquid Funds */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label htmlFor="liquid-funds-input" className="font-semibold text-charcoal">Available Liquid Cash & Bank Balance</label>
              <span className="font-mono tabular-nums font-bold text-forest">{formatINR(safeToSpendInputs.availableLiquidFunds)}</span>
            </div>
            <input
              id="liquid-funds-input"
              type="range"
              min={1000}
              max={20000}
              step={500}
              value={safeToSpendInputs.availableLiquidFunds}
              onChange={(e) => updateSafeToSpendInputs({ availableLiquidFunds: Number(e.target.value) })}
              className="w-full accent-forest cursor-pointer"
            />
            <div className="text-[11px] text-charcoal-muted mt-0.5">
              Cash currently in your pocket or UPI bank balance (excluding auto-save buffer).
            </div>
          </div>

          {/* Input 2: Essential Obligations */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label htmlFor="obligations-input" className="font-semibold text-charcoal">Essential Fixed Obligations Due</label>
              <span className="font-mono tabular-nums font-bold text-amber-800">-{formatINR(safeToSpendInputs.essentialObligationsDue)}</span>
            </div>
            <input
              id="obligations-input"
              type="range"
              min={0}
              max={15000}
              step={200}
              value={safeToSpendInputs.essentialObligationsDue}
              onChange={(e) => updateSafeToSpendInputs({ essentialObligationsDue: Number(e.target.value) })}
              className="w-full accent-amber-700 cursor-pointer"
            />
            <div className="text-[11px] text-charcoal-muted mt-0.5">
              Pending room rent, bike EMI, electricity bill, or fuel credit due before next settlement.
            </div>
          </div>

          {/* Input 3: Safety Reserve */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label htmlFor="safety-reserve-input" className="font-semibold text-charcoal">Personal Untouchable Safety Floor</label>
              <span className="font-mono tabular-nums font-bold text-charcoal">-{formatINR(safeToSpendInputs.safetyReserve)}</span>
            </div>
            <input
              id="safety-reserve-input"
              type="range"
              min={500}
              max={5000}
              step={250}
              value={safeToSpendInputs.safetyReserve}
              onChange={(e) => updateSafeToSpendInputs({ safetyReserve: Number(e.target.value) })}
              className="w-full accent-forest cursor-pointer"
            />
            <div className="text-[11px] text-charcoal-muted mt-0.5">
              Minimum emergency cash floor you refuse to touch for daily meals or non-essentials.
            </div>
          </div>

          {/* Input 4: Days until next payout */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label htmlFor="payout-days-input" className="font-semibold text-charcoal">Days Until Next Platform Settlement</label>
              <span className="font-mono tabular-nums font-bold text-charcoal">{safeToSpendInputs.daysUntilNextPayout} Days</span>
            </div>
            <input
              id="payout-days-input"
              type="range"
              min={1}
              max={14}
              step={1}
              value={safeToSpendInputs.daysUntilNextPayout}
              onChange={(e) => updateSafeToSpendInputs({ daysUntilNextPayout: Number(e.target.value) })}
              className="w-full accent-forest cursor-pointer"
            />
            <div className="text-[11px] text-charcoal-muted mt-0.5">
              Swiggy/Zomato weekly Tuesday payout or Uber cycle window.
            </div>
          </div>
        </div>

        {/* Right: Transparent Math Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-charcoal">
            Transparent Step-by-Step Mathematical Proof
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center justify-between">
              <div>
                <span className="font-sans font-medium text-charcoal block">1. Gross Liquid Balance</span>
                <span className="font-sans text-[11px] text-charcoal-muted">Cash in hand & UPI savings</span>
              </div>
              <span className="text-forest font-bold tabular-nums text-sm">+{formatINR(safeToSpendInputs.availableLiquidFunds)}</span>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center justify-between">
              <div>
                <span className="font-sans font-medium text-charcoal block">2. Less Essential Obligations</span>
                <span className="font-sans text-[11px] text-charcoal-muted">Committed fixed bills</span>
              </div>
              <span className="text-amber-800 font-bold tabular-nums text-sm">-{formatINR(safeToSpendInputs.essentialObligationsDue)}</span>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center justify-between">
              <div>
                <span className="font-sans font-medium text-charcoal block">3. Less Safety Reserve</span>
                <span className="font-sans text-[11px] text-charcoal-muted">Untouchable emergency buffer</span>
              </div>
              <span className="text-charcoal font-bold tabular-nums text-sm">-{formatINR(safeToSpendInputs.safetyReserve)}</span>
            </div>

            <div className="p-3 bg-forest-surface rounded-lg border border-forest/20 flex items-center justify-between font-sans">
              <div>
                <span className="font-bold text-forest block">Net Discretionary Surplus</span>
                <span className="text-[11px] text-charcoal-muted">Immediately safe across {safeToSpendInputs.daysUntilNextPayout} days</span>
              </div>
              <span className={`font-mono font-bold tabular-nums text-base ${safeToSpendResult.isNegative ? 'text-amber-800' : 'text-forest'}`}>
                {formatINR(safeToSpendResult.netDiscretionarySurplus)}
              </span>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-center font-sans text-xs">
              Daily Safe-to-Spend = {formatINR(safeToSpendResult.netDiscretionarySurplus)} ÷ {safeToSpendInputs.daysUntilNextPayout} days ={' '}
              <strong className="font-mono text-forest font-bold">{formatINR(safeToSpendResult.dailySafeToSpend)}/day</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
