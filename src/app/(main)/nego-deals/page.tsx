'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { NegoDealCard } from '@/components/nego-deals/nego-deal-card';
import { NegoDealDashboard } from '@/components/nego-deals/NegoDealDashboard';
import {
  mockNegoDeals,
  getActiveNegoDeals,
  getNegoDealsEndingSoon,
  getNegoDealsNearGoal,
} from '@/lib/data/mock-nego-deals';
import { negoDealService } from '@/lib/services/nego-deal-service';
import { Clock, TrendingUp, Sparkles, Home } from 'lucide-react';
import Link from 'next/link';
import { NegoDeal } from '@/types/nego-deal';

type FilterType = 'all' | 'ending-soon' | 'near-goal' | 'my-deals';

export default function NegoDealsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [deals, setDeals] = useState<NegoDeal[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // 로그인 사용자 확인
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const uid = userData.email || userData.id || 'user-1';
      setUserId(uid);

      // 사용자 통계 로드
      const userStats = negoDealService.getUserStats(uid);
      setStats(userStats);
    }

    // 딜 목록 로드
    loadDeals();
  }, [filter]);

  const loadDeals = () => {
    let filteredDeals: NegoDeal[] = [];

    switch (filter) {
      case 'ending-soon':
        filteredDeals = getNegoDealsEndingSoon();
        break;
      case 'near-goal':
        filteredDeals = getNegoDealsNearGoal();
        break;
      case 'my-deals':
        // 내가 참여한 딜만 보기
        if (userId) {
          const participations = negoDealService.getUserParticipations(userId);
          const participatedDealIds = participations.map((p) => p.dealId);
          filteredDeals = mockNegoDeals.filter((d) => participatedDealIds.includes(d.id));
        }
        break;
      default:
        filteredDeals = getActiveNegoDeals();
    }

    // 각 딜에 서비스 데이터 반영 (참여자 수, 진행률 등)
    const updatedDeals = filteredDeals.map((deal) =>
      negoDealService.updateDealWithParticipants(deal)
    );

    setDeals(updatedDeals);
  };

  const handleDealUpdate = () => {
    loadDeals();
    if (userId) {
      const userStats = negoDealService.getUserStats(userId);
      setStats(userStats);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">AI 네고딜</h1>
          </div>
          <Link href="/">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              홈으로
            </Button>
          </Link>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          같은 제품을 원하는 사람들과 함께 구매하고 더 큰 할인을 받으세요.
          <br />
          AI가 자동으로 그룹을 만들고 판매자와 협상합니다.
        </p>
      </div>

      {/* User Stats Dashboard */}
      {stats && userId && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">내 네고딜 현황</h2>
          <NegoDealDashboard stats={stats} />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-8">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          전체 네고딜
        </Button>
        <Button
          variant={filter === 'ending-soon' ? 'default' : 'outline'}
          onClick={() => setFilter('ending-soon')}
        >
          <Clock className="h-4 w-4 mr-2" />
          마감 임박
        </Button>
        <Button
          variant={filter === 'near-goal' ? 'default' : 'outline'}
          onClick={() => setFilter('near-goal')}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          목표 근접
        </Button>
        {userId && (
          <Button
            variant={filter === 'my-deals' ? 'default' : 'outline'}
            onClick={() => setFilter('my-deals')}
          >
            내 참여 딜
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-muted p-6 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">진행 중인 딜</p>
          <p className="text-3xl font-bold">{getActiveNegoDeals().length}개</p>
        </div>
        <div className="bg-muted p-6 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">24시간 내 마감</p>
          <p className="text-3xl font-bold">
            {getNegoDealsEndingSoon().filter((d) => d.hoursRemaining <= 24).length}개
          </p>
        </div>
        <div className="bg-muted p-6 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">평균 할인율</p>
          <p className="text-3xl font-bold">
            {Math.round(
              mockNegoDeals.reduce((sum, d) => sum + d.discountRate, 0) / mockNegoDeals.length
            )}
            %
          </p>
        </div>
      </div>

      {/* Deals Grid */}
      {deals.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            현재{' '}
            {filter === 'all'
              ? '진행 중인'
              : filter === 'ending-soon'
                ? '마감 임박'
                : filter === 'near-goal'
                  ? '목표에 근접한'
                  : '참여한'}{' '}
            네고딜이 없습니다.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">{deals.length}개의 네고딜</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <NegoDealCard key={deal.id} deal={deal} onUpdate={handleDealUpdate} />
            ))}
          </div>
        </>
      )}

      {/* How it Works */}
      <div className="mt-20 bg-muted/30 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">네고딜은 어떻게 작동하나요?</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="font-semibold mb-2">제품 선택</h3>
            <p className="text-sm text-muted-foreground">
              원하는 네고딜에 참여 버튼을 클릭하세요
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="font-semibold mb-2">그룹 형성</h3>
            <p className="text-sm text-muted-foreground">
              목표 인원이 모일 때까지 대기합니다. 친구를 초대하면 더 빠르게!
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="font-semibold mb-2">할인 단계 증가</h3>
            <p className="text-sm text-muted-foreground">
              참여자가 늘어날수록 할인율이 자동으로 올라갑니다
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              4
            </div>
            <h3 className="font-semibold mb-2">할인 구매</h3>
            <p className="text-sm text-muted-foreground">목표 달성 시 최대 할인가로 구매!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
