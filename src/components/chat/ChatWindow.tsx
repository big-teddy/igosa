'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { chatService } from '@/lib/services/chat-service';
import type { ChatRoom } from '@/types/chat';
import { X, Users, MessageCircle } from 'lucide-react';

interface ChatWindowProps {
  dealId: string;
  dealName: string;
  userId: string;
  userName: string;
  onClose?: () => void;
  className?: string;
}

export function ChatWindow({
  dealId,
  dealName,
  userId,
  userName,
  onClose,
  className,
}: ChatWindowProps) {
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messageKey, setMessageKey] = useState(0);

  // Get or create room
  useEffect(() => {
    const chatRoom = chatService.getOrCreateRoom(dealId, dealName, userId, userName);
    setRoom(chatRoom);
  }, [dealId, dealName, userId, userName]);

  const handleMessageSent = () => {
    // Refresh message list
    setMessageKey((prev) => prev + 1);

    // Refresh room data
    const updatedRoom = chatService.getRoomById(room?.id || '');
    if (updatedRoom) {
      setRoom(updatedRoom);
    }
  };

  if (!room) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">채팅방을 불러오는 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`flex flex-col ${className || ''}`}
      role="region"
      aria-label={`${dealName} 채팅방`}
    >
      {/* Header */}
      <CardHeader className="border-b p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="bg-primary/10 p-1.5 md:p-2 rounded-lg shrink-0" aria-hidden="true">
              <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm md:text-base truncate" id="chat-title">
                {dealName}
              </CardTitle>
              <CardDescription
                className="flex items-center gap-1.5 md:gap-2 mt-1 text-xs"
                id="chat-description"
              >
                <Users className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{room.participants.length}명 참여 중</span>
                {room.unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-1 md:ml-2 shrink-0"
                    aria-label={`읽지 않은 메시지 ${room.unreadCount}개`}
                  >
                    {room.unreadCount}
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0"
              aria-label="채팅 닫기"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Messages */}
      <MessageList key={messageKey} roomId={room.id} userId={userId} />

      {/* Input */}
      <MessageInput
        roomId={room.id}
        userId={userId}
        userName={userName}
        onMessageSent={handleMessageSent}
      />
    </Card>
  );
}
