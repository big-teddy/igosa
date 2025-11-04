"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, ShoppingCart, TrendingDown, Sparkles, Search, ArrowRight, Zap } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { mockProducts } from "@/lib/data/mock-products";
import { NegoDealCard } from "@/components/nego-deals/nego-deal-card";
import { getNegoDealsEndingSoon } from "@/lib/data/mock-nego-deals";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState(mockProducts.slice(0, 4));
  const [hotDeals, setHotDeals] = useState(getNegoDealsEndingSoon().slice(0, 3));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const quickSearches = [
    "러닝화",
    "노트북",
    "무선 이어폰",
    "스마트워치",
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Search */}
      <section className="relative flex-1 flex flex-col items-center justify-center p-8 md:p-24 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(217,70,239,0.1),transparent_50%)]" />
        </div>

        <div className="max-w-4xl mx-auto w-full text-center space-y-8 relative z-10">
          {/* AI Badge */}
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium gradient-text">AI-Powered Shopping</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              <span className="inline-block animate-float">AI</span>와 함께하는
              <br />
              <span className="gradient-text text-6xl md:text-8xl">스마트 쇼핑</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              자연어로 물어보고, 실시간 가격을 비교하고, 함께 구매해요
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto w-full">
            <div className="glass-card p-2">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
                <Input
                  type="text"
                  placeholder="찾고 싶은 제품을 입력하세요... (예: 편한 러닝화, 게이밍 노트북)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-16 pl-14 pr-4 text-lg bg-white/50 dark:bg-slate-900/50 border-0 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 justify-center items-center">
              <span className="text-sm font-medium text-muted-foreground">인기 검색:</span>
              {quickSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchQuery(term);
                    router.push(`/products?q=${encodeURIComponent(term)}`);
                  }}
                  className="glass-button px-4 py-2 text-sm font-medium hover:scale-105 transition-transform"
                >
                  {term}
                </button>
              ))}
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/chat">
              <Button size="lg" className="text-lg px-8 h-14 bg-gradient-to-r from-primary to-accent hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                <Sparkles className="mr-2 h-5 w-5 group-hover:animate-spin" />
                AI에게 물어보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Hot Nego Deals Section */}
      <section className="relative py-20 px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent_70%)]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <Zap className="h-10 w-10 text-orange-600 animate-pulse" />
                  <div className="absolute inset-0 h-10 w-10 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold">
                  🔥 <span className="gradient-text">마감 임박</span> 네고딜
                </h2>
              </div>
              <p className="text-lg text-muted-foreground">
                지금 참여하면 최대 20% 할인! 서두르세요
              </p>
            </div>
            <Link href="/nego-deals">
              <Button className="glass-button px-6 py-3 hover:scale-105 transition-transform">
                전체 보기
                <ArrowRight className="ml-2 h-4 w-4" />
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

      {/* Featured Products Section */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                인기 제품
              </h2>
              <p className="text-muted-foreground">
                지금 가장 많이 찾는 제품들을 확인해보세요
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline">
                전체 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              왜 이거사를 선택해야 할까요?
            </h2>
            <p className="text-lg text-muted-foreground">
              AI 기술로 더 똑똑한 쇼핑 경험을 제공합니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card border-2 hover:border-primary/30 transition-all duration-300 hover:scale-105 group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 relative">
                  <MessageSquare className="h-16 w-16 text-primary group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 h-16 w-16 bg-primary/20 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
                </div>
                <CardTitle className="text-2xl">대화형 AI 검색</CardTitle>
                <CardDescription className="text-base mt-2">
                  "편한 러닝화 추천해줘"처럼 자연스럽게 물어보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>자연어 처리로 의도 파악</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>다중 턴 대화 지원</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>한국어 완벽 지원</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-card border-2 hover:border-primary/30 transition-all duration-300 hover:scale-105 group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 relative">
                  <ShoppingCart className="h-16 w-16 text-primary group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 h-16 w-16 bg-primary/20 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
                </div>
                <CardTitle className="text-2xl">실시간 가격 비교</CardTitle>
                <CardDescription className="text-base mt-2">
                  쿠팡, 네이버, 11번가 최저가를 한눈에
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>배송비 포함 총액 비교</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>로켓배송 우선 표시</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>실시간 재고 확인</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-card border-2 hover:border-primary/30 transition-all duration-300 hover:scale-105 group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 relative">
                  <TrendingDown className="h-16 w-16 text-primary group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 h-16 w-16 bg-primary/20 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
                </div>
                <CardTitle className="text-2xl">AI 네고딜</CardTitle>
                <CardDescription className="text-base mt-2">
                  함께 구매하고 더 큰 할인 받으세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>자동 그룹 매칭</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>AI 자동 협상</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>최대 20% 할인</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.2),transparent_60%)]" />

        <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
          <div className="glass-card p-12 space-y-6">
            <div className="relative inline-block">
              <Sparkles className="h-20 w-20 mx-auto text-primary animate-pulse" />
              <div className="absolute inset-0 h-20 w-20 bg-primary/30 rounded-full blur-3xl animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="gradient-text">지금 바로</span> 시작해보세요
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              가입 없이도 AI 쇼핑 어시스턴트를 체험할 수 있어요
            </p>
            <Link href="/chat">
              <Button size="lg" className="text-xl px-16 h-16 bg-gradient-to-r from-primary to-accent hover:shadow-2xl transition-all duration-300 hover:scale-110 group mt-4">
                <Sparkles className="mr-3 h-6 w-6 group-hover:animate-spin" />
                무료로 시작하기
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
