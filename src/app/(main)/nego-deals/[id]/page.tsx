"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  getNegoDealById,
  NegoDeal
} from "@/lib/data/mock-nego-deals";
import {
  Clock,
  Users,
  TrendingDown,
  Zap,
  Check,
  ChevronLeft,
  Share2,
  Heart,
  ShoppingBag,
  AlertCircle,
  Calendar,
  Package
} from "lucide-react";

export default function NegoDealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<NegoDeal | null>(null);

  useEffect(() => {
    if (params.id) {
      const foundDeal = getNegoDealById(params.id as string);
      if (foundDeal) {
        setDeal(foundDeal);
      }
    }
  }, [params.id]);

  if (!deal) {
    return (
      <div className="container max-w-4xl mx-auto py-20 px-4 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">네고딜을 찾을 수 없습니다</h2>
        <p className="text-muted-foreground mb-6">
          요청하신 네고딜이 종료되었거나 존재하지 않습니다.
        </p>
        <Link href="/nego-deals">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" />
            네고딜 목록으로
          </Button>
        </Link>
      </div>
    );
  }

  const handleParticipate = () => {
    // 로그인 확인
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push(`/login?redirect=/nego-deals/${params.id}`);
      return;
    }

    // 결제 페이지로 이동
    router.push(`/checkout?dealId=${params.id}`);
  };

  const timeUrgent = deal.hoursRemaining <= 24;
  const isGoalReached = deal.status === 'goal_reached';
  const remainingSlots = deal.targetParticipants - deal.currentParticipants;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container max-w-6xl mx-auto py-4 px-4">
          <Link
            href="/nego-deals"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            네고딜 목록으로
          </Link>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - Product Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Product Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <Image
                src={deal.productImage}
                alt={deal.productName}
                fill
                className="object-cover"
              />
              {isGoalReached && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-600 text-white">
                    <Zap className="h-3 w-3 mr-1" />
                    목표 달성!
                  </Badge>
                </div>
              )}
              {timeUrgent && !isGoalReached && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-red-600 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    마감 임박
                  </Badge>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{deal.brand}</Badge>
                <Badge variant="outline">{deal.platform}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{deal.productName}</h1>
              <p className="text-lg text-muted-foreground mb-4">
                {deal.description}
              </p>

              {/* Price Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-4xl font-bold text-primary">
                      ₩{deal.targetPrice.toLocaleString()}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      ₩{deal.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="destructive" className="text-sm px-3 py-1">
                      {deal.discountRate}% 할인
                    </Badge>
                    <span className="text-green-600 font-semibold">
                      ₩{deal.savings.toLocaleString()} 절약
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Highlights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">네고딜 혜택</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {deal.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* How it Works */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">진행 방식</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">참여 신청</h4>
                    <p className="text-sm text-muted-foreground">
                      "참여하기" 버튼을 클릭하여 네고딜에 참여합니다
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">목표 달성 대기</h4>
                    <p className="text-sm text-muted-foreground">
                      {deal.targetParticipants}명이 모일 때까지 대기합니다
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">할인가 적용</h4>
                    <p className="text-sm text-muted-foreground">
                      목표 달성 시 자동으로 {deal.discountRate}% 할인가가 적용됩니다
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">구매 완료</h4>
                    <p className="text-sm text-muted-foreground">
                      결제를 진행하고 제품을 받으시면 됩니다
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Participation */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 space-y-4">
              {/* Progress Card */}
              <Card>
                <CardHeader>
                  <CardTitle>진행 현황</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">
                          {deal.currentParticipants}/{deal.targetParticipants}명 참여
                        </span>
                      </div>
                      <span className="font-bold text-primary">
                        {deal.progress}%
                      </span>
                    </div>
                    <Progress value={deal.progress} className="h-3" />
                    <p className="text-xs text-muted-foreground">
                      {remainingSlots}명 더 필요합니다
                    </p>
                  </div>

                  {/* Time Remaining */}
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Clock className={`h-5 w-5 ${timeUrgent ? 'text-red-600' : ''}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">남은 시간</p>
                      <p className={`font-bold ${timeUrgent ? 'text-red-600' : ''}`}>
                        {deal.hoursRemaining}시간
                      </p>
                    </div>
                  </div>

                  {/* Participate Button */}
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleParticipate}
                    disabled={deal.status === 'expired'}
                  >
                    {isGoalReached ? (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        지금 참여하기 (마감 임박)
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        네고딜 참여하기
                      </>
                    )}
                  </Button>

                  {deal.status === 'goal_reached' && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-green-900 dark:text-green-100 text-sm">
                            목표 달성!
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300">
                            할인가가 확정되었습니다. 서둘러 참여하세요!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Heart className="h-4 w-4 mr-2" />
                      찜하기
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share2 className="h-4 w-4 mr-2" />
                      공유
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Deal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">네고딜 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">시작일</span>
                    <span className="font-medium">
                      {new Date(deal.startDate).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">마감일</span>
                    <span className="font-medium">
                      {new Date(deal.endDate).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">플랫폼</span>
                    <span className="font-medium">{deal.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">배송</span>
                    <span className="font-medium">
                      {deal.platform === 'coupang' ? '로켓배송' : '일반배송'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
