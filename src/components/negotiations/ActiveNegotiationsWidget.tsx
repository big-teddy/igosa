'use client';

import { useNegotiations } from '@/hooks/useNegotiation';
import { NegotiationCard } from '@/components/negotiations/NegotiationCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ActiveNegotiationsWidget() {
    const { negotiations, loading } = useNegotiations();

    // Filter only active negotiations
    const activeNegotiations = negotiations.filter(
        (n) => n.status === 'in_progress' || n.status === 'pending'
    ).slice(0, 3);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        진행 중인 AI 네고딜
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (activeNegotiations.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        진행 중인 AI 네고딜
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                            진행 중인 협상이 없습니다
                        </p>
                        <Link href="/products">
                            <Button>
                                제품 둘러보기
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        진행 중인 AI 네고딜
                    </CardTitle>
                    <Link href="/negotiations">
                        <Button variant="ghost" size="sm">
                            전체 보기
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {activeNegotiations.map((negotiation) => (
                    <NegotiationCard key={negotiation.id} negotiation={negotiation} />
                ))}
            </CardContent>
        </Card>
    );
}
