import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store, type Medicine } from '@/lib/storage';
import { toast } from 'sonner';

type Props = {
  medicine: Medicine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EditMedicineDialog = ({ medicine, open, onOpenChange }: Props) => {
  const [name, setName] = useState('');
  const [stock, setStock] = useState('');
  const [threshold, setThreshold] = useState('');
  const [unit, setUnit] = useState('');

  useEffect(() => {
    if (medicine) {
      setName(medicine.name);
      setStock(String(medicine.stock));
      setThreshold(String(medicine.threshold));
      setUnit(medicine.unit ?? '');
    }
  }, [medicine]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicine) return;
    const stockN = parseInt(stock, 10);
    const thresholdN = parseInt(threshold, 10);
    if (!name.trim() || isNaN(stockN) || isNaN(thresholdN)) {
      toast.error('Please fill all fields');
      return;
    }
    await store.updateMedicine(medicine.id, {
      name: name.trim(),
      stock: Math.max(0, stockN),
      threshold: Math.max(0, thresholdN),
      unit: unit.trim() || undefined,
    });
    toast.success('Saved');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit medicine</DialogTitle>
          <DialogDescription>Update details and current stock.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <Label htmlFor="edit-name">Name</Label>
            <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} className="h-11 mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-stock">Current stock</Label>
              <Input id="edit-stock" type="number" inputMode="numeric" value={stock} onChange={e => setStock(e.target.value)} className="h-11 mt-1" />
            </div>
            <div>
              <Label htmlFor="edit-threshold">Min threshold</Label>
              <Input id="edit-threshold" type="number" inputMode="numeric" value={threshold} onChange={e => setThreshold(e.target.value)} className="h-11 mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-unit">Unit (optional)</Label>
            <Input id="edit-unit" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. strip, bottle" className="h-11 mt-1" />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
