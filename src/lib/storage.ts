// StockSmart data types & local storage layer
// Designed to be easily swapped with a backend (Supabase) later.

export type Medicine = {
  id: string;
  name: string;
  stock: number;
  threshold: number;
  unit?: string; // e.g. "strip", "bottle", "tablet"
  createdAt: number;
  ordered?: boolean; // marked as reordered
  orderedAt?: number;
};

export type SaleEntry = {
  id: string;
  medicineId: string;
  qty: number;
  date: number; // ms since epoch
};

const KEYS = {
  medicines: 'stocksmart.medicines.v1',
  sales: 'stocksmart.sales.v1',
  onboarded: 'stocksmart.onboarded.v1',
  emailConfig: 'stocksmart.emailconfig.v1',
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  // notify listeners in same tab
  window.dispatchEvent(new CustomEvent('stocksmart:change', { detail: { key } }));
}

export const store = {
  // ----- medicines -----
  getMedicines(): Medicine[] {
    return read<Medicine[]>(KEYS.medicines, []);
  },
  saveMedicines(list: Medicine[]) {
    write(KEYS.medicines, list);
  },
  addMedicine(m: Omit<Medicine, 'id' | 'createdAt'>): Medicine {
    const list = store.getMedicines();
    const newM: Medicine = { ...m, id: crypto.randomUUID(), createdAt: Date.now() };
    write(KEYS.medicines, [newM, ...list]);
    return newM;
  },
  updateMedicine(id: string, patch: Partial<Medicine>) {
    const list = store.getMedicines().map(m => (m.id === id ? { ...m, ...patch } : m));
    write(KEYS.medicines, list);
  },
  deleteMedicine(id: string) {
    write(KEYS.medicines, store.getMedicines().filter(m => m.id !== id));
    write(KEYS.sales, store.getSales().filter(s => s.medicineId !== id));
  },

  // ----- sales -----
  getSales(): SaleEntry[] {
    return read<SaleEntry[]>(KEYS.sales, []);
  },
  recordSale(medicineId: string, qty: number) {
    const sales = store.getSales();
    const entry: SaleEntry = { id: crypto.randomUUID(), medicineId, qty, date: Date.now() };
    write(KEYS.sales, [entry, ...sales]);
    // reduce stock
    const med = store.getMedicines().find(m => m.id === medicineId);
    if (med) {
      store.updateMedicine(medicineId, {
        stock: Math.max(0, med.stock - qty),
        ordered: false, // new sale resets the "ordered" flag if it falls again
      });
    }
    return entry;
  },

  // ----- onboarding -----
  isOnboarded(): boolean {
    return read<boolean>(KEYS.onboarded, false);
  },
  setOnboarded(v: boolean) {
    write(KEYS.onboarded, v);
  },

  resetAll() {
    localStorage.removeItem(KEYS.medicines);
    localStorage.removeItem(KEYS.sales);
    localStorage.removeItem(KEYS.onboarded);
    localStorage.removeItem(KEYS.emailConfig);
    window.dispatchEvent(new CustomEvent('stocksmart:change', { detail: { key: 'all' } }));
  },
};

// ----- Reorder logic (rule-based, no AI) -----
// avg daily sales over last `windowDays` (default 7) + safety buffer (default 5 days)
const SAFETY_BUFFER_DAYS = 5;
const WINDOW_DAYS = 7;

export function getDailyAverage(medicineId: string, sales: SaleEntry[], windowDays = WINDOW_DAYS): number {
  const cutoff = Date.now() - windowDays * 86_400_000;
  const recent = sales.filter(s => s.medicineId === medicineId && s.date >= cutoff);
  if (recent.length === 0) return 0;
  const totalQty = recent.reduce((sum, s) => sum + s.qty, 0);
  return totalQty / windowDays;
}

export function suggestReorder(med: Medicine, sales: SaleEntry[]): {
  avgDaily: number;
  daysRemaining: number | null;
  suggested: number;
} {
  const avgDaily = getDailyAverage(med.id, sales);
  const daysRemaining = avgDaily > 0 ? Math.floor(med.stock / avgDaily) : null;
  // target: cover ~14 days worth + safety buffer; minimum top-up to threshold + buffer
  let suggested: number;
  if (avgDaily > 0) {
    const targetStock = Math.ceil(avgDaily * (14 + SAFETY_BUFFER_DAYS));
    suggested = Math.max(med.threshold * 2, targetStock - med.stock);
  } else {
    // No sales history — refill to 2x threshold
    suggested = Math.max(med.threshold * 2 - med.stock, med.threshold);
  }
  return { avgDaily, daysRemaining, suggested: Math.max(1, Math.round(suggested)) };
}

export type StockStatus = 'critical' | 'low' | 'ok';

export function getStockStatus(med: Medicine): StockStatus {
  if (med.stock <= med.threshold * 0.5) return 'critical';
  if (med.stock <= med.threshold) return 'low';
  return 'ok';
}
