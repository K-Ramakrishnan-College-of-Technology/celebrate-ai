import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CelebrationEvent } from './types/planner';
import { DEFAULT_EVENTS } from './data/defaultEvents';
import { Header } from './components/Header';
import { EventSelector } from './components/EventSelector';
import { EventHero } from './components/EventHero';
import { CreateEventModal } from './components/CreateEventModal';
import { PrintItineraryModal } from './components/PrintItineraryModal';
import { ErrorBoundary } from './components/ErrorBoundary';

// Tabs
import { OverviewTab } from './components/tabs/OverviewTab';
import { TimelineTab } from './components/tabs/TimelineTab';
import { BudgetTab } from './components/tabs/BudgetTab';
import { VendorsTab } from './components/tabs/VendorsTab';
import { IdeasTab } from './components/tabs/IdeasTab';
import { GuestListTab } from './components/tabs/GuestListTab';

const STORAGE_KEY = 'aura_celebrations_events_v2';

export default function App() {
  const [events, setEvents] = useState<CelebrationEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
    }
    return DEFAULT_EVENTS;
  });

  const [activeEventId, setActiveEventId] = useState<string>(() => {
    return events[0]?.id || DEFAULT_EVENTS[0].id;
  });

  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Debounced sync to localStorage to minimize disk I/O and optimize runtime efficiency
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      } catch (e) {
        console.error('Failed to save events to localStorage:', e);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [events]);

  const activeEvent = useMemo(
    () => events.find((e) => e.id === activeEventId) || events[0] || DEFAULT_EVENTS[0],
    [events, activeEventId]
  );

  const handleUpdateEvent = useCallback((updated: CelebrationEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }, []);

  const handleEventCreated = useCallback((newEvent: CelebrationEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    setActiveEventId(newEvent.id);
    setCurrentTab('overview');
  }, []);

  const handleResetToDefaults = useCallback(() => {
    if (window.confirm('Reset all sample celebration events to defaults? Any unsaved edits will be restored.')) {
      setEvents(DEFAULT_EVENTS);
      setActiveEventId(DEFAULT_EVENTS[0].id);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleOpenNewEvent = useCallback(() => setIsNewEventModalOpen(true), []);
  const handleCloseNewEvent = useCallback(() => setIsNewEventModalOpen(false), []);
  const handleOpenPrint = useCallback(() => setIsPrintModalOpen(true), []);
  const handleClosePrint = useCallback(() => setIsPrintModalOpen(false), []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#fafaf9] text-stone-900 font-sans antialiased selection:bg-amber-100 selection:text-stone-900">
        {/* Skip to Main Content Link for Keyboard Accessibility (WCAG 2.1 AA) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-stone-900 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-300 text-xs font-semibold"
        >
          Skip to main content
        </a>

        {/* Top Bar Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenNewEventModal={handleOpenNewEvent}
          onOpenPrintModal={handleOpenPrint}
        />

        {/* Multi-Event Selector Ribbon */}
        <EventSelector
          events={events}
          activeEventId={activeEvent.id}
          onSelectEvent={setActiveEventId}
          onOpenNewEventModal={handleOpenNewEvent}
        />

        {/* Main Event Showcase Hero */}
        <EventHero event={activeEvent} />

        {/* Primary Tab Workspace Viewport */}
        <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none">
          <ErrorBoundary>
            {currentTab === 'overview' && (
              <OverviewTab
                event={activeEvent}
                onNavigateTab={setCurrentTab}
                onUpdateEvent={handleUpdateEvent}
              />
            )}

            {currentTab === 'timeline' && (
              <TimelineTab
                event={activeEvent}
                onUpdateEvent={handleUpdateEvent}
                onOpenPrintModal={handleOpenPrint}
              />
            )}

            {currentTab === 'budget' && (
              <BudgetTab
                event={activeEvent}
                onUpdateEvent={handleUpdateEvent}
              />
            )}

            {currentTab === 'vendors' && (
              <VendorsTab
                event={activeEvent}
                onUpdateEvent={handleUpdateEvent}
              />
            )}

            {currentTab === 'ideas' && (
              <IdeasTab
                event={activeEvent}
                onUpdateEvent={handleUpdateEvent}
              />
            )}

            {currentTab === 'guests' && (
              <GuestListTab
                event={activeEvent}
                onUpdateEvent={handleUpdateEvent}
              />
            )}
          </ErrorBoundary>
        </main>

        {/* Quiet Functional Footer */}
        <footer className="mt-auto border-t border-stone-200/80 bg-white py-6 text-xs text-stone-500 no-print" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-stone-800">Aura Celebrations</span>
              <span aria-hidden="true">·</span>
              <span>Intelligent Event Architecture & Coordination</span>
            </div>

            <div className="flex items-center gap-4 text-stone-500">
              <button
                onClick={handleOpenPrint}
                className="hover:text-stone-900 transition-colors focus-visible:ring-2 focus-visible:ring-stone-900 rounded px-1"
              >
                Export Day-Of Itinerary
              </button>
              <span aria-hidden="true">·</span>
              <button
                onClick={handleResetToDefaults}
                className="hover:text-stone-900 transition-colors text-stone-400 hover:text-stone-600 focus-visible:ring-2 focus-visible:ring-stone-900 rounded px-1"
              >
                Reset Demo Data
              </button>
            </div>
          </div>
        </footer>

        {/* AI Event Generator Wizard Modal */}
        <CreateEventModal
          isOpen={isNewEventModalOpen}
          onClose={handleCloseNewEvent}
          onEventCreated={handleEventCreated}
        />

        {/* Day-of Printable Sheet Modal */}
        <PrintItineraryModal
          isOpen={isPrintModalOpen}
          onClose={handleClosePrint}
          event={activeEvent}
        />
      </div>
    </ErrorBoundary>
  );
}
