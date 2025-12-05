'use client';

import { useEffect } from 'react';

/**
 * Service Worker 등록 훅
 * PWA 기능 활성화
 */
export function useServiceWorker() {
    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator &&
            process.env.NODE_ENV === 'production'
        ) {
            // 페이지 로드 후 서비스 워커 등록
            window.addEventListener('load', async () => {
                try {
                    const registration = await navigator.serviceWorker.register('/sw.js');

                    // 업데이트 확인
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // 새 버전 사용 가능
                                    if (confirm('새 버전이 있습니다. 지금 업데이트하시겠습니까?')) {
                                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                                        window.location.reload();
                                    }
                                }
                            });
                        }
                    });
                } catch (error) {
                    console.error('Service Worker registration failed:', error);
                }
            });
        }
    }, []);
}

/**
 * ServiceWorkerProvider 컴포넌트
 */
export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
    useServiceWorker();
    return <>{children}</>;
}
