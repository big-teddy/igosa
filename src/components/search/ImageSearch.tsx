'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Upload, X, Loader2, Camera, Share2, History, Crop as CropIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/product-card';
import { toast } from 'sonner';
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

interface SearchHistoryItem {
    id: string;
    imageUrl: string;
    productName: string;
    timestamp: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export function ImageSearch() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [croppedImage, setCroppedImage] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop>();
    const [showCrop, setShowCrop] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImageSearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // Load search history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('imageSearchHistory');
        if (saved) {
            try {
                setSearchHistory(JSON.parse(saved));
            } catch {
                localStorage.removeItem('imageSearchHistory');
            }
        }
    }, []);

    // Drag and drop handler
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (!ACCEPTED_FORMATS.includes(file.type)) {
            toast.error('JPG, PNG, WebP 형식만 지원됩니다.');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error('파일 크기는 10MB 이하여야 합니다.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setSelectedImage(event.target?.result as string);
            setShowHistory(false);
        };
        reader.readAsDataURL(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
        },
        maxFiles: 1,
        multiple: false,
    });

    const handleSearch = async (imageToSearch?: string) => {
        const searchImage = imageToSearch || croppedImage || selectedImage;
        if (!searchImage) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const blob = await fetch(searchImage).then((r) => r.blob());
            const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('image', file);

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

            // Save to history
            const historyItem: SearchHistoryItem = {
                id: Date.now().toString(),
                imageUrl: searchImage,
                productName: data.productInfo.name,
                timestamp: Date.now(),
            };

            const newHistory = [historyItem, ...searchHistory].slice(0, 10); // Keep last 10
            setSearchHistory(newHistory);
            localStorage.setItem('imageSearchHistory', JSON.stringify(newHistory));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Image search failed');
            toast.error('검색에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSelectedImage(null);
        setCroppedImage(null);
        setResult(null);
        setError(null);
        setShowCrop(false);
    };

    const handleShare = async () => {
        if (!result) return;

        const shareData = {
            title: `${result.productInfo.name} 검색 결과`,
            text: `이거사에서 ${result.productInfo.name}을(를) 검색했어요! ${result.total}개 상품을 찾았습니다.`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success('공유되었습니다!');
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    handleCopyLink();
                }
            }
        } else {
            handleCopyLink();
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('링크가 복사되었습니다!');
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('imageSearchHistory');
        toast.success('검색 기록이 삭제되었습니다.');
    };

    return (
        <div className="space-y-6">
            {/* Upload Area with Drag & Drop */}
            {!selectedImage && !showHistory && (
                <div
                    {...getRootProps()}
                    className={`glass-card p-8 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[300px] ${isDragActive
                            ? 'border-primary bg-primary/5 scale-105'
                            : 'hover:border-primary/50'
                        }`}
                >
                    <input {...getInputProps()} />
                    <Upload className={`h-12 w-12 mb-4 transition-colors ${isDragActive ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                    <p className="text-lg font-medium mb-2">
                        {isDragActive ? '이미지를 놓아주세요' : '상품 사진 업로드'}
                    </p>
                    <p className="text-sm text-muted-foreground text-center">
                        드래그앤드롭 또는 클릭하여 업로드
                        <br />
                        <span className="text-xs">JPG, PNG, WebP (최대 10MB)</span>
                    </p>

                    {searchHistory.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowHistory(true);
                            }}
                        >
                            <History className="mr-2 h-4 w-4" />
                            최근 검색 ({searchHistory.length})
                        </Button>
                    )}
                </div>
            )}

            {/* Search History */}
            {showHistory && (
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <History className="h-5 w-5" />
                            최근 검색
                        </h3>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowHistory(false)}
                            >
                                닫기
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={clearHistory}
                            >
                                전체 삭제
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {searchHistory.map((item) => (
                            <div
                                key={item.id}
                                className="cursor-pointer group"
                                onClick={() => {
                                    handleSearch(item.imageUrl);
                                    setShowHistory(false);
                                }}
                            >
                                <div className="relative aspect-square rounded-lg overflow-hidden border group-hover:border-primary transition-colors">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.productName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <p className="text-sm mt-2 truncate">{item.productName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Preview & Crop */}
            {selectedImage && !result && (
                <div className="glass-card p-6 space-y-4">
                    <div className="relative">
                        {!showCrop ? (
                            <img
                                src={croppedImage || selectedImage}
                                alt="Selected product"
                                className="w-full max-h-96 object-contain rounded-lg"
                            />
                        ) : (
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                aspect={1}
                            >
                                <img
                                    src={selectedImage}
                                    alt="Crop preview"
                                    className="max-h-96"
                                />
                            </ReactCrop>
                        )}

                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={handleClear}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowCrop(!showCrop)}
                            className="flex-1"
                        >
                            <CropIcon className="mr-2 h-4 w-4" />
                            {showCrop ? '크롭 완료' : '이미지 자르기'}
                        </Button>

                        <Button
                            onClick={() => handleSearch()}
                            disabled={loading}
                            className="flex-1"
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
                    </div>

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
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
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
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleShare}
                                className="ml-4"
                            >
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClear}
                            >
                                다른 이미지 검색
                            </Button>
                        </div>
                    </div>

                    {/* Product Results */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            검색 결과 ({result.total}개)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
