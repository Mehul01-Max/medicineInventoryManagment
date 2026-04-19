import { useState } from 'react';
import { Trash2, Database, Mail, Sparkles, LogOut, User } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { store } from '@/lib/storage';
import { useMedicines, useSales } from '@/lib/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const SAMPLE = [
  { name: 'Paracetamol 500mg', stock: 8, threshold: 20, unit: 'strip' },
  { name: 'Amoxicillin 250mg', stock: 3, threshold: 15, unit: 'strip' },
  { name: 'Cetirizine 10mg', stock: 25, threshold: 10, unit: 'strip' },
  { name: 'ORS sachets', stock: 4, threshold: 12, unit: 'sachet' },
  { name: 'Cough syrup 100ml', stock: 6, threshold: 5, unit: 'bottle' },
  { name: 'Vitamin D3 60K', stock: 18, threshold: 8, unit: 'strip' },
];

const More = () => {
  const [meds] = useMedicines();
  const [sales] = useSales();
  const [showReset, setShowReset] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSample = () => {
    SAMPLE.forEach(m => store.addMedicine(m));
    // record some sales over the past week so suggestions work
    const now = Date.now();
    const sales = [
      { name: 'Paracetamol 500mg', dailyAvg: 4 },
      { name: 'Amoxicillin 250mg', dailyAvg: 2 },
      { name: 'Cetirizine 10mg', dailyAvg: 1 },
      { name: 'ORS sachets', dailyAvg: 3 },
    ];
    const list = store.getMedicines();
    sales.forEach(({ name, dailyAvg }) => {
      const med = list.find(m => m.name === name);
      if (!med) return;
      for (let d = 0; d < 7; d++) {
        for (let i = 0; i < dailyAvg; i++) {
          const entry = {
            id: crypto.randomUUID(),
            medicineId: med.id,
            qty: 1,
            date: now - d * 86_400_000 - i * 1000,
          };
          const all = store.getSales();
          localStorage.setItem('stocksmart.sales.v1', JSON.stringify([entry, ...all]));
        }
      }
    });
    window.dispatchEvent(new CustomEvent('stocksmart:change', { detail: { key: 'all' } }));
    toast.success('Sample data added');
  };

  const handleReset = () => {
    store.resetAll();
    setShowReset(false);
    toast.success('All data cleared');
  };

  const handleLogout = () => {
    logout();
    setShowLogout(false);
    navigate('/login', { replace: true });
    toast.success('Signed out');
  };

  return (
    <>
      <PageHeader title="More" />

      <main className="flex-1 px-4 pt-3 pb-6 space-y-6">
        {/* User info card */}
        {user && (
          <section className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-2">
            Your data
          </h2>
          <div className="rounded-2xl bg-card border divide-y divide-border overflow-hidden">
            <Row icon={<Database className="h-4 w-4" />} label="Medicines" value={String(meds.length)} />
            <Row icon={<Mail className="h-4 w-4" />} label="Sales recorded" value={String(sales.length)} />
          </div>
        </section>

        <section className="space-y-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full h-12 justify-start"
            onClick={handleSample}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Load sample data
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full h-12 justify-start text-destructive hover:text-destructive hover:bg-destructive/5"
            onClick={() => setShowReset(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear all data
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full h-12 justify-start text-muted-foreground hover:text-foreground"
            onClick={() => setShowLogout(true)}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </section>

        <p className="text-center text-xs text-muted-foreground">
          StockSmart v1 • Data stored on your device
        </p>
      </main>

      {/* Reset dialog */}
      <AlertDialog open={showReset} onOpenChange={setShowReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear everything?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes all your medicines and sales history from this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90">
              Yes, clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout dialog */}
      <AlertDialog open={showLogout} onOpenChange={setShowLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign back in to access your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-3 px-4 py-3.5">
    <span className="text-muted-foreground">{icon}</span>
    <span className="flex-1 text-sm">{label}</span>
    <span className="font-semibold text-sm tabular-nums">{value}</span>
  </div>
);

export default More;
