"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MessageSquare, ShoppingCart, TrendingDown, User, LogOut, Package, Users, Menu, Sparkles, Bell } from "lucide-react";

const navItems = [
  { href: "/feed", icon: Users, label: "친구 피드" },
  { href: "/nego-deals", icon: TrendingDown, label: "공동구매" },
  { href: "/products", icon: Package, label: "제품 둘러보기" },
  { href: "/price-alerts", icon: Bell, label: "가격 알림" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                // Force full page reload to reset all state
                window.location.href = '/';
              }}
              className="flex items-center gap-2 group cursor-pointer"
              aria-label="이거사 홈페이지로 이동"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl group-hover:text-primary transition-colors duration-200 whitespace-nowrap">
                이거사
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="주요 메뉴">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      relative px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                      transition-all duration-200 flex items-center gap-2
                      hover:bg-accent hover:text-accent-foreground
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      ${active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}
                    `}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {item.label}
                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side - User Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Desktop User Menu */}
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/my">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 hover:bg-accent transition-all duration-200 h-9"
                    >
                      <User className="h-4 w-4 shrink-0" />
                      <span className="whitespace-nowrap">마이페이지</span>
                    </Button>
                  </Link>
                  <Link href="/orders">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 hover:bg-accent transition-all duration-200 h-9"
                    >
                      <Package className="h-4 w-4 shrink-0" />
                      <span className="whitespace-nowrap">주문내역</span>
                    </Button>
                  </Link>
                  <span className="text-sm text-muted-foreground hidden lg:block px-2 whitespace-nowrap">
                    {user.name || user.email}님
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    title="로그아웃"
                    className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200 h-9 w-9 shrink-0"
                    aria-label="로그아웃"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="hover:bg-accent transition-all duration-200 h-9 whitespace-nowrap"
                    >
                      로그인
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-200 hover:scale-105 h-9 whitespace-nowrap">
                      시작하기
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9 shrink-0"
                  aria-label="메뉴 열기"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="text-left">메뉴</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-all duration-200
                        hover:bg-accent hover:text-accent-foreground
                        ${active ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'}
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}

                <div className="border-t my-4" />

                {user ? (
                  <>
                    <Link
                      href="/my"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-all duration-200"
                    >
                      <User className="h-5 w-5" />
                      마이페이지
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-all duration-200"
                    >
                      <Package className="h-5 w-5" />
                      주문내역
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-200 text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full justify-start gap-2">
                        로그인
                      </Button>
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full justify-start gap-2 bg-gradient-to-r from-primary to-accent">
                        시작하기
                      </Button>
                    </Link>
                  </>
                )}
              </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
