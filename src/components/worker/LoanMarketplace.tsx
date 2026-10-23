import React, { useState } from 'react';
import { useSteady } from '../../context/SteadyContext';
import { LoanOffer } from '../../types/steady';
import {
  formatINR,
  calculateConventionalLoan,
  simulateFlexibleRepayment
} from '../../utils/finance';
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Percent,
  Calendar,
  Sparkles,
  Sliders
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

export const LoanMarketplace: React.FC = () => {
  const {
    loanOffers,
    activeWorker,
    steadyScoreResult,
    submitLoanApplication,
    activeEarnings,
    submittedLoans
  } = useSteady();

  // Selected Offer for detailed calculator or application
  const [selectedOffer, setSelectedOffer] = useState<LoanOffer>(loanOffers[0]);

  // Calculator inputs
  const [principal, setPrincipal] = useState<number>(selectedOffer.illustrativeAmount);
  const [rate, setRate] = useState<number>(selectedOffer.annualInterestRate);
  const [tenureMonths, setTenureMonths] = useState<number>(selectedOffer.tenureMonths);

  // Flexible Repayment Simulator inputs
  const [incomeRepayPercent, setIncomeRepayPercent] = useState<number>(14);
  const [minFloor, setMinFloor] = useState<number>(selectedOffer.minWeeklyFloor);
  const [maxCap, setMaxCap] = useState<number>(selectedOffer.maxWeeklyCap);

  // Confirmation modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [repaymentStyleChoice, setRepaymentStyleChoice] = useState<'income-linked' | 'standard'>('income-linked');

  // Conventional amortized calculation
  const conventionalResult = calculateConventionalLoan(principal, rate, tenureMonths);

  // Derive weekly net incomes from 30-day earnings (aggregate by week)
  const simulatedWeeklyIncomes = [
    activeEarnings.slice(0, 7).reduce((s, d) => s + d.netEarnings, 0),
    activeEarnings.slice(7, 14).reduce((s, d) => s + d.netEarnings, 0),
    activeEarnings.slice(14, 21).reduce((s, d) => s + d.netEarnings, 0),
    activeEarnings.slice(21, 28).reduce((s, d) => s + d.netEarnings, 0)
  ];

  // Flexible repayment calculation across tenure
  const tenureWeeks = tenureMonths * 4;
  const flexibleSimResult = simulateFlexibleRepayment(
    principal,
    rate,
    tenureWeeks,
    simulatedWeeklyIncomes,
    minFloor,
    maxCap,
    incomeRepayPercent
  );

  const handleSelectOffer = (offer: LoanOffer) => {
    setSelectedOffer(offer);
    setPrincipal(offer.illustrativeAmount);
    setRate(offer.annualInterestRate);
    setTenureMonths(offer.tenureMonths);
    setMinFloor(offer.minWeeklyFloor);
    setMaxCap(offer.maxWeeklyCap);
  };

  const handleConfirmSubmit = () => {
    submitLoanApplication(selectedOffer, principal, tenureMonths, repaymentStyleChoice);
    setConfirmModalOpen(false);
  };

  const chartData = flexibleSimResult.weeks.map(w => ({
    week: `Wk ${w.week}`,
    actualIncome: w.actualWeeklyIncome,
    adjustedEmi: w.adjustedEmi,
    scheduledEmi: w.scheduledBaseEmi,
    remainingDebt: w.remainingBalance,
    note: w.adjustmentNote
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-forest uppercase tracking-wider">
              Flexible Credit Marketplace
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-charcoal mt-0.5">
              Income-Linked Micro-Credit & Flexible EMI
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 max-w-3xl leading-relaxed">
              Traditional micro-loans default when a rider suffers a rainy or low-demand week with fixed EMI deductions. Steady's partner marketplace offers <strong>income-aware repayments</strong> that flex downward during lean shifts without hidden compound penalties.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-forest-surface border border-forest/20 rounded-lg text-xs font-semibold text-forest shrink-0">
            <Sparkles className="w-4 h-4" />
            <span>Eligible for all 3 partner tiers</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2 text-[11px] text-charcoal-muted">
          <HelpCircle className="w-3.5 h-3.5 text-forest shrink-0" />
          <span>
            <strong>Simulated Marketplace Notice:</strong> Offers and schedules are for prototype demonstration. Final contractual terms, interest, and credit disbursement are subject to formal underwriting assessment.
          </span>
        </div>
      </div>

      {/* 3 Illustrative Loan Offer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loanOffers.map((offer) => {
          const isSelected = selectedOffer.id === offer.id;
          const isEligible = steadyScoreResult.score >= offer.eligibilityScore;

          return (
            <div
              key={offer.id}
              onClick={() => handleSelectOffer(offer)}
              className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-forest-surface border-forest ring-1 ring-forest shadow-xs'
                  : 'bg-white border-neutral-200 hover:border-forest/40 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-charcoal">{offer.lenderType}</span>
                  <span className="text-[11px] font-mono font-medium text-forest">
                    Min Score: {offer.eligibilityScore}
                  </span>
                </div>

                <h3 className="text-base font-bold text-charcoal">{offer.lenderName}</h3>
                <div className="text-[11px] text-forest font-semibold mt-0.5">
                  {offer.featureBadge}
                </div>

                <div className="my-4 py-3 border-y border-neutral-100 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="font-sans text-charcoal-muted">Credit Facility:</span>
                    <strong className="text-charcoal font-bold">{formatINR(offer.illustrativeAmount)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-charcoal-muted">Annual Interest:</span>
                    <strong className="text-forest font-bold">{offer.annualInterestRate}% p.a.</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-charcoal-muted">Flexible Floor:</span>
                    <strong className="text-charcoal">{formatINR(offer.minWeeklyFloor)}/wk</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-charcoal-muted">Tenure:</span>
                    <span className="text-charcoal">{offer.tenureMonths} Months</span>
                  </div>
                </div>

                <div className="text-[11px] text-charcoal-muted leading-relaxed">
                  {offer.description}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] text-charcoal-muted">
                  Fee: {offer.processingFeePercent}% processing
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectOffer(offer);
                    setConfirmModalOpen(true);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-forest text-white'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-charcoal'
                  }`}
                >
                  Apply in Demo
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dual Calculator Section: Conventional Amortized vs Flexible Repayment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Standard Conventional Reducing-Balance Loan Calculator */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-charcoal">
              Standard Amortizing Loan Estimate (Reducing Balance)
            </h3>
            <span className="text-[11px] text-charcoal-muted font-mono">Traditional Fixed EMI</span>
          </div>
          <div className="text-xs text-charcoal-muted">
            Standard banking benchmark reducing balance formula: E = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1). Fixed installment regardless of gig earnings.
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="loan-principal-slider" className="font-semibold text-charcoal">Principal Amount</label>
                <span className="font-mono tabular-nums font-bold text-forest">{formatINR(principal)}</span>
              </div>
              <input
                id="loan-principal-slider"
                type="range"
                min={5000}
                max={60000}
                step={2500}
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full accent-forest cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="loan-interest-slider" className="font-semibold text-charcoal">Annual Interest Rate</label>
                <span className="font-mono tabular-nums font-bold text-forest">{rate}% p.a.</span>
              </div>
              <input
                id="loan-interest-slider"
                type="range"
                min={10}
                max={24}
                step={0.5}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full accent-forest cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="loan-tenure-slider" className="font-semibold text-charcoal">Tenure Duration</label>
                <span className="font-mono tabular-nums font-bold text-forest">{tenureMonths} Months ({tenureMonths * 4} Weeks)</span>
              </div>
              <input
                id="loan-tenure-slider"
                type="range"
                min={2}
                max={18}
                step={1}
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                className="w-full accent-forest cursor-pointer"
              />
            </div>
          </div>

          {/* Conventional Calculation Output Box */}
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span className="font-sans text-charcoal-muted">Fixed Monthly Installment:</span>
              <strong className="text-charcoal font-bold text-sm">{formatINR(conventionalResult.monthlyInstallment)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-charcoal-muted">Equivalent Weekly Installment:</span>
              <strong className="text-forest font-bold text-sm">{formatINR(conventionalResult.weeklyInstallment)}/week</strong>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-charcoal-muted">Total Interest Paid:</span>
              <span className="text-charcoal">{formatINR(conventionalResult.totalInterest)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-neutral-200 font-bold">
              <span className="font-sans text-charcoal">Total Fixed Repayment:</span>
              <span className="text-charcoal font-mono">{formatINR(conventionalResult.totalRepayment)}</span>
            </div>
          </div>
        </div>

        {/* Right: Income-Aware Flexible Repayment Simulator */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-charcoal">
              Steady Flexible-Repayment Simulator
            </h3>
            <span className="text-[11px] font-semibold text-forest font-mono">Income-Linked</span>
          </div>
          <div className="text-xs text-charcoal-muted">
            Repayments adjust according to actual weekly income. Lean weeks reduce to contract floor; surge weeks accelerate payoff. Unpaid amounts carry forward honestly without being dropped.
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="repay-pct-slider" className="font-semibold text-charcoal">Income Repay %</label>
                <span className="font-mono text-forest font-bold">{incomeRepayPercent}%</span>
              </div>
              <input
                id="repay-pct-slider"
                type="range"
                min={8}
                max={22}
                step={1}
                value={incomeRepayPercent}
                onChange={(e) => setIncomeRepayPercent(Number(e.target.value))}
                className="w-full accent-forest cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="floor-slider" className="font-semibold text-charcoal">Min Weekly Floor</label>
                <span className="font-mono text-forest font-bold">{formatINR(minFloor)}</span>
              </div>
              <input
                id="floor-slider"
                type="range"
                min={200}
                max={1000}
                step={50}
                value={minFloor}
                onChange={(e) => setMinFloor(Number(e.target.value))}
                className="w-full accent-forest cursor-pointer"
              />
            </div>
          </div>

          {/* Flexible Output Box */}
          <div className="p-4 bg-forest-surface rounded-lg border border-forest/20 text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span className="font-sans text-charcoal-muted">Relief Weeks Triggered:</span>
              <strong className="text-forest">{flexibleSimResult.reliefWeeksCount} lean weeks adjusted</strong>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-charcoal-muted">Accelerated Surge Weeks:</span>
              <strong className="text-forest">{flexibleSimResult.surgeWeeksCount} high-income weeks</strong>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-charcoal-muted">Cumulative Paid in Simulation:</span>
              <span className="font-bold text-charcoal">{formatINR(flexibleSimResult.totalPaid)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-forest/20 font-bold">
              <span className="font-sans text-charcoal">Payoff Status:</span>
              <span className={flexibleSimResult.isFullyPaid ? 'text-forest font-sans' : 'text-amber-800 font-sans'}>
                {flexibleSimResult.isFullyPaid ? 'Fully Paid on Schedule' : `Pending Balance: ${formatINR(flexibleSimResult.unpaidDeficit)}`}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setConfirmModalOpen(true)}
              className="w-full py-2.5 text-xs font-bold text-charcoal bg-mint hover:bg-mint-light rounded-lg transition-colors cursor-pointer"
            >
              Submit Simulated Loan Application for {formatINR(principal)}
            </button>
          </div>
        </div>
      </div>

      {/* Week-by-Week Flexible Repayment Schedule Chart */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-charcoal">
              Simulated Weekly Flexible Installment Flow
            </h3>
            <div className="text-xs text-charcoal-muted mt-0.5">
              Green line represents income-aware payment varying within the floor ({formatINR(minFloor)}) and cap ({formatINR(maxCap)}).
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-charcoal-muted">
              <span className="w-3.5 h-0.5 bg-forest" /> Flexible Weekly EMI
            </span>
            <span className="flex items-center gap-1.5 text-charcoal-muted">
              <span className="w-3.5 h-0.5 bg-neutral-400" /> Fixed Conventional EMI
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#5A6E65' }} stroke="#CBD5CD" />
              <YAxis tick={{ fontSize: 11, fill: '#5A6E65' }} stroke="#CBD5CD" tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow text-xs space-y-1">
                        <div className="font-semibold text-charcoal">{d.week}</div>
                        <div className="text-charcoal-muted">Weekly Income: <strong className="font-mono text-charcoal">{formatINR(d.actualIncome)}</strong></div>
                        <div className="text-forest font-bold">Flexible EMI: <span className="font-mono">{formatINR(d.adjustedEmi)}</span></div>
                        <div className="text-charcoal-muted">Remaining Balance: <span className="font-mono">{formatINR(d.remainingDebt)}</span></div>
                        <div className="text-[11px] text-charcoal-muted italic">{d.note}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line type="monotone" dataKey="adjustedEmi" stroke="#145C46" strokeWidth={2.5} dot={{ r: 3, fill: '#145C46' }} />
              <Line type="monotone" dataKey="scheduledEmi" stroke="#94A3B8" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Submitted Loan Applications History */}
      {submittedLoans.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="text-sm font-bold text-charcoal">
              Your Active Simulated Applications ({submittedLoans.length})
            </h3>
          </div>
          <div className="divide-y divide-neutral-100">
            {submittedLoans.map((app) => (
              <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-charcoal">{app.lenderName}</div>
                  <div className="text-charcoal-muted mt-0.5">
                    Amount: <strong className="font-mono text-charcoal">{formatINR(app.amount)}</strong> · Tenure: {app.tenureMonths} Months · Applied {app.date}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-forest bg-forest-surface px-2.5 py-1 rounded border border-forest/20 text-[11px]">
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-neutral-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-mint flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5 text-forest" />
              </div>
              <div>
                <h4 className="text-base font-bold text-charcoal">
                  Confirm Simulated Loan Application
                </h4>
                <div className="text-xs text-charcoal-muted mt-0.5">
                  Submission to {selectedOffer.lenderName}
                </div>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="font-sans text-charcoal-muted">Requested Amount:</span>
                <strong className="text-charcoal">{formatINR(principal)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-charcoal-muted">Estimated Interest:</span>
                <strong className="text-charcoal">{rate}% p.a.</strong>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-charcoal-muted">Tenure:</span>
                <strong className="text-charcoal">{tenureMonths} Months</strong>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-charcoal-muted">Repayment Style:</span>
                <strong className="text-forest capitalize">{repaymentStyleChoice}</strong>
              </div>
            </div>

            <div className="text-[11px] text-charcoal-muted leading-relaxed">
              <strong>Consent Verification:</strong> By submitting, you grant permission for the lender to inspect your 30-day earnings volatility and explainable Steady Score under strict consent controls.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-charcoal-muted hover:text-charcoal cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-4 py-2 text-xs font-bold text-charcoal bg-mint hover:bg-mint-light rounded-lg transition-colors cursor-pointer"
              >
                Confirm & Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
