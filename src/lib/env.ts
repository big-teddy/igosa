import { z } from 'zod';

const serverSchema = z.object({
    OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
    PORTONE_API_KEY: z.string().optional(), // Made optional as it might not be strictly required for app start if payments aren't immediate
    PORTONE_API_SECRET: z.string().optional(),
    CRON_SECRET: z.string().optional(), // Optional for dev, required for prod ideally
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    QSTASH_URL: z.string().url('QSTASH_URL is required').optional(), // Optional during setup, required for workers
    QSTASH_TOKEN: z.string().min(1, 'QSTASH_TOKEN is required').optional(),
});

const clientSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
    NEXT_PUBLIC_PORTONE_STORE_ID: z.string().optional(),
    NEXT_PUBLIC_TOSS_CLIENT_KEY: z.string().optional(),
    NEXT_PUBLIC_ROLLOUT_PERCENT: z.string().transform(Number).optional(),
    // Feature flags
    NEXT_PUBLIC_ENABLE_UNIFIED_NEGODEAL: z.string().transform((val) => val === 'true').optional(),
    NEXT_PUBLIC_ENABLE_NEGODEAL_V2_PAGE: z.string().transform((val) => val === 'true').optional(),
    NEXT_PUBLIC_ENABLE_NEW_NAVIGATION: z.string().transform((val) => val === 'true').optional(),
    NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS: z.string().transform((val) => val === 'true').optional(),
});

/**
 * Validates environment variables and throws an error if any required variables are missing.
 * This should be called at application startup (e.g., in instrumentation.ts).
 */
export function validateEnv() {
    const env = { ...process.env };

    // Validate Server Env (only on server)
    const isServer = typeof window === 'undefined';

    if (isServer) {
        const parsedServer = serverSchema.safeParse(env);
        if (!parsedServer.success) {
            console.error('❌ Server Environment Validation Failed');
            console.error(parsedServer.error.flatten().fieldErrors);
            // In production, we might want to throw to prevent startup
            // if (process.env.NODE_ENV === 'production') {
            //   throw new Error('Invalid server environment variables');
            // }
        }
    }

    // Validate Client Env (always) 
    // Note: Client envs are inlined by Next.js, but process.env works in some contexts
    const parsedClient = clientSchema.safeParse(env);
    if (!parsedClient.success) {
        console.error('❌ Client Environment Validation Failed');
        console.error(parsedClient.error.flatten().fieldErrors);
        // In production, we might want to throw
        // if (process.env.NODE_ENV === 'production') {
        //   throw new Error('Invalid client environment variables');
        // }
    }

    if (isServer && (!serverSchema.safeParse(env).success || !clientSchema.safeParse(env).success)) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('❌ Invalid environment variables. Check logs for details.');
        }
    }
}

// Export typed env for usage in code (Optional usage pattern)
// export const env = { ...serverSchema.parse(process.env), ...clientSchema.parse(process.env) };
