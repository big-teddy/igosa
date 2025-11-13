"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { ReferralDashboard } from "@/components/dashboard/ReferralDashboard";
import { dashboardService } from "@/lib/services/dashboard-service";
import {
  getWishlist,
  getRecentlyViewed,
  getParticipatedDeals,
  toggleWishlist,
} from "@/lib/data/user-activity";
import { mockProducts, Product } from "@/lib/data/mock-products";
import { mockNegoDeals, getNegoDealById, NegoDeal } from "@/lib/data/mock-nego-deals";
import { getUserOrders, Order } from "@/lib/data/mock-orders";
import type { DashboardStats, ReferralDashboardStats } from "@/types/dashboard";
import {
  User,
  Package,
  Heart,
  Clock,
  TrendingDown,
  Mail,
  Edit,
  ChevronRight,
  Users,
  Zap,
  Home,
  BarChart3,
  DollarSign,
} from "lucide-react";

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [participatedDealIds, setParticipatedDealIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralDashboardStats | null>(null);

  useEffect(() => {
    // 로그인 확인
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login?redirect=/my');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);
    const uid = userData.email || userData.id || 'user-1';
    setUserId(uid);

    // 사용자 활동 데이터 로드
    setWishlistIds(getWishlist());
    setRecentlyViewedIds(getRecentlyViewed());
    const participated = getParticipatedDeals();
    setParticipatedDealIds(participated.map(p => p.dealId));
    setOrders(getUserOrders(userData.email));

    // 대시보드 통계 로드
    const stats = dashboardService.getDashboardStats(uid);
    setDashboardStats(stats);

    // 레퍼럴 통계 로드
    const refStats = dashboardService.getReferralDashboardStats(uid);
    setReferralStats(refStats);
  }, [router]);

  const handleToggleWishlist = (productId: string) => {
    toggleWishlist(productId);
    setWishlistIds(getWishlist());
  };

  if (!user) {
    return null;
  }

  const wishlistProducts = mockProducts.filter(p => wishlistIds.includes(p.id));
  const recentlyViewedProducts = recentlyViewedIds
    .map(id => mockProducts.find(p => p.id === id))
    .filter(p => p !== undefined) as Product[];
  const participatedDeals = participatedDealIds
    .map(id => getNegoDealById(id))
    .filter(d => d !== undefined) as NegoDeal[];

  const stats = [
    { label: '참여 중인 네고딜', value: participatedDeals.length, icon: TrendingDown, color: 'text-blue-600' },
    { label: '전체 주문', value: orders.length, icon: Package, color: 'text-green-600' },
    { label: '찜한 제품', value: wishlistProducts.length, icon: Heart, color: 'text-red-600' },
    { label: '최근 본 제품', value: recentlyViewedProducts.length, icon: Clock, color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container max-w-7xl mx-auto py-8 px-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">
                  {user.name || user.email.split('@')[0]}님
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  홈으로
                </Button>
              </Link>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                프로필 수정
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx}>
                <CardContent className="pt-6 text-center">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              대시보드
            </TabsTrigger>
            <TabsTrigger value="referral">
              <DollarSign className="h-4 w-4 mr-2" />
              레퍼럴
            </TabsTrigger>
            <TabsTrigger value="participated">
              <TrendingDown className="h-4 w-4 mr-2" />
              네고딜
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2" />
              주문
            </TabsTrigger>
            <TabsTrigger value="wishlist">
              <Heart className="h-4 w-4 mr-2" />
              찜
            </TabsTrigger>
            <TabsTrigger value="recent">
              <Clock className="h-4 w-4 mr-2" />
              최근
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            {dashboardStats && <DashboardOverview stats={dashboardStats} />}
          </TabsContent>

          {/* Referral Dashboard Tab */}
          <TabsContent value="referral" className="space-y-4">
            {referralStats && <ReferralDashboard stats={referralStats} />}
          </TabsContent>

          {/* Participated Deals */}
          <TabsContent value="participated" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>참여 중인 네고딜</CardTitle>
                <CardDescription>
                  현재 참여하고 있는 공동구매 내역입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                {participatedDeals.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingDown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      참여 중인 네고딜이 없습니다
                    </p>
                    <Link href="/nego-deals">
                      <Button>
                        네고딜 둘러보기
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {participatedDeals.map((deal) => {
                      const progress = Math.round((deal.currentParticipants / deal.targetParticipants) * 100);
                      return (
                        <Link key={deal.id} href={`/nego-deals/${deal.id}`}>
                          <div className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                            <div className="flex gap-4">
                              <div className="w-24 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
                                <img
                                  src={deal.productImage}
                                  alt={deal.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold line-clamp-1 mb-1">
                                      {deal.productName}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary">{deal.brand}</Badge>
                                      {deal.status === 'goal_reached' && (
                                        <Badge className="bg-green-600 text-white">
                                          <Zap className="h-3 w-3 mr-1" />
                                          목표 달성
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground line-through">
                                      ₩{deal.originalPrice.toLocaleString()}
                                    </p>
                                    <p className="text-xl font-bold text-primary">
                                      ₩{deal.targetPrice.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      <Users className="h-4 w-4 inline mr-1" />
                                      {deal.currentParticipants}/{deal.targetParticipants}명
                                    </span>
                                    <span className="font-semibold text-primary">{progress}%</span>
                                  </div>
                                  <Progress value={progress} className="h-2" />
                                  <p className="text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    {deal.hoursRemaining}시간 남음
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>주문 내역</CardTitle>
                <CardDescription>
                  최근 주문 내역을 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      주문 내역이 없습니다
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <Link key={order.id} href={`/orders`}>
                        <div className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 bg-muted rounded overflow-hidden">
                                <img
                                  src={order.productImage}
                                  alt={order.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-semibold line-clamp-1 mb-1">
                                  {order.productName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.orderDate).toLocaleDateString('ko-KR')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">₩{order.totalAmount.toLocaleString()}</p>
                              <Badge variant="secondary" className="mt-1">
                                {order.status === 'delivered' ? '배송완료' : '배송중'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    <Link href="/orders" className="block">
                      <Button variant="outline" className="w-full">
                        전체 주문 보기
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist */}
          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle>찜한 제품</CardTitle>
                <CardDescription>
                  관심있는 제품을 저장해두세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      찜한 제품이 없습니다
                    </p>
                    <Link href="/products">
                      <Button>
                        제품 둘러보기
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {wishlistProducts.map((product) => {
                      const lowestPrice = product.prices.reduce((min, curr) =>
                        curr.total < min.total ? curr : min
                      );
                      return (
                        <div key={product.id} className="border rounded-lg overflow-hidden group">
                          <Link href={`/products/${product.id}`}>
                            <div className="aspect-video bg-muted relative overflow-hidden">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                          </Link>
                          <div className="p-4">
                            <Link href={`/products/${product.id}`}>
                              <h3 className="font-semibold line-clamp-2 mb-2 hover:text-primary">
                                {product.name}
                              </h3>
                            </Link>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground line-through">
                                  ₩{product.price.toLocaleString()}
                                </p>
                                <p className="text-lg font-bold text-primary">
                                  ₩{lowestPrice.total.toLocaleString()}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleWishlist(product.id)}
                              >
                                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recently Viewed */}
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>최근 본 제품</CardTitle>
                <CardDescription>
                  최근 조회한 제품 목록입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentlyViewedProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      최근 본 제품이 없습니다
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentlyViewedProducts.slice(0, 6).map((product) => {
                      const lowestPrice = product.prices.reduce((min, curr) =>
                        curr.total < min.total ? curr : min
                      );
                      return (
                        <Link key={product.id} href={`/products/${product.id}`}>
                          <div className="border rounded-lg overflow-hidden hover:border-primary transition-colors">
                            <div className="aspect-video bg-muted">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-3">
                              <h3 className="font-medium text-sm line-clamp-2 mb-2">
                                {product.name}
                              </h3>
                              <p className="text-lg font-bold text-primary">
                                ₩{lowestPrice.total.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
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
