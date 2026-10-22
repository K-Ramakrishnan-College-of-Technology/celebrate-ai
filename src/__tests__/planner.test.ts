import { describe, it, expect } from 'vitest';
import {
  calculateBudgetMetrics,
  calculateTimelineMetrics,
  aggregateDietaryCounts,
  calculateCountdownDays,
  validatePlanInputs,
} from '../utils/plannerCalculations';
import { BudgetCategory, BudgetItem, TimelineMilestone, GuestItem } from '../types/planner';

describe('Planner Calculations & Budget Metrics', () => {
  it('correctly calculates total allocated, spent, paid, and remaining budget', () => {
    const categories: BudgetCategory[] = [
      { category: 'Venue', percentage: 40, targetAmount: 4000, tips: '', essential: true },
      { category: 'Catering', percentage: 40, targetAmount: 4000, tips: '', essential: true },
      { category: 'Music', percentage: 20, targetAmount: 2000, tips: '', essential: false },
    ];

    const items: BudgetItem[] = [
      { id: '1', category: 'Venue', name: 'Hall Fee', estimatedCost: 3500, actualCost: 3800, paid: true },
      { id: '2', category: 'Catering', name: 'Dinner Buffet', estimatedCost: 4000, actualCost: 4200, paid: false },
      { id: '3', category: 'Music', name: 'DJ Sound', estimatedCost: 1800, actualCost: 1800, paid: true },
    ];

    const metrics = calculateBudgetMetrics(10000, categories, items);

    expect(metrics.totalBudget).toBe(10000);
    expect(metrics.totalAllocated).toBe(10000);
    expect(metrics.totalEstimated).toBe(9300);
    expect(metrics.totalActual).toBe(9800);
    expect(metrics.totalPaid).toBe(5600); // 3800 + 1800
    expect(metrics.unpaidInvoices).toBe(4200);
    expect(metrics.remainingBudget).toBe(200);
    expect(metrics.isOverBudget).toBe(false);
    expect(metrics.budgetUtilizationPercent).toBe(98);
  });

  it('detects when actual spend exceeds target budget ceiling', () => {
    const categories: BudgetCategory[] = [
      { category: 'General', percentage: 100, targetAmount: 5000, tips: '', essential: true },
    ];
    const items: BudgetItem[] = [
      { id: '1', category: 'General', name: 'Excess Item', estimatedCost: 4000, actualCost: 6500, paid: false },
    ];

    const metrics = calculateBudgetMetrics(5000, categories, items);
    expect(metrics.isOverBudget).toBe(true);
    expect(metrics.remainingBudget).toBe(-1500);
    expect(metrics.budgetUtilizationPercent).toBe(100);
  });

  it('safely handles empty lists and zero budgets without dividing by zero', () => {
    const metrics = calculateBudgetMetrics(0, [], []);
    expect(metrics.totalBudget).toBe(0);
    expect(metrics.totalActual).toBe(0);
    expect(metrics.budgetUtilizationPercent).toBe(0);
    expect(metrics.isOverBudget).toBe(false);
  });
});

describe('Timeline Metrics & Buffer Calculations', () => {
  it('correctly aggregates buffer minutes and completion progress', () => {
    const milestones: TimelineMilestone[] = [
      { id: '1', time: '10:00 AM', phase: 'Morning Prep', title: 'Hair', description: '', responsibleParty: 'Lead', bufferMinutes: 15, completed: true },
      { id: '2', time: '12:00 PM', phase: 'Arrival & Welcome', title: 'Arrival', description: '', responsibleParty: 'Lead', bufferMinutes: 20, completed: true },
      { id: '3', time: '02:00 PM', phase: 'Ceremony / Kickoff', title: 'Vows', description: '', responsibleParty: 'Officiant', bufferMinutes: 10, completed: false },
      { id: '4', time: '05:00 PM', phase: 'Dining & Toasts', title: 'Dinner', description: '', responsibleParty: 'Catering', bufferMinutes: 15, completed: false },
    ];

    const metrics = calculateTimelineMetrics(milestones);
    expect(metrics.totalMilestones).toBe(4);
    expect(metrics.completedCount).toBe(2);
    expect(metrics.pendingCount).toBe(2);
    expect(metrics.totalBufferMinutes).toBe(60);
    expect(metrics.percentComplete).toBe(50);
  });

  it('handles empty timeline without NaN errors', () => {
    const metrics = calculateTimelineMetrics([]);
    expect(metrics.totalMilestones).toBe(0);
    expect(metrics.completedCount).toBe(0);
    expect(metrics.totalBufferMinutes).toBe(0);
    expect(metrics.percentComplete).toBe(0);
  });
});

describe('Dietary Headcount Aggregation', () => {
  it('accurately parses comma-separated dietary items and accounts for plus-ones', () => {
    const guests: GuestItem[] = [
      { id: '1', name: 'Alice', roleOrGroup: 'Friend', rsvpStatus: 'Attending', dietaryRestrictions: 'Vegetarian, Gluten-Free', tableOrZone: 'T1', plusOne: false },
      { id: '2', name: 'Bob', roleOrGroup: 'Family', rsvpStatus: 'Attending', dietaryRestrictions: 'Vegetarian', tableOrZone: 'T2', plusOne: true },
      { id: '3', name: 'Charlie', roleOrGroup: 'Friend', rsvpStatus: 'Declined', dietaryRestrictions: 'Nut Allergy', tableOrZone: 'T3', plusOne: false },
      { id: '4', name: 'Diana', roleOrGroup: 'Friend', rsvpStatus: 'Awaiting', dietaryRestrictions: 'Vegan', tableOrZone: 'T4', plusOne: false },
      { id: '5', name: 'Evan', roleOrGroup: 'Coworker', rsvpStatus: 'Attending', dietaryRestrictions: 'None', tableOrZone: 'T5', plusOne: false },
    ];

    const counts = aggregateDietaryCounts(guests);
    // Alice (1) + Bob (2 with plusOne) = 3 Vegetarian
    expect(counts['Vegetarian']).toBe(3);
    // Alice = 1 Gluten-Free
    expect(counts['Gluten-free']).toBe(1);
    // Charlie declined and Diana awaiting should not be included in confirmed catering count
    expect(counts['Nut allergy']).toBeUndefined();
    expect(counts['Vegan']).toBeUndefined();
  });
});

describe('Calendar Countdown Calculation', () => {
  it('computes positive days remaining for future dates', () => {
    const today = new Date('2026-06-01T12:00:00Z');
    const futureDate = '2026-06-11';
    const days = calculateCountdownDays(futureDate, today);
    expect(days).toBe(10);
  });

  it('returns zero for events happening today', () => {
    const today = new Date('2026-08-15T09:00:00Z');
    const sameDate = '2026-08-15';
    const days = calculateCountdownDays(sameDate, today);
    expect(days).toBe(0);
  });
});

describe('Input Validation', () => {
  it('flags missing title and invalid guest counts', () => {
    const res = validatePlanInputs({
      title: '',
      guestCount: 0,
      budget: 1000,
      eventType: 'Wedding',
    });

    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('passes valid inputs', () => {
    const res = validatePlanInputs({
      title: 'Summer Garden Party',
      guestCount: 80,
      budget: 5000,
      eventType: 'Birthday',
    });

    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });
});
