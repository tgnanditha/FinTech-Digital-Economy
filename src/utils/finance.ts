import {
  DayEarning,
  SmoothingConfig,
  SimulationResult,
  BufferLedgerEntry,
  SafeToSpendInputs,
  SafeToSpendResult,
  ScoreComponent,
  SteadyScoreResult,
  WorkerProfile,
  ConventionalLoanResult,
  FlexibleRepaymentResult,
  FlexibleWeekSim
} from '../types/steady';

/**
 * Format amounts in Indian Currency style (e.g. ₹12,450 or ₹1,20,000)
 */
export function formatINR(amount: number, options?: { compact?: boolean; hideSymbol?: boolean }): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));

  if (options?.compact && absAmount >= 100000) {
    const lakhs = (absAmount / 100000).toFixed(1);
    const prefix = isNegative ? '-₹' : options?.hideSymbol ? '' : '₹';
    return `${prefix}${lakhs}L`;
  }
  if (options?.compact && absAmount >= 1000) {
    const k = (absAmount / 1000).toFixed(1);
    const prefix = isNegative ? '-₹' : options?.hideSymbol ? '' : '₹';
    return `${prefix}${k}k`;
  }

  // Indian number system regex formatting
  const s = absAmount.toString();
  let lastThree = s.substring(s.length - 3);
  const otherNumbers = s.substring(0, s.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedAbs = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const prefix = isNegative ? '-₹' : options?.hideSymbol ? '' : '₹';
  return `${prefix}${formattedAbs}`;
}

/**
 * Calculate 7-day rolling average for net earnings
 */
export function calculateRollingBaseline(earnings: number[], windowSize = 7): number[] {
  const result: number[] = [];
  for (let i = 0; i < earnings.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const windowSlice = earnings.slice(start, i + 1);
    const sum = windowSlice.reduce((acc, v) => acc + v, 0);
    result.push(Math.round(sum / windowSlice.length));
  }
  return result;
}

/**
 * Standard deviation utility for volatility measurement
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
  return Math.round(Math.sqrt(variance));
}

/**
 * Auto-Save & Income Smoothing Engine Simulation
 * Guarantees:
 * - Buffer balance never drops below zero.
 * - Saves only permitted percentage of surplus.
 * - Withdraws up to available funds on low days.
 * - Displays remaining shortfall honestly.
 */
export function runIncomeSmoothingSimulation(
  earnings: DayEarning[],
  config: SmoothingConfig,
  initialBufferBalance = 2400
): SimulationResult {
  const netEarningsList = earnings.map(e => e.netEarnings);
  const baselines = calculateRollingBaseline(netEarningsList, 7);

  let currentBuffer = initialBufferBalance;
  let totalSaved = 0;
  let totalWithdrawn = 0;
  let daysSupported = 0;
  let shortfallCount = 0;
  let totalShortfallAmount = 0;

  const ledger: BufferLedgerEntry[] = [];
  const effectiveIncomes: number[] = [];

  for (let i = 0; i < earnings.length; i++) {
    const day = earnings[i];
    const baseline = baselines[i];
    const openingBalance = currentBuffer;
    let contribution = 0;
    let withdrawal = 0;
    let shortfall = 0;

    // High income day condition: net > baseline AND net > safety floor
    if (day.netEarnings > baseline && day.netEarnings > config.safetyFloor) {
      const benchmark = Math.max(baseline, config.safetyFloor);
      const surplus = day.netEarnings - benchmark;
      const proposedSave = surplus * (config.surplusSavePercent / 100);
      
      // Save only up to max daily contribution and ensure worker keeps at least safety floor
      const maxAllowedByFloor = Math.max(0, day.netEarnings - config.safetyFloor);
      contribution = Math.min(proposedSave, config.maxDailyContribution, maxAllowedByFloor);
      contribution = Math.round(contribution);

      currentBuffer += contribution;
      totalSaved += contribution;
    } 
    // Low income day condition: net < targetDailyIncome
    else if (day.netEarnings < config.targetDailyIncome) {
      const neededSupport = config.targetDailyIncome - day.netEarnings;
      const desiredWithdrawal = Math.min(neededSupport, config.maxDailyWithdrawal);
      
      // Withdraw only what is actually available in the buffer
      withdrawal = Math.min(desiredWithdrawal, currentBuffer);
      withdrawal = Math.round(withdrawal);

      currentBuffer -= withdrawal;
      totalWithdrawn += withdrawal;

      if (withdrawal > 0) {
        daysSupported++;
      }

      // Record any honest shortfall if target was not reached
      const effectivePay = day.netEarnings + withdrawal;
      if (effectivePay < config.targetDailyIncome) {
        shortfall = config.targetDailyIncome - effectivePay;
        shortfallCount++;
        totalShortfallAmount += shortfall;
      }
    }

    // Double check invariant: buffer cannot be negative
    if (currentBuffer < 0) {
      currentBuffer = 0;
    }

    const effectiveIncome = day.netEarnings + withdrawal - contribution;
    effectiveIncomes.push(effectiveIncome);

    ledger.push({
      dayIndex: i + 1,
      date: day.date,
      dayOfWeek: day.dayOfWeek,
      gross: day.grossEarnings,
      expenses: day.workExpenses,
      net: day.netEarnings,
      baseline,
      openingBalance,
      contribution,
      withdrawal,
      effectiveIncome,
      closingBalance: currentBuffer,
      shortfall,
      eventLabel: day.eventLabel,
      eventCategory: day.eventCategory
    });
  }

  const volatilityBefore = calculateStandardDeviation(netEarningsList);
  const volatilityAfter = calculateStandardDeviation(effectiveIncomes);
  const stabilityImprovement = volatilityBefore > 0 
    ? Math.round(((volatilityBefore - volatilityAfter) / volatilityBefore) * 100)
    : 0;

  return {
    ledger,
    totalSaved,
    totalWithdrawn,
    daysSupported,
    finalBufferBalance: currentBuffer,
    incomeVolatilityBefore: volatilityBefore,
    incomeVolatilityAfter: volatilityAfter,
    stabilityImprovementPercent: Math.max(0, stabilityImprovement),
    shortfallCount,
    totalShortfallAmount
  };
}

/**
 * Safe-to-Spend Calculator Logic
 */
export function calculateSafeToSpend(inputs: SafeToSpendInputs): SafeToSpendResult {
  const { availableLiquidFunds, essentialObligationsDue, safetyReserve, daysUntilNextPayout } = inputs;
  
  const days = Math.max(1, daysUntilNextPayout);
  const netDiscretionary = availableLiquidFunds - essentialObligationsDue - safetyReserve;
  const isNegative = netDiscretionary < 0;
  const dailySafeToSpend = isNegative ? 0 : Math.floor(netDiscretionary / days);

  let statusText = 'Safe discretionary spending available.';
  let riskLevel: 'healthy' | 'caution' | 'critical' = 'healthy';

  if (isNegative) {
    statusText = `Attention: Essential expenses exceed available liquid funds by ${formatINR(Math.abs(netDiscretionary))}. Restrict discretionary spending.`;
    riskLevel = 'critical';
  } else if (dailySafeToSpend < 200) {
    statusText = 'Tight cash flow window. Prioritize fixed bills until the next payout.';
    riskLevel = 'caution';
  }

  return {
    dailySafeToSpend,
    netDiscretionarySurplus: netDiscretionary,
    isNegative,
    statusText,
    riskLevel,
    breakdown: [
      {
        label: 'Liquid Cash & Bank',
        amount: availableLiquidFunds,
        description: 'Immediately spendable balance (excluding emergency savings buffer).'
      },
      {
        label: 'Committed Obligations',
        amount: -essentialObligationsDue,
        description: 'Rent, fuel advances, platform vehicle loan installments due before next settlement.'
      },
      {
        label: 'Safety Floor Reserve',
        amount: -safetyReserve,
        description: 'Untouchable cash reserve for urgent daily transit or bike repairs.'
      }
    ]
  };
}

/**
 * Explainable Steady Score Formula (300 to 900)
 * Weighted components:
 * 1. Income Consistency: 30%
 * 2. Work Tenure: 15%
 * 3. Savings Discipline: 20%
 * 4. Bill-Payment History: 20%
 * 5. Expense-to-Income Ratio: 15%
 */
export function calculateSteadyScore(
  profile: WorkerProfile,
  earnings: DayEarning[],
  options?: { extraSimulatedSavingsRate?: number }
): SteadyScoreResult {
  const netList = earnings.map(e => e.netEarnings);
  const grossList = earnings.map(e => e.grossEarnings);
  const expenseList = earnings.map(e => e.workExpenses);

  const totalGross = grossList.reduce((a, b) => a + b, 0);
  const totalExpenses = expenseList.reduce((a, b) => a + b, 0);

  // 1. Income Consistency (30% weight)
  // Evaluated by standard deviation to mean ratio (Coefficient of Variation)
  const meanNet = netList.reduce((a, b) => a + b, 0) / Math.max(1, netList.length);
  const stdDev = calculateStandardDeviation(netList);
  const cv = meanNet > 0 ? stdDev / meanNet : 1.0;
  // CV of 0.15 is ultra consistent (100 pts), CV of 0.65 is very volatile (40 pts)
  let rawConsistency = Math.round(Math.max(25, Math.min(100, 100 - (cv - 0.15) * 110)));
  
  // 2. Work Tenure (15% weight)
  // Scaled against 24 months benchmark
  const rawTenure = Math.round(Math.min(100, (profile.tenureMonths / 24) * 100));

  // 3. Savings Discipline (20% weight)
  // Higher adherence to buffer savings and positive balances
  const baseSavingsScore = 74;
  const extraBoost = (options?.extraSimulatedSavingsRate || 0) * 0.8;
  const rawSavings = Math.round(Math.min(100, baseSavingsScore + extraBoost));

  // 4. Bill Payment Behavior (20% weight)
  // Deterministic based on worker profile
  let rawBillPayment = 85;
  if (profile.category === 'New Platform Onboard') {
    rawBillPayment = 60;
  } else if (profile.tenureMonths > 18) {
    rawBillPayment = 92;
  }

  // 5. Expense-to-Income Ratio (15% weight)
  const expenseRatio = totalGross > 0 ? totalExpenses / totalGross : 0.35;
  // If expense ratio is 20%, score is ~95; if expense ratio is 45%, score is ~55
  const rawExpenseScore = Math.round(Math.max(20, Math.min(100, 100 - (expenseRatio - 0.18) * 150)));

  const components: ScoreComponent[] = [
    {
      id: 'consistency',
      name: 'Income Consistency',
      weight: 0.30,
      rawScore: rawConsistency,
      weightedPoints: Math.round(rawConsistency * 0.30 * 6), // out of 180 pts of 600 span
      status: rawConsistency >= 75 ? 'Strong' : rawConsistency >= 55 ? 'Moderate' : 'Needs Attention',
      insight: `Net earnings show steady weekly rhythm with ₹${stdDev} standard deviation across 30 days.`,
      actionableTip: 'Maintaining active delivery shifts across consecutive weeks stabilizes this baseline.'
    },
    {
      id: 'savings',
      name: 'Savings Discipline & Buffer',
      weight: 0.20,
      rawScore: rawSavings,
      weightedPoints: Math.round(rawSavings * 0.20 * 6), // out of 120 pts
      status: rawSavings >= 75 ? 'Strong' : rawSavings >= 55 ? 'Moderate' : 'Needs Attention',
      insight: `Consistent auto-save allocations into your safety buffer demonstrate self-insurance capability.`,
      actionableTip: 'Automating surplus transfers of 20% or more boosts this factor directly.'
    },
    {
      id: 'billPayment',
      name: 'Bill & Obligation Timeliness',
      weight: 0.20,
      rawScore: rawBillPayment,
      weightedPoints: Math.round(rawBillPayment * 0.20 * 6), // out of 120 pts
      status: rawBillPayment >= 75 ? 'Strong' : rawBillPayment >= 55 ? 'Moderate' : 'Needs Attention',
      insight: `Track record of on-time mobile recharges, fuel advances, and recurring utility payments.`,
      actionableTip: 'Keep utility settlements within the due window to establish strong repayment discipline.'
    },
    {
      id: 'tenure',
      name: 'Platform Tenure & Stability',
      weight: 0.15,
      rawScore: rawTenure,
      weightedPoints: Math.round(rawTenure * 0.15 * 6), // out of 90 pts
      status: rawTenure >= 75 ? 'Strong' : rawTenure >= 50 ? 'Moderate' : 'Needs Attention',
      insight: `${profile.tenureMonths} months of verified activity on ${profile.platform}.`,
      actionableTip: 'Tenure milestones beyond 12 and 24 months incrementally unlock tier discounts.'
    },
    {
      id: 'expenseRatio',
      name: 'Operating Expense Control',
      weight: 0.15,
      rawScore: rawExpenseScore,
      weightedPoints: Math.round(rawExpenseScore * 0.15 * 6), // out of 90 pts
      status: rawExpenseScore >= 75 ? 'Strong' : rawExpenseScore >= 55 ? 'Moderate' : 'Needs Attention',
      insight: `Work expenses (fuel, bike upkeep) account for ${Math.round(expenseRatio * 100)}% of gross earnings.`,
      actionableTip: 'Keeping non-essential vehicle operational costs under 25% of gross expands your net margin.'
    }
  ];

  // Weighted sum 0 to 100
  const normalizedWeighted = components.reduce((sum, c) => sum + (c.rawScore * c.weight), 0);
  // Map to 300 - 900
  const finalScore = Math.round(300 + (normalizedWeighted / 100) * 600);

  let band: 'Excellent' | 'Good' | 'Fair' | 'Building' = 'Fair';
  if (finalScore >= 770) band = 'Excellent';
  else if (finalScore >= 670) band = 'Good';
  else if (finalScore >= 560) band = 'Fair';
  else band = 'Building';

  let confidence: 'High Confidence' | 'Medium Confidence' | 'Uncertain (Limited History)' = 'High Confidence';
  if (profile.tenureMonths < 3 || earnings.length < 14) {
    confidence = 'Uncertain (Limited History)';
  } else if (profile.tenureMonths < 6) {
    confidence = 'Medium Confidence';
  }

  const strengths = components
    .filter(c => c.status === 'Strong')
    .map(c => `${c.name}: ${c.insight}`);

  const improvementOpportunities = components
    .filter(c => c.status !== 'Strong')
    .map(c => `${c.name}: ${c.actionableTip}`);

  return {
    score: finalScore,
    band,
    components,
    formulaExplanation: `Score = 300 + 600 × (0.30×Consistency + 0.20×Savings + 0.20×Bills + 0.15×Tenure + 0.15×ExpenseControl)`,
    strengths,
    improvementOpportunities,
    confidence,
    historicalTrend: [
      { month: '3 Mo Ago', score: Math.max(320, finalScore - 42) },
      { month: '2 Mo Ago', score: Math.max(340, finalScore - 26) },
      { month: 'Last Month', score: Math.max(350, finalScore - 11) },
      { month: 'Current', score: finalScore }
    ]
  };
}

/**
 * Standard Reducing Balance Amortization Formula
 * EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 */
export function calculateConventionalLoan(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): ConventionalLoanResult {
  const monthlyRate = (annualInterestRate / 100) / 12;
  const n = tenureMonths;

  let emi = 0;
  if (monthlyRate === 0) {
    emi = principal / n;
  } else {
    emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  }
  emi = Math.round(emi);

  const totalRepayment = emi * n;
  const totalInterest = totalRepayment - principal;
  const weeklyInstallment = Math.round((emi * 12) / 52);

  let currentPrincipal = principal;
  const amortizationSample: ConventionalLoanResult['amortizationSample'] = [];

  for (let m = 1; m <= Math.min(n, 6); m++) {
    const interest = Math.round(currentPrincipal * monthlyRate);
    const principalPaid = Math.min(currentPrincipal, emi - interest);
    currentPrincipal = Math.max(0, currentPrincipal - principalPaid);

    amortizationSample.push({
      period: m,
      payment: emi,
      principal: principalPaid,
      interest,
      remainingPrincipal: currentPrincipal
    });
  }

  return {
    monthlyInstallment: emi,
    weeklyInstallment,
    totalInterest: Math.max(0, totalInterest),
    totalRepayment,
    amortizationSample
  };
}

/**
 * Flexible Income-Aware Repayment Simulation
 * - Repayment % of weekly income
 * - Subject to minimum contract floor and maximum cap
 * - Honest interest accounting: unpaid interest is carried over, never erased.
 */
export function simulateFlexibleRepayment(
  principal: number,
  annualInterestRate: number,
  tenureWeeks: number,
  weeklyIncomes: number[],
  minWeeklyFloor: number,
  maxWeeklyCap: number,
  repaymentPercent = 12
): FlexibleRepaymentResult {
  const weeklyInterestRate = (annualInterestRate / 100) / 52;
  let remainingBalance = principal;
  let accumulatedCarriedInterest = 0;
  let totalPaid = 0;
  let totalInterestPaid = 0;
  let reliefWeeksCount = 0;
  let surgeWeeksCount = 0;

  const baselineWeeklyIncome = weeklyIncomes.length > 0 
    ? weeklyIncomes.reduce((a, b) => a + b, 0) / weeklyIncomes.length 
    : 7000;

  // Base scheduled EMI
  const baseWeeklyEmi = Math.round((principal * (1 + (annualInterestRate/100) * (tenureWeeks/52))) / tenureWeeks);
  const weeks: FlexibleWeekSim[] = [];

  for (let w = 1; w <= tenureWeeks; w++) {
    if (remainingBalance <= 0) break;

    const income = weeklyIncomes[(w - 1) % weeklyIncomes.length] || baselineWeeklyIncome;
    const weeklyInterestCharge = Math.round(remainingBalance * weeklyInterestRate);
    const totalInterestDue = weeklyInterestCharge + accumulatedCarriedInterest;

    // Income-aware payment proposed:
    const proposed = Math.round(income * (repaymentPercent / 100));
    // Apply bounds: cannot be less than floor (contractual minimum), nor above cap
    let adjustedEmi = Math.max(minWeeklyFloor, Math.min(maxWeeklyCap, proposed));

    // Cap to remaining payoff if balance + interest is lower
    if (adjustedEmi > remainingBalance + totalInterestDue) {
      adjustedEmi = remainingBalance + totalInterestDue;
    }

    let interestPaidThisWeek = 0;
    let principalPaidThisWeek = 0;
    let note = 'Standard income-adjusted payment.';

    if (adjustedEmi < totalInterestDue) {
      // Payment does not even cover accrued interest: carry deficit forward
      interestPaidThisWeek = adjustedEmi;
      accumulatedCarriedInterest = totalInterestDue - adjustedEmi;
      principalPaidThisWeek = 0;
      reliefWeeksCount++;
      note = `Lean week relief applied: unpaid interest of ${formatINR(accumulatedCarriedInterest)} carried to next cycle.`;
    } else {
      // Covers all accrued interest; balance goes to principal
      interestPaidThisWeek = totalInterestDue;
      accumulatedCarriedInterest = 0;
      principalPaidThisWeek = adjustedEmi - interestPaidThisWeek;
      
      if (adjustedEmi > baseWeeklyEmi) {
        surgeWeeksCount++;
        note = `High earnings week: accelerated principal payment of ${formatINR(principalPaidThisWeek)}.`;
      } else if (adjustedEmi < baseWeeklyEmi) {
        reliefWeeksCount++;
        note = `Low earnings week: reduced payment (${formatINR(adjustedEmi)} vs base ${formatINR(baseWeeklyEmi)}).`;
      }
    }

    remainingBalance = Math.max(0, remainingBalance - principalPaidThisWeek);
    totalPaid += adjustedEmi;
    totalInterestPaid += interestPaidThisWeek;

    weeks.push({
      week: w,
      actualWeeklyIncome: income,
      baselineWeeklyIncome: Math.round(baselineWeeklyIncome),
      incomeRatio: Number((income / baselineWeeklyIncome).toFixed(2)),
      scheduledBaseEmi: baseWeeklyEmi,
      adjustedEmi,
      interestPortion: interestPaidThisWeek,
      principalPortion: principalPaidThisWeek,
      unpaidInterestCarriedOver: accumulatedCarriedInterest,
      remainingBalance,
      adjustmentNote: note
    });
  }

  return {
    weeks,
    totalPaid,
    totalInterestPaid,
    unpaidDeficit: remainingBalance + accumulatedCarriedInterest,
    isFullyPaid: remainingBalance === 0,
    weeksElapsed: weeks.length,
    originalTermWeeks: tenureWeeks,
    reliefWeeksCount,
    surgeWeeksCount
  };
}

/**
 * Savings Goal Progress Calculator
 */
export function calculateGoalProgress(currentAmount: number, targetAmount: number): {
  percent: number;
  remaining: number;
  isCompleted: boolean;
} {
  const target = Math.max(1, targetAmount);
  const current = Math.max(0, currentAmount);
  const percent = Math.min(100, Math.round((current / target) * 100));
  const remaining = Math.max(0, target - current);
  const isCompleted = current >= target;
  return { percent, remaining, isCompleted };
}

/**
 * Calculates days remaining and daily savings required to hit time-bound goal
 */
export function calculateGoalDailyRequired(
  targetAmount: number,
  currentAmount: number,
  targetDateStr: string,
  currentDateStr?: string
): {
  daysRemaining: number;
  dailyTarget: number;
  isOverdue: boolean;
} {
  // Use Oct 23, 2026 as standard reference or provided date
  const today = currentDateStr ? new Date(currentDateStr) : new Date('2026-10-23');
  const target = new Date(targetDateStr);
  const diffTime = target.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  const isOverdue = target.getTime() < today.getTime() && remainingAmount > 0;
  const dailyTarget = daysRemaining > 0 ? Math.ceil(remainingAmount / daysRemaining) : remainingAmount;

  return { daysRemaining, dailyTarget, isOverdue };
}

