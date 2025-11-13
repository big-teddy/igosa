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
    <Card className={`flex flex-col ${className || ''}`}>
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{dealName}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Users className="h-3 w-3" />
                <span>{room.participants.length}명 참여 중</span>
                {room.unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {room.unreadCount}
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
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
