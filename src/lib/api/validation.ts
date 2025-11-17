/**
 * API Request Validation Utilities
 *
 * Provides Zod-based validation with proper error handling
 */

import { z, ZodError, ZodSchema } from 'zod';
import { ValidationError } from '@/lib/errors/api-error';

/**
 * Validate request body against Zod schema
 */
export async function validateBody<T>(
  schema: ZodSchema<T>,
  body: unknown
): Promise<T> {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const fields: Record<string, string[]> = {};

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!fields[path]) {
          fields[path] = [];
        }
        fields[path].push(err.message);
      });

      throw new ValidationError('Request validation failed', fields);
    }
    throw error;
  }
}

/**
 * Validate query parameters against Zod schema
 */
export function validateQuery<T>(
  schema: ZodSchema<T>,
  params: URLSearchParams
): T {
  try {
    const obj: Record<string, string> = {};
    params.forEach((value, key) => {
      obj[key] = value;
    });

    return schema.parse(obj);
  } catch (error) {
    if (error instanceof ZodError) {
      const fields: Record<string, string[]> = {};

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!fields[path]) {
          fields[path] = [];
        }
        fields[path].push(err.message);
      });

      throw new ValidationError('Query parameter validation failed', fields);
    }
    throw error;
  }
}

/**
 * Common Validation Schemas
 */
export const CommonSchemas = {
  uuid: z.string().uuid('Invalid UUID format'),
  email: z.string().email('Invalid email format'),
  url: z.string().url('Invalid URL format'),
  positiveInt: z.number().int().positive('Must be a positive integer'),
  price: z.number().int().min(0, 'Price must be non-negative'),
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
  timestamp: z.string().datetime('Invalid timestamp format'),
};

/**
 * Sanitize string input (prevent XSS)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Validate and sanitize array of strings
 */
export function sanitizeStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) {
    throw new ValidationError('Expected an array');
  }

  return input
    .filter((item) => typeof item === 'string')
    .map(sanitizeString)
    .slice(0, 100); // Limit array size
}
