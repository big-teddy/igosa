"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Mic, MicOff, Lightbulb, Copy, Check, StopCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/products/product-card";
import { searchProducts } from "@/lib/data/mock-products";

// 제안 질문 데이터
const SUGGESTED_PROMPTS = [
  { icon: "👟", text: "편한 러닝화 추천해줘", category: "운동" },
  { icon: "💻", text: "20만원대 가성비 노트북", category: "전자기기" },
  { icon: "🎧", text: "무선 이어폰 비교해줘", category: "오디오" },
  { icon: "⌚", text: "스마트워치 추천", category: "웨어러블" },
];

// Helper function to extract product names from text
function extractProductNames(text: string): string[] {
  const productKeywords = ['러닝화', '운동화', '노트북', '맥북', '이어폰', '에어팟', '스마트워치', '애플워치'];
  return productKeywords.filter(keyword => text.includes(keyword));
}

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "안녕하세요! 이거사 AI 쇼핑 어시스턴트입니다. 어떤 제품을 찾고 계신가요?",
      },
    ],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down' | null>>({});

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

  const handleFeedback = (messageId: string, type: 'up' | 'down') => {
    setFeedback(prev => ({
      ...prev,
      [messageId]: prev[messageId] === type ? null : type
    }));
    // In production, send feedback to analytics/backend
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
      alert('음성 인식이 지원되지 않는 브라우저입니다.');
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
          alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      setIsListening(false);
      alert('음성 인식을 시작할 수 없습니다.');
    }
  };

  const copyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
      alert('복사에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="container max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col p-4 relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background pointer-events-none" />

      {/* Header */}
      <div className="relative py-6 mb-2">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <div className="relative">
                  <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                  <div className="absolute inset-0 h-6 w-6 bg-primary/20 rounded-full blur-xl animate-pulse" />
                </div>
                <span className="gradient-text">AI 쇼핑 어시스턴트</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-2 ml-8">
                자연스럽게 물어보세요. 예: "편한 러닝화 추천해줘"
              </p>
            </div>
            {messages.length > 1 && (
              <Badge variant="outline" className="glass-button">
                {messages.length - 1}개 대화
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="relative flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((message, index) => {
          // Extract product keywords from message for inline product cards
          const productKeywords = message.role === "assistant" ? extractProductNames(message.content) : [];
          const shouldShowProducts = productKeywords.length > 0;

          return (
            <div key={message.id}>
              <div
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } group`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl relative ${
                    message.role === "user"
                      ? "glass-card bg-gradient-to-br from-primary to-accent text-white ml-12"
                      : "glass-card bg-white/80 dark:bg-slate-900/80 border-2 border-white/40 mr-12"
                  }`}
                >
                  {/* Message header with avatar */}
                  <div className="flex items-center gap-2 mb-2">
                    {message.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <span className={`text-xs font-medium ${
                      message.role === "user" ? "text-white/80" : "text-muted-foreground"
                    }`}>
                      {message.role === "user" ? "나" : "AI 어시스턴트"}
                    </span>
                  </div>

                  {/* Message content */}
                  <div className="relative z-10">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>

                    {/* Action buttons row */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                      <p
                        className={`text-xs ${
                          message.role === "user"
                            ? "text-white/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Date(message.createdAt || Date.now()).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      {/* Action buttons for assistant messages */}
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-1">
                          {/* Feedback buttons */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 w-7 p-0 transition-all ${
                              feedback[message.id] === 'up'
                                ? 'text-green-600 bg-green-100 dark:bg-green-900/30'
                                : 'opacity-0 group-hover:opacity-100'
                            }`}
                            onClick={() => handleFeedback(message.id, 'up')}
                            aria-label="도움이 됐어요"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 w-7 p-0 transition-all ${
                              feedback[message.id] === 'down'
                                ? 'text-red-600 bg-red-100 dark:bg-red-900/30'
                                : 'opacity-0 group-hover:opacity-100'
                            }`}
                            onClick={() => handleFeedback(message.id, 'down')}
                            aria-label="도움이 안 됐어요"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </Button>

                          {/* Copy button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                            onClick={() => copyMessage(message.id, message.content)}
                            aria-label="복사"
                          >
                            {copiedId === message.id ? (
                              <Check className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Inline Product Cards - shown below assistant messages that mention products */}
              {message.role === "assistant" && shouldShowProducts && (
                <div className="mt-4 mr-12">
                  <div className="glass-card p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">추천 제품</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {productKeywords.slice(0, 2).map((keyword, keywordIdx) => {
                        const products = searchProducts(keyword);
                        const product = products[0];
                        if (!product) return null;

                        return (
                          <div key={`${message.id}-product-${keywordIdx}`} className="scale-95 origin-top-left">
                            <ProductCard product={product} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator with Stop button */}
        {isLoading && (
          <div className="flex justify-start items-start gap-2">
            <div className="max-w-[80%] p-4 glass-card bg-white/80 dark:bg-slate-900/80 border-2 border-white/40 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white animate-pulse" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">AI 어시스턴트</span>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
            {/* Stop Generation Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={stop}
              className="glass-button h-auto py-2 px-3 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 transition-all"
              aria-label="응답 생성 중지"
            >
              <StopCircle className="h-4 w-4 mr-1.5 text-red-600" />
              <span className="text-xs font-medium">중지</span>
            </Button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts (show when conversation is new) */}
      {showSuggestions && messages.length === 1 && (
        <div className="relative py-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">이렇게 물어보세요</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedPrompt(prompt.text)}
                  className="glass-button p-3 rounded-xl text-left hover:scale-105 transition-transform group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{prompt.icon}</span>
                    <Badge variant="secondary" className="text-xs">{prompt.category}</Badge>
                  </div>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {prompt.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="relative py-4">
        <div className="glass-card p-3">
          <form onSubmit={handleSubmit} className="flex gap-3" role="form" aria-label="AI 챗봇 대화">
            <Input
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 border-0 bg-white/50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 transition-all duration-300 text-base h-12"
              aria-label="AI에게 질문 입력"
              aria-describedby="chat-help-text"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleVoiceInput}
              disabled={isLoading}
              className={`h-12 w-12 rounded-xl transition-all duration-300 ${
                isListening
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                  : 'glass-button hover:scale-105'
              }`}
              aria-label={isListening ? "음성 인식 중지" : "음성 입력"}
            >
              {isListening ? (
                <MicOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Mic className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent hover:shadow-lg transition-all duration-300 hover:scale-105"
              aria-label="메시지 전송"
            >
              <Send className="h-5 w-5" aria-hidden="true" />
            </Button>
          </form>
          <p id="chat-help-text" className="text-xs text-muted-foreground mt-2 text-center">
            Enter를 눌러 전송 • Shift+Enter로 줄바꿈 • 🎤 음성 입력 가능
          </p>
        </div>
      </div>
    </div>
  );
}
