'use client';

import { NegotiationEvent } from '@/types/negotiation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Target,
    Calculator,
    CheckCircle2,
    Mail,
    XCircle,
    Clock,
    TrendingUp,
    Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface NegotiationTimelineProps {
    events: NegotiationEvent[];
}

export function NegotiationTimeline({ events }: NegotiationTimelineProps) {
    const getEventConfig = (type: string) => {
        switch (type) {
            case 'demand_milestone':
                return { icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' };
            case 'ai_analysis':
                return { icon: Calculator, color: 'text-purple-500', bg: 'bg-purple-50' };
            case 'ai_proposal':
                return { icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50' };
            case 'seller_response':
                return { icon: Mail, color: 'text-orange-500', bg: 'bg-orange-50' };
            case 'deal_accepted':
                return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' };
            case 'deal_rejected':
                return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' };
            default:
                return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50' };
        }
    };

    const getImpactBadge = (impact: string) => {
        switch (impact) {
            case 'positive':
                return <Badge className="bg-green-500 text-white">긍정적</Badge>;
            case 'negative':
                return <Badge className="bg-red-500 text-white">부정적</Badge>;
            default:
                return <Badge variant="outline">중립</Badge>;
        }
    };

    if (events.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    아직 이벤트가 없습니다.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    협상 타임라인
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative space-y-4">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                    {events.map((event, index) => {
                        const config = getEventConfig(event.eventType);
                        const Icon = config.icon;

                        return (
                            <div key={event.id} className="relative flex gap-4">
                                {/* Icon */}
                                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${config.bg}`}>
                                    <Icon className={`w-4 h-4 ${config.color}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-4">
                                    <div className="flex items-start justify-between mb-1">
                                        <p className="font-medium">{event.message}</p>
                                        {getImpactBadge(event.impact)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(event.createdAt), {
                                            addSuffix: true,
                                            locale: ko,
                                        })}
                                    </p>

                                    {/* Event data */}
                                    {event.eventData && Object.keys(event.eventData).length > 0 && (
                                        <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                                            {Object.entries(event.eventData).map(([key, value]) => (
                                                <div key={key} className="flex justify-between">
                                                    <span className="text-muted-foreground">{key}:</span>
                                                    <span className="font-medium">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
