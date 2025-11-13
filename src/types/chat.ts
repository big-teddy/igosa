/**
 * Chat Types
 * 네고딜 참여자 간 실시간 채팅
 */

export type MessageType = 'text' | 'system' | 'image';

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: MessageType;
  timestamp: string;
  read: boolean;
  imageUrl?: string;
}

export interface ChatParticipant {
  userId: string;
  userName: string;
  userAvatar?: string;
  joinedAt: string;
  lastReadAt?: string;
}

export interface ChatRoom {
  id: string;
  dealId: string;
  dealName: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface TypingStatus {
  userId: string;
  userName: string;
  timestamp: string;
}

export interface SendMessageData {
  content: string;
  type?: MessageType;
  imageUrl?: string;
}

export interface ChatStats {
  totalRooms: number;
  totalMessages: number;
  unreadMessages: number;
  activeChats: number;
}

// Chat event types for real-time updates
export type ChatEventType =
  | 'message_sent'
  | 'message_read'
  | 'user_typing'
  | 'user_joined'
  | 'user_left';

export interface ChatEvent {
  type: ChatEventType;
  roomId: string;
  userId: string;
  timestamp: string;
  data?: any;
}
