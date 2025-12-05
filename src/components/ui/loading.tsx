'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

/**
 * 로딩 스피너 컴포넌트
 */
export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <motion.div
                className={`${sizes[size]} border-2 border-primary border-t-transparent rounded-full`}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
        </div>
    );
}

/**
 * 전체 화면 로딩
 */
export function FullPageLoading({ text = '로딩 중...' }: { text?: string }) {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
            >
                <div className="relative">
                    <motion.div
                        className="w-16 h-16 border-4 border-primary/20 rounded-full"
                    />
                    <motion.div
                        className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                </div>
                <p className="text-muted-foreground font-medium">{text}</p>
            </motion.div>
        </div>
    );
}

/**
 * 인라인 로딩 (버튼용)
 */
export function InlineLoading() {
    return (
        <motion.span
            className="inline-flex gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="w-1.5 h-1.5 bg-current rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1,
                    }}
                />
            ))}
        </motion.span>
    );
}

/**
 * 카드 스켈레톤
 */
export function CardSkeleton({ count = 1 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-lg border bg-card p-4 space-y-3 animate-pulse"
                >
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-20 bg-muted rounded" />
                    <div className="flex gap-2">
                        <div className="h-8 bg-muted rounded w-20" />
                        <div className="h-8 bg-muted rounded w-20" />
                    </div>
                </div>
            ))}
        </>
    );
}

/**
 * 리스트 스켈레톤
 */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-lg border animate-pulse"
                >
                    <div className="w-12 h-12 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                    <div className="h-8 bg-muted rounded w-16" />
                </div>
            ))}
        </div>
    );
}
