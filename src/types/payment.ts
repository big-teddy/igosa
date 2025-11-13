/**
 * Payment and Order Types
 * 결제 및 주문 관리 시스템
 */

export type PaymentMethod =
  | 'card'          // 신용/체크카드
  | 'bank_transfer' // 계좌이체
  | 'virtual_account' // 가상계좌
  | 'phone'         // 휴대폰 결제
  | 'kakao_pay'     // 카카오페이
  | 'naver_pay'     // 네이버페이
  | 'toss';         // 토스페이

export type OrderStatus =
  | 'pending'       // 결제 대기
  | 'paid'          // 결제 완료
  | 'processing'    // 상품 준비 중
  | 'shipped'       // 배송 중
  | 'delivered'     // 배송 완료
  | 'cancelled'     // 주문 취소
  | 'refunded';     // 환불 완료

export type ShippingMethod =
  | 'standard'      // 일반 배송 (무료)
  | 'express'       // 빠른 배송 (+3,000원)
  | 'dawn';         // 새벽 배송 (+5,000원)

export interface ShippingAddress {
  id?: string;
  name: string;          // 받는 사람
  phone: string;         // 전화번호
  zipCode: string;       // 우편번호
  address: string;       // 주소
  addressDetail: string; // 상세주소
  message?: string;      // 배송 메시지
  isDefault?: boolean;   // 기본 배송지
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  dealId?: string;       // 네고딜 상품인 경우
  options?: {
    name: string;
    value: string;
  }[];
}

export interface OrderItem extends CartItem {
  subtotal: number;      // price * quantity
  discount: number;      // 할인 금액
  finalPrice: number;    // 최종 금액
}

export interface PaymentInfo {
  method: PaymentMethod;
  cardNumber?: string;   // 카드번호 (마스킹)
  cardCompany?: string;  // 카드사
  installment?: number;  // 할부 개월 (0 = 일시불)
  accountBank?: string;  // 은행명 (계좌이체/가상계좌)
  accountNumber?: string; // 계좌번호 (마스킹)
  approvalNumber?: string; // 승인번호
  transactionId?: string;  // 결제 거래 ID
}

export interface Order {
  id: string;
  userId: string;

  // 주문 정보
  orderNumber: string;   // 주문번호
  orderDate: string;     // 주문일시
  status: OrderStatus;

  // 상품 정보
  items: OrderItem[];

  // 금액 정보
  subtotal: number;      // 소계
  shippingFee: number;   // 배송비
  discount: number;      // 총 할인
  totalAmount: number;   // 최종 결제 금액

  // 배송 정보
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  trackingNumber?: string; // 운송장 번호

  // 결제 정보
  paymentInfo: PaymentInfo;
  paidAt?: string;       // 결제일시

  // 추가 정보
  memo?: string;         // 주문 메모

  // 취소/환불
  cancelledAt?: string;
  refundedAt?: string;
  cancelReason?: string;
}

export interface CheckoutData {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  usePoints?: number;    // 사용 포인트
  couponId?: string;     // 쿠폰 ID
  memo?: string;         // 주문 메모
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  message: string;
  transactionId?: string;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: '신용/체크카드',
  bank_transfer: '계좌이체',
  virtual_account: '가상계좌',
  phone: '휴대폰 결제',
  kakao_pay: '카카오페이',
  naver_pay: '네이버페이',
  toss: '토스페이',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '결제 대기',
  paid: '결제 완료',
  processing: '상품 준비 중',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '주문 취소',
  refunded: '환불 완료',
};

export const SHIPPING_METHOD_INFO: Record<ShippingMethod, { label: string; fee: number; description: string }> = {
  standard: {
    label: '일반 배송',
    fee: 0,
    description: '2-3일 내 배송',
  },
  express: {
    label: '빠른 배송',
    fee: 3000,
    description: '1-2일 내 배송',
  },
  dawn: {
    label: '새벽 배송',
    fee: 5000,
    description: '내일 오전 7시 전 도착',
  },
};
