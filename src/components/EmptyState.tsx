import { Pill } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export const EmptyState = ({ title, description, action, icon, className }: Props) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-center px-6 py-12 rounded-2xl border border-dashed border-border bg-card/60',
      className
    )}
  >
    <div className="h-14 w-14 rounded-full bg-primary-soft text-primary flex items-center justify-center mb-4">
      {icon ?? <Pill className="h-6 w-6" />}
    </div>
    <h3 className="font-semibold text-base">{title}</h3>
    {description && <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
