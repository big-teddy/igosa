import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, ShoppingCart, TrendingDown, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center p-8 md:p-24 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              AI와 함께하는
              <br />
              <span className="text-primary">스마트 쇼핑</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              자연어로 물어보고, 실시간 가격을 비교하고, 함께 구매해요
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <Button size="lg" className="text-lg px-8">
                <MessageSquare className="mr-2 h-5 w-5" />
                AI 검색 시작하기
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="text-lg px-8">
                가격 비교하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            왜 이거사를 선택해야 할까요?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <MessageSquare className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>대화형 AI 검색</CardTitle>
                <CardDescription>
                  "편한 러닝화 추천해줘"처럼 자연스럽게 물어보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 자연어 처리로 의도 파악</li>
                  <li>• 다중 턴 대화 지원</li>
                  <li>• 한국어 완벽 지원</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ShoppingCart className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>실시간 가격 비교</CardTitle>
                <CardDescription>
                  쿠팡, 네이버, 11번가 최저가를 한눈에
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 배송비 포함 총액 비교</li>
                  <li>• 로켓배송 우선 표시</li>
                  <li>• 실시간 재고 확인</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingDown className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>AI 네고딜</CardTitle>
                <CardDescription>
                  함께 구매하고 더 큰 할인 받으세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 자동 그룹 매칭</li>
                  <li>• AI 자동 협상</li>
                  <li>• 최대 20% 할인</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <Sparkles className="h-12 w-12 mx-auto text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold">
              지금 바로 시작해보세요
            </h2>
            <p className="text-xl text-muted-foreground">
              가입 없이도 AI 쇼핑 어시스턴트를 체험할 수 있어요
            </p>
          </div>
          <Link href="/chat">
            <Button size="lg" className="text-lg px-12">
              무료로 시작하기
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
