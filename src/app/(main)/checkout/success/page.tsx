"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Package } from "lucide-react";

export const dynamic = 'force-dynamic';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderInfo, setOrderInfo] = useState<any>(null);

  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const paymentKey = searchParams.get('paymentKey');

  useEffect(() => {
    if (orderId && amount) {
      // 실제로는 서버에서 결제 승인 API 호출
      setOrderInfo({
        orderId,
        amount: parseInt(amount),
        paymentKey,
        orderDate: new Date().toLocaleDateString('ko-KR'),
      });
    }
  }, [orderId, amount, paymentKey]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold mb-2">결제가 완료되었습니다!</h1>
            <p className="text-muted-foreground">
              네고딜 참여가 성공적으로 완료되었습니다
            </p>
          </div>

          {/* Order Info */}
          {orderInfo && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">주문번호</span>
                <span className="font-mono">{orderInfo.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">결제금액</span>
                <span className="font-bold">₩{orderInfo.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">결제일시</span>
                <span>{orderInfo.orderDate}</span>
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>네고딜 진행 안내</strong>
              <br />
              목표 인원 달성 시 SMS와 이메일로 알림을 보내드립니다.
              <br />
              목표 미달 시 자동으로 환불처리됩니다.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Link href="/orders" className="block">
              <Button variant="outline" className="w-full" size="lg">
                <Package className="h-4 w-4 mr-2" />
                주문 내역 확인
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button className="w-full" size="lg">
                <Home className="h-4 w-4 mr-2" />
                홈으로 이동
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
