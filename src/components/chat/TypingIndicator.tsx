'use client';

import { useEffect, useState } from 'react';
import { chatService } from '@/lib/services/chat-service';
import type { TypingStatus } from '@/types/chat';

interface TypingIndicatorProps {
  roomId: string;
  excludeUserId: string;
}

export function TypingIndicator({ roomId, excludeUserId }: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);

  useEffect(() => {
    // Poll for typing users
    const interval = setInterval(() => {
      const users = chatService.getTypingUsers(roomId, excludeUserId);
      setTypingUsers(users);
    }, 500);

    return () => clearInterval(interval);
  }, [roomId, excludeUserId]);

  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.userName);
  const text =
    names.length === 1
      ? `${names[0]}님이 입력 중...`
      : names.length === 2
      ? `${names[0]}님과 ${names[1]}님이 입력 중...`
      : `${names[0]}님 외 ${names.length - 1}명이 입력 중...`;

  return (
    <div className="px-4 py-2 text-sm text-muted-foreground italic flex items-center gap-2">
      <div className="flex gap-1">
        <span className="animate-bounce delay-0">●</span>
        <span className="animate-bounce delay-100">●</span>
        <span className="animate-bounce delay-200">●</span>
      </div>
      <span>{text}</span>
    </div>
  );
}
