import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatINR,
  calculateRollingBaseline,
  runIncomeSmoothingSimulation,
  calculateSafeToSpend,
  calculateSteadyScore,
  calculateConventionalLoan,
  simulateFlexibleRepayment,
  calculateGoalProgress,
  calculateGoalDailyRequired
} from './finance';
import { DayEarning, SmoothingConfig, WorkerProfile } from '../types/steady';

test('formatINR formats currency in standard Indian format', () => {
  assert.equal(formatINR(12450), '₹12,450');
  assert.equal(formatINR(100000), '₹1,00,000');
  assert.equal(formatINR(0), '₹0');
  assert.equal(formatINR(-450), '-₹450');
  assert.equal(formatINR(12500, { compact: true }), '₹12.5k');
});

test('calculateRollingBaseline calculates moving averages correctly', () => {
  const earnings = [1000, 1000, 1000, 1000, 1000, 1000, 1000];
  const baselines = calculateRollingBaseline(earnings, 7);
  assert.equal(baselines.length, 7);
  assert.equal(baselines[6], 1000);
});

test('runIncomeSmoothingSimulation maintains invariant: buffer never drops below 0', () => {
  const sampleEarnings: DayEarning[] = [
    { date: '2026-10-01', dayOfWeek: 'Mon', grossEarnings: 1500, workExpenses: 300, netEarnings: 1200, hoursWorked: 9 },
    { date: '2026-10-02', dayOfWeek: 'Tue', grossEarnings: 500, workExpenses: 200, netEarnings: 300, hoursWorked: 4 },
    { date: '2026-10-03', dayOfWeek: 'Wed', grossEarnings: 300, workExpenses: 250, netEarnings: 50, hoursWorked: 3, eventLabel: 'Heavy Rain' },
    { date: '2026-10-04', dayOfWeek: 'Thu', grossEarnings: 1800, workExpenses: 350, netEarnings: 1450, hoursWorked: 10, eventLabel: 'Festive Surge' }
  ];

  const config: SmoothingConfig = {
    targetDailyIncome: 950,
    surplusSavePercent: 25,
    safetyFloor: 500,
    maxDailyContribution: 400,
    maxDailyWithdrawal: 450
  };

  const simResult = runIncomeSmoothingSimulation(sampleEarnings, config, 200);

  // Invariant verification: every day's closing balance must be >= 0
  for (const entry of simResult.ledger) {
    assert.ok(entry.closingBalance >= 0, `Closing balance on day ${entry.dayIndex} must be non-negative`);
    assert.ok(entry.effectiveIncome >= entry.net - entry.contribution, 'Effective income calculation consistency');
  }

  assert.ok(simResult.totalSaved >= 0);
  assert.ok(simResult.totalWithdrawn >= 0);
  assert.ok(simResult.finalBufferBalance >= 0);
});

test('calculateSafeToSpend correctly computes daily spendable and warns on deficit', () => {
  const healthy = calculateSafeToSpend({
    availableLiquidFunds: 6000,
    essentialObligationsDue: 2500,
    safetyReserve: 1500,
    daysUntilNextPayout: 4
  });

  assert.equal(healthy.netDiscretionarySurplus, 2000);
  assert.equal(healthy.dailySafeToSpend, 500); // 2000 / 4
  assert.equal(healthy.isNegative, false);
  assert.equal(healthy.riskLevel, 'healthy');

  const deficit = calculateSafeToSpend({
    availableLiquidFunds: 2000,
    essentialObligationsDue: 3500,
    safetyReserve: 1000,
    daysUntilNextPayout: 3
  });

  assert.equal(deficit.isNegative, true);
  assert.equal(deficit.dailySafeToSpend, 0);
  assert.equal(deficit.riskLevel, 'critical');
});

test('calculateSteadyScore produces explainable score in [300, 900] range with sum of weights = 1', () => {
  const mockProfile: WorkerProfile = {
    id: 'worker-1',
    name: 'Rahul Sharma',
    pseudonym: 'Rahul S.',
    category: 'Food Delivery Partner',
    platform: 'Swiggy & Zomato',
    tenureMonths: 18,
    city: 'Bengaluru',
    initials: 'RS',
    vehicleType: 'EV 2-Wheeler',
    rating: 4.88,
    summary: 'Reliable full-time food delivery rider with consistent evening shift patterns.'
  };

  const sampleDays: DayEarning[] = Array.from({ length: 30 }, (_, i) => ({
    date: `2026-10-${(i + 1).toString().padStart(2, '0')}`,
    dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i % 7],
    grossEarnings: 1100 + (i % 5) * 120,
    workExpenses: 220 + (i % 3) * 30,
    netEarnings: 880 + (i % 5) * 90,
    hoursWorked: 8
  }));

  const result = calculateSteadyScore(mockProfile, sampleDays);

  assert.ok(result.score >= 300 && result.score <= 900, `Score ${result.score} must be between 300 and 900`);
  
  const totalWeight = result.components.reduce((sum, c) => sum + c.weight, 0);
  assert.ok(Math.abs(totalWeight - 1.0) < 0.001, 'Component weights must sum to 1.0');
  assert.equal(result.components.length, 5);
  assert.ok(result.strengths.length > 0);
});

test('calculateConventionalLoan computes accurate reducing-balance amortized EMI', () => {
  const result = calculateConventionalLoan(20000, 15, 6);
  assert.ok(result.monthlyInstallment > 3300 && result.monthlyInstallment < 3600);
  assert.ok(result.totalRepayment > 20000);
  assert.ok(result.totalInterest > 0);
  assert.equal(result.amortizationSample.length, 6);
  assert.ok(result.amortizationSample[5].remainingPrincipal <= 100);
});

test('simulateFlexibleRepayment accommodates lean weeks and carries interest without dropping debt', () => {
  const weeklyIncomes = [8000, 3500, 9500, 4000, 10000, 8500]; // includes lean and high weeks
  const sim = simulateFlexibleRepayment(
    15000,
    14,
    12,
    weeklyIncomes,
    500,  // min weekly floor
    2500, // max weekly cap
    15    // 15% of income
  );

  assert.ok(sim.weeks.length > 0);
  assert.ok(sim.totalPaid > 0);
  for (const week of sim.weeks) {
    assert.ok(week.adjustedEmi >= 500, 'Adjusted EMI should not fall below floor');
    assert.ok(week.adjustedEmi <= 2500, 'Adjusted EMI should not exceed cap');
  }
});

test('calculateGoalProgress computes percentage and remaining deficit correctly', () => {
  const partial = calculateGoalProgress(3500, 5000);
  assert.equal(partial.percent, 70);
  assert.equal(partial.remaining, 1500);
  assert.equal(partial.isCompleted, false);

  const completed = calculateGoalProgress(5000, 5000);
  assert.equal(completed.percent, 100);
  assert.equal(completed.remaining, 0);
  assert.equal(completed.isCompleted, true);

  const overachieved = calculateGoalProgress(6000, 5000);
  assert.equal(overachieved.percent, 100);
  assert.equal(overachieved.remaining, 0);
  assert.equal(overachieved.isCompleted, true);
});

test('calculateGoalDailyRequired estimates accurate daily pace', () => {
  const result = calculateGoalDailyRequired(5000, 3000, '2026-11-02', '2026-10-23');
  assert.equal(result.daysRemaining, 10);
  assert.equal(result.dailyTarget, 200); // 2000 / 10 days
  assert.equal(result.isOverdue, false);
});

