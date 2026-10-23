import React, { useState } from 'react';
import { useSteady } from '../../context/SteadyContext';
import { FAIRNESS_BENCHMARKS } from '../../data/mockData';
import {
  Scale,
  Umbrella,
  Zap,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Info
} from 'lucide-react';

export const FairnessMonitor: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(FAIRNESS_BENCHMARKS[0].id);

  const activeCase = FAIRNESS_BENCHMARKS.find(c => c.id === selectedCaseId) || FAIRNESS_BENCHMARKS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-forest uppercase tracking-wider">
              Algorithmic Governance & Ethics
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-charcoal mt-0.5">
              The Steady Fairness & Contextual Monitor
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 max-w-3xl leading-relaxed">
              Gig work is vulnerable to municipal weather shocks, localized waterlogging, platform cloud outages, and festival swings. Steady ensures that external shocks are never misclassified as irresponsible financial habits or credit default risk.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-forest-surface border border-forest/20 rounded-lg text-xs font-semibold text-forest shrink-0">
            <Scale className="w-4 h-4" />
            <span>Context-Aware Underwriting</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2 text-[11px] text-charcoal-muted">
          <HelpCircle className="w-3.5 h-3.5 text-forest shrink-0" />
          <span>
            <strong>Fairness Standard:</strong> Steady does not claim absolute bias immunity. Instead, we enforce transparent heuristic boundaries that distinguish income volatility from willful default, and flag sparse histories with explicit uncertainty markers.
          </span>
        </div>
      </div>

      {/* Case Studies Selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {FAIRNESS_BENCHMARKS.map((item) => {
          const isSelected = item.id === selectedCaseId;
          const Icon = item.category === 'weather' ? Umbrella :
            item.category === 'outage' ? Zap :
            item.category === 'surge' ? Sparkles : AlertTriangle;

          return (
            <button
              key={item.id}
              onClick={() => setSelectedCaseId(item.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-forest text-white border-forest shadow-xs'
                  : 'bg-white text-charcoal border-neutral-200 hover:border-forest/40 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-mint' : 'text-forest'}`} />
                  <span className={`text-[10px] font-mono uppercase ${isSelected ? 'text-mint' : 'text-charcoal-muted'}`}>
                    {item.category}
                  </span>
                </div>
                <h3 className="text-xs font-bold leading-snug">{item.title}</h3>
              </div>

              <div className={`text-[10px] mt-3 pt-2 border-t ${
                isSelected ? 'border-forest-light text-mint/80' : 'border-neutral-100 text-charcoal-muted'
              }`}>
                Applies to: {item.workerName}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Analysis of Active Contextual Case */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
          <div>
            <div className="text-xs font-semibold text-forest uppercase tracking-wider">
              Selected Benchmark Simulation
            </div>
            <h2 className="text-lg font-bold text-charcoal mt-0.5">
              {activeCase.title}
            </h2>
            <div className="text-xs text-charcoal-muted mt-0.5">
              Simulated telemetry impact observed on {activeCase.workerName}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-charcoal">Confidence Protocol:</span>
            <span className="bg-forest-surface text-forest font-semibold px-2.5 py-1 rounded border border-forest/20 text-xs">
              {activeCase.confidenceImpact}
            </span>
          </div>
        </div>

        {/* 4 Comparative Dimension Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1.5">
            <div className="text-xs font-bold text-charcoal uppercase tracking-wider">
              1. Observed Real-World Context
            </div>
            <div className="text-xs text-charcoal-muted leading-relaxed">
              {activeCase.contextDescription}
            </div>
          </div>

          <div className="p-4 bg-amber-50/70 rounded-lg border border-amber-200 space-y-1.5">
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              2. Raw Platform Income Distortion
            </div>
            <div className="text-xs text-amber-900/90 leading-relaxed">
              {activeCase.impactOnRawIncome}
            </div>
          </div>

          <div className="p-4 bg-forest-surface rounded-lg border border-forest/20 space-y-1.5">
            <div className="text-xs font-bold text-forest uppercase tracking-wider">
              3. Steady Contextual Adjustment Logic
            </div>
            <div className="text-xs text-charcoal leading-relaxed">
              {activeCase.steadyContextualAdjustment}
            </div>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-lg border border-emerald-200 space-y-1.5">
            <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              4. Ethical Underwriting Safeguard
            </div>
            <div className="text-xs text-emerald-900/90 leading-relaxed">
              {activeCase.fairnessSafeguard}
            </div>
          </div>
        </div>

        {/* Technical Architecture Safeguard Principles */}
        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2 text-xs">
          <div className="font-bold text-charcoal flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-forest" />
            Core Fairness Invariants Enforced in Code
          </div>
          <ul className="list-disc pl-5 space-y-1 text-charcoal-muted leading-relaxed">
            <li><strong>No Demographic Attributes:</strong> Religion, caste, gender, home address pin codes, and device brand models are strictly excluded from feature pipelines.</li>
            <li><strong>Weather Normalization:</strong> Rainy and storm days certified by government meteorology APIs are decoupled from rolling consistency penalties.</li>
            <li><strong>Platform Outage Exemption:</strong> Inactive shift hours during server downtime are tagged as platform unavailability rather than worker absenteeism.</li>
            <li><strong>Explicit Uncertainty Flagging:</strong> Profiles under 90 days active are labeled "Uncertain (Limited History)" to prevent arbitrary auto-rejections.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
