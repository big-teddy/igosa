"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { Search, SlidersHorizontal } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  lowestPrice?: {
    platform: string;
    total: number;
  };
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("price");

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/products/search?q=${encodeURIComponent(searchTerm)}&sort=${sortBy}`
      );
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    handleSearch();
  };

  // Load products when URL query changes or sort changes
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, sortBy]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="glass-card p-6 mb-8 space-y-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">제품 검색</h1>
            <p className="text-muted-foreground">
              다양한 쇼핑몰의 가격을 비교하고 최저가를 찾아보세요
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
              <Input
                placeholder="제품명, 브랜드, 카테고리로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-12 h-12 bg-white/50 dark:bg-slate-900/50 border-2 border-white/40 focus:border-primary/50 transition-all text-base"
              />
            </div>
            <Button
              onClick={handleSearchClick}
              disabled={loading}
              className="h-12 px-8 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              {loading ? "검색 중..." : "검색"}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="font-medium">정렬</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={sortBy === "price" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("price")}
                className={sortBy === "price" ? "bg-gradient-to-r from-primary to-accent" : "glass-button"}
              >
                최저가순
              </Button>
              <Button
                variant={sortBy === "rating" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("rating")}
                className={sortBy === "rating" ? "bg-gradient-to-r from-primary to-accent" : "glass-button"}
              >
                평점순
              </Button>
              <Button
                variant={sortBy === "reviews" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("reviews")}
                className={sortBy === "reviews" ? "bg-gradient-to-r from-primary to-accent" : "glass-button"}
              >
                리뷰많은순
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="glass-card text-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 bg-primary/20 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="mt-6 text-muted-foreground font-medium">검색 중...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card text-center py-20">
            <div className="text-6xl mb-4 opacity-20">🔍</div>
            <p className="text-muted-foreground text-lg">
              검색 결과가 없습니다. 다른 검색어를 입력해보세요.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-2">
              <div className="glass-card px-4 py-2 inline-block">
                <span className="text-sm font-medium">
                  총 <span className="text-primary font-bold text-lg">{products.length}</span>개의 제품
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
