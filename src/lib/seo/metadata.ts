import type { Metadata } from 'next';

interface SEOProps {
    title: string;
    description: string;
    path?: string;
    image?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://igosa.vercel.app';
const DEFAULT_IMAGE = '/og-image.svg';

/**
 * SEO 메타데이터 생성 유틸리티
 */
export function generateSEO({
    title,
    description,
    path = '',
    image = DEFAULT_IMAGE,
}: SEOProps): Metadata {
    const fullTitle = title.includes('이거사') ? title : `${title} | 이거사`;
    const url = `${BASE_URL}${path}`;
    const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;

    return {
        title: fullTitle,
        description,
        metadataBase: new URL(BASE_URL),
        openGraph: {
            title: fullTitle,
            description,
            url,
            siteName: '이거사 - AI 가격 협상 플랫폼',
            images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
            type: 'website',
            locale: 'ko_KR',
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [imageUrl],
        },
        robots: {
            index: true,
            follow: true,
        },
        alternates: {
            canonical: url,
        },
    };
}

/**
 * 상품 페이지용 SEO
 */
export function generateProductSEO(product: {
    name: string;
    description?: string;
    price: number;
    image?: string;
    id: string;
}): Metadata {
    const desc = product.description ||
        `${product.name} - 최저가 ${product.price.toLocaleString()}원`;
    return generateSEO({
        title: product.name,
        description: desc,
        path: `/products/${product.id}`,
        image: product.image,
    });
}

/**
 * 네고딜 페이지용 SEO
 */
export function generateDealSEO(deal: {
    productName: string;
    currentPrice: number;
    participants: number;
    id: string;
}): Metadata {
    const desc = `${deal.participants}명 참여 중! ${deal.currentPrice.toLocaleString()}원에 구매하세요.`;
    return generateSEO({
        title: `${deal.productName} 공동구매`,
        description: desc,
        path: `/nego-deals/${deal.id}`,
    });
}
