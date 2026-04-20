import { apiFetch } from './api';
import { queryClient } from './queryClient';

export type Medicine = {
  id: string;
  name: string;
  stock: number;
  threshold: number;
  unit?: string;
  createdAt: number;
  ordered?: boolean;
  orderedAt?: number;
};

export type SaleEntry = {
  id: string;
  medicineId: string;
  qty: number;
  date: number;
};

export const store = {
  async getMedicines(): Promise<Medicine[]> {
    return apiFetch<Medicine[]>('/api/medicines');
  },

  async addMedicine(m: Omit<Medicine, 'id' | 'createdAt'>): Promise<Medicine> {
    const result = await apiFetch<Medicine>('/api/medicines', {
      method: 'POST',
      body: JSON.stringify(m),
    });
    queryClient.invalidateQueries({ queryKey: ['medicines'] });
    return result;
  },

  async addMedicinesBatch(medicines: Omit<Medicine, 'id' | 'createdAt'>[]): Promise<Medicine[]> {
    const result = await apiFetch<Medicine[]>('/api/medicines/batch', {
      method: 'POST',
      body: JSON.stringify({ medicines }),
    });
    queryClient.invalidateQueries({ queryKey: ['medicines'] });
    return result;
  },

  async updateMedicine(id: string, patch: Partial<Medicine>): Promise<Medicine> {
    const result = await apiFetch<Medicine>(`/api/medicines/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    queryClient.invalidateQueries({ queryKey: ['medicines'] });
    return result;
  },

  async deleteMedicine(id: string): Promise<void> {
    await apiFetch(`/api/medicines/${id}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: ['medicines'] });
    queryClient.invalidateQueries({ queryKey: ['sales'] });
  },


  async getSales(): Promise<SaleEntry[]> {
    return apiFetch<SaleEntry[]>('/api/sales');
  },

  async recordSale(medicineId: string, qty: number): Promise<SaleEntry> {
    const result = await apiFetch<SaleEntry>('/api/sales', {
      method: 'POST',
      body: JSON.stringify({ medicineId, qty }),
    });
    queryClient.invalidateQueries({ queryKey: ['medicines'] });
    queryClient.invalidateQueries({ queryKey: ['sales'] });
    return result;
  },

  async recordSalesBatch(sales: { medicineId: string; qty: number; date?: number }[], skipStockUpdate = false): Promise<SaleEntry[]> {
    const result = await apiFetch<SaleEntry[]>('/api/sales/batch', {
      method: 'POST',
      body: JSON.stringify({ sales, skipStockUpdate }),
    });
    queryClient.invalidateQueries({ queryKey: ['medicines'] });
    queryClient.invalidateQueries({ queryKey: ['sales'] });
    return result;
  },


  isOnboarded(): boolean {
    try {
      return JSON.parse(localStorage.getItem('stocksmart.onboarded.v1') || 'false');
    } catch {
      return false;
    }
  },
  setOnboarded(v: boolean) {
    localStorage.setItem('stocksmart.onboarded.v1', JSON.stringify(v));
  },

  async resetAll(): Promise<void> {
    await apiFetch('/api/medicines/all', { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: ['medicines'] });
    queryClient.invalidateQueries({ queryKey: ['sales'] });
  },
};


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
  let suggested: number;
  if (avgDaily > 0) {
    const targetStock = Math.ceil(avgDaily * (14 + SAFETY_BUFFER_DAYS));
    suggested = Math.max(med.threshold * 2, targetStock - med.stock);
  } else {
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
