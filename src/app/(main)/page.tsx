"use client";
/**
 * 이거사 홈페이지 - AI 쇼핑 에이전트
 * Updated: 2025-11-17 v4 - 성능 최적화 및 타입 안정성 개선
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRecentSearches } from "@/hooks/useRecentSearches";
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
  DollarSign,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/lib/stores/mode-store";
import { toast } from "sonner";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { ErrorDisplay } from "@/components/ui/error-display";
import { RecentSearches } from "@/components/ui/recent-searches";
import { ProductRecommendationCard } from "@/components/rich-cards/ProductRecommendationCard";
import { ProductRecommendationCard as ProductCardType } from "@/types/rich-card";
import { buildProductCards } from "@/lib/utils/card-builder";
import { searchProducts } from "@/lib/data/mock-products";
import { getFriendPurchases, getSocialReviewsByProduct } from "@/lib/data/mock-social";
import { getInfluencerReviewsByProduct, getInfluencerReviewSummary } from "@/lib/data/mock-influencer";
import { detectProductKeyword } from "@/lib/utils/keyword-matcher";
import type { SearchMessage, ConversationMessage, ErrorState } from "@/types/search";
import { analytics } from "@/lib/monitoring/posthog";

// 실시간 트렌딩 검색어
const TRENDING_SEARCHES = [
  { text: "무선 이어폰", count: 234, trend: "up" },
  { text: "겨울 패딩", count: 189, trend: "up" },
  { text: "공기청정기", count: 156, trend: "up" },
];

// 모드별 예시 질문들
const MODE_SPECIFIC_PROMPTS = {
  price: [
    "에어팟 프로 최저가 어디야?",
    "갤럭시 버즈 가격 비교해줘",
    "아이폰 15 어디가 제일 싸?",
  ],
  recommend: [
    "20만원대 가성비 노트북 추천해줘",
    "운동하기 좋은 이어폰 뭐가 있을까?",
    "친구들이 많이 쓰는 무선충전기는?",
  ],
};

// 모드별 Placeholder 타이핑 애니메이션
const MODE_PLACEHOLDERS = {
  price: [
    "최저가를 찾고 계신가요?",
    "여러 쇼핑몰 가격을 비교해드릴게요",
    "똑똑한 가격 비교, 지금 시작하세요",
  ],
  recommend: [
    "어떤 제품이 필요하신가요?",
    "AI가 딱 맞는 제품을 찾아드릴게요",
    "맞춤 추천으로 완벽한 선택을",
  ],
};

export default function Home() {
  const router = useRouter();
  const { searchMode, setSearchMode } = useModeStore();
  const { searches: recentSearches, addSearch, removeSearch, clearAll: clearAllSearches } = useRecentSearches();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchMessage[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayPlaceholder, setDisplayPlaceholder] = useState("");
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [richCards, setRichCards] = useState<ProductCardType[]>([]);
  const [errorState, setErrorState] = useState<ErrorState | null>(null);
  const [lastQuery, setLastQuery] = useState<string>("");
  const resultsEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Mock user ID (실제로는 로그인 시스템에서 가져옴)
  const userId = 'user-1';

  // Placeholder 타이핑 애니메이션 - 모드에 따라 변경
  useEffect(() => {
    if (showResults) return;

    const placeholders = MODE_PLACEHOLDERS[searchMode];
    let currentText = "";
    let currentIndex = 0;
    const text = placeholders[placeholderIndex % placeholders.length];

    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        currentText += text[currentIndex];
        setDisplayPlaceholder(currentText);
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 2000);
      }
    }, 80);

    return () => clearInterval(typingInterval);
  }, [placeholderIndex, showResults, searchMode]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (resultsEndRef.current && showResults && (searchResults.length > 0 || isTyping)) {
      resultsEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [searchResults, isTyping, showResults]);

  // Focus input after results appear
  useEffect(() => {
    if (showResults && !isSearching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showResults, isSearching]);

  const handleSearch = useCallback(async (e: React.FormEvent, queryOverride?: string) => {
    e.preventDefault();

    setIsSearching(true);
    setShowResults(true);
    setErrorState(null);

    // Get query from override or current state
    const query = queryOverride || searchQuery;

    if (!query.trim()) {
      setIsSearching(false);
      return;
    }

    setLastQuery(query);
    addSearch(query);

    // Add user message immediately
    const userMessage: SearchMessage = {
      type: 'user-query' as const,
      content: query,
      timestamp: new Date().toISOString()
    };
    setSearchResults(prev => [...prev, userMessage]);
    setSearchQuery("");

    // Update conversation history using functional update
    let newMessages: ConversationMessage[] = [];
    setConversationMessages(prev => {
      newMessages = [
        ...prev,
        { role: 'user' as const, content: query }
      ];
      return newMessages;
    });

    // Simulate typing indicator
    setIsTyping(true);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Call actual chat API with mode
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          mode: searchMode
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
      let currentResult: any = null;

      setIsTyping(false);

      // Add initial AI response placeholder
      const aiMessagePlaceholder: SearchMessage = {
        type: 'ai-response' as const,
        content: '',
        timestamp: new Date().toISOString()
      };
      setSearchResults(prev => [...prev, aiMessagePlaceholder]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                aiResponse += content;

                // Update the last message with streaming content
                setSearchResults(prev => {
                  const newResults = [...prev];
                  const lastIdx = newResults.length - 1;
                  if (newResults[lastIdx] && newResults[lastIdx].type === 'ai-response') {
                    newResults[lastIdx] = {
                      ...newResults[lastIdx],
                      content: aiResponse
                    };
                  }
                  return newResults;
                });
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }

      // Update conversation history with AI response
      setConversationMessages(prev => [
        ...prev,
        { role: 'assistant', content: aiResponse }
      ]);

      // 제품 검색 키워드 감지 및 Rich Card 생성
      const detectedKeyword = detectProductKeyword(query);
      let resultsCount = 0;

      if (detectedKeyword) {
        // 제품 검색 및 Rich Card 생성
        const products = searchProducts(detectedKeyword);
        if (products.length > 0) {
          resultsCount = products.length;
          const cards = buildProductCards(
            products.slice(0, 3), // 최대 3개 제품
            userId,
            searchMode,
            getFriendPurchases,
            getSocialReviewsByProduct,
            getInfluencerReviewsByProduct,
            getInfluencerReviewSummary
          );

          // Rich Card 데이터 추가
          setRichCards(cards);
          const richCardsMessage: SearchMessage = {
            type: 'rich-cards' as const,
            cards: cards,
            timestamp: new Date().toISOString()
          };
          setSearchResults(prev => [...prev, richCardsMessage]);
        }
      }

      // Track search event
      analytics.trackSearch(query, resultsCount, searchMode);

      setIsSearching(false);
    } catch (error: any) {
      console.error('Search error:', error);
      setIsTyping(false);
      setIsSearching(false);

      if (error.name === 'AbortError') {
        // Request was cancelled
        toast.info('검색이 취소되었습니다.');
        return;
      }

      // Determine error type and show appropriate message
      let errorMessage = 'AI 응답을 불러오는 중 문제가 발생했습니다.';
      let suggestions = ['잠시 후 다시 시도해보세요', '인터넷 연결을 확인해주세요', '검색어를 바꿔서 시도해보세요'];

      if (error.message.includes('API error: 429')) {
        errorMessage = '요청이 너무 많습니다. 잠시만 기다려주세요.';
        suggestions = [
          '1-2분 후 다시 시도해주세요',
          '동시에 너무 많은 검색을 하지 마세요',
          '다른 검색어로 시도해보세요'
        ];
        toast.error('요청 한도 초과');
      } else if (error.message.includes('API error: 401')) {
        errorMessage = 'AI 서비스 인증에 문제가 있습니다.';
        suggestions = [
          '페이지를 새로고침 해보세요',
          '로그인 상태를 확인해주세요',
          '문제가 계속되면 고객센터에 문의하세요'
        ];
        toast.error('인증 오류');
      } else if (error.message.includes('API error: 500') || error.message.includes('API error: 503')) {
        errorMessage = '서버에 일시적인 문제가 발생했습니다.';
        suggestions = [
          '잠시 후 다시 시도해주세요',
          '서버가 점검 중일 수 있습니다',
          '문제가 지속되면 고객센터에 알려주세요'
        ];
        toast.error('서버 오류');
      } else if (error.message.includes('Failed to fetch') || error.message === 'Network request failed') {
        errorMessage = '인터넷 연결이 불안정합니다.';
        suggestions = [
          'Wi-Fi 또는 데이터 연결을 확인하세요',
          '네트워크가 안정적인 곳으로 이동하세요',
          '페이지를 새로고침 해보세요'
        ];
        toast.error('네트워크 오류');
      } else {
        toast.error('검색 오류 발생');
      }

      setErrorState({ message: errorMessage, suggestions });
    }
  }, [searchQuery, searchMode, addSearch, userId]);

  // 상태 초기화 함수
  const resetConversation = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setConversationMessages([]);
    setRichCards([]);
    setShowResults(false);
    setIsSearching(false);
    setIsTyping(false);
    setErrorState(null);
    setLastQuery("");

    // Abort any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // 에러 후 재시도 함수
  const handleRetry = useCallback(() => {
    if (lastQuery) {
      setErrorState(null);
      handleSearch({ preventDefault: () => {} } as React.FormEvent, lastQuery);
    }
  }, [lastQuery, handleSearch]);

  const handleModeBasedSearch = useCallback(async () => {
    const exampleQuery = searchMode === 'price'
      ? '에어팟 프로 2세대 최저가 찾아줘'
      : '20만원대 노트북 추천해줘';

    resetConversation();

    // Trigger search with example query
    handleSearch({ preventDefault: () => {} } as React.FormEvent, exampleQuery);
  }, [searchMode, resetConversation, handleSearch]);

  const handleExamplePrompt = useCallback((prompt: string) => {
    setSearchQuery(prompt);
    // Don't clear results - continue conversation
    handleSearch({ preventDefault: () => {} } as React.FormEvent, prompt);
  }, [handleSearch]);

  const handleTrendingSearch = useCallback((query: string) => {
    resetConversation();
    setSearchQuery(query);
    handleSearch({ preventDefault: () => {} } as React.FormEvent, query);
  }, [resetConversation, handleSearch]);

  const handleRecentSearchClick = useCallback((query: string) => {
    if (!showResults) {
      // Start new conversation with recent search
      resetConversation();
    }
    setSearchQuery(query);
    handleSearch({ preventDefault: () => {} } as React.FormEvent, query);
  }, [showResults, resetConversation, handleSearch]);

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-700 ${
      searchMode === 'price'
        ? 'bg-gradient-to-b from-background via-background to-blue-50/30 dark:to-blue-950/10'
        : 'bg-gradient-to-b from-background via-background to-purple-50/30 dark:to-purple-950/10'
    }`}>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 md:py-16">
        <div className="w-full max-w-5xl mx-auto space-y-12">

          {/* Hero Section - Only show when no conversation */}
          {!showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6 pt-12 md:pt-20"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-3 mb-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  이거사
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl md:text-2xl text-muted-foreground font-medium"
              >
                AI가 도와주는 똑똑한 쇼핑
              </motion.p>
            </motion.div>
          )}

          {/* Search Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: showResults ? 0 : 0.5 }}
            className={`space-y-6 ${!showResults ? '' : 'pt-8'}`}
          >
            {/* Mode Selector - AI Service Style - 2025 Modern Design */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: showResults ? 0 : 0.6 }}
              className="flex justify-center"
              role="group"
              aria-label="검색 모드 선택"
            >
              <div className="inline-flex items-center bg-muted/80 backdrop-blur-sm rounded-full p-1.5 shadow-lg border border-border/50">
                <motion.button
                  onClick={() => {
                    setSearchMode('price');
                    setPlaceholderIndex(0);
                  }}
                  className={`relative px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                    searchMode === 'price'
                      ? 'text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="가격 비교 모드"
                  aria-pressed={searchMode === 'price'}
                  role="button"
                  tabIndex={0}
                >
                  {searchMode === 'price' && (
                    <motion.div
                      layoutId="mode-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-md"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <DollarSign className={`h-4 w-4 relative z-10 ${searchMode === 'price' ? 'text-white' : ''}`} />
                  <span className="relative z-10">가격 비교</span>
                </motion.button>

                <motion.button
                  onClick={() => {
                    setSearchMode('recommend');
                    setPlaceholderIndex(0);
                  }}
                  className={`relative px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                    searchMode === 'recommend'
                      ? 'text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="AI 추천 모드"
                  aria-pressed={searchMode === 'recommend'}
                  role="button"
                  tabIndex={0}
                >
                  {searchMode === 'recommend' && (
                    <motion.div
                      layoutId="mode-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-md"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Sparkles className={`h-4 w-4 relative z-10 ${searchMode === 'recommend' ? 'text-white' : ''}`} />
                  <span className="relative z-10">AI 추천</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Mode Description - Subtle */}
            {!showResults && (
              <AnimatePresence mode="wait">
                <motion.p
                  key={searchMode}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className={`text-center text-sm transition-colors duration-300 ${
                    searchMode === 'price' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'
                  }`}
                >
                  {searchMode === 'price'
                    ? '💰 여러 쇼핑몰의 최저가를 실시간으로 비교해드립니다'
                    : '✨ 친구와 전문가 리뷰 기반 맞춤 추천을 제공합니다'}
                </motion.p>
              </AnimatePresence>
            )}

            <div className="space-y-3">
              <form onSubmit={handleSearch} className="relative" role="search" aria-label="제품 검색">
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-all duration-300 group-focus-within:scale-110"
                    aria-hidden="true"
                  />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder={displayPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-16 md:h-18 pl-16 pr-32 text-base md:text-lg rounded-2xl border-2 border-border focus:border-primary shadow-lg hover:shadow-xl focus:shadow-2xl transition-all duration-300 bg-card focus:scale-[1.02] font-medium"
                    aria-label="제품 검색"
                    autoComplete="off"
                    disabled={isSearching}
                  />
                  {searchQuery && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2"
                    >
                      <kbd className="hidden sm:inline-flex h-7 px-3 items-center gap-1 rounded-lg border-2 border-primary/20 bg-primary/5 text-xs font-bold text-primary">
                        Enter ↵
                      </kbd>
                    </motion.div>
                  )}
                </div>
              </form>

              {/* New Conversation Button - Show when conversation is active */}
              {showResults && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center"
                >
                  <Button
                    onClick={resetConversation}
                    variant="outline"
                    size="sm"
                    className="gap-2 hover:bg-accent transition-all duration-200"
                    aria-label="새 대화 시작하기"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    새 대화 시작
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Recent Searches - Only show when no conversation and has searches */}
            {!showResults && recentSearches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <RecentSearches
                  searches={recentSearches}
                  onSearchClick={handleRecentSearchClick}
                  onRemove={removeSearch}
                  onClearAll={clearAllSearches}
                  maxDisplay={5}
                />
              </motion.div>
            )}

            {/* Example Prompts - Only show when no conversation - 모드별로 변경 */}
            {!showResults && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={searchMode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-wrap items-center justify-center gap-3"
                >
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    searchMode === 'price' ? 'text-blue-600' : 'text-purple-600'
                  }`}>
                    {searchMode === 'price' ? '💰 가격 비교 예시:' : '✨ 추천 예시:'}
                  </span>
                  {MODE_SPECIFIC_PROMPTS[searchMode].map((prompt, idx) => (
                    <motion.button
                      key={`${searchMode}-${idx}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleExamplePrompt(prompt)}
                      className={`px-5 py-2.5 rounded-full border-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        searchMode === 'price'
                          ? 'border-blue-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 focus:ring-blue-500'
                          : 'border-purple-200 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30 focus:ring-purple-500'
                      }`}
                      aria-label={`예시 검색: ${prompt}`}
                      role="button"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>

          {/* Trending Searches - Only show when no conversation */}
          {!showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="space-y-6"
              role="region"
              aria-label="실시간 인기 검색어"
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="text-lg font-bold">실시간 인기 검색어</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {TRENDING_SEARCHES.map((search, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + idx * 0.1 }}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTrendingSearch(search.text)}
                    className="p-5 rounded-2xl border-2 border-border hover:border-primary hover:shadow-lg transition-all duration-200 text-left group bg-card"
                    aria-label={`인기 검색어: ${search.text}, ${search.count}명 검색 중`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl font-bold text-primary/40 group-hover:text-primary group-hover:scale-125 transition-all duration-200 inline-block">
                        {idx + 1}
                      </span>
                      <TrendingUp className="h-5 w-5 text-green-500 group-hover:scale-125 transition-transform duration-200" aria-hidden="true" />
                    </div>
                    <p className="font-bold text-base group-hover:text-primary transition-colors duration-200 mb-2">
                      {search.text}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" aria-hidden="true" />
                      {search.count}명 검색 중
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Search Results Section - Conversation Style */}
          {showResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 pb-8"
              role="region"
              aria-label="검색 결과 및 대화 내역"
              aria-live="polite"
              aria-atomic="false"
            >
              {searchResults.map((result, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  {result.type === 'user-query' ? (
                    // User Message - Right Aligned
                    <div className="flex justify-end">
                      <div className="max-w-[80%] md:max-w-[70%]">
                        <div className="flex items-start gap-3 justify-end">
                          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-6 py-4 shadow-md">
                            <p className="text-base font-medium">{result.content}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : result.type === 'ai-response' ? (
                    // AI Response - Left Aligned
                    <div className="flex justify-start">
                      <div className="max-w-[85%] md:max-w-[75%]">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <div className="bg-muted rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm">
                            <p className="text-base leading-relaxed whitespace-pre-wrap">{result.content}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : result.type === 'rich-cards' ? (
                    // Rich Product Cards - 새로운 구조화된 카드
                    <div className="w-full">
                      <div className="space-y-4">
                        {result.cards?.map((card: ProductCardType, cardIdx: number) => (
                          <ProductRecommendationCard key={card.id} card={card} index={cardIdx} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Product Results
                    <div className="flex justify-start">
                      <div className="max-w-full w-full">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {result.products?.map((product: any, pidx: number) => (
                                <Card key={pidx} className="p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-2 hover:border-primary/50">
                                  <div className="space-y-4">
                                    <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <h4 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                        {product.name}
                                      </h4>
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-primary">
                                          {product.price.toLocaleString()}원
                                        </span>
                                        {product.originalPrice && (
                                          <span className="text-sm text-muted-foreground line-through">
                                            {product.originalPrice.toLocaleString()}원
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{product.seller}</span>
                                        {product.rating && (
                                          <div className="flex items-center gap-1">
                                            <span className="text-yellow-500">★</span>
                                            <span className="font-medium">{product.rating}</span>
                                            {product.reviewCount && (
                                              <span className="text-muted-foreground text-xs">
                                                ({product.reviewCount})
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Enhanced Loading Indicator */}
              {isTyping && (
                <div className="flex justify-center my-8">
                  <LoadingIndicator mode={searchMode} />
                </div>
              )}

              {/* Error Display */}
              {errorState && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center my-8"
                >
                  <ErrorDisplay
                    message={errorState.message}
                    suggestions={errorState.suggestions}
                    onRetry={handleRetry}
                    onGoHome={resetConversation}
                  />
                </motion.div>
              )}

              <div ref={resultsEndRef} />
            </motion.div>
          )}

          {/* Stats Footer - Only show when no conversation */}
          {!showResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center pt-12 pb-8"
            >
              <p className="text-muted-foreground text-sm">
                <strong className="text-primary text-lg font-bold">1,234명</strong>이 더 똑똑한 쇼핑을 경험하고 있어요
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
