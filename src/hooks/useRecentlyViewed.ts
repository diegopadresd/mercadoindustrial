import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'mi-recently-viewed';
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const addProduct = useCallback((productId: string) => {
    setIds(prev => {
      const filtered = prev.filter(id => id !== productId);
      const next = [productId, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { recentIds: ids, addProduct };
}
