import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';
import { store, type Medicine, type SaleEntry } from './storage';

export function useMedicines(): [Medicine[], () => void] {
  const { data = [], refetch } = useQuery({
    queryKey: ['medicines'],
    queryFn: () => apiFetch<Medicine[]>('/api/medicines'),
  });
  return [data, () => { refetch(); }];
}

export function useSales(): [SaleEntry[], () => void] {
  const { data = [], refetch } = useQuery({
    queryKey: ['sales'],
    queryFn: () => apiFetch<SaleEntry[]>('/api/sales'),
  });
  return [data, () => { refetch(); }];
}

export function useOnboarded(): [boolean, (v: boolean) => void] {
  const [v, setV] = useState<boolean>(() => store.isOnboarded());
  const set = useCallback((next: boolean) => {
    store.setOnboarded(next);
    setV(next);
  }, []);
  return [v, set];
}
