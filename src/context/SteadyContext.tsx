import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  WorkerProfile,
  DayEarning,
  SmoothingConfig,
  SimulationResult,
  SafeToSpendInputs,
  SafeToSpendResult,
  SteadyScoreResult,
  LoanOffer,
  ConsentPermission,
  AuditLog,
  LenderDecision,
  SavingsGoal
} from '../types/steady';
import {
  DEMO_WORKERS,
  generateWorkerEarnings,
  DEMO_LOAN_OFFERS,
  INITIAL_CONSENT_PERMISSIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_GOALS
} from '../data/mockData';
import {
  runIncomeSmoothingSimulation,
  calculateSafeToSpend,
  calculateSteadyScore
} from '../utils/finance';

export type AppView = 
  | 'landing'
  | 'login'
  | 'worker-dashboard'
  | 'worker-income'
  | 'worker-savings'
  | 'worker-score'
  | 'worker-loans'
  | 'worker-consent'
  | 'worker-fairness'
  | 'lender-dashboard'
  | 'lender-applicants'
  | 'lender-detail'
  | 'settings';

export type UserRole = 'worker' | 'lender';
export type DateRange = '7d' | '30d' | '90d';

interface SubmittedLoanApp {
  id: string;
  workerId: string;
  offerId: string;
  lenderName: string;
  amount: number;
  tenureMonths: number;
  date: string;
  status: 'Under Review' | 'Pre-Approved' | 'Disbursed';
  repaymentStyle: 'income-linked' | 'standard';
}

interface SteadyContextType {
  // Navigation & Role
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  
  // Worker Profiles & Active Selection
  workers: WorkerProfile[];
  activeWorkerId: string;
  setActiveWorkerId: (id: string) => void;
  activeWorker: WorkerProfile;
  selectedApplicantId: string;
  setSelectedApplicantId: (id: string) => void;
  selectedApplicant: WorkerProfile;

  // Earnings Data
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  activeEarnings: DayEarning[];
  filteredEarnings: DayEarning[];
  
  // Auto-Save & Smoothing
  smoothingConfig: SmoothingConfig;
  updateSmoothingConfig: (partial: Partial<SmoothingConfig>) => void;
  simulationResult: SimulationResult;
  resetSimulation: () => void;
  
  // Safe-To-Spend
  safeToSpendInputs: SafeToSpendInputs;
  updateSafeToSpendInputs: (partial: Partial<SafeToSpendInputs>) => void;
  safeToSpendResult: SafeToSpendResult;

  // Steady Score
  extraSavingsBoost: number;
  setExtraSavingsBoost: (boost: number) => void;
  steadyScoreResult: SteadyScoreResult;

  // Loans
  loanOffers: LoanOffer[];
  submittedLoans: SubmittedLoanApp[];
  submitLoanApplication: (offer: LoanOffer, amount: number, tenureMonths: number, repaymentStyle: 'income-linked' | 'standard') => void;

  // Consent & Privacy
  permissions: ConsentPermission[];
  togglePermission: (permissionId: string) => void;
  grantAllPermissions: () => void;
  revokeAllPermissions: () => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: AuditLog['action'], detail: string, permCode?: string) => void;

  // Lender Review & Decisions
  lenderDecisions: Record<string, LenderDecision>;
  recordLenderDecision: (applicantId: string, decision: Omit<LenderDecision, 'applicantId'>) => void;
  requestConsentFromApplicant: (applicantId: string) => void;

  // Financial Goals
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'isCompleted'>) => void;
  contributeToGoal: (goalId: string, amount: number) => void;
  deleteGoal: (goalId: string) => void;
  toggleGoalComplete: (goalId: string) => void;

  // Demo Controls
  resetDemoData: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const SteadyContext = createContext<SteadyContextType | undefined>(undefined);

const DEFAULT_SMOOTHING_CONFIG: SmoothingConfig = {
  targetDailyIncome: 950,
  surplusSavePercent: 25,
  safetyFloor: 500,
  maxDailyContribution: 400,
  maxDailyWithdrawal: 450
};

const DEFAULT_SAFE_SPEND_INPUTS: SafeToSpendInputs = {
  availableLiquidFunds: 5400,
  essentialObligationsDue: 2200,
  safetyReserve: 1200,
  daysUntilNextPayout: 4
};

export const SteadyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [role, setRole] = useState<UserRole>('worker');

  // Sync hash routing if present
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as AppView;
      const validViews: AppView[] = [
        'landing', 'login', 'worker-dashboard', 'worker-income', 'worker-savings',
        'worker-score', 'worker-loans', 'worker-consent', 'worker-fairness',
        'lender-dashboard', 'lender-applicants', 'lender-detail', 'settings'
      ];
      if (validViews.includes(hash)) {
        setCurrentView(hash);
        if (hash.startsWith('lender-')) {
          setRole('lender');
        } else if (hash.startsWith('worker-')) {
          setRole('worker');
        }
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.location.hash = view;
    if (view.startsWith('lender-')) {
      setRole('lender');
    } else if (view.startsWith('worker-')) {
      setRole('worker');
    }
  };

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Workers
  const workers = DEMO_WORKERS;
  const [activeWorkerId, setActiveWorkerId] = useState<string>('worker-rahul');
  const [selectedApplicantId, setSelectedApplicantId] = useState<string>('worker-rahul');

  const activeWorker = useMemo(() => {
    return workers.find(w => w.id === activeWorkerId) || workers[0];
  }, [activeWorkerId, workers]);

  const selectedApplicant = useMemo(() => {
    return workers.find(w => w.id === selectedApplicantId) || workers[0];
  }, [selectedApplicantId, workers]);

  // Date range filter
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  // Pre-generate earnings for active worker
  const activeEarnings = useMemo(() => {
    return generateWorkerEarnings(activeWorkerId);
  }, [activeWorkerId]);

  const filteredEarnings = useMemo(() => {
    if (dateRange === '7d') {
      return activeEarnings.slice(-7);
    }
    if (dateRange === '30d') {
      return activeEarnings;
    }
    // For 90d, repeat synthetic pattern to provide 90-day historical context
    const full90: DayEarning[] = [];
    for (let cycle = 0; cycle < 3; cycle++) {
      for (const d of activeEarnings) {
        full90.push({ ...d, netEarnings: Math.round(d.netEarnings * (1 + (cycle * 0.05))) });
      }
    }
    return full90.slice(-90);
  }, [activeEarnings, dateRange]);

  // Auto-Save Smoothing Engine
  const [smoothingConfig, setSmoothingConfig] = useState<SmoothingConfig>(DEFAULT_SMOOTHING_CONFIG);

  const updateSmoothingConfig = (partial: Partial<SmoothingConfig>) => {
    setSmoothingConfig(prev => ({ ...prev, ...partial }));
  };

  const simulationResult = useMemo(() => {
    return runIncomeSmoothingSimulation(activeEarnings, smoothingConfig, 2400);
  }, [activeEarnings, smoothingConfig]);

  const resetSimulation = () => {
    setSmoothingConfig(DEFAULT_SMOOTHING_CONFIG);
    showToast('Auto-Save simulation parameters reset to baseline.');
  };

  // Safe-To-Spend
  const [safeToSpendInputs, setSafeToSpendInputs] = useState<SafeToSpendInputs>(DEFAULT_SAFE_SPEND_INPUTS);

  const updateSafeToSpendInputs = (partial: Partial<SafeToSpendInputs>) => {
    setSafeToSpendInputs(prev => ({ ...prev, ...partial }));
  };

  const safeToSpendResult = useMemo(() => {
    return calculateSafeToSpend(safeToSpendInputs);
  }, [safeToSpendInputs]);

  // Explainable Score
  const [extraSavingsBoost, setExtraSavingsBoost] = useState<number>(0);
  const steadyScoreResult = useMemo(() => {
    return calculateSteadyScore(activeWorker, activeEarnings, {
      extraSimulatedSavingsRate: extraSavingsBoost
    });
  }, [activeWorker, activeEarnings, extraSavingsBoost]);

  // Loan Offers & Applications
  const loanOffers = DEMO_LOAN_OFFERS;
  const [submittedLoans, setSubmittedLoans] = useState<SubmittedLoanApp[]>([
    {
      id: 'app-init-1',
      workerId: 'worker-rahul',
      offerId: 'offer-kite-flexi',
      lenderName: 'Kite Microfinance Ltd.',
      amount: 25000,
      tenureMonths: 6,
      date: '2026-10-18',
      status: 'Pre-Approved',
      repaymentStyle: 'income-linked'
    }
  ]);

  const submitLoanApplication = (
    offer: LoanOffer,
    amount: number,
    tenureMonths: number,
    repaymentStyle: 'income-linked' | 'standard'
  ) => {
    const newApp: SubmittedLoanApp = {
      id: `app-${Date.now().toString().slice(-4)}`,
      workerId: activeWorkerId,
      offerId: offer.id,
      lenderName: offer.lenderName,
      amount,
      tenureMonths,
      date: new Date().toISOString().split('T')[0],
      status: 'Under Review',
      repaymentStyle
    };
    setSubmittedLoans(prev => [newApp, ...prev]);
    addAuditLog('SIMULATED', `Submitted loan inquiry for ${offer.lenderName} (Amount: ₹${amount.toLocaleString('en-IN')})`);
    showToast(`Simulated loan application submitted to ${offer.lenderName}!`);
  };

  // Consent & Audit
  const [permissions, setPermissions] = useState<ConsentPermission[]>(INITIAL_CONSENT_PERMISSIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const addAuditLog = (action: AuditLog['action'], detail: string, permCode?: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' }) + ' IST',
      actor: role === 'worker' ? `${activeWorker.name} (Worker)` : 'Lending Officer (Demo)',
      action,
      permissionCode: permCode,
      detail
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const togglePermission = (permissionId: string) => {
    setPermissions(prev =>
      prev.map(p => {
        if (p.id === permissionId) {
          const nextState = !p.isGranted;
          addAuditLog(
            nextState ? 'GRANTED' : 'REVOKED',
            `${nextState ? 'Granted' : 'Revoked'} consent for: ${p.title}`,
            p.code
          );
          return {
            ...p,
            isGranted: nextState,
            grantedAt: nextState ? 'Just now' : undefined
          };
        }
        return p;
      })
    );
    showToast('Privacy permissions updated.');
  };

  const grantAllPermissions = () => {
    setPermissions(prev => prev.map(p => ({ ...p, isGranted: true })));
    addAuditLog('GRANTED', 'Granted all optional data-sharing permissions.');
    showToast('All permissions granted.');
  };

  const revokeAllPermissions = () => {
    setPermissions(prev => prev.map(p => ({ ...p, isGranted: false })));
    addAuditLog('REVOKED', 'Revoked all data-sharing permissions with third-party lenders.');
    showToast('All lender-sharing permissions revoked.');
  };

  // Lender Decisions
  const [lenderDecisions, setLenderDecisions] = useState<Record<string, LenderDecision>>({
    'worker-rahul': {
      applicantId: 'worker-rahul',
      status: 'Pre-Approved',
      notes: 'Strong 18-month tenure, solid buffer discipline, weather dips adequately buffered.',
      approvedAmount: 25000,
      decisionDate: '2026-10-21',
      officerName: 'Rajesh K. (Kite MFI)'
    }
  });

  const recordLenderDecision = (applicantId: string, decision: Omit<LenderDecision, 'applicantId'>) => {
    setLenderDecisions(prev => ({
      ...prev,
      [applicantId]: { ...decision, applicantId }
    }));
    addAuditLog('REVIEWED', `Recorded decision [${decision.status}] for applicant ${applicantId}.`);
    showToast(`Decision recorded: ${decision.status}`);
  };

  const requestConsentFromApplicant = (applicantId: string) => {
    addAuditLog('REVIEWED', `Lender dispatched consent re-authorization request to applicant.`);
    showToast(`Consent request notification dispatched to applicant.`);
  };

  // Financial Goals State & Actions
  const [goals, setGoals] = useState<SavingsGoal[]>(INITIAL_GOALS);

  const addGoal = (newGoalData: Omit<SavingsGoal, 'id' | 'createdAt' | 'isCompleted'>) => {
    const newGoal: SavingsGoal = {
      ...newGoalData,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      isCompleted: newGoalData.currentAmount >= newGoalData.targetAmount
    };
    setGoals(prev => [newGoal, ...prev]);
    addAuditLog('SIMULATED', `Created savings goal: "${newGoal.title}" (Target: ₹${newGoal.targetAmount.toLocaleString('en-IN')})`);
    showToast(`Created new goal: "${newGoal.title}"`);
  };

  const contributeToGoal = (goalId: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const nextAmount = Math.max(0, g.currentAmount + amount);
        const isCompleted = nextAmount >= g.targetAmount;
        return {
          ...g,
          currentAmount: nextAmount,
          isCompleted
        };
      }
      return g;
    }));
    showToast(`Added ₹${amount.toLocaleString('en-IN')} to goal!`);
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    showToast('Savings goal removed.');
  };

  const toggleGoalComplete = (goalId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return { ...g, isCompleted: !g.isCompleted };
      }
      return g;
    }));
  };

  // Role Switching
  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'lender') {
      navigateTo('lender-dashboard');
      showToast('Switched to Lender Portal view.');
    } else {
      navigateTo('worker-dashboard');
      showToast('Switched to Worker Dashboard view.');
    }
  };

  const resetDemoData = () => {
    setSmoothingConfig(DEFAULT_SMOOTHING_CONFIG);
    setSafeToSpendInputs(DEFAULT_SAFE_SPEND_INPUTS);
    setPermissions(INITIAL_CONSENT_PERMISSIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setActiveWorkerId('worker-rahul');
    setExtraSavingsBoost(0);
    setGoals(INITIAL_GOALS);
    addAuditLog('RESET', 'Demo database, goals, and simulation parameters reset to factory state.');
    showToast('Demo environment reset successfully.');
  };

  return (
    <SteadyContext.Provider
      value={{
        currentView,
        setCurrentView: navigateTo,
        role,
        setRole,
        switchRole,
        workers,
        activeWorkerId,
        setActiveWorkerId,
        activeWorker,
        selectedApplicantId,
        setSelectedApplicantId,
        selectedApplicant,
        dateRange,
        setDateRange,
        activeEarnings,
        filteredEarnings,
        smoothingConfig,
        updateSmoothingConfig,
        simulationResult,
        resetSimulation,
        safeToSpendInputs,
        updateSafeToSpendInputs,
        safeToSpendResult,
        extraSavingsBoost,
        setExtraSavingsBoost,
        steadyScoreResult,
        loanOffers,
        submittedLoans,
        submitLoanApplication,
        permissions,
        togglePermission,
        grantAllPermissions,
        revokeAllPermissions,
        auditLogs,
        addAuditLog,
        lenderDecisions,
        recordLenderDecision,
        requestConsentFromApplicant,
        goals,
        addGoal,
        contributeToGoal,
        deleteGoal,
        toggleGoalComplete,
        resetDemoData,
        toastMessage,
        showToast
      }}
    >
      {children}
    </SteadyContext.Provider>
  );
};

export const useSteady = () => {
  const context = useContext(SteadyContext);
  if (!context) {
    throw new Error('useSteady must be used within a SteadyProvider');
  }
  return context;
};
