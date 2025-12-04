'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Negotiation, NegotiationEvent } from '@/types/negotiation';
import { logger } from '@/lib/logger';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useNegotiations() {
    const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchNegotiations = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/negotiations');
            if (!response.ok) throw new Error('Failed to fetch negotiations');

            const data = await response.json();

            // Type validation
            if (!data.success || !Array.isArray(data.negotiations)) {
                throw new Error('Invalid response format');
            }

            setNegotiations(data.negotiations as Negotiation[]);
        } catch (err) {
            setError(err as Error);
            console.error('Failed to fetch negotiations:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNegotiations();

        // Poll every 30 seconds
        const interval = setInterval(fetchNegotiations, 30000);
        return () => clearInterval(interval);
    }, []);

    return { negotiations, loading, error, refetch: fetchNegotiations };
}

export function useNegotiation(id: string) {
    const [negotiation, setNegotiation] = useState<Negotiation | null>(null);
    const [timeline, setTimeline] = useState<NegotiationEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const supabase = createClient();

    // Initial fetch
    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(`/api/negotiations/${id}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch negotiation: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch negotiation data');
            }

            setNegotiation(data.negotiation);
            setTimeline(data.timeline || []);
            setError(null);
        } catch (err) {
            logger.error('Error fetching negotiation:', err as Error);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Realtime subscription
    useEffect(() => {
        let isMounted = true;

        // Initial fetch
        fetchData();

        // Subscribe to changes
        const channel = supabase
            .channel(`negotiation:${id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'negotiations',
                    filter: `id=eq.${id}`,
                },
                (payload: RealtimePostgresChangesPayload<Negotiation>) => {
                    if (!isMounted) return;
                    console.log('Negotiation updated:', payload);
                    // Merge new data with existing state to preserve joined fields (like product)
                    setNegotiation((prev) => {
                        if (!prev) return payload.new as Negotiation;
                        return { ...prev, ...payload.new };
                    });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'negotiation_events',
                    filter: `negotiation_id=eq.${id}`,
                },
                (payload: RealtimePostgresChangesPayload<NegotiationEvent>) => {
                    if (!isMounted) return;
                    console.log('New event:', payload);
                    setTimeline((prev) => [payload.new as NegotiationEvent, ...prev]);
                }
            )
            .subscribe((status: string) => {
                if (!isMounted) return;
                setIsConnected(status === 'SUBSCRIBED');
                if (status === 'SUBSCRIBED') {
                    console.log('Realtime connected for negotiation:', id);
                }
            });

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
        };
    }, [id, fetchData, supabase]);

    return {
        negotiation,
        timeline,
        loading,
        error,
        isConnected,
        refresh: fetchData
    };
}
