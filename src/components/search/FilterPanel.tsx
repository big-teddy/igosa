'use client';

import { useState } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import {
  SearchFilters,
  ProductCategory,
  CATEGORY_LABELS,
  PRICE_RANGES,
  DISCOUNT_OPTIONS,
  PriceRange,
} from '@/types/search';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableBrands?: string[];
  showNegoDealFilter?: boolean;
}

export function FilterPanel({
  filters,
  onFiltersChange,
  availableBrands = [],
  showNegoDealFilter = true,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryChange = (category: ProductCategory) => {
    const current = filters.categories || [];
    let updated: ProductCategory[];

    if (category === 'all') {
      updated = ['all'];
    } else {
      // Remove 'all' if it exists
      const withoutAll = current.filter((c) => c !== 'all');

      if (withoutAll.includes(category)) {
        // Remove category
        updated = withoutAll.filter((c) => c !== category);
        if (updated.length === 0) updated = ['all'];
      } else {
        // Add category
        updated = [...withoutAll, category];
      }
    }

    onFiltersChange({ ...filters, categories: updated });
  };

  const handlePriceRangeChange = (range: PriceRange) => {
    onFiltersChange({ ...filters, priceRange: range });
  };

  const handleBrandChange = (brand: string) => {
    const current = filters.brands || [];
    const updated = current.includes(brand)
      ? current.filter((b) => b !== brand)
      : [...current, brand];

    onFiltersChange({ ...filters, brands: updated });
  };

  const handleDiscountChange = (minDiscount: number) => {
    onFiltersChange({ ...filters, minDiscount });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      categories: ['all'],
      priceRange: undefined,
      brands: [],
      minDiscount: 0,
      inStock: false,
      hasNegoDeal: false,
    });
  };

  const activeFilterCount = getActiveFilterCount();

  function getActiveFilterCount(): number {
    let count = 0;
    if (filters.categories && !filters.categories.includes('all')) count++;
    if (filters.priceRange && filters.priceRange.max !== Infinity) count++;
    if (filters.brands && filters.brands.length > 0) count++;
    if (filters.minDiscount && filters.minDiscount > 0) count++;
    if (filters.inStock) count++;
    if (filters.hasNegoDeal) count++;
    return count;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          필터
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[350px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>필터</SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Category Filter */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="font-semibold text-sm">카테고리</h3>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2">
              {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories?.includes(category) || false}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <Label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                    {CATEGORY_LABELS[category]}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Price Range Filter */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="font-semibold text-sm">가격대</h3>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <RadioGroup
                value={
                  filters.priceRange
                    ? `${filters.priceRange.min}-${filters.priceRange.max}`
                    : '0-Infinity'
                }
                onValueChange={(value) => {
                  const range = PRICE_RANGES.find(
                    (r) => `${r.range.min}-${r.range.max}` === value
                  );
                  if (range) handlePriceRangeChange(range.range);
                }}
              >
                {PRICE_RANGES.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={`${option.range.min}-${option.range.max}`}
                      id={`price-${index}`}
                    />
                    <Label htmlFor={`price-${index}`} className="text-sm cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CollapsibleContent>
          </Collapsible>

          {/* Brand Filter */}
          {availableBrands.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h3 className="font-semibold text-sm">브랜드</h3>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-2">
                {availableBrands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={filters.brands?.includes(brand) || false}
                      onCheckedChange={() => handleBrandChange(brand)}
                    />
                    <Label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
                      {brand}
                    </Label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Discount Filter */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="font-semibold text-sm">할인율</h3>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <RadioGroup
                value={String(filters.minDiscount || 0)}
                onValueChange={(value) => handleDiscountChange(Number(value))}
              >
                {DISCOUNT_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(option.value)} id={`discount-${option.value}`} />
                    <Label htmlFor={`discount-${option.value}`} className="text-sm cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CollapsibleContent>
          </Collapsible>

          {/* Platform Filter */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="font-semibold text-sm">쇼핑몰</h3>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2">
              {['Coupang', 'Amazon', 'AliExpress', '11st', 'Gmarket'].map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={`platform-${platform}`}
                    checked={filters.platforms?.includes(platform) || false}
                    onCheckedChange={(checked) => {
                      const current = filters.platforms || [];
                      const updated = checked
                        ? [...current, platform]
                        : current.filter((p) => p !== platform);
                      onFiltersChange({ ...filters, platforms: updated });
                    }}
                  />
                  <Label htmlFor={`platform-${platform}`} className="text-sm cursor-pointer">
                    {platform}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Rating Filter */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="font-semibold text-sm">평점</h3>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <RadioGroup
                value={String(filters.minRating || 0)}
                onValueChange={(value) => onFiltersChange({ ...filters, minRating: Number(value) })}
              >
                {[4, 3, 0].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(rating)} id={`rating-${rating}`} />
                    <Label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer">
                      {rating === 0 ? '전체' : `${rating}점 이상`}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CollapsibleContent>
          </Collapsible>

          {/* Other Filters */}
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={filters.inStock || false}
                onCheckedChange={(checked) =>
                  onFiltersChange({ ...filters, inStock: Boolean(checked) })
                }
              />
              <Label htmlFor="inStock" className="text-sm cursor-pointer">
                재고 있는 상품만
              </Label>
            </div>

            {showNegoDealFilter && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasNegoDeal"
                  checked={filters.hasNegoDeal || false}
                  onCheckedChange={(checked) =>
                    onFiltersChange({ ...filters, hasNegoDeal: Boolean(checked) })
                  }
                />
                <Label htmlFor="hasNegoDeal" className="text-sm cursor-pointer">
                  네고딜 진행중
                </Label>
              </div>
            )}
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={handleClearFilters} className="w-full gap-2">
            <X className="h-4 w-4" />
            필터 초기화
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
