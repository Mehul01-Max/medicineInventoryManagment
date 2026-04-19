import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusPill } from '@/components/StatusPill';
import { useMedicines } from '@/lib/useStore';
import { store, getStockStatus } from '@/lib/storage';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { EditMedicineDialog } from '@/components/EditMedicineDialog';
import type { Medicine } from '@/lib/storage';

const Inventory = () => {
  const [meds] = useMedicines();
  const [query, setQuery] = useState('');
  const [toDelete, setToDelete] = useState<Medicine | null>(null);
  const [toEdit, setToEdit] = useState<Medicine | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? meds.filter(m => m.name.toLowerCase().includes(q)) : meds;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [meds, query]);

  const handleDelete = () => {
    if (!toDelete) return;
    store.deleteMedicine(toDelete.id);
    toast.success(`Removed ${toDelete.name}`);
    setToDelete(null);
  };

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle={`${meds.length} medicine${meds.length === 1 ? '' : 's'}`}
        action={
          <Button asChild size="sm" className="h-9">
            <Link to="/inventory/add">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Link>
          </Button>
        }
      />

      <main className="flex-1 px-4 pt-3 pb-6">
        {meds.length === 0 ? (
          <EmptyState
            title="No medicines yet"
            description="Add your first medicine to start tracking stock."
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
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search inventory..."
                className="pl-9 h-12 rounded-xl"
              />
            </div>

            <ul className="space-y-2">
              {filtered.map(m => (
                <li
                  key={m.id}
                  className="rounded-2xl border bg-card p-3 shadow-card flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[15px] truncate">{m.name}</h3>
                      <StatusPill status={getStockStatus(m)} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-semibold text-foreground">{m.stock}</span>
                      {m.unit ? ` ${m.unit}` : ''} • min {m.threshold}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setToEdit(m)}
                    aria-label={`Edit ${m.name}`}
                    className="h-10 w-10"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setToDelete(m)}
                    aria-label={`Delete ${m.name}`}
                    className="h-10 w-10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="text-center text-sm text-muted-foreground py-8">
                  No medicines match "{query}"
                </li>
              )}
            </ul>
          </>
        )}
      </main>

      <AlertDialog open={!!toDelete} onOpenChange={open => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will also remove its sales history. You can't undo this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditMedicineDialog
        medicine={toEdit}
        open={!!toEdit}
        onOpenChange={open => !open && setToEdit(null)}
      />
    </>
  );
};

export default Inventory;
