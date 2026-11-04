import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  FileText, 
  ShieldAlert, 
  Clock, 
  CalendarClock, 
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useDeadlines } from '../context/DeadlinesContext';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { getDeadlineStatus, getRelativeTimeText, formatDisplayDate } from '../lib/status';
import { ViewScreen, Deadline } from '../types';

interface OverviewPageProps {
  onNavigate: (screen: ViewScreen, deadlineId?: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const { deadlines, counts, deleteDeadline, exportDeadlinesCSV, isLoading } = useDeadlines();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deadlineToDelete = deadlines.find(d => d.id === deletingId);

  // Filter deadlines
  const filteredDeadlines = deadlines.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.identifier && d.identifier.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const recentList = filteredDeadlines.slice(0, 5);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    await deleteDeadline(deletingId);
    setIsDeleting(false);
    setDeletingId(null);
  };

  const categories = ['All', 'Identity / Govt', 'Insurance', 'Healthcare', 'Vehicle', 'Financial'];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-150">
      {/* Breadcrumbs & Header Row (Figma 1:204) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs mb-1">
            <span className="font-medium text-[#94a3b8]">LifeFolder</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#cbd5e1]" />
            <span className="font-semibold text-[#2563eb]">Document Deadlines</span>
          </div>
          <h2 className="text-2xl sm:text-[24px] font-bold text-[#0f172a] tracking-tight leading-tight">
            Document Deadlines
          </h2>
          <p className="text-[13.5px] text-[#64748b] mt-0.5">
            Track expiry and renewal dates for your essential documents in one deterministic vault.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('add-deadline')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-[13.5px] rounded-xl shadow-[0px_1px_2px_rgba(37,99,235,0.25)] transition-all shrink-0 self-start sm:self-auto hover:shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Deadlines</span>
        </button>
      </div>

      {/* SECTION 2: Metric Cards & Status Layout (Exact Figma 1:223) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Active Tracked (Dark Premium Card with Sparkline Wave) */}
        <div className="relative overflow-hidden bg-[#111827] text-white rounded-2xl p-5 shadow-sm border border-slate-800 flex flex-col justify-between min-h-[160px]">
          {/* Subtle Ambient Glow */}
          <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
                TOTAL documents
              </span>
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-blue-400">
                <FileText className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-white leading-none">
                {counts.total}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-[#34d399] border border-emerald-500/30">
                <Activity className="w-3 h-3" />
                <span>active</span>
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>All registered vaults</span>
            {/* Mini Sparkline Wave representation */}
            <div className="flex items-center gap-0.5 text-blue-400">
              <span className="w-1 h-2 bg-blue-500/40 rounded-full" />
              <span className="w-1 h-3.5 bg-blue-500/60 rounded-full" />
              <span className="w-1 h-2 bg-blue-500/50 rounded-full" />
              <span className="w-1 h-4 bg-blue-400 rounded-full" />
              <span className="w-1 h-2.5 bg-blue-500/70 rounded-full" />
              <span className="w-1 h-5 bg-blue-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* Card 2: Overdue Status (Red Urgency Card) */}
        <div className="bg-white rounded-2xl p-5 border border-[rgba(226,232,240,0.8)] shadow-sm flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#f43f5e]" />
                <span className="text-[11px] font-semibold tracking-wider text-[#e11d48] uppercase">
                  OVERDUE
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#fff1f2] flex items-center justify-center text-[#e11d48]">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#0f172a] tracking-tight leading-none">
                {counts.overdue}
              </span>
              <span className="text-xs font-semibold text-[#e11d48]">
                critical
              </span>
            </div>

            {/* Urgency Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-[#f43f5e] rounded-full transition-all"
                style={{ width: counts.total > 0 ? `${(counts.overdue / counts.total) * 100}%` : '0%' }}
              />
            </div>
          </div>

          <div className="text-[11px] text-[#94a3b8] mt-3 pt-2 border-t border-slate-50">
            {counts.overdue > 0 ? 'Requires immediate action' : 'No overdue documents'}
          </div>
        </div>

        {/* Card 3: Due Now / Today (Alert Amber Card) */}
        <div className="bg-white rounded-2xl p-5 border border-[rgba(226,232,240,0.8)] shadow-sm flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                <span className="text-[11px] font-semibold tracking-wider text-[#d97706] uppercase">
                  DUE NOW
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#fffbeb] flex items-center justify-center text-[#d97706]">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#0f172a] tracking-tight leading-none">
                {counts.dueToday}
              </span>
              <span className="text-xs font-semibold text-[#d97706]">
                Files
              </span>
            </div>

            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-[#f59e0b] rounded-full transition-all"
                style={{ width: counts.total > 0 ? `${(counts.dueToday / counts.total) * 100}%` : '0%' }}
              />
            </div>
          </div>

          <div className="text-[11px] text-[#94a3b8] mt-3 pt-2 border-t border-slate-50">
            {counts.dueToday > 0 ? 'Expiring by 23:59 tonight' : 'Nothing due today'}
          </div>
        </div>

        {/* Card 4: Approaching / Upcoming Renewal (Blue Card with Progress Ring) */}
        <div className="bg-white rounded-2xl p-5 border border-[rgba(226,232,240,0.8)] shadow-sm flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                <span className="text-[11px] font-semibold tracking-wider text-[#2563eb] uppercase">
                  UPCOMING RENEWAL
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
                <CalendarClock className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-[#0f172a] tracking-tight leading-none block">
                  {counts.approaching}
                </span>
                <span className="text-xs text-[#64748b] font-medium mt-1 block">
                  ≤ 30 days
                </span>
              </div>

              {/* Radial Meter Visual */}
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-600 transition-all duration-500"
                    strokeDasharray={`${counts.total > 0 ? Math.min(100, (counts.approaching / counts.total) * 100) : 0}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#94a3b8] mt-3 pt-2 border-t border-slate-50">
            {counts.approaching > 0 ? 'Approaching renewal window' : 'No 30-day renewals'}
          </div>
        </div>
      </div>

      {/* SECTION 3: Recent Deadlines Table Container (Figma Exact 1:296) */}
      <div className="bg-white border border-[rgba(226,232,240,0.8)] rounded-2xl p-6 shadow-sm">
        {/* Table Card Header with Search, Filter & Export */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <h3 className="text-[17px] font-bold text-[#0f172a] tracking-tight">
              Recent Deadlines
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] text-xs font-semibold">
              {filteredDeadlines.length} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#94a3b8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deadlines..."
                className="w-full pl-10 pr-3.5 py-1.5 bg-[#f8fafc] border border-[rgba(226,232,240,0.8)] rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>

            {/* Filter Toggle Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border rounded-xl text-xs font-medium transition-colors ${
                  showFilters || selectedCategory !== 'All' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50/30' 
                    : 'border-[#e2e8f0] text-[#334155] hover:bg-slate-50'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              {/* Filter Dropdown Popover */}
              {showFilters && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setShowFilters(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-30 animate-in fade-in zoom-in-95">
                    <span className="block px-2 py-1 text-[10px] font-semibold uppercase text-slate-400">
                      Category
                    </span>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setShowFilters(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedCategory === cat ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Export CSV Button (Exact Figma 1:315) */}
            <button
              type="button"
              onClick={exportDeadlinesCSV}
              disabled={deadlines.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] hover:bg-slate-50 text-[#334155] text-xs font-medium rounded-xl transition-colors disabled:opacity-50"
              title="Export all records as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table View: Deterministic Chronological Records */}
        {recentList.length === 0 ? (
          <EmptyState
            title="No deadlines tracked yet"
            description="Start by adding your passport, insurance policies, or subscriptions to receive automated renewal tracking."
            actionLabel="Add First Deadline"
            onAction={() => onNavigate('add-deadline')}
          />
        ) : (
          <div className="overflow-x-auto border border-[#f1f5f9] rounded-xl">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[rgba(248,250,252,0.75)] border-b border-[rgba(226,232,240,0.8)] text-[#64748b] text-[11px] font-semibold tracking-wider uppercase">
                  <th className="py-3 px-5">Document Name & ID</th>
                  <th className="py-3 px-5">Expiry Date</th>
                  <th className="py-3 px-5">Days Left</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
                {recentList.map((item) => {
                  const status = getDeadlineStatus(item.deadline_date);
                  const relative = getRelativeTimeText(item.deadline_date);
                  const isExp = status === 'Overdue';

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            item.category === 'Identity / Govt' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                            item.category === 'Insurance' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                            item.category === 'Vehicle' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                            'bg-slate-50 border-slate-200 text-slate-600'
                          }`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span 
                              onClick={() => onNavigate('deadline-details', item.id)}
                              className="font-bold text-[#0f172a] block hover:text-[#2563eb] cursor-pointer"
                            >
                              {item.name}
                            </span>
                            <span className="font-mono text-[11px] text-[#94a3b8] block">
                              {item.identifier || '#DOC-GEN-2026'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-[#1e293b] block">
                          {formatDisplayDate(item.deadline_date)}
                        </span>
                        <span className={`text-[11px] ${isExp ? 'text-[#e11d48] font-medium' : 'text-[#64748b]'}`}>
                          {isExp ? 'Past due' : item.category}
                        </span>
                      </td>

                      {/* Days Left */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5">
                          <Clock className={`w-3.5 h-3.5 ${
                            status === 'Overdue' ? 'text-[#e11d48]' :
                            status === 'Due today' ? 'text-[#d97706]' : 'text-slate-400'
                          }`} />
                          <span className={`font-medium ${
                            status === 'Overdue' ? 'text-[#e11d48]' :
                            status === 'Due today' ? 'text-[#d97706]' : 'text-slate-600'
                          }`}>
                            {relative}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <StatusBadge status={status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onNavigate('deadline-details', item.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View document details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigate('edit-deadline', item.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit deadline"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete deadline"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* View All Deadlines Link */}
        {deadlines.length > 5 && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => onNavigate('all-deadlines')}
              className="text-xs font-semibold text-[#2563eb] hover:underline"
            >
              View all {deadlines.length} tracked deadlines →
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal (Exact Prompt Requirements) */}
      <Modal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        title="Delete Deadline"
        confirmLabel="Delete Permanently"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      >
        <p className="mb-2">
          Are you sure you want to delete <strong className="text-slate-900 font-semibold">{deadlineToDelete?.name}</strong>?
        </p>
        <p className="text-xs text-slate-500">
          This will permanently remove the deadline record and any associated encrypted attachment. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};
