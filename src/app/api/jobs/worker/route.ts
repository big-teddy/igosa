import { NextRequest, NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs';
import { JobType } from '@/lib/background-jobs';

/**
 * Worker API - Receives jobs from QStash
 * This endpoint is public but protected by QStash signature verification.
 */
async function handler(req: NextRequest) {
    // 1. Parse Payload
    let body;
    try {
        body = await req.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { type, payload, timestamp } = body as { type: JobType, payload: any, timestamp: number };

    console.log(`[Worker] Received Job: ${type}`, { timestamp });

    try {
        // 2. Dispatch Logic
        switch (type) {
            case 'check-watchlist':
                // Import AutoNegoService dynamically to avoid circular deps
                const { autoNegoService } = await import('@/lib/services/auto-nego-service');
                const { productId } = payload;

                // Placeholder: fetch current price from DB or API
                const currentPrice = 100000; // TODO: Get real price

                const result = await autoNegoService.checkProduct(productId, currentPrice);
                console.log('check-watchlist result:', result);
                break;

            case 'auto-negotiate':
                // TODO: Implement AutoNegoService.triggerNegotiation(payload.negoId)
                console.log('Processing auto-negotiate job for:', payload);
                break;

            case 'send-notification':
                // TODO: Implement NotificationService.send(payload)
                console.log('Processing send-notification job:', payload);
                break;

            default:
                console.warn(`[Worker] Unknown job type: ${type}`);
                return NextResponse.json({ error: 'Unknown job type' }, { status: 400 });
        }

        return NextResponse.json({ success: true, processed: type });

    } catch (error) {
        console.error(`[Worker] Job Failed: ${type}`, error);
        return NextResponse.json({ error: 'Job execution failed', settings: error }, { status: 500 });
    }
}

// 3. Wrap with Signature Verification (only if QStash keys are configured)
// Using verifySignatureAppRouter for App Router support
const isQStashConfigured = process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY;

export const POST = isQStashConfigured
    ? verifySignatureAppRouter(handler)
    : handler; // Direct handler for development/build without QStash
