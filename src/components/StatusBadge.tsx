import React from 'react';
import { DeadlineStatus } from '../types';

interface StatusBadgeProps {
  status: DeadlineStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs = {
    Overdue: {
      bg: 'bg-[#ffe4e6] border-[#fecdd3] text-[#be123c]',
      dot: 'bg-[#e11d48]',
      label: 'Overdue',
    },
    'Due today': {
      bg: 'bg-[#fef3c7] border-[#fde68a] text-[#92400e]',
      dot: 'bg-[#d97706]',
      label: 'Due Now',
    },
    Approaching: {
      bg: 'bg-[#eff6ff] border-[#bfdbfe] text-[#1d4ed8]',
      dot: 'bg-[#2563eb]',
      label: 'Approaching',
    },
    Upcoming: {
      bg: 'bg-[#f1f5f9] border-[#e2e8f0] text-[#334155]',
      dot: 'bg-[#64748b]',
      label: 'Upcoming',
    },
  };

  const current = configs[status] || configs.Upcoming;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[12px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border border-solid transition-colors ${current.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
};
