import React, { useState, useMemo } from 'react';
import { CelebrationEvent, TimelineMilestone } from '../../types/planner';
import { calculateTimelineMetrics } from '../../utils/plannerCalculations';
import {
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Sparkles,
  Printer,
  ShieldCheck,
  ChevronDown,
  Loader2
} from 'lucide-react';

interface TimelineTabProps {
  event: CelebrationEvent;
  onUpdateEvent: (updated: CelebrationEvent) => void;
  onOpenPrintModal: () => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  event,
  onUpdateEvent,
  onOpenPrintModal,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<string>('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTime, setNewTime] = useState('02:00 PM');
  const [newPhase, setNewPhase] = useState<TimelineMilestone['phase']>('Arrival & Welcome');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newResponsible, setNewResponsible] = useState('Event Coordinator');
  const [newBuffer, setNewBuffer] = useState<number>(15);

  const [isAiOptimizing, setIsAiOptimizing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const phases = [
    'All',
    'Morning Prep',
    'Arrival & Welcome',
    'Ceremony / Kickoff',
    'Dining & Toasts',
    'Celebration & Dancing',
    'Send-Off',
    'Wrap-up',
  ];

  const filteredTimeline = useMemo(() => {
    return selectedPhase === 'All'
      ? event.timeline
      : event.timeline.filter((m) => m.phase === selectedPhase);
  }, [event.timeline, selectedPhase]);

  const timelineMetrics = useMemo(
    () => calculateTimelineMetrics(event.timeline),
    [event.timeline]
  );
  const totalBuffers = timelineMetrics.totalBufferMinutes;
  const completedCount = timelineMetrics.completedCount;

  const handleToggleComplete = (id: string) => {
    const updated = {
      ...event,
      timeline: event.timeline.map((m) =>
        m.id === id ? { ...m, completed: !m.completed } : m
      ),
    };
    onUpdateEvent(updated);
  };

  const handleDeleteMilestone = (id: string) => {
    const updated = {
      ...event,
      timeline: event.timeline.filter((m) => m.id !== id),
    };
    onUpdateEvent(updated);
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newMilestone: TimelineMilestone = {
      id: `t-${Date.now()}`,
      time: newTime,
      phase: newPhase,
      title: newTitle.trim(),
      description: newDesc.trim(),
      responsibleParty: newResponsible.trim(),
      bufferMinutes: Number(newBuffer),
      completed: false,
    };

    const updated = {
      ...event,
      timeline: [...event.timeline, newMilestone],
    };
    onUpdateEvent(updated);
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  const handleRunAiAudit = async () => {
    setIsAiOptimizing(true);
    setAiAdvice(null);
    try {
      const res = await fetch('/api/brainstorm-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: event.eventType,
          topic: `Pacing and timing review for ${event.timeline.length} milestone items with total buffer of ${totalBuffers} minutes. Identify bottlenecks, dinner transition delays, or photo timing risks.`,
          vibe: event.vibe,
          guestCount: event.guestCount,
        }),
      });
      const data = await res.json();
      if (data.ideas && Array.isArray(data.ideas)) {
        const lines = data.ideas
          .map((i: any) => `• ${i.title}: ${i.description}`)
          .join('\n\n');
        setAiAdvice(lines);
      } else {
        setAiAdvice('Your timeline flow looks balanced! Ensure catering staff is notified 20 minutes prior to speeches.');
      }
    } catch (err: any) {
      setAiAdvice(`Timeline review: ${err.message || 'Error running analysis'}`);
    } finally {
      setIsAiOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Banner */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-stone-900" />
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Run of Show & Day-Of Timeline
            </h2>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Chronological master schedule from dawn setup to late-night breakdown.
          </p>
        </div>

        {/* Tabular Stats Strip & Actions */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-4 px-3 py-2 bg-stone-50 rounded-lg border border-stone-200/70">
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 block">Total Milestones</span>
              <span className="font-mono tabular-nums font-bold text-stone-900">{event.timeline.length}</span>
            </div>
            <div className="h-6 w-px bg-stone-200" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 block">Verified Completed</span>
              <span className="font-mono tabular-nums font-bold text-emerald-700">{completedCount} / {event.timeline.length}</span>
            </div>
            <div className="h-6 w-px bg-stone-200" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 block">Total Safety Buffer</span>
              <span className="font-mono tabular-nums font-bold text-amber-700">+{totalBuffers} mins</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAiAudit}
              disabled={isAiOptimizing}
              className="px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5 border border-stone-200 whitespace-nowrap"
            >
              {isAiOptimizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-600" />}
              <span>AI Pacing Audit</span>
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milestone</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Advice Callout */}
      {aiAdvice && (
        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-950 leading-relaxed">
          <div className="flex items-center justify-between font-serif font-bold text-amber-900 mb-1.5 pb-1 border-b border-amber-200/60">
            <span>AI Director Pacing Assessment</span>
            <button onClick={() => setAiAdvice(null)} className="text-[10px] text-amber-700 hover:underline">
              Dismiss
            </button>
          </div>
          <div className="whitespace-pre-line">{aiAdvice}</div>
        </div>
      )}

      {/* Phase Segmented Filter Controls (Interactive Buttons) */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-xl overflow-x-auto scrollbar-none">
        {phases.map((phase) => (
          <button
            key={phase}
            onClick={() => setSelectedPhase(phase)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              selectedPhase === phase
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {phase}
          </button>
        ))}
      </div>

      {/* Add Milestone Inline Drawer / Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddMilestone}
          className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-sm font-serif font-bold text-stone-900">
              New Run-of-Show Milestone
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-stone-400 hover:text-stone-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Time (e.g. 04:30 PM)
              </label>
              <input
                type="text"
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Phase
              </label>
              <select
                value={newPhase}
                onChange={(e) => setNewPhase(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-900"
              >
                {phases.filter((p) => p !== 'All').map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Responsible Lead
              </label>
              <input
                type="text"
                value={newResponsible}
                onChange={(e) => setNewResponsible(e.target.value)}
                placeholder="e.g. Lead Coordinator, DJ, Caterer"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Buffer Time (Minutes)
              </label>
              <input
                type="number"
                min={0}
                max={120}
                value={newBuffer}
                onChange={(e) => setNewBuffer(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Milestone Title
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Sunset Golden Hour Vow Exchange"
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Operational Notes & Cue Instructions
            </label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="e.g. Officiant mics checked; ushers seat guests; acoustic guitar plays soft prelude"
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg"
            >
              Save Milestone
            </button>
          </div>
        </form>
      )}

      {/* Timeline List */}
      <div className="space-y-3">
        {filteredTimeline.map((item, index) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
              item.completed
                ? 'border-stone-200/60 bg-stone-50/50 opacity-75'
                : 'border-stone-200/90 shadow-xs hover:border-stone-300'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Checkbox button */}
              <button
                onClick={() => handleToggleComplete(item.id)}
                className="mt-0.5 text-stone-400 hover:text-stone-900 transition-colors shrink-0"
                title={item.completed ? 'Mark uncompleted' : 'Mark completed'}
              >
                {item.completed ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-medium">
                  <span className="font-mono tabular-nums font-bold text-stone-900 text-sm">
                    {item.time}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-stone-700 font-semibold">{item.phase}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-stone-500">Lead: {item.responsibleParty}</span>
                  {item.bufferMinutes > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-700 font-mono tabular-nums">+{item.bufferMinutes}m safety cushion</span>
                    </>
                  )}
                </div>

                <h3 className={`text-base font-semibold text-stone-900 mt-1 ${item.completed ? 'line-through text-stone-500' : ''}`}>
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Delete action */}
              <button
                onClick={() => handleDeleteMilestone(item.id)}
                className="p-1.5 text-stone-300 hover:text-rose-600 transition-colors rounded-lg hover:bg-stone-50 shrink-0"
                title="Delete milestone"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredTimeline.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200">
            <p className="text-xs text-stone-500">No milestones found in this phase.</p>
            <button
              onClick={() => setSelectedPhase('All')}
              className="mt-2 text-xs font-semibold text-stone-900 hover:underline"
            >
              Show all milestones
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
