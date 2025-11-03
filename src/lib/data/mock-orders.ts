export interface Order {
  id: string;
  orderId: string;
  dealId: string;
  productName: string;
  productImage: string;
  brand: string;
  platform: 'coupang' | 'naver' | '11st';
  quantity: number;
  originalPrice: number;
  discountedPrice: number;
  totalAmount: number;
  discountRate: number;
  savings: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipping' | 'delivered' | 'cancelled' | 'refunded';
  paymentMethod: string;
  paymentKey: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  deliveryDate?: string;
  trackingNumber?: string;
  negoDealStatus: 'waiting' | 'goal_reached' | 'failed';
  currentParticipants: number;
  targetParticipants: number;
}

export const mockOrders: Order[] = [
  {
    id: '1',
    orderId: 'ORDER_1738476234567',
    dealId: '1',
    productName: '나이키 에어 줌 페가수스 40',
    productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    brand: '나이키',
    platform: 'coupang',
    quantity: 1,
    originalPrice: 149000,
    discountedPrice: 126650,
    totalAmount: 126650,
    discountRate: 15,
    savings: 22350,
    status: 'confirmed',
    paymentMethod: '카드결제',
    paymentKey: 'tgen_payment_key_12345',
    orderDate: '2025-02-01T10:30:00',
    expectedDeliveryDate: '2025-02-05',
    negoDealStatus: 'goal_reached',
    currentParticipants: 10,
    targetParticipants: 10,
  },
  {
    id: '2',
    orderId: 'ORDER_1738390123456',
    dealId: '2',
    productName: '삼성 갤럭시 버즈3 프로',
    productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
    brand: '삼성전자',
    platform: 'naver',
    quantity: 1,
    originalPrice: 298000,
    discountedPrice: 253300,
    totalAmount: 253300,
    discountRate: 15,
    savings: 44700,
    status: 'pending',
    paymentMethod: '카드결제',
    paymentKey: 'tgen_payment_key_23456',
    orderDate: '2025-01-31T15:20:00',
    negoDealStatus: 'waiting',
    currentParticipants: 7,
    targetParticipants: 10,
  },
  {
    id: '3',
    orderId: 'ORDER_1738217234567',
    dealId: '3',
    productName: '다이슨 에어랩 컴플리트',
    productImage: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800',
    brand: '다이슨',
    platform: '11st',
    quantity: 1,
    originalPrice: 699000,
    discountedPrice: 594150,
    totalAmount: 594150,
    discountRate: 15,
    savings: 104850,
    status: 'shipping',
    paymentMethod: '간편결제',
    paymentKey: 'tgen_payment_key_34567',
    orderDate: '2025-01-29T09:45:00',
    expectedDeliveryDate: '2025-02-03',
    trackingNumber: '123456789012',
    negoDealStatus: 'goal_reached',
    currentParticipants: 20,
    targetParticipants: 20,
  },
  {
    id: '4',
    orderId: 'ORDER_1738044123456',
    dealId: '4',
    productName: '애플 에어팟 프로 2세대',
    productImage: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800',
    brand: '애플',
    platform: 'coupang',
    quantity: 1,
    originalPrice: 359000,
    discountedPrice: 305150,
    totalAmount: 305150,
    discountRate: 15,
    savings: 53850,
    status: 'delivered',
    paymentMethod: '카드결제',
    paymentKey: 'tgen_payment_key_45678',
    orderDate: '2025-01-27T14:10:00',
    expectedDeliveryDate: '2025-01-30',
    deliveryDate: '2025-01-30T11:20:00',
    trackingNumber: '987654321098',
    negoDealStatus: 'goal_reached',
    currentParticipants: 15,
    targetParticipants: 15,
  },
];

export function getUserOrders(userEmail?: string): Order[] {
  // 실제로는 userEmail로 필터링
  return mockOrders;
}

export function getOrderById(orderId: string): Order | undefined {
  return mockOrders.find(order => order.orderId === orderId);
}

export function getOrderStatusLabel(status: Order['status']): string {
  const statusLabels: Record<Order['status'], string> = {
    pending: '결제 대기',
    confirmed: '결제 완료',
    preparing: '상품 준비중',
    shipping: '배송중',
    delivered: '배송 완료',
    cancelled: '주문 취소',
    refunded: '환불 완료',
  };
  return statusLabels[status];
}

export function getNegoDealStatusLabel(status: Order['negoDealStatus']): string {
  const statusLabels: Record<Order['negoDealStatus'], string> = {
    waiting: '목표 달성 대기중',
    goal_reached: '목표 달성 완료',
    failed: '목표 미달성',
  };
  return statusLabels[status];
}

export function getOrderStatusColor(status: Order['status']): string {
  const colors: Record<Order['status'], string> = {
    pending: 'text-yellow-600',
    confirmed: 'text-blue-600',
    preparing: 'text-indigo-600',
    shipping: 'text-purple-600',
    delivered: 'text-green-600',
    cancelled: 'text-red-600',
    refunded: 'text-gray-600',
  };
  return colors[status];
}
