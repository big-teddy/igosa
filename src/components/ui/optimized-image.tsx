'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
    fallback?: string;
}

/**
 * 최적화된 이미지 컴포넌트
 * - Blur placeholder 지원
 * - 에러 폴백 이미지
 * - 로딩 상태 표시
 */
export function OptimizedImage({
    src,
    alt,
    className,
    fallback = '/placeholder-product.svg',
    ...props
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    const imageSrc = error ? fallback : src;

    return (
        <div className={cn('relative overflow-hidden', className)}>
            {isLoading && (
                <div className="absolute inset-0 animate-pulse bg-muted" />
            )}
            <Image
                src={imageSrc}
                alt={alt}
                className={cn(
                    'transition-opacity duration-300',
                    isLoading ? 'opacity-0' : 'opacity-100'
                )}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setError(true);
                    setIsLoading(false);
                }}
                {...props}
            />
        </div>
    );
}

/**
 * 상품 이미지 컴포넌트
 */
export function ProductImage({
    src,
    alt,
    size = 'md',
    className,
}: {
    src: string;
    alt: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}) {
    const sizes = {
        sm: { width: 64, height: 64 },
        md: { width: 200, height: 200 },
        lg: { width: 400, height: 400 },
    };

    const { width, height } = sizes[size];

    return (
        <OptimizedImage
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={cn('rounded-lg object-cover', className)}
            sizes={`(max-width: 768px) ${width}px, ${width}px`}
        />
    );
}
