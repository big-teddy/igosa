'use client';

import { Notification, NotificationType } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { X, Bell, DollarSign, TrendingDown, Heart, MessageSquare, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
}

const notificationIcons: Record<NotificationType, any> = {
  price_alert: Bell,
  deal_goal_reached: TrendingDown,
  deal_ending_soon: TrendingDown,
  referral_earned: DollarSign,
  new_follower: UserPlus,
  like: Heart,
  comment: MessageSquare,
};

const notificationColors: Record<NotificationType, string> = {
  price_alert: 'text-blue-500',
  deal_goal_reached: 'text-green-500',
  deal_ending_soon: 'text-orange-500',
  referral_earned: 'text-purple-500',
  new_follower: 'text-pink-500',
  like: 'text-red-500',
  comment: 'text-indigo-500',
};

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const Icon = notificationIcons[notification.type];
  const iconColor = notificationColors[notification.type];

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  const content = (
    <div
      className={`
        relative p-4 hover:bg-muted/50 transition-colors cursor-pointer group
        ${!notification.read ? 'bg-primary/5' : ''}
      `}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm line-clamp-1">{notification.title}</h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(notification.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>

          {/* Product info if available */}
          {notification.data?.productImage && (
            <div className="flex items-center gap-2 mt-2">
              <img
                src={notification.data.productImage}
                alt={notification.data.productName || '상품'}
                className="w-10 h-10 rounded object-cover"
              />
              <span className="text-xs text-muted-foreground line-clamp-1">
                {notification.data.productName}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Wrap in Link if notification has a link
  if (notification.link) {
    return (
      <Link href={notification.link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
