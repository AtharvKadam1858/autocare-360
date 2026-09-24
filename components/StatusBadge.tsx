import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const norm = (status || '').toUpperCase().replace(/[\s-]/g, '_');

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  // Green / Completed / Paid / Approved / Passed
  if (['APPROVED', 'PAID', 'COMPLETED', 'PASSED', 'DELIVERED', 'GOOD', 'IN_STOCK'].includes(norm)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  }
  // Amber / Pending / Waiting / Attention / Partially Paid
  else if (['WAITING_FOR_APPROVAL', 'PENDING_APPROVAL', 'REQUESTED', 'CONFIRMED', 'ATTENTION', 'LOW_STOCK', 'PARTIALLY_PAID', 'PENDING'].includes(norm)) {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  }
  // Blue / In Progress / Inspection / Checked In / Ready
  else if (['IN_PROGRESS', 'INSPECTION', 'CHECKED_IN', 'QUALITY_CHECK', 'READY_FOR_DELIVERY', 'SENT'].includes(norm)) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
    dotColor = 'bg-blue-500';
  }
  // Red / Critical / Rejected / Failed / Out of Stock / Cancelled / Unpaid
  else if (['REJECTED', 'FAILED', 'CRITICAL', 'OUT_OF_STOCK', 'CANCELLED', 'UNPAID'].includes(norm)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
  }
  // Gray / Draft / Expired
  else if (['DRAFT', 'EXPIRED'].includes(norm)) {
    colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
    dotColor = 'bg-slate-400';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  }[size];

  const label = norm.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
};
