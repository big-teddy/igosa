/**
 * Chat Service
 * 실시간 채팅 관리 서비스
 *
 * Features:
 * - 채팅방 생성 및 관리
 * - 메시지 송수신
 * - 읽음 처리
 * - 실시간 시뮬레이션 (polling)
 * - 타이핑 상태 관리
 */

import type {
  ChatRoom,
  ChatMessage,
  ChatParticipant,
  SendMessageData,
  ChatStats,
  TypingStatus,
  ChatEvent,
} from '@/types/chat';
import { notificationService } from './notification-service';

const ROOMS_KEY = 'igosa_chat_rooms';
const TYPING_KEY = 'igosa_typing_status';
const EVENTS_KEY = 'igosa_chat_events';

class ChatService {
  private static instance: ChatService;
  private listeners: Map<string, Set<(event: ChatEvent) => void>> = new Map();
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastEventCheck: number = Date.now();

  private constructor() {}

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // ==================== ROOM MANAGEMENT ====================

  /**
   * Get or create chat room for a deal
   */
  getOrCreateRoom(dealId: string, dealName: string, userId: string, userName: string): ChatRoom {
    try {
      // Try to find existing room
      const rooms = this.getAllRooms();
      let room = rooms.find((r) => r.dealId === dealId);

      if (room) {
        // Check if user is participant
        const isParticipant = room.participants.some((p) => p.userId === userId);
        if (!isParticipant) {
          // Add user as participant
          const participant: ChatParticipant = {
            userId,
            userName,
            joinedAt: new Date().toISOString(),
          };
          room.participants.push(participant);
          this.saveRoom(room);

          // Add system message
          this.addSystemMessage(room.id, `${userName}님이 채팅에 참여했습니다.`);
        }
        return room;
      }

      // Create new room
      const newRoom: ChatRoom = {
        id: this.generateId(),
        dealId,
        dealName,
        participants: [
          {
            userId,
            userName,
            joinedAt: new Date().toISOString(),
          },
        ],
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        unreadCount: 0,
      };

      rooms.push(newRoom);
      this.saveAllRooms(rooms);

      return newRoom;
    } catch (error) {
      console.error('Failed to get or create room:', error);
      throw error;
    }
  }

  /**
   * Get room by ID
   */
  getRoomById(roomId: string): ChatRoom | null {
    try {
      const rooms = this.getAllRooms();
      return rooms.find((r) => r.id === roomId) || null;
    } catch (error) {
      console.error('Failed to get room:', error);
      return null;
    }
  }

  /**
   * Get room by deal ID
   */
  getRoomByDealId(dealId: string): ChatRoom | null {
    try {
      const rooms = this.getAllRooms();
      return rooms.find((r) => r.dealId === dealId) || null;
    } catch (error) {
      console.error('Failed to get room by deal ID:', error);
      return null;
    }
  }

  /**
   * Get user's chat rooms
   */
  getUserRooms(userId: string): ChatRoom[] {
    try {
      const rooms = this.getAllRooms();
      return rooms
        .filter((r) => r.participants.some((p) => p.userId === userId))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
      console.error('Failed to get user rooms:', error);
      return [];
    }
  }

  /**
   * Get all rooms
   */
  private getAllRooms(): ChatRoom[] {
    try {
      const stored = localStorage.getItem(ROOMS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get all rooms:', error);
      return [];
    }
  }

  /**
   * Save room
   */
  private saveRoom(room: ChatRoom): void {
    try {
      const rooms = this.getAllRooms();
      const index = rooms.findIndex((r) => r.id === room.id);

      room.updatedAt = new Date().toISOString();

      if (index >= 0) {
        rooms[index] = room;
      } else {
        rooms.push(room);
      }

      this.saveAllRooms(rooms);
    } catch (error) {
      console.error('Failed to save room:', error);
    }
  }

  /**
   * Save all rooms
   */
  private saveAllRooms(rooms: ChatRoom[]): void {
    try {
      localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    } catch (error) {
      console.error('Failed to save all rooms:', error);
    }
  }

  // ==================== MESSAGE MANAGEMENT ====================

  /**
   * Send message
   */
  sendMessage(
    roomId: string,
    userId: string,
    userName: string,
    data: SendMessageData
  ): ChatMessage | null {
    try {
      const room = this.getRoomById(roomId);
      if (!room) return null;

      const message: ChatMessage = {
        id: this.generateId(),
        roomId,
        senderId: userId,
        senderName: userName,
        content: data.content,
        type: data.type || 'text',
        timestamp: new Date().toISOString(),
        read: false,
        imageUrl: data.imageUrl,
      };

      room.messages.push(message);
      room.lastMessage = message;
      room.updatedAt = new Date().toISOString();

      // Update unread count for other participants
      room.participants.forEach((p) => {
        if (p.userId !== userId) {
          room.unreadCount++;
        }
      });

      this.saveRoom(room);

      // Emit event
      this.emitEvent({
        type: 'message_sent',
        roomId,
        userId,
        timestamp: new Date().toISOString(),
        data: message,
      });

      // Send notifications to other participants
      room.participants.forEach((p) => {
        if (p.userId !== userId) {
          notificationService.createNotification(
            p.userId,
            'comment',
            `${userName}님의 메시지`,
            data.content.substring(0, 50),
            {
              dealId: room.dealId,
            },
            `/deals/${room.dealId}?chat=true`
          );
        }
      });

      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      return null;
    }
  }

  /**
   * Add system message
   */
  private addSystemMessage(roomId: string, content: string): void {
    try {
      const room = this.getRoomById(roomId);
      if (!room) return;

      const message: ChatMessage = {
        id: this.generateId(),
        roomId,
        senderId: 'system',
        senderName: 'System',
        content,
        type: 'system',
        timestamp: new Date().toISOString(),
        read: true,
      };

      room.messages.push(message);
      room.lastMessage = message;
      this.saveRoom(room);
    } catch (error) {
      console.error('Failed to add system message:', error);
    }
  }

  /**
   * Get room messages
   */
  getRoomMessages(roomId: string, limit = 100): ChatMessage[] {
    try {
      const room = this.getRoomById(roomId);
      if (!room) return [];

      return room.messages
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .slice(-limit);
    } catch (error) {
      console.error('Failed to get room messages:', error);
      return [];
    }
  }

  /**
   * Mark messages as read
   */
  markAsRead(roomId: string, userId: string): void {
    try {
      const room = this.getRoomById(roomId);
      if (!room) return;

      let hasUnread = false;

      room.messages.forEach((msg) => {
        if (msg.senderId !== userId && !msg.read) {
          msg.read = true;
          hasUnread = true;
        }
      });

      if (hasUnread) {
        room.unreadCount = 0;

        // Update last read time
        const participant = room.participants.find((p) => p.userId === userId);
        if (participant) {
          participant.lastReadAt = new Date().toISOString();
        }

        this.saveRoom(room);

        // Emit event
        this.emitEvent({
          type: 'message_read',
          roomId,
          userId,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }

  // ==================== TYPING STATUS ====================

  /**
   * Set typing status
   */
  setTyping(roomId: string, userId: string, userName: string, isTyping: boolean): void {
    try {
      const key = `${TYPING_KEY}_${roomId}`;
      const stored = localStorage.getItem(key);
      let typingUsers: TypingStatus[] = stored ? JSON.parse(stored) : [];

      if (isTyping) {
        // Add or update typing status
        const existing = typingUsers.find((t) => t.userId === userId);
        if (existing) {
          existing.timestamp = new Date().toISOString();
        } else {
          typingUsers.push({
            userId,
            userName,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        // Remove typing status
        typingUsers = typingUsers.filter((t) => t.userId !== userId);
      }

      // Clean up old typing statuses (> 5 seconds)
      const now = Date.now();
      typingUsers = typingUsers.filter((t) => {
        const age = now - new Date(t.timestamp).getTime();
        return age < 5000;
      });

      localStorage.setItem(key, JSON.stringify(typingUsers));

      // Emit event
      this.emitEvent({
        type: 'user_typing',
        roomId,
        userId,
        timestamp: new Date().toISOString(),
        data: { isTyping, userName },
      });
    } catch (error) {
      console.error('Failed to set typing status:', error);
    }
  }

  /**
   * Get typing users
   */
  getTypingUsers(roomId: string, excludeUserId?: string): TypingStatus[] {
    try {
      const key = `${TYPING_KEY}_${roomId}`;
      const stored = localStorage.getItem(key);
      let typingUsers: TypingStatus[] = stored ? JSON.parse(stored) : [];

      // Clean up old typing statuses
      const now = Date.now();
      typingUsers = typingUsers.filter((t) => {
        const age = now - new Date(t.timestamp).getTime();
        return age < 5000;
      });

      if (excludeUserId) {
        typingUsers = typingUsers.filter((t) => t.userId !== excludeUserId);
      }

      return typingUsers;
    } catch (error) {
      console.error('Failed to get typing users:', error);
      return [];
    }
  }

  // ==================== STATS ====================

  /**
   * Get user chat stats
   */
  getUserStats(userId: string): ChatStats {
    try {
      const rooms = this.getUserRooms(userId);

      const totalMessages = rooms.reduce((sum, room) => {
        return sum + room.messages.filter((m) => m.senderId === userId).length;
      }, 0);

      const unreadMessages = rooms.reduce((sum, room) => {
        return (
          sum +
          room.messages.filter((m) => m.senderId !== userId && !m.read).length
        );
      }, 0);

      const activeChats = rooms.filter((room) => {
        const lastMessageTime = room.lastMessage
          ? new Date(room.lastMessage.timestamp).getTime()
          : 0;
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return lastMessageTime > dayAgo;
      }).length;

      return {
        totalRooms: rooms.length,
        totalMessages,
        unreadMessages,
        activeChats,
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {
        totalRooms: 0,
        totalMessages: 0,
        unreadMessages: 0,
        activeChats: 0,
      };
    }
  }

  // ==================== REAL-TIME EVENTS ====================

  /**
   * Subscribe to chat events
   */
  subscribe(roomId: string, callback: (event: ChatEvent) => void): () => void {
    if (!this.listeners.has(roomId)) {
      this.listeners.set(roomId, new Set());
    }

    this.listeners.get(roomId)!.add(callback);

    // Start polling if not already started
    this.startPolling();

    // Return unsubscribe function
    return () => {
      const roomListeners = this.listeners.get(roomId);
      if (roomListeners) {
        roomListeners.delete(callback);
        if (roomListeners.size === 0) {
          this.listeners.delete(roomId);
        }
      }

      // Stop polling if no more listeners
      if (this.listeners.size === 0) {
        this.stopPolling();
      }
    };
  }

  /**
   * Emit event
   */
  private emitEvent(event: ChatEvent): void {
    try {
      // Store event
      const stored = localStorage.getItem(EVENTS_KEY);
      const events: ChatEvent[] = stored ? JSON.parse(stored) : [];
      events.push(event);

      // Keep only last 100 events
      const trimmed = events.slice(-100);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));

      // Notify listeners
      const roomListeners = this.listeners.get(event.roomId);
      if (roomListeners) {
        roomListeners.forEach((callback) => callback(event));
      }
    } catch (error) {
      console.error('Failed to emit event:', error);
    }
  }

  /**
   * Start polling for events
   */
  private startPolling(): void {
    if (this.pollingInterval) return;

    this.pollingInterval = setInterval(() => {
      this.checkForNewEvents();
    }, 1000); // Poll every second
  }

  /**
   * Stop polling
   */
  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Check for new events
   */
  private checkForNewEvents(): void {
    try {
      const stored = localStorage.getItem(EVENTS_KEY);
      if (!stored) return;

      const events: ChatEvent[] = JSON.parse(stored);
      const newEvents = events.filter((e) => {
        const eventTime = new Date(e.timestamp).getTime();
        return eventTime > this.lastEventCheck;
      });

      newEvents.forEach((event) => {
        const roomListeners = this.listeners.get(event.roomId);
        if (roomListeners) {
          roomListeners.forEach((callback) => callback(event));
        }
      });

      if (newEvents.length > 0) {
        this.lastEventCheck = Date.now();
      }
    } catch (error) {
      console.error('Failed to check for new events:', error);
    }
  }

  // ==================== UTILITIES ====================

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all data (for testing)
   */
  clearAllData(): void {
    localStorage.removeItem(ROOMS_KEY);
    localStorage.removeItem(EVENTS_KEY);

    // Clear all typing status keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(TYPING_KEY)) {
        localStorage.removeItem(key);
      }
    });
  }
}

// Export singleton instance
export const chatService = ChatService.getInstance();
