/**
 * 알림 서비스
 *
 * 기능:
 * - 브라우저 푸시 알림
 * - 알림 히스토리 관리
 * - 알림 권한 요청
 * - 알림 읽음 처리
 */

import type { Notification } from '@/types/notification';
import { NotificationType, NotificationPreferences } from '@/types/notification';

const NOTIFICATIONS_KEY = 'igosa_notifications';
const PREFERENCES_KEY = 'igosa_notification_preferences';

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * 브라우저 알림 권한 요청
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  /**
   * 브라우저 알림 표시
   */
  showBrowserNotification(title: string, options?: NotificationOptions): void {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options,
      });
    }
  }

  /**
   * 알림 생성
   */
  createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Notification['data'],
    link?: string
  ): Notification {
    try {
      const notification: Notification = {
        id: this.generateId(),
        userId,
        type,
        title,
        message,
        link,
        read: false,
        createdAt: new Date().toISOString(),
        data,
      };

      // localStorage에 저장
      const notifications = this.getAllNotifications();
      notifications.unshift(notification); // 최신순
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));

      // 브라우저 알림 표시 (사용자 설정 확인)
      const prefs = this.getPreferences(userId);
      if (prefs.enableBrowser && this.shouldShowNotification(type, prefs)) {
        this.showBrowserNotification(title, {
          body: message,
          tag: notification.id,
          data: data,
        });
      }

      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  /**
   * 사용자의 모든 알림 가져오기
   */
  getUserNotifications(userId: string): Notification[] {
    try {
      const all = this.getAllNotifications();
      return all.filter((n) => n.userId === userId);
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      return [];
    }
  }

  /**
   * 읽지 않은 알림 가져오기
   */
  getUnreadNotifications(userId: string): Notification[] {
    try {
      const notifications = this.getUserNotifications(userId);
      return notifications.filter((n) => !n.read);
    } catch (error) {
      console.error('Failed to get unread notifications:', error);
      return [];
    }
  }

  /**
   * 읽지 않은 알림 수
   */
  getUnreadCount(userId: string): number {
    return this.getUnreadNotifications(userId).length;
  }

  /**
   * 알림 읽음 처리
   */
  markAsRead(notificationId: string): boolean {
    try {
      const notifications = this.getAllNotifications();
      const notification = notifications.find((n) => n.id === notificationId);

      if (notification) {
        notification.read = true;
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  /**
   * 모든 알림 읽음 처리
   */
  markAllAsRead(userId: string): void {
    try {
      const notifications = this.getAllNotifications();
      notifications.forEach((n) => {
        if (n.userId === userId) {
          n.read = true;
        }
      });
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  /**
   * 알림 삭제
   */
  deleteNotification(notificationId: string): boolean {
    try {
      let notifications = this.getAllNotifications();
      const initialLength = notifications.length;
      notifications = notifications.filter((n) => n.id !== notificationId);

      if (notifications.length < initialLength) {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
  }

  /**
   * 모든 알림 삭제
   */
  deleteAllNotifications(userId: string): void {
    try {
      let notifications = this.getAllNotifications();
      notifications = notifications.filter((n) => n.userId !== userId);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  }

  /**
   * 사용자 알림 설정 가져오기
   */
  getPreferences(userId: string): NotificationPreferences {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      if (!stored) {
        return this.getDefaultPreferences(userId);
      }

      const allPrefs: NotificationPreferences[] = JSON.parse(stored);
      const userPrefs = allPrefs.find((p) => p.userId === userId);

      return userPrefs || this.getDefaultPreferences(userId);
    } catch (error) {
      console.error('Failed to get preferences:', error);
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * 사용자 알림 설정 저장
   */
  savePreferences(preferences: NotificationPreferences): void {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      const allPrefs: NotificationPreferences[] = stored ? JSON.parse(stored) : [];

      const index = allPrefs.findIndex((p) => p.userId === preferences.userId);
      if (index >= 0) {
        allPrefs[index] = preferences;
      } else {
        allPrefs.push(preferences);
      }

      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(allPrefs));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  /**
   * 기본 알림 설정
   */
  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      enableBrowser: true,
      enableEmail: false,
      enablePush: false,
      priceAlerts: true,
      dealAlerts: true,
      referralAlerts: true,
      socialAlerts: true,
    };
  }

  /**
   * 알림 타입에 따라 표시 여부 결정
   */
  private shouldShowNotification(type: NotificationType, prefs: NotificationPreferences): boolean {
    switch (type) {
      case 'price_alert':
        return prefs.priceAlerts;
      case 'deal_goal_reached':
      case 'deal_ending_soon':
        return prefs.dealAlerts;
      case 'referral_earned':
        return prefs.referralAlerts;
      case 'new_follower':
      case 'comment':
      case 'like':
        return prefs.socialAlerts;
      default:
        return true;
    }
  }

  /**
   * 모든 알림 가져오기 (private)
   */
  private getAllNotifications(): Notification[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get all notifications:', error);
      return [];
    }
  }

  /**
   * ID 생성
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 데이터 초기화 (테스트용)
   */
  clearAll(): void {
    localStorage.removeItem(NOTIFICATIONS_KEY);
    localStorage.removeItem(PREFERENCES_KEY);
  }
}

export const notificationService = NotificationService.getInstance();
