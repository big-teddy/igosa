"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/products/product-card";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterPanel } from "@/components/search/FilterPanel";
import { SortSelector } from "@/components/search/SortSelector";
import { useProductSearch } from "@/hooks/useProductSearch";
import { useInfiniteScroll } from "@/hooks/useScroll";
import type { ProductSearchResult } from "@/types/search";
import { Loader2 } from "lucide-react";
import { EmptyState, NoSearchResultsEmpty } from "@/components/ui/empty-state";



function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const {
    query,
    setQuery,
    filters,
    setFilters,
    sort,
    setSort,
    results,
    total,
    loading,
    hasMore,
    loadMore
  } = useProductSearch({
    initialQuery,
    initialFilters: {
      categories: ['all']
    }
  });

  // Infinite scroll integration
  const { lastItemRef } = useInfiniteScroll<ProductSearchResult>({
    fetchFn: async () => {
      // useProductSearch handles loading internally via loadMore function
      return [];
    },
  });

  // Intersection observer trigger for loadMore
  useEffect(() => {
    // We need to bridge the gap between useInfiniteScroll and useProductSearch
    // Since useInfiniteScroll expects to control fetch, but useProductSearch encapsulates it
    // We'll manually trigger loadMore when we scroll to bottom in the UI
  }, []);

  const handleSearchQuery = (newQuery: string) => {
    setQuery(newQuery);
    // Update URL without reloading
    const params = new URLSearchParams(searchParams);
    if (newQuery) {
      params.set('q', newQuery);
    } else {
      params.delete('q');
    }
    router.replace(`/products?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="glass-card p-6 mb-8 space-y-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">통합 검색</h1>
            <p className="text-muted-foreground">
              쿠팡, 아마존 등 국내외 쇼핑몰을 한번에 검색하세요
            </p>
          </div>

          {/* Search Bar */}
          <SearchBar
            initialValue={query}
            placeholder="상품명, 브랜드, 카테고리로 검색..."
            onSearch={handleSearchQuery}
          />

          {/* Filters and Sort */}
          <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              availableBrands={['Apple', 'Samsung', 'LG', 'Nike', 'Adidas', 'Dyson']} // Simplified for mock
              showNegoDealFilter={false} // Adapters don't support nego deals yet
            />
            <div className="flex-1 flex justify-end">
              <SortSelector
                value={sort}
                onChange={setSort}
                availableOptions={['relevance', 'price-asc', 'price-desc', 'newest', 'discount']}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {results.length === 0 && !loading ? (
          <NoSearchResultsEmpty query={query || '전체 상품'} />
        ) : (
          <>
            <div className="mb-6 flex items-center gap-2">
              <div className="glass-card px-4 py-2 inline-block">
                <span className="text-sm font-medium">
                  검색 결과 <span className="text-primary font-bold text-lg">{total}</span>개
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((product, index) => {
                // Adapt ProductSearchResult to ProductCard props
                const cardProps = {
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  brand: product.brand || product.platform,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  imageUrl: product.image,
                  rating: product.rating || 0,
                  reviewCount: product.reviewCount || 0,
                  platform: product.platform
                };

                if (index === results.length - 1) {
                  return (
                    <div ref={lastItemRef} key={product.id}>
                      <ProductCard product={cardProps} />
                    </div>
                  );
                }
                return <ProductCard key={product.id} product={cardProps} />;
              })}
            </div>

            {/* Loading / Infinite Scroll Sentinel */}
            <div className="py-8 text-center flex justify-center">
              {loading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
              {!loading && hasMore && (
                <button
                  onClick={() => loadMore()}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  더 보기
                </button>
              )}
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
      <div className="container max-w-7xl mx-auto py-8 px-4 flex justify-center pt-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
