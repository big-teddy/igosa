"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getSocialActivityFeed,
  SocialActivity,
  getFriends,
} from "@/lib/data/mock-social";
import {
  Heart,
  MessageCircle,
  ShoppingBag,
  Star,
  Bookmark,
  TrendingUp,
  Home,
  Users,
} from "lucide-react";

export default function FeedPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<SocialActivity[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);

  useEffect(() => {
    // 로그인 확인
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login?redirect=/feed');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);

    // 친구들의 활동 피드 로드
    const feed = getSocialActivityFeed('user-1');
    setActivities(feed);

    const friends = getFriends('user-1');
    setFriendsCount(friends.length);
  }, [router]);

  if (!user) {
    return null;
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ShoppingBag className="h-5 w-5 text-green-600" />;
      case 'review':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'recommendation':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'wishlist':
        return <Bookmark className="h-5 w-5 text-purple-600" />;
      default:
        return <Heart className="h-5 w-5" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return '구매했어요';
      case 'review':
        return '리뷰를 남겼어요';
      case 'recommendation':
        return '추천해요';
      case 'wishlist':
        return '찜했어요';
      default:
        return '';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    return `${Math.floor(diffInSeconds / 86400)}일 전`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container max-w-4xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">친구 피드</h1>
              <p className="text-muted-foreground">
                친구들의 최신 구매와 추천을 확인하세요
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/friends">
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  친구 ({friendsCount})
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  홈
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto py-8 px-4">
        {activities.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">아직 활동이 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                친구를 추가하고 그들의 구매와 추천을 확인해보세요!
              </p>
              <Link href="/friends">
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  친구 찾기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* User Info */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {activity.userAvatar ? (
                        <img src={activity.userAvatar} alt={activity.userName} className="w-full h-full" />
                      ) : (
                        <Users className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{activity.userName}</span>
                        <span className="text-sm text-muted-foreground">
                          {getActivityLabel(activity.type)}
                        </span>
                        {getActivityIcon(activity.type)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Product Info */}
                  <Link href={`/products/${activity.productId}`}>
                    <div className="flex gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                        <img
                          src={activity.productImage}
                          alt={activity.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold line-clamp-2 mb-2">
                          {activity.productName}
                        </h4>
                        {activity.rating && (
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < activity.rating!
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  {activity.content && (
                    <p className="mt-4 text-muted-foreground">
                      "{activity.content}"
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Heart className="h-4 w-4" />
                      <span>{activity.likesCount}</span>
                    </button>
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>{activity.commentsCount}</span>
                    </button>
                    <Link href={`/products/${activity.productId}`}>
                      <button className="text-sm text-primary hover:underline">
                        제품 보기
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {activities.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline">
              더 보기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
