import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingCart, Package, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { MedicineCard } from '@/components/MedicineCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { useMedicines, useSales } from '@/lib/useStore';
import { getStockStatus } from '@/lib/storage';

const Dashboard = () => {
  const [meds] = useMedicines();
  const [sales] = useSales();

  const { critical, low, ok } = useMemo(() => {
    const critical = meds.filter(m => getStockStatus(m) === 'critical');
    const low = meds.filter(m => getStockStatus(m) === 'low');
    const ok = meds.filter(m => getStockStatus(m) === 'ok');
    return { critical, low, ok };
  }, [meds]);

  const todaysSales = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return sales.filter(s => s.date >= start.getTime()).reduce((sum, s) => sum + s.qty, 0);
  }, [sales]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <>
      <PageHeader title="StockSmart" subtitle={`${greeting} 👋`} />

      <main className="flex-1 px-4 pt-2 pb-6 space-y-6">
        {/* Quick stats */}
        <section aria-label="Summary" className="grid grid-cols-3 gap-2">
          <StatTile label="Critical" value={critical.length} tone="critical" />
          <StatTile label="Low" value={low.length} tone="warning" />
          <StatTile label="Sold today" value={todaysSales} tone="primary" />
        </section>

        {meds.length === 0 ? (
          <EmptyState
            title="Add your first medicine"
            description="Start by adding a few medicines so we can track your stock and suggest reorders."
            action={
              <Button asChild size="lg">
                <Link to="/inventory/add">
                  <Plus className="h-4 w-4 mr-1.5" /> Add medicine
                </Link>
              </Button>
            }
          />
        ) : (
          <>
            {critical.length > 0 && (
              <Section
                title="Critical"
                count={critical.length}
                accent="critical"
                icon={<AlertTriangle className="h-4 w-4" />}
              >
                {critical.map(m => (
                  <MedicineCard key={m.id} medicine={m} sales={sales} />
                ))}
              </Section>
            )}

            {low.length > 0 && (
              <Section title="Running low" count={low.length} accent="warning">
                {low.map(m => (
                  <MedicineCard key={m.id} medicine={m} sales={sales} />
                ))}
              </Section>
            )}

            {critical.length === 0 && low.length === 0 && (
              <EmptyState
                icon={<Package className="h-6 w-6" />}
                title="All stocked up!"
                description={`${ok.length} medicine${ok.length === 1 ? '' : 's'} are above the minimum threshold. Nice work.`}
              />
            )}

            {/* quick action: record a sale */}
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="secondary" className="h-12">
                <Link to="/sales">
                  <ShoppingCart className="h-4 w-4 mr-1.5" />
                  Record sale
                </Link>
              </Button>
              <Button asChild variant="secondary" className="h-12">
                <Link to="/inventory/add">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add medicine
                </Link>
              </Button>
            </div>
          </>
        )}
      </main>
    </>
  );
};

const StatTile = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'critical' | 'warning' | 'primary';
}) => {
  const styles = {
    critical: 'bg-[hsl(var(--critical-soft))] text-destructive',
    warning: 'bg-warning-soft text-[hsl(36_95%_38%)] dark:text-warning',
    primary: 'bg-primary-soft text-primary',
  } as const;
  return (
    <div className={`rounded-2xl px-3 py-3 ${styles[tone]}`}>
      <div className="text-2xl font-bold leading-tight">{value}</div>
      <div className="text-[11px] font-medium opacity-90 mt-0.5">{label}</div>
    </div>
  );
};

const Section = ({
  title,
  count,
  accent,
  icon,
  children,
}: {
  title: string;
  count: number;
  accent: 'critical' | 'warning';
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const dot = accent === 'critical' ? 'bg-destructive' : 'bg-warning';
  return (
    <section aria-label={title}>
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground">({count})</span>
        {icon && <span className="ml-auto text-muted-foreground">{icon}</span>}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
};

export default Dashboard;
