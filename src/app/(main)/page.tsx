"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Search,
  ArrowRight,
  TrendingUp,
  Clock,
  Users,
  User,
} from "lucide-react";

// AI 어시스턴트 핵심 기능
const AI_FEATURES = [
  {
    id: "price",
    title: "가격 비교",
    icon: "💰",
    description: "여러 쇼핑몰 최저가 한눈에",
    example: "에어팟 프로 2세대 최저가 찾아줘",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: "recommend",
    title: "추천템",
    icon: "✨",
    description: "AI 맞춤 제품 추천",
    example: "20만원대 가성비 노트북 추천해줘",
    gradient: "from-purple-500 to-pink-500"
  },
];

// 실시간 트렌딩 검색어
const TRENDING_SEARCHES = [
  { text: "무선 이어폰", count: 234, trend: "up" },
  { text: "겨울 패딩", count: 189, trend: "up" },
  { text: "공기청정기", count: 156, trend: "up" },
  { text: "게이밍 의자", count: 142, trend: "up" },
];

// 예시 질문들
const EXAMPLE_PROMPTS = [
  "편한 러닝화 추천해줘",
  "50만원대 노트북 최저가는?",
  "친구들이 많이 산 무선 이어폰",
  "겨울 패딩 인기 순위",
];

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const resultsEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (resultsEndRef.current) {
      resultsEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [searchResults, isTyping]);

  // Focus input after results appear
  useEffect(() => {
    if (showResults && !isSearching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showResults, isSearching]);

  const handleSearch = async (e: React.FormEvent, queryOverride?: string) => {
    e.preventDefault();
    const query = queryOverride || searchQuery;

    if (query.trim()) {
      setIsSearching(true);
      setShowResults(true);

      // Add user message immediately
      setSearchResults(prev => [
        ...prev,
        {
          type: 'user-query',
          content: query,
          timestamp: new Date().toISOString()
        }
      ]);
      setSearchQuery(""); // Clear input immediately

      // Simulate typing indicator
      setIsTyping(true);

      // 실제로는 AI API 호출
      // 지금은 시뮬레이션
      setTimeout(() => {
        setIsTyping(false);
        setSearchResults(prev => [
          ...prev,
          {
            type: 'ai-response',
            content: `"${query}"에 대한 AI 분석 결과입니다. 여러 쇼핑몰의 가격을 비교하고 최적의 제품을 찾아드리겠습니다.`,
            timestamp: new Date().toISOString()
          }
        ]);
        setIsSearching(false);
      }, 1500);
    }
  };

  const handleQuickAction = (featureId: string) => {
    const exampleQuery = featureId === 'price'
      ? '에어팟 프로 2세대 최저가 찾아줘'
      : '20만원대 가성비 노트북 추천해줘';

    setSearchQuery(exampleQuery);
    setSearchResults([]); // Clear previous results
    setShowResults(true);
    setIsSearching(true);

    setTimeout(() => {
      setSearchResults([
        {
          type: 'user-query',
          content: exampleQuery,
          timestamp: new Date().toISOString()
        },
        {
          type: 'ai-response',
          content: `${exampleQuery}에 대해 분석하고 있습니다. 최적의 제품을 찾아드리겠습니다.`,
          timestamp: new Date().toISOString()
        }
      ]);
      setSearchQuery(""); // Clear input
      setIsSearching(false);
    }, 1500);
  };

  const handleExamplePrompt = (prompt: string) => {
    setSearchQuery(prompt);
    setSearchResults([]); // Clear previous results
    handleSearch({ preventDefault: () => {} } as React.FormEvent, prompt);
  };

  const handleTrendingSearch = (query: string) => {
    setSearchQuery(query);
    setSearchResults([]); // Clear previous results
    handleSearch({ preventDefault: () => {} } as React.FormEvent, query);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main Content - Service Interface */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-4xl mx-auto space-y-8">

          {/* Header - Simple & Clean */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">이거사</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              AI 쇼핑 어시스턴트
            </p>
            <Badge variant="secondary" className="inline-flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              온라인
            </Badge>
          </div>

          {/* Main Search Interface */}
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-all duration-200 group-focus-within:scale-110"
                  aria-hidden="true"
                />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="무엇을 찾고 계신가요? 친구처럼 편하게 물어보세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-16 pl-16 pr-32 text-lg rounded-2xl border-2 border-border focus:border-primary shadow-lg hover:shadow-xl focus:shadow-2xl transition-all duration-300 bg-card focus:scale-[1.01]"
                  aria-label="제품 검색"
                  autoComplete="off"
                  disabled={isSearching}
                />
                {searchQuery && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <kbd className="hidden sm:inline-flex h-6 px-2 items-center gap-1 rounded border border-border bg-muted text-xs font-medium text-muted-foreground">
                      Enter
                    </kbd>
                  </div>
                )}
              </div>
            </form>

            {/* Example Prompts - Chips - Only show when no conversation */}
            {!showResults && (
              <div className="flex flex-wrap items-center justify-center gap-2 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                <span className="text-sm text-muted-foreground">예시:</span>
                {EXAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExamplePrompt(prompt)}
                    className="px-4 py-2 rounded-full border border-border hover:border-primary hover:bg-primary/5 text-sm transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    tabIndex={0}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Cards - 2 Core Features - Only show when no conversation */}
          {!showResults && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-100">
              {AI_FEATURES.map((feature, idx) => (
                <button
                  key={feature.id}
                  onClick={() => handleQuickAction(feature.id)}
                  className="group p-6 rounded-2xl border-2 border-border hover:border-primary/50 bg-card hover:shadow-2xl transition-all duration-300 text-left relative overflow-hidden hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                        {feature.icon}
                      </div>
                      <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" aria-hidden="true" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors duration-200">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        💬 예: "{feature.example}"
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches - Only show when no conversation */}
          {!showResults && (
            <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-200">
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>실시간 인기 검색어</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TRENDING_SEARCHES.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTrendingSearch(search.text)}
                    className="p-4 rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all duration-200 text-left group bg-card hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform duration-200 inline-block">
                        {idx + 1}
                      </span>
                      <TrendingUp className="h-4 w-4 text-green-500 group-hover:animate-bounce" aria-hidden="true" />
                    </div>
                    <p className="font-medium text-sm group-hover:text-primary transition-colors duration-200">
                      {search.text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Users className="h-3 w-3 inline mr-1" aria-hidden="true" />
                      {search.count}명 검색 중
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results Section - Inline */}
          {showResults && (
            <div className="space-y-4 pt-8 border-t border-border/50 animate-in fade-in-50 slide-in-from-top-4 duration-500">
              {searchResults.length === 0 && isSearching ? (
                // Initial Loading State
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 animate-pulse">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 space-y-3 pt-1">
                      <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-muted rounded animate-pulse w-full" />
                      <div className="h-3 bg-muted rounded animate-pulse w-5/6" />
                    </div>
                  </div>
                </div>
              ) : (
                // Results Display - Conversation Format
                <div className="space-y-4">
                  {searchResults.map((result, idx) => (
                    <div key={idx} className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                      {result.type === 'user-query' && (
                        <div className="flex items-end gap-3 justify-end group">
                          <div className="max-w-[85%] md:max-w-[75%] space-y-1">
                            <div className="px-4 py-3 rounded-2xl rounded-br-md bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-md">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{result.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground text-right px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {new Date(result.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center shrink-0 shadow-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      )}

                      {result.type === 'ai-response' && (
                        <div className="flex items-start gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-md">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                          <div className="max-w-[85%] md:max-w-[75%] space-y-1">
                            <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{result.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {new Date(result.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )}

                      {result.type === 'products' && result.items?.length > 0 && (
                        <div className="space-y-4 pl-11">
                          <h3 className="text-base font-semibold">추천 제품</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Product cards will be mapped here */}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-start gap-3 animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-md">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-card border border-border shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scroll anchor */}
                  <div ref={resultsEndRef} />

                  {/* Follow-up prompt input - sticky at bottom */}
                  <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-background via-background to-transparent">
                    <form onSubmit={handleSearch} className="relative">
                      <Input
                        type="text"
                        placeholder="추가 질문이 있으신가요?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-14 pl-6 pr-14 rounded-xl border-2 border-border focus:border-primary bg-card shadow-lg transition-all duration-200 focus:shadow-xl"
                        aria-label="추가 질문 입력"
                        disabled={isSearching}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg shadow-md"
                        disabled={isSearching || !searchQuery.trim()}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trust Indicators - Minimal - Only show when no results */}
          {!showResults && (
            <div className="text-center pt-4 border-t border-border/30">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">1,234명</strong>이 더 똑똑한 쇼핑을 경험하고 있어요
              </p>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
