'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Users, ShoppingCart, TrendingUp, DollarSign,
    Activity, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface AnalyticsData {
    totalUsers: number;
    activeDeals: number;
    totalSavings: number;
    conversionRate: number;
    trends: {
        users: number;
        deals: number;
        savings: number;
    };
}

/**
 * 실시간 분석 대시보드
 */
export function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData>({
        totalUsers: 12847,
        activeDeals: 156,
        totalSavings: 45678000,
        conversionRate: 23.5,
        trends: {
            users: 12.3,
            deals: -2.1,
            savings: 18.7,
        },
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate data loading
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const stats = [
        {
            title: '총 사용자',
            value: data.totalUsers.toLocaleString(),
            trend: data.trends.users,
            icon: Users,
            color: 'text-blue-500',
        },
        {
            title: '진행 중 딜',
            value: data.activeDeals.toString(),
            trend: data.trends.deals,
            icon: ShoppingCart,
            color: 'text-green-500',
        },
        {
            title: '총 절약액',
            value: `₩${(data.totalSavings / 10000).toFixed(0)}만`,
            trend: data.trends.savings,
            icon: DollarSign,
            color: 'text-yellow-500',
        },
        {
            title: '전환율',
            value: `${data.conversionRate}%`,
            trend: 5.2,
            icon: TrendingUp,
            color: 'text-purple-500',
        },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                            <div className="h-4 bg-muted rounded w-20 mb-2" />
                            <div className="h-8 bg-muted rounded w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">분석 대시보드</h2>
                <Badge variant="outline" className="gap-1">
                    <Activity className="h-3 w-3" />
                    실시간
                </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">{stat.title}</span>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-2xl font-bold">{stat.value}</span>
                                <div className={`flex items-center text-xs ${stat.trend >= 0 ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                    {stat.trend >= 0 ? (
                                        <ArrowUpRight className="h-3 w-3" />
                                    ) : (
                                        <ArrowDownRight className="h-3 w-3" />
                                    )}
                                    {Math.abs(stat.trend)}%
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        최근 활동
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            { action: '새 사용자 가입', time: '방금 전', count: '+3' },
                            { action: '네고딜 참여', time: '2분 전', count: '+12' },
                            { action: '결제 완료', time: '5분 전', count: '+5' },
                            { action: '가격 알림 설정', time: '10분 전', count: '+8' },
                        ].map((activity, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div>
                                    <p className="text-sm font-medium">{activity.action}</p>
                                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                                </div>
                                <Badge variant="secondary">{activity.count}</Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
