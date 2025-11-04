"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, TrendingDown, Package, Heart } from "lucide-react";
import { toggleWishlist, isInWishlist } from "@/lib/data/user-activity";

interface ProductCardProps {
  product: {
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
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setIsWishlisted(isInWishlist(product.id));
  }, [product.id]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleWishlist(product.id);
    setIsWishlisted(newState);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const lowestPrice = product.lowestPrice?.total || product.price;
  const platformName = {
    coupang: '쿠팡',
    naver: '네이버',
    '11st': '11번가',
  }[product.lowestPrice?.platform || 'coupang'] || '쿠팡';

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-white/20 hover:border-primary/30 backdrop-blur-sm bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-900/80 dark:to-slate-800/60">
      <Link href={`/products/${product.id}`} aria-label={`${product.name} 제품 상세보기`}>
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Gradient overlay for better readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm">
              <TrendingDown className="h-3 w-3" />
              {discount}%
            </div>
          )}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 w-9 h-9 glass-button rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
            aria-label={isWishlisted ? "찜 취소" : "찜하기"}
          >
            <Heart
              className={`h-5 w-5 transition-all ${
                isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600'
              }`}
            />
          </button>
        </div>
      </Link>

      <CardContent className="p-5 space-y-3 bg-gradient-to-b from-transparent to-white/30 dark:to-slate-900/30">
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
            {product.brand}
          </div>
        </div>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center gap-1.5 text-sm">
          <div className="flex items-center gap-0.5">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 drop-shadow" />
            <span className="font-semibold">{product.rating}</span>
          </div>
          <span className="text-muted-foreground text-xs">
            ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        <div className="space-y-1.5 pt-2">
          {product.originalPrice && (
            <div className="text-xs text-muted-foreground line-through">
              ₩{product.originalPrice.toLocaleString()}
            </div>
          )}
          <div className="text-2xl font-bold gradient-text">
            ₩{lowestPrice.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full">
              <Package className="h-3 w-3" />
              <span className="font-medium">{platformName} 최저가</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Link href={`/products/${product.id}`} className="w-full">
          <Button className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95">
            자세히 보기
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
