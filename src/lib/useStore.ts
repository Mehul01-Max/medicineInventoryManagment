import { useEffect, useState, useCallback } from 'react';
import { store, type Medicine, type SaleEntry } from './storage';

function useStocksmartChange(callback: () => void) {
  useEffect(() => {
    const handler = () => callback();
    window.addEventListener('stocksmart:change', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('stocksmart:change', handler);
      window.removeEventListener('storage', handler);
    };
  }, [callback]);
}

export function useMedicines(): [Medicine[], () => void] {
  const [meds, setMeds] = useState<Medicine[]>(() => store.getMedicines());
  const refresh = useCallback(() => setMeds(store.getMedicines()), []);
  useStocksmartChange(refresh);
  return [meds, refresh];
}

export function useSales(): [SaleEntry[], () => void] {
  const [sales, setSales] = useState<SaleEntry[]>(() => store.getSales());
  const refresh = useCallback(() => setSales(store.getSales()), []);
  useStocksmartChange(refresh);
  return [sales, refresh];
}

export function useOnboarded(): [boolean, (v: boolean) => void] {
  const [v, setV] = useState<boolean>(() => store.isOnboarded());
  const refresh = useCallback(() => setV(store.isOnboarded()), []);
  useStocksmartChange(refresh);
  const set = useCallback((next: boolean) => {
    store.setOnboarded(next);
    setV(next);
  }, []);
  return [v, set];
}
