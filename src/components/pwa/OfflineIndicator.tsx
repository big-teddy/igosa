'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 오프라인 상태 표시 컴포넌트
 */
export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(true);
    const [showIndicator, setShowIndicator] = useState(false);

    useEffect(() => {
        // 초기 상태 설정
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            setShowIndicator(true);
            // 온라인 복구 메시지 3초 후 숨기기
            setTimeout(() => setShowIndicator(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowIndicator(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // 오프라인이거나 방금 온라인 복구됐을 때만 표시
    if (!showIndicator && isOnline) return null;

    return (
        <AnimatePresence>
            {showIndicator && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className={`fixed top-0 left-0 right-0 z-[100] py-2 px-4 text-center text-sm font-medium ${isOnline
                            ? 'bg-green-500 text-white'
                            : 'bg-yellow-500 text-yellow-900'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        {isOnline ? (
                            <>
                                <Wifi className="h-4 w-4" />
                                인터넷 연결이 복구되었습니다
                            </>
                        ) : (
                            <>
                                <WifiOff className="h-4 w-4" />
                                인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다.
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
