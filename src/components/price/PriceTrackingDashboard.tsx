'use client';

import { motion } from 'framer-motion';
import { Bell, TrendingDown, TrendingUp, DollarSign, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PriceAlertStats } from '@/types/price-alert';

interface PriceTrackingDashboardProps {
  stats: PriceAlertStats;
}

export function PriceTrackingDashboard({ stats }: PriceTrackingDashboardProps) {
  const statCards = [
    {
      icon: Bell,
      label: '전체 알림',
      value: `${stats.totalAlerts}개`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Target,
      label: '추적 중',
      value: `${stats.activeAlerts}개`,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: TrendingDown,
      label: '목표 달성',
      value: `${stats.triggeredAlerts}개`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: DollarSign,
      label: '총 절약',
      value: `₩${stats.totalSavings.toLocaleString()}`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-lg font-bold truncate">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
