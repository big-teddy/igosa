import { NextRequest, NextResponse } from 'next/server';
import { likeService } from '@/lib/services/like-service';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/likes - Toggle like on a product
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { productId, targetPrice } = body;

        if (!productId) {
            return NextResponse.json({ error: 'productId is required' }, { status: 400 });
        }

        const result = await likeService.toggleLike(user.id, productId, targetPrice);

        return NextResponse.json({
            success: true,
            liked: result.liked,
            like: result.like,
        });
    } catch (error) {
        console.error('POST /api/likes failed:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * GET /api/likes - Get user's liked products
 */
export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const likes = await likeService.getUserLikes(user.id);

        return NextResponse.json({
            success: true,
            likes,
        });
    } catch (error) {
        console.error('GET /api/likes failed:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
