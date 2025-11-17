"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/products/product-card";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterPanel } from "@/components/search/FilterPanel";
import { SortSelector } from "@/components/search/SortSelector";
import { searchService } from "@/lib/services/search-service";
import type { SearchFilters, SortOption, ProductSearchResult } from "@/types/search";

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

  const [filters, setFilters] = useState<SearchFilters>({
    query: initialQuery,
    categories: ['all'],
  });
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [products, setProducts] = useState<ProductSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);

  // Load available brands
  useEffect(() => {
    const brands = searchService.getAvailableBrands();
    setAvailableBrands(brands);
  }, []);

  // Search products
  useEffect(() => {
    setLoading(true);
    try {
      const result = searchService.searchProducts({
        filters,
        sort: sortBy,
        page: 1,
        limit: 50,
      });

      setProducts(result.items);
      setTotal(result.total);
    } catch (error) {
      console.error("Search failed:", error);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]);

  const handleSearchQuery = (query: string) => {
    setFilters({ ...filters, query });
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

  // Convert ProductSearchResult to Product for ProductCard
  const convertToProduct = (item: ProductSearchResult): Product => ({
    id: item.id,
    name: item.name,
    description: item.description,
    brand: item.brand || '',
    price: item.price,
    originalPrice: item.originalPrice,
    imageUrl: item.image,
    rating: item.rating || 0,
    reviewCount: item.reviewCount || 0,
  });

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
          <SearchBar
            initialValue={initialQuery}
            placeholder="제품명, 브랜드, 카테고리로 검색..."
            onSearch={handleSearchQuery}
          />

          {/* Filters and Sort */}
          <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              availableBrands={availableBrands}
              showNegoDealFilter={true}
            />
            <div className="flex-1 flex justify-end">
              <SortSelector
                value={sortBy}
                onChange={handleSortChange}
                availableOptions={['relevance', 'price-asc', 'price-desc', 'popularity', 'newest', 'discount']}
              />
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
            <p className="text-muted-foreground text-lg mb-2">
              검색 결과가 없습니다.
            </p>
            <p className="text-muted-foreground text-sm">
              다른 검색어를 입력하거나 필터를 조정해보세요.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-2">
              <div className="glass-card px-4 py-2 inline-block">
                <span className="text-sm font-medium">
                  총 <span className="text-primary font-bold text-lg">{total}</span>개의 제품
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={convertToProduct(product)} />
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
