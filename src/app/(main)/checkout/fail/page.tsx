"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, Home, RotateCcw } from "lucide-react";

export const dynamic = 'force-dynamic';

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  const getErrorMessage = () => {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '사용자가 결제를 취소했습니다.';
      case 'PAY_PROCESS_ABORTED':
        return '결제 진행 중 오류가 발생했습니다.';
      case 'REJECT_CARD_COMPANY':
        return '카드사에서 결제를 거부했습니다.';
      default:
        return message || '결제 처리 중 문제가 발생했습니다.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          {/* Error Icon */}
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold mb-2">결제에 실패했습니다</h1>
            <p className="text-muted-foreground">
              {getErrorMessage()}
            </p>
          </div>

          {/* Error Details */}
          {code && (
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">오류 코드</span>
                <span className="font-mono text-destructive">{code}</span>
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-900 dark:text-yellow-100">
              결제가 실패했지만 네고딜은 계속 진행 중입니다.
              <br />
              다시 시도하거나 다른 결제 수단을 선택해주세요.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => window.history.back()}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              다시 시도
            </Button>
            <Link href="/" className="block">
              <Button variant="ghost" className="w-full" size="lg">
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

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    }>
      <PaymentFailContent />
    </Suspense>
  );
}
