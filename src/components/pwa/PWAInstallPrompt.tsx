'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA 설치 프롬프트 컴포넌트
 */
export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // iOS 체크
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(isIOSDevice);

        // 이미 설치되어 있거나 숨김 처리된 경우
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (dismissed) return;

        // PWA 설치 가능 이벤트 리스너
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // iOS는 자동으로 프롬프트 표시 (홈 화면 추가 안내)
        if (isIOSDevice && !window.matchMedia('(display-mode: standalone)').matches) {
            setTimeout(() => setShowPrompt(true), 3000);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setShowPrompt(false);
            }
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50"
            >
                <div className="bg-card border rounded-lg shadow-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                                <Download className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">앱 설치하기</h4>
                                <p className="text-xs text-muted-foreground">홈 화면에 추가</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {isIOS ? (
                        <div className="text-sm text-muted-foreground">
                            <p>Safari에서 <strong>공유 버튼</strong>을 누른 후</p>
                            <p><strong>&quot;홈 화면에 추가&quot;</strong>를 선택하세요</p>
                        </div>
                    ) : (
                        <Button onClick={handleInstall} className="w-full" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            설치하기
                        </Button>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
