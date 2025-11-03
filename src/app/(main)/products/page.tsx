"use client";

import { useState, useEffect } from "react";
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

export default function ProductsPage() {
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
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold">제품 검색</h1>
        <p className="text-muted-foreground">
          다양한 쇼핑몰의 가격을 비교하고 최저가를 찾아보세요
        </p>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="제품명, 브랜드, 카테고리로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "검색 중..." : "검색"}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2">
            <Button
              variant={sortBy === "price" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("price")}
            >
              최저가순
            </Button>
            <Button
              variant={sortBy === "rating" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("rating")}
            >
              평점순
            </Button>
            <Button
              variant={sortBy === "reviews" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("reviews")}
            >
              리뷰많은순
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">검색 중...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            검색 결과가 없습니다. 다른 검색어를 입력해보세요.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            총 {products.length}개의 제품
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
