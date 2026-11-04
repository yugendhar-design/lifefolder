import React, { useState, useEffect } from 'react';
import { 
  FolderLock, 
  UploadCloud, 
  FileCheck2, 
  X, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Lock,
  Clock
} from 'lucide-react';
import { useDeadlines } from '../context/DeadlinesContext';
import { StatusBadge } from '../components/StatusBadge';
import { getDeadlineStatus, formatDisplayDate } from '../lib/status';
import { ViewScreen, CategoryType, DeadlineAttachment } from '../types';

interface AddEditDeadlinePageProps {
  onNavigate: (screen: ViewScreen, id?: string) => void;
  editId?: string;
}

export const AddEditDeadlinePage: React.FC<AddEditDeadlinePageProps> = ({
  onNavigate,
  editId,
}) => {
  const { addDeadline, updateDeadline, getDeadlineById } = useDeadlines();

  const isEdit = Boolean(editId);
  const existing = editId ? getDeadlineById(editId) : undefined;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>('Identity / Govt');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [reminderDays, setReminderDays] = useState<number>(30);
  const [attachment, setAttachment] = useState<DeadlineAttachment | undefined>(undefined);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Pre-fill if editing
  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setCategory(existing.category);
      setDeadlineDate(existing.deadline_date);
      setIdentifier(existing.identifier || '');
      setReminderDays(existing.reminder_days || 30);
      setAttachment(existing.attachment);
    }
  }, [existing]);

  const quickCategories: CategoryType[] = [
    'Identity / Govt',
    'Insurance',
    'Healthcare',
    'Vehicle',
    'Financial',
    'Subscription',
  ];

  const reminderOptions = [
    { label: '60 Days', value: 60 },
    { label: '30 Days', value: 30 },
    { label: '15 Days', value: 15 },
    { label: '7 Days', value: 7 },
    { label: '1 Day', value: 1 },
  ];

  // File handling
  const handleFile = (file: File) => {
    setErrorMsg(null);
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File exceeds 25MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachment({
        name: file.name,
        size: file.size,
        type: file.type || 'application/pdf',
        dataUrl: e.target?.result as string,
        uploadedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter a document name.');
      return;
    }
    if (!deadlineDate) {
      setErrorMsg('Please select an expiry or renewal date.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEdit && editId) {
        await updateDeadline(editId, {
          name: name.trim(),
          category,
          deadline_date: deadlineDate,
          identifier: identifier.trim() || undefined,
          reminder_days: reminderDays,
          attachment,
        });
        onNavigate('deadline-details', editId);
      } else {
        const res = await addDeadline({
          name: name.trim(),
          category,
          deadline_date: deadlineDate,
          identifier: identifier.trim() || undefined,
          reminder_days: reminderDays,
          attachment,
        });
        if (res.success) {
          onNavigate('all-deadlines');
        } else {
          setErrorMsg(res.error || 'Failed to save deadline.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Live Summary calculation
  const calculatedStatus = deadlineDate ? getDeadlineStatus(deadlineDate) : null;
  const isFilledCount = [name.trim(), deadlineDate].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-150">
      {/* Header & Breadcrumb (Figma 1:847) */}
      <div className="border-b border-[rgba(226,232,240,0.7)] pb-4">
        <div className="flex items-center gap-2 text-xs mb-1">
          <span 
            onClick={() => onNavigate('overview')}
            className="font-medium text-[#45464d] hover:text-[#0051d5] cursor-pointer"
          >
            Vault
          </span>
          <span className="text-[#cbd5e1]">/</span>
          <span 
            onClick={() => onNavigate('all-deadlines')}
            className="font-medium text-[#45464d] hover:text-[#0051d5] cursor-pointer"
          >
            Deadlines
          </span>
          <span className="text-[#cbd5e1]">/</span>
          <span className="font-semibold text-[#0051d5]">
            {isEdit ? 'Edit Entry' : 'Add Entry'}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
          {isEdit ? 'Edit Deadline' : 'Add Deadline'}
        </h2>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Two-Column Form & Summary Layout (Figma 1:865) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form Panel (span 8) */}
        <div className="lg:col-span-8 bg-white border border-[rgba(226,232,240,0.9)] rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-7">

            {/* SECTION 1: DEADLINE & DOCUMENT DETAILS */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-[#dbe1ff] text-[#0051d5] flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <h3 className="font-bold text-xs tracking-wider uppercase text-[#0b1c30]">
                    DEADLINE & DOCUMENT DETAILS
                  </h3>
                </div>
                <span className="text-xs text-[#45464d]">
                  Ref: <strong className="font-semibold text-[#0b1c30]">{formatDisplayDate(new Date().toISOString())}</strong>
                </span>
              </div>

              {/* Category Quick Selector */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#0b1c30]">
                    Category & Issuer Domain <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <span className="text-[11px] text-[#45464d]">Quick selector</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickCategories.map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-[rgba(219,225,255,0.6)] border border-[#0051d5] text-[#0051d5] font-semibold'
                            : 'bg-[#f8f9ff] border border-[#e2e8f0] text-[#45464d] hover:bg-slate-100'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Document Name */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#0b1c30]">
                    Document name <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <span className="text-[11px] text-[#45464d]">
                    {name.length} / 80
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Home Insurance, Passport, Driver's License"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0051d5] shadow-2xs placeholder:text-slate-400"
                  required
                />
                <p className="text-[11px] text-[#45464d]">
                  Official or common title. Duplicate names are permitted for different entities.
                </p>
              </div>

              {/* Date & Policy ID Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Expiry Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0b1c30]">
                    Expiry or renewal date <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0051d5] shadow-2xs"
                    required
                  />
                  <p className="text-[11px] text-[#45464d]">
                    Past dates will evaluate to Overdue automatically.
                  </p>
                </div>

                {/* Policy / Document ID */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0b1c30]">
                    Policy / Document ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g., US-9482019-B"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0051d5] shadow-2xs placeholder:text-slate-400"
                  />
                  <p className="text-[11px] text-[#45464d]">
                    Reference number listed on legal document header.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 2: DOCUMENT ATTACHMENT & VAULT UPLOAD */}
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-[#dbe1ff] text-[#0051d5] flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <h3 className="font-bold text-xs tracking-wider uppercase text-[#0b1c30]">
                    DOCUMENT ATTACHMENT & VAULT UPLOAD
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(219,225,255,0.5)] text-[#0051d5] text-[11px] font-semibold">
                  <Lock className="w-3 h-3" />
                  <span>Encrypted Vault</span>
                </span>
              </div>

              {/* Drag and Drop Zone (Figma 1:951) */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  isDragging 
                    ? 'border-[#0051d5] bg-blue-50/50 scale-[1.01]' 
                    : 'border-[#e2e8f0] bg-[rgba(239,244,255,0.4)] hover:bg-[rgba(239,244,255,0.7)]'
                }`}
              >
                <input
                  type="file"
                  id="vault-file-input"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-full bg-[rgba(219,225,255,0.6)] text-[#0051d5] mx-auto flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <label
                  htmlFor="vault-file-input"
                  className="cursor-pointer text-xs font-semibold text-[#0051d5] hover:underline"
                >
                  Browse files
                </label>
                <span className="text-xs text-[#0b1c30]"> or drag and drop your document here</span>

                <p className="text-[11px] text-[#45464d] mt-1.5">
                  Supports PDF, JPG, PNG up to 25MB (Encrypted in LifeFolder Personal Vault)
                </p>
              </div>

              {/* Uploaded File Card (Exact Figma 1:961) */}
              {attachment && (
                <div className="flex items-center justify-between p-3.5 bg-white border border-[rgba(226,232,240,0.9)] rounded-xl shadow-2xs animate-in fade-in">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#fef2f2] border border-[#fee2e2] text-rose-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#0b1c30] truncate">
                          {attachment.name}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#d1fae5] text-[#065f46]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Securely Vaulted</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-[#45464d]">
                        {(attachment.size / 1024 / 1024).toFixed(1)} MB • Uploaded just now
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAttachment(undefined)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 3: REMIND BEFORE EXPIRATION */}
            <div className="flex flex-col gap-3 pt-2">
              <label className="text-xs font-semibold text-[#0b1c30]">
                Remind Before Expiration
              </label>
              <div className="flex flex-wrap gap-2.5">
                {reminderOptions.map(opt => {
                  const isSelected = reminderDays === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setReminderDays(opt.value)}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[rgba(219,225,255,0.6)] border border-[#0051d5] text-[#0051d5] font-semibold'
                          : 'bg-white border border-[#e2e8f0] text-[#45464d] hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => onNavigate('overview')}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-white border border-[#e2e8f0] hover:bg-slate-50 text-[#0b1c30] text-xs font-semibold rounded-lg shadow-2xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#0051d5] hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {isSubmitting && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>{isEdit ? 'Update Deadline' : 'Save Deadline'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Live Summary Panel (Figma 1:1004) */}
        <div className="lg:col-span-4 bg-white border border-[rgba(226,232,240,0.9)] rounded-2xl p-6 shadow-sm sticky top-24">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#f1f5f9] mb-4">
            <h3 className="font-bold text-base text-[#0b1c30]">
              Summary
            </h3>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#e5eeff] text-[#45464d]">
              {isFilledCount} / 2 required filled
            </span>
          </div>

          <div className="flex flex-col gap-3 text-xs divide-y divide-dashed divide-slate-100">
            {/* Document Name */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[#45464d] font-medium">Document Name</span>
              <span className="font-semibold text-[#0b1c30] max-w-[170px] truncate text-right">
                {name || '—'}
              </span>
            </div>

            {/* Category */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[#45464d] font-medium">Category</span>
              <span className="font-semibold text-[#0b1c30] text-right">
                {category}
              </span>
            </div>

            {/* Policy ID */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[#45464d] font-medium">Policy ID</span>
              <span className="font-mono text-[11px] text-slate-700 text-right">
                {identifier || '—'}
              </span>
            </div>

            {/* Expiry Date */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[#45464d] font-medium">Expiry Date</span>
              <span className="font-semibold text-[#0b1c30] text-right">
                {deadlineDate ? formatDisplayDate(deadlineDate) : '—'}
              </span>
            </div>

            {/* Calculated Status */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[#45464d] font-medium">Calculated Status</span>
              <div>
                {calculatedStatus ? (
                  <StatusBadge status={calculatedStatus} size="sm" />
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>
            </div>

            {/* Reminder */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[#45464d] font-medium">Reminder</span>
              <span className="font-semibold text-[#0051d5] text-right">
                {reminderDays} Days Before
              </span>
            </div>

            {/* Attachment */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[#45464d] font-medium">Vaulted File</span>
              <span className="text-[11px] text-slate-700 text-right truncate max-w-[150px]">
                {attachment ? attachment.name : 'No attachment'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
