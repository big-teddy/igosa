'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PlaceholderImageProps {
    src?: string | null;
    alt: string;
    width: number;
    height: number;
    className?: string;
    fallbackText?: string;
    priority?: boolean;
}

/**
 * 이미지 플레이스홀더 컴포넌트
 * 이미지 로딩 실패 시 폴백 표시
 */
export function PlaceholderImage({
    src,
    alt,
    width,
    height,
    className,
    fallbackText,
    priority = false,
}: PlaceholderImageProps) {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    if (!src || error) {
        return (
            <div
                className={cn(
                    'flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground',
                    className
                )}
                style={{ width, height }}
            >
                <span className="text-sm font-medium">
                    {fallbackText || alt.charAt(0).toUpperCase()}
                </span>
            </div>
        );
    }

    return (
        <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
            {loading && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={cn(
                    'object-cover transition-opacity duration-300',
                    loading ? 'opacity-0' : 'opacity-100'
                )}
                onLoad={() => setLoading(false)}
                onError={() => setError(true)}
                priority={priority}
            />
        </div>
    );
}

/**
 * 아바타 컴포넌트
 */
export function Avatar({
    src,
    name,
    size = 40,
    className,
}: {
    src?: string | null;
    name: string;
    size?: number;
    className?: string;
}) {
    const initials = name
        .split(' ')
        .map((n) => n.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const colors = [
        'from-red-400 to-pink-500',
        'from-orange-400 to-amber-500',
        'from-green-400 to-emerald-500',
        'from-blue-400 to-cyan-500',
        'from-purple-400 to-violet-500',
        'from-pink-400 to-rose-500',
    ];

    // Generate consistent color based on name
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

    return (
        <PlaceholderImage
            src={src}
            alt={name}
            width={size}
            height={size}
            className={cn('rounded-full', className)}
            fallbackText={initials}
        />
    );
}

/**
 * 상품 이미지 컴포넌트
 */
export function ProductImage({
    src,
    name,
    size = 'md',
    className,
}: {
    src?: string | null;
    name: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}) {
    const sizes = {
        sm: { width: 64, height: 64 },
        md: { width: 128, height: 128 },
        lg: { width: 256, height: 256 },
    };

    const { width, height } = sizes[size];

    return (
        <PlaceholderImage
            src={src}
            alt={name}
            width={width}
            height={height}
            className={cn('rounded-lg', className)}
            fallbackText="📦"
        />
    );
}
