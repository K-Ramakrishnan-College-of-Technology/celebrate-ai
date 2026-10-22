import { CelebrationEvent, BudgetItem, GeneratedPlanResponse, BrainstormIdea } from '../types/planner';

export interface GeneratePlanParams {
  eventType: string;
  title: string;
  guestCount: number;
  budget: number;
  vibe: string;
  location: string;
  notes?: string;
  date?: string;
}

export interface VendorRfpParams {
  vendorCategory: string;
  eventTitle: string;
  eventType: string;
  date: string;
  location: string;
  guestCount: number;
  estimatedBudget: number;
  customNotes?: string;
}

export interface OptimizeBudgetParams {
  totalBudget: number;
  currentExpenses: BudgetItem[];
  eventType: string;
  guestCount: number;
}

export interface SpeechParams {
  speakerRole: string;
  honoreeName: string;
  relationship: string;
  tone: string;
  memorableStories: string;
  eventType: string;
}

export interface BrainstormParams {
  eventType: string;
  topic: string;
  vibe: string;
  guestCount: number;
}

export async function generateCelebrationPlan(params: GeneratePlanParams): Promise<GeneratedPlanResponse> {
  const res = await fetch('/api/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with ${res.status}`);
  }

  return await res.json();
}

export async function generateVendorRfp(params: VendorRfpParams): Promise<{ rfpMessage: string }> {
  const res = await fetch('/api/generate-vendor-rfp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to draft vendor RFP message');
  }

  return await res.json();
}

export async function optimizeBudgetWithAI(params: OptimizeBudgetParams): Promise<{
  summaryAnalysis: string;
  costSavingHacks: string[];
  reallocationSuggestions: string[];
  negotiationTips: string[];
}> {
  const res = await fetch('/api/optimize-budget', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to analyze budget');
  }

  return await res.json();
}

export async function generateSpeechWithAI(params: SpeechParams): Promise<{
  title: string;
  estimatedDuration: string;
  speechText: string;
  deliveryTips: string[];
}> {
  const res = await fetch('/api/generate-speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate speech');
  }

  return await res.json();
}

export async function brainstormIdeasWithAI(params: BrainstormParams): Promise<{
  ideas: BrainstormIdea[];
}> {
  const res = await fetch('/api/brainstorm-ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to brainstorm ideas');
  }

  return await res.json();
}
