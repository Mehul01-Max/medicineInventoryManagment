import { useMemo, useState } from 'react';
import { Search, Plus, Minus, Check } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMedicines, useSales } from '@/lib/useStore';
import { store, getStockStatus } from '@/lib/storage';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Sales = () => {
  const [meds] = useMedicines();
  const [sales] = useSales();
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<Record<string, number>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? meds.filter(m => m.name.toLowerCase().includes(q)) : meds;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [meds, query]);

  const setQty = (id: string, qty: number) => {
    setDraft(prev => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const totalItems = Object.values(draft).reduce((a, b) => a + b, 0);

  const recordAll = async () => {
    for (const [id, qty] of Object.entries(draft)) {
      await store.recordSale(id, qty);
    }
    toast.success(`Recorded ${totalItems} sale${totalItems === 1 ? '' : 's'}`);
    setDraft({});
  };

  const todaysSalesCount = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return sales.filter(s => s.date >= start.getTime()).reduce((sum, s) => sum + s.qty, 0);
  }, [sales]);

  return (
    <>
      <PageHeader title="Record sales" subtitle={`${todaysSalesCount} sold today`} />

      <main className="flex-1 px-4 pt-3 pb-32">
        {meds.length === 0 ? (
          <EmptyState
            title="No medicines yet"
            description="Add medicines to your inventory before recording sales."
            action={
              <Button asChild>
                <Link to="/inventory/add">Add medicine</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search medicine..."
                className="pl-9 h-12 rounded-xl"
                autoFocus
              />
            </div>

            <ul className="space-y-2">
              {filtered.map(m => {
                const qty = draft[m.id] ?? 0;
                const status = getStockStatus(m);
                return (
                  <li
                    key={m.id}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-card',
                      qty > 0 && 'border-primary/40 bg-primary-soft/40'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[15px] truncate">{m.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {m.stock} {m.unit ?? 'units'} left
                        {status !== 'ok' && (
                          <span className={cn('ml-1.5 font-semibold', status === 'critical' ? 'text-destructive' : 'text-warning')}>
                            • {status}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQty(m.id, Math.max(0, qty - 1))}
                        disabled={qty === 0}
                        aria-label={`Decrease ${m.name}`}
                        className="h-10 w-10 rounded-full"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold tabular-nums">{qty}</span>
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => setQty(m.id, Math.min(m.stock, qty + 1))}
                        disabled={qty >= m.stock}
                        aria-label={`Increase ${m.name}`}
                        className="h-10 w-10 rounded-full"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="text-center text-sm text-muted-foreground py-8">
                  No medicines match "{query}"
                </li>
              )}
            </ul>
          </>
        )}
      </main>

      {totalItems > 0 && (
        <div className="fixed bottom-20 inset-x-0 z-30 px-4 animate-slide-up">
          <div className="mx-auto max-w-md">
            <Button
              onClick={recordAll}
              size="lg"
              className="w-full h-14 text-base font-semibold shadow-floating rounded-2xl"
            >
              <Check className="h-5 w-5 mr-2" />
              Record {totalItems} sale{totalItems === 1 ? '' : 's'}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sales;
