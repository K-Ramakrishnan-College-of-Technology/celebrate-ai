export type EventType = 'Wedding' | 'Birthday' | 'Community' | 'Anniversary' | 'Gala' | 'Dinner Party';

export interface ColorSwatch {
  name: string;
  hex: string;
  usage: string;
}

export interface CreativeVision {
  themeTitle: string;
  conceptStatement: string;
  palette: ColorSwatch[];
  signatureDrinkOrTreat: string;
  signatureActivity: string;
  atmosphereNotes: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  name: string;
  estimatedCost: number;
  actualCost: number;
  paid: boolean;
  notes?: string;
  dueDate?: string;
}

export interface BudgetCategory {
  category: string;
  percentage: number;
  targetAmount: number;
  tips: string;
  essential: boolean;
}

export interface TimelineMilestone {
  id: string;
  time: string;
  phase: 'Morning Prep' | 'Arrival & Welcome' | 'Ceremony / Kickoff' | 'Dining & Toasts' | 'Celebration & Dancing' | 'Send-Off' | 'Wrap-up';
  title: string;
  description: string;
  responsibleParty: string;
  bufferMinutes: number;
  completed: boolean;
}

export type VendorStatus = 'Researching' | 'Contacted' | 'Quote Received' | 'Booked' | 'Deposit Paid';

export interface VendorItem {
  id: string;
  category: string;
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: VendorStatus;
  targetBudget: number;
  actualQuote?: number;
  bookingTimeline: string;
  keyRequirements: string;
  topQuestionsToAsk: string[];
  depositPaid?: boolean;
  insuranceVerified?: boolean;
  notes?: string;
}

export interface PersonalizedIdea {
  id: string;
  category: string;
  title: string;
  description: string;
  estimatedCost: string;
  diyFriendly: boolean;
  saved?: boolean;
}

export interface GuestItem {
  id: string;
  name: string;
  roleOrGroup: string;
  rsvpStatus: 'Attending' | 'Declined' | 'Awaiting';
  dietaryRestrictions: string;
  tableOrZone: string;
  plusOne: boolean;
}

export interface CelebrationEvent {
  id: string;
  title: string;
  eventType: EventType;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  vibe: string;
  coverImage: string;
  notes: string;
  creativeVision: CreativeVision;
  budgetCategories: BudgetCategory[];
  budgetItems: BudgetItem[];
  timeline: TimelineMilestone[];
  vendors: VendorItem[];
  ideas: PersonalizedIdea[];
  guests: GuestItem[];
  createdAt: string;
}
