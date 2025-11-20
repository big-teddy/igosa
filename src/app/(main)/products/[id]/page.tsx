"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Package, TrendingDown, ExternalLink, Heart, ChevronLeft, Users, ThumbsUp, CheckCircle, Youtube, Instagram, Globe, Eye, Play } from "lucide-react";
import { mockProducts } from "@/lib/data/mock-products";
import { getProductReviews } from "@/lib/data/mock-reviews";
import { toggleWishlist, isInWishlist, addToRecentlyViewed } from "@/lib/data/user-activity";
import {
  getFriendPurchases,
  getSocialReviewsByProduct,
  UserProfile,
  SocialReview
} from "@/lib/data/mock-social";
import {
  getInfluencerReviewsByProduct,
  getInfluencerReviewSummary,
  InfluencerReview
} from "@/lib/data/mock-influencer";
import { RecommendationSection } from "@/components/recommendations/RecommendationSection";
import { recommendationService } from "@/lib/services/recommendation-service";
import { analytics } from "@/lib/monitoring/posthog";
import { SetTargetPriceWidget } from "@/components/price-tracking/SetTargetPriceWidget";
import { NegoDealWidget } from "@/components/negodeal/NegoDealWidget";
import { isFeatureEnabled, isFeatureEnabledForUser } from "@/lib/feature-flags";

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [friendPurchases, setFriendPurchases] = useState<UserProfile[]>([]);
  const [socialReviews, setSocialReviews] = useState<SocialReview[]>([]);
  const [influencerReviews, setInfluencerReviews] = useState<InfluencerReview[]>([]);
  const [influencerSummary, setInfluencerSummary] = useState<any>(null);

  // Mock user ID (실제로는 로그인 시스템에서 가져옴)
  const userId = 'user-1';

  // A/B 테스트: 롤아웃 비율 (환경변수로 제어)
  const rolloutPercent = typeof window !== 'undefined'
    ? parseInt(process.env.NEXT_PUBLIC_ROLLOUT_PERCENT || '100', 10)
    : 100;

  // 사용자별 Feature Flag 결정 (일관성 보장)
  const showUnifiedNegoDeal = isFeatureEnabledForUser(
    userId,
    'unified_negodeal',
    rolloutPercent
  );

  useEffect(() => {
    if (params.id) {
      const foundProduct = mockProducts.find(p => p.id === params.id);
      if (foundProduct) {
        setProduct(foundProduct);
        addToRecentlyViewed(foundProduct.id);
        setIsWishlisted(isInWishlist(foundProduct.id));
        setReviews(getProductReviews(foundProduct.id));

        // 소셜 데이터 로드
        setFriendPurchases(getFriendPurchases('user-1', foundProduct.id));
        setSocialReviews(getSocialReviewsByProduct(foundProduct.id));

        // 인플루언서 리뷰 로드
        setInfluencerReviews(getInfluencerReviewsByProduct(foundProduct.id));
        setInfluencerSummary(getInfluencerReviewSummary(foundProduct.id));

        // Track product view for recommendations
        recommendationService.trackInteraction(userId, 'view', {
          productId: foundProduct.id,
          category: foundProduct.category,
          brand: foundProduct.brand,
        });

        // Track product view analytics
        const lowestPrice = Math.min(...foundProduct.prices.map((p: any) => p.total));
        analytics.trackProductView(foundProduct.id, foundProduct.name, lowestPrice);

        // Track A/B test variant assignment
        analytics.track('ab_test_variant_assigned', {
          experiment_name: 'unified_negodeal_rollout',
          variant: showUnifiedNegoDeal ? 'unified' : 'legacy',
          rollout_percent: rolloutPercent,
          user_id: userId,
          product_id: foundProduct.id,
        });
      }
    }
  }, [params.id, showUnifiedNegoDeal, rolloutPercent]);

  const handleToggleWishlist = () => {
    if (product) {
      const newState = toggleWishlist(product.id);
      setIsWishlisted(newState);
    }
  };

  if (!product) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="text-center py-20">
          <p className="text-muted-foreground">제품을 찾을 수 없습니다.</p>
          <Link href="/products" className="mt-4 inline-block">
            <Button>
              <ChevronLeft className="h-4 w-4 mr-2" />
              제품 목록으로
            </Button>
          </Link>
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
              ₩{product.prices[0].total.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{platformNames[product.prices[0].platform as keyof typeof platformNames]} 최저가</span>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={handleToggleWishlist}
                className="flex-1"
              >
                <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                {isWishlisted ? '찜 취소' : '찜하기'}
              </Button>
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
                    <dd className="font-medium">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* NegoDeal Widget - A/B Test with Gradual Rollout */}
      <div className="mb-8">
        {showUnifiedNegoDeal ? (
          <NegoDealWidget
            productId={product.id}
            productName={product.name}
            currentPrice={Math.min(...product.prices.map((p: any) => p.total))}
            minPrice={Math.min(...product.prices.map((p: any) => p.total)) * 0.9}
            avgPrice={product.prices.reduce((acc: number, p: any) => acc + p.total, 0) / product.prices.length}
          />
        ) : (
          <SetTargetPriceWidget
            productId={product.id}
            productName={product.name}
            currentPrice={Math.min(...product.prices.map((p: any) => p.total))}
            minPrice={Math.min(...product.prices.map((p: any) => p.total)) * 0.9}
            avgPrice={product.prices.reduce((acc: number, p: any) => acc + p.total, 0) / product.prices.length}
          />
        )}
      </div>

      {/* Social Proof - Friend Purchases */}
      {friendPurchases.length > 0 && (
        <Card className="mb-8 bg-gradient-to-r from-primary/5 via-primary/3 to-background border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-primary">{friendPurchases.length}명의 친구</span>가 이 제품을 구매했어요
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {friendPurchases.map((friend) => (
                <Link key={friend.id} href={`/users/${friend.username}`}>
                  <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-full border hover:border-primary transition-colors cursor-pointer">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center overflow-hidden">
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.name} className="w-full h-full" />
                      ) : (
                        <Users className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{friend.name}</span>
                    {friend.trustScore >= 85 && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Reviews - Friend Reviews */}
      {socialReviews.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5" />
              친구 리뷰
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {socialReviews.map((review) => (
              <div key={review.id} className="p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
                <div className="flex items-start gap-3 mb-3">
                  <Link href={`/users/${review.userId}`}>
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80">
                      {review.userAvatar ? (
                        <img src={review.userAvatar} alt={review.userName} className="w-full h-full" />
                      ) : (
                        <Users className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{review.userName}</span>
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          구매 인증
                        </Badge>
                      )}
                      {review.recommended && (
                        <Badge variant="outline" className="text-xs border-green-600 text-green-600">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          추천
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-1">
                        {new Date(review.timestamp).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm mb-3">{review.content}</p>
                    {review.pros.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs font-semibold text-green-600 mb-1">장점</div>
                        <div className="flex flex-wrap gap-1">
                          {review.pros.map((pro, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-green-600/30 text-green-700">
                              {pro}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {review.cons.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs font-semibold text-red-600 mb-1">단점</div>
                        <div className="flex flex-wrap gap-1">
                          {review.cons.map((con, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-red-600/30 text-red-700">
                              {con}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {review.likesCount}
                      </span>
                      <span>도움됨 {review.helpfulCount}</span>
                      <span>댓글 {review.commentsCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Influencer Reviews */}
      {influencerReviews.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-red-600" />
                인플루언서 & 유튜버 리뷰
              </CardTitle>
              {influencerSummary && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {(influencerSummary.totalViews / 10000).toFixed(0)}만 조회
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {influencerSummary.recommendPercent}% 추천
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {influencerReviews.map((review) => {
              const getPlatformIcon = (platform: string) => {
                switch (platform) {
                  case 'youtube':
                    return <Youtube className="h-4 w-4 text-red-600" />;
                  case 'instagram':
                    return <Instagram className="h-4 w-4 text-pink-600" />;
                  case 'blog':
                    return <Globe className="h-4 w-4 text-blue-600" />;
                  default:
                    return <Globe className="h-4 w-4" />;
                }
              };

              return (
                <div key={review.id} className="p-4 bg-gradient-to-r from-muted/50 to-background rounded-lg border">
                  <div className="flex items-start gap-4 mb-3">
                    {/* Thumbnail */}
                    {review.thumbnail && (
                      <div className="w-32 h-20 bg-muted rounded overflow-hidden flex-shrink-0 relative group cursor-pointer">
                        <img
                          src={review.thumbnail}
                          alt={review.productName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center overflow-hidden">
                          {review.influencerAvatar ? (
                            <img src={review.influencerAvatar} alt={review.influencerName} className="w-full h-full" />
                          ) : (
                            <Users className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{review.influencerName}</span>
                          {getPlatformIcon(review.platform)}
                          <span className="text-xs text-muted-foreground">
                            {(review.influencerFollowers / 10000).toFixed(1)}만 팔로워
                          </span>
                        </div>
                        {review.rating && (
                          <div className="flex items-center gap-1 ml-auto">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{review.rating}.0</span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm mb-3 font-medium">{review.summary}</p>

                      {/* Key Points */}
                      {review.keyPoints.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {review.keyPoints.map((point, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                ✓ {point}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pros & Cons */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {review.pros.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-green-600 mb-1">장점</div>
                            <div className="flex flex-wrap gap-1">
                              {review.pros.slice(0, 2).map((pro, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-green-600/30 text-green-700">
                                  {pro}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {review.cons.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-red-600 mb-1">단점</div>
                            <div className="flex flex-wrap gap-1">
                              {review.cons.slice(0, 2).map((con, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-red-600/30 text-red-700">
                                  {con}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Stats & Link */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          {review.viewCount && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {(review.viewCount / 10000).toFixed(0)}만
                            </span>
                          )}
                          {review.likeCount && (
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {(review.likeCount / 1000).toFixed(1)}K
                            </span>
                          )}
                          <span>{new Date(review.publishedAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                        <a
                          href={review.contentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          원본 보기 <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Price Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>가격 비교</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {product.prices.map((priceInfo: any, index: number) => (
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

      {/* Similar Products Recommendations */}
      <div className="mt-12">
        <RecommendationSection
          userId={userId}
          productId={product.id}
          type="similar_products"
          limit={6}
          showHeader={true}
        />
      </div>

      {/* Personalized Recommendations */}
      <div className="mt-12">
        <RecommendationSection
          userId={userId}
          type="personalized"
          limit={6}
          showHeader={true}
        />
      </div>
    </div>
  );
}
