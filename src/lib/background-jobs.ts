import { Client } from '@upstash/qstash';

// Initialize QStash Client
// We use non-null assertion because we validate env vars in instrumentation.ts
const client = new Client({
    token: process.env.QSTASH_TOKEN!,
});

/**
 * Supported Background Job Types
 */
export type JobType =
    | 'check-watchlist' // Watchlist price monitoring
    | 'auto-negotiate'  // Autonomous negotiation trigger
    | 'send-notification'; // Async push notification

/**
 * Schedule a background job via QStash
 * @param type Job type (determines worker logic)
 * @param payload JSON payload for the job
 * @param delaySeconds Optional delay in seconds
 */
export async function scheduleJob(type: JobType, payload: any, delaySeconds?: number) {
    const url = `${process.env.QSTASH_URL}/api/jobs/worker`;

    try {
        const result = await client.publishJSON({
            url,
            body: {
                type,
                payload,
                timestamp: Date.now(),
            },
            delay: delaySeconds,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error(`Failed to schedule job [${type}]:`, error);
        // In production, we might want to throw or log to Sentry
        return { success: false, error };
    }
}

/**
 * Schedule a recurring job (Cron)
 * @param type Job type
 * @param payload Payload
 * @param cron Cron expression (e.g., "0 * * * *")
 */
export async function scheduleRecurringJob(type: JobType, payload: any, cron: string) {
    // Note: QStash schedules are managed via dashboard or specific API, 
    // client.publishJSON doesn't directly create a permanent schedule config object in one go normally in older versions,
    // but v2 supports schedules.
    // For simplicity, we assume this is handled via dashboard for now, or we'd use client.schedules.create
    // Let's implement a wrapper for convenience if needed later.
    console.warn('scheduleRecurringJob is not fully implemented yet. Use QStash Dashboard.');
}
