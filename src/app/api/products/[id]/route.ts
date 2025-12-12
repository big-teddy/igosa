import { NextRequest, NextResponse } from 'next/server';
import { mockProducts } from '@/lib/data/mock-products';
import { logger } from '@/lib/logger';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = mockProducts.find((p) => p.id === id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    // 최저가 계산
    const lowestPriceEntry = product.prices.reduce((prev, current) =>
      prev.total < current.total ? prev : current
    );

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        lowestPrice: {
          platform: lowestPriceEntry.platform,
          total: lowestPriceEntry.total,
          url: lowestPriceEntry.url,
        },
      },
    });
  } catch (error) {
    logger.error('Product fetch error', error as Error, { id: (await params).id });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
