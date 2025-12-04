'use client';

import { useNegotiation } from '@/hooks/useNegotiation';
import { NegotiationTimeline } from '@/components/negotiations/NegotiationTimeline';
import { ShareButton } from '@/components/negotiations/ShareButton';
import { SocialProof } from '@/components/negotiations/SocialProof';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertCircle,
    ArrowLeft,
    Users,
    TrendingDown,
    ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function NegotiationDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = params;
    const { negotiation, timeline, loading, error } = useNegotiation(id);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-8 w-32 mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64" />
                        <Skeleton className="h-96" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-48" />
                        <Skeleton className="h-32" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !negotiation) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>오류</AlertTitle>
                    <AlertDescription>
                        협상 정보를 불러오는데 실패했습니다.
                    </AlertDescription>
                </Alert>
                <Link href="/negotiations">
                    <Button className="mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        목록으로 돌아가기
                    </Button>
                </Link>
            </div>
        );
    }

    const discount = negotiation.aiProposedPrice && negotiation.targetPrice
        ? Math.round(((negotiation.targetPrice - negotiation.aiProposedPrice) / negotiation.targetPrice) * 100)
        : 0;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <Link href="/negotiations">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        목록으로
                    </Button>
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">협상 상세</h1>
                        <p className="text-muted-foreground mt-2">
                            {negotiation.createdAt && formatDistanceToNow(new Date(negotiation.createdAt), {
                                addSuffix: true,
                                locale: ko,
                            })}
                        </p>
                    </div>
                    <Badge className={
                        negotiation.status === 'accepted' ? 'bg-green-500' :
                            negotiation.status === 'in_progress' ? 'bg-blue-500' :
                                negotiation.status === 'rejected' ? 'bg-red-500' :
                                    'bg-gray-500'
                    }>
                        {negotiation.status === 'accepted' ? '성공' :
                            negotiation.status === 'in_progress' ? '진행 중' :
                                negotiation.status === 'rejected' ? '실패' :
                                    '대기 중'}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Price Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>가격 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">평균 희망 가격</p>
                                    <p className="text-2xl font-bold">
                                        ₩{negotiation.avgTargetPrice.toLocaleString()}
                                    </p>
                                </div>
                                {negotiation.aiProposedPrice && (
                                    <>
                                        <TrendingDown className="w-8 h-8 text-green-500" />
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">AI 제안 가격</p>
                                            <p className="text-2xl font-bold text-primary">
                                                ₩{negotiation.aiProposedPrice.toLocaleString()}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {discount > 0 && (
                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                    <TrendingDown className="w-5 h-5" />
                                    <span>{discount}% 할인</span>
                                </div>
                            )}

                            {negotiation.aiConfidenceScore && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">성공 확률</span>
                                    <span className="font-medium">
                                        {Math.round(negotiation.aiConfidenceScore * 100)}%
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <NegotiationTimeline events={timeline} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Participants */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                참여 현황
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center py-4">
                                <p className="text-4xl font-bold text-primary">
                                    {negotiation.totalParticipants}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">명 참여 중</p>
                            </div>
                            <SocialProof negotiationId={negotiation.id} />
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>액션</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {negotiation.status === 'accepted' && (
                                <Button className="w-full" size="lg">
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    구매하기
                                </Button>
                            )}
                            <ShareButton negotiation={negotiation} variant="outline" size="default" className="w-full" />
                        </CardContent>
                    </Card>

                    {/* AI Reasoning */}
                    {negotiation.aiReasoning && (
                        <Card>
                            <CardHeader>
                                <CardTitle>AI 분석</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <p className="font-medium mb-1">수요 분석</p>
                                    <p className="text-muted-foreground">{negotiation.aiReasoning.demandAnalysis}</p>
                                </div>
                                <div>
                                    <p className="font-medium mb-1">가격 최적화</p>
                                    <p className="text-muted-foreground">{negotiation.aiReasoning.priceOptimization}</p>
                                </div>
                                <div>
                                    <p className="font-medium mb-1">추천 사항</p>
                                    <p className="text-muted-foreground">{negotiation.aiReasoning.recommendation}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
