"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Sparkles,
  Mic,
  MicOff,
  Copy,
  Check,
  StopCircle,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  ExternalLink,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Settings2,
  DollarSign
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/products/product-card";
import { searchProducts } from "@/lib/data/mock-products";
import { useModeStore } from "@/lib/stores/mode-store";
import { toast } from "sonner";

// Helper function to extract product names from text
function extractProductNames(text: string): string[] {
  const productKeywords = ['러닝화', '운동화', '노트북', '맥북', '이어폰', '에어팟', '스마트워치', '애플워치'];
  return productKeywords.filter(keyword => text.includes(keyword));
}

// Generate intelligent follow-up questions (Perplexity-style)
function generateFollowUpQuestions(messageContent: string, productKeywords: string[]): string[] {
  const questions: string[] = [];

  if (productKeywords.length > 0) {
    const product = productKeywords[0];
    questions.push(`${product} 중에서 가장 저렴한 건 어떤 거야?`);
    questions.push(`친구들은 어떤 ${product} 사용하고 있어?`);
    questions.push(`${product} 네고딜 진행 중인 거 있어?`);
  }

  if (messageContent.includes('추천') || messageContent.includes('찾')) {
    questions.push('다른 브랜드 제품도 비교해줘');
    questions.push('가격대를 더 낮춰서 찾아줘');
  }

  return questions.slice(0, 3);
}

// Extract source/platform from context (Perplexity-style citations)
function extractSources(text: string): Array<{platform: string; url: string}> {
  const sources = [];
  if (text.includes('쿠팡')) sources.push({ platform: '쿠팡', url: 'https://www.coupang.com' });
  if (text.includes('네이버')) sources.push({ platform: '네이버쇼핑', url: 'https://shopping.naver.com' });
  if (text.includes('11번가')) sources.push({ platform: '11번가', url: 'https://www.11st.co.kr' });
  return sources;
}

// 제안 질문 데이터
const SUGGESTED_PROMPTS = [
  { icon: "👟", text: "편한 러닝화 추천해줘", category: "운동" },
  { icon: "💻", text: "20만원대 가성비 노트북", category: "전자기기" },
  { icon: "🎧", text: "무선 이어폰 비교해줘", category: "오디오" },
  { icon: "⌚", text: "스마트워치 추천", category: "웨어러블" },
];

export default function ChatPage() {
  const { searchMode, setSearchMode } = useModeStore();
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, reload, error } = useChat({
    api: "/api/chat",
    body: {
      mode: searchMode
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "안녕하세요! 이거사 AI 쇼핑 어시스턴트입니다. 어떤 제품을 찾고 계신가요?",
      },
    ],
    onError: (error) => {
      console.error('Chat error:', error);

      // Show user-friendly error toast
      if (error.message.includes('429')) {
        toast.error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      } else if (error.message.includes('401')) {
        toast.error('API 인증에 실패했습니다.');
      } else if (error.message.includes('500') || error.message.includes('503')) {
        toast.error('서버에 일시적인 문제가 발생했습니다.');
      } else if (error.message.includes('Failed to fetch')) {
        toast.error('네트워크 연결을 확인해주세요.');
      } else {
        toast.error('메시지 전송 중 오류가 발생했습니다.');
      }
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down' | null>>({});
  const [savedMessages, setSavedMessages] = useState<Set<string>>(new Set());
  const [detailMode, setDetailMode] = useState<'simple' | 'detailed'>('simple');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Hide suggestions when user starts chatting
  useEffect(() => {
    if (messages.length > 1) {
      setShowSuggestions(false);
    }
  }, [messages.length]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleFeedback = (messageId: string, type: 'up' | 'down') => {
    setFeedback(prev => ({
      ...prev,
      [messageId]: prev[messageId] === type ? null : type
    }));
    console.log(`Feedback for ${messageId}: ${type}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSuggestedPrompt = (promptText: string) => {
    const syntheticEvent = {
      preventDefault: () => {},
      target: { value: promptText },
    } as any;

    handleInputChange(syntheticEvent);

    setTimeout(() => {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      handleSubmit(submitEvent as any);
    }, 100);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('음성 인식이 지원되지 않는 브라우저입니다.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const syntheticEvent = {
          preventDefault: () => {},
          target: { value: transcript },
        } as any;
        handleInputChange(syntheticEvent);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('마이크 권한이 필요합니다. 브라우저 설정에서 허용해주세요.');
        } else if (event.error === 'no-speech') {
          toast.info('음성이 감지되지 않았습니다. 다시 시도해주세요.');
        } else if (event.error === 'network') {
          toast.error('네트워크 오류로 음성 인식에 실패했습니다.');
        } else {
          toast.error('음성 인식 중 오류가 발생했습니다.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      setIsListening(false);
      toast.error('음성 인식을 시작할 수 없습니다. 다시 시도해주세요.');
    }
  };

  const copyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      toast.success('클립보드에 복사되었습니다.');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
      toast.error('복사에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto">
      {/* Mode Selector Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">이거사 AI</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">모드:</span>
              <div className="flex items-center bg-muted rounded-full p-1">
                <Button
                  variant={searchMode === 'price' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSearchMode('price')}
                  className={`h-7 px-3 rounded-full text-xs transition-all ${
                    searchMode === 'price'
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'hover:bg-transparent'
                  }`}
                >
                  <DollarSign className="h-3.5 w-3.5 mr-1" />
                  가격 비교
                </Button>
                <Button
                  variant={searchMode === 'recommend' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSearchMode('recommend')}
                  className={`h-7 px-3 rounded-full text-xs transition-all ${
                    searchMode === 'recommend'
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'hover:bg-transparent'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  추천템
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area - ChatGPT/Claude style full-width messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto py-8 space-y-6">
          {messages.map((message, index) => {
            // Extract product keywords from message for inline product cards
            const productKeywords = message.role === "assistant" ? extractProductNames(message.content) : [];
            const shouldShowProducts = productKeywords.length > 0;

            return (
              <div key={message.id} className="group">
                {/* Message Container */}
                <div className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {/* Avatar - Claude/ChatGPT style */}
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  )}

                  {/* Message Content */}
                  <div className={`flex-1 space-y-2 ${message.role === "user" ? "max-w-[80%]" : "max-w-full"}`}>
                    {/* User label for user messages */}
                    {message.role === "user" && (
                      <div className="text-xs font-medium text-muted-foreground text-right mb-1">나</div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`rounded-2xl px-5 py-3.5 ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-primary to-accent text-white shadow-md"
                          : "bg-muted/40 text-foreground"
                      }`}
                    >
                      <p className="text-[15px] leading-7 whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>

                    {/* Action Buttons - ChatGPT/Claude style */}
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Copy */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => copyMessage(message.id, message.content)}
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                              <span className="text-green-600">복사됨</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 mr-1.5" />
                              <span>복사</span>
                            </>
                          )}
                        </Button>

                        {/* Regenerate */}
                        {index === messages.length - 1 && !isLoading && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => reload()}
                          >
                            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                            <span>재생성</span>
                          </Button>
                        )}

                        {/* Thumbs up/down */}
                        <div className="flex items-center gap-1 ml-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 w-8 p-0 ${
                              feedback[message.id] === 'up' ? 'text-green-600 bg-green-50 dark:bg-green-950' : ''
                            }`}
                            onClick={() => handleFeedback(message.id, 'up')}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 w-8 p-0 ${
                              feedback[message.id] === 'down' ? 'text-red-600 bg-red-50 dark:bg-red-950' : ''
                            }`}
                            onClick={() => handleFeedback(message.id, 'down')}
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Timestamp */}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(message.createdAt || Date.now()).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}

                    {/* Inline Product Cards */}
                    {message.role === "assistant" && shouldShowProducts && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold">추천 제품</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {productKeywords.slice(0, 2).map((keyword, keywordIdx) => {
                            const products = searchProducts(keyword);
                            const product = products[0];
                            if (!product) return null;

                            return (
                              <div key={`${message.id}-product-${keywordIdx}`}>
                                <ProductCard product={product} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-medium text-sm shadow-sm">
                      나
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator - Gemini style */}
          {isLoading && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="bg-muted/40 rounded-2xl px-5 py-3.5 inline-block">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
                {/* Stop button */}
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={stop}
                    className="h-8 px-3 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <StopCircle className="h-3.5 w-3.5 mr-1.5" />
                    중지
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Suggested Prompts - Only on first load */}
          {showSuggestions && messages.length === 1 && (
            <div className="mt-12">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  무엇을 도와드릴까요?
                </h2>
                <p className="text-sm text-muted-foreground">
                  아래 제안을 선택하거나 직접 질문해보세요
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedPrompt(prompt.text)}
                    className="group p-4 rounded-xl border-2 border-border/50 hover:border-primary/50 bg-card hover:bg-accent/5 transition-all text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{prompt.icon}</span>
                      <Badge variant="secondary" className="text-xs">{prompt.category}</Badge>
                    </div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      {prompt.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - ChatGPT style sticky bottom */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-end gap-2 bg-muted/30 rounded-2xl p-2 border-2 border-border/50 focus-within:border-primary/50 transition-colors">
              {/* Text Input */}
              <Input
                ref={inputRef}
                placeholder="메시지를 입력하세요..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base resize-none min-h-[24px] max-h-[200px] py-3"
                aria-label="AI에게 질문 입력"
              />

              {/* Voice Input Button */}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleVoiceInput}
                disabled={isLoading}
                className={`flex-shrink-0 h-10 w-10 rounded-xl ${
                  isListening
                    ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                    : 'hover:bg-accent'
                }`}
                aria-label={isListening ? "음성 인식 중지" : "음성 입력"}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>

              {/* Send Button */}
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50"
                aria-label="메시지 전송"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-muted-foreground text-center mt-3">
              Enter로 전송 • Shift+Enter로 줄바꿈 • 🎤 음성 입력 가능
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
