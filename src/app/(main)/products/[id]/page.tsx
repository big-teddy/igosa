"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Package, TrendingDown, ExternalLink } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  specs: Record<string, string>;
  prices: {
    platform: string;
    price: number;
    shipping: number;
    total: number;
    deliveryType: string;
    deliveryDays: number;
    inStock: boolean;
    url: string;
  }[];
  lowestPrice?: {
    platform: string;
    total: number;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="text-center py-20">
          <p className="text-muted-foreground">제품을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const platformNames = {
    coupang: '쿠팡',
    naver: '네이버',
    '11st': '11번가',
  } as const;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Product Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="text-sm text-muted-foreground mb-2">
              {product.brand} • {product.category}
            </div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-lg">{product.rating}</span>
            </div>
            <span className="text-muted-foreground">
              ({product.reviewCount.toLocaleString()}개 리뷰)
            </span>
          </div>

          {/* Price */}
          <div className="space-y-2 p-6 bg-muted/50 rounded-lg">
            {product.originalPrice && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground line-through">
                  ₩{product.originalPrice.toLocaleString()}
                </span>
                {discount > 0 && (
                  <div className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    {discount}%
                  </div>
                )}
              </div>
            )}
            <div className="text-4xl font-bold text-primary">
              ₩{product.lowestPrice?.total.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{platformNames[product.lowestPrice?.platform as keyof typeof platformNames]} 최저가</span>
            </div>
          </div>

          {/* Specs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">제품 사양</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b last:border-0">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Price Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>가격 비교</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {product.prices.map((priceInfo, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  priceInfo.total === product.lowestPrice?.total
                    ? "border-primary bg-primary/5"
                    : "border-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg">
                        {platformNames[priceInfo.platform as keyof typeof platformNames]}
                      </span>
                      {priceInfo.total === product.lowestPrice?.total && (
                        <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-bold">
                          최저가
                        </span>
                      )}
                      {!priceInfo.inStock && (
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs">
                          품절
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>제품가: ₩{priceInfo.price.toLocaleString()}</div>
                      <div>배송비: {priceInfo.shipping === 0 ? '무료' : `₩${priceInfo.shipping.toLocaleString()}`}</div>
                      <div>
                        배송: {priceInfo.deliveryType} ({priceInfo.deliveryDays}일)
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-2xl font-bold">
                      ₩{priceInfo.total.toLocaleString()}
                    </div>
                    <Button
                      size="sm"
                      disabled={!priceInfo.inStock}
                      className="w-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      구매하기
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
