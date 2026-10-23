import React from 'react';
import { useSteady, AppView } from '../../context/SteadyContext';
import {
  LayoutDashboard,
  TrendingUp,
  PiggyBank,
  Sparkles,
  ShieldCheck,
  Users
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentView, setCurrentView, role } = useSteady();

  if (currentView === 'landing' || currentView === 'login') {
    return null;
  }

  const workerTabs: { id: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'worker-dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'worker-income', label: 'Income', icon: TrendingUp },
    { id: 'worker-savings', label: 'Buffer', icon: PiggyBank },
    { id: 'worker-score', label: 'Score', icon: Sparkles },
    { id: 'worker-consent', label: 'Consent', icon: ShieldCheck },
  ];

  const lenderTabs: { id: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'lender-dashboard', label: 'Portfolio', icon: LayoutDashboard },
    { id: 'lender-applicants', label: 'Pipeline', icon: Users },
    { id: 'worker-fairness', label: 'Fairness', icon: Sparkles },
    { id: 'worker-consent', label: 'Privacy', icon: ShieldCheck },
  ];

  const tabs = role === 'worker' ? workerTabs : lenderTabs;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-neutral-200 safe-bottom">
      <nav className="flex items-center justify-around h-14 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                isActive ? 'text-forest font-semibold' : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-forest' : 'text-charcoal-muted'}`} />
              <span className="truncate max-w-[60px]">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
