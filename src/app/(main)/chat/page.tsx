"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col p-4 relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background pointer-events-none" />

      {/* Header */}
      <div className="relative py-6 mb-2">
        <div className="glass-card p-4">
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
      </div>

      {/* Messages */}
      <div className="relative flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                message.role === "user"
                  ? "glass-card bg-gradient-to-br from-primary to-accent text-white ml-12"
                  : "glass-card bg-white/80 border-2 border-white/40 mr-12"
              }`}
            >
              <div className="relative z-10">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
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
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-4 glass-card bg-white/80 border-2 border-white/40 rounded-2xl mr-12">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="relative py-4">
        <div className="glass-card p-3">
          <form onSubmit={handleSubmit} className="flex gap-3" role="form" aria-label="AI 챗봇 대화">
            <Input
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 border-0 bg-white/50 focus:bg-white/80 transition-all duration-300 text-base h-12"
              aria-label="AI에게 질문 입력"
              aria-describedby="chat-help-text"
            />
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
            Enter를 눌러 전송 • Shift+Enter로 줄바꿈
          </p>
        </div>
      </div>
    </div>
  );
}
