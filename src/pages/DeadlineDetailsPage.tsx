import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Download, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Lock, 
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useDeadlines } from '../context/DeadlinesContext';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { getDeadlineStatus, getRelativeTimeText, formatDisplayDate } from '../lib/status';
import { ViewScreen } from '../types';

interface DeadlineDetailsPageProps {
  deadlineId: string;
  onNavigate: (screen: ViewScreen, id?: string) => void;
}

export const DeadlineDetailsPage: React.FC<DeadlineDetailsPageProps> = ({
  deadlineId,
  onNavigate,
}) => {
  const { getDeadlineById, deleteDeadline } = useDeadlines();
  const deadline = getDeadlineById(deadlineId);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!deadline) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Record Not Found</h3>
        <p className="text-sm text-slate-500 mb-6">
          This deadline may have been deleted or moved.
        </p>
        <button
          onClick={() => onNavigate('all-deadlines')}
          className="px-4 py-2 bg-[#2563eb] text-white text-xs font-semibold rounded-xl"
        >
          Return to Deadlines
        </button>
      </div>
    );
  }

  const status = getDeadlineStatus(deadline.deadline_date);
  const relative = getRelativeTimeText(deadline.deadline_date);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteDeadline(deadline.id);
    setIsDeleting(false);
    setDeleteModalOpen(false);
    onNavigate('all-deadlines');
  };

  const handleDownload = () => {
    if (!deadline.attachment) return;

    if (deadline.attachment.dataUrl) {
      const a = document.createElement('a');
      a.href = deadline.attachment.dataUrl;
      a.download = deadline.attachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert(`Downloading ${deadline.attachment.name} from encrypted storage...`);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-150">
      {/* Top Breadcrumb & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => onNavigate('all-deadlines')}
            className="flex items-center gap-1.5 font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Deadlines</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800 truncate max-w-xs">
            {deadline.name}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('edit-deadline', deadline.id)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Record</span>
          </button>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white border border-[rgba(226,232,240,0.8)] rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* Title & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563eb] shrink-0 shadow-xs">
              <FileText className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                  {deadline.category}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  {deadline.identifier || '#DOC-RECORD'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
                {deadline.name}
              </h2>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <StatusBadge status={status} />
            <span className="text-xs text-slate-500 font-medium">
              {relative}
            </span>
          </div>
        </div>

        {/* Stored Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6 border-b border-slate-100 text-xs">
          
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
              Exact Expiry / Renewal Date
            </span>
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{formatDisplayDate(deadline.deadline_date)}</span>
            </div>
            <span className="text-slate-500 text-[11px]">
              ISO: {deadline.deadline_date}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
              Document / Policy Identifier
            </span>
            <div className="text-slate-900 font-mono font-semibold text-sm">
              {deadline.identifier || 'None specified'}
            </div>
            <span className="text-slate-500 text-[11px]">
              Unique legal reference
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
              Reminder Schedule
            </span>
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{deadline.reminder_days} Days Before Expiration</span>
            </div>
            <span className="text-slate-500 text-[11px]">
              Saved preference
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
              Record Created
            </span>
            <div className="text-slate-800 font-medium">
              {formatDisplayDate(deadline.created_at)}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
              Last Modified
            </span>
            <div className="text-slate-800 font-medium">
              {formatDisplayDate(deadline.updated_at)}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
              Security Governance
            </span>
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Personal Vault Protected</span>
            </div>
          </div>

        </div>

        {/* Attachment Card */}
        <div className="pt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>Vaulted Document Attachment</span>
          </h4>

          {deadline.attachment ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {deadline.attachment.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {(deadline.attachment.size / 1024 / 1024).toFixed(1)} MB • {deadline.attachment.type}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download Secure File</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
              No document file attached to this record. You can attach a PDF or image by editing the deadline.
            </div>
          )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Deadline"
        confirmLabel="Delete Permanently"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      >
        <p className="mb-2">
          Are you sure you want to permanently delete <strong className="text-slate-900 font-semibold">{deadline.name}</strong>?
        </p>
        <p className="text-xs text-slate-500">
          This will delete the deadline record and any vaulted file attachment. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};
