import React from 'react';
import { CelebrationEvent } from '../types/planner';
import { X, Printer, Calendar, MapPin, Users, Phone, Clock } from 'lucide-react';

interface PrintItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CelebrationEvent;
}

export const PrintItineraryModal: React.FC<PrintItineraryModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  if (!isOpen) return null;

  const handleTriggerPrint = () => {
    window.print();
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-print-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto no-print"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-white sticky top-0 z-10 no-print">
          <div>
            <h2 id="modal-print-title" className="text-base font-serif font-bold text-stone-900">
              Master Day-Of Itinerary & Vendor Roster
            </h2>
            <p className="text-xs text-stone-500">
              Formatted for day-of coordinators, venue managers, and bridal/host party.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerPrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print or Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-8 sm:p-12 space-y-8 bg-white print:p-0">
          {/* Header Strip */}
          <div className="border-b-2 border-stone-900 pb-6">
            <span className="text-xs font-mono uppercase tracking-widest text-stone-500 block">
              Official Day-Of Master Plan · {event.eventType}
            </span>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 mt-3 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <time dateTime={event.date}>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span>{event.location}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-stone-500" />
                <span className="font-mono tabular-nums">{event.guestCount}</span> Guests Planned
              </span>
            </div>
          </div>

          {/* Master Chronological Run-of-Show Table */}
          <div className="space-y-3">
            <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Chronological Run of Show</span>
            </h2>

            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-700 font-semibold uppercase text-[10px] tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-2 px-3 w-24">Time</th>
                  <th className="py-2 px-3 w-32">Phase</th>
                  <th className="py-2 px-3">Milestone & Operational Cues</th>
                  <th className="py-2 px-3 w-40">Lead Owner</th>
                  <th className="py-2 px-3 w-20 text-right">Buffer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {event.timeline.map((m) => (
                  <tr key={m.id} className="align-top">
                    <td className="py-2.5 px-3 font-mono tabular-nums font-bold text-stone-900 whitespace-nowrap">
                      {m.time}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-stone-700">
                      {m.phase}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-stone-900">{m.title}</div>
                      {m.description && (
                        <div className="text-stone-600 mt-0.5 leading-relaxed">{m.description}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-stone-700">
                      {m.responsibleParty}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-stone-500">
                      {m.bufferMinutes > 0 ? `+${m.bufferMinutes}m` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key Vendor Contacts */}
          <div className="space-y-3 pt-4">
            <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
              Key Vendor Directory & Emergency Points of Contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {event.vendors.map((v) => (
                <div key={v.id} className="p-3 border border-stone-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-stone-900">{v.category}</span>
                    <span className="text-[10px] font-mono text-stone-500">{v.status}</span>
                  </div>
                  <div className="text-stone-800 font-medium mt-1">
                    {v.companyName || 'Not contracted'} {v.contactName && `(${v.contactName})`}
                  </div>
                  <div className="text-stone-500 mt-1 flex flex-wrap gap-2 text-[11px]">
                    {v.contactPhone && <span>Phone: {v.contactPhone}</span>}
                    {v.contactEmail && <span>Email: {v.contactEmail}</span>}
                  </div>
                  {v.keyRequirements && (
                    <div className="text-[11px] text-stone-600 mt-1 italic">
                      Note: {v.keyRequirements}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-6 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Generated with Aura Celebrations AI Planner</span>
            <span className="font-mono">Printed on {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
