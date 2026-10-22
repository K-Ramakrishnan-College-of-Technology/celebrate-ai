import { CelebrationEvent, BudgetItem, BudgetCategory, TimelineMilestone, GuestItem } from '../types/planner';

/**
 * Calculates budget summary metrics for an event.
 */
export function calculateBudgetMetrics(
  totalBudget: number,
  categories: BudgetCategory[],
  items: BudgetItem[]
) {
  const safeTotalBudget = Math.max(0, totalBudget || 0);
  const totalAllocated = categories.reduce((sum, c) => sum + (c.targetAmount || 0), 0);
  const totalEstimated = items.reduce((sum, i) => sum + (i.estimatedCost || 0), 0);
  const totalActual = items.reduce((sum, i) => sum + (i.actualCost ?? i.estimatedCost ?? 0), 0);
  const totalPaid = items.filter((i) => i.paid).reduce((sum, i) => sum + (i.actualCost ?? i.estimatedCost ?? 0), 0);
  const remainingBudget = safeTotalBudget - totalActual;
  const isOverBudget = totalActual > safeTotalBudget;
  const budgetUtilizationPercent = safeTotalBudget > 0 ? Math.min(100, Math.round((totalActual / safeTotalBudget) * 100)) : 0;

  return {
    totalBudget: safeTotalBudget,
    totalAllocated,
    totalEstimated,
    totalActual,
    totalPaid,
    unpaidInvoices: totalActual - totalPaid,
    remainingBudget,
    isOverBudget,
    budgetUtilizationPercent,
  };
}

/**
 * Calculates timeline metrics including buffers and completion counts.
 */
export function calculateTimelineMetrics(milestones: TimelineMilestone[]) {
  const totalMilestones = milestones.length;
  const completedCount = milestones.filter((m) => m.completed).length;
  const totalBufferMinutes = milestones.reduce((sum, m) => sum + (m.bufferMinutes || 0), 0);
  const percentComplete = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

  return {
    totalMilestones,
    completedCount,
    pendingCount: totalMilestones - completedCount,
    totalBufferMinutes,
    percentComplete,
  };
}

/**
 * Aggregates catering dietary restriction counts from the guest list.
 */
export function aggregateDietaryCounts(guests: GuestItem[]): Record<string, number> {
  const counts: Record<string, number> = {};

  guests.forEach((g) => {
    if (g.rsvpStatus === 'Attending' && g.dietaryRestrictions && g.dietaryRestrictions.trim().toLowerCase() !== 'none') {
      const items = g.dietaryRestrictions.split(',').map((d) => d.trim());
      items.forEach((item) => {
        if (item) {
          const capitalized = item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
          counts[capitalized] = (counts[capitalized] || 0) + (g.plusOne ? 2 : 1);
        }
      });
    }
  });

  return counts;
}

/**
 * Computes calendar countdown days from today to the celebration date.
 */
export function calculateCountdownDays(targetDateStr: string, currentDate = new Date()): number {
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Validates celebration plan creation inputs.
 */
export function validatePlanInputs(params: {
  title?: string;
  guestCount?: number;
  budget?: number;
  eventType?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!params.title || params.title.trim().length === 0) {
    errors.push('Celebration title is required.');
  }
  if (!params.guestCount || params.guestCount < 1 || params.guestCount > 100000) {
    errors.push('Guest count must be between 1 and 100,000.');
  }
  if (!params.budget || params.budget < 0 || params.budget > 50000000) {
    errors.push('Budget must be a realistic positive amount.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
