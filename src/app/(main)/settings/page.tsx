"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, Smartphone, Home, ChevronLeft, Save } from "lucide-react";
import { toast } from "sonner";

interface NotificationPreferences {
  userId: string;
  enableEmail: boolean;
  enablePush: boolean;
  enableKakao: boolean;
  enableSms: boolean;
  priceAlerts: boolean;
  dealAlerts: boolean;
  referralAlerts: boolean;
}

const PREFERENCES_KEY = 'igosa_price_tracking_preferences';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    userId: '',
    enableEmail: true,
    enablePush: true,
    enableKakao: false,
    enableSms: false,
    priceAlerts: true,
    dealAlerts: true,
    referralAlerts: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 로그인 확인
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login?redirect=/settings');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);
    const uid = userData.email || userData.id || 'user-1';

    // Load preferences
    loadPreferences(uid);
  }, [router]);

  const loadPreferences = (userId: string) => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        const allPrefs: NotificationPreferences[] = JSON.parse(stored);
        const userPrefs = allPrefs.find(p => p.userId === userId);
        if (userPrefs) {
          setPreferences(userPrefs);
          return;
        }
      }
      // Set default preferences with userId
      setPreferences(prev => ({ ...prev, userId }));
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      const stored = localStorage.getItem(PREFERENCES_KEY);
      const allPrefs: NotificationPreferences[] = stored ? JSON.parse(stored) : [];

      const index = allPrefs.findIndex(p => p.userId === preferences.userId);
      if (index >= 0) {
        allPrefs[index] = preferences;
      } else {
        allPrefs.push(preferences);
      }

      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(allPrefs));

      // In production: Save to backend API
      // await fetch('/api/user/preferences', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(preferences),
      // });

      toast.success('설정이 저장되었습니다', {
        description: '알림 설정이 성공적으로 업데이트되었습니다',
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('설정 저장 실패', {
        description: '다시 시도해주세요',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/my">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              뒤로
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-2">알림 설정</h1>
        <p className="text-muted-foreground">
          받고 싶은 알림을 설정하세요
        </p>
      </div>

      {/* Notification Channels */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>알림 채널</CardTitle>
          <CardDescription>
            알림을 받을 채널을 선택하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <Label htmlFor="email" className="text-base font-medium">
                  이메일 알림
                </Label>
                <p className="text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <Switch
              id="email"
              checked={preferences.enableEmail}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, enableEmail: checked }))
              }
            />
          </div>

          <Separator />

          {/* Push */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950 rounded-lg flex items-center justify-center">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <Label htmlFor="push" className="text-base font-medium">
                  푸시 알림
                </Label>
                <p className="text-sm text-muted-foreground">
                  브라우저 푸시 알림
                </p>
              </div>
            </div>
            <Switch
              id="push"
              checked={preferences.enablePush}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, enablePush: checked }))
              }
            />
          </div>

          <Separator />

          {/* Kakao */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-950 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="kakao" className="text-base font-medium">
                  카카오톡 알림
                </Label>
                <Badge variant="outline" className="text-xs">
                  준비중
                </Badge>
              </div>
            </div>
            <Switch
              id="kakao"
              checked={preferences.enableKakao}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, enableKakao: checked }))
              }
              disabled
            />
          </div>

          <Separator />

          {/* SMS */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-950 rounded-lg flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="sms" className="text-base font-medium">
                  SMS 알림
                </Label>
                <Badge variant="outline" className="text-xs">
                  준비중
                </Badge>
              </div>
            </div>
            <Switch
              id="sms"
              checked={preferences.enableSms}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, enableSms: checked }))
              }
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>알림 종류</CardTitle>
          <CardDescription>
            받고 싶은 알림의 종류를 선택하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="price" className="text-base font-medium">
                가격 알림
              </Label>
              <p className="text-sm text-muted-foreground">
                설정한 가격에 도달하면 알림을 받습니다
              </p>
            </div>
            <Switch
              id="price"
              checked={preferences.priceAlerts}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, priceAlerts: checked }))
              }
            />
          </div>

          <Separator />

          {/* Deal Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="deal" className="text-base font-medium">
                네고딜 알림
              </Label>
              <p className="text-sm text-muted-foreground">
                참여 중인 네고딜의 진행 상황을 알려드립니다
              </p>
            </div>
            <Switch
              id="deal"
              checked={preferences.dealAlerts}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, dealAlerts: checked }))
              }
            />
          </div>

          <Separator />

          {/* Referral Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="referral" className="text-base font-medium">
                레퍼럴 알림
              </Label>
              <p className="text-sm text-muted-foreground">
                레퍼럴 리워드 적립 시 알림을 받습니다
              </p>
            </div>
            <Switch
              id="referral"
              checked={preferences.referralAlerts}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, referralAlerts: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={savePreferences}
          disabled={saving}
          size="lg"
          className="flex-1"
        >
          {saving ? (
            <>
              <Save className="h-4 w-4 mr-2 animate-pulse" />
              저장 중...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              설정 저장
            </>
          )}
        </Button>
        <Link href="/my">
          <Button variant="outline" size="lg">
            <Home className="h-4 w-4 mr-2" />
            마이페이지로
          </Button>
        </Link>
      </div>

      {/* Info Box */}
      <Card className="mt-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 <strong>알림 설정 팁:</strong> 이메일 알림을 켜두시면 중요한 가격 변동을 놓치지 않으실 수 있습니다.
            푸시 알림은 실시간으로 가격 변동을 확인하고 싶으실 때 유용합니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
