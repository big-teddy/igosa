'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * 테마 프로바이더
 * 다크/라이트 모드 전환 지원
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // localStorage에서 테마 불러오기
        const saved = localStorage.getItem('theme') as Theme | null;
        if (saved) {
            setTheme(saved);
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;

        const updateTheme = () => {
            let resolved: 'light' | 'dark';

            if (theme === 'system') {
                resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
            } else {
                resolved = theme;
            }

            setResolvedTheme(resolved);
            root.classList.remove('light', 'dark');
            root.classList.add(resolved);
        };

        updateTheme();
        localStorage.setItem('theme', theme);

        // 시스템 테마 변경 감지
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            if (theme === 'system') {
                updateTheme();
            }
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
