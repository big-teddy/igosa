'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/types/dashboard';
import {
  TrendingDown,
  Bell,
  DollarSign,
  Heart,
  MessageSquare,
  Share2,
  ShoppingBag,
  Target,
} from 'lucide-react';

interface DashboardOverviewProps {
  stats: DashboardStats;
}

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  const overviewCards = [
    {
      title: '총 절약 금액',
      value: `₩${stats.totalSaved.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: '레퍼럴 수익',
      value: `₩${stats.totalReferralEarnings.toLocaleString()}`,
      icon: Share2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: '참여 네고딜',
      value: stats.activeNegoDeals,
      icon: TrendingDown,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '활성 가격 알림',
      value: stats.activePriceAlerts,
      icon: Bell,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const activityCards = [
    {
      title: '좋아요',
      value: stats.totalLikes,
      icon: Heart,
      color: 'text-red-600',
    },
    {
      title: '댓글',
      value: stats.totalComments,
      icon: MessageSquare,
      color: 'text-indigo-600',
    },
    {
      title: '공유',
      value: stats.totalShares,
      icon: Share2,
      color: 'text-pink-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">주요 통계</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                      <p className="text-2xl font-bold">{card.value}</p>
                    </div>
                    <div className={`${card.bgColor} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Activity Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">소셜 활동</h2>
        <div className="grid grid-cols-3 gap-4">
          {activityCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardContent className="pt-6 text-center">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${card.color}`} />
                  <p className="text-2xl font-bold mb-1">{card.value}</p>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Referral Level */}
      <Card>
        <CardHeader>
          <CardTitle>레퍼럴 레벨</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium capitalize">{stats.referralLevel}</span>
            <span className="text-sm text-muted-foreground">
              {stats.totalReferrals} referrals
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            수익률: {(stats.totalReferralEarnings > 0 ? (stats.totalReferralEarnings / (stats.totalReferralEarnings + 10000)) * 100 : 0).toFixed(1)}% 레퍼럴 수익
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
