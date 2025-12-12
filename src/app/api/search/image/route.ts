import { NextRequest, NextResponse } from 'next/server';
import { imageSearchService } from '@/lib/services/image-search-service';

/**
 * POST /api/search/image - Search products by image
 */
export async function POST(req: NextRequest) {
    try {
        // Parse form data
        const formData = await req.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // Convert to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');

        // Search by image
        const result = await imageSearchService.searchByImage(base64Image);

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error('POST /api/search/image failed:', error);

        // Handle specific errors
        if (error instanceof Error && error.message.includes('OpenAI')) {
            return NextResponse.json(
                { error: 'AI 분석 실패. 다른 이미지를 시도해주세요.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Image search failed' },
            { status: 500 }
        );
    }
}
