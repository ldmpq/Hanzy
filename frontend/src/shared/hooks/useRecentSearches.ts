import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function useRecentSearches(searchTerm: string) {
  const user = useAuthStore((state) => state.user);
  const storageKey = user?.email ? `Leafyy_recent_searches_${user.email}` : 'Leafyy_recent_searches';
  
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('Leafyy_recent_searches');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(storageKey);
    setRecentSearches(saved ? JSON.parse(saved) : []);
  }, [storageKey, user]);

  useEffect(() => {
    if (searchTerm.trim() && user) {
      const timer = setTimeout(() => {
        setRecentSearches((prev) => {
          const term = searchTerm.trim();
          const newSearches = [term, ...prev.filter(item => item !== term)].slice(0, 5);
          localStorage.setItem(storageKey, JSON.stringify(newSearches));
          return newSearches;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, storageKey, user]);

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(storageKey);
  };

  return { recentSearches, clearRecentSearches };
}