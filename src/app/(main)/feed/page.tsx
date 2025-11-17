"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getSocialActivityFeed,
  SocialActivity,
  getFriends,
} from "@/lib/data/mock-social";
import { FeedPost } from "@/components/social/FeedPost";
import { ReferralDashboard } from "@/components/social/ReferralDashboard";
import { FeedPost as FeedPostType } from "@/types/social-feed";
import { referralService } from "@/lib/services/referral-service";
import { socialFeedService } from "@/lib/services/social-feed-service";
import {
  Heart,
  MessageCircle,
  ShoppingBag,
  Star,
  Bookmark,
  TrendingUp,
  Home,
  Users,
  DollarSign,
  Filter,
} from "lucide-react";

export default function FeedPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [activities, setActivities] = useState<SocialActivity[]>([]);
  const [posts, setPosts] = useState<FeedPostType[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'purchase' | 'review' | 'recommendation'>('all');

  // Referral stats
  const [referralStats, setReferralStats] = useState<any>(null);
  const [userLevel, setUserLevel] = useState<any>(null);

  useEffect(() => {
    // 로그인 확인
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login?redirect=/feed');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);
    const uid = userData.email || userData.id || 'user-1';
    setUserId(uid);

    // 친구들의 활동 피드 로드 (mock data)
    const feed = getSocialActivityFeed('user-1');
    setActivities(feed);

    // 실제 포스트 로드
    const realPosts = socialFeedService.getPosts();
    setPosts(realPosts);

    const friends = getFriends('user-1');
    setFriendsCount(friends.length);

    // Load referral stats
    const stats = referralService.getUserStats(uid);
    const level = referralService.getUserLevel(uid);
    setReferralStats(stats);
    setUserLevel(level);
  }, [router]);

  if (!user) {
    return null;
  }

  // Convert SocialActivity to FeedPost
  const convertToFeedPost = (activity: SocialActivity): FeedPostType => {
    return {
      id: activity.id,
      userId: activity.userId,
      userName: activity.userName,
      userAvatar: activity.userAvatar,
      type: activity.type as FeedPostType['type'],
      productId: activity.productId,
      productName: activity.productName,
      productImage: activity.productImage,
      content: activity.content,
      rating: activity.rating,
      timestamp: activity.timestamp,
      likesCount: activity.likesCount,
      commentsCount: activity.commentsCount,
    };
  };

  // Combine real posts with mock activities
  const allFeedItems = [
    ...posts,
    ...activities.map(convertToFeedPost),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredFeedItems = allFeedItems.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

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
        <div className="container max-w-6xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
                친구 피드
                <Badge variant="outline" className="gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span className="text-xs">추천 수익</span>
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                친구들의 추천으로 구매하고, 내 추천으로 수익을 받으세요
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

      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-6">
            <TabsTrigger value="feed" className="gap-2">
              <Users className="h-4 w-4" />
              친구 피드
            </TabsTrigger>
            <TabsTrigger value="earnings" className="gap-2">
              <DollarSign className="h-4 w-4" />
              내 수익
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="space-y-6">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2 mb-6">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  전체
                </Button>
                <Button
                  variant={filter === 'purchase' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('purchase')}
                  className="gap-1"
                >
                  <ShoppingBag className="h-3 w-3" />
                  구매
                </Button>
                <Button
                  variant={filter === 'review' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('review')}
                  className="gap-1"
                >
                  <Star className="h-3 w-3" />
                  리뷰
                </Button>
                <Button
                  variant={filter === 'recommendation' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('recommendation')}
                  className="gap-1"
                >
                  <TrendingUp className="h-3 w-3" />
                  추천
                </Button>
              </div>
            </div>

            {filteredFeedItems.length === 0 ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredFeedItems.map((post) => (
                  <FeedPost
                    key={post.id}
                    post={post}
                    currentUserId={userId}
                  />
                ))}
              </div>
            )}

            {/* Load More */}
            {filteredFeedItems.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="outline">더 보기</Button>
              </div>
            )}
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            {referralStats && userLevel ? (
              <ReferralDashboard stats={referralStats} level={userLevel} />
            ) : (
              <Card>
                <CardContent className="py-20 text-center">
                  <DollarSign className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">아직 수익이 없습니다</h3>
                  <p className="text-muted-foreground mb-6">
                    친구들에게 좋은 제품을 추천하고 수익을 받아보세요!
                  </p>
                  <Link href="/">
                    <Button>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      제품 둘러보기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
