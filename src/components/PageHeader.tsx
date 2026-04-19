import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: ReactNode;
  className?: string;
};

export const PageHeader = ({ title, subtitle, back, action, className }: Props) => {
  const navigate = useNavigate();
  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/60 safe-top',
        className
      )}
    >
      <div className="mx-auto max-w-md flex items-center gap-2 px-4 py-3 min-h-[60px]">
        {back && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="-ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  );
};
