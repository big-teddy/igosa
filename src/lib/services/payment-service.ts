/**
 * Payment Service
 * 결제 및 주문 관리 서비스
 *
 * Features:
 * - 장바구니 관리
 * - 주문 생성 및 결제 처리
 * - 주문 조회 및 관리
 * - 배송지 관리
 */

import type {
  CartItem,
  Order,
  OrderItem,
  CheckoutData,
  PaymentResult,
  PaymentMethod,
  ShippingAddress,
  ShippingMethod,
  OrderStatus,
  SHIPPING_METHOD_INFO,
} from '@/types/payment';
import { SHIPPING_METHOD_INFO as shippingInfo } from '@/types/payment';

const CART_KEY = 'igosa_cart';
const ORDERS_KEY = 'igosa_orders';
const ADDRESSES_KEY = 'igosa_shipping_addresses';

class PaymentService {
  private static instance: PaymentService;

  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // ==================== CART MANAGEMENT ====================

  /**
   * Get user's cart
   */
  getCart(userId: string): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (!stored) return [];

      const allCarts: { userId: string; items: CartItem[] }[] = JSON.parse(stored);
      const userCart = allCarts.find((c) => c.userId === userId);
      return userCart?.items || [];
    } catch (error) {
      console.error('Failed to get cart:', error);
      return [];
    }
  }

  /**
   * Add item to cart
   */
  addToCart(userId: string, item: Omit<CartItem, 'id'>): CartItem {
    try {
      const cart = this.getCart(userId);

      // Check if item already exists
      const existing = cart.find((i) => i.productId === item.productId && i.dealId === item.dealId);

      if (existing) {
        // Increase quantity
        existing.quantity += item.quantity;
        this.saveCart(userId, cart);
        return existing;
      } else {
        // Add new item
        const newItem: CartItem = {
          ...item,
          id: this.generateId(),
        };
        cart.push(newItem);
        this.saveCart(userId, cart);
        return newItem;
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  }

  /**
   * Update cart item quantity
   */
  updateCartItemQuantity(userId: string, itemId: string, quantity: number): void {
    try {
      const cart = this.getCart(userId);
      const item = cart.find((i) => i.id === itemId);

      if (item) {
        if (quantity <= 0) {
          // Remove item
          const filtered = cart.filter((i) => i.id !== itemId);
          this.saveCart(userId, filtered);
        } else {
          // Update quantity
          item.quantity = quantity;
          this.saveCart(userId, cart);
        }
      }
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  }

  /**
   * Remove item from cart
   */
  removeFromCart(userId: string, itemId: string): void {
    try {
      const cart = this.getCart(userId);
      const filtered = cart.filter((i) => i.id !== itemId);
      this.saveCart(userId, filtered);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  }

  /**
   * Clear cart
   */
  clearCart(userId: string): void {
    try {
      this.saveCart(userId, []);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  }

  /**
   * Save cart
   */
  private saveCart(userId: string, items: CartItem[]): void {
    try {
      const stored = localStorage.getItem(CART_KEY);
      let allCarts: { userId: string; items: CartItem[] }[] = stored ? JSON.parse(stored) : [];

      // Remove existing cart for user
      allCarts = allCarts.filter((c) => c.userId !== userId);

      // Add updated cart
      allCarts.push({ userId, items });

      localStorage.setItem(CART_KEY, JSON.stringify(allCarts));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }

  /**
   * Get cart total
   */
  getCartTotal(userId: string): { subtotal: number; itemCount: number } {
    const cart = this.getCart(userId);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, itemCount };
  }

  // ==================== ORDER MANAGEMENT ====================

  /**
   * Create order from checkout data
   */
  createOrder(userId: string, checkoutData: CheckoutData): Order {
    try {
      // Calculate amounts
      const orderItems: OrderItem[] = checkoutData.items.map((item) => {
        const subtotal = item.price * item.quantity;
        const discount = item.originalPrice
          ? (item.originalPrice - item.price) * item.quantity
          : 0;

        return {
          ...item,
          subtotal,
          discount,
          finalPrice: subtotal,
        };
      });

      const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
      const discount = orderItems.reduce((sum, item) => sum + item.discount, 0);
      const shippingFee = shippingInfo[checkoutData.shippingMethod].fee;
      const totalAmount = subtotal + shippingFee;

      const order: Order = {
        id: this.generateId(),
        userId,
        orderNumber: this.generateOrderNumber(),
        orderDate: new Date().toISOString(),
        status: 'pending',
        items: orderItems,
        subtotal,
        shippingFee,
        discount,
        totalAmount,
        shippingAddress: checkoutData.shippingAddress,
        shippingMethod: checkoutData.shippingMethod,
        paymentInfo: {
          method: checkoutData.paymentMethod,
        },
        memo: checkoutData.memo,
      };

      // Save order
      this.saveOrder(order);

      return order;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }

  /**
   * Process payment (mock implementation)
   */
  async processPayment(orderId: string, paymentMethod: PaymentMethod): Promise<PaymentResult> {
    try {
      const order = this.getOrderById(orderId);
      if (!order) {
        return {
          success: false,
          message: '주문을 찾을 수 없습니다.',
        };
      }

      // Mock payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update order status
      order.status = 'paid';
      order.paidAt = new Date().toISOString();
      order.paymentInfo.transactionId = this.generateTransactionId();
      order.paymentInfo.approvalNumber = this.generateApprovalNumber();

      this.updateOrder(order);

      // Clear cart after successful payment
      this.clearCart(order.userId);

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        message: '결제가 완료되었습니다.',
        transactionId: order.paymentInfo.transactionId,
      };
    } catch (error) {
      console.error('Failed to process payment:', error);
      return {
        success: false,
        message: '결제 처리 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * Get order by ID
   */
  getOrderById(orderId: string): Order | null {
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      if (!stored) return null;

      const orders: Order[] = JSON.parse(stored);
      return orders.find((o) => o.id === orderId) || null;
    } catch (error) {
      console.error('Failed to get order:', error);
      return null;
    }
  }

  /**
   * Get user orders
   */
  getUserOrders(userId: string): Order[] {
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      if (!stored) return [];

      const orders: Order[] = JSON.parse(stored);
      return orders
        .filter((o) => o.userId === userId)
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    } catch (error) {
      console.error('Failed to get user orders:', error);
      return [];
    }
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, status: OrderStatus): boolean {
    try {
      const order = this.getOrderById(orderId);
      if (!order) return false;

      order.status = status;

      if (status === 'cancelled') {
        order.cancelledAt = new Date().toISOString();
      } else if (status === 'refunded') {
        order.refundedAt = new Date().toISOString();
      }

      this.updateOrder(order);
      return true;
    } catch (error) {
      console.error('Failed to update order status:', error);
      return false;
    }
  }

  /**
   * Cancel order
   */
  cancelOrder(orderId: string, reason: string): boolean {
    try {
      const order = this.getOrderById(orderId);
      if (!order) return false;

      if (order.status !== 'pending' && order.status !== 'paid') {
        return false; // Can only cancel pending or paid orders
      }

      order.status = 'cancelled';
      order.cancelledAt = new Date().toISOString();
      order.cancelReason = reason;

      this.updateOrder(order);
      return true;
    } catch (error) {
      console.error('Failed to cancel order:', error);
      return false;
    }
  }

  /**
   * Save order
   */
  private saveOrder(order: Order): void {
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      const orders: Order[] = stored ? JSON.parse(stored) : [];
      orders.push(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Failed to save order:', error);
    }
  }

  /**
   * Update order
   */
  private updateOrder(order: Order): void {
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      if (!stored) return;

      let orders: Order[] = JSON.parse(stored);
      const index = orders.findIndex((o) => o.id === order.id);

      if (index >= 0) {
        orders[index] = order;
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  }

  // ==================== SHIPPING ADDRESS ====================

  /**
   * Get user's shipping addresses
   */
  getShippingAddresses(userId: string): ShippingAddress[] {
    try {
      const stored = localStorage.getItem(ADDRESSES_KEY);
      if (!stored) return [];

      const allAddresses: { userId: string; addresses: ShippingAddress[] }[] = JSON.parse(stored);
      const userAddresses = allAddresses.find((a) => a.userId === userId);
      return userAddresses?.addresses || [];
    } catch (error) {
      console.error('Failed to get shipping addresses:', error);
      return [];
    }
  }

  /**
   * Add shipping address
   */
  addShippingAddress(userId: string, address: Omit<ShippingAddress, 'id'>): ShippingAddress {
    try {
      const addresses = this.getShippingAddresses(userId);

      const newAddress: ShippingAddress = {
        ...address,
        id: this.generateId(),
      };

      // If this is the first address or marked as default, set it as default
      if (addresses.length === 0 || newAddress.isDefault) {
        // Remove default from other addresses
        addresses.forEach((a) => (a.isDefault = false));
        newAddress.isDefault = true;
      }

      addresses.push(newAddress);
      this.saveShippingAddresses(userId, addresses);

      return newAddress;
    } catch (error) {
      console.error('Failed to add shipping address:', error);
      throw error;
    }
  }

  /**
   * Update shipping address
   */
  updateShippingAddress(userId: string, addressId: string, updates: Partial<ShippingAddress>): void {
    try {
      const addresses = this.getShippingAddresses(userId);
      const address = addresses.find((a) => a.id === addressId);

      if (address) {
        Object.assign(address, updates);

        // If setting as default, remove default from others
        if (updates.isDefault) {
          addresses.forEach((a) => {
            if (a.id !== addressId) a.isDefault = false;
          });
        }

        this.saveShippingAddresses(userId, addresses);
      }
    } catch (error) {
      console.error('Failed to update shipping address:', error);
    }
  }

  /**
   * Delete shipping address
   */
  deleteShippingAddress(userId: string, addressId: string): void {
    try {
      const addresses = this.getShippingAddresses(userId);
      const filtered = addresses.filter((a) => a.id !== addressId);
      this.saveShippingAddresses(userId, filtered);
    } catch (error) {
      console.error('Failed to delete shipping address:', error);
    }
  }

  /**
   * Save shipping addresses
   */
  private saveShippingAddresses(userId: string, addresses: ShippingAddress[]): void {
    try {
      const stored = localStorage.getItem(ADDRESSES_KEY);
      let allAddresses: { userId: string; addresses: ShippingAddress[] }[] = stored ? JSON.parse(stored) : [];

      // Remove existing addresses for user
      allAddresses = allAddresses.filter((a) => a.userId !== userId);

      // Add updated addresses
      allAddresses.push({ userId, addresses });

      localStorage.setItem(ADDRESSES_KEY, JSON.stringify(allAddresses));
    } catch (error) {
      console.error('Failed to save shipping addresses:', error);
    }
  }

  // ==================== UTILITIES ====================

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate order number
   */
  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().substr(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();

    return `${year}${month}${day}-${random}`;
  }

  /**
   * Generate transaction ID
   */
  private generateTransactionId(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  /**
   * Generate approval number
   */
  private generateApprovalNumber(): string {
    return Math.random().toString().substr(2, 8);
  }

  /**
   * Clear all data (for testing)
   */
  clearAllData(): void {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(ORDERS_KEY);
    localStorage.removeItem(ADDRESSES_KEY);
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance();
