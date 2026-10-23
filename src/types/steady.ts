export type WorkCategory = 
  | 'Quick Commerce & Grocery' 
  | 'Food Delivery Partner' 
  | 'Ride-Hail Driver' 
  | 'Freelance Designer' 
  | 'New Platform Onboard';

export type EventCategory = 'weather' | 'surge' | 'outage' | 'personal' | 'normal';

export interface DayEarning {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  grossEarnings: number;
  workExpenses: number;
  netEarnings: number;
  hoursWorked: number;
  eventLabel?: string;
  eventCategory?: EventCategory;
}

export interface WorkerProfile {
  id: string;
  name: string;
  pseudonym: string;
  category: WorkCategory;
  platform: string;
  tenureMonths: number;
  city: string;
  initials: string;
  vehicleType: string;
  rating: number;
  summary: string;
  isDefault?: boolean;
}

export interface SmoothingConfig {
  targetDailyIncome: number;      // Target steady pay per day (e.g. ₹950)
  surplusSavePercent: number;     // % saved on surplus days (e.g. 25%)
  safetyFloor: number;            // Min net earnings to protect before saving (e.g. ₹500)
  maxDailyContribution: number;  // Max savings into buffer per day (e.g. ₹400)
  maxDailyWithdrawal: number;      // Max buffer payout per day (e.g. ₹450)
}

export interface BufferLedgerEntry {
  dayIndex: number;
  date: string;
  dayOfWeek: string;
  gross: number;
  expenses: number;
  net: number;
  baseline: number;
  openingBalance: number;
  contribution: number;
  withdrawal: number;
  effectiveIncome: number; // net + withdrawal - contribution
  closingBalance: number;
  shortfall: number;
  eventLabel?: string;
  eventCategory?: EventCategory;
}

export interface SimulationResult {
  ledger: BufferLedgerEntry[];
  totalSaved: number;
  totalWithdrawn: number;
  daysSupported: number;
  finalBufferBalance: number;
  incomeVolatilityBefore: number; // std dev
  incomeVolatilityAfter: number;  // std dev
  stabilityImprovementPercent: number;
  shortfallCount: number;
  totalShortfallAmount: number;
}

export interface SafeToSpendInputs {
  availableLiquidFunds: number;  // Bank/cash in hand (excluding locked buffer)
  essentialObligationsDue: number; // Rent, fuel advance, EMI due soon
  safetyReserve: number;           // Emergency floor
  daysUntilNextPayout: number;     // Days until next scheduled platform settlement
}

export interface SafeToSpendResult {
  dailySafeToSpend: number;
  netDiscretionarySurplus: number;
  isNegative: boolean;
  statusText: string;
  riskLevel: 'healthy' | 'caution' | 'critical';
  breakdown: {
    label: string;
    amount: number;
    description: string;
  }[];
}

export interface ScoreComponent {
  id: 'consistency' | 'tenure' | 'savings' | 'billPayment' | 'expenseRatio';
  name: string;
  weight: number; // 0.30, 0.15, etc.
  rawScore: number; // 0 to 100
  weightedPoints: number; // contribution to 300-900 score
  status: 'Strong' | 'Moderate' | 'Needs Attention';
  insight: string;
  actionableTip: string;
}

export interface SteadyScoreResult {
  score: number; // 300 - 900
  band: 'Excellent' | 'Good' | 'Fair' | 'Building';
  components: ScoreComponent[];
  formulaExplanation: string;
  strengths: string[];
  improvementOpportunities: string[];
  confidence: 'High Confidence' | 'Medium Confidence' | 'Uncertain (Limited History)';
  historicalTrend: { month: string; score: number }[];
}

export interface LoanOffer {
  id: string;
  lenderName: string;
  lenderType: 'Microfinance Institution' | 'Small Finance Bank' | 'Fintech NBFC';
  minAmount: number;
  maxAmount: number;
  illustrativeAmount: number;
  annualInterestRate: number; // e.g. 14.5%
  tenureMonths: number;
  processingFeePercent: number;
  minWeeklyFloor: number;
  maxWeeklyCap: number;
  flexibleAdjustmentEnabled: boolean;
  eligibilityScore: number;
  featureBadge: string;
  description: string;
}

export interface ConventionalLoanResult {
  monthlyInstallment: number;
  weeklyInstallment: number;
  totalInterest: number;
  totalRepayment: number;
  amortizationSample: {
    period: number;
    payment: number;
    principal: number;
    interest: number;
    remainingPrincipal: number;
  }[];
}

export interface FlexibleWeekSim {
  week: number;
  actualWeeklyIncome: number;
  baselineWeeklyIncome: number;
  incomeRatio: number;
  scheduledBaseEmi: number;
  adjustedEmi: number;
  interestPortion: number;
  principalPortion: number;
  unpaidInterestCarriedOver: number;
  remainingBalance: number;
  adjustmentNote: string;
}

export interface FlexibleRepaymentResult {
  weeks: FlexibleWeekSim[];
  totalPaid: number;
  totalInterestPaid: number;
  unpaidDeficit: number;
  isFullyPaid: boolean;
  weeksElapsed: number;
  originalTermWeeks: number;
  reliefWeeksCount: number;
  surgeWeeksCount: number;
}

export interface ConsentPermission {
  id: string;
  code: string;
  title: string;
  description: string;
  purpose: string;
  dataShared: string;
  accessedBy: string;
  grantedAt?: string;
  expiresAt?: string;
  isGranted: boolean;
  isCriticalForLender: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: 'GRANTED' | 'REVOKED' | 'REVIEWED' | 'SIMULATED' | 'EXPORTED' | 'RESET';
  permissionCode?: string;
  detail: string;
}

export interface LenderDecision {
  applicantId: string;
  status: 'Pending Review' | 'Pre-Approved' | 'Conditional Offer' | 'Requires Verification' | 'Declined';
  notes: string;
  approvedAmount?: number;
  decisionDate?: string;
  officerName: string;
}

export interface FairnessCase {
  id: string;
  title: string;
  category: EventCategory;
  workerName: string;
  contextDescription: string;
  impactOnRawIncome: string;
  steadyContextualAdjustment: string;
  fairnessSafeguard: string;
  confidenceImpact: string;
}

export type GoalCategory = 'emergency' | 'vehicle' | 'family' | 'festival' | 'tools' | 'education';

export interface SavingsGoal {
  id: string;
  workerId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: GoalCategory;
  createdAt: string;
  isCompleted: boolean;
}

