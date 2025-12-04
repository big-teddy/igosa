/**
 * API Response Helpers
 * 표준화된 API 응답 생성
 */

import { NextResponse } from 'next/server';

export function success<T = any>(data: T, status: number = 200) {
    return NextResponse.json(
        {
            success: true,
            data,
        },
        { status }
    );
}

export function error(
    message: string,
    status: number = 400,
    details?: any
) {
    return NextResponse.json(
        {
            success: false,
            error: message,
            details,
        },
        { status }
    );
}

export function paginated<T = any>(
    data: T[],
    page: number,
    pageSize: number,
    total: number
) {
    return NextResponse.json({
        success: true,
        data,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        },
    });
}
