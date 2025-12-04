'use client';

import { useState, useEffect } from 'react';
import { Negotiation, NegotiationEvent } from '@/types/negotiation';

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

    const fetchNegotiation = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/negotiations/${id}`);
            if (!response.ok) throw new Error('Failed to fetch negotiation');

            const data = await response.json();

            // Type validation
            if (!data.success || !data.negotiation) {
                throw new Error('Invalid response format');
            }

            setNegotiation(data.negotiation as Negotiation);
            setTimeline((data.timeline || []) as NegotiationEvent[]);
        } catch (err) {
            setError(err as Error);
            console.error('Failed to fetch negotiation:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        if (id) {
            fetchNegotiation();

            // Poll every 30 seconds for real-time updates
            const interval = setInterval(() => {
                if (isMounted) {
                    fetchNegotiation();
                }
            }, 30000);

            return () => {
                isMounted = false;
                clearInterval(interval);
            };
        }
    }, [id]);

    return { negotiation, timeline, loading, error, refetch: fetchNegotiation };
}
