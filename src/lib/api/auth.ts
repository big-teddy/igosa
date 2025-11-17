/**
 * Authentication Middleware for API Routes
 *
 * Provides reusable authentication utilities
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UnauthorizedError } from '@/lib/errors/api-error';
import type { User } from '@supabase/supabase-js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  user: User;
}

/**
 * Get authenticated user from request
 * Throws UnauthorizedError if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError('Authentication required');
  }

  return {
    id: user.id,
    email: user.email || '',
    user,
  };
}

/**
 * Get optional authenticated user from request
 * Returns null if not authenticated (doesn't throw)
 */
export async function getOptionalAuth(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      user,
    };
  } catch {
    return null;
  }
}

/**
 * Check if user has specific role
 */
export async function requireRole(
  request: NextRequest,
  requiredRole: string
): Promise<AuthenticatedUser> {
  const authUser = await requireAuth(request);
  const supabase = await createClient();

  // Check user metadata for role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authUser.id)
    .single();

  if (!profile || profile.role !== requiredRole) {
    throw new UnauthorizedError(`Required role: ${requiredRole}`);
  }

  return authUser;
}

/**
 * Extract Bearer token from Authorization header
 */
export function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}

/**
 * Verify API key from header
 */
export function requireApiKey(request: NextRequest): void {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = process.env.API_SECRET_KEY;

  if (!apiKey || !validApiKey || apiKey !== validApiKey) {
    throw new UnauthorizedError('Invalid API key');
  }
}
