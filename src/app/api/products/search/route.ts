import { NextRequest, NextResponse } from 'next/server';
import { searchProducts, sortByLowestPrice, sortByRating, sortByReviewCount } from '@/lib/data/mock-products';
import { logger } from '@/lib/logger';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const sortBy = searchParams.get('sort') || 'price'; // price, rating, reviews
    const limit = parseInt(searchParams.get('limit') || '10');

    // 검색
    let products = searchProducts(query);

    // 정렬
    switch (sortBy) {
      case 'price':
        products = sortByLowestPrice(products);
        break;
      case 'rating':
        products = sortByRating(products);
        break;
      case 'reviews':
        products = sortByReviewCount(products);
        break;
    }

    // 제한
    products = products.slice(0, limit);

    // 각 제품의 최저가 계산
    const productsWithLowestPrice = products.map((product) => {
      const lowestPriceEntry = product.prices.reduce((prev, current) =>
        prev.total < current.total ? prev : current
      );

      return {
        ...product,
        lowestPrice: {
          platform: lowestPriceEntry.platform,
          total: lowestPriceEntry.total,
          url: lowestPriceEntry.url,
        },
      };
    });

    return NextResponse.json({
      success: true,
      products: productsWithLowestPrice,
      total: products.length,
      query,
    });
  } catch (error) {
    logger.error('Product search error', error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search products',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
