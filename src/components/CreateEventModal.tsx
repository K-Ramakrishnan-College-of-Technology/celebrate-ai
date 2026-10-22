import React, { useState } from 'react';
import { CelebrationEvent, EventType } from '../types/planner';
import { generateCelebrationPlan } from '../services/aiPlannerService';
import { getErrorMessage } from '../utils/plannerCalculations';
import { X, Sparkles, Loader2, Calendar, MapPin, Users, DollarSign, Wand2 } from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: CelebrationEvent) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  const [eventType, setEventType] = useState<EventType>('Wedding');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-10-10');
  const [location, setLocation] = useState('The Glasshouse Pavilion, Seattle, WA');
  const [guestCount, setGuestCount] = useState<number>(75);
  const [budget, setBudget] = useState<number>(12000);
  const [vibe, setVibe] = useState('Candlelit botanical greenhouse, artisanal seasonal appetizers, warm acoustic jazz, relaxed and elegant');
  const [notes, setNotes] = useState('Vegetarian options priority, prioritize photography and intimate lighting over heavy florals');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const eventTypes: { type: EventType; label: string; sampleTitle: string; sampleVibe: string }[] = [
    {
      type: 'Wedding',
      label: 'Wedding',
      sampleTitle: 'Julian & Maya’s Botanical Glasshouse Wedding',
      sampleVibe: 'Warm twilight candlelight, organic eucalyptus runners, artisanal wine pairings, and acoustic indie ballads',
    },
    {
      type: 'Birthday',
      label: 'Milestone Birthday',
      sampleTitle: 'Amara’s 30th Golden Hour Rooftop Soiree',
      sampleVibe: 'Sun-drenched rooftop terrace, signature citrus cocktails, disco soul vinyl grooves, and tapas grazing tables',
    },
    {
      type: 'Community',
      label: 'Community Gathering',
      sampleTitle: 'Riverdale Autumn Harvest & Lantern Walk',
      sampleVibe: 'Warm cider stations, handmade craft booths, acoustic folk stage, community potluck desserts, and glowing paper lanterns',
    },
    {
      type: 'Anniversary',
      label: 'Anniversary',
      sampleTitle: 'Silver Jubilee: 25 Years of Robert & Claire',
      sampleVibe: 'Classic mid-century supper club, champagne tower, string quartet, archived photo retrospective',
    },
    {
      type: 'Dinner Party',
      label: 'Intimate Dinner',
      sampleTitle: 'Midsummer Long-Table Garden Feast',
      sampleVibe: 'Family-style heirloom tomato salads, grilled wild salmon, natural orange wines, linen table runners',
    },
  ];

  const handleSelectType = (t: EventType) => {
    setEventType(t);
    const found = eventTypes.find(e => e.type === t);
    if (found) {
      if (!title || eventTypes.some(e => e.sampleTitle === title)) {
        setTitle(found.sampleTitle);
      }
      setVibe(found.sampleVibe);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMessage(null);

    const eventTitle = title.trim() || `${eventType} Celebration`;

    try {
      const generated = await generateCelebrationPlan({
        eventType,
        title: eventTitle,
        guestCount: Number(guestCount),
        budget: Number(budget),
        vibe,
        location,
        notes,
        date,
      });

      // Default cover image based on type
      let defaultCover = '/src/assets/images/event_wedding_hero_1792639613129.jpg';
      if (eventType === 'Birthday') {
        defaultCover = '/src/assets/images/event_birthday_hero_1792639613225.jpg';
      } else if (eventType === 'Community') {
        defaultCover = '/src/assets/images/event_community_festival_1792639613483.jpg';
      }

      const newCelebration: CelebrationEvent = {
        id: `event-${Date.now()}`,
        title: eventTitle,
        eventType,
        date,
        location,
        guestCount: Number(guestCount),
        totalBudget: Number(budget),
        vibe,
        coverImage: defaultCover,
        notes,
        createdAt: new Date().toISOString(),
        creativeVision: generated.creativeVision || {
          themeTitle: `${vibe.slice(0, 30)}...`,
          conceptStatement: vibe,
          palette: [
            { name: 'Warm Amber', hex: '#D97706', usage: 'Accents & lighting' },
            { name: 'Deep Slate', hex: '#1E293B', usage: 'Structure & typography' },
            { name: 'Oatmeal Linen', hex: '#F5F5F4', usage: 'Backdrop & table textiles' },
          ],
          signatureDrinkOrTreat: 'Sparkling herbal elderflower spritz with rosemary sprig.',
          signatureActivity: 'Curated memory wall & vinyl listening station.',
          atmosphereNotes: 'Warm incandescent lighting, botanical textures, and curated playlist.',
        },
        budgetCategories: generated.budgetCategories || [
          { category: 'Venue & Rentals', percentage: 35, targetAmount: Math.round(budget * 0.35), tips: 'Confirm table and chair inclusions.', essential: true },
          { category: 'Catering & Beverages', percentage: 35, targetAmount: Math.round(budget * 0.35), tips: 'Plan seasonal ingredients for best value.', essential: true },
          { category: 'Photography / Film', percentage: 15, targetAmount: Math.round(budget * 0.15), tips: 'Schedule key moments during daylight.', essential: true },
          { category: 'Decor & Atmosphere', percentage: 10, targetAmount: Math.round(budget * 0.10), tips: 'Use lighting to create high-impact mood.', essential: false },
          { category: 'Contingency Reserve', percentage: 5, targetAmount: Math.round(budget * 0.05), tips: 'Reserve for unexpected last-minute adjustments.', essential: true },
        ],
        budgetItems: [
          { id: `bi-${Date.now()}-1`, category: 'Venue & Rentals', name: 'Main Venue Space Fee', estimatedCost: Math.round(budget * 0.32), actualCost: 0, paid: false },
          { id: `bi-${Date.now()}-2`, category: 'Catering & Beverages', name: 'Guest Dining & Beverage Service', estimatedCost: Math.round(budget * 0.32), actualCost: 0, paid: false },
          { id: `bi-${Date.now()}-3`, category: 'Photography / Film', name: 'Documentary Photo Coverage', estimatedCost: Math.round(budget * 0.15), actualCost: 0, paid: false },
        ],
        timeline: generated.timeline || [
          { id: `t-${Date.now()}-1`, time: '02:00 PM', phase: 'Morning Prep', title: 'Setup & Vendor Arrival', description: 'Decorators and catering team load in.', responsibleParty: 'Host & Coordinator', bufferMinutes: 30, completed: false },
          { id: `t-${Date.now()}-2`, time: '04:00 PM', phase: 'Arrival & Welcome', title: 'Guest Arrival & Welcome Drink', description: 'Guests arrive; signature refreshments served.', responsibleParty: 'Hosts', bufferMinutes: 15, completed: false },
          { id: `t-${Date.now()}-3`, time: '05:30 PM', phase: 'Ceremony / Kickoff', title: 'Main Program & Welcome Toast', description: 'Kickoff speeches and official celebration moment.', responsibleParty: 'Master of Ceremonies', bufferMinutes: 10, completed: false },
          { id: `t-${Date.now()}-4`, time: '06:30 PM', phase: 'Dining & Toasts', title: 'Dinner & Conversation', description: 'Seasonal culinary feast with curated background soundtrack.', responsibleParty: 'Catering Lead', bufferMinutes: 20, completed: false },
          { id: `t-${Date.now()}-5`, time: '09:00 PM', phase: 'Send-Off', title: 'Dessert & Farewell Send-Off', description: 'Sweet treats and heartfelt goodbyes.', responsibleParty: 'Hosts', bufferMinutes: 15, completed: false },
        ],
        vendors: generated.vendors || generated.vendorChecklist || [
          { id: `v-${Date.now()}-1`, category: 'Venue', status: 'Researching', targetBudget: Math.round(budget * 0.35), bookingTimeline: '6 months prior', keyRequirements: 'Capacity and curfew', topQuestionsToAsk: ['Are outside caterers allowed?'] },
          { id: `v-${Date.now()}-2`, category: 'Catering', status: 'Researching', targetBudget: Math.round(budget * 0.35), bookingTimeline: '4 months prior', keyRequirements: 'Tasting and staffing', topQuestionsToAsk: ['Do you handle plate rentals?'] },
          { id: `v-${Date.now()}-3`, category: 'Photographer', status: 'Researching', targetBudget: Math.round(budget * 0.15), bookingTimeline: '5 months prior', keyRequirements: 'Style and portfolio review', topQuestionsToAsk: ['What is the delivery timeline?'] },
        ],
        ideas: generated.ideas || generated.personalizedIdeas || [
          { id: `i-${Date.now()}-1`, category: 'Welcome Moment', title: 'Bespoke Welcome Refreshment', description: 'A tailored cocktail/mocktail greeting upon entry.', estimatedCost: '$80 - $150', diyFriendly: true, saved: true },
          { id: `i-${Date.now()}-2`, category: 'Atmosphere', title: 'Potted Herb Table Runners', description: 'Living rosemary and lavender in terracotta pots guests take home.', estimatedCost: '$120', diyFriendly: true, saved: true },
        ],
        guests: [
          { id: `g-${Date.now()}-1`, name: 'Honored Guest of Honor', roleOrGroup: 'VIP', rsvpStatus: 'Attending', dietaryRestrictions: 'None', tableOrZone: 'Table 1', plusOne: true },
          { id: `g-${Date.now()}-2`, name: 'Key Family / Organizer', roleOrGroup: 'Family', rsvpStatus: 'Attending', dietaryRestrictions: 'Vegetarian', tableOrZone: 'Table 1', plusOne: false },
        ],
      };

      onEventCreated(newCelebration);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isGenerating) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isGenerating, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-plan-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto no-print"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between p-6 border-b border-stone-100 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="modal-plan-title" className="text-lg font-serif font-bold text-stone-900">
                AI Celebration Architect
              </h2>
              <span className="text-xs text-stone-500">
                Generate tailored budgets, run-of-show timelines, and vendor roadmaps
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 leading-relaxed">
              {errorMessage}
            </div>
          )}

          {/* Event Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Celebration Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {eventTypes.map((et) => (
                <button
                  type="button"
                  key={et.type}
                  onClick={() => handleSelectType(et.type)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg text-left transition-all border ${
                    eventType === et.type
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {et.label}
                </button>
              ))}
            </div>
          </div>

          {/* Event Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Maya & Alex's Summer Garden Wedding"
              className="w-full px-3.5 py-2 text-sm border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
            />
          </div>

          {/* Core Numerical Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Target Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Guest Count
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={2}
                  max={5000}
                  required
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900 font-mono tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Total Budget ($)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={100}
                  step={50}
                  required
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900 font-mono tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Location / Setting
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Lakefront lawn, historic loft, neighborhood park"
              className="w-full px-3.5 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
            />
          </div>

          {/* Desired Vibe & Aesthetic */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Vibe, Mood & Aesthetic
              </label>
              <span className="text-[11px] text-stone-400">Describe the atmosphere</span>
            </div>
            <textarea
              rows={2}
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="e.g. Earthy rustic warmth, linen table cloths, relaxed laughter, acoustic tunes"
              className="w-full px-3.5 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
            />
          </div>

          {/* Specific constraints */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Specific Priorities or Non-Negotiables (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Must have dairy-free food, end by 10pm, prioritize live music"
              className="w-full px-3.5 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-all shadow-xs flex items-center gap-2 disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Synthesizing Bespoke Event Plan...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-amber-300" />
                  <span>Generate Complete Event Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
