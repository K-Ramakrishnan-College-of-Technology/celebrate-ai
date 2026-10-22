import { describe, it, expect } from 'vitest';
import {
  calculateBudgetMetrics,
  calculateCategorySpend,
  calculateTimelineMetrics,
  filterTimelineMilestones,
  calculateVendorMetrics,
  aggregateDietaryCounts,
  calculateCountdownDays,
  validatePlanInputs,
  getErrorMessage,
} from '../utils/plannerCalculations';
import {
  BudgetCategory,
  BudgetItem,
  TimelineMilestone,
  GuestItem,
  VendorItem,
} from '../types/planner';

describe('Planner Calculations & Budget Metrics', () => {
  const sampleCategories: BudgetCategory[] = [
    { category: 'Venue', percentage: 40, targetAmount: 4000, tips: 'Ask for chair inclusions', essential: true },
    { category: 'Catering', percentage: 40, targetAmount: 4000, tips: 'Family style cuts staff', essential: true },
    { category: 'Music', percentage: 20, targetAmount: 2000, tips: 'Acoustic duo + playlist', essential: false },
  ];

  const sampleItems: BudgetItem[] = [
    { id: '1', category: 'Venue', name: 'Hall Fee', estimatedCost: 3500, actualCost: 3800, paid: true },
    { id: '2', category: 'Catering', name: 'Dinner Buffet', estimatedCost: 4000, actualCost: 4200, paid: false },
    { id: '3', category: 'Music', name: 'DJ Sound', estimatedCost: 1800, actualCost: 1800, paid: true },
  ];

  it('correctly calculates total allocated, spent, paid, and remaining budget', () => {
    const metrics = calculateBudgetMetrics(10000, sampleCategories, sampleItems);

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
    const items: BudgetItem[] = [
      { id: '1', category: 'General', name: 'Excess Item', estimatedCost: 4000, actualCost: 6500, paid: false },
    ];

    const metrics = calculateBudgetMetrics(5000, [], items);
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

  it('correctly calculates category-specific spend case-insensitively', () => {
    const venueSpend = calculateCategorySpend('venue', sampleItems);
    expect(venueSpend).toBe(3800);

    const cateringSpend = calculateCategorySpend('Catering', sampleItems);
    expect(cateringSpend).toBe(4200);

    const nonExistent = calculateCategorySpend('Decor', sampleItems);
    expect(nonExistent).toBe(0);
  });
});

describe('Timeline Metrics & Buffer Calculations', () => {
  const sampleMilestones: TimelineMilestone[] = [
    { id: '1', time: '10:00 AM', phase: 'Morning Prep', title: 'Hair', description: '', responsibleParty: 'Lead', bufferMinutes: 15, completed: true },
    { id: '2', time: '12:00 PM', phase: 'Arrival & Welcome', title: 'Arrival', description: '', responsibleParty: 'Lead', bufferMinutes: 20, completed: true },
    { id: '3', time: '02:00 PM', phase: 'Ceremony / Kickoff', title: 'Vows', description: '', responsibleParty: 'Officiant', bufferMinutes: 10, completed: false },
    { id: '4', time: '05:00 PM', phase: 'Dining & Toasts', title: 'Dinner', description: '', responsibleParty: 'Catering', bufferMinutes: 15, completed: false },
  ];

  it('correctly aggregates buffer minutes and completion progress', () => {
    const metrics = calculateTimelineMetrics(sampleMilestones);
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

  it('filters milestones by phase accurately and supports "All"', () => {
    const morningItems = filterTimelineMilestones(sampleMilestones, 'Morning Prep');
    expect(morningItems).toHaveLength(1);
    expect(morningItems[0].title).toBe('Hair');

    const allItems = filterTimelineMilestones(sampleMilestones, 'All');
    expect(allItems).toHaveLength(4);

    const emptyPhase = filterTimelineMilestones(sampleMilestones, 'Wrap-up');
    expect(emptyPhase).toHaveLength(0);
  });
});

describe('Vendor Metrics & Health Tracking', () => {
  const sampleVendors: VendorItem[] = [
    {
      id: 'v1',
      category: 'Venue',
      companyName: 'Grand Hall',
      status: 'Booked',
      targetBudget: 5000,
      actualQuote: 5200,
      bookingTimeline: '6 months',
      keyRequirements: 'Permit',
      topQuestionsToAsk: [],
      depositPaid: true,
      insuranceVerified: true,
    },
    {
      id: 'v2',
      category: 'Catering',
      companyName: 'Farm Feast',
      status: 'Deposit Paid',
      targetBudget: 4000,
      actualQuote: 4000,
      bookingTimeline: '4 months',
      keyRequirements: 'Tasting',
      topQuestionsToAsk: [],
      depositPaid: true,
      insuranceVerified: false,
    },
    {
      id: 'v3',
      category: 'Florist',
      status: 'Researching',
      targetBudget: 1500,
      bookingTimeline: '3 months',
      keyRequirements: '',
      topQuestionsToAsk: [],
      depositPaid: false,
      insuranceVerified: false,
    },
  ];

  it('calculates vendor contract, booking, and budget totals accurately', () => {
    const metrics = calculateVendorMetrics(sampleVendors);
    expect(metrics.totalVendors).toBe(3);
    expect(metrics.bookedCount).toBe(2); // 'Booked' + 'Deposit Paid'
    expect(metrics.depositPaidCount).toBe(2);
    expect(metrics.insuranceVerifiedCount).toBe(1);
    expect(metrics.totalTargetBudget).toBe(10500); // 5000 + 4000 + 1500
    expect(metrics.totalCommittedQuotes).toBe(10700); // 5200 + 4000 + 1500 (fallback)
  });

  it('handles empty vendor list gracefully', () => {
    const metrics = calculateVendorMetrics([]);
    expect(metrics.totalVendors).toBe(0);
    expect(metrics.bookedCount).toBe(0);
    expect(metrics.totalTargetBudget).toBe(0);
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
    expect(counts['Vegetarian']).toBe(3);
    expect(counts['Gluten-free']).toBe(1);
    expect(counts['Nut allergy']).toBeUndefined();
    expect(counts['Vegan']).toBeUndefined();
  });

  it('returns empty object when no guests have dietary restrictions', () => {
    const guests: GuestItem[] = [
      { id: '1', name: 'Sam', roleOrGroup: '', rsvpStatus: 'Attending', dietaryRestrictions: 'None', tableOrZone: '', plusOne: false },
    ];
    expect(aggregateDietaryCounts(guests)).toEqual({});
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

  it('returns negative days for past events', () => {
    const today = new Date('2026-09-01T00:00:00Z');
    const pastDate = '2026-08-20';
    const days = calculateCountdownDays(pastDate, today);
    expect(days).toBeLessThan(0);
  });

  it('handles invalid date strings gracefully', () => {
    expect(calculateCountdownDays('invalid-date')).toBe(0);
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

  it('validates budget must be non-negative', () => {
    const res = validatePlanInputs({
      title: 'Party',
      guestCount: 20,
      budget: -500,
      eventType: 'Birthday',
    });

    expect(res.valid).toBe(false);
    expect(res.errors).toContain('Budget must be a realistic positive amount.');
  });
});

describe('Error Message Helper', () => {
  it('extracts messages from Error instances', () => {
    const err = new Error('Network timeout');
    expect(getErrorMessage(err)).toBe('Network timeout');
  });

  it('handles string errors', () => {
    expect(getErrorMessage('Server unavailable')).toBe('Server unavailable');
  });

  it('handles plain objects with message property', () => {
    expect(getErrorMessage({ message: 'Quota exceeded' })).toBe('Quota exceeded');
  });

  it('returns default fallback on unknown error shapes', () => {
    expect(getErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
  });
});
