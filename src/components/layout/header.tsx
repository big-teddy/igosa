"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare, ShoppingCart, TrendingDown, User, LogOut } from "lucide-react";

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for user in localStorage (Mock auth)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

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
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden md:block">
                {user.name || user.email}님
              </span>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="로그아웃">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">로그인</Button>
              </Link>
              <Link href="/signup">
                <Button>시작하기</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
