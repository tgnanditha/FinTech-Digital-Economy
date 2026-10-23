import React, { useState } from 'react';
import { useSteady } from '../../context/SteadyContext';
import {
  formatINR,
  calculateSteadyScore,
  calculateRollingBaseline,
  calculateStandardDeviation
} from '../../utils/finance';
import { generateWorkerEarnings } from '../../data/mockData';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RotateCcw,
  Send,
  HelpCircle,
  FileCheck,
  TrendingUp,
  Percent,
  Star
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

export const ApplicantDetail: React.FC = () => {
  const {
    selectedApplicant,
    setCurrentView,
    permissions,
    requestConsentFromApplicant,
    recordLenderDecision,
    lenderDecisions
  } = useSteady();

  // Check consent rules for this applicant
  const hasScoreConsent = permissions.find(p => p.code === 'SHARE_SCORE_LENDERS')?.isGranted ?? false;
  const hasIncomeConsent = permissions.find(p => p.code === 'SHARE_INCOME_HISTORY')?.isGranted ?? false;

  const isApplicantConsented = selectedApplicant.id === 'worker-rahul'
    ? (hasScoreConsent && hasIncomeConsent)
    : selectedApplicant.id !== 'worker-vikram';

  // Earnings & score calculation
  const earnings = generateWorkerEarnings(selectedApplicant.id);
  const scoreResult = calculateSteadyScore(selectedApplicant, earnings);
  const baselines = calculateRollingBaseline(earnings.map(e => e.netEarnings), 7);
  const volatility = calculateStandardDeviation(earnings.map(e => e.netEarnings));

  // Current decision state
  const existingDecision = lenderDecisions[selectedApplicant.id];
  const [decisionStatus, setDecisionStatus] = useState<string>(existingDecision?.status || 'Pre-Approved');
  const [approvedAmount, setApprovedAmount] = useState<number>(existingDecision?.approvedAmount || 25000);
  const [decisionNotes, setDecisionNotes] = useState<string>(
    existingDecision?.notes || 'Solid gig platform baseline verified. 18-month tenure with regular auto-save buffers.'
  );

  const handleSaveDecision = () => {
    recordLenderDecision(selectedApplicant.id, {
      status: decisionStatus as any,
      notes: decisionNotes,
      approvedAmount,
      decisionDate: new Date().toISOString().split('T')[0],
      officerName: 'Rajesh K. (Kite MFI)'
    });
  };

  const chartData = earnings.map((d, i) => ({
    date: d.date.slice(5),
    net: d.netEarnings,
    baseline: baselines[i],
    event: d.eventLabel
  }));

  return (
    <div className="space-y-6">
      {/* Back button and profile title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => setCurrentView('lender-applicants')}
          className="flex items-center gap-2 text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Applicants Pipeline
        </button>

        <div className="flex items-center gap-2">
          {isApplicantConsented ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-mint-light text-forest text-xs font-semibold rounded-lg border border-forest/20">
              <ShieldCheck className="w-4 h-4" /> Explicit Worker Consent Verified
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200">
              <ShieldAlert className="w-4 h-4" /> Consent Revoked or Lacking
            </span>
          )}
        </div>
      </div>

      {/* Applicant Header Card */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-charcoal-muted mb-1">
              <span>Applicant ID: <strong className="font-mono text-charcoal">APPL-{selectedApplicant.initials}-10{selectedApplicant.id.length}</strong></span>
              <span aria-hidden="true">·</span>
              <span>{selectedApplicant.platform}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedApplicant.city}</span>
            </div>
            <h1 className="text-2xl font-bold text-charcoal">
              {selectedApplicant.pseudonym}
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 max-w-2xl">
              {selectedApplicant.summary}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
            <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 text-center">
              <span className="font-sans text-charcoal-muted block text-[10px]">Verified Tenure</span>
              <span className="font-bold text-charcoal text-base">{selectedApplicant.tenureMonths} Mo</span>
            </div>
            <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 text-center">
              <span className="font-sans text-charcoal-muted block text-[10px]">Driver Rating</span>
              <span className="font-bold text-forest text-base flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {selectedApplicant.rating}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Consent Enforcement Guard: If consent is missing/revoked, protect financial records! */}
      {!isApplicantConsented ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-800">
            <Lock className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-base font-bold text-charcoal">
              Protected Financial Data Redacted
            </h2>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              This applicant has either not authorized third-party lender data sharing or has actively revoked consent in their privacy center. In compliance with Steady's privacy constitution, granular earnings, volatility baselines, and score breakdowns are hidden.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => requestConsentFromApplicant(selectedApplicant.id)}
              className="px-4 py-2 text-xs font-bold text-charcoal bg-mint hover:bg-mint-light rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch Consent Re-Authorization Request
            </button>
          </div>
        </div>
      ) : (
        /* If consent is granted, reveal full explainable financial evidence */
        <div className="space-y-6">
          {/* Top Score & Risk Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
              <div className="text-xs text-charcoal-muted">Explainable Steady Score</div>
              <div className="text-3xl font-bold font-mono text-forest mt-1">
                {scoreResult.score} <span className="text-xs font-normal text-charcoal-muted">/ 900</span>
              </div>
              <div className="text-xs font-semibold text-charcoal mt-1">
                Category: <span className="text-forest">{scoreResult.band}</span>
              </div>
              <div className="text-[11px] text-charcoal-muted mt-2 border-t border-neutral-100 pt-2">
                Confidence: <strong className="text-forest">{scoreResult.confidence}</strong>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
              <div className="text-xs text-charcoal-muted">Income Volatility & Baseline</div>
              <div className="text-3xl font-bold font-mono text-charcoal mt-1">
                ±{formatINR(volatility)}
              </div>
              <div className="text-xs text-charcoal-muted mt-1">
                30-Day Mean: <span className="font-mono font-bold text-charcoal">{formatINR(Math.round(earnings.reduce((s,d)=>s+d.netEarnings,0)/30))}</span>/day
              </div>
              <div className="text-[11px] text-charcoal-muted mt-2 border-t border-neutral-100 pt-2">
                External weather shocks contextualized in baseline.
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
              <div className="text-xs text-charcoal-muted">Simulated Repayment Affordability</div>
              <div className="text-3xl font-bold font-mono text-forest mt-1">
                ₹850 <span className="text-xs font-normal text-charcoal-muted">/week</span>
              </div>
              <div className="text-xs text-charcoal-muted mt-1">
                Affordable bandwidth: ₹450 to ₹1,800/wk
              </div>
              <div className="text-[11px] text-charcoal-muted mt-2 border-t border-neutral-100 pt-2">
                Supports income-linked flexible deductions.
              </div>
            </div>
          </div>

          {/* 30-Day Verifiable Income Graph */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
            <h3 className="text-sm font-bold text-charcoal mb-1">
              30-Day Verifiable Daily Net Income & Rolling Baseline
            </h3>
            <div className="text-xs text-charcoal-muted mb-4">
              Inspect shift consistency and weather shocks verified through platform settlement receipts.
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5A6E65' }} stroke="#CBD5CD" />
                  <YAxis tick={{ fontSize: 11, fill: '#5A6E65' }} stroke="#CBD5CD" tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded border border-neutral-200 shadow text-xs">
                            <div className="font-semibold text-charcoal">{d.date}</div>
                            <div className="text-forest font-bold">Net: {formatINR(d.net)}</div>
                            <div className="text-charcoal-muted">7D Baseline: {formatINR(d.baseline)}</div>
                            {d.event && <div className="text-amber-800 text-[10px] italic">{d.event}</div>}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="net" fill="#B9F3D0" maxBarSize={24} />
                  <Line type="monotone" dataKey="baseline" stroke="#145C46" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5 Scoring Components Detailed Inspection */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-charcoal">
              Underwriter Feature Contributions (No Black Box)
            </h3>

            <div className="space-y-3">
              {scoreResult.components.map((comp) => (
                <div key={comp.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-charcoal flex items-center gap-2">
                      <span>{comp.name}</span>
                      <span className="font-mono text-forest">({Math.round(comp.weight * 100)}% weight)</span>
                    </div>
                    <div className="text-charcoal-muted mt-0.5">{comp.insight}</div>
                  </div>
                  <div className="font-mono text-right shrink-0">
                    <span className="text-base font-bold text-charcoal">{comp.rawScore} / 100</span>
                    <div className="text-forest text-[11px]">+{comp.weightedPoints} pts to total</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Record Underwriting Decision Section */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-charcoal">
              Record Loan Underwriting Decision (Simulated)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Decision Status</label>
                <select
                  value={decisionStatus}
                  onChange={(e) => setDecisionStatus(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 font-medium cursor-pointer"
                >
                  <option value="Pre-Approved">Pre-Approved</option>
                  <option value="Conditional Offer">Conditional Offer (Income-Linked)</option>
                  <option value="Requires Verification">Requires Additional Shift History</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Recommended Credit Limit</label>
                <input
                  type="number"
                  step={5000}
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(Number(e.target.value))}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-charcoal mb-1">Underwriter Audit Notes</label>
                <textarea
                  rows={3}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-forest"
                  placeholder="Record justification, safety buffer factors, or repayment boundary recommendations..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <span className="text-[11px] text-charcoal-muted">
                Decision recorded under Officer ID: Rajesh K.
              </span>
              <button
                type="button"
                onClick={handleSaveDecision}
                className="px-4 py-2 text-xs font-bold text-white bg-forest hover:bg-forest-dark rounded-lg transition-colors cursor-pointer"
              >
                Save Underwriting Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
