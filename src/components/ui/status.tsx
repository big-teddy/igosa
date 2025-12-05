'use client';

import { cn } from '@/lib/utils';
import {
    CheckCircle, Clock, AlertCircle, XCircle,
    Loader2, TrendingUp, TrendingDown, Minus
} from 'lucide-react';

type Status = 'success' | 'pending' | 'warning' | 'error' | 'loading' | 'neutral';

interface StatusBadgeProps {
    status: Status;
    label?: string;
    size?: 'sm' | 'md';
    className?: string;
}

/**
 * 상태 배지 컴포넌트
 */
export function StatusBadge({ status, label, size = 'md', className }: StatusBadgeProps) {
    const configs = {
        success: {
            icon: CheckCircle,
            bg: 'bg-green-100 dark:bg-green-900/30',
            text: 'text-green-700 dark:text-green-400',
            defaultLabel: '완료',
        },
        pending: {
            icon: Clock,
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
            text: 'text-yellow-700 dark:text-yellow-400',
            defaultLabel: '대기중',
        },
        warning: {
            icon: AlertCircle,
            bg: 'bg-orange-100 dark:bg-orange-900/30',
            text: 'text-orange-700 dark:text-orange-400',
            defaultLabel: '주의',
        },
        error: {
            icon: XCircle,
            bg: 'bg-red-100 dark:bg-red-900/30',
            text: 'text-red-700 dark:text-red-400',
            defaultLabel: '오류',
        },
        loading: {
            icon: Loader2,
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-700 dark:text-blue-400',
            defaultLabel: '처리중',
        },
        neutral: {
            icon: Minus,
            bg: 'bg-gray-100 dark:bg-gray-800',
            text: 'text-gray-700 dark:text-gray-400',
            defaultLabel: '-',
        },
    };

    const config = configs[status];
    const Icon = config.icon;
    const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    const padding = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm';

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full font-medium',
                config.bg,
                config.text,
                padding,
                className
            )}
        >
            <Icon className={cn(iconSize, status === 'loading' && 'animate-spin')} />
            {label || config.defaultLabel}
        </span>
    );
}

/**
 * 변화 표시 (상승/하락)
 */
export function ChangeIndicator({
    value,
    suffix = '%',
    showIcon = true,
}: {
    value: number;
    suffix?: string;
    showIcon?: boolean;
}) {
    const isPositive = value > 0;
    const isNeutral = value === 0;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-0.5 text-sm font-medium',
                isPositive && 'text-green-600',
                !isPositive && !isNeutral && 'text-red-600',
                isNeutral && 'text-muted-foreground'
            )}
        >
            {showIcon && !isNeutral && (
                isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                ) : (
                    <TrendingDown className="h-3 w-3" />
                )
            )}
            {isPositive && '+'}
            {value.toFixed(1)}{suffix}
        </span>
    );
}

/**
 * 온라인/오프라인 상태
 */
export function OnlineStatus({ isOnline }: { isOnline: boolean }) {
    return (
        <span className="flex items-center gap-1.5 text-sm">
            <span
                className={cn(
                    'w-2 h-2 rounded-full',
                    isOnline ? 'bg-green-500' : 'bg-gray-400'
                )}
            />
            {isOnline ? '온라인' : '오프라인'}
        </span>
    );
}

/**
 * 네고딜 상태 배지
 */
export function DealStatusBadge({ status }: { status: 'active' | 'completed' | 'expired' | 'cancelled' }) {
    const statusMap = {
        active: { label: '진행중', status: 'pending' as Status },
        completed: { label: '성사', status: 'success' as Status },
        expired: { label: '만료', status: 'warning' as Status },
        cancelled: { label: '취소', status: 'error' as Status },
    };

    const config = statusMap[status];
    return <StatusBadge status={config.status} label={config.label} />;
}

/**
 * 결제 상태 배지
 */
export function PaymentStatusBadge({ status }: { status: 'pending' | 'completed' | 'failed' | 'refunded' }) {
    const statusMap = {
        pending: { label: '결제 대기', status: 'pending' as Status },
        completed: { label: '결제 완료', status: 'success' as Status },
        failed: { label: '결제 실패', status: 'error' as Status },
        refunded: { label: '환불됨', status: 'neutral' as Status },
    };

    const config = statusMap[status];
    return <StatusBadge status={config.status} label={config.label} />;
}
