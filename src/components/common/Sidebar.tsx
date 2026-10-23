import React from 'react';
import { useSteady, AppView } from '../../context/SteadyContext';
import {
  LayoutDashboard,
  TrendingUp,
  PiggyBank,
  Sparkles,
  Coins,
  ShieldCheck,
  Scale,
  Users,
  Settings,
  ChevronDown,
  Star
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    role,
    workers,
    activeWorkerId,
    setActiveWorkerId,
    activeWorker
  } = useSteady();

  const workerNavItems: { id: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'worker-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'worker-income', label: 'Earnings Analytics', icon: TrendingUp },
    { id: 'worker-savings', label: 'Auto-Save & Buffer', icon: PiggyBank },
    { id: 'worker-score', label: 'Steady Score', icon: Sparkles },
    { id: 'worker-loans', label: 'Flexible Loans', icon: Coins },
    { id: 'worker-consent', label: 'Privacy & Consent', icon: ShieldCheck },
    { id: 'worker-fairness', label: 'Fairness Monitor', icon: Scale },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const lenderNavItems: { id: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'lender-dashboard', label: 'Portfolio Overview', icon: LayoutDashboard },
    { id: 'lender-applicants', label: 'Applicants Pipeline', icon: Users },
    { id: 'worker-fairness', label: 'Contextual Fairness', icon: Scale },
    { id: 'worker-consent', label: 'Consent Governance', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const items = role === 'worker' ? workerNavItems : lenderNavItems;

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Persona Switcher / Profile Banner */}
      <div className="p-4 border-b border-neutral-100">
        {role === 'worker' ? (
          <div>
            <label htmlFor="worker-persona-select" className="block text-xs font-medium text-charcoal-muted mb-1.5">
              Simulated Worker Profile
            </label>
            <div className="relative">
              <select
                id="worker-persona-select"
                value={activeWorkerId}
                onChange={(e) => setActiveWorkerId(e.target.value)}
                className="w-full text-xs font-semibold text-charcoal bg-forest-surface border border-forest/20 rounded-lg py-2 pl-2.5 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
              >
                {workers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.category.split(' ')[0]})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-forest absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Quiet unboxed text metadata */}
            <div className="mt-2.5 flex items-center gap-2 text-xs text-charcoal-muted">
              <span className="font-medium text-forest">{activeWorker.platform}</span>
              <span aria-hidden="true">·</span>
              <span>{activeWorker.tenureMonths} mo tenure</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-500 fill-amber-500 inline" /> {activeWorker.rating}</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs font-semibold text-forest uppercase tracking-wider mb-1">
              Lender Portal
            </div>
            <div className="text-sm font-bold text-charcoal">
              Kite Microfinance Ltd.
            </div>
            <div className="text-xs text-charcoal-muted mt-0.5">
              Verified NBFC / MFI Partner
            </div>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-forest text-white'
                  : 'text-charcoal-muted hover:text-charcoal hover:bg-neutral-50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-mint' : 'text-charcoal-muted'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Safety Notice Footer */}
      <div className="p-4 border-t border-neutral-100 text-[11px] text-charcoal-muted leading-relaxed">
        <div className="font-semibold text-charcoal mb-0.5">Safe Financial Prototype</div>
        Buffer accounts are simulated accounting ledgers. No live banking funds or credit bureau inquiries are triggered.
      </div>
    </aside>
  );
};
