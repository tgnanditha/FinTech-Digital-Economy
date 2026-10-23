import React from 'react';
import { useSteady } from '../../context/SteadyContext';
import {
  RotateCcw,
  ShieldCheck,
  User,
  Building2,
  Sliders,
  CheckCircle2,
  Trash2,
  Info
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    role,
    switchRole,
    activeWorker,
    workers,
    setActiveWorkerId,
    resetDemoData,
    smoothingConfig,
    showToast
  } = useSteady();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="text-xs font-semibold text-forest uppercase tracking-wider">
          System Preferences & Demo Configuration
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-charcoal mt-0.5">
          Settings & Persona Management
        </h1>
        <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
          Manage your simulated session, switch between worker and institutional lender views, or restore factory defaults.
        </p>
      </div>

      {/* Role & Persona Settings Card */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-charcoal">
          Active Persona & Access Role
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-forest-surface rounded-xl border border-forest/20 space-y-2">
            <div className="text-xs text-charcoal-muted font-medium">Current Role</div>
            <div className="text-lg font-bold text-forest capitalize">
              {role === 'worker' ? 'Gig Delivery Partner' : 'Lender Underwriting Officer'}
            </div>
            <button
              onClick={() => switchRole(role === 'worker' ? 'lender' : 'worker')}
              className="mt-2 px-3 py-1.5 text-xs font-bold text-charcoal bg-mint hover:bg-mint-light rounded-lg transition-colors cursor-pointer"
            >
              Switch to {role === 'worker' ? 'Lender Portal' : 'Worker Dashboard'}
            </button>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <div className="text-xs text-charcoal-muted font-medium">Simulated Gig Worker</div>
            <select
              value={activeWorker.id}
              onChange={(e) => {
                setActiveWorkerId(e.target.value);
                showToast(`Switched active worker to ${e.target.selectedOptions[0].text}`);
              }}
              className="w-full bg-white border border-neutral-200 rounded-lg p-2 text-xs font-semibold text-charcoal cursor-pointer"
            >
              {workers.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.category})</option>
              ))}
            </select>
            <div className="text-[11px] text-charcoal-muted">
              Platform: {activeWorker.platform} · {activeWorker.tenureMonths} Mo Tenure · {activeWorker.city}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Prototype Info */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-charcoal">
          Hackathon Architecture & Tech Stack Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <div className="font-sans text-charcoal-muted text-[10px]">Frontend Stack</div>
            <div className="font-bold text-charcoal mt-0.5">React 19 + TypeScript + Vite</div>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <div className="font-sans text-charcoal-muted text-[10px]">Styling & Tokens</div>
            <div className="font-bold text-charcoal mt-0.5">Tailwind CSS (Forest & Mint)</div>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <div className="font-sans text-charcoal-muted text-[10px]">Scoring Engine</div>
            <div className="font-bold text-charcoal mt-0.5">Transparent 5-Factor Math (300-900)</div>
          </div>
        </div>
      </div>

      {/* Factory Reset Card */}
      <div className="bg-white p-5 rounded-xl border border-red-200 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-red-700 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-700" /> Reset Demo State
        </h2>
        <p className="text-xs text-charcoal-muted leading-relaxed">
          Clears all simulation ledger changes, custom safe-to-spend inputs, loan applications, and re-enables default consent permissions.
        </p>
        <button
          onClick={resetDemoData}
          className="px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restore All Factory Defaults
        </button>
      </div>
    </div>
  );
};
