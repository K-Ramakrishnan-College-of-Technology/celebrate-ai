import React, { useState, useMemo } from 'react';
import { CelebrationEvent } from '../types/planner';
import {
  calculateBudgetMetrics,
  calculateTimelineMetrics,
  calculateCountdownDays,
} from '../utils/plannerCalculations';
import { Calendar, MapPin, Users, DollarSign, Clock, Sparkles } from 'lucide-react';

interface EventHeroProps {
  event: CelebrationEvent;
  onOpenQuickPrompt?: () => void;
}

export const EventHero: React.FC<EventHeroProps> = ({ event, onOpenQuickPrompt }) => {
  const [imageFailed, setImageFailed] = useState(false);

  // Compute countdown days using pure utility
  const diffDays = useMemo(() => calculateCountdownDays(event.date), [event.date]);

  // Compute financial metrics with memoization
  const budgetMetrics = useMemo(
    () => calculateBudgetMetrics(event.totalBudget, event.budgetCategories, event.budgetItems),
    [event.totalBudget, event.budgetCategories, event.budgetItems]
  );

  // Compute timeline metrics with memoization
  const timelineMetrics = useMemo(
    () => calculateTimelineMetrics(event.timeline),
    [event.timeline]
  );

  const bookedVendorsCount = useMemo(
    () => event.vendors.filter((v) => v.status === 'Booked' || v.status === 'Deposit Paid').length,
    [event.vendors]
  );

  return (
    <section className="relative overflow-hidden bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Main Visual Asset (Resilient with zero-broken-image fallback) */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-16/10 sm:aspect-16/9 lg:aspect-auto lg:h-full min-h-[220px] bg-stone-900 border border-stone-200 shadow-xs">
            {!imageFailed ? (
              <img
                src={event.coverImage}
                alt={event.title}
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-102"
              />
            ) : (
              <div className="w-full h-full flex flex-col justify-end p-6 bg-gradient-to-tr from-stone-900 via-stone-800 to-amber-950 text-white">
                <span className="text-xs uppercase tracking-widest text-amber-300 font-mono">
                  {event.eventType}
                </span>
                <h3 className="text-xl font-serif font-bold text-white mt-1">
                  {event.title}
                </h3>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-stone-200 pointer-events-none">
              <span className="font-serif italic text-amber-200/90 text-sm">{event.creativeVision?.themeTitle || event.vibe}</span>
              <span className="font-mono tabular-nums tracking-wide bg-stone-950/60 px-2 py-0.5 rounded text-[11px] backdrop-blur-xs">
                {event.eventType}
              </span>
            </div>
          </div>

          {/* Core Event Briefing Details */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Clean Unboxed Metadata Line with typographic separators */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-medium mb-2.5">
                <span className="text-stone-900 font-semibold">{event.eventType} Planning</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <time dateTime={event.date}>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span className="truncate max-w-[200px]">{event.location}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-mono tabular-nums">{event.guestCount}</span> guests
                </span>
              </div>

              {/* Title & Concept */}
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight text-balance">
                {event.title}
              </h1>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed max-w-2xl">
                {event.creativeVision?.conceptStatement || event.vibe}
              </p>
            </div>

            {/* Structured Metric Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-4 border-t border-stone-100">
              {/* Metric 1: Countdown */}
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Timeline Clock
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono tabular-nums text-stone-900">
                    {diffDays > 0 ? diffDays : diffDays === 0 ? 'Today' : 'Past'}
                  </span>
                  {diffDays > 0 && <span className="text-xs text-stone-500">days left</span>}
                </div>
                <span className="text-[11px] text-stone-500 font-mono tabular-nums">
                  {timelineMetrics.completedCount} of {timelineMetrics.totalMilestones} runs verified
                </span>
              </div>

              {/* Metric 2: Total Budget */}
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Target Budget
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono tabular-nums text-stone-900">
                    ${budgetMetrics.totalBudget.toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 font-mono tabular-nums">
                  ${budgetMetrics.totalAllocated.toLocaleString()} planned
                </span>
              </div>

              {/* Metric 3: Committed Spend */}
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Committed Spend
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className={`text-xl font-bold font-mono tabular-nums ${budgetMetrics.isOverBudget ? 'text-rose-600' : 'text-stone-900'}`}>
                    ${budgetMetrics.totalActual.toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 font-mono tabular-nums">
                  {budgetMetrics.budgetUtilizationPercent}% utilization
                </span>
              </div>

              {/* Metric 4: Vendors Secured */}
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Key Vendors
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono tabular-nums text-stone-900">
                    {bookedVendorsCount} / {event.vendors.length}
                  </span>
                  <span className="text-xs text-stone-500">booked</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">
                  {event.vendors.length - bookedVendorsCount === 0 ? 'All locked in' : `${event.vendors.length - bookedVendorsCount} in outreach`}
                </span>
              </div>
            </div>

            {/* Quick Budget Progress Bar */}
            <div className="mt-3 w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  budgetMetrics.isOverBudget ? 'bg-rose-500' : budgetMetrics.budgetUtilizationPercent > 85 ? 'bg-amber-500' : 'bg-stone-900'
                }`}
                style={{ width: `${Math.min(100, budgetMetrics.budgetUtilizationPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
