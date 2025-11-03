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
    <Card className="group hover:shadow-lg transition-shadow overflow-hidden">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              {discount}%
            </div>
          )}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
            aria-label={isWishlisted ? "찜 취소" : "찜하기"}
          >
            <Heart
              className={`h-5 w-5 ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        </div>
      </Link>

      <CardContent className="p-4 space-y-2">
        <div className="text-xs text-muted-foreground">{product.brand}</div>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{product.rating}</span>
          <span className="text-muted-foreground">
            ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        <div className="space-y-1">
          {product.originalPrice && (
            <div className="text-xs text-muted-foreground line-through">
              ₩{product.originalPrice.toLocaleString()}
            </div>
          )}
          <div className="text-2xl font-bold text-primary">
            ₩{lowestPrice.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Package className="h-3 w-3" />
            <span>{platformName} 최저가</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/products/${product.id}`} className="w-full">
          <Button className="w-full">자세히 보기</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
