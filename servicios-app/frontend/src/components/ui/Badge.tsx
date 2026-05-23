import { HTMLAttributes } from 'react';
import { RequestStatus } from '@/types';
import { STATUS_LABELS, STATUS_DOT, STATUS_COLORS, cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'muted';
}

const badgeVariants = {
  default: 'bg-gray-900 text-white',
  outline: 'border border-gray-200 text-gray-600 bg-white',
  muted:   'bg-gray-100 text-gray-500',
};

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md',
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
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium',
        STATUS_COLORS[status],
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', STATUS_DOT[status])} />
      {STATUS_LABELS[status]}
    </span>
  );
}
