import React from 'react';
import { SteadyProvider, useSteady } from './context/SteadyContext';
import { DemoBanner } from './components/common/DemoBanner';
import { TopBar } from './components/common/TopBar';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';

// Views
import { LandingPage } from './components/landing/LandingPage';
import { LoginView } from './components/auth/LoginView';
import { DashboardOverview } from './components/worker/DashboardOverview';
import { IncomeAnalytics } from './components/worker/IncomeAnalytics';
import { SavingsEngine } from './components/worker/SavingsEngine';
import { SafeToSpendView } from './components/worker/SafeToSpendView';
import { SteadyScoreView } from './components/worker/SteadyScoreView';
import { LoanMarketplace } from './components/worker/LoanMarketplace';
import { ConsentCenter } from './components/worker/ConsentCenter';
import { FairnessMonitor } from './components/worker/FairnessMonitor';
import { LenderDashboard } from './components/lender/LenderDashboard';
import { ApplicantDetail } from './components/lender/ApplicantDetail';
import { SettingsView } from './components/settings/SettingsView';

const AppContent: React.FC = () => {
  const { currentView, toastMessage } = useSteady();

  const isPublicPage = currentView === 'landing' || currentView === 'login';

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginView />;
      case 'worker-dashboard':
        return <DashboardOverview />;
      case 'worker-income':
        return <IncomeAnalytics />;
      case 'worker-savings':
        return (
          <div className="space-y-10">
            <SavingsEngine />
            <div id="safe-spend" className="pt-4 border-t border-neutral-200">
              <SafeToSpendView />
            </div>
          </div>
        );
      case 'worker-score':
        return <SteadyScoreView />;
      case 'worker-loans':
        return <LoanMarketplace />;
      case 'worker-consent':
        return <ConsentCenter />;
      case 'worker-fairness':
        return <FairnessMonitor />;
      case 'lender-dashboard':
      case 'lender-applicants':
        return <LenderDashboard />;
      case 'lender-detail':
        return <ApplicantDetail />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F5] text-[#17231E]">
      {/* Universal Demo Notice & Role Quick-Switcher */}
      <DemoBanner />

      {/* Top Navigation Bar conforming to 3-zone contract */}
      <TopBar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar (hidden on public landing/login) */}
        {!isPublicPage && (
          <div className="hidden md:block">
            <Sidebar />
          </div>
        )}

        {/* Dynamic Content Viewport */}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden ${isPublicPage ? 'w-full' : ''}`}>
          {renderView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation (fixed to bottom on mobile, hidden on landing) */}
      <MobileNav />

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-6 right-4 sm:right-6 z-50 bg-[#17231E] text-white px-4 py-2.5 rounded-xl shadow-lg border border-neutral-700 text-xs flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#B9F3D0]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <SteadyProvider>
      <AppContent />
    </SteadyProvider>
  );
}
