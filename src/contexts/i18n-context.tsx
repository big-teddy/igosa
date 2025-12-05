'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import koMessages from '../messages/ko.json';
import enMessages from '../messages/en.json';

type Locale = 'ko' | 'en' | 'jp';
type Messages = typeof koMessages;

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const messagesMap: Record<Locale, Messages> = {
    ko: koMessages,
    en: enMessages,
    jp: enMessages, // Fallback to English for JP for now
};

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>('ko');

    useEffect(() => {
        // Browser language detection
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'en' || browserLang === 'ja') {
            // setLocale(browserLang as Locale); // Default to Korean for this demo
        }
    }, []);

    const t = (path: string) => {
        const keys = path.split('.');
        let current: any = messagesMap[locale];

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key as keyof typeof current];
            } else {
                return path;
            }
        }

        return typeof current === 'string' ? current : path;
    };

    return (
        <I18nContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
}
