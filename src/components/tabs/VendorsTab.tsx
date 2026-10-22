import React, { useState, useMemo, useCallback } from 'react';
import { CelebrationEvent, VendorItem, VendorStatus } from '../../types/planner';
import { generateVendorRfp } from '../../services/aiPlannerService';
import { calculateVendorMetrics, getErrorMessage } from '../../utils/plannerCalculations';
import {
  Users,
  Plus,
  Mail,
  Phone,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  Shield,
  FileText,
  Trash2,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface VendorsTabProps {
  event: CelebrationEvent;
  onUpdateEvent: (updated: CelebrationEvent) => void;
}

export const VendorsTab: React.FC<VendorsTabProps> = ({ event, onUpdateEvent }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [rfpVendor, setRfpVendor] = useState<VendorItem | null>(null);
  const [rfpMessage, setRfpMessage] = useState<string | null>(null);
  const [isDraftingRfp, setIsDraftingRfp] = useState(false);
  const [copied, setCopied] = useState(false);

  // Vendor metrics via pure tested utility
  const vendorMetrics = useMemo(() => calculateVendorMetrics(event.vendors), [event.vendors]);

  // New vendor drawer
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newCategory, setNewCategory] = useState('Catering & Bar');
  const [newCompany, setNewCompany] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBudget, setNewBudget] = useState<number>(1500);
  const [newTimeline, setNewTimeline] = useState('3-6 months prior');
  const [newRequirements, setNewRequirements] = useState('');

  const statuses: (VendorStatus | 'All')[] = [
    'All',
    'Researching',
    'Contacted',
    'Quote Received',
    'Booked',
    'Deposit Paid',
  ];

  const filteredVendors = selectedStatus === 'All'
    ? event.vendors
    : event.vendors.filter((v) => v.status === selectedStatus);

  const handleStatusChange = (vendorId: string, newStatus: VendorStatus) => {
    const updated = {
      ...event,
      vendors: event.vendors.map((v) =>
        v.id === vendorId ? { ...v, status: newStatus } : v
      ),
    };
    onUpdateEvent(updated);
  };

  const handleToggleDeposit = (vendorId: string) => {
    const updated = {
      ...event,
      vendors: event.vendors.map((v) =>
        v.id === vendorId ? { ...v, depositPaid: !v.depositPaid } : v
      ),
    };
    onUpdateEvent(updated);
  };

  const handleToggleInsurance = (vendorId: string) => {
    const updated = {
      ...event,
      vendors: event.vendors.map((v) =>
        v.id === vendorId ? { ...v, insuranceVerified: !v.insuranceVerified } : v
      ),
    };
    onUpdateEvent(updated);
  };

  const handleDeleteVendor = (vendorId: string) => {
    const updated = {
      ...event,
      vendors: event.vendors.filter((v) => v.id !== vendorId),
    };
    onUpdateEvent(updated);
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    const newV: VendorItem = {
      id: `v-${Date.now()}`,
      category: newCategory.trim(),
      companyName: newCompany.trim() || undefined,
      contactName: newContact.trim() || undefined,
      contactEmail: newEmail.trim() || undefined,
      contactPhone: newPhone.trim() || undefined,
      status: 'Researching',
      targetBudget: Number(newBudget),
      bookingTimeline: newTimeline.trim(),
      keyRequirements: newRequirements.trim() || 'Confirm availability and pricing.',
      topQuestionsToAsk: [
        'What packages do you offer for this event size?',
        'What is your cancellation and deposit refund policy?',
        'Have you worked at this venue/setting before?',
      ],
      depositPaid: false,
      insuranceVerified: false,
    };

    const updated = {
      ...event,
      vendors: [...event.vendors, newV],
    };
    onUpdateEvent(updated);
    setShowAddVendor(false);
    setNewCompany('');
    setNewContact('');
    setNewEmail('');
    setNewPhone('');
  };

  const handleOpenRfpModal = async (vendor: VendorItem) => {
    setRfpVendor(vendor);
    setIsDraftingRfp(true);
    setRfpMessage(null);
    setCopied(false);

    try {
      const data = await generateVendorRfp({
        vendorCategory: vendor.category,
        eventTitle: event.title,
        eventType: event.eventType,
        date: event.date,
        location: event.location,
        guestCount: event.guestCount,
        estimatedBudget: vendor.actualQuote || vendor.targetBudget,
        customNotes: vendor.keyRequirements,
      });
      setRfpMessage(data.rfpMessage);
    } catch (err: unknown) {
      setRfpMessage(`Failed to generate RFP: ${getErrorMessage(err)}`);
    } finally {
      setIsDraftingRfp(false);
    }
  };

  const handleCopyRfp = () => {
    if (!rfpMessage) return;
    navigator.clipboard.writeText(rfpMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-stone-900" />
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Vendor Roster & Checklist
            </h2>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Vetting, contractual milestones, and instant AI-drafted inquiry letters for each vendor category.
          </p>
        </div>

        <button
          onClick={() => setShowAddVendor(!showAddVendor)}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Vendor Category</span>
        </button>
      </div>

      {/* Status Segmented Filter Controls */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-xl overflow-x-auto scrollbar-none">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedStatus(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              selectedStatus === s
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Add Vendor Drawer */}
      {showAddVendor && (
        <form
          onSubmit={handleAddVendor}
          className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-sm font-serif font-bold text-stone-900">
              Add New Vendor Category
            </h3>
            <button
              type="button"
              onClick={() => setShowAddVendor(false)}
              className="text-xs text-stone-400 hover:text-stone-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <input
                type="text"
                required
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Florist, DJ, Cake Designer, Lighting"
                className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Company / Vendor Name (Optional)
              </label>
              <input
                type="text"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                placeholder="e.g. Bloom & Wild Studios"
                className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Target Budget ($)
              </label>
              <input
                type="number"
                min={0}
                value={newBudget}
                onChange={(e) => setNewBudget(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="contact@company.com"
                className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Booking Window
              </label>
              <input
                type="text"
                value={newTimeline}
                onChange={(e) => setNewTimeline(e.target.value)}
                placeholder="e.g. 6-9 months prior"
                className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Key Requirements & Constraints
            </label>
            <input
              type="text"
              value={newRequirements}
              onChange={(e) => setNewRequirements(e.target.value)}
              placeholder="e.g. Must provide vegan options, setup by 2 PM, battery generator needed"
              className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddVendor(false)}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg"
            >
              Add to Roster
            </button>
          </div>
        </form>
      )}

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-colors"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 block">
                    {vendor.category}
                  </span>
                  <h3 className="text-base font-serif font-bold text-stone-900 mt-0.5">
                    {vendor.companyName || 'Vendor to be Selected'}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={vendor.status}
                    onChange={(e) => handleStatusChange(vendor.id, e.target.value as VendorStatus)}
                    className="text-xs font-semibold px-2 py-1 rounded-lg border border-stone-200 bg-stone-50 focus:outline-hidden"
                  >
                    {statuses.filter((s) => s !== 'All').map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleDeleteVendor(vendor.id)}
                    className="p-1 text-stone-300 hover:text-rose-600 rounded"
                    title="Remove category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Financial & Timing Metadata Line */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-medium py-3">
                <span className="font-mono tabular-nums text-stone-900 font-bold">
                  Target: ${vendor.targetBudget.toLocaleString()}
                </span>
                {vendor.actualQuote && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums text-stone-700">
                      Quote: ${vendor.actualQuote.toLocaleString()}
                    </span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>Book by: {vendor.bookingTimeline}</span>
              </div>

              {/* Requirements */}
              {vendor.keyRequirements && (
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60 text-xs text-stone-600 mb-3">
                  <span className="font-semibold text-stone-800">Requirements: </span>
                  {vendor.keyRequirements}
                </div>
              )}

              {/* Contract Checklist verification */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => handleToggleDeposit(vendor.id)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    vendor.depositPaid ? 'text-emerald-700 font-semibold' : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Deposit Paid</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleInsurance(vendor.id)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    vendor.insuranceVerified ? 'text-emerald-700 font-semibold' : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Insurance Verified</span>
                </button>
              </div>

              {/* Questions to Ask */}
              {vendor.topQuestionsToAsk && vendor.topQuestionsToAsk.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-stone-100">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block mb-1">
                    Top Vetting Questions Before Signing:
                  </span>
                  <ul className="space-y-1 text-[11px] text-stone-600 list-disc list-inside">
                    {vendor.topQuestionsToAsk.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions: Contact & AI RFP */}
            <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-stone-500">
                {vendor.contactEmail && (
                  <a
                    href={`mailto:${vendor.contactEmail}`}
                    className="hover:text-stone-900 flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{vendor.contactEmail}</span>
                  </a>
                )}
                {vendor.contactPhone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{vendor.contactPhone}</span>
                  </span>
                )}
              </div>

              <button
                onClick={() => handleOpenRfpModal(vendor)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Draft Inquiry RFP</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RFP Preview & Copy Modal */}
      {rfpVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-serif font-bold text-stone-900">
                  AI Inquiry Letter: {rfpVendor.category}
                </h3>
              </div>
              <button
                onClick={() => setRfpVendor(null)}
                className="text-stone-400 hover:text-stone-700 text-xs"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-4">
              {isDraftingRfp ? (
                <div className="py-12 flex flex-col items-center justify-center text-stone-500 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                  <span className="text-xs">Drafting high-response vendor inquiry...</span>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 font-mono text-xs text-stone-800 whitespace-pre-line leading-relaxed max-h-96 overflow-y-auto">
                    {rfpMessage}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-stone-500">
                      Customize with vendor name before sending via email.
                    </span>
                    <button
                      onClick={handleCopyRfp}
                      className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
