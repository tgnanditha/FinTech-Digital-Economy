import React, { useState } from 'react';
import { useSteady } from '../../context/SteadyContext';
import { formatINR } from '../../utils/finance';
import {
  Sparkles,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sliders,
  ShieldCheck,
  Scale
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export const SteadyScoreView: React.FC = () => {
  const {
    activeWorker,
    steadyScoreResult,
    extraSavingsBoost,
    setExtraSavingsBoost
  } = useSteady();

  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(false);

  // Radar data for 5 components
  const radarData = steadyScoreResult.components.map(c => ({
    subject: c.name.split(' ')[0],
    fullName: c.name,
    score: c.rawScore,
    fullMark: 100
  }));

  return (
    <div className="space-y-6">
      {/* Page Title & Scope */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-forest uppercase tracking-wider">
              Explainable Alternative Underwriting
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-charcoal mt-0.5">
              The Steady Score (300 — 900)
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 max-w-3xl leading-relaxed">
              Traditional credit bureaus penalize gig workers for lacking a corporate salary slip. The Steady Score evaluates transparent financial discipline: cash flow stability, auto-save buffers, and bill payment timeliness without black-box machine learning.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-surface border border-forest/20 rounded-lg text-xs font-semibold text-forest shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>{steadyScoreResult.confidence}</span>
          </div>
        </div>

        {/* Regulatory disclaimer */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2 text-[11px] text-charcoal-muted">
          <HelpCircle className="w-3.5 h-3.5 text-forest shrink-0" />
          <span>
            <strong>Prototype Disclaimer:</strong> This score is an illustrative non-bureau metric for fintech demonstration purposes. It does not replace CIBIL/Experian records or guarantee loan underwriting approval.
          </span>
        </div>
      </div>

      {/* Main Score Display Banner & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Gauge Card */}
        <div className="bg-forest text-white p-6 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-mint">
              <span>Overall Financial Health</span>
              <span className="font-semibold uppercase tracking-wider">Band: {steadyScoreResult.band}</span>
            </div>

            <div className="mt-4 text-center">
              <div className="text-5xl sm:text-6xl font-extrabold font-mono tabular-nums tracking-tight text-white">
                {steadyScoreResult.score}
              </div>
              <div className="text-xs text-mint/80 mt-1">
                Score Range: 300 (Building) to 900 (Prime Steady)
              </div>
            </div>

            {/* Score Band Indicator Bar */}
            <div className="mt-6 space-y-1.5">
              <div className="w-full bg-forest-dark h-2 rounded-full overflow-hidden flex">
                <div className="w-1/4 bg-red-400" title="Building (300-560)" />
                <div className="w-1/4 bg-amber-400" title="Fair (560-670)" />
                <div className="w-1/4 bg-mint" title="Good (670-770)" />
                <div className="w-1/4 bg-emerald-300" title="Excellent (770-900)" />
              </div>
              <div className="flex justify-between text-[10px] text-mint/70 font-mono">
                <span>300</span>
                <span>560</span>
                <span>670</span>
                <span>770</span>
                <span>900</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-forest-light text-xs text-mint/90 leading-relaxed">
            Worker: <strong>{activeWorker.name}</strong> ({activeWorker.category}) · {activeWorker.tenureMonths} months active.
          </div>
        </div>

        {/* 4-Month Historical Trend Chart */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-charcoal">Score Trajectory (4 Months)</h3>
              <span className="text-xs text-forest font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +42 pts gain
              </span>
            </div>
            <div className="text-xs text-charcoal-muted mb-4">
              Demonstrates consistent upward momentum as auto-save discipline was sustained.
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={steadyScoreResult.historicalTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5A6E65' }} stroke="#CBD5CD" />
                  <YAxis domain={[300, 900]} tick={{ fontSize: 11, fill: '#5A6E65' }} stroke="#CBD5CD" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 rounded border border-neutral-200 shadow text-xs">
                            <span className="text-charcoal font-semibold">{payload[0].payload.month}:</span>{' '}
                            <span className="font-mono font-bold text-forest">{payload[0].value} pts</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#145C46" strokeWidth={3} dot={{ r: 4, fill: '#145C46' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[11px] text-charcoal-muted border-t border-neutral-100 pt-2">
            Updated weekly following platform reconciliation and bill settlements.
          </div>
        </div>

        {/* Radar Map of 5 Pillars */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-charcoal mb-1">Pillar Balance Radar</h3>
            <div className="text-xs text-charcoal-muted mb-2">
              Multi-dimensional profile across 5 normalized components.
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={55} data={radarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#5A6E65' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="score" stroke="#145C46" fill="#B9F3D0" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[11px] text-charcoal-muted border-t border-neutral-100 pt-2 text-center">
            Zero hidden weights. Fully explainable to applicants and lenders.
          </div>
        </div>
      </div>

      {/* Component Level Breakdown & Weights Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-charcoal">
              Detailed Component Weights & Contribution Math
            </h3>
            <div className="text-xs text-charcoal-muted">
              Each factor normalized to 0–100, weighted, and aggregated across a 600-point spread (300 base).
            </div>
          </div>

          <button
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            className="flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-dark cursor-pointer self-start sm:self-auto"
          >
            <span>{showFormulaDetails ? 'Hide Formula Equation' : 'Why this score? (View Formula)'}</span>
            {showFormulaDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Expandable Mathematical Proof Box */}
        {showFormulaDetails && (
          <div className="p-4 bg-forest-surface border-b border-forest/15 text-xs text-charcoal leading-relaxed font-mono space-y-2">
            <div className="font-bold text-forest font-sans">
              Mathematical Transparency Formula:
            </div>
            <div className="p-2.5 bg-white rounded-md border border-forest/20 overflow-x-auto text-charcoal">
              {steadyScoreResult.formulaExplanation}
            </div>
            <div className="font-sans text-charcoal-muted text-[11px]">
              Where each factor is evaluated on a normalized scale [0, 100] based on verified gig platform settlement receipts and automated auto-save adherence.
            </div>
          </div>
        )}

        <div className="divide-y divide-neutral-100">
          {steadyScoreResult.components.map((comp) => (
            <div key={comp.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50/70 transition-colors">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-charcoal">{comp.name}</span>
                  <span className="text-xs font-semibold text-forest font-mono">
                    Weight: {Math.round(comp.weight * 100)}%
                  </span>
                  <span aria-hidden="true" className="text-charcoal-muted">·</span>
                  <span className={`text-[11px] font-semibold ${
                    comp.status === 'Strong' ? 'text-forest' : comp.status === 'Moderate' ? 'text-amber-700' : 'text-red-700'
                  }`}>
                    {comp.status}
                  </span>
                </div>
                <div className="text-xs text-charcoal-muted">{comp.insight}</div>
                <div className="text-[11px] text-forest font-medium flex items-center gap-1">
                  <span>How to improve:</span>
                  <span className="text-charcoal">{comp.actionableTip}</span>
                </div>
              </div>

              {/* Progress and numerical contribution */}
              <div className="flex items-center gap-6 shrink-0 font-mono">
                <div className="w-32 hidden sm:block">
                  <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-forest h-full rounded-full" style={{ width: `${comp.rawScore}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-charcoal tabular-nums">
                    {comp.rawScore} <span className="text-xs font-normal text-charcoal-muted">/100</span>
                  </div>
                  <div className="text-[11px] text-forest font-medium">
                    +{comp.weightedPoints} pts to score
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive "What if I save more?" Simulator */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-forest" />
          <h3 className="text-sm font-bold text-charcoal">
            "What If I Save More?" Interactive Score Simulator
          </h3>
        </div>
        <p className="text-xs text-charcoal-muted mb-4 max-w-2xl leading-relaxed">
          Simulate how increasing your auto-save allocation into your safety buffer directly strengthens your Savings Discipline component and potential score.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="extra-savings-boost-slider" className="font-semibold text-charcoal">Simulate Extra Surplus Savings Boost</label>
              <span className="font-mono tabular-nums font-bold text-forest">+{extraSavingsBoost}% extra buffer rate</span>
            </div>
            <input
              id="extra-savings-boost-slider"
              type="range"
              min={0}
              max={25}
              step={5}
              value={extraSavingsBoost}
              onChange={(e) => setExtraSavingsBoost(Number(e.target.value))}
              className="w-full accent-forest cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-charcoal-muted mt-1 font-mono">
              <span>0% (Current)</span>
              <span>+10%</span>
              <span>+25% (Aggressive)</span>
            </div>
          </div>

          <div className="p-4 bg-forest-surface rounded-xl border border-forest/20 flex items-center justify-around text-center">
            <div>
              <div className="text-xs text-charcoal-muted">Current Score</div>
              <div className="text-2xl font-bold font-mono text-charcoal">{steadyScoreResult.score - Math.round(extraSavingsBoost * 0.8 * 0.2 * 6)}</div>
            </div>
            <div className="text-forest font-bold text-lg">→</div>
            <div>
              <div className="text-xs text-charcoal-muted">Projected Simulated Score</div>
              <div className="text-2xl font-bold font-mono text-forest">{steadyScoreResult.score}</div>
              <div className="text-[10px] text-forest font-semibold mt-0.5">
                {extraSavingsBoost > 0 ? `+${Math.round(extraSavingsBoost * 0.8 * 0.2 * 6)} pts potential gain` : 'Move slider to test'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
