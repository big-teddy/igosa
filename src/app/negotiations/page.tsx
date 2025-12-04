'use client';

import { useNegotiations } from '@/hooks/useNegotiation';
import { NegotiationCard } from '@/components/negotiations/NegotiationCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function NegotiationsPage() {
    const { negotiations, loading, error, refetch } = useNegotiations();

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">AI 네고딜</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-64" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>오류</AlertTitle>
                    <AlertDescription>
                        협상 목록을 불러오는데 실패했습니다. {error.message}
                    </AlertDescription>
                </Alert>
                <Button onClick={refetch} className="mt-4">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    다시 시도
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">AI 네고딜</h1>
                    <p className="text-muted-foreground mt-2">
                        AI가 자동으로 협상하여 최저가를 만들어드립니다
                    </p>
                </div>
                <Button onClick={refetch} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    새로고침
                </Button>
            </div>

            {negotiations.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                        진행 중인 협상이 없습니다.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        제품 페이지에서 가격 알림을 설정하면 자동으로 협상이 시작됩니다.
                    </p>
                </div>
            ) : (
                <>
                    <div className="mb-4 text-sm text-muted-foreground">
                        총 {negotiations.length}개의 협상
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {negotiations.map((negotiation) => (
                            <NegotiationCard key={negotiation.id} negotiation={negotiation} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
