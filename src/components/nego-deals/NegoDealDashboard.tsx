'use client';

import { motion } from 'framer-motion';
import {
  TrendingDown,
  Users,
  CheckCircle,
  DollarSign,
  UserPlus,
  Trophy,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { NegoDealStats } from '@/types/nego-deal';

interface NegoDealDashboardProps {
  stats: NegoDealStats;
}

export function NegoDealDashboard({ stats }: NegoDealDashboardProps) {
  const statCards = [
    {
      icon: Users,
      label: '참여 중인 딜',
      value: `${stats.activeDeals}개`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: CheckCircle,
      label: '완료한 딜',
      value: `${stats.completedDeals}개`,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: DollarSign,
      label: '총 절약',
      value: `₩${stats.totalSavings.toLocaleString()}`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      icon: UserPlus,
      label: '초대한 친구',
      value: `${stats.friendsInvited}명`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Trophy,
      label: '레퍼럴 수익',
      value: `₩${stats.referralEarnings.toLocaleString()}`,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
              <div className="flex flex-col gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
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
