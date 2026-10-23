import React, { useState } from 'react';
import { useSteady } from '../../context/SteadyContext';
import { SavingsGoal, GoalCategory } from '../../types/steady';
import { formatINR, calculateGoalProgress, calculateGoalDailyRequired } from '../../utils/finance';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Heart,
  Gift,
  Shield,
  Trash2,
  TrendingUp,
  X,
  Coins
} from 'lucide-react';

const CATEGORY_CONFIG: Record<GoalCategory, { label: string; icon: React.FC<{ className?: string }> }> = {
  emergency: { label: 'Emergency Fund', icon: Shield },
  vehicle: { label: 'Vehicle & Servicing', icon: Wrench },
  family: { label: 'Family & Home', icon: Heart },
  festival: { label: 'Festival & Remittance', icon: Gift },
  tools: { label: 'Work Tools & Tech', icon: Target },
  education: { label: 'Skills & Learning', icon: Target }
};

export const FinancialGoals: React.FC = () => {
  const { goals, addGoal, contributeToGoal, deleteGoal, activeWorker } = useSteady();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState<number | ''>(5000);
  const [newInitial, setNewInitial] = useState<number | ''>(500);
  const [newTargetDate, setNewTargetDate] = useState('2026-11-25');
  const [newCategory, setNewCategory] = useState<GoalCategory>('emergency');
  const [formError, setFormError] = useState<string | null>(null);

  // Quick contribute custom dialog
  const [contributeModalGoalId, setContributeModalGoalId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<number | ''>(250);

  // Filter goals for active worker
  const workerGoals = goals.filter(g => g.workerId === activeWorker.id);

  // Summary figures
  const totalTarget = workerGoals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = workerGoals.reduce((s, g) => s + g.currentAmount, 0);
  const completedCount = workerGoals.filter(g => g.currentAmount >= g.targetAmount).length;
  const overallPercent = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Please enter a goal title.');
      return;
    }
    if (!newTarget || newTarget <= 0) {
      setFormError('Please enter a target amount greater than ₹0.');
      return;
    }
    if (!newTargetDate) {
      setFormError('Please specify a target completion date.');
      return;
    }

    addGoal({
      workerId: activeWorker.id,
      title: newTitle.trim(),
      targetAmount: Number(newTarget),
      currentAmount: Number(newInitial || 0),
      targetDate: newTargetDate,
      category: newCategory
    });

    // Reset & close
    setNewTitle('');
    setNewTarget(5000);
    setNewInitial(500);
    setNewTargetDate('2026-11-25');
    setNewCategory('emergency');
    setFormError(null);
    setIsModalOpen(false);
  };

  const handleCustomContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeModalGoalId || !customAmount || customAmount <= 0) return;
    contributeToGoal(contributeModalGoalId, Number(customAmount));
    setContributeModalGoalId(null);
    setCustomAmount(250);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-5">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-forest-surface text-forest flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-forest" />
            </div>
            <h2 className="text-base font-bold text-charcoal">
              Time-Bound Financial Goals
            </h2>
          </div>
          <p className="text-xs text-charcoal-muted mt-1">
            Track small milestones for emergency reserves, vehicle repairs, and festival remittances with daily pacing.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-charcoal bg-mint hover:bg-mint-light rounded-lg transition-colors shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Metric Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-forest-surface rounded-lg border border-forest/15 text-xs">
        <div>
          <span className="text-charcoal-muted block text-[11px]">Total Goals Target</span>
          <span className="font-mono tabular-nums font-bold text-charcoal text-sm">
            {formatINR(totalTarget)}
          </span>
        </div>
        <div>
          <span className="text-charcoal-muted block text-[11px]">Saved Across Goals</span>
          <span className="font-mono tabular-nums font-bold text-forest text-sm">
            {formatINR(totalSaved)}
          </span>
        </div>
        <div>
          <span className="text-charcoal-muted block text-[11px]">Overall Progress</span>
          <span className="font-mono tabular-nums font-bold text-forest text-sm">
            {overallPercent}%
          </span>
        </div>
        <div>
          <span className="text-charcoal-muted block text-[11px]">Milestones Achieved</span>
          <span className="font-mono tabular-nums font-bold text-charcoal text-sm">
            {completedCount} / {workerGoals.length}
          </span>
        </div>
      </div>

      {/* Goals List with Progress Bars */}
      {workerGoals.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-neutral-200 rounded-lg space-y-2">
          <Target className="w-8 h-8 text-neutral-300 mx-auto" />
          <div className="text-xs font-semibold text-charcoal">No Active Savings Goals</div>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
            Create small, achievable goals (like saving ₹5,000 for emergency buffer) to track your progress and build financial discipline.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 px-3 py-1.5 text-xs font-bold text-forest bg-forest-surface hover:bg-forest/10 rounded-lg cursor-pointer"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {workerGoals.map((goal) => {
            const { percent, remaining, isCompleted } = calculateGoalProgress(goal.currentAmount, goal.targetAmount);
            const { daysRemaining, dailyTarget, isOverdue } = calculateGoalDailyRequired(
              goal.targetAmount,
              goal.currentAmount,
              goal.targetDate,
              '2026-10-23'
            );
            const CategoryIcon = CATEGORY_CONFIG[goal.category]?.icon || Target;

            return (
              <div
                key={goal.id}
                className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-white hover:border-forest/30 transition-all space-y-3"
              >
                {/* Top Row: Category Icon, Title, Status & Delete */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isCompleted ? 'bg-mint text-forest' : 'bg-white border border-neutral-200 text-charcoal-muted'
                    }`}>
                      <CategoryIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-charcoal leading-snug">{goal.title}</h3>
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-forest bg-mint-light px-2 py-0.5 rounded border border-forest/20">
                            <CheckCircle2 className="w-3 h-3 text-forest" /> Completed
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-charcoal-muted flex flex-wrap items-center gap-2 mt-0.5">
                        <span>{CATEGORY_CONFIG[goal.category]?.label}</span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-charcoal-muted" /> Target Date: {goal.targetDate}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className={isOverdue ? 'text-amber-800 font-semibold' : 'text-charcoal-muted'}>
                          {isCompleted
                            ? 'Goal Achieved!'
                            : daysRemaining === 0
                            ? 'Due today'
                            : `${daysRemaining} days remaining`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-neutral-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                    title="Delete goal"
                    aria-label={`Delete ${goal.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress Bar with Numbers */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-sans text-charcoal font-medium">
                      Progress: <strong className="text-forest font-mono tabular-nums">{formatINR(goal.currentAmount)}</strong> of {formatINR(goal.targetAmount)}
                    </span>
                    <span className="font-bold text-forest tabular-nums">{percent}%</span>
                  </div>

                  {/* Accessible Visual Progress Bar */}
                  <div
                    className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${goal.title} completion progress`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        isCompleted ? 'bg-mint-dark' : 'bg-forest'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Row: Pace required & Quick Add Contributions */}
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-[11px] text-charcoal-muted">
                    {!isCompleted ? (
                      <span>
                        Remaining: <strong className="text-charcoal font-mono tabular-nums">{formatINR(remaining)}</strong> · Need <strong className="text-forest font-mono tabular-nums">~{formatINR(dailyTarget)}/day</strong> to reach on time
                      </span>
                    ) : (
                      <span className="text-forest font-semibold">
                        Target complete! Funds safely reserved in your emergency buffer.
                      </span>
                    )}
                  </div>

                  {/* Interactive Quick Add Buttons */}
                  {!isCompleted && (
                    <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                      <span className="text-[11px] text-charcoal-muted mr-1">Quick save:</span>
                      <button
                        onClick={() => contributeToGoal(goal.id, 100)}
                        className="px-2 py-0.5 text-[11px] font-semibold text-charcoal bg-white border border-neutral-200 hover:border-forest hover:bg-forest-surface rounded transition-colors cursor-pointer"
                        title="Add ₹100 from surplus"
                      >
                        +₹100
                      </button>
                      <button
                        onClick={() => contributeToGoal(goal.id, 500)}
                        className="px-2 py-0.5 text-[11px] font-semibold text-charcoal bg-white border border-neutral-200 hover:border-forest hover:bg-forest-surface rounded transition-colors cursor-pointer"
                        title="Add ₹500 from surplus"
                      >
                        +₹500
                      </button>
                      <button
                        onClick={() => setContributeModalGoalId(goal.id)}
                        className="px-2 py-0.5 text-[11px] font-semibold text-forest bg-forest-surface border border-forest/20 hover:bg-forest/10 rounded transition-colors cursor-pointer"
                        title="Add custom amount"
                      >
                        Custom +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create New Goal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-forest" />
                <h3 className="text-base font-bold text-charcoal">Create Time-Bound Goal</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-charcoal cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
              <div>
                <label htmlFor="goal-title-input" className="block font-semibold text-charcoal mb-1">
                  Goal Title
                </label>
                <input
                  id="goal-title-input"
                  type="text"
                  placeholder="e.g., Save ₹5,000 for emergency buffer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-charcoal focus:outline-none focus:ring-1 focus:ring-forest focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="goal-target-input" className="block font-semibold text-charcoal mb-1">
                    Target Amount (₹)
                  </label>
                  <input
                    id="goal-target-input"
                    type="number"
                    step={100}
                    min={100}
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 font-mono font-bold text-charcoal focus:outline-none focus:ring-1 focus:ring-forest focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="goal-initial-input" className="block font-semibold text-charcoal mb-1">
                    Initial Saved (₹)
                  </label>
                  <input
                    id="goal-initial-input"
                    type="number"
                    step={100}
                    min={0}
                    value={newInitial}
                    onChange={(e) => setNewInitial(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 font-mono text-charcoal focus:outline-none focus:ring-1 focus:ring-forest focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="goal-date-input" className="block font-semibold text-charcoal mb-1">
                    Target Completion Date
                  </label>
                  <input
                    id="goal-date-input"
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-charcoal focus:outline-none focus:ring-1 focus:ring-forest focus:bg-white cursor-pointer"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="goal-cat-select" className="block font-semibold text-charcoal mb-1">
                    Category
                  </label>
                  <select
                    id="goal-cat-select"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as GoalCategory)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-charcoal focus:outline-none focus:ring-1 focus:ring-forest focus:bg-white cursor-pointer"
                  >
                    <option value="emergency">Emergency Fund</option>
                    <option value="vehicle">Vehicle & Servicing</option>
                    <option value="family">Family & Home</option>
                    <option value="festival">Festival & Remittance</option>
                    <option value="tools">Work Tools & Tech</option>
                    <option value="education">Skills & Learning</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-charcoal-muted hover:text-charcoal cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-charcoal bg-mint hover:bg-mint-light rounded-lg transition-colors cursor-pointer"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Custom Contribution Amount */}
      {contributeModalGoalId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-forest" />
                <h3 className="text-sm font-bold text-charcoal">Add Savings to Goal</h3>
              </div>
              <button
                onClick={() => setContributeModalGoalId(null)}
                className="text-neutral-400 hover:text-charcoal cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomContribute} className="space-y-3 text-xs">
              <div>
                <label htmlFor="custom-amount-input" className="block font-semibold text-charcoal mb-1">
                  Deposit Amount from Daily Surplus (₹)
                </label>
                <input
                  id="custom-amount-input"
                  type="number"
                  step={50}
                  min={50}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 font-mono font-bold text-charcoal focus:outline-none focus:ring-1 focus:ring-forest focus:bg-white"
                  required
                  autoFocus
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setContributeModalGoalId(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-charcoal-muted hover:text-charcoal cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-forest hover:bg-forest-dark rounded-lg transition-colors cursor-pointer"
                >
                  Add Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
