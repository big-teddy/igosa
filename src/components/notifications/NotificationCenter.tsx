'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Settings, Trash2, CheckCheck, Filter, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { notificationService } from '@/lib/services/notification-service';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import type { Notification, NotificationType } from '@/types/notification';

const notificationCategories: { type: NotificationType; label: string; icon: string }[] = [
    { type: 'price_alert', label: '가격 알림', icon: '💰' },
    { type: 'deal_goal_reached', label: '딜 목표 달성', icon: '🎯' },
    { type: 'deal_ending_soon', label: '딜 마감 임박', icon: '⏰' },
    { type: 'referral_earned', label: '추천 보상', icon: '🎁' },
    { type: 'new_follower', label: '새 팔로워', icon: '👥' },
    { type: 'like', label: '좋아요', icon: '❤️' },
    { type: 'comment', label: '댓글', icon: '💬' },
];

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
    const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({
        priceAlerts: true,
        dealUpdates: true,
        socialNotifications: true,
        pushEnabled: false,
        emailEnabled: true,
    });

    // Get user ID from localStorage
    const userId = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('user') || '{}')?.id || 'guest'
        : 'guest';

    useEffect(() => {
        loadNotifications();
    }, [userId]);

    const loadNotifications = () => {
        const allNotifications = notificationService.getUserNotifications(userId);
        setNotifications(allNotifications);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const filteredNotifications = notifications.filter(n => {
        const matchesTab = activeTab === 'all' || !n.read;
        const matchesType = selectedType === 'all' || n.type === selectedType;
        return matchesTab && matchesType;
    });

    const handleMarkAsRead = (id: string) => {
        notificationService.markAsRead(id);
        loadNotifications();
    };

    const handleDelete = (id: string) => {
        notificationService.deleteNotification(id);
        loadNotifications();
    };

    const handleMarkAllAsRead = () => {
        notifications.filter(n => !n.read).forEach(n => {
            notificationService.markAsRead(n.id);
        });
        loadNotifications();
    };

    const handleClearAll = () => {
        notifications.forEach(n => {
            notificationService.deleteNotification(n.id);
        });
        loadNotifications();
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl mb-nav">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">알림 센터</h1>
                        {unreadCount > 0 && (
                            <p className="text-sm text-muted-foreground">
                                읽지 않은 알림 {unreadCount}개
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        <Settings className="h-4 w-4 mr-2" />
                        설정
                    </Button>
                </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-6"
                    >
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">알림 설정</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-center justify-between p-3 rounded-lg border">
                                        <Label htmlFor="priceAlerts" className="flex items-center gap-2">
                                            💰 가격 알림
                                        </Label>
                                        <Switch
                                            id="priceAlerts"
                                            checked={settings.priceAlerts}
                                            onCheckedChange={(checked) => setSettings(s => ({ ...s, priceAlerts: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg border">
                                        <Label htmlFor="dealUpdates" className="flex items-center gap-2">
                                            🎯 딜 업데이트
                                        </Label>
                                        <Switch
                                            id="dealUpdates"
                                            checked={settings.dealUpdates}
                                            onCheckedChange={(checked) => setSettings(s => ({ ...s, dealUpdates: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg border">
                                        <Label htmlFor="social" className="flex items-center gap-2">
                                            👥 소셜 알림
                                        </Label>
                                        <Switch
                                            id="social"
                                            checked={settings.socialNotifications}
                                            onCheckedChange={(checked) => setSettings(s => ({ ...s, socialNotifications: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg border">
                                        <Label htmlFor="push" className="flex items-center gap-2">
                                            📱 푸시 알림
                                        </Label>
                                        <Switch
                                            id="push"
                                            checked={settings.pushEnabled}
                                            onCheckedChange={(checked) => setSettings(s => ({ ...s, pushEnabled: checked }))}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tabs and Filters */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <TabsList>
                        <TabsTrigger value="all">전체</TabsTrigger>
                        <TabsTrigger value="unread" className="relative">
                            읽지 않음
                            {unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] px-1.5">
                                    {unreadCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            disabled={unreadCount === 0}
                        >
                            <CheckCheck className="h-4 w-4 mr-2" />
                            모두 읽음
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearAll}
                            disabled={notifications.length === 0}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            전체 삭제
                        </Button>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                    <Button
                        variant={selectedType === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedType('all')}
                        className="shrink-0"
                    >
                        전체
                    </Button>
                    {notificationCategories.map((cat) => (
                        <Button
                            key={cat.type}
                            variant={selectedType === cat.type ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedType(cat.type)}
                            className="shrink-0"
                        >
                            {cat.icon} {cat.label}
                        </Button>
                    ))}
                </div>

                {/* Notification List */}
                <TabsContent value={activeTab} className="mt-0">
                    <Card>
                        <CardContent className="p-0">
                            {filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Bell className="h-12 w-12 mb-4 opacity-50" />
                                    <p className="text-lg font-medium">알림이 없습니다</p>
                                    <p className="text-sm">
                                        {activeTab === 'unread' ? '읽지 않은 알림이 없습니다' : '새로운 알림이 생기면 여기에 표시됩니다'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    <AnimatePresence>
                                        {filteredNotifications.map((notification, index) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <NotificationItem
                                                    notification={notification}
                                                    onMarkAsRead={handleMarkAsRead}
                                                    onDelete={handleDelete}
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
