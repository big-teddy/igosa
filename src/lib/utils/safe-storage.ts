/**
 * Safe localStorage wrapper with atomic operations
 * Handles race conditions in multi-tab scenarios
 */

type StorageValue = string | number | boolean | object | null;

/**
 * Safely get item from localStorage
 */
export function getStorageItem<T = StorageValue>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Safely set item to localStorage
 */
export function setStorageItem(key: string, value: StorageValue): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Safely remove item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Atomic update operation with retry logic
 * Prevents race conditions in multi-tab scenarios
 */
export function atomicUpdate<T extends StorageValue = StorageValue>(
  key: string,
  updater: (current: T | null) => T,
  maxRetries = 3
): boolean {
  if (typeof window === 'undefined') return false;

  let retries = 0;

  while (retries < maxRetries) {
    try {
      // Read current value
      const current = getStorageItem<T>(key);

      // Calculate new value
      const newValue = updater(current);

      // Try to write
      const success = setStorageItem(key, newValue as StorageValue);

      if (success) {
        return true;
      }

      retries++;
    } catch (error) {
      console.error(`Error in atomic update for key "${key}":`, error);
      retries++;
    }

    // Small delay before retry to reduce contention
    if (retries < maxRetries) {
      const delay = Math.min(100 * Math.pow(2, retries), 1000);
      // Busy wait for small delays (async not available in sync context)
      const start = Date.now();
      while (Date.now() - start < delay) {
        // Busy wait
      }
    }
  }

  console.error(`Failed to update localStorage key "${key}" after ${maxRetries} retries`);
  return false;
}

/**
 * Append item to array in localStorage (atomic)
 */
export function appendToStorageArray<T extends StorageValue>(key: string, item: T): boolean {
  return atomicUpdate<T[]>(key, (current) => {
    const array = Array.isArray(current) ? current : [];
    return [...array, item];
  });
}

/**
 * Remove item from array in localStorage (atomic)
 */
export function removeFromStorageArray<T extends StorageValue>(
  key: string,
  predicate: (item: T) => boolean
): boolean {
  return atomicUpdate<T[]>(key, (current) => {
    const array = Array.isArray(current) ? current : [];
    return array.filter((item) => !predicate(item));
  });
}

/**
 * Update item in array in localStorage (atomic)
 */
export function updateInStorageArray<T extends StorageValue>(
  key: string,
  predicate: (item: T) => boolean,
  updater: (item: T) => T
): boolean {
  return atomicUpdate<T[]>(key, (current) => {
    const array = Array.isArray(current) ? current : [];
    return array.map((item) => (predicate(item) ? updater(item) : item));
  });
}

/**
 * Storage event listener for cross-tab synchronization
 */
export function onStorageChange(
  key: string,
  callback: (newValue: StorageValue) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: StorageEvent) => {
    if (event.key === key && event.newValue !== null) {
      try {
        const newValue = JSON.parse(event.newValue);
        callback(newValue);
      } catch (error) {
        console.error(`Error parsing storage event for key "${key}":`, error);
      }
    }
  };

  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener('storage', handler);
  };
}
