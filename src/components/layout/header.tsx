"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, ShoppingCart, TrendingDown, User } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6" />
            <span className="font-bold text-xl">이거사</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/chat"
              className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              AI 검색
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              제품 비교
            </Link>
            <Link
              href="/nego-deals"
              className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
            >
              <TrendingDown className="h-4 w-4" />
              공동구매
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <Button>시작하기</Button>
        </div>
      </div>
    </header>
  );
}
