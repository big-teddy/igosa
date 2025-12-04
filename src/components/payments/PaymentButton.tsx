'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { Negotiation } from '@/types/negotiation';
import type { PaymentPrepareResponse, PaymentCompleteResponse } from '@/types/portone';

interface PaymentButtonProps {
    negotiation: Negotiation;
    className?: string;
    size?: 'default' | 'sm' | 'lg';
}

declare global {
    interface Window {
        IMP: any;
    }
}

export function PaymentButton({ negotiation, className = '', size = 'lg' }: PaymentButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Initialize PortOne SDK
        if (typeof window !== 'undefined' && window.IMP) {
            window.IMP.init(process.env.NEXT_PUBLIC_PORTONE_STORE_ID);
        }
    }, []);

    const handlePayment = async () => {
        if (!negotiation.aiProposedPrice) {
            toast.error('결제할 금액 정보가 없습니다.');
            return;
        }

        setLoading(true);
        try {
            // 1. Prepare payment (get merchant_uid)
            const prepareRes = await fetch('/api/payments/prepare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    negotiationId: negotiation.id,
                    amount: negotiation.aiProposedPrice,
                }),
            });

            if (!prepareRes.ok) {
                throw new Error('결제 준비 중 오류가 발생했습니다.');
            }

            const prepareData: PaymentPrepareResponse = await prepareRes.json();

            // 2. Request payment to PortOne
            if (!window.IMP) {
                throw new Error('결제 모듈을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.');
            }

            const data = {
                pg: 'kakaopay', // Default PG (can be configured)
                pay_method: 'card',
                merchant_uid: prepareData.merchantUid,
                name: (negotiation as any).product?.name || 'AI 네고딜 상품',
                amount: prepareData.amount,
                buyer_email: prepareData.buyerEmail,
                buyer_name: prepareData.buyerName,
                buyer_tel: prepareData.buyerTel,
                m_redirect_url: `${window.location.origin}/negotiations/${negotiation.id}/payment-result`, // For mobile
            };

            window.IMP.request_pay(data, async (rsp: any) => {
                if (rsp.success) {
                    // 3. Verify payment on server
                    try {
                        const completeRes = await fetch('/api/payments/complete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                impUid: rsp.imp_uid,
                                merchantUid: rsp.merchant_uid,
                                negotiationId: negotiation.id,
                            }),
                        });

                        if (!completeRes.ok) {
                            const errorData = await completeRes.json();
                            throw new Error(errorData.error || '결제 검증에 실패했습니다.');
                        }

                        const completeData: PaymentCompleteResponse = await completeRes.json();

                        toast.success('결제가 완료되었습니다!');
                        router.refresh();

                    } catch (verifyError: any) {
                        console.error('Payment verification failed:', verifyError);
                        toast.error(`결제 검증 실패: ${verifyError.message}`);
                        // Note: Payment might have succeeded at PG but failed verification.
                        // Should handle this case (e.g., show support contact)
                    }
                } else {
                    console.error('Payment failed:', rsp);
                    toast.error(`결제 실패: ${rsp.error_msg}`);
                }
                setLoading(false);
            });

        } catch (error: any) {
            console.error('Payment error:', error);
            toast.error(error.message || '결제 중 오류가 발생했습니다.');
            setLoading(false);
        }
    };

    return (
        <Button
            className={`w-full ${className}`}
            size={size}
            onClick={handlePayment}
            disabled={loading || negotiation.status === 'accepted'} // Disable if already accepted/paid
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    결제 처리 중...
                </>
            ) : (
                <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {negotiation.status === 'accepted' ? '결제 완료' : '구매하기'}
                </>
            )}
        </Button>
    );
}
