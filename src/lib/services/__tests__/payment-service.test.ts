/**
 * Payment Service Tests
 * 결제 및 장바구니 관리 테스트
 */

import { paymentService } from '../payment-service';
import type { CartItem, CheckoutData, PaymentMethod } from '@/types/payment';

describe('PaymentService', () => {
  const testUserId = 'test-user-123';

  beforeEach(() => {
    // Clear all data before each test
    paymentService.clearAllData();
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after tests
    paymentService.clearAllData();
  });

  describe('Cart Management', () => {
    const mockCartItem: Omit<CartItem, 'id'> = {
      productId: 'prod-1',
      dealId: 'deal-1',
      productName: '에어팟 프로 2세대',
      price: 359000,
      originalPrice: 399000,
      quantity: 1,
      productImage: 'https://example.com/image.jpg',
    };

    it('should add item to cart', () => {
      const item = paymentService.addToCart(testUserId, mockCartItem);

      expect(item).toMatchObject(mockCartItem);
      expect(item.id).toBeDefined();

      const cart = paymentService.getCart(testUserId);
      expect(cart).toHaveLength(1);
      expect(cart[0]).toEqual(item);
    });

    it('should increase quantity when adding existing item', () => {
      // Add item first time
      paymentService.addToCart(testUserId, mockCartItem);

      // Add same item again
      paymentService.addToCart(testUserId, mockCartItem);

      const cart = paymentService.getCart(testUserId);
      expect(cart).toHaveLength(1);
      expect(cart[0].quantity).toBe(2);
    });

    it('should update item quantity', () => {
      const item = paymentService.addToCart(testUserId, mockCartItem);

      paymentService.updateCartItemQuantity(testUserId, item.id, 5);

      const cart = paymentService.getCart(testUserId);
      expect(cart[0].quantity).toBe(5);
    });

    it('should remove item when quantity is 0', () => {
      const item = paymentService.addToCart(testUserId, mockCartItem);

      paymentService.updateCartItemQuantity(testUserId, item.id, 0);

      const cart = paymentService.getCart(testUserId);
      expect(cart).toHaveLength(0);
    });

    it('should remove item from cart', () => {
      const item = paymentService.addToCart(testUserId, mockCartItem);

      paymentService.removeFromCart(testUserId, item.id);

      const cart = paymentService.getCart(testUserId);
      expect(cart).toHaveLength(0);
    });

    it('should calculate cart total correctly', () => {
      paymentService.addToCart(testUserId, { ...mockCartItem, quantity: 2 });
      paymentService.addToCart(testUserId, {
        ...mockCartItem,
        productId: 'prod-2',
        dealId: 'deal-2',
        price: 100000,
        quantity: 1
      });

      const { subtotal, itemCount } = paymentService.getCartTotal(testUserId);

      expect(subtotal).toBe(359000 * 2 + 100000); // 818000
      expect(itemCount).toBe(3);
    });

    it('should clear cart', () => {
      paymentService.addToCart(testUserId, mockCartItem);
      paymentService.addToCart(testUserId, {
        ...mockCartItem,
        productId: 'prod-2',
        dealId: 'deal-2'
      });

      paymentService.clearCart(testUserId);

      const cart = paymentService.getCart(testUserId);
      expect(cart).toHaveLength(0);
    });
  });

  describe('Order Management', () => {
    const mockCheckoutData: CheckoutData = {
      items: [
        {
          id: 'item-1',
          productId: 'prod-1',
          dealId: 'deal-1',
          productName: '에어팟 프로 2세대',
          price: 359000,
          originalPrice: 399000,
          quantity: 1,
          productImage: 'https://example.com/image.jpg',
        },
      ],
      shippingAddress: {
        id: 'addr-1',
        name: '홍길동',
        phone: '010-1234-5678',
        zipCode: '12345',
        address: '서울시 강남구 테헤란로',
        addressDetail: '123동 456호',
        isDefault: true,
      },
      shippingMethod: 'standard',
      paymentMethod: 'card',
      memo: '배송 전 연락 부탁드립니다.',
    };

    it('should create order', () => {
      const order = paymentService.createOrder(testUserId, mockCheckoutData);

      expect(order.id).toBeDefined();
      expect(order.orderNumber).toBeDefined();
      expect(order.userId).toBe(testUserId);
      expect(order.status).toBe('pending');
      expect(order.items).toHaveLength(1);
      expect(order.totalAmount).toBeGreaterThan(0);
      expect(order.shippingAddress).toEqual(mockCheckoutData.shippingAddress);
    });

    it('should calculate order amounts correctly', () => {
      const order = paymentService.createOrder(testUserId, mockCheckoutData);

      expect(order.subtotal).toBe(359000);
      expect(order.discount).toBe(399000 - 359000); // 40000
      expect(order.shippingFee).toBe(0); // standard shipping is free
      expect(order.totalAmount).toBe(359000); // subtotal + free shipping
    });

    it('should process payment successfully', async () => {
      const order = paymentService.createOrder(testUserId, mockCheckoutData);

      const result = await paymentService.processPayment(order.id, 'card');

      expect(result.success).toBe(true);
      expect(result.orderId).toBe(order.id);
      expect(result.orderNumber).toBe(order.orderNumber);
      expect(result.transactionId).toBeDefined();
      expect(result.message).toContain('결제가 완료되었습니다');

      const updatedOrder = paymentService.getOrderById(order.id);
      expect(updatedOrder?.status).toBe('paid');
      expect(updatedOrder?.paidAt).toBeDefined();
    });

    it('should fail payment for non-existent order', async () => {
      const result = await paymentService.processPayment('invalid-order-id', 'card');

      expect(result.success).toBe(false);
      expect(result.message).toContain('주문을 찾을 수 없습니다');
    });

    it('should clear cart after successful payment', async () => {
      // Add items to cart
      paymentService.addToCart(testUserId, mockCheckoutData.items[0]);

      const order = paymentService.createOrder(testUserId, mockCheckoutData);
      await paymentService.processPayment(order.id, 'card');

      const cart = paymentService.getCart(testUserId);
      expect(cart).toHaveLength(0);
    });

    it('should cancel order successfully', () => {
      const order = paymentService.createOrder(testUserId, mockCheckoutData);

      const result = paymentService.cancelOrder(order.id, '고객 변심');

      expect(result).toBe(true);

      const updatedOrder = paymentService.getOrderById(order.id);
      expect(updatedOrder?.status).toBe('cancelled');
      expect(updatedOrder?.cancelReason).toBe('고객 변심');
      expect(updatedOrder?.cancelledAt).toBeDefined();
    });

    it('should get user orders sorted by date', () => {
      // Create multiple orders
      paymentService.createOrder(testUserId, mockCheckoutData);
      paymentService.createOrder(testUserId, mockCheckoutData);

      const orders = paymentService.getUserOrders(testUserId);

      expect(orders).toHaveLength(2);
      // Most recent order should be first
      expect(new Date(orders[0].orderDate).getTime()).toBeGreaterThanOrEqual(
        new Date(orders[1].orderDate).getTime()
      );
    });
  });

  describe('Shipping Address Management', () => {
    const mockAddress = {
      name: '홍길동',
      phone: '010-1234-5678',
      zipCode: '12345',
      address: '서울시 강남구 테헤란로',
      addressDetail: '123동 456호',
      isDefault: false,
    };

    it('should add shipping address', () => {
      const address = paymentService.addShippingAddress(testUserId, mockAddress);

      expect(address.name).toBe(mockAddress.name);
      expect(address.phone).toBe(mockAddress.phone);
      expect(address.zipCode).toBe(mockAddress.zipCode);
      expect(address.address).toBe(mockAddress.address);
      expect(address.addressDetail).toBe(mockAddress.addressDetail);
      expect(address.id).toBeDefined();

      const addresses = paymentService.getShippingAddresses(testUserId);
      expect(addresses).toHaveLength(1);
    });

    it('should set first address as default', () => {
      const address = paymentService.addShippingAddress(testUserId, mockAddress);

      expect(address.isDefault).toBe(true);
    });

    it('should update default address', () => {
      const addr1 = paymentService.addShippingAddress(testUserId, mockAddress);
      const addr2 = paymentService.addShippingAddress(testUserId, {
        ...mockAddress,
        name: '김철수',
        isDefault: true,
      });

      const addresses = paymentService.getShippingAddresses(testUserId);

      expect(addresses.find(a => a.id === addr1.id)?.isDefault).toBe(false);
      expect(addresses.find(a => a.id === addr2.id)?.isDefault).toBe(true);
    });

    it('should delete shipping address', () => {
      const address = paymentService.addShippingAddress(testUserId, mockAddress);

      if (address.id) {
        paymentService.deleteShippingAddress(testUserId, address.id);
      }

      const addresses = paymentService.getShippingAddresses(testUserId);
      expect(addresses).toHaveLength(0);
    });
  });
});
