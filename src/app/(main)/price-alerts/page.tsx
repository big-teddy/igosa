'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Home, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { priceAlertService } from '@/lib/services/price-alert-service';
import { PriceAlert } from '@/types/price-alert';
import { PriceAlertCard } from '@/components/price/PriceAlertCard';
import { PriceTrackingDashboard } from '@/components/price/PriceTrackingDashboard';
import { toast } from 'sonner';

export default function PriceAlertsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'triggered'>('all');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // 로그인 확인
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login?redirect=/price-alerts');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);
    const uid = userData.email || userData.id || 'user-1';
    setUserId(uid);

    loadAlerts(uid);
  }, [router]);

  const loadAlerts = (uid: string) => {
    const userAlerts = priceAlertService.getUserAlerts(uid);
    setAlerts(userAlerts);

    const userStats = priceAlertService.getUserStats(uid);
    setStats(userStats);

    // Check for triggered alerts
    const triggered = priceAlertService.checkAlerts(uid);
    if (triggered.length > 0) {
      toast.success(`${triggered.length}개의 제품이 목표 가격에 도달했습니다!`);
    }
  };

  const handleToggle = (alertId: string) => {
    const newState = priceAlertService.toggleAlert(alertId, userId);
    toast.success(newState ? '알림이 활성화되었습니다' : '알림이 일시정지되었습니다');
    loadAlerts(userId);
  };

  const handleDelete = (alertId: string) => {
    if (confirm('이 가격 알림을 삭제하시겠습니까?')) {
      priceAlertService.deleteAlert(alertId, userId);
      toast.success('가격 알림이 삭제되었습니다');
      loadAlerts(userId);
    }
  };

  const handleEdit = (alertId: string) => {
    const newTargetPrice = prompt('새로운 목표 가격을 입력하세요:');
    if (newTargetPrice) {
      const price = parseFloat(newTargetPrice.replace(/,/g, ''));
      if (!isNaN(price) && price > 0) {
        priceAlertService.updateTargetPrice(alertId, userId, price);
        toast.success('목표 가격이 업데이트되었습니다');
        loadAlerts(userId);
      } else {
        toast.error('올바른 가격을 입력해주세요');
      }
    }
  };

  if (!user) {
    return null;
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    if (filter === 'active') return alert.isActive && !alert.notified;
    if (filter === 'triggered') return alert.notified;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-orange-50 via-orange-50/50 to-background">
        <div className="container max-w-6xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
                가격 알림
                <Badge variant="outline" className="gap-1">
                  <Bell className="h-3 w-3" />
                  <span className="text-xs">Price Alert</span>
                </Badge>
              </h1>
              <p className="text-muted-foreground">원하는 가격에 도달하면 자동으로 알려드립니다</p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  홈으로
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
        {/* Stats Dashboard */}
        {stats && <PriceTrackingDashboard stats={stats} />}

        {/* Filter Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                전체 ({alerts.length})
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                추적 중 ({alerts.filter((a) => a.isActive && !a.notified).length})
              </Button>
              <Button
                variant={filter === 'triggered' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('triggered')}
              >
                목표 달성 ({alerts.filter((a) => a.notified).length})
              </Button>
            </div>
          </div>

          <Link href="/">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              새 알림 추가
            </Button>
          </Link>
        </div>

        {/* Alerts List */}
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">설정된 알림이 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                관심 제품의 가격 알림을 설정하고 최저가에 구매하세요!
              </p>
              <Link href="/">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  제품 둘러보기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <PriceAlertCard
                key={alert.id}
                alert={alert}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
