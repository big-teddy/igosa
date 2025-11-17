'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  // System messages
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-muted px-4 py-2 rounded-full text-xs text-muted-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(message.timestamp), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div className={cn('flex gap-3 mb-4', isOwn && 'flex-row-reverse')}>
      {/* Avatar */}
      {!isOwn && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs">
            {message.senderName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content */}
      <div className={cn('flex flex-col gap-1 max-w-[70%]', isOwn && 'items-end')}>
        {/* Sender name (only for others) */}
        {!isOwn && (
          <span className="text-xs text-muted-foreground px-1">{message.senderName}</span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'rounded-lg px-4 py-2 break-words',
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          )}
        >
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Shared image"
              className="rounded mb-2 max-w-full"
            />
          )}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp and read status */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          {isOwn && message.read && (
            <span className="text-xs text-primary">읽음</span>
          )}
        </div>
      </div>
    </div>
  );
}
