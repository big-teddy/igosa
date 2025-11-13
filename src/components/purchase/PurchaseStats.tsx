'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, TrendingUp, Package } from 'lucide-react';
import { PurchaseStats as PurchaseStatsType } from '@/types/purchase';
import { Card } from '@/components/ui/card';

interface PurchaseStatsProps {
  stats: PurchaseStatsType;
}

export function PurchaseStats({ stats }: PurchaseStatsProps) {
  const statCards = [
    {
      icon: ShoppingBag,
      label: '총 구매',
      value: `${stats.totalPurchases}건`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: DollarSign,
      label: '총 지출',
      value: `${stats.totalSpent.toLocaleString()}원`,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: TrendingUp,
      label: '평균 구매액',
      value: `${Math.round(stats.averageOrderValue).toLocaleString()}원`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-5 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Category Breakdown */}
      {Object.keys(stats.categoryCounts).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">카테고리별 구매</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(stats.categoryCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count], index) => {
                  const percentage = (count / stats.totalPurchases) * 100;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{category}</span>
                        <span className="text-muted-foreground">
                          {count}건 ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
