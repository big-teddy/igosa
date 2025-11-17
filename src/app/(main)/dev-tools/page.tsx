"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Zap, Activity, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export default function DevToolsPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [lastSimulation, setLastSimulation] = useState<any>(null);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/price-tracking/simulate-updates');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/price-tracking/simulate-updates', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Simulation failed');
      }

      const data = await response.json();
      setLastSimulation(data);

      if (data.triggered > 0) {
        toast.success(`${data.triggered}개의 가격 알림 발동!`, {
          description: `${data.updated}개의 가격이 업데이트되었습니다`,
        });
      } else {
        toast.info('가격 시뮬레이션 완료', {
          description: `${data.updated}개의 가격이 업데이트되었습니다`,
        });
      }

      // Reload stats
      await loadStats();
    } catch (error: any) {
      console.error('Simulation error:', error);
      toast.error('시뮬레이션 실패', {
        description: error.message || '다시 시도해주세요',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">개발자 도구</h1>
        <p className="text-muted-foreground">
          NegoDeal 2.0 Price Tracking 시스템 테스트 도구
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Price Simulation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              가격 시뮬레이션
            </CardTitle>
            <CardDescription>
              활성화된 가격 추적의 현재 가격을 무작위로 변경합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
              <p className="font-medium">시뮬레이션 동작:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>현재 가격의 -5% ~ +3% 범위로 변경</li>
                <li>목표 가격 도달 시 상태를 'triggered'로 변경</li>
                <li>price_alerts 테이블에 알림 생성</li>
                <li>last_checked_at 타임스탬프 업데이트</li>
              </ul>
            </div>

            <Button
              onClick={runSimulation}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  시뮬레이션 실행 중...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  가격 시뮬레이션 실행
                </>
              )}
            </Button>

            {lastSimulation && (
              <div className="p-4 border rounded-lg space-y-2">
                <p className="font-semibold">마지막 시뮬레이션 결과:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">업데이트:</span>
                    <span className="font-bold ml-2">{lastSimulation.updated}개</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">알림 발동:</span>
                    <span className="font-bold ml-2 text-green-600">{lastSimulation.triggered}개</span>
                  </div>
                </div>
                {lastSimulation.details?.triggered && lastSimulation.details.triggered.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold">발동된 알림:</p>
                    {lastSimulation.details.triggered.map((t: any, i: number) => (
                      <div key={i} className="text-xs p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded">
                        <p className="font-medium">{t.productName}</p>
                        <p className="text-muted-foreground">
                          목표: ₩{t.targetPrice.toLocaleString()} → 현재: ₩{t.currentPrice.toLocaleString()}
                          <Badge variant="secondary" className="ml-2 text-xs">
                            ₩{t.savings.toLocaleString()} 절감
                          </Badge>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              추적 통계
            </CardTitle>
            <CardDescription>
              현재 가격 추적 시스템의 상태
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={loadStats}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              통계 새로고침
            </Button>

            {stats ? (
              <div className="space-y-3">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">전체 추적</div>
                  <div className="text-3xl font-bold">{stats.total}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">활성</span>
                    </div>
                    <div className="text-xl font-bold">{stats.active}</div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">발동됨</span>
                    </div>
                    <div className="text-xl font-bold text-green-600">{stats.triggered}</div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">일시중지</span>
                    </div>
                    <div className="text-xl font-bold">{stats.paused}</div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">만료/취소</span>
                    </div>
                    <div className="text-xl font-bold text-muted-foreground">
                      {stats.expired + stats.cancelled}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                통계를 로드하려면 새로고침 버튼을 클릭하세요
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* API Documentation */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>API 문서</CardTitle>
          <CardDescription>
            Price Tracking 시뮬레이션 API 사용법
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="font-mono text-sm p-3 bg-muted rounded-lg mb-2">
              POST /api/price-tracking/simulate-updates
            </div>
            <p className="text-sm text-muted-foreground">
              모든 활성 가격 추적의 가격을 시뮬레이션하고 목표 가격 도달 시 알림을 생성합니다
            </p>
          </div>

          <div>
            <div className="font-mono text-sm p-3 bg-muted rounded-lg mb-2">
              GET /api/price-tracking/simulate-updates
            </div>
            <p className="text-sm text-muted-foreground">
              현재 가격 추적 시스템의 통계를 반환합니다
            </p>
          </div>

          <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
            <p className="text-sm font-semibold mb-1">⚠️ 개발 전용</p>
            <p className="text-xs text-muted-foreground">
              이 도구는 개발 및 테스트 목적으로만 사용되어야 합니다.
              프로덕션에서는 실제 가격 크롤링 시스템으로 대체됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
