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
  DollarSign,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/lib/stores/mode-store";
import { toast } from "sonner";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayPlaceholder, setDisplayPlaceholder] = useState("");
  const [conversationMessages, setConversationMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const resultsEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
      const userMessage = {
        type: 'user-query',
        content: query,
        timestamp: new Date().toISOString()
      };
      setSearchResults(prev => [...prev, userMessage]);
      setSearchQuery(""); // Clear input immediately

      // Update conversation history
      const newMessages = [
        ...conversationMessages,
        { role: 'user' as const, content: query }
      ];
      setConversationMessages(newMessages);

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
        setSearchResults(prev => [
          ...prev,
          {
            type: 'ai-response',
            content: '',
            timestamp: new Date().toISOString()
          }
        ]);

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

        setIsSearching(false);
      } catch (error: any) {
        console.error('Search error:', error);
        setIsTyping(false);

        if (error.name === 'AbortError') {
          // Request was cancelled
          toast.info('검색이 취소되었습니다.');
          return;
        }

        // Determine error type and show appropriate message
        let errorMessage = '죄송합니다. 검색 중 오류가 발생했습니다.';
        let toastMessage = '검색 중 오류가 발생했습니다.';

        if (error.message.includes('API error: 429')) {
          errorMessage = '잠시 후 다시 시도해주세요. (요청이 너무 많습니다)';
          toastMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('API error: 401')) {
          errorMessage = 'API 인증에 실패했습니다. 관리자에게 문의해주세요.';
          toastMessage = 'API 인증 실패';
        } else if (error.message.includes('API error: 500') || error.message.includes('API error: 503')) {
          errorMessage = '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
          toastMessage = '서버 오류가 발생했습니다.';
        } else if (error.message.includes('Failed to fetch') || error.message === 'Network request failed') {
          errorMessage = '네트워크 연결을 확인해주세요.';
          toastMessage = '네트워크 연결 오류';
        }

        toast.error(toastMessage);

        setSearchResults(prev => [
          ...prev,
          {
            type: 'ai-response',
            content: errorMessage + '\n\n다시 시도하시거나 다른 질문을 해주세요.',
            timestamp: new Date().toISOString()
          }
        ]);
        setIsSearching(false);
      }
    }
  };

  const handleModeBasedSearch = async () => {
    const exampleQuery = searchMode === 'price'
      ? '에어팟 프로 2세대 최저가 찾아줘'
      : '20만원대 노트북 추천해줘';

    setSearchQuery("");
    setSearchResults([]); // Clear previous results
    setConversationMessages([]); // Clear conversation history

    // Trigger search with example query
    handleSearch({ preventDefault: () => {} } as React.FormEvent, exampleQuery);
  };

  const handleExamplePrompt = (prompt: string) => {
    setSearchQuery(prompt);
    // Don't clear results - continue conversation
    handleSearch({ preventDefault: () => {} } as React.FormEvent, prompt);
  };

  const handleTrendingSearch = (query: string) => {
    setSearchQuery(query);
    setSearchResults([]); // Clear previous results
    setConversationMessages([]); // Clear conversation history
    handleSearch({ preventDefault: () => {} } as React.FormEvent, query);
  };

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

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Badge variant="secondary" className="inline-flex items-center gap-2 px-4 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">온라인</span>
                </Badge>
              </motion.div>
            </motion.div>
          )}

          {/* Search Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: showResults ? 0 : 0.5 }}
            className={`space-y-6 ${!showResults ? '' : 'pt-8'}`}
          >
            <form onSubmit={handleSearch} className="relative">
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
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>

          {/* Mode Selection Cards - Only show when no conversation */}
          {!showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">어떻게 도와드릴까요?</h2>
                <p className="text-muted-foreground">원하는 방식을 선택해주세요</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* Price Comparison Card */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSearchMode('price');
                    setPlaceholderIndex(0); // 모드 변경 시 placeholder 초기화
                  }}
                  className={`relative p-8 rounded-3xl border-3 transition-all duration-300 text-left overflow-hidden group ${
                    searchMode === 'price'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 shadow-xl shadow-blue-500/20'
                      : 'border-border bg-card hover:border-blue-300 hover:shadow-lg'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                  <div className="relative space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        💰
                      </div>
                      {searchMode === 'price' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        >
                          <CheckCircle2 className="h-7 w-7 text-blue-500" />
                        </motion.div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                        가격 비교
                      </h3>
                      <p className="text-base text-muted-foreground font-medium mb-4">
                        여러 쇼핑몰의 최저가를 한눈에 비교
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4 text-blue-500" />
                          <span>실시간 최저가 검색</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Zap className="h-4 w-4 text-blue-500" />
                          <span>빠른 가격 비교</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="font-semibold">예시:</span>
                        "에어팟 프로 2세대 최저가 찾아줘"
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Recommendation Card */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSearchMode('recommend');
                    setPlaceholderIndex(0); // 모드 변경 시 placeholder 초기화
                  }}
                  className={`relative p-8 rounded-3xl border-3 transition-all duration-300 text-left overflow-hidden group ${
                    searchMode === 'recommend'
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 shadow-xl shadow-purple-500/20'
                      : 'border-border bg-card hover:border-purple-300 hover:shadow-lg'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                  <div className="relative space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        ✨
                      </div>
                      {searchMode === 'recommend' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        >
                          <CheckCircle2 className="h-7 w-7 text-purple-500" />
                        </motion.div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-600 transition-colors">
                        추천템
                      </h3>
                      <p className="text-base text-muted-foreground font-medium mb-4">
                        AI가 분석한 맞춤 제품 추천
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          <span>AI 맞춤 추천</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4 text-purple-500" />
                          <span>인기 제품 분석</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="font-semibold">예시:</span>
                        "20만원대 가성비 노트북 추천해줘"
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Trending Searches - Only show when no conversation */}
          {!showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
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
                            <p className="text-base leading-relaxed">{result.content}</p>
                          </div>
                        </div>
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

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white animate-pulse" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
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
