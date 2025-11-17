'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { chatService } from '@/lib/services/chat-service';
import type { SendMessageData } from '@/types/chat';

interface MessageInputProps {
  roomId: string;
  userId: string;
  userName: string;
  onMessageSent?: () => void;
}

export function MessageInput({ roomId, userId, userName, onMessageSent }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Handle typing status
  useEffect(() => {
    if (message.trim()) {
      if (!isTyping) {
        setIsTyping(true);
        chatService.setTyping(roomId, userId, userName, true);
      }
    } else {
      if (isTyping) {
        setIsTyping(false);
        chatService.setTyping(roomId, userId, userName, false);
      }
    }

    // Cleanup typing status on unmount
    return () => {
      if (isTyping) {
        chatService.setTyping(roomId, userId, userName, false);
      }
    };
  }, [message, roomId, userId, userName, isTyping]);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setIsTyping(false);
    chatService.setTyping(roomId, userId, userName, false);

    try {
      const data: SendMessageData = {
        content: trimmed,
        type: 'text',
      };

      const sent = chatService.sendMessage(roomId, userId, userName, data);
      if (sent) {
        setMessage('');
        onMessageSent?.();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-4 bg-white">
      <div className="flex items-center gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          disabled={sending}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          size="icon"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
