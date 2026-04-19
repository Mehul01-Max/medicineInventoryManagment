import { Check, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusPill } from './StatusPill';
import { getStockStatus, suggestReorder, type Medicine, type SaleEntry, store } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Props = {
  medicine: Medicine;
  sales: SaleEntry[];
  showReorder?: boolean;
};

export const MedicineCard = ({ medicine, sales, showReorder = true }: Props) => {
  const status = getStockStatus(medicine);
  const { daysRemaining, suggested, avgDaily } = suggestReorder(medicine, sales);

  const handleMarkOrdered = () => {
    store.updateMedicine(medicine.id, { ordered: true, orderedAt: Date.now() });
    toast.success(`Marked "${medicine.name}" as ordered`);
  };

  const handleRestock = () => {
    store.updateMedicine(medicine.id, {
      stock: medicine.stock + suggested,
      ordered: false,
    });
    toast.success(`Added ${suggested} ${medicine.unit ?? 'units'} to ${medicine.name}`);
  };

  return (
    <article
      className={cn(
        'rounded-2xl border bg-card p-4 shadow-card transition-shadow',
        status === 'critical' && 'border-destructive/30',
        status === 'low' && 'border-warning/40',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[15px] leading-tight truncate">{medicine.name}</h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{medicine.stock}</span>
              {medicine.unit ? ` ${medicine.unit}` : ''} left
            </span>
            <span aria-hidden>•</span>
            <span>min {medicine.threshold}</span>
          </div>
        </div>
        <StatusPill status={status} />
      </div>

      {showReorder && (status === 'critical' || status === 'low') && (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-muted/60 px-3 py-2">
              <div className="text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-3 w-3" /> Days left
              </div>
              <div className="font-semibold text-sm mt-0.5">
                {daysRemaining === null ? '—' : `${daysRemaining}d`}
              </div>
            </div>
            <div className="rounded-xl bg-primary-soft px-3 py-2">
              <div className="text-primary/80">Reorder</div>
              <div className="font-semibold text-sm mt-0.5 text-primary">
                {suggested} {medicine.unit ?? 'units'}
              </div>
            </div>
          </div>

          {avgDaily > 0 && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Selling ~{avgDaily.toFixed(1)} per day (last 7 days)
            </p>
          )}

          <div className="mt-3 flex gap-2">
            {medicine.ordered ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex-1 h-10"
                onClick={handleRestock}
              >
                Mark received
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className="flex-1 h-10"
                onClick={handleMarkOrdered}
              >
                <Check className="h-4 w-4 mr-1.5" />
                Mark as ordered
              </Button>
            )}
          </div>

          {medicine.ordered && (
            <p className="mt-2 text-[11px] text-success font-medium flex items-center gap-1">
              <Check className="h-3 w-3" /> Order placed — tap "Mark received" when stock arrives
            </p>
          )}
        </>
      )}
    </article>
  );
};
