'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ReferralDashboardStats } from '@/types/dashboard';
import { DollarSign, TrendingUp, MousePointer, ShoppingCart, Award } from 'lucide-react';

interface ReferralDashboardProps {
  stats: ReferralDashboardStats;
}

const LEVEL_COLORS: Record<string, string> = {
  bronze: 'text-orange-700',
  silver: 'text-gray-600',
  gold: 'text-yellow-600',
  platinum: 'text-purple-600',
};

const LEVEL_BG_COLORS: Record<string, string> = {
  bronze: 'bg-orange-100',
  silver: 'bg-gray-100',
  gold: 'bg-yellow-100',
  platinum: 'bg-purple-100',
};

export function ReferralDashboard({ stats }: ReferralDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">총 수익</p>
                <p className="text-2xl font-bold">₩{stats.totalEarnings.toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">대기 중</p>
                <p className="text-2xl font-bold">₩{stats.pendingEarnings.toLocaleString()}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">지급 완료</p>
                <p className="text-2xl font-bold">₩{stats.paidEarnings.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>레퍼럴 레벨</span>
            <Badge
              className={`${LEVEL_BG_COLORS[stats.currentLevel]} ${LEVEL_COLORS[stats.currentLevel]} capitalize`}
            >
              <Award className="h-3 w-3 mr-1" />
              {stats.currentLevel}
            </Badge>
          </CardTitle>
          <CardDescription>
            현재 커미션율: {(stats.commissionRate * 100).toFixed(0)}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {stats.currentReferrals} / {stats.nextLevelReferrals} 레퍼럴
              </span>
              <span className="font-semibold">{stats.levelProgress.toFixed(0)}%</span>
            </div>
            <Progress value={stats.levelProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {stats.nextLevelReferrals - stats.currentReferrals}개 더 초대하면 다음 레벨로 업그레이드!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle>성과 지표</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <MousePointer className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{stats.totalClicks}</p>
              <p className="text-xs text-muted-foreground">총 클릭</p>
            </div>
            <div className="text-center">
              <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{stats.totalPurchases}</p>
              <p className="text-xs text-muted-foreground">총 구매</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">전환율</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      {stats.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>최고 실적 상품</CardTitle>
            <CardDescription>레퍼럴 수익이 가장 높은 상품들</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{product.productName}</p>
                      <p className="text-xs text-muted-foreground">{product.metricLabel}</p>
                    </div>
                  </div>
                  <p className="font-bold">₩{product.metric.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
