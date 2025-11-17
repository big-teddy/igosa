'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { notificationService } from '@/lib/services/notification-service';
import { NotificationList } from './NotificationList';

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Update unread count on mount and when dropdown opens/closes
  useEffect(() => {
    updateUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(updateUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const updateUnreadCount = () => {
    const count = notificationService.getUnreadCount(userId);
    setUnreadCount(count);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Update unread count when dropdown closes
      updateUnreadCount();
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 hover:bg-accent transition-all duration-200"
          aria-label="알림"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] p-0 max-h-[600px]">
        <NotificationList userId={userId} onNotificationRead={updateUnreadCount} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
