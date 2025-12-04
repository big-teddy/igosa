'use client';

import { Negotiation } from '@/types/negotiation';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingDown, Clock, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';

interface NegotiationCardProps {
    negotiation: Negotiation;
}

export function NegotiationCard({ negotiation }: NegotiationCardProps) {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'in_progress':
                return { label: '진행 중', color: 'bg-blue-500', icon: Timer };
            case 'accepted':
                return { label: '성공', color: 'bg-green-500', icon: CheckCircle2 };
            case 'rejected':
                return { label: '실패', color: 'bg-red-500', icon: XCircle };
            case 'pending':
                return { label: '대기 중', color: 'bg-gray-500', icon: Clock };
            default:
                return { label: status, color: 'bg-gray-500', icon: Clock };
        }
    };

    const statusConfig = getStatusConfig(negotiation.status);
    const StatusIcon = statusConfig.icon;

    const discount = negotiation.aiProposedPrice && negotiation.targetPrice
        ? Math.round(((negotiation.targetPrice - negotiation.aiProposedPrice) / negotiation.targetPrice) * 100)
        : 0;

    return (
        <Link href={`/negotiations/${negotiation.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="font-bold text-lg line-clamp-2">
                                {(negotiation as any).product?.name || `제품 #${negotiation.productId.slice(0, 8)}`}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {negotiation.createdAt && formatDistanceToNow(new Date(negotiation.createdAt), {
                                    addSuffix: true,
                                    locale: ko,
                                })}
                            </p>
                        </div>
                        <Badge className={`${statusConfig.color} text-white`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* 참여자 수 */}
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{negotiation.totalParticipants}명 참여</span>
                    </div>

                    {/* 가격 정보 */}
                    {negotiation.aiProposedPrice && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">AI 제안 가격</span>
                                <span className="text-xl font-bold text-primary">
                                    ₩{negotiation.aiProposedPrice.toLocaleString()}
                                </span>
                            </div>
                            {discount > 0 && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <TrendingDown className="w-4 h-4" />
                                    <span className="text-sm font-medium">{discount}% 할인</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 신뢰도 */}
                    {negotiation.aiConfidenceScore && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">성공 확률</span>
                            <span className="font-medium">
                                {Math.round(negotiation.aiConfidenceScore * 100)}%
                            </span>
                        </div>
                    )}
                </CardContent>

                <CardFooter>
                    <Button className="w-full" variant={negotiation.status === 'accepted' ? 'default' : 'outline'}>
                        {negotiation.status === 'accepted' ? '구매하기' : '자세히 보기'}
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    );
}
