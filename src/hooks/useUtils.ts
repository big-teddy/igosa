import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * 디바운스 훅 - 값 변화를 지연시킴
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

/**
 * 디바운스 콜백 훅 - 함수 호출을 지연시킴
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
    callback: T,
    delay: number
): T {
    const timeoutRef = useRef<NodeJS.Timeout>();

    const debouncedCallback = useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => callback(...args), delay);
    }, [callback, delay]) as T;

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedCallback;
}

/**
 * 쓰로틀 훅 - 일정 시간 동안 한 번만 실행
 */
export function useThrottle<T>(value: T, interval: number): T {
    const [throttledValue, setThrottledValue] = useState(value);
    const lastExecuted = useRef<number>(Date.now());

    useEffect(() => {
        const now = Date.now();

        if (now >= lastExecuted.current + interval) {
            lastExecuted.current = now;
            setThrottledValue(value);
        } else {
            const timer = setTimeout(() => {
                lastExecuted.current = Date.now();
                setThrottledValue(value);
            }, interval);
            return () => clearTimeout(timer);
        }
    }, [value, interval]);

    return throttledValue;
}

/**
 * 이전 값 추적 훅
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

/**
 * 마운트 상태 확인 훅
 */
export function useIsMounted(): () => boolean {
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    return useCallback(() => isMounted.current, []);
}

/**
 * 로컬 스토리지 훅
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValue;

        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        setStoredValue((prev) => {
            const newValue = value instanceof Function ? value(prev) : value;

            if (typeof window !== 'undefined') {
                localStorage.setItem(key, JSON.stringify(newValue));
            }

            return newValue;
        });
    }, [key]);

    return [storedValue, setValue];
}

/**
 * 미디어 쿼리 훅
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        setMatches(media.matches);

        const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [query]);

    return matches;
}

/**
 * 모바일 감지 훅
 */
export function useIsMobile(): boolean {
    return useMediaQuery('(max-width: 768px)');
}
