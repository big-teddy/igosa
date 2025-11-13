'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { chatService } from '@/lib/services/chat-service';
import { MessageCircle } from 'lucide-react';
import type { ChatEvent } from '@/types/chat';

interface ChatButtonProps {
  dealId: string;
  userId: string;
  onClick: () => void;
  className?: string;
}

export function ChatButton({ dealId, userId, onClick, className }: ChatButtonProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateUnreadCount = () => {
      const room = chatService.getRoomByDealId(dealId);
      if (room) {
        const unread = room.messages.filter(
          (msg) => msg.senderId !== userId && !msg.read
        ).length;
        setUnreadCount(unread);
      }
    };

    updateUnreadCount();

    // Subscribe to updates
    const room = chatService.getRoomByDealId(dealId);
    if (!room) return;

    const unsubscribe = chatService.subscribe(room.id, (event: ChatEvent) => {
      if (event.type === 'message_sent' || event.type === 'message_read') {
        updateUnreadCount();
      }
    });

    return unsubscribe;
  }, [dealId, userId]);

  return (
    <Button onClick={onClick} className={`relative gap-2 ${className || ''}`}>
      <MessageCircle className="h-4 w-4" />
      <span>채팅</span>
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
