import { PaymentMethod, OrderStatus, ShippingMethod, ShippingAddress, CartItem, OrderItem, PaymentInfo, Order, CheckoutData, PaymentResult, PAYMENT_METHOD_LABELS, ORDER_STATUS_LABELS, SHIPPING_METHOD_INFO } from './payment';

// PortOne Integration Types

export interface PortOnePayment {
    id: string;
    negotiationId: string;
    userId: string;
    impUid: string;
    merchantUid: string;
    amount: number;
    status: 'ready' | 'paid' | 'failed' | 'cancelled';
    paymentMethod?: string;
    paidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentPrepareRequest {
    negotiationId: string;
    amount: number;
}

export interface PaymentPrepareResponse {
    merchantUid: string;
    amount: number;
    buyerEmail: string;
    buyerName: string;
    buyerTel?: string;
}

export interface PaymentCompleteRequest {
    impUid: string;
    merchantUid: string;
    negotiationId: string;
}

export interface PaymentCompleteResponse {
    success: boolean;
    payment: PortOnePayment;
}
