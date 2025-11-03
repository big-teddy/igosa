"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NegoDealCard } from "@/components/nego-deals/nego-deal-card";
import {
  mockNegoDeals,
  getActiveNegoDeals,
  getNegoDealsEndingSoon,
  getNegoDealsNearGoal
} from "@/lib/data/mock-nego-deals";
import { Clock, TrendingUp, Sparkles } from "lucide-react";

type FilterType = 'all' | 'ending-soon' | 'near-goal';

export default function NegoDealsPage() {
  const [filter, setFilter] = useState<FilterType>('all');

  const getFilteredDeals = () => {
    switch (filter) {
      case 'ending-soon':
        return getNegoDealsEndingSoon();
      case 'near-goal':
        return getNegoDealsNearGoal();
      default:
        return getActiveNegoDeals();
    }
  };

  const deals = getFilteredDeals();

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">AI 네고딜</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          같은 제품을 원하는 사람들과 함께 구매하고 더 큰 할인을 받으세요.
          <br />
          AI가 자동으로 그룹을 만들고 판매자와 협상합니다.
        </p>
      </div>

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
            {getNegoDealsEndingSoon().filter(d => d.hoursRemaining <= 24).length}개
          </p>
        </div>
        <div className="bg-muted p-6 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">평균 할인율</p>
          <p className="text-3xl font-bold">
            {Math.round(
              mockNegoDeals.reduce((sum, d) => sum + d.discountRate, 0) /
              mockNegoDeals.length
            )}%
          </p>
        </div>
      </div>

      {/* Deals Grid */}
      {deals.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            현재 {filter === 'all' ? '진행 중인' : filter === 'ending-soon' ? '마감 임박' : '목표에 근접한'} 네고딜이 없습니다.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            {deals.length}개의 네고딜
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <NegoDealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </>
      )}

      {/* How it Works */}
      <div className="mt-20 bg-muted/30 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          네고딜은 어떻게 작동하나요?
        </h2>
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
              목표 인원이 모일 때까지 대기합니다
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="font-semibold mb-2">AI 협상</h3>
            <p className="text-sm text-muted-foreground">
              AI가 판매자에게 단체 할인을 요청합니다
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              4
            </div>
            <h3 className="font-semibold mb-2">할인 구매</h3>
            <p className="text-sm text-muted-foreground">
              성공 시 할인가로 자동 주문 진행
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
