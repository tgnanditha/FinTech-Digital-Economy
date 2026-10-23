import React from 'react';
import { useSteady } from '../../context/SteadyContext';
import { SteadyLogo } from './SteadyLogo';

export const TopBar: React.FC = () => {
  const { currentView, setCurrentView, role, switchRole } = useSteady();

  const isPublicLanding = currentView === 'landing' || currentView === 'login';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setCurrentView('landing')}
          className="text-left cursor-pointer whitespace-nowrap shrink-0 hover:opacity-95 transition-opacity"
          aria-label="Steady Home"
        >
          <SteadyLogo />
        </button>

        {/* Zone 2: Concise Nav Links (Single line, whitespace-nowrap) */}
        {isPublicLanding ? (
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-charcoal-muted">
            <button
              onClick={() => setCurrentView('landing')}
              className={`hover:text-forest transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'landing' ? 'text-forest font-semibold' : ''
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setCurrentView('worker-income')}
              className="hover:text-forest transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Earnings Engine
            </button>
            <button
              onClick={() => setCurrentView('worker-savings')}
              className="hover:text-forest transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Income Smoothing
            </button>
            <button
              onClick={() => setCurrentView('worker-score')}
              className="hover:text-forest transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Steady Score
            </button>
            <button
              onClick={() => setCurrentView('worker-fairness')}
              className="hover:text-forest transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Fairness Monitor
            </button>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-charcoal-muted">
            {role === 'worker' ? (
              <>
                <button
                  onClick={() => setCurrentView('worker-dashboard')}
                  className={`hover:text-forest transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    currentView === 'worker-dashboard' ? 'text-forest font-semibold' : ''
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('worker-income')}
                  className={`hover:text-forest transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    currentView === 'worker-income' ? 'text-forest font-semibold' : ''
                  }`}
                >
                  Earnings
                </button>
                <button
                  onClick={() => setCurrentView('worker-savings')}
                  className={`hover:text-forest transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    currentView === 'worker-savings' ? 'text-forest font-semibold' : ''
                  }`}
                >
                  Auto-Save Buffer
                </button>
                <button
                  onClick={() => setCurrentView('worker-score')}
                  className={`hover:text-forest transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    currentView === 'worker-score' ? 'text-forest font-semibold' : ''
                  }`}
                >
                  Steady Score
                </button>
                <button
                  onClick={() => setCurrentView('worker-loans')}
                  className={`hover:text-forest transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    currentView === 'worker-loans' ? 'text-forest font-semibold' : ''
                  }`}
                >
                  Flexible Loans
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentView('lender-dashboard')}
                  className={`hover:text-forest transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    currentView === 'lender-dashboard' ? 'text-forest font-semibold' : ''
                  }`}
                >
                  Portfolio Overview
                </button>
                <button
                  onClick={() => setCurrentView('lender-applicants')}
                  className={`hover:text-forest transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    currentView === 'lender-applicants' ? 'text-forest font-semibold' : ''
                  }`}
                >
                  Applicant Underwriting
                </button>
                <button
                  onClick={() => setCurrentView('worker-fairness')}
                  className={`hover:text-forest transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    currentView === 'worker-fairness' ? 'text-forest font-semibold' : ''
                  }`}
                >
                  Fairness Controls
                </button>
              </>
            )}
          </nav>
        )}

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {isPublicLanding ? (
            <button
              onClick={() => setCurrentView('login')}
              className="px-4 py-2 text-xs font-semibold text-charcoal bg-mint hover:bg-mint-light rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Explore Demo Portals
            </button>
          ) : (
            <button
              onClick={() => switchRole(role === 'worker' ? 'lender' : 'worker')}
              className="px-3.5 py-1.5 text-xs font-medium text-forest bg-forest-surface hover:bg-forest/10 border border-forest/20 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {role === 'worker' ? 'Switch to Lender' : 'Switch to Worker'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
