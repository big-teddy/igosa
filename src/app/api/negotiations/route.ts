import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/negotiations
 * 협상 목록 조회
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Query parameters
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build query with product information
        let query = supabase
            .from('negotiations')
            .select(`
        *,
        product:products(
          id,
          name,
          image_url,
          current_price
        )
      `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Filter by status if provided
        if (status) {
            query = query.eq('status', status);
        }

        const { data: negotiations, error, count } = await query;

        if (error) {
            logger.error('Failed to fetch negotiations', error);
            return NextResponse.json(
                { error: 'Failed to fetch negotiations' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            negotiations: negotiations || [],
            total: count || 0,
            page: Math.floor(offset / limit) + 1,
            pageSize: limit,
        });

    } catch (error) {
        logger.error('Negotiations API error', error as Error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
