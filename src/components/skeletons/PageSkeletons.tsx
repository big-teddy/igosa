'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * 협상 페이지 스켈레톤
 */
export function NegotiationPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <Skeleton className="h-10 w-10 rounded-lg mb-3" />
                            <Skeleton className="h-4 w-16 mb-2" />
                            <Skeleton className="h-6 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Negotiation List */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                            <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-24 hidden sm:block" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

/**
 * 상품 상세 페이지 스켈레톤
 */
export function ProductDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image */}
                <Skeleton className="aspect-square w-full rounded-2xl" />

                {/* Details */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>

                    <div className="space-y-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>

                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * 마이페이지 스켈레톤
 */
export function MyPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Profile Header */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-10 w-24 hidden sm:block" />
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-4 text-center">
                            <Skeleton className="h-8 w-16 mx-auto mb-2" />
                            <Skeleton className="h-4 w-12 mx-auto" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Menu List */}
            <Card>
                <CardContent className="p-0">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="flex-1">
                                <Skeleton className="h-5 w-24" />
                            </div>
                            <Skeleton className="h-5 w-5" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

/**
 * 검색 결과 스켈레톤
 */
export function SearchResultsSkeleton() {
    return (
        <div className="space-y-4">
            {/* AI 응답 */}
            <Card className="glass">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                </CardContent>
            </Card>

            {/* 상품 카드들 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                        <Skeleton className="aspect-video w-full" />
                        <CardContent className="p-4 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-14" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

/**
 * 주문 목록 스켈레톤
 */
export function OrderListSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <Card key={i}>
                    <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                            <Skeleton className="h-20 w-20 rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-5 w-16" />
                                </div>
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
