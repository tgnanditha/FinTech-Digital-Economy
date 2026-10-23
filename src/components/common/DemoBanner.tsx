import React from 'react';
import { useSteady } from '../../context/SteadyContext';
import { ArrowLeftRight, RotateCcw, ShieldCheck } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { role, switchRole, resetDemoData, activeWorker } = useSteady();

  return (
    <div className="bg-forest-surface border-b border-forest/15 px-4 py-1.5 text-xs text-charcoal">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-forest flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-forest" />
            Demo Mode — Simulated Data
          </span>
          <span className="text-charcoal-muted hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-charcoal-muted hidden sm:inline">
            Active persona: <strong className="text-charcoal font-medium">{role === 'worker' ? `${activeWorker.name} (${activeWorker.category})` : 'Microfinance Underwriting Officer'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => switchRole(role === 'worker' ? 'lender' : 'worker')}
            className="flex items-center gap-1.5 text-forest hover:text-forest-dark font-medium underline-offset-2 hover:underline transition-colors whitespace-nowrap cursor-pointer"
          >
            <ArrowLeftRight className="w-3 h-3" />
            Switch to {role === 'worker' ? 'Lender Portal' : 'Worker App'}
          </button>
          <span className="text-charcoal-muted" aria-hidden="true">·</span>
          <button
            onClick={resetDemoData}
            className="flex items-center gap-1 text-charcoal-muted hover:text-charcoal transition-colors whitespace-nowrap cursor-pointer"
            title="Reset simulation parameters and permissions to default state"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Demo
          </button>
        </div>
      </div>
    </div>
  );
};
