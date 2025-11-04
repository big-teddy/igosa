"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  ShoppingCart,
  TrendingDown,
  Sparkles,
  Search,
  ArrowRight,
  Zap,
  Users,
  Star,
  Check,
  Play
} from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { mockProducts } from "@/lib/data/mock-products";
import { NegoDealCard } from "@/components/nego-deals/nego-deal-card";
import { getNegoDealsEndingSoon } from "@/lib/data/mock-nego-deals";

// 사용자 관심사 선택 옵션
const USER_INTERESTS = [
  { id: "electronics", label: "전자기기", icon: "💻", keywords: ["노트북", "스마트폰", "태블릿"] },
  { id: "fashion", label: "패션/뷰티", icon: "👗", keywords: ["옷", "가방", "화장품"] },
  { id: "sports", label: "운동/스포츠", icon: "⚽", keywords: ["러닝화", "운동복", "헬스"] },
  { id: "home", label: "생활/가전", icon: "🏠", keywords: ["청소기", "공기청정기", "주방"] },
];

// 인터랙티브 검색 제안
const QUICK_SEARCHES = [
  { text: "편한 러닝화", icon: "👟", description: "친구들이 추천하는" },
  { text: "20만원대 노트북", icon: "💻", description: "가성비 최고" },
  { text: "무선 이어폰", icon: "🎧", description: "인플루언서 인증" },
  { text: "스마트워치", icon: "⌚", description: "지금 핫한" },
];

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showDemo, setShowDemo] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState(mockProducts.slice(0, 4));
  const [hotDeals, setHotDeals] = useState(getNegoDealsEndingSoon().slice(0, 3));

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('hasVisited');
    if (hasVisited) {
      setShowOnboarding(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleQuickSearch = (query: string) => {
    router.push(`/products?q=${encodeURIComponent(query)}`);
  };

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleStartShopping = () => {
    localStorage.setItem('hasVisited', 'true');
    localStorage.setItem('userInterests', JSON.stringify(selectedInterests));
    setShowOnboarding(false);
  };

  const handleTryAI = () => {
    router.push('/chat');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Personalized Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-2xl w-full p-8 shadow-2xl border-2 border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">이거사에 오신 것을 환영합니다!</h2>
              <p className="text-muted-foreground text-lg">
                AI가 당신의 쇼핑을 도와드립니다. 먼저 관심사를 알려주세요.
              </p>
            </div>

            <div className="mb-8">
              <p className="text-sm font-medium mb-4 text-center">관심 있는 분야를 선택해주세요 (여러 개 가능)</p>
              <div className="grid grid-cols-2 gap-3">
                {USER_INTERESTS.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => handleInterestToggle(interest.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedInterests.includes(interest.id)
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50 hover:bg-accent/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{interest.icon}</span>
                      <div>
                        <p className="font-semibold">{interest.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {interest.keywords.slice(0, 2).join(", ")}
                        </p>
                      </div>
                      {selectedInterests.includes(interest.id) && (
                        <Check className="h-5 w-5 text-primary ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowOnboarding(false)}
                className="flex-1"
              >
                건너뛰기
              </Button>
              <Button
                onClick={handleStartShopping}
                disabled={selectedInterests.length === 0}
                className="flex-1 bg-gradient-to-r from-primary to-accent"
              >
                시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Immediate Value */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(217,70,239,0.1),transparent_50%)]" />
        </div>

        <div className="max-w-6xl mx-auto w-full relative z-10">
          {/* Main Value Proposition */}
          <div className="text-center mb-12">
            <Badge className="mb-4 px-4 py-2 text-sm">
              <Sparkles className="h-3 w-3 mr-2 animate-pulse" />
              한국 최초 AI 쇼핑 에이전트
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              친구처럼 물어보면
              <br />
              <span className="gradient-text">AI가 찾아드립니다</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              자연어로 물어보고, 친구 리뷰 확인하고, 함께 구매해요
            </p>

            {/* Interactive AI Chat Preview */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="glass-card p-4 bg-background/80">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm">AI 쇼핑 어시스턴트</p>
                    <p className="text-xs text-muted-foreground">실시간으로 답변합니다</p>
                  </div>
                  <Badge variant="secondary" className="animate-pulse">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    온라인
                  </Badge>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {QUICK_SEARCHES.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickSearch(search.text)}
                      className="p-3 rounded-xl border-2 border-border hover:border-primary/50 bg-card hover:bg-accent/5 transition-all text-left group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{search.icon}</span>
                        <span className="text-xs text-muted-foreground">{search.description}</span>
                      </div>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {search.text}
                      </p>
                    </button>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={handleTryAI}
                  size="lg"
                  className="w-full h-14 text-base bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  AI에게 직접 물어보기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span><strong className="text-foreground">1,234</strong>명이 이용 중</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span><strong className="text-foreground">4.8</strong> 평균 만족도</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span><strong className="text-foreground">평균 30%</strong> 절약</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Unique Value Props - 차별화 포인트 */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              왜 <span className="gradient-text">이거사</span>가 다를까요?
            </h2>
            <p className="text-lg text-muted-foreground">
              단순 가격 비교를 넘어, 신뢰할 수 있는 쇼핑 경험을 제공합니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 1. 친구 리뷰 */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">친구 리뷰 우선</CardTitle>
                <CardDescription className="text-base">
                  가장 신뢰할 수 있는 친구들의 실제 사용 후기
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>소셜 그래프 기반 친구 구매 내역 확인</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>친구가 남긴 진짜 리뷰 우선 표시</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>AI가 친구 추천 근거 설명</span>
                  </div>
                </div>
                <div className="mt-6 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs font-medium text-primary">
                    💬 "민수님이 이 제품을 구매하고 ⭐5점을 줬어요!"
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 2. 인플루언서 검증 */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="h-8 w-8 text-white fill-white" />
                </div>
                <CardTitle className="text-2xl">인플루언서 검증</CardTitle>
                <CardDescription className="text-base">
                  전문가들의 상세한 리뷰를 AI가 요약
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>유튜브, 블로그 리뷰 자동 수집</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>장단점을 한눈에 비교</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>추천률과 주요 의견 정리</span>
                  </div>
                </div>
                <div className="mt-6 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs font-medium text-primary">
                    📹 테크리뷰어 3명이 95% 추천했어요
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 3. AI 네고딜 */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingDown className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">AI 네고딜</CardTitle>
                <CardDescription className="text-base">
                  함께 구매하고 자동으로 더 큰 할인
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>AI가 비슷한 구매자 자동 매칭</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>판매자와 자동 협상</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>최대 20% 추가 할인</span>
                  </div>
                </div>
                <div className="mt-6 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <p className="text-xs font-medium text-orange-600">
                    🔥 지금 24명이 참여 중! 3명만 더 모이면 15% 할인
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Hot Nego Deals Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                🔥 <span className="gradient-text">마감 임박</span> 네고딜
              </h2>
              <p className="text-lg text-muted-foreground">
                지금 참여하면 최대 20% 할인! 서두르세요
              </p>
            </div>
            <Link href="/nego-deals">
              <Button size="lg" variant="outline" className="group">
                전체 보기
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hotDeals.map((deal) => (
              <NegoDealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary/10 via-accent/10 to-background">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-4 shadow-2xl">
            <Sparkles className="h-10 w-10 text-white" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="gradient-text">AI 쇼핑</span>, 지금 시작하세요
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            가입 없이도 바로 체험 가능합니다. 친구처럼 편하게 물어보세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/chat">
              <Button size="lg" className="text-lg px-10 h-16 bg-gradient-to-r from-primary to-accent hover:shadow-2xl transition-all hover:scale-105 group">
                <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                AI와 대화하기
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="text-lg px-10 h-16 group">
                <Search className="mr-3 h-6 w-6" />
                제품 둘러보기
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            ✨ 이미 <strong>1,234명</strong>이 더 똑똑한 쇼핑을 경험하고 있어요
          </p>
        </div>
      </section>
    </div>
  );
}
