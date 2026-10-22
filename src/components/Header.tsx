import React from 'react';
import { Sparkles, Printer, Plus } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNewEventModal: () => void;
  onOpenPrintModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewEventModal,
  onOpenPrintModal,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Run of Show' },
    { id: 'budget', label: 'Budget' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'ideas', label: 'Ideas & Speeches' },
    { id: 'guests', label: 'Guest List' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-stone-900 whitespace-nowrap font-serif">
              Aura Celebrations
            </span>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative py-1 transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-stone-900 font-semibold'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary action & Export */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenPrintModal}
              title="Print Run of Show and Vendor Itinerary"
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200 text-xs flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Itinerary</span>
            </button>
            <button
              onClick={onOpenNewEventModal}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 active:scale-98 rounded-lg transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Celebration</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2.5 gap-4 border-t border-stone-100 text-xs font-medium text-stone-600">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`whitespace-nowrap pb-1 ${
                currentTab === item.id
                  ? 'text-stone-900 font-bold border-b-2 border-stone-900'
                  : 'text-stone-500'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
