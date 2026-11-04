import React from 'react';
import { FolderPlus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-slate-300 rounded-2xl my-6">
      <div className="w-14 h-14 mb-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563eb] shadow-sm">
        <FolderPlus className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all hover:shadow active:scale-[0.98]"
        >
          <FolderPlus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
