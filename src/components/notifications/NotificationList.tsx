'use client';

import { useState, useEffect } from 'react';
import { notificationService } from '@/lib/services/notification-service';
import { Notification } from '@/types/notification';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCheck, Trash2, Bell } from 'lucide-react';

interface NotificationListProps {
  userId: string;
  onNotificationRead?: () => void;
}

export function NotificationList({ userId, onNotificationRead }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const loadNotifications = () => {
    const allNotifications = notificationService.getUserNotifications(userId);
    setNotifications(allNotifications);
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    loadNotifications();
    onNotificationRead?.();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead(userId);
    loadNotifications();
    onNotificationRead?.();
  };

  const handleDelete = (notificationId: string) => {
    notificationService.deleteNotification(notificationId);
    loadNotifications();
    onNotificationRead?.();
  };

  const handleDeleteAll = () => {
    if (confirm('모든 알림을 삭제하시겠습니까?')) {
      notificationService.deleteAllNotifications(userId);
      loadNotifications();
      onNotificationRead?.();
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read);
  const displayNotifications = activeTab === 'unread' ? unreadNotifications : notifications;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">알림</h3>
          <div className="flex gap-1">
            {unreadNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 gap-2 text-xs"
              >
                <CheckCheck className="h-3 w-3" />
                모두 읽음
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteAll}
                className="h-8 gap-2 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                모두 삭제
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all" className="text-xs">
              전체 ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              읽지 않음 ({unreadNotifications.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto">
        {displayNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">알림이 없습니다</p>
            <p className="text-xs mt-1">
              {activeTab === 'unread' ? '읽지 않은 알림이 없습니다' : '새로운 알림이 생기면 여기에 표시됩니다'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {displayNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
