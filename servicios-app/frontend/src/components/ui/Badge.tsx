import { HTMLAttributes } from 'react';
import { RequestStatus } from '@/types';
import { STATUS_LABELS, STATUS_DOT, STATUS_TEXT, cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'blue' | 'green' | 'amber' | 'red' | 'violet';
}

const badgeVariants = {
  default: 'bg-gray-800 text-gray-400 border-gray-700',
  blue: 'bg-blue-950/40 text-blue-400 border-blue-900/60',
  green: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60',
  amber: 'bg-amber-950/40 text-amber-400 border-amber-900/60',
  red: 'bg-red-950/40 text-red-400 border-red-900/60',
  violet: 'bg-violet-950/40 text-violet-400 border-violet-900/60',
};

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md border tracking-wide',
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', STATUS_DOT[status])} />
      <span className={cn('text-xs font-medium', STATUS_TEXT[status])}>
        {STATUS_LABELS[status]}
      </span>
    </span>
  );
}
