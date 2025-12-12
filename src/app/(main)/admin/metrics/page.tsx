"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    TrendingUp,
    TrendingDown,
    Users,
    Search,
    Heart,
    Clock,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

interface BusinessMetrics {
    activeNegotiations: number;
    negotiationSuccessRate: number;
    visualSearchUsage: number;
    watchlistItemsCount: number;
    avgNegotiationDuration: number;
}

interface TechnicalMetrics {
    apiErrorRate: number;
    avgResponseTime: number;
    activeUsers: number;
}

interface MetricsData {
    business: BusinessMetrics;
    technical: TechnicalMetrics;
    timestamp: string;
    timeRange: string;
}

export default function MetricsDashboard() {
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week'>('day');
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/metrics?range=${timeRange}`);
            const data = await response.json();

            if (data.success) {
                setMetrics(data.data);
                setLastUpdate(new Date());
            } else {
                setError(data.error || 'Failed to fetch metrics');
            }
        } catch (err) {
            setError('Network error');
            console.error('Metrics fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchMetrics, 30000);
        return () => clearInterval(interval);
    }, [timeRange]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">시스템 메트릭</h1>
                    <p className="text-muted-foreground">
                        실시간 비즈니스 및 기술 지표 모니터링
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Time Range Selector */}
                    <div className="flex gap-2">
                        <Button
                            variant={timeRange === 'hour' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTimeRange('hour')}
                        >
                            1시간
                        </Button>
                        <Button
                            variant={timeRange === 'day' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTimeRange('day')}
                        >
                            24시간
                        </Button>
                        <Button
                            variant={timeRange === 'week' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTimeRange('week')}
                        >
                            7일
                        </Button>
                    </div>

                    {/* Refresh Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchMetrics}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        새로고침
                    </Button>
                </div>
            </div>

            {/* Last Update */}
            {lastUpdate && (
                <p className="text-sm text-muted-foreground mb-4">
                    마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
                </p>
            )}

            {/* Error State */}
            {error && (
                <Card className="mb-6 border-red-500 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Loading State */}
            {loading && !metrics && (
                <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 animate-pulse" />
                    <p>메트릭 로딩 중...</p>
                </div>
            )}

            {/* Metrics Grid */}
            {metrics && (
                <div className="space-y-6">
                    {/* Business Metrics */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">비즈니스 메트릭</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Active Negotiations */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                        활성 협상
                                    </CardTitle>
                                    <CardDescription>진행 중인 협상 건수</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{metrics.business.activeNegotiations}</div>
                                </CardContent>
                            </Card>

                            {/* Negotiation Success Rate */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                        협상 성공률
                                    </CardTitle>
                                    <CardDescription>지난 {timeRange === 'hour' ? '1시간' : timeRange === 'day' ? '24시간' : '7일'} 기준</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold">{metrics.business.negotiationSuccessRate}%</span>
                                        <Badge variant={metrics.business.negotiationSuccessRate >= 50 ? 'default' : 'secondary'}>
                                            {metrics.business.negotiationSuccessRate >= 50 ? '좋음' : '보통'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Watchlist Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Heart className="h-5 w-5 text-red-600" />
                                        찜 목록
                                    </CardTitle>
                                    <CardDescription>새로 추가된 찜 수</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{metrics.business.watchlistItemsCount}</div>
                                </CardContent>
                            </Card>

                            {/* Visual Search Usage */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Search className="h-5 w-5 text-purple-600" />
                                        비주얼 검색
                                    </CardTitle>
                                    <CardDescription>AI 이미지 검색 사용 횟수</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{metrics.business.visualSearchUsage}</div>
                                    <p className="text-sm text-muted-foreground mt-1">곧 활성화 예정</p>
                                </CardContent>
                            </Card>

                            {/* Avg Negotiation Duration */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-orange-600" />
                                        평균 협상 시간
                                    </CardTitle>
                                    <CardDescription>협상 완료까지 소요 시간</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold">{metrics.business.avgNegotiationDuration}</span>
                                        <span className="text-muted-foreground">시간</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Technical Metrics */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">기술 메트릭</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                        API 에러율
                                    </CardTitle>
                                    <CardDescription>Sentry 연동 예정</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{metrics.technical.apiErrorRate}%</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                        평균 응답 시간
                                    </CardTitle>
                                    <CardDescription>Vercel Analytics 연동 예정</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{metrics.technical.avgResponseTime}ms</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-green-600" />
                                        활성 사용자
                                    </CardTitle>
                                    <CardDescription>PostHog 연동 예정</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{metrics.technical.activeUsers}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
