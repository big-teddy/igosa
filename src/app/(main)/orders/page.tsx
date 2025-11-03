"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  getUserOrders,
  Order,
  getOrderStatusLabel,
  getOrderStatusColor,
  getNegoDealStatusLabel,
} from "@/lib/data/mock-orders";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Users,
  AlertCircle,
  ChevronRight,
  Home,
} from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 로그인 확인
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login?redirect=/orders');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);

    // 주문 내역 로드
    const userOrders = getUserOrders(userData.email);
    setOrders(userOrders);
  }, [router]);

  if (!user) {
    return null;
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Clock className="h-5 w-5" />;
      case 'preparing':
        return <Package className="h-5 w-5" />;
      case 'shipping':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container max-w-6xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">주문 내역</h1>
              <p className="text-muted-foreground">
                네고딜 참여 및 주문 내역을 확인하세요
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
        {orders.length === 0 ? (
          // Empty State
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">주문 내역이 없습니다</h2>
              <p className="text-muted-foreground mb-6">
                이거사에서 첫 네고딜에 참여해보세요!
              </p>
              <Link href="/nego-deals">
                <Button>
                  네고딜 둘러보기
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          // Orders List
          <div className="space-y-4">
            {orders.map((order) => {
              const progress = Math.round((order.currentParticipants / order.targetParticipants) * 100);

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-muted-foreground">
                            주문번호: {order.orderId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{order.brand}</Badge>
                          <Badge variant="outline">{order.platform}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(order.orderDate).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 ${getOrderStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="font-semibold">
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Product Info */}
                      <div className="md:col-span-2">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
                            <img
                              src={order.productImage}
                              alt={order.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">
                              {order.productName}
                            </h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">수량:</span>
                                <span>{order.quantity}개</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">결제 방법:</span>
                                <span>{order.paymentMethod}</span>
                              </div>
                              {order.trackingNumber && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">운송장 번호:</span>
                                  <span className="font-mono">{order.trackingNumber}</span>
                                </div>
                              )}
                            </div>

                            {/* Nego Deal Status */}
                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="h-4 w-4" />
                                  <span className="font-medium">
                                    네고딜 현황: {getNegoDealStatusLabel(order.negoDealStatus)}
                                  </span>
                                </div>
                                {order.negoDealStatus === 'goal_reached' && (
                                  <Badge className="bg-green-600 text-white">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    달성
                                  </Badge>
                                )}
                                {order.negoDealStatus === 'waiting' && (
                                  <Badge variant="secondary">
                                    <Clock className="h-3 w-3 mr-1" />
                                    대기중
                                  </Badge>
                                )}
                              </div>
                              <Progress value={progress} className="h-2 mb-1" />
                              <p className="text-xs text-muted-foreground">
                                {order.currentParticipants}/{order.targetParticipants}명 참여 ({progress}%)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price Info */}
                      <div className="md:col-span-1">
                        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">상품 금액</span>
                            <span className="line-through">
                              ₩{order.originalPrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-green-600">
                            <span>네고딜 할인 ({order.discountRate}%)</span>
                            <span>-₩{order.savings.toLocaleString()}</span>
                          </div>
                          <div className="pt-2 border-t flex justify-between items-center">
                            <span className="font-semibold">최종 결제 금액</span>
                            <span className="text-xl font-bold text-primary">
                              ₩{order.totalAmount.toLocaleString()}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-3 space-y-2">
                            <Link href={`/orders/${order.orderId}`} className="block">
                              <Button variant="outline" size="sm" className="w-full">
                                상세 보기
                                <ChevronRight className="h-4 w-4 ml-2" />
                              </Button>
                            </Link>
                            {order.status === 'shipping' && (
                              <Button variant="outline" size="sm" className="w-full">
                                <Truck className="h-4 w-4 mr-2" />
                                배송 추적
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
