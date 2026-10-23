import React from 'react';
import { useSteady } from '../../context/SteadyContext';
import { SteadyLogo } from '../common/SteadyLogo';
import {
  Users,
  Building2,
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { switchRole, activeWorker, workers, setActiveWorkerId } = useSteady();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-neutral-200 shadow-md p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <SteadyLogo size="lg" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal">
            Welcome to the Steady Demo
          </h1>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
            Choose your simulated persona to experience the platform from either the worker or institutional lender perspective.
          </p>
        </div>

        {/* Demo banner badge */}
        <div className="p-3 bg-forest-surface border border-forest/20 rounded-xl flex items-center gap-2.5 text-xs text-forest font-medium">
          <ShieldCheck className="w-4 h-4 shrink-0 text-forest" />
          <span>Demo Mode — Simulated Data. No real phone numbers, OTPs, or bank credentials required.</span>
        </div>

        {/* 2 Role Choice Cards */}
        <div className="space-y-3">
          {/* Worker Option */}
          <div
            onClick={() => switchRole('worker')}
            className="p-5 rounded-xl border border-neutral-200 hover:border-forest hover:bg-forest-surface/50 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-forest text-mint flex items-center justify-center font-bold text-base shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-charcoal group-hover:text-forest transition-colors">
                    Continue as Gig Worker
                  </h3>
                  <div className="text-xs text-charcoal-muted mt-0.5 leading-relaxed">
                    Experience irregular income tracking, auto-save buffer smoothing, explainable Steady Score, and flexible loans.
                  </div>
                  <div className="mt-2 text-xs text-forest font-semibold">
                    Current Demo Profile: {activeWorker.name} ({activeWorker.category})
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-charcoal-muted group-hover:text-forest group-hover:translate-x-1 transition-all shrink-0 mt-1" />
            </div>
          </div>

          {/* Lender Option */}
          <div
            onClick={() => switchRole('lender')}
            className="p-5 rounded-xl border border-neutral-200 hover:border-forest hover:bg-forest-surface/50 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-charcoal text-mint flex items-center justify-center font-bold text-base shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-charcoal group-hover:text-forest transition-colors">
                    Continue as Institutional Lender
                  </h3>
                  <div className="text-xs text-charcoal-muted mt-0.5 leading-relaxed">
                    Underwrite applicants with consent-based 30-day volatility telemetry, score explainability, and risk distribution analysis.
                  </div>
                  <div className="mt-2 text-xs text-charcoal font-semibold">
                    Persona: Kite Microfinance Loan Underwriter
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-charcoal-muted group-hover:text-forest group-hover:translate-x-1 transition-all shrink-0 mt-1" />
            </div>
          </div>
        </div>

        {/* Quick Worker Persona Switcher before login */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-charcoal-muted">
          <span>Worker Persona:</span>
          <select
            value={activeWorker.id}
            onChange={(e) => setActiveWorkerId(e.target.value)}
            className="bg-neutral-50 border border-neutral-200 rounded px-2 py-1 font-semibold text-charcoal cursor-pointer"
          >
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({w.category.split(' ')[0]})</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
