import React, { useState, useMemo } from 'react';
import { useSteady } from '../../context/SteadyContext';
import { formatINR, calculateSteadyScore, calculateStandardDeviation } from '../../utils/finance';
import { generateWorkerEarnings } from '../../data/mockData';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const LenderDashboard: React.FC = () => {
  const {
    workers,
    permissions,
    setCurrentView,
    setSelectedApplicantId,
    lenderDecisions
  } = useSteady();

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [consentFilter, setConsentFilter] = useState<string>('all');

  // Check global consent status for score and income sharing
  const hasScoreConsent = permissions.find(p => p.code === 'SHARE_SCORE_LENDERS')?.isGranted ?? false;
  const hasIncomeConsent = permissions.find(p => p.code === 'SHARE_INCOME_HISTORY')?.isGranted ?? false;

  // Enrich applicant data
  const applicantRows = useMemo(() => {
    return workers.map((worker) => {
      const earnings = generateWorkerEarnings(worker.id);
      const scoreResult = calculateSteadyScore(worker, earnings);
      const netList = earnings.map(d => d.netEarnings);
      const volatility = calculateStandardDeviation(netList);
      const decision = lenderDecisions[worker.id];

      // Consent is simulated per applicant; worker-rahul uses the live toggle state from ConsentCenter
      const isApplicantConsented = worker.id === 'worker-rahul'
        ? hasScoreConsent
        : worker.id !== 'worker-vikram'; // Vikram starts without full consent

      return {
        id: `APPL-${worker.initials}-10${worker.id.length}`,
        workerId: worker.id,
        worker,
        score: scoreResult.score,
        band: scoreResult.band,
        tenure: `${worker.tenureMonths} Mo`,
        volatility: `±${formatINR(volatility)}`,
        category: worker.category,
        isConsented: isApplicantConsented,
        reviewStatus: decision ? decision.status : 'Pending Review'
      };
    });
  }, [workers, hasScoreConsent, lenderDecisions]);

  // Filtered rows
  const filteredApplicants = applicantRows.filter((app) => {
    const matchesSearch =
      app.worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || app.category === categoryFilter;
    const matchesConsent =
      consentFilter === 'all' ||
      (consentFilter === 'consented' && app.isConsented) ||
      (consentFilter === 'revoked' && !app.isConsented);
    return matchesSearch && matchesCategory && matchesConsent;
  });

  const totalApplicants = applicantRows.length;
  const awaitingReview = applicantRows.filter(a => a.reviewStatus === 'Pending Review').length;
  const consentedCount = applicantRows.filter(a => a.isConsented).length;
  const avgScore = Math.round(
    applicantRows.reduce((sum, a) => sum + (a.isConsented ? a.score : 0), 0) / Math.max(1, consentedCount)
  );

  const handleRowClick = (workerId: string) => {
    setSelectedApplicantId(workerId);
    setCurrentView('lender-detail');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-forest uppercase tracking-wider">
              Lending Partner Console · Kite Microfinance Ltd.
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-charcoal mt-0.5">
              Gig Worker Underwriting & Portfolio Overview
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 max-w-3xl leading-relaxed">
              Underwrite unbanked gig economy workers using verified 30-day platform telemetry, cash-flow smoothing buffers, and explainable Steady Scores—governed strictly by applicant consent.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-forest-surface border border-forest/20 rounded-lg text-xs font-semibold text-forest shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>Consent-Enforced Underwriting</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-charcoal-muted">Total Applicants</div>
          <div className="text-2xl font-bold text-charcoal font-mono tabular-nums mt-1">
            {totalApplicants}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-0.5">Simulated demo pool</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-charcoal-muted">Awaiting Review</div>
          <div className="text-2xl font-bold text-amber-800 font-mono tabular-nums mt-1">
            {awaitingReview}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-0.5">Requires underwriter sign-off</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-charcoal-muted">Active Consent</div>
          <div className="text-2xl font-bold text-forest font-mono tabular-nums mt-1">
            {consentedCount} / {totalApplicants}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-0.5">Data sharing authorized</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-charcoal-muted">Average Steady Score</div>
          <div className="text-2xl font-bold text-forest font-mono tabular-nums mt-1">
            {avgScore}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-0.5">Consented applicants</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs col-span-2 lg:col-span-1">
          <div className="text-xs text-charcoal-muted">Risk Distribution</div>
          <div className="text-xs font-semibold text-charcoal mt-1 space-y-0.5 font-mono">
            <div>Prime (720+): <span className="text-forest">60%</span></div>
            <div>Moderate: <span className="text-amber-700">20%</span></div>
            <div>Building: <span className="text-charcoal-muted">20%</span></div>
          </div>
        </div>
      </div>

      {/* Applicant Search, Filters & Pipeline Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search applicant name, ID, or gig category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-forest focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Food Delivery Partner">Food Delivery</option>
              <option value="Ride-Hail Driver">Ride-Hail</option>
              <option value="Quick Commerce & Grocery">Quick Commerce</option>
              <option value="Freelance Designer">Freelance Designer</option>
              <option value="New Platform Onboard">New Onboard</option>
            </select>

            <select
              value={consentFilter}
              onChange={(e) => setConsentFilter(e.target.value)}
              className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
            >
              <option value="all">All Consent States</option>
              <option value="consented">Consent Granted</option>
              <option value="revoked">Consent Revoked / Absent</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-charcoal-muted uppercase text-[10px] tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Applicant</th>
                <th className="py-3 px-4 font-semibold">Work Category</th>
                <th className="py-3 px-4 font-semibold">Tenure</th>
                <th className="py-3 px-4 font-semibold text-right">Steady Score</th>
                <th className="py-3 px-4 font-semibold text-right">Income Volatility</th>
                <th className="py-3 px-4 font-semibold">Consent Status</th>
                <th className="py-3 px-4 font-semibold">Review Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans">
              {filteredApplicants.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => handleRowClick(app.workerId)}
                  className="hover:bg-neutral-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-charcoal">{app.worker.pseudonym}</div>
                    <div className="font-mono text-[10px] text-charcoal-muted">{app.id}</div>
                  </td>
                  <td className="py-3 px-4 text-charcoal-muted">
                    <div className="font-medium text-charcoal">{app.category}</div>
                    <div className="text-[10px]">{app.worker.platform}</div>
                  </td>
                  <td className="py-3 px-4 text-charcoal-muted font-mono">{app.tenure}</td>
                  <td className="py-3 px-4 text-right">
                    {app.isConsented ? (
                      <div>
                        <span className="font-mono tabular-nums font-bold text-forest text-sm">{app.score}</span>
                        <div className="text-[10px] text-charcoal-muted font-medium">{app.band}</div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium">
                        Redacted (No Consent)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {app.isConsented ? (
                      app.volatility
                    ) : (
                      <span className="text-charcoal-muted">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {app.isConsented ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-forest font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Granted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-semibold">
                        <ShieldAlert className="w-3.5 h-3.5" /> Revoked
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                      app.reviewStatus === 'Pre-Approved' ? 'bg-mint-light text-forest' :
                      app.reviewStatus === 'Declined' ? 'bg-red-50 text-red-700' :
                      'bg-neutral-100 text-charcoal'
                    }`}>
                      {app.reviewStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(app.workerId);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-forest hover:text-forest-dark bg-forest-surface hover:bg-forest/10 rounded-md transition-colors cursor-pointer"
                    >
                      Underwrite <ChevronRight className="w-3 h-3 inline ml-0.5" />
                    </button>
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
