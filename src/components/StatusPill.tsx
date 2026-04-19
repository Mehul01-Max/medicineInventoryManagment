import { cn } from '@/lib/utils';
import type { StockStatus } from '@/lib/storage';

const STYLES: Record<StockStatus, { dot: string; bg: string; text: string; label: string }> = {
  critical: {
    dot: 'bg-destructive',
    bg: 'bg-[hsl(var(--critical-soft))]',
    text: 'text-destructive',
    label: 'Critical',
  },
  low: {
    dot: 'bg-warning',
    bg: 'bg-warning-soft',
    text: 'text-[hsl(36_95%_38%)] dark:text-warning',
    label: 'Low',
  },
  ok: {
    dot: 'bg-success',
    bg: 'bg-success-soft',
    text: 'text-success',
    label: 'OK',
  },
};

export const StatusPill = ({ status, className }: { status: StockStatus; className?: string }) => {
  const s = STYLES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        s.bg,
        s.text,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  );
};
