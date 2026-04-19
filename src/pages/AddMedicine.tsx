import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, FileText } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/lib/storage';
import { toast } from 'sonner';

const COMMON_UNITS = ['strip', 'bottle', 'tablet', 'box', 'tube', 'sachet'];

const AddMedicine = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [stock, setStock] = useState('');
  const [threshold, setThreshold] = useState('');
  const [unit, setUnit] = useState('strip');
  const [addAnother, setAddAnother] = useState(true);

  const reset = () => {
    setName('');
    setStock('');
    setThreshold('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stockN = parseInt(stock, 10);
    const thresholdN = parseInt(threshold, 10);
    if (!name.trim()) return toast.error('Enter a medicine name');
    if (isNaN(stockN) || stockN < 0) return toast.error('Enter valid stock');
    if (isNaN(thresholdN) || thresholdN < 0) return toast.error('Enter valid threshold');

    store.addMedicine({
      name: name.trim(),
      stock: stockN,
      threshold: thresholdN,
      unit: unit.trim() || undefined,
    });

    toast.success(`Added ${name.trim()}`);

    if (addAnother) {
      reset();
      // focus name field
      requestAnimationFrame(() => {
        document.getElementById('med-name')?.focus();
      });
    } else {
      navigate('/inventory');
    }
  };

  const handleCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return toast.error('CSV is empty');

      // detect header
      const first = lines[0].toLowerCase();
      const hasHeader = first.includes('name') || first.includes('stock');
      const dataLines = hasHeader ? lines.slice(1) : lines;

      let added = 0;
      for (const line of dataLines) {
        const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        const [n, s, t, u] = parts;
        const sN = parseInt(s, 10);
        const tN = parseInt(t, 10);
        if (!n || isNaN(sN) || isNaN(tN)) continue;
        store.addMedicine({ name: n, stock: sN, threshold: tN, unit: u || undefined });
        added++;
      }
      if (added === 0) {
        toast.error('No valid rows found. Format: name,stock,threshold,unit');
      } else {
        toast.success(`Imported ${added} medicine${added === 1 ? '' : 's'}`);
        navigate('/inventory');
      }
    } catch {
      toast.error('Could not read file');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <>
      <PageHeader title="Add medicine" back />

      <main className="flex-1 px-4 pt-3 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="med-name" className="text-sm">Medicine name</Label>
            <Input
              id="med-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Paracetamol 500mg"
              className="h-12 mt-1.5 rounded-xl text-base"
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="med-stock" className="text-sm">Current stock</Label>
              <Input
                id="med-stock"
                type="number"
                inputMode="numeric"
                value={stock}
                onChange={e => setStock(e.target.value)}
                placeholder="0"
                className="h-12 mt-1.5 rounded-xl text-base"
              />
            </div>
            <div>
              <Label htmlFor="med-threshold" className="text-sm">Alert below</Label>
              <Input
                id="med-threshold"
                type="number"
                inputMode="numeric"
                value={threshold}
                onChange={e => setThreshold(e.target.value)}
                placeholder="10"
                className="h-12 mt-1.5 rounded-xl text-base"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm">Unit</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {COMMON_UNITS.map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
                    unit === u
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5 py-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={addAnother}
              onChange={e => setAddAnother(e.target.checked)}
              className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm">Add another after this</span>
          </label>

          <Button type="submit" size="lg" className="w-full h-14 text-base font-semibold">
            <Plus className="h-5 w-5 mr-1.5" />
            Add medicine
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">Import from CSV</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Format: <code className="bg-muted px-1 rounded">name,stock,threshold,unit</code>
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full mt-3 h-11"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Choose CSV file
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleCsv}
          />
        </div>
      </main>
    </>
  );
};

export default AddMedicine;
