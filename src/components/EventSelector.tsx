import React from 'react';
import { CelebrationEvent } from '../types/planner';
import { Calendar, Users, MapPin, Plus } from 'lucide-react';

interface EventSelectorProps {
  events: CelebrationEvent[];
  activeEventId: string;
  onSelectEvent: (id: string) => void;
  onOpenNewEventModal: () => void;
}

export const EventSelector: React.FC<EventSelectorProps> = ({
  events,
  activeEventId,
  onSelectEvent,
  onOpenNewEventModal,
}) => {
  return (
    <div className="bg-stone-50 border-b border-stone-200/80 no-print py-2.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider whitespace-nowrap shrink-0">
              Active Project:
            </span>
            <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-lg">
              {events.map((evt) => {
                const isSelected = evt.id === activeEventId;
                return (
                  <button
                    key={evt.id}
                    onClick={() => onSelectEvent(evt.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-white text-stone-900 shadow-xs font-semibold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
                    }`}
                  >
                    {evt.title}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={onOpenNewEventModal}
            className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 hover:underline whitespace-nowrap shrink-0 ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>AI Plan Generator</span>
          </button>
        </div>
      </div>
    </div>
  );
};
