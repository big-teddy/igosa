import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SearchMode = 'price' | 'recommend';

interface ModeState {
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
}

/**
 * Global store for search mode state
 * Persisted to localStorage for consistency across pages
 */
export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      searchMode: 'price',
      setSearchMode: (mode) => set({ searchMode: mode }),
    }),
    {
      name: 'igosa-search-mode',
    }
  )
);
