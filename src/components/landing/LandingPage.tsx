import React from 'react';
import { useSteady } from '../../context/SteadyContext';
import { formatINR } from '../../utils/finance';
import {
  TrendingUp,
  PiggyBank,
  Sparkles,
  ShieldCheck,
  Scale,
  Coins,
  ArrowRight,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Lock,
  ChevronRight
} from 'lucide-react';
import { SteadyLogo } from '../common/SteadyLogo';

export const LandingPage: React.FC = () => {
  const { setCurrentView, switchRole, activeWorker, steadyScoreResult, simulationResult } = useSteady();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Headline & Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-forest bg-forest-surface px-3 py-1.5 rounded-full border border-forest/20">
                <ShieldCheck className="w-4 h-4 text-forest" />
                <span>FinTech & Digital Economy Hackathon Prototype</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-charcoal leading-[1.15]" style={{ textWrap: 'balance' }}>
                Your income changes.{' '}
                <span className="text-forest">Your stability doesn't have to.</span>
              </h1>

              <p className="text-base sm:text-lg text-charcoal-muted leading-relaxed max-w-2xl">
                Turn unpredictable gig earnings into a steadier financial future—with smarter savings, transparent credit scoring, and repayments that adapt to your income.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    switchRole('worker');
                    setCurrentView('worker-dashboard');
                  }}
                  className="px-6 py-3 text-sm font-bold text-charcoal bg-mint hover:bg-mint-light rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  Explore Worker Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    switchRole('lender');
                    setCurrentView('lender-dashboard');
                  }}
                  className="px-5 py-3 text-sm font-semibold text-forest bg-forest-surface hover:bg-forest/10 border border-forest/20 rounded-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  Explore Lender Dashboard
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-charcoal-muted">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-forest" /> 100% Consent Governed
                </span>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-forest" /> Zero Negative Balance Guarantee
                </span>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-forest" /> Explainable 300–900 Score
                </span>
              </div>
            </div>

            {/* Right: Dashboard Interactive Live Mini-Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-forest text-mint flex items-center justify-center font-bold text-xs font-mono">
                      {activeWorker.initials}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-charcoal">{activeWorker.name}</div>
                      <div className="text-[10px] text-charcoal-muted">{activeWorker.platform} · {activeWorker.city.split(' ')[0]}</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-forest-surface text-forest px-2 py-0.5 rounded font-mono font-medium">
                    Live Demo
                  </span>
                </div>

                {/* 3 mini cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-forest-surface p-3 rounded-lg border border-forest/15">
                    <div className="text-[10px] text-charcoal-muted">Buffer Balance</div>
                    <div className="text-xl font-bold font-mono text-forest mt-0.5">
                      {formatINR(simulationResult.finalBufferBalance)}
                    </div>
                    <div className="text-[10px] text-forest font-medium mt-0.5">Protected Emergency Floor</div>
                  </div>

                  <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                    <div className="text-[10px] text-charcoal-muted">Steady Score</div>
                    <div className="text-xl font-bold font-mono text-charcoal mt-0.5">
                      {steadyScoreResult.score} <span className="text-xs text-charcoal-muted font-normal">/ 900</span>
                    </div>
                    <div className="text-[10px] text-forest font-medium mt-0.5">{steadyScoreResult.band} Band</div>
                  </div>
                </div>

                {/* Mini Income Smoothing Bar */}
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-charcoal">Daily Income Target</span>
                    <span className="font-mono text-forest font-bold">₹950 / day</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-forest h-full rounded-full" style={{ width: '84%' }} />
                  </div>
                  <div className="text-[10px] text-charcoal-muted flex justify-between">
                    <span>Low shifts topped up by buffer</span>
                    <span>High days auto-save 25%</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    switchRole('worker');
                    setCurrentView('worker-dashboard');
                  }}
                  className="w-full py-2.5 text-xs font-bold text-center text-forest bg-forest-surface hover:bg-forest/10 border border-forest/20 rounded-lg transition-colors cursor-pointer"
                >
                  Open Full Interactive Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section: 3 Real Challenges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-semibold text-forest uppercase tracking-wider">
            The Financial Exclusion Reality
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mt-1">
            Three Structural Challenges Facing Indian Gig Workers
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-2">
            Over 15 million Indian platform delivery riders and drivers experience extreme cash-flow variance that traditional banking infrastructure fails to accommodate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-charcoal">
              1. Irregular Income Makes Budgeting Difficult
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Monsoons, vehicle breakdowns, and seasonal demand swings cause income to fluctuate between ₹400 and ₹2,400 daily. Without smoothing, workers deplete emergency reserves for daily essentials.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-charcoal">
              2. Credit Exclusion Without Salary Records
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Traditional credit bureaus rely on Form 16, salary slips, and long-standing CIBIL files. High-performing gig workers with strong earnings discipline remain invisible to mainstream lenders.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-forest-surface border border-forest/20 flex items-center justify-center text-forest">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-charcoal">
              3. Rigid EMIs Penalize Lean Work Cycles
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Conventional bank loans demand fixed monthly installments. When a delivery partner encounters a 4-day monsoon slowdown, rigid auto-debits trigger bounce charges and debt spirals.
            </p>
          </div>
        </div>
      </section>

      {/* How Steady Works: 4 Steps */}
      <section className="bg-forest-surface py-12 border-y border-forest/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-semibold text-forest uppercase tracking-wider">
              The End-to-End Loop
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mt-1">
              How Steady Powers Financial Stability
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-2">
              <div className="text-xs font-mono font-bold text-forest">01. Connect & Baseline</div>
              <h3 className="text-sm font-bold text-charcoal">Connect Earnings</h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Steady analyzes daily platform settlement receipts, separating operational vehicle expenses from true net earnings to calculate a 7-day rolling baseline.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-2">
              <div className="text-xs font-mono font-bold text-forest">02. Auto-Save Buffer</div>
              <h3 className="text-sm font-bold text-charcoal">Smooth Daily Income</h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                During festive surges and high-order weekends, a fraction of surplus is automatically channeled into your buffer to replenish low-earning days.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-2">
              <div className="text-xs font-mono font-bold text-forest">03. Transparent Scoring</div>
              <h3 className="text-sm font-bold text-charcoal">Build Steady Score</h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Every factor is explainable—cash-flow consistency, platform tenure, savings discipline, and bill payment history are mapped onto a 300–900 scale.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-2">
              <div className="text-xs font-mono font-bold text-forest">04. Flexible Credit</div>
              <h3 className="text-sm font-bold text-charcoal">Income-Aware Credit</h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Access flexible-EMI loans from partner MFIs and NBFCs where weekly repayments automatically scale down during low shifts without default penalties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Fairness Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-forest bg-forest-surface px-3 py-1 rounded-full border border-forest/20">
                <Scale className="w-3.5 h-3.5" /> Data Minimization & Ethics
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">
                Built on Trust, Consent, and Explainability
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                We reject opaque AI black-boxes that penalize gig workers arbitrarily. Steady operates on strict data minimization principles inspired by India's Account Aggregator framework:
              </p>
              <ul className="space-y-2.5 text-xs text-charcoal">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <span><strong>Granular Revocable Consent:</strong> You choose exactly what lenders can see and can revoke access anytime with one click.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <span><strong>Contextual Weather Safeguards:</strong> Monsoons and app outages are tagged as municipal events, not evidence of poor character.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <span><strong>Zero Sensitive Data Extraction:</strong> No collection of Aadhaar numbers, PAN cards, UPI PINs, or device telemetry.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-forest-surface rounded-xl border border-forest/20 space-y-4">
              <div className="text-sm font-bold text-forest">
                The Steady Scoring Formula Invariant
              </div>
              <div className="p-3 bg-white rounded-lg border border-neutral-200 font-mono text-xs text-charcoal leading-relaxed">
                Score = 300 + 600 × (0.30×Consistency + 0.20×Savings + 0.20×Bills + 0.15×Tenure + 0.15×ExpenseControl)
              </div>
              <div className="text-xs text-charcoal-muted leading-relaxed">
                Every applicant receives actionable tips directly mapped to mathematical weights. There are no hidden multipliers or demographic proxy penalties.
              </div>
              <button
                onClick={() => setCurrentView('worker-score')}
                className="text-xs font-bold text-forest hover:text-forest-dark flex items-center gap-1 cursor-pointer"
              >
                Inspect Scoring Mathematics <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 pt-8 text-xs text-charcoal-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <SteadyLogo size="sm" />
            <div className="flex flex-wrap items-center gap-6">
              <button onClick={() => setCurrentView('landing')} className="hover:text-forest transition-colors cursor-pointer">About Steady</button>
              <button onClick={() => setCurrentView('worker-savings')} className="hover:text-forest transition-colors cursor-pointer">How It Works</button>
              <button onClick={() => setCurrentView('worker-consent')} className="hover:text-forest transition-colors cursor-pointer">Privacy & Consent</button>
              <button onClick={() => setCurrentView('worker-fairness')} className="hover:text-forest transition-colors cursor-pointer">Fairness Monitor</button>
              <button onClick={() => setCurrentView('settings')} className="hover:text-forest transition-colors cursor-pointer">Demo Preferences</button>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <div>
              © 2026 Steady FinTech Prototype. Built for digital economy gig workers and inclusive microfinance.
            </div>
            <div className="text-charcoal-muted italic">
              Illustrative hackathon prototype with synthetic simulation data. Not a registered bank or NBFC.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
