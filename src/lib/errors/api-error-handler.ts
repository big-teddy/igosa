/**
 * API Error Handler
 * 통합 에러 처리 미들웨어
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export class APIError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'APIError';
    }
}

export function withErrorHandling(
    handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
    return async (request: NextRequest, context?: any) => {
        try {
            return await handler(request, context);
        } catch (error) {
            logger.error('API Error', error as Error, {
                url: request.url,
                method: request.method,
            });

            if (error instanceof APIError) {
                return NextResponse.json(
                    {
                        error: error.message,
                        code: error.code,
                        details: error.details,
                    },
                    { status: error.statusCode }
                );
            }

            return NextResponse.json(
                {
                    error: 'Internal server error',
                    message: (error as Error).message,
                },
                { status: 500 }
            );
        }
    };
}
