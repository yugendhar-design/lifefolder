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
  Clock, 
  ArrowUpDown,
  ChevronRight
} from 'lucide-react';
import { useDeadlines } from '../context/DeadlinesContext';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { getDeadlineStatus, getRelativeTimeText, formatDisplayDate } from '../lib/status';
import { ViewScreen, DeadlineStatus, CategoryType } from '../types';

interface AllDeadlinesPageProps {
  onNavigate: (screen: ViewScreen, deadlineId?: string) => void;
}

export const AllDeadlinesPage: React.FC<AllDeadlinesPageProps> = ({ onNavigate }) => {
  const { deadlines, deleteDeadline, exportDeadlinesCSV, counts } = useDeadlines();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortAscending, setSortAscending] = useState(true);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deadlineToDelete = deadlines.find(d => d.id === deletingId);

  // Sorting and Filtering
  const filteredDeadlines = deadlines.filter(d => {
    const status = getDeadlineStatus(d.deadline_date);

    const matchesSearch = 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.identifier && d.identifier.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || status === selectedStatus;
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort by date
  const sortedDeadlines = [...filteredDeadlines].sort((a, b) => {
    const dateA = new Date(a.deadline_date).getTime();
    const dateB = new Date(b.deadline_date).getTime();
    return sortAscending ? dateA - dateB : dateB - dateA;
  });

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    await deleteDeadline(deletingId);
    setIsDeleting(false);
    setDeletingId(null);
  };

  const categories: ('All' | CategoryType)[] = [
    'All',
    'Identity / Govt',
    'Insurance',
    'Healthcare',
    'Vehicle',
    'Financial',
    'Subscription',
    'Other',
  ];

  const statuses = ['All', 'Overdue', 'Due today', 'Approaching', 'Upcoming'];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs mb-1">
            <span 
              onClick={() => onNavigate('overview')}
              className="font-medium text-[#94a3b8] hover:text-[#2563eb] cursor-pointer"
            >
              LifeFolder
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#cbd5e1]" />
            <span className="font-semibold text-[#2563eb]">All Deadlines</span>
          </div>
          <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            All Tracked Deadlines
          </h2>
          <p className="text-[13.5px] text-[#64748b] mt-0.5">
            Full chronological inventory of all document deadlines, certificates, and renewals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('add-deadline')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-[13.5px] rounded-xl shadow-sm transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Deadline</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#94a3b8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID (#DOC-...), or category..."
            className="w-full pl-10 pr-3.5 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
        </div>

        {/* Dropdowns & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          >
            {statuses.map(st => (
              <option key={st} value={st}>Status: {st}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>Category: {cat}</option>
            ))}
          </select>

          {/* Sort Toggle */}
          <button
            type="button"
            onClick={() => setSortAscending(!sortAscending)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl transition-colors"
            title="Toggle sort order"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortAscending ? 'Nearest First' : 'Farthest First'}</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={exportDeadlinesCSV}
            disabled={deadlines.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-[#334155] text-xs font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[rgba(226,232,240,0.8)] rounded-2xl shadow-sm overflow-hidden">
        {sortedDeadlines.length === 0 ? (
          <EmptyState
            title="No matching deadlines found"
            description={
              searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'
                ? "Try adjusting your search criteria or resetting filters to find what you need."
                : "Your vault is currently empty. Add your first document deadline to start tracking."
            }
            actionLabel="Add Deadline"
            onAction={() => onNavigate('add-deadline')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-[rgba(248,250,252,0.85)] border-b border-[rgba(226,232,240,0.8)] text-[#64748b] text-[11px] font-semibold tracking-wider uppercase">
                  <th className="py-3.5 px-6">Document Name & ID</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Expiry Date</th>
                  <th className="py-3.5 px-6">Remaining</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {sortedDeadlines.map((item) => {
                  const status = getDeadlineStatus(item.deadline_date);
                  const relative = getRelativeTimeText(item.deadline_date);

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Name & ID */}
                      <td className="py-4 px-6">
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
                              {item.identifier || '#DOC-RECORD'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {item.category}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-4 px-6 font-semibold text-[#1e293b]">
                        {formatDisplayDate(item.deadline_date)}
                      </td>

                      {/* Remaining Days */}
                      <td className="py-4 px-6">
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
                      <td className="py-4 px-6">
                        <StatusBadge status={status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onNavigate('deadline-details', item.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigate('edit-deadline', item.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
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
      </div>

      {/* Delete Confirmation Modal */}
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
