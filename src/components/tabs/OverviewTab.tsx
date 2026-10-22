import React, { useState } from 'react';
import { CelebrationEvent } from '../../types/planner';
import {
  Sparkles,
  Palette,
  Clock,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  Send,
  Loader2,
  Wine,
  Flame,
  ArrowUpRight
} from 'lucide-react';

interface OverviewTabProps {
  event: CelebrationEvent;
  onNavigateTab: (tab: string) => void;
  onUpdateEvent: (updated: CelebrationEvent) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  event,
  onNavigateTab,
  onUpdateEvent,
}) => {
  const [copilotQuestion, setCopilotQuestion] = useState('');
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  // Next 3 uncompleted milestones
  const upcomingMilestones = event.timeline
    .filter((m) => !m.completed)
    .slice(0, 3);

  // Financial totals
  const totalAllocated = event.budgetCategories.reduce((sum, c) => sum + c.targetAmount, 0);
  const totalActual = event.budgetItems.reduce((sum, item) => sum + (item.actualCost || 0), 0);
  const remainingBudget = event.totalBudget - totalActual;

  const handleQuickAsk = async (promptText: string) => {
    setIsAsking(true);
    setCopilotResponse(null);
    try {
      const res = await fetch('/api/brainstorm-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: event.eventType,
          topic: promptText,
          vibe: event.vibe,
          guestCount: event.guestCount,
        }),
      });
      const data = await res.json();
      if (data.ideas && Array.isArray(data.ideas)) {
        const text = data.ideas
          .map((i: any) => `• ${i.title}: ${i.description} (Pro-tip: ${i.proTip})`)
          .join('\n\n');
        setCopilotResponse(text);
      } else {
        setCopilotResponse('No specific ideas returned. Please try rephrasing.');
      }
    } catch (err: any) {
      setCopilotResponse(`Could not query assistant: ${err.message || 'Error'}`);
    } finally {
      setIsAsking(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuestion.trim()) return;
    handleQuickAsk(copilotQuestion);
    setCopilotQuestion('');
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Responsive Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Creative Vision & Palette (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Creative Vision Card */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-600" />
                <h2 className="text-base font-serif font-bold text-stone-900">
                  Aesthetic & Creative Vision
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('ideas')}
                className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 hover:underline"
              >
                <span>Vision Studio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Theme Direction
                </span>
                <p className="text-lg font-serif font-semibold text-stone-900 mt-0.5">
                  {event.creativeVision?.themeTitle || event.vibe}
                </p>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {event.creativeVision?.conceptStatement}
                </p>
              </div>

              {/* Curated Color Swatches */}
              {event.creativeVision?.palette && (
                <div>
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                    Curated Color Palette
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {event.creativeVision.palette.map((color, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-stone-200/70 bg-stone-50/50 flex flex-col justify-between"
                      >
                        <div
                          className="w-full h-8 rounded-lg shadow-2xs mb-2 border border-black/10"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-semibold text-stone-900 truncate">
                          {color.name}
                        </span>
                        <span className="text-[10px] font-mono tabular-nums text-stone-500">
                          {color.hex}
                        </span>
                        <span className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                          {color.usage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signature Touches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 mb-1">
                    <Wine className="w-3.5 h-3.5 text-amber-600" />
                    <span>Signature Drink or Dish</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {event.creativeVision?.signatureDrinkOrTreat || 'Custom crafted refreshments.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 mb-1">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    <span>Interactive Moment</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {event.creativeVision?.signatureActivity || 'Interactive guest experience.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Event Co-Pilot Bar */}
          <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 shadow-xs border border-stone-800">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h3 className="text-sm font-semibold tracking-wide text-white">
                  Event Director AI Copilot
                </h3>
              </div>
              <span className="text-[11px] text-stone-400 font-mono">
                Model: gemini-3.8-flash
              </span>
            </div>

            <p className="text-xs text-stone-300 mt-2.5">
              Ask for creative twists, negotiation prompts, weather contingencies, or menu pairings tailored to your celebration.
            </p>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {[
                'Signature Mocktail & Cocktail Recipes',
                'Icebreaker Activities for Guests',
                'Cost-Cutting Hacks without Sacrificing Vibe',
                'Rain & Weather Contingency Buffer',
              ].map((prompt) => (
                <button
                  key={prompt}
                  disabled={isAsking}
                  onClick={() => handleQuickAsk(prompt)}
                  className="px-2.5 py-1 text-[11px] bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md border border-stone-700/60 transition-colors whitespace-nowrap shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleCustomSubmit} className="mt-3.5 flex gap-2">
              <input
                type="text"
                value={copilotQuestion}
                onChange={(e) => setCopilotQuestion(e.target.value)}
                placeholder="Ask your planning assistant anything..."
                className="flex-1 px-3 py-2 text-xs bg-stone-800/90 border border-stone-700 rounded-lg text-white placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-amber-300"
              />
              <button
                type="submit"
                disabled={isAsking || !copilotQuestion.trim()}
                className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 whitespace-nowrap"
              >
                {isAsking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Ask</span>
              </button>
            </form>

            {/* Assistant Output */}
            {isAsking && (
              <div className="mt-3 p-3 bg-stone-800/60 rounded-lg flex items-center gap-2 text-xs text-stone-300">
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>Consulting celebration knowledge base...</span>
              </div>
            )}

            {copilotResponse && !isAsking && (
              <div className="mt-3 p-3.5 bg-stone-800/80 rounded-xl border border-stone-700/80 text-xs text-stone-200 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
                <div className="flex items-center justify-between text-amber-300 font-semibold mb-1.5 pb-1 border-b border-stone-700">
                  <span>Assistant Recommendation</span>
                  <button
                    onClick={() => setCopilotResponse(null)}
                    className="text-[10px] text-stone-400 hover:text-white"
                  >
                    Clear
                  </button>
                </div>
                {copilotResponse}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Execution Tracking (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Day-of Run of Show Highlights */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-stone-700" />
                <h3 className="text-sm font-semibold text-stone-900">
                  Next Execution Milestones
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('timeline')}
                className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 hover:underline"
              >
                <span>Full Timeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3.5 space-y-3">
              {upcomingMilestones.length > 0 ? (
                upcomingMilestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="p-3 rounded-xl border border-stone-100 bg-stone-50/60 hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold font-mono tabular-nums text-stone-900">
                        {milestone.time}
                      </span>
                      <span className="text-[11px] text-stone-500 font-medium">
                        {milestone.phase}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-stone-900 mt-1">
                      {milestone.title}
                    </h4>
                    <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-2">
                      {milestone.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-200/60 pt-1.5">
                      <span>Owner: {milestone.responsibleParty}</span>
                      <span className="font-mono tabular-nums">+{milestone.bufferMinutes}m buffer</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-stone-500 bg-stone-50 rounded-xl">
                  All timeline items marked as completed!
                </div>
              )}
            </div>
          </div>

          {/* Budget Quick Health */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-stone-700" />
                <h3 className="text-sm font-semibold text-stone-900">
                  Budget Health
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('budget')}
                className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 hover:underline"
              >
                <span>Itemized Tracker</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3.5 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-stone-500">Uncommitted Buffer:</span>
                <span className={`text-base font-bold font-mono tabular-nums ${remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  ${remainingBudget.toLocaleString()}
                </span>
              </div>

              {/* Categorical breakdown bars */}
              <div className="space-y-2 pt-1">
                {event.budgetCategories.slice(0, 4).map((cat, idx) => {
                  const percentOfTotal = Math.round((cat.targetAmount / event.totalBudget) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-700 font-medium truncate max-w-[180px]">
                          {cat.category}
                        </span>
                        <span className="font-mono tabular-nums text-stone-500">
                          ${cat.targetAmount.toLocaleString()} ({percentOfTotal}%)
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-stone-800 h-full rounded-full"
                          style={{ width: `${Math.min(100, percentOfTotal)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Vendor Quick Status */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-semibold text-stone-900">
                Vendor Roster
              </h3>
              <button
                onClick={() => onNavigateTab('vendors')}
                className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 hover:underline"
              >
                <span>Vendor Hub</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-stone-100">
              {event.vendors.slice(0, 4).map((v) => (
                <div key={v.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-stone-900 block">
                      {v.category}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {v.companyName || 'Not selected yet'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono tabular-nums text-stone-900 block font-medium">
                      ${(v.actualQuote || v.targetBudget).toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-medium ${
                      v.status === 'Booked' || v.status === 'Deposit Paid' ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
