import {
  WorkerProfile,
  DayEarning,
  LoanOffer,
  ConsentPermission,
  AuditLog,
  FairnessCase,
  SavingsGoal
} from '../types/steady';

export const DEMO_WORKERS: WorkerProfile[] = [
  {
    id: 'worker-rahul',
    name: 'Rahul Sharma',
    pseudonym: 'Rahul S.',
    category: 'Food Delivery Partner',
    platform: 'Zomato & Swiggy',
    tenureMonths: 18,
    city: 'Bengaluru (Koramangala & HSR)',
    initials: 'RS',
    vehicleType: 'EV 2-Wheeler (Bounce)',
    rating: 4.88,
    summary: 'Consistent evening dinner shift specialist. High weekend deliveries offset by seasonal monsoon disruptions.',
    isDefault: true
  },
  {
    id: 'worker-priya',
    name: 'Priya Venkat',
    pseudonym: 'Priya V.',
    category: 'Ride-Hail Driver',
    platform: 'Uber & Ola',
    tenureMonths: 28,
    city: 'Hyderabad (Hitec City)',
    initials: 'PV',
    vehicleType: 'Sedan CNG (WagonR)',
    rating: 4.93,
    summary: 'High-performing commuter specialist. Steady morning and airport trips, high baseline consistency.',
    isDefault: false
  },
  {
    id: 'worker-arjun',
    name: 'Arjun Das',
    pseudonym: 'Arjun D.',
    category: 'Quick Commerce & Grocery',
    platform: 'Blinkit & Zepto',
    tenureMonths: 9,
    city: 'Mumbai (Andheri West)',
    initials: 'AD',
    vehicleType: 'Motorcycle 125cc',
    rating: 4.76,
    summary: 'Hyperlocal 10-minute delivery courier. Experienced heavy monsoon flooding disruptions during mid-month.',
    isDefault: false
  },
  {
    id: 'worker-kavita',
    name: 'Kavita Murthy',
    pseudonym: 'Kavita M.',
    category: 'Freelance Designer',
    platform: 'Upwork & Indian Direct Clients',
    tenureMonths: 15,
    city: 'Pune',
    initials: 'KM',
    vehicleType: 'N/A (Remote)',
    rating: 4.95,
    summary: 'Digital freelancer with chunky milestone disbursements every 10–14 days. High variance requiring buffer smoothing.',
    isDefault: false
  },
  {
    id: 'worker-vikram',
    name: 'Vikram Singh',
    pseudonym: 'Vikram S.',
    category: 'New Platform Onboard',
    platform: 'Shadowfax & Porter',
    tenureMonths: 2,
    city: 'Delhi NCR',
    initials: 'VS',
    vehicleType: 'Commercial Tempo 3-Wheeler',
    rating: 4.65,
    summary: 'Recently onboarded logistics partner with only 3 weeks of historical records. System applies uncertainty guardrails.',
    isDefault: false
  }
];

// Helper to generate 30 days of realistic daily earnings for each profile
export function generateWorkerEarnings(profileId: string): DayEarning[] {
  const days: DayEarning[] = [];
  const baseDate = new Date(2026, 9, 1); // Oct 1, 2026

  for (let i = 0; i < 30; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    let gross = 1000;
    let expense = 220;
    let hours = 8;
    let eventLabel: string | undefined = undefined;
    let eventCategory: DayEarning['eventCategory'] = 'normal';

    if (profileId === 'worker-rahul') {
      // Rahul: Food Delivery Rider in Bengaluru
      gross = isWeekend ? 1350 + (i % 3) * 120 : 980 + (i % 4) * 80;
      expense = 210 + (i % 3) * 20;
      hours = isWeekend ? 9.5 : 8.0;

      // Special real-world events
      if (i === 4) {
        eventLabel = 'Heavy Monsoon Downpour';
        eventCategory = 'weather';
        gross = 420;
        expense = 190;
        hours = 4;
      } else if (i === 5) {
        eventLabel = 'Waterlogged Roads (Low Orders)';
        eventCategory = 'weather';
        gross = 510;
        expense = 210;
        hours = 5;
      } else if (i === 12) {
        eventLabel = 'Platform Gateway Outage (App Down)';
        eventCategory = 'outage';
        gross = 280;
        expense = 140;
        hours = 3;
      } else if (i === 18) {
        eventLabel = 'EV Battery Charger Servicing';
        eventCategory = 'personal';
        gross = 620;
        expense = 280;
        hours = 5;
      } else if (i === 24 || i === 25) {
        eventLabel = 'Diwali Weekend Order Surge';
        eventCategory = 'surge';
        gross = 1880 + (i === 25 ? 240 : 0);
        expense = 260;
        hours = 11;
      }
    } else if (profileId === 'worker-priya') {
      // Priya: Ride-Hail Driver in Hyderabad (Higher baseline, CNG fuel)
      gross = isWeekend ? 2100 + (i % 3) * 180 : 1650 + (i % 4) * 110;
      expense = 420 + (i % 3) * 30;
      hours = 9;

      if (i === 10) {
        eventLabel = 'Airport Tech Conference Traffic Surge';
        eventCategory = 'surge';
        gross = 2600;
        expense = 480;
        hours = 10.5;
      } else if (i === 21) {
        eventLabel = 'CNG Pump Queues & Filter Replacement';
        eventCategory = 'personal';
        gross = 850;
        expense = 510;
        hours = 5;
      }
    } else if (profileId === 'worker-arjun') {
      // Arjun: Quick Commerce in Mumbai (severe rain disruption mid-month)
      gross = isWeekend ? 1200 + (i % 3) * 100 : 880 + (i % 4) * 70;
      expense = 180;
      hours = 8;

      if (i >= 8 && i <= 11) {
        eventLabel = i === 9 ? 'Red Alert Monsoon Waterlogging' : 'Flash Flooding Disruption';
        eventCategory = 'weather';
        gross = 320 + (i % 2) * 80;
        expense = 160;
        hours = 3.5;
      } else if (i === 22) {
        eventLabel = 'Midnight Flash Grocery Rush';
        eventCategory = 'surge';
        gross = 1640;
        expense = 210;
        hours = 9.5;
      }
    } else if (profileId === 'worker-kavita') {
      // Kavita: Freelancer with chunky payouts
      const isPayoutDay = i === 3 || i === 13 || i === 23 || i === 29;
      if (isPayoutDay) {
        gross = 6500 + (i % 2) * 2200;
        expense = 300; // Software subscriptions & broadband
        hours = 7;
        eventLabel = 'Milestone Client Invoice Cleared';
        eventCategory = 'surge';
      } else {
        gross = 0; // Gig days with zero cash disbursement
        expense = 80;
        hours = 6;
      }
    } else {
      // Vikram: New Platform Onboard (only 16 days active)
      if (i < 14) {
        // Not active on platform yet
        gross = 0;
        expense = 0;
        hours = 0;
      } else {
        gross = isWeekend ? 1100 : 850 + (i % 4) * 60;
        expense = 230;
        hours = 7.5;
        if (i === 20) {
          eventLabel = 'Platform Onboarding Bonus';
          eventCategory = 'surge';
          gross = 1400;
        }
      }
    }

    const net = Math.max(0, gross - expense);
    days.push({
      date: dateStr,
      dayOfWeek: dayName,
      grossEarnings: gross,
      workExpenses: expense,
      netEarnings: net,
      hoursWorked: hours,
      eventLabel,
      eventCategory
    });
  }

  return days;
}

export const DEMO_LOAN_OFFERS: LoanOffer[] = [
  {
    id: 'offer-kite-flexi',
    lenderName: 'Kite Microfinance Ltd.',
    lenderType: 'Microfinance Institution',
    minAmount: 10000,
    maxAmount: 35000,
    illustrativeAmount: 25000,
    annualInterestRate: 14.5,
    tenureMonths: 6,
    processingFeePercent: 1.5,
    minWeeklyFloor: 450,
    maxWeeklyCap: 2200,
    flexibleAdjustmentEnabled: true,
    eligibilityScore: 650,
    featureBadge: 'Income-Linked Flexible Weekly EMI',
    description: 'Designed specifically for gig delivery riders. Weekly repayments scale down automatically during low-earning weeks with no penalty.'
  },
  {
    id: 'offer-samriddhi-advance',
    lenderName: 'Samriddhi Capital NBFC',
    lenderType: 'Fintech NBFC',
    minAmount: 5000,
    maxAmount: 20000,
    illustrativeAmount: 15000,
    annualInterestRate: 16.0,
    tenureMonths: 3,
    processingFeePercent: 1.0,
    minWeeklyFloor: 350,
    maxWeeklyCap: 1800,
    flexibleAdjustmentEnabled: true,
    eligibilityScore: 610,
    featureBadge: 'Rapid 1-Hour Disbursement',
    description: 'Short-term emergency cash flow facility for vehicle maintenance, insurance renewals, or festival inventory.'
  },
  {
    id: 'offer-sahayak-ev',
    lenderName: 'Sahayak Small Finance Bank',
    lenderType: 'Small Finance Bank',
    minAmount: 25000,
    maxAmount: 75000,
    illustrativeAmount: 45000,
    annualInterestRate: 13.0,
    tenureMonths: 12,
    processingFeePercent: 2.0,
    minWeeklyFloor: 600,
    maxWeeklyCap: 2800,
    flexibleAdjustmentEnabled: true,
    eligibilityScore: 720,
    featureBadge: 'Green Mobility EV Upgrade Loan',
    description: 'Low-interest structured loan to transition from petrol two-wheelers to commercial high-efficiency electric vehicles.'
  }
];

export const INITIAL_CONSENT_PERMISSIONS: ConsentPermission[] = [
  {
    id: 'perm-earnings',
    code: 'DATA_EARNINGS',
    title: 'Platform Earnings & Trip Records',
    description: 'Aggregates daily gross payouts, trip frequencies, and platform commissions.',
    purpose: 'Calculate rolling earnings baselines and income volatility patterns.',
    dataShared: 'Daily payout figures, delivery timestamps, active shift hours.',
    accessedBy: 'Steady Core Smoothing Engine',
    grantedAt: '2026-09-15 10:30 IST',
    expiresAt: '2027-09-15 10:30 IST',
    isGranted: true,
    isCriticalForLender: true
  },
  {
    id: 'perm-bank-tx',
    code: 'DATA_BANK_TX',
    title: 'Simulated UPI & Bank Feed',
    description: 'Observes inward UPI settlements and utility bill auto-debits.',
    purpose: 'Verify bill payment consistency and expense-to-income margin.',
    dataShared: 'Inward platform settlement credits, utility debits (no balances or third-party transfer details).',
    accessedBy: 'Steady Scoring Engine',
    grantedAt: '2026-09-15 10:32 IST',
    expiresAt: '2027-09-15 10:32 IST',
    isGranted: true,
    isCriticalForLender: false
  },
  {
    id: 'perm-analytics',
    code: 'DATA_ANALYTICS',
    title: 'Auto-Save & Smoothing Calculations',
    description: 'Permits internal mathematical calculation of buffer surplus and safe-to-spend targets.',
    purpose: 'Powers real-time dashboard projections and buffer replenishment rules.',
    dataShared: 'Simulated accounting ledger entries and projected daily targets.',
    accessedBy: 'Steady Client App',
    grantedAt: '2026-09-15 10:30 IST',
    expiresAt: '2027-09-15 10:30 IST',
    isGranted: true,
    isCriticalForLender: false
  },
  {
    id: 'perm-score-gen',
    code: 'SCORE_GENERATE',
    title: 'Explainable Steady Score Generation',
    description: 'Computes multi-factor financial stability score (300–900 scale).',
    purpose: 'Empower worker with self-serve credit readiness insights and actionable tips.',
    dataShared: 'Normalized 5-factor breakdown and historic score trajectory.',
    accessedBy: 'Steady Scoring Module',
    grantedAt: '2026-09-15 10:35 IST',
    expiresAt: '2027-09-15 10:35 IST',
    isGranted: true,
    isCriticalForLender: true
  },
  {
    id: 'perm-share-lenders',
    code: 'SHARE_SCORE_LENDERS',
    title: 'Share Overall Score with Partner Lenders',
    description: 'Allows verified NBFCs and MFIs on Steady to view your score band and confidence rating.',
    purpose: 'Enables preliminary loan pre-qualification without hard credit inquiries.',
    dataShared: 'Steady Score (300-900), score category, and factor strengths.',
    accessedBy: 'Verified Lending Partners (Kite MFI, Samriddhi NBFC, Sahayak SFB)',
    grantedAt: '2026-09-20 14:15 IST',
    expiresAt: '2027-03-20 14:15 IST',
    isGranted: true,
    isCriticalForLender: true
  },
  {
    id: 'perm-share-income',
    code: 'SHARE_INCOME_HISTORY',
    title: 'Share Anonymized 30-Day Income Volatility',
    description: 'Shares granular daily income distributions and baseline stability with underwriting officers.',
    purpose: 'Allows lenders to verify affordability under fluctuating income cycles.',
    dataShared: '30-day anonymized gross and net daily totals, standard deviation, and peak/lean variance.',
    accessedBy: 'Loan Underwriting Officers',
    grantedAt: '2026-09-20 14:15 IST',
    expiresAt: '2027-03-20 14:15 IST',
    isGranted: true,
    isCriticalForLender: true
  },
  {
    id: 'perm-share-repayment',
    code: 'SHARE_REPAYMENT_SIM',
    title: 'Share Flexible-EMI Simulation Model',
    description: 'Provides lenders with your simulated income-linked payment tolerance schedule.',
    purpose: 'Enables custom tailored flexible repayment boundaries (floors and caps).',
    dataShared: 'Projected weekly repayment bandwidth under 5th and 95th percentile earnings weeks.',
    accessedBy: 'Loan Underwriting Officers',
    grantedAt: '2026-09-20 14:16 IST',
    expiresAt: '2027-03-20 14:16 IST',
    isGranted: true,
    isCriticalForLender: false
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    timestamp: '2026-10-22 18:40 IST',
    actor: 'Rahul Sharma (Worker)',
    action: 'SIMULATED',
    detail: 'Ran 30-Day Income Smoothing Simulation with ₹950 target and 25% surplus rate.'
  },
  {
    id: 'audit-2',
    timestamp: '2026-10-22 14:15 IST',
    actor: 'Rahul Sharma (Worker)',
    action: 'GRANTED',
    permissionCode: 'SHARE_SCORE_LENDERS',
    detail: 'Consent granted for 180 days to share Steady Score with verified lending partners.'
  },
  {
    id: 'audit-3',
    timestamp: '2026-10-21 11:20 IST',
    actor: 'Kite MFI Underwriter (Rajesh K.)',
    action: 'REVIEWED',
    detail: 'Inspected applicant profile APPL-RS-1082 following explicit worker consent.'
  },
  {
    id: 'audit-4',
    timestamp: '2026-10-20 09:12 IST',
    actor: 'Rahul Sharma (Worker)',
    action: 'GRANTED',
    permissionCode: 'SHARE_INCOME_HISTORY',
    detail: 'Granted read permission for 30-day income distribution graph to support loan pre-assessment.'
  }
];

export const FAIRNESS_BENCHMARKS: FairnessCase[] = [
  {
    id: 'fairness-monsoon',
    title: 'Monsoon Flooding & Cloudburst Drop',
    category: 'weather',
    workerName: 'Rahul S. & Arjun D.',
    contextDescription: 'Bengaluru and Mumbai experienced heavy rainfall warnings resulting in waterlogged primary delivery corridors and safety app shutdowns.',
    impactOnRawIncome: 'Daily gross earnings plummeted by 62% over 2–4 consecutive days.',
    steadyContextualAdjustment: 'Steady isolates meteorological shock events from core repayment intent. Baseline rolling window excludes storm blackout days from long-term volatility penalties.',
    fairnessSafeguard: 'Weather-induced dips are tagged as external disruptions rather than poor work ethic or behavioral default risk.',
    confidenceImpact: 'Confidence maintained; score penalization paused for verified municipal weather alerts.'
  },
  {
    id: 'fairness-outage',
    title: 'Platform UPI Settlement & App Outage',
    category: 'outage',
    workerName: 'Rahul S.',
    contextDescription: 'Delivery partner gateway experienced 6 hours of unplanned downtime during a Friday dinner shift.',
    impactOnRawIncome: 'Earnings dropped to ₹280 against expected ₹1,200 shift average.',
    steadyContextualAdjustment: 'Outage timestamps synchronized against platform health status APIs. The zero-delivery window is marked as platform unavailability.',
    fairnessSafeguard: 'Lenders see clear contextual outage markers rather than an unexplained mid-month income drought.',
    confidenceImpact: 'Zero adverse impact on consistency rating.'
  },
  {
    id: 'fairness-festival',
    title: 'Diwali Festival Peak Surge',
    category: 'surge',
    workerName: 'All Delivery & Ride Partners',
    contextDescription: 'High shopping and dining demand pushed earnings to 190% of normal daily benchmarks over 3 days.',
    impactOnRawIncome: 'Temporary surge in gross revenue (₹1,800 - ₹2,600/day).',
    steadyContextualAdjustment: 'Auto-save engine channels 25% of windfall into the safety buffer while capping the rolling baseline so the worker is not held to an unrealistic permanent standard.',
    fairnessSafeguard: 'Prevents over-leveraging by not extrapolating festival peaks into permanent credit capacity.',
    confidenceImpact: 'High confidence buffer growth.'
  },
  {
    id: 'fairness-sparse',
    title: 'New Worker with Sparse History (< 30 Days)',
    category: 'personal',
    workerName: 'Vikram Singh',
    contextDescription: 'Newly registered logistics courier with only 14 days of tracked platform deliveries.',
    impactOnRawIncome: 'Insufficient sample size for multi-month trend modeling.',
    steadyContextualAdjustment: 'System explicitly tags profile as "Uncertain (Limited History)" instead of assigning an artificially depressed score.',
    fairnessSafeguard: 'Recommends stepped micro-credit limits (₹5,000) with rapid 30-day reviews rather than outright exclusion.',
    confidenceImpact: 'Low/Uncertain confidence flag displayed transparently to underwriters.'
  }
];

export const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'goal-emergency',
    workerId: 'worker-rahul',
    title: 'Save ₹5,000 for emergency buffer',
    targetAmount: 5000,
    currentAmount: 3400,
    targetDate: '2026-11-15',
    category: 'emergency',
    createdAt: '2026-10-01',
    isCompleted: false
  },
  {
    id: 'goal-bike',
    workerId: 'worker-rahul',
    title: 'EV Battery Servicing & Brake Pads',
    targetAmount: 3500,
    currentAmount: 2200,
    targetDate: '2026-11-08',
    category: 'vehicle',
    createdAt: '2026-10-05',
    isCompleted: false
  },
  {
    id: 'goal-festival',
    workerId: 'worker-rahul',
    title: 'Diwali Gifts & Home Remittance',
    targetAmount: 6000,
    currentAmount: 1800,
    targetDate: '2026-11-20',
    category: 'festival',
    createdAt: '2026-10-10',
    isCompleted: false
  }
];

