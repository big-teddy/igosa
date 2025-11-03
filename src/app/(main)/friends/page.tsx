"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  mockUsers,
  UserProfile,
  getFriends,
  getPendingFriendRequests,
  searchUsers,
} from "@/lib/data/mock-social";
import {
  Users,
  UserPlus,
  Search,
  Star,
  ShoppingBag,
  MessageCircle,
  Home,
  Check,
  X,
  TrendingUp,
} from "lucide-react";

export default function FriendsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // 로그인 확인
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login?redirect=/friends');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);

    // Mock: 실제로는 user ID 사용
    setFriends(getFriends('user-1'));
    setPendingRequests(getPendingFriendRequests('user-1'));
  }, [router]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const results = searchUsers(query);
      // 본인과 이미 친구인 사람 제외
      const filtered = results.filter(
        u => u.id !== 'user-1' && !friends.some(f => f.id === u.id)
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleAddFriend = (friendId: string) => {
    alert(`${friendId}에게 친구 요청을 보냈습니다!`);
    // 실제로는 API 호출
  };

  const handleAcceptRequest = (friendId: string) => {
    const friend = pendingRequests.find(f => f.id === friendId);
    if (friend) {
      setFriends([...friends, friend]);
      setPendingRequests(pendingRequests.filter(f => f.id !== friendId));
    }
  };

  const handleRejectRequest = (friendId: string) => {
    setPendingRequests(pendingRequests.filter(f => f.id !== friendId));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container max-w-6xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">친구</h1>
              <p className="text-muted-foreground">
                친구들의 구매와 추천을 확인하세요
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                홈으로
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="이름, 사용자명으로 친구 찾기..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Search Results */}
            {showResults && searchResults.length > 0 && (
              <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-4 border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center overflow-hidden">
                          {result.avatar ? (
                            <img src={result.avatar} alt={result.name} className="w-full h-full" />
                          ) : (
                            <Users className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{result.name}</span>
                            <span className="text-sm text-muted-foreground">
                              @{result.username}
                            </span>
                            {result.trustScore >= 90 && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                신뢰도 높음
                              </Badge>
                            )}
                          </div>
                          {result.bio && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {result.bio}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {result.followersCount} 팔로워
                            </span>
                            <span className="flex items-center gap-1">
                              <ShoppingBag className="h-3 w-3" />
                              {result.purchaseCount} 구매
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {result.reviewCount} 리뷰
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => handleAddFriend(result.id)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        친구 추가
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showResults && searchResults.length === 0 && (
              <div className="mt-4 text-center py-8 text-muted-foreground">
                검색 결과가 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="friends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends">
              <Users className="h-4 w-4 mr-2" />
              친구 ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              <UserPlus className="h-4 w-4 mr-2" />
              요청 ({pendingRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* Friends List */}
          <TabsContent value="friends">
            <Card>
              <CardHeader>
                <CardTitle>친구 목록</CardTitle>
                <CardDescription>
                  {friends.length}명의 친구와 연결되어 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                {friends.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      아직 친구가 없습니다
                    </p>
                    <p className="text-sm text-muted-foreground">
                      위 검색창에서 친구를 찾아보세요!
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {friends.map((friend) => (
                      <Link key={friend.id} href={`/users/${friend.username}`}>
                        <div className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                              {friend.avatar ? (
                                <img src={friend.avatar} alt={friend.name} className="w-full h-full" />
                              ) : (
                                <Users className="h-6 w-6 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold truncate">{friend.name}</span>
                                {friend.trustScore >= 85 && (
                                  <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                @{friend.username}
                              </p>
                              {friend.bio && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                  {friend.bio}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{friend.followersCount} 팔로워</span>
                                <span>{friend.purchaseCount} 구매</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Requests */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>친구 요청</CardTitle>
                <CardDescription>
                  {pendingRequests.length}개의 대기 중인 요청이 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      새로운 친구 요청이 없습니다
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center overflow-hidden">
                              {request.avatar ? (
                                <img src={request.avatar} alt={request.name} className="w-full h-full" />
                              ) : (
                                <Users className="h-6 w-6 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold">{request.name}</div>
                              <div className="text-sm text-muted-foreground">
                                @{request.username}
                              </div>
                              {request.bio && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {request.bio}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAcceptRequest(request.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              수락
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
