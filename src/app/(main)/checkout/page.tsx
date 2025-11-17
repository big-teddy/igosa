"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadTossPayments } from "@tosspayments/payment-sdk";

export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getNegoDealById } from "@/lib/data/mock-nego-deals";
import {
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  AlertCircle,
  ShoppingBag,
  ChevronLeft,
  Check
} from "lucide-react";
import Link from "next/link";
import { analytics } from "@/lib/monitoring/posthog";

type PaymentMethod = '카드' | '계좌이체' | '휴대폰' | '토스페이';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dealId = searchParams.get('dealId');
  const [deal, setDeal] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('카드');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 주문자 정보
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    // 로그인 확인
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login?redirect=/checkout');
      return;
    }

    const user = JSON.parse(storedUser);
    setCustomerName(user.name || '');
    setCustomerEmail(user.email || '');

    // 네고딜 정보 로드
    if (dealId) {
      const foundDeal = getNegoDealById(dealId);
      if (foundDeal) {
        setDeal(foundDeal);
      }
    }
  }, [dealId, router]);

  const handlePayment = async () => {
    if (!customerName || !customerEmail || !customerPhone) {
      setError("모든 필수 정보를 입력해주세요.");
      return;
    }

    if (!deal) {
      setError("결제 정보를 찾을 수 없습니다.");
      return;
    }

    setLoading(true);
    setError("");

    // Track checkout started event
    analytics.trackCheckoutStarted(
      [{
        id: deal.id || dealId || 'unknown',
        name: deal.productName,
        price: deal.targetPrice,
        quantity: 1
      }],
      deal.targetPrice
    );

    try {
      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
      );

      // 주문 ID 생성 (실제로는 서버에서 생성)
      const orderId = `ORDER_${Date.now()}`;
      const amount = deal.targetPrice;

      await tossPayments.requestPayment(paymentMethod, {
        amount,
        orderId,
        orderName: deal.productName,
        customerName,
        customerEmail,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || "결제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!deal) {
    return (
      <div className="container max-w-4xl mx-auto py-20 px-4 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">결제 정보를 찾을 수 없습니다</h2>
        <p className="text-muted-foreground mb-6">
          올바른 결제 링크로 다시 시도해주세요.
        </p>
        <Link href="/nego-deals">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" />
            네고딜 목록으로
          </Button>
        </Link>
      </div>
    );
  }

  const paymentMethods = [
    { id: '카드' as PaymentMethod, label: '카드결제', icon: CreditCard, description: '신용/체크카드' },
    { id: '계좌이체' as PaymentMethod, label: '계좌이체', icon: Building, description: '실시간 계좌이체' },
    { id: '휴대폰' as PaymentMethod, label: '휴대폰', icon: Smartphone, description: '휴대폰 소액결제' },
    { id: '토스페이' as PaymentMethod, label: '간편결제', icon: Wallet, description: '토스페이' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container max-w-4xl mx-auto py-4 px-4">
          <Link
            href={`/nego-deals/${dealId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            뒤로 가기
          </Link>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">주문/결제</h1>
          <p className="text-muted-foreground">
            네고딜 참여를 위한 결제를 진행합니다
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>주문자 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">이름 *</label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="홍길동"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">이메일 *</label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="example@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">휴대폰 번호 *</label>
                  <Input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="010-1234-5678"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>결제 수단</CardTitle>
                <CardDescription>
                  편리한 결제 수단을 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          paymentMethod === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2 text-center">
                          <Icon className={`h-6 w-6 ${
                            paymentMethod === method.id ? 'text-primary' : ''
                          }`} />
                          <div>
                            <p className="font-medium text-sm">{method.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {method.description}
                            </p>
                          </div>
                          {paymentMethod === method.id && (
                            <Check className="h-4 w-4 text-primary absolute top-2 right-2" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Terms */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <label className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1" required />
                    <span className="text-sm">
                      결제 진행 시{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        이용약관
                      </Link>
                      ,{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        개인정보처리방침
                      </Link>
                      에 동의합니다. (필수)
                    </span>
                  </label>
                  <label className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1" required />
                    <span className="text-sm">
                      네고딜 참여 규정을 확인했으며, 목표 미달 시 취소될 수 있음을 이해합니다. (필수)
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">주문 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Product Info */}
                  <div className="flex gap-3">
                    <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                      <img
                        src={deal.productImage}
                        alt={deal.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">
                        {deal.productName}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        {deal.brand}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">상품 금액</span>
                      <span>₩{deal.originalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>네고딜 할인 ({deal.discountRate}%)</span>
                      <span>-₩{deal.savings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">배송비</span>
                      <span>무료</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">최종 결제 금액</span>
                      <span className="text-2xl font-bold text-primary">
                        ₩{deal.targetPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={loading}
                    size="lg"
                    className="w-full"
                  >
                    {loading ? (
                      "결제 진행 중..."
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        ₩{deal.targetPrice.toLocaleString()} 결제하기
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    안전한 결제를 위해 토스페이먼츠를 사용합니다
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
