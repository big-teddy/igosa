'use client';

import { useState } from 'react';
import { Upload, X, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/product-card';
import type { ProductSearchResult } from '@/types/search';

interface ImageSearchResult {
    productInfo: {
        name: string;
        category?: string;
        brand?: string;
        features: string[];
        confidence: number;
    };
    searchQuery: string;
    results: ProductSearchResult[];
    total: number;
}

export function ImageSearch() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImageSearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setSelectedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSearch = async () => {
        if (!selectedImage) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Convert data URL to File
            const blob = await fetch(selectedImage).then((r) => r.blob());
            const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

            // Create FormData
            const formData = new FormData();
            formData.append('image', file);

            // Call API
            const response = await fetch('/api/search/image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Search failed');
            }

            const data: ImageSearchResult = await response.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Image search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSelectedImage(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            {!selectedImage && (
                <label className="glass-card p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors min-h-[300px]">
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">상품 사진 업로드</p>
                    <p className="text-sm text-muted-foreground text-center">
                        실제 상품 사진을 올리면 AI가 분석하여 최저가를 찾아드립니다
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </label>
            )}

            {/* Preview & Search */}
            {selectedImage && !result && (
                <div className="glass-card p-6 space-y-4">
                    <div className="relative">
                        <img
                            src={selectedImage}
                            alt="Selected product"
                            className="w-full max-h-96 object-contain rounded-lg"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={handleClear}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button
                        onClick={handleSearch}
                        disabled={loading}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                AI 분석 중...
                            </>
                        ) : (
                            <>
                                <Camera className="mr-2 h-4 w-4" />
                                이미지로 검색
                            </>
                        )}
                    </Button>

                    {error && (
                        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-sm text-destructive">
                            {error}
                        </div>
                    )}
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="space-y-6">
                    {/* AI Analysis */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4">🤖 AI 분석 결과</h3>
                        <div className="space-y-2 text-sm">
                            <p>
                                <span className="text-muted-foreground">상품명:</span>{' '}
                                <span className="font-medium">{result.productInfo.name}</span>
                            </p>
                            {result.productInfo.brand && (
                                <p>
                                    <span className="text-muted-foreground">브랜드:</span>{' '}
                                    <span className="font-medium">{result.productInfo.brand}</span>
                                </p>
                            )}
                            {result.productInfo.category && (
                                <p>
                                    <span className="text-muted-foreground">카테고리:</span>{' '}
                                    <span className="font-medium">{result.productInfo.category}</span>
                                </p>
                            )}
                            <p>
                                <span className="text-muted-foreground">신뢰도:</span>{' '}
                                <span className="font-medium">
                                    {(result.productInfo.confidence * 100).toFixed(0)}%
                                </span>
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={handleClear}
                        >
                            다른 이미지 검색
                        </Button>
                    </div>

                    {/* Product Results */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            검색 결과 ({result.total}개)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {result.results.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={{
                                        id: product.id,
                                        name: product.name,
                                        description: product.description,
                                        brand: product.brand || product.platform,
                                        price: product.price,
                                        originalPrice: product.originalPrice,
                                        imageUrl: product.image,
                                        rating: product.rating || 0,
                                        reviewCount: product.reviewCount || 0,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
