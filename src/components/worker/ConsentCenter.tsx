import React from 'react';
import { useSteady } from '../../context/SteadyContext';
import {
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Download,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  UserCheck,
  Lock,
  ArrowRight
} from 'lucide-react';

export const ConsentCenter: React.FC = () => {
  const {
    permissions,
    togglePermission,
    grantAllPermissions,
    revokeAllPermissions,
    auditLogs,
    resetDemoData,
    showToast,
    addAuditLog
  } = useSteady();

  const handleExportData = () => {
    const exportPayload = {
      app: 'Steady FinTech Prototype',
      exportTimestamp: new Date().toISOString(),
      permissionsState: permissions,
      auditRecords: auditLogs
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `steady-consent-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addAuditLog('EXPORTED', 'Exported machine-readable consent and permission audit bundle.');
    showToast('Exported consent audit JSON successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-forest uppercase tracking-wider">
              Privacy & Consent Governance
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-charcoal mt-0.5">
              Consent & Data Protection Center
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 max-w-3xl leading-relaxed">
              Steady puts you in absolute control of your data. Permissions are granular, time-bound, and can be revoked at any second. Revoking consent immediately redacts protected financial telemetry from partner lender portals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={grantAllPermissions}
              className="px-3 py-1.5 text-xs font-semibold text-forest bg-forest-surface hover:bg-forest/10 border border-forest/20 rounded-lg transition-colors cursor-pointer"
            >
              Grant All
            </button>
            <button
              onClick={revokeAllPermissions}
              className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
            >
              Revoke All Lenders
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-charcoal bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-charcoal-muted" />
              Export Audit
            </button>
          </div>
        </div>

        {/* Account Aggregator Disclaimer */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2 text-[11px] text-charcoal-muted">
          <HelpCircle className="w-3.5 h-3.5 text-forest shrink-0" />
          <span>
            <strong>Consent Framework:</strong> Steady is a privacy-first hackathon prototype inspired by India's Account Aggregator (RBI-AA) architecture. We never collect Aadhaar numbers, PAN cards, UPI PINs, or banking passwords.
          </span>
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {permissions.map((perm) => (
          <div
            key={perm.id}
            className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
              perm.isGranted
                ? 'bg-white border-neutral-200 shadow-2xs'
                : 'bg-neutral-50/80 border-neutral-200 opacity-90'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                    perm.isGranted ? 'bg-mint text-forest' : 'bg-neutral-200 text-charcoal-muted'
                  }`}>
                    {perm.isGranted ? <Lock className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-charcoal">{perm.title}</h3>
                    <span className="font-mono text-[10px] text-charcoal-muted uppercase">{perm.code}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePermission(perm.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    perm.isGranted
                      ? 'bg-mint text-forest hover:bg-mint-dark hover:text-white'
                      : 'bg-neutral-200 text-charcoal-muted hover:bg-forest hover:text-white'
                  }`}
                >
                  {perm.isGranted ? 'Granted (Active)' : 'Revoked (Denied)'}
                </button>
              </div>

              <div className="text-xs text-charcoal mt-2 leading-relaxed">
                {perm.description}
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-100 space-y-1.5 text-[11px] text-charcoal-muted">
                <div>
                  <strong className="text-charcoal font-medium">Why it's needed:</strong> {perm.purpose}
                </div>
                <div>
                  <strong className="text-charcoal font-medium">Data Shared:</strong> {perm.dataShared}
                </div>
                <div>
                  <strong className="text-charcoal font-medium">Accessed By:</strong> {perm.accessedBy}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[10px] text-charcoal-muted font-mono">
              <span>Granted: {perm.grantedAt || 'Not granted'}</span>
              <span>Expires: {perm.expiresAt || 'N/A'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Real-Time Immutable Audit Log */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-charcoal">
              Consent & Data Access Audit Log (Immutable Record)
            </h3>
            <div className="text-xs text-charcoal-muted">
              Every grant, revocation, simulation, and underwriting inspection is chronologically recorded.
            </div>
          </div>
          <span className="text-xs font-mono text-charcoal-muted">{auditLogs.length} Events Logged</span>
        </div>

        <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-neutral-50/80 transition-colors">
              <div className="flex items-center gap-2.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                  log.action === 'GRANTED' ? 'bg-mint-light text-forest' :
                  log.action === 'REVOKED' ? 'bg-amber-100 text-amber-900' :
                  log.action === 'REVIEWED' ? 'bg-blue-50 text-blue-800' :
                  log.action === 'SIMULATED' ? 'bg-purple-50 text-purple-800' :
                  'bg-neutral-100 text-charcoal'
                }`}>
                  {log.action}
                </span>
                <span className="text-charcoal font-medium">{log.detail}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-charcoal-muted shrink-0 font-mono">
                <span>{log.actor}</span>
                <span aria-hidden="true">·</span>
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
