import React, { useState, useMemo, useCallback } from 'react';
import { CelebrationEvent, GuestItem, RsvpStatus } from '../../types/planner';
import { aggregateDietaryCounts } from '../../utils/plannerCalculations';
import {
  Users,
  Plus,
  Trash2,
  Utensils,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download
} from 'lucide-react';

interface GuestListTabProps {
  event: CelebrationEvent;
  onUpdateEvent: (updated: CelebrationEvent) => void;
}

export const GuestListTab: React.FC<GuestListTabProps> = ({ event, onUpdateEvent }) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showAddGuest, setShowAddGuest] = useState(false);

  // New guest state
  const [name, setName] = useState('');
  const [roleOrGroup, setRoleOrGroup] = useState('Close Friends');
  const [dietary, setDietary] = useState('None');
  const [table, setTable] = useState('Table 1');
  const [plusOne, setPlusOne] = useState(false);

  const attendingCount = useMemo(
    () => event.guests.filter((g) => g.rsvpStatus === 'Attending').length,
    [event.guests]
  );
  const declinedCount = useMemo(
    () => event.guests.filter((g) => g.rsvpStatus === 'Declined').length,
    [event.guests]
  );
  const awaitingCount = useMemo(
    () => event.guests.filter((g) => g.rsvpStatus === 'Awaiting').length,
    [event.guests]
  );

  // Dietary counts summary for caterer using tested pure utility
  const dietaryMap = useMemo(
    () => aggregateDietaryCounts(event.guests),
    [event.guests]
  );

  const filteredGuests = filterStatus === 'All'
    ? event.guests
    : event.guests.filter((g) => g.rsvpStatus === filterStatus);

  const handleToggleRsvp = (id: string, newStatus: GuestItem['rsvpStatus']) => {
    const updated = {
      ...event,
      guests: event.guests.map((g) =>
        g.id === id ? { ...g, rsvpStatus: newStatus } : g
      ),
    };
    onUpdateEvent(updated);
  };

  const handleDeleteGuest = (id: string) => {
    const updated = {
      ...event,
      guests: event.guests.filter((g) => g.id !== id),
    };
    onUpdateEvent(updated);
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newG: GuestItem = {
      id: `g-${Date.now()}`,
      name: name.trim(),
      roleOrGroup: roleOrGroup.trim(),
      rsvpStatus: 'Awaiting',
      dietaryRestrictions: dietary.trim() || 'None',
      tableOrZone: table.trim() || 'Unassigned',
      plusOne,
    };

    const updated = {
      ...event,
      guests: [...event.guests, newG],
    };
    onUpdateEvent(updated);
    setName('');
    setDietary('None');
    setPlusOne(false);
    setShowAddGuest(false);
  };

  return (
    <div className="space-y-6">
      {/* RSVP KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Target Capacity
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-stone-900">
              {event.guestCount}
            </span>
            <span className="text-xs text-stone-500">seats planned</span>
          </div>
          <span className="text-xs text-stone-500 font-mono tabular-nums mt-1 block">
            {event.guests.length} individual invites tracked
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Confirmed Attending
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {attendingCount}
            </span>
            <span className="text-xs text-stone-500">guests</span>
          </div>
          <span className="text-xs text-stone-500 font-mono tabular-nums mt-1 block">
            {Math.round((attendingCount / (event.guestCount || 1)) * 100)}% of hall capacity
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Awaiting RSVP
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-700">
              {awaitingCount}
            </span>
            <span className="text-xs text-stone-500">pending response</span>
          </div>
          <span className="text-xs text-stone-500 mt-1 block">
            Follow up 2 weeks prior
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Declined
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-stone-500">
              {declinedCount}
            </span>
            <span className="text-xs text-stone-500">regrets</span>
          </div>
          <span className="text-xs text-stone-500 mt-1 block">
            Seats freed for waitlist
          </span>
        </div>
      </div>

      {/* Caterer Dietary Summary Box */}
      <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-stone-700" />
            <h3 className="text-sm font-semibold text-stone-900">
              Caterer Headcount & Dietary Breakdown
            </h3>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Confirmed meal counts ready for final catering headcount submission.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {Object.keys(dietaryMap).length > 0 ? (
            Object.entries(dietaryMap).map(([diet, count]) => (
              <span
                key={diet}
                className="px-2.5 py-1 text-xs bg-white text-stone-800 rounded-lg border border-stone-200 shadow-2xs font-medium"
              >
                {diet}: <strong className="font-mono tabular-nums">{count}</strong>
              </span>
            ))
          ) : (
            <span className="text-xs text-stone-500 italic">
              Standard menus only so far (no dietary restrictions declared)
            </span>
          )}
        </div>
      </div>

      {/* Main Guest Roster */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base font-serif font-bold text-stone-900">
              Guest List & Seating Assignments
            </h3>
            <span className="text-xs text-stone-500">
              Manage RSVP states, table groupings, and dietary notes
            </span>
          </div>

          <button
            onClick={() => setShowAddGuest(!showAddGuest)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Guest</span>
          </button>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-xl overflow-x-auto scrollbar-none">
          {['All', 'Attending', 'Awaiting', 'Declined'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                filterStatus === s
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Add guest form */}
        {showAddGuest && (
          <form
            onSubmit={handleAddGuest}
            className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3"
          >
            <div className="flex items-center justify-between pb-1 border-b border-stone-200">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Add Invitee
              </h4>
              <button
                type="button"
                onClick={() => setShowAddGuest(false)}
                className="text-xs text-stone-400 hover:text-stone-700"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Group / Relationship
                </label>
                <input
                  type="text"
                  value={roleOrGroup}
                  onChange={(e) => setRoleOrGroup(e.target.value)}
                  placeholder="e.g. Family, College Friend, Neighbor"
                  className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Table / Zone
                </label>
                <input
                  type="text"
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  placeholder="e.g. Table 2, Patio Lounge"
                  className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Dietary Restrictions
                </label>
                <input
                  type="text"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  placeholder="e.g. Vegetarian, Gluten-Free, Nut Allergy"
                  className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={plusOne}
                  onChange={(e) => setPlusOne(e.target.checked)}
                  className="rounded text-stone-900 focus:ring-stone-900"
                />
                <span>Includes Plus One (+1)</span>
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddGuest(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg"
                >
                  Save Guest
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Guest Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 font-semibold uppercase text-[10px] tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Guest Name</th>
                <th className="py-2.5 px-3">Group</th>
                <th className="py-2.5 px-3">Table / Zone</th>
                <th className="py-2.5 px-3">Dietary</th>
                <th className="py-2.5 px-3 text-center">RSVP</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-stone-900">
                    {guest.name}
                    {guest.plusOne && (
                      <span className="text-[10px] text-stone-400 font-mono ml-1.5">(+1)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-stone-600">
                    {guest.roleOrGroup}
                  </td>
                  <td className="py-2.5 px-3 text-stone-600">
                    {guest.tableOrZone}
                  </td>
                  <td className="py-2.5 px-3 text-stone-600">
                    {guest.dietaryRestrictions || 'None'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <select
                      value={guest.rsvpStatus}
                      onChange={(e) => handleToggleRsvp(guest.id, e.target.value as RsvpStatus)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                        guest.rsvpStatus === 'Attending'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : guest.rsvpStatus === 'Declined'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <option value="Attending">Attending</option>
                      <option value="Awaiting">Awaiting</option>
                      <option value="Declined">Declined</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleDeleteGuest(guest.id)}
                      className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove guest"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-stone-400">
                    No guests matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
