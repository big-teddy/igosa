'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'igosa-recent-searches';
const MAX_SEARCHES = 10;

export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSearches(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Save to localStorage whenever searches change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error('Failed to save recent searches:', error);
    }
  }, [searches]);

  // Add a new search
  const addSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearches((prev) => {
      // Remove duplicates and add to front
      const filtered = prev.filter((s) => s !== trimmed);
      const newSearches = [trimmed, ...filtered];

      // Limit to MAX_SEARCHES
      return newSearches.slice(0, MAX_SEARCHES);
    });
  };

  // Remove a specific search
  const removeSearch = (query: string) => {
    setSearches((prev) => prev.filter((s) => s !== query));
  };

  // Clear all searches
  const clearAll = () => {
    setSearches([]);
  };

  return {
    searches,
    addSearch,
    removeSearch,
    clearAll,
  };
}
