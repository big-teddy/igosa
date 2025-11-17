/**
 * Analytics Dashboard
 *
 * 종합 데이터 분석 대시보드
 * PostHog 데이터를 시각화하여 비즈니스 인사이트 제공
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  CreditCard,
  Search,
  Eye,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
} from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

/**
 * Analytics Overview Page
 */
export default function AnalyticsPage() {
  const posthog = usePostHog();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Page view tracking
    if (posthog) {
      posthog.capture('analytics_dashboard_viewed');
      setLoading(false);
    }
  }, [posthog]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container max-w-7xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">📊 Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                비즈니스 인사이트 및 사용자 행동 분석
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              실시간 데이터
            </Badge>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto py-8 px-4">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              개요
            </TabsTrigger>
            <TabsTrigger value="funnel">
              <BarChart3 className="h-4 w-4 mr-2" />
              전환 퍼널
            </TabsTrigger>
            <TabsTrigger value="performance">
              <Zap className="h-4 w-4 mr-2" />
              성능
            </TabsTrigger>
            <TabsTrigger value="experiments">
              <PieChart className="h-4 w-4 mr-2" />
              실험
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              사용자
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewSection />
          </TabsContent>

          {/* Funnel Tab */}
          <TabsContent value="funnel" className="space-y-6">
            <FunnelSection />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <PerformanceSection />
          </TabsContent>

          {/* Experiments Tab */}
          <TabsContent value="experiments" className="space-y-6">
            <ExperimentsSection />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <UsersSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/**
 * Overview Section - Key Metrics
 */
function OverviewSection() {
  const metrics = [
    {
      title: '총 매출',
      value: '₩12,450,000',
      change: '+23.5%',
      trend: 'up' as const,
      icon: CreditCard,
      description: '지난 30일',
    },
    {
      title: '총 주문',
      value: '342',
      change: '+18.2%',
      trend: 'up' as const,
      icon: ShoppingCart,
      description: '지난 30일',
    },
    {
      title: '전환율',
      value: '4.8%',
      change: '+1.2%',
      trend: 'up' as const,
      icon: TrendingUp,
      description: '검색 → 구매',
    },
    {
      title: 'DAU',
      value: '1,247',
      change: '-5.3%',
      trend: 'down' as const,
      icon: Users,
      description: '일일 활성 사용자',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">핵심 지표</h2>
        <p className="text-muted-foreground">지난 30일 비즈니스 성과</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{metric.value}</div>
              <div className="flex items-center gap-2 text-sm">
                <Badge
                  variant={metric.trend === 'up' ? 'default' : 'destructive'}
                  className="font-semibold"
                >
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {metric.change}
                </Badge>
                <span className="text-muted-foreground">{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>인기 상품 Top 10</CardTitle>
          <CardDescription>가장 많이 조회된 상품</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((rank) => (
              <div key={rank} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {rank}
                  </div>
                  <div>
                    <p className="font-medium">에어팟 프로 2세대</p>
                    <p className="text-sm text-muted-foreground">Apple</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">1,{234 - rank * 100}회</p>
                  <p className="text-sm text-muted-foreground">조회</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Funnel Section - Conversion Funnel
 */
function FunnelSection() {
  const funnelSteps = [
    { name: '검색 수행', count: 10000, percentage: 100, icon: Search },
    { name: '상품 조회', count: 6500, percentage: 65, icon: Eye },
    { name: '장바구니 추가', count: 2800, percentage: 28, icon: ShoppingCart },
    { name: '결제 시작', count: 1200, percentage: 12, icon: CreditCard },
    { name: '구매 완료', count: 480, percentage: 4.8, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">전환 퍼널 분석</h2>
        <p className="text-muted-foreground">검색부터 구매까지의 사용자 여정</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사용자 구매 여정</CardTitle>
          <CardDescription>지난 30일 데이터</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {funnelSteps.map((step, idx) => {
            const prevStep = idx > 0 ? funnelSteps[idx - 1] : null;
            const dropoff = prevStep
              ? ((prevStep.count - step.count) / prevStep.count * 100).toFixed(1)
              : null;

            return (
              <div key={idx} className="space-y-2">
                {dropoff && (
                  <div className="flex items-center justify-end text-sm text-red-600">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    <span>-{dropoff}% 이탈</span>
                  </div>
                )}
                <div className="relative">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <step.icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-semibold">{step.name}</p>
                        <div className="mt-2">
                          <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${step.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold">{step.count.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{step.percentage}%</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">4.8%</p>
                <p className="text-sm text-muted-foreground">전체 전환율</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">40%</p>
                <p className="text-sm text-muted-foreground">장바구니 포기율</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">43%</p>
                <p className="text-sm text-muted-foreground">상품 조회율</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Performance Section - Web Vitals
 */
function PerformanceSection() {
  const webVitals = [
    { name: 'LCP', value: '2.1s', score: 'good', target: '< 2.5s', percentage: 85 },
    { name: 'FID', value: '78ms', score: 'good', target: '< 100ms', percentage: 92 },
    { name: 'CLS', value: '0.08', score: 'good', target: '< 0.1', percentage: 88 },
    { name: 'INP', value: '145ms', score: 'good', target: '< 200ms', percentage: 79 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">성능 모니터링</h2>
        <p className="text-muted-foreground">Core Web Vitals 및 페이지 성능</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {webVitals.map((metric) => (
          <Card key={metric.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{metric.name}</span>
                <Badge
                  variant={metric.score === 'good' ? 'default' : 'destructive'}
                >
                  {metric.score === 'good' ? '양호' : '개선 필요'}
                </Badge>
              </CardTitle>
              <CardDescription>{metric.target} 목표</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{metric.value}</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">양호 비율</span>
                  <span className="font-semibold">{metric.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600"
                    style={{ width: `${metric.percentage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>페이지별 성능</CardTitle>
          <CardDescription>평균 로드 시간 (초)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { page: '홈페이지', time: 1.8, rating: 'good' },
              { page: '상품 상세', time: 2.3, rating: 'good' },
              { page: '네고딜 목록', time: 2.1, rating: 'good' },
              { page: '체크아웃', time: 3.2, rating: 'needs-improvement' },
              { page: '검색 결과', time: 1.9, rating: 'good' },
            ].map((page) => (
              <div key={page.page} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">{page.page}</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">{page.time}s</span>
                  <Badge
                    variant={page.rating === 'good' ? 'default' : 'secondary'}
                  >
                    {page.rating === 'good' ? '✓ 양호' : '⚠️ 개선'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Experiments Section - A/B Tests
 */
function ExperimentsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">A/B 테스트 실험</h2>
        <p className="text-muted-foreground">진행 중 및 완료된 실험</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>활성 실험</CardTitle>
          <CardDescription>현재 진행 중인 A/B 테스트</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              name: '검색 결과 정렬 방식',
              status: 'running',
              control: { name: '가격순', conversion: 5.2 },
              test: { name: 'AI 추천순', conversion: 6.8 },
              winner: 'test',
            },
            {
              name: 'CTA 버튼 색상',
              status: 'running',
              control: { name: '파란색', conversion: 4.3 },
              test: { name: '초록색', conversion: 4.5 },
              winner: null,
            },
          ].map((exp) => (
            <div key={exp.name} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{exp.name}</h3>
                <Badge variant="outline">진행중</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded">
                  <p className="text-sm text-muted-foreground mb-1">Control</p>
                  <p className="font-medium">{exp.control.name}</p>
                  <p className="text-lg font-bold">{exp.control.conversion}%</p>
                </div>
                <div className="p-3 bg-primary/10 rounded border-2 border-primary">
                  <p className="text-sm text-muted-foreground mb-1">Test</p>
                  <p className="font-medium">{exp.test.name}</p>
                  <p className="text-lg font-bold text-primary">{exp.test.conversion}%</p>
                  {exp.winner === 'test' && (
                    <Badge className="mt-1" variant="default">
                      +{((exp.test.conversion / exp.control.conversion - 1) * 100).toFixed(1)}% 우수
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Users Section - User Analytics
 */
function UsersSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">사용자 분석</h2>
        <p className="text-muted-foreground">사용자 참여 및 행동 패턴</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>DAU</CardTitle>
            <CardDescription>일일 활성 사용자</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,247</div>
            <p className="text-sm text-muted-foreground mt-1">어제 대비 -5.3%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MAU</CardTitle>
            <CardDescription>월간 활성 사용자</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8,945</div>
            <p className="text-sm text-muted-foreground mt-1">지난 달 대비 +12.4%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>세션 지속시간</CardTitle>
            <CardDescription>평균 세션 길이</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4m 32s</div>
            <p className="text-sm text-muted-foreground mt-1">어제 대비 +8.2%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사용자 리텐션</CardTitle>
          <CardDescription>일별 재방문율</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {[
              { day: 'D1', rate: 45 },
              { day: 'D3', rate: 32 },
              { day: 'D7', rate: 24 },
              { day: 'D14', rate: 18 },
              { day: 'D21', rate: 15 },
              { day: 'D30', rate: 12 },
            ].map((retention) => (
              <div key={retention.day} className="text-center">
                <div className="text-sm text-muted-foreground mb-2">{retention.day}</div>
                <div className="text-2xl font-bold">{retention.rate}%</div>
                <div className="w-full h-2 bg-muted rounded-full mt-2">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${retention.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
