import React, { useState, useMemo } from 'react';
import { CelebrationEvent, BudgetItem, BudgetCategory } from '../../types/planner';
import { calculateBudgetMetrics } from '../../utils/plannerCalculations';
import { optimizeBudgetWithAI } from '../../services/aiPlannerService';
import {
  DollarSign,
  Plus,
  Trash2,
  CheckCircle,
  Sparkles,
  TrendingDown,
  AlertCircle,
  Loader2,
  ChevronRight,
  Filter
} from 'lucide-react';

interface BudgetTabProps {
  event: CelebrationEvent;
  onUpdateEvent: (updated: CelebrationEvent) => void;
}

export const BudgetTab: React.FC<BudgetTabProps> = ({ event, onUpdateEvent }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    summaryAnalysis: string;
    costSavingHacks: string[];
    reallocationSuggestions: string[];
    negotiationTips: string[];
  } | null>(null);

  // New item form
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState(
    event.budgetCategories[0]?.category || 'Venue & Rentals'
  );
  const [newItemEstimated, setNewItemEstimated] = useState<number>(500);
  const [newItemActual, setNewItemActual] = useState<number>(0);
  const [newItemPaid, setNewItemPaid] = useState(false);
  const [newItemNotes, setNewItemNotes] = useState('');

  // Math totals calculated via pure utility with memoization
  const metrics = useMemo(
    () => calculateBudgetMetrics(event.totalBudget, event.budgetCategories, event.budgetItems),
    [event.totalBudget, event.budgetCategories, event.budgetItems]
  );

  const totalAllocated = metrics.totalAllocated;
  const totalEstimated = metrics.totalEstimated;
  const totalActual = metrics.totalActual;
  const totalPaid = metrics.totalPaid;
  const remainingBudget = metrics.remainingBudget;
  const isOverBudget = metrics.isOverBudget;

  const categories = ['All', ...event.budgetCategories.map(c => c.category)];

  const filteredItems = selectedCategory === 'All'
    ? event.budgetItems
    : event.budgetItems.filter((i) => i.category === selectedCategory);

  const handleTogglePaid = (id: string) => {
    const updated = {
      ...event,
      budgetItems: event.budgetItems.map((i) =>
        i.id === id ? { ...i, paid: !i.paid } : i
      ),
    };
    onUpdateEvent(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = {
      ...event,
      budgetItems: event.budgetItems.filter((i) => i.id !== id),
    };
    onUpdateEvent(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: BudgetItem = {
      id: `bi-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      estimatedCost: Number(newItemEstimated),
      actualCost: Number(newItemActual) || Number(newItemEstimated),
      paid: newItemPaid,
      notes: newItemNotes.trim(),
    };

    const updated = {
      ...event,
      budgetItems: [...event.budgetItems, newItem],
    };
    onUpdateEvent(updated);
    setNewItemName('');
    setNewItemEstimated(500);
    setNewItemActual(0);
    setNewItemNotes('');
    setShowAddExpense(false);
  };

  const handleRunBudgetAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);
    try {
      const result = await optimizeBudgetWithAI({
        totalBudget: event.totalBudget,
        currentExpenses: event.budgetItems,
        eventType: event.eventType,
        guestCount: event.guestCount,
      });
      setAuditResult(result);
    } catch (err: any) {
      alert(`Could not complete budget audit: ${err.message || 'Error'}`);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Health Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Target Budget */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Target Ceiling
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-stone-900">
              ${event.totalBudget.toLocaleString()}
            </span>
          </div>
          <span className="text-xs text-stone-500 font-mono tabular-nums mt-1 block">
            ${totalAllocated.toLocaleString()} allocated across categories
          </span>
        </div>

        {/* KPI 2: Actual Committed */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Actual Committed
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-2xl font-bold font-mono tabular-nums ${isOverBudget ? 'text-rose-600' : 'text-stone-900'}`}>
              ${totalActual.toLocaleString()}
            </span>
          </div>
          <span className="text-xs text-stone-500 font-mono tabular-nums mt-1 block">
            ${totalEstimated.toLocaleString()} initial estimate
          </span>
        </div>

        {/* KPI 3: Remaining Buffer */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Uncommitted Funds
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-2xl font-bold font-mono tabular-nums ${remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              ${remainingBudget.toLocaleString()}
            </span>
          </div>
          <span className="text-xs text-stone-500 mt-1 block">
            {remainingBudget >= 0 ? 'Comfortable buffer' : 'Exceeding target ceiling'}
          </span>
        </div>

        {/* KPI 4: Invoices Paid */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Settled / Paid
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-stone-900">
              ${totalPaid.toLocaleString()}
            </span>
          </div>
          <span className="text-xs text-stone-500 font-mono tabular-nums mt-1 block">
            ${(totalActual - totalPaid).toLocaleString()} pending invoice payments
          </span>
        </div>
      </div>

      {/* Category Allocation Overview */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-base font-serif font-bold text-stone-900">
              Category Allocation Targets
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Recommended financial distribution for a {event.eventType.toLowerCase()} celebration with {event.guestCount} guests.
            </p>
          </div>
          <button
            onClick={handleRunBudgetAudit}
            disabled={isAuditing}
            className="px-3.5 py-2 text-xs font-semibold text-stone-900 bg-amber-300 hover:bg-amber-400 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap self-start sm:self-auto"
          >
            {isAuditing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>AI Budget Audit & Savings</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {event.budgetCategories.map((cat, idx) => {
            const actualForCat = event.budgetItems
              .filter((i) => i.category === cat.category)
              .reduce((sum, i) => sum + i.actualCost, 0);
            const isCatOver = actualForCat > cat.targetAmount;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/40 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-stone-900">
                    {cat.category}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-stone-500">
                    {cat.percentage}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs font-mono tabular-nums">
                  <span className="text-stone-500">
                    Spent: <span className={isCatOver ? 'text-rose-600 font-bold' : 'text-stone-900 font-semibold'}>${actualForCat.toLocaleString()}</span>
                  </span>
                  <span className="text-stone-400">
                    Target: ${cat.targetAmount.toLocaleString()}
                  </span>
                </div>

                <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCatOver ? 'bg-rose-500' : 'bg-stone-800'
                    }`}
                    style={{
                      width: `${Math.min(100, (actualForCat / (cat.targetAmount || 1)) * 100)}%`,
                    }}
                  />
                </div>

                {cat.tips && (
                  <p className="text-[10px] text-stone-500 leading-tight pt-1">
                    <span className="font-semibold text-stone-700">Pro-Tip: </span>
                    {cat.tips}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Budget Audit Result Banner */}
      {auditResult && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 text-xs text-amber-950 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <h4 className="text-sm font-serif font-bold text-amber-900">
                AI Budget Analysis & Cost-Saving Hacks
              </h4>
            </div>
            <button
              onClick={() => setAuditResult(null)}
              className="text-xs text-amber-800 hover:underline"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            {auditResult.summaryAnalysis}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200/80">
              <h5 className="font-bold text-amber-900 mb-2 uppercase text-[10px] tracking-wider">
                Cost-Saving Tactics
              </h5>
              <ul className="space-y-1.5 list-disc list-inside text-stone-700">
                {auditResult.costSavingHacks.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200/80">
              <h5 className="font-bold text-amber-900 mb-2 uppercase text-[10px] tracking-wider">
                Reallocation Advice
              </h5>
              <ul className="space-y-1.5 list-disc list-inside text-stone-700">
                {auditResult.reallocationSuggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200/80">
              <h5 className="font-bold text-amber-900 mb-2 uppercase text-[10px] tracking-wider">
                Contract Negotiation Tips
              </h5>
              <ul className="space-y-1.5 list-disc list-inside text-stone-700">
                {auditResult.negotiationTips.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Itemized Expense Ledger */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base font-serif font-bold text-stone-900">
              Itemized Expense Ledger
            </h3>
            <span className="text-xs text-stone-500">
              Track invoice payments, contracts, and variance between estimates and invoices
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddExpense(!showAddExpense)}
              className="px-3 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-xl overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Add Expense Drawer */}
        {showAddExpense && (
          <form
            onSubmit={handleAddItem}
            className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3"
          >
            <div className="flex items-center justify-between pb-1 border-b border-stone-200">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Log New Celebration Expense
              </h4>
              <button
                type="button"
                onClick={() => setShowAddExpense(false)}
                className="text-xs text-stone-400 hover:text-stone-700"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Lawn Ceremony Chairs & Canopy"
                  className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:ring-1 focus:ring-stone-900"
                >
                  {event.budgetCategories.map((c) => (
                    <option key={c.category} value={c.category}>
                      {c.category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Estimated ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newItemEstimated}
                    onChange={(e) => setNewItemEstimated(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Actual ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newItemActual}
                    onChange={(e) => setNewItemActual(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg font-mono tabular-nums"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newItemPaid}
                  onChange={(e) => setNewItemPaid(e.target.checked)}
                  className="rounded text-stone-900 focus:ring-stone-900"
                />
                <span>Invoice / Deposit marked as Paid</span>
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Dense Financial Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 font-semibold uppercase text-[10px] tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Item / Service</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Estimated</th>
                <th className="py-2.5 px-3 text-right">Actual</th>
                <th className="py-2.5 px-3 text-right">Variance</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {filteredItems.map((item) => {
                const variance = item.actualCost - item.estimatedCost;
                return (
                  <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-medium text-stone-900">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-stone-500">
                      {item.category}
                    </td>
                    <td className="py-2.5 px-3 text-right text-stone-500 tabular-nums">
                      ${item.estimatedCost.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-stone-900 tabular-nums">
                      ${item.actualCost.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {variance === 0 ? (
                        <span className="text-stone-400">$0</span>
                      ) : variance > 0 ? (
                        <span className="text-rose-600 font-bold">+${variance.toLocaleString()}</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">-${Math.abs(variance).toLocaleString()}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleTogglePaid(item.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium transition-colors ${
                          item.paid
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}
                      >
                        {item.paid ? 'Paid' : 'Unpaid'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-stone-400 font-sans">
                    No expense records found. Click "Log Expense" to add your first invoice item.
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
