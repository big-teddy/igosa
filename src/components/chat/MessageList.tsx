'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import { chatService } from '@/lib/services/chat-service';
import type { ChatMessage, ChatEvent } from '@/types/chat';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  roomId: string;
  userId: string;
  className?: string;
}

export function MessageList({ roomId, userId, className }: MessageListProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    const loadMessages = () => {
      const msgs = chatService.getRoomMessages(roomId);
      setMessages(msgs);
      setLoading(false);
    };

    loadMessages();

    // Subscribe to new messages
    const unsubscribe = chatService.subscribe(roomId, (event: ChatEvent) => {
      if (event.type === 'message_sent') {
        loadMessages();
      }
    });

    return unsubscribe;
  }, [roomId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    scrollToBottom();
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    const markRead = () => {
      chatService.markAsRead(roomId, userId);
    };

    markRead();

    // Mark as read when window gains focus
    const handleFocus = () => markRead();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [roomId, userId, messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <p className="text-muted-foreground mb-2">아직 메시지가 없습니다</p>
        <p className="text-sm text-muted-foreground">
          첫 메시지를 보내서 대화를 시작해보세요!
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto p-4 space-y-2 ${className || ''}`}
    >
      {messages.map((message) => (
        <ChatBubble
          key={message.id}
          message={message}
          isOwn={message.senderId === userId}
        />
      ))}

      {/* Typing indicator */}
      <TypingIndicator roomId={roomId} excludeUserId={userId} />

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
