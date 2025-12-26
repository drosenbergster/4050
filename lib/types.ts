/**
 * Shared TypeScript types for 4050
 * 
 * These types are used across frontend and backend to ensure type safety.
 */

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in cents (e.g., 999 = $9.99)
  imageUrl: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export type FulfillmentMethod = 'SHIPPING' | 'PICKUP';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export type FulfillmentStatus = 'PENDING' | 'FULFILLED';

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress | null;
  fulfillmentMethod: FulfillmentMethod;
  shippingCost: number | null; // in cents
  subtotal: number; // in cents
  total: number; // in cents
  proceedsChoice?: string | null; // selected cause id
  extraSupportAmount?: number | null; // in cents
  seedCount: number; // seeds sown (1 base + 1 per $10, excludes shipping)
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  stripePaymentIntentId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string; // Snapshot at time of order
  quantity: number;
  unitPrice: number; // in cents (snapshot)
  lineTotal: number; // in cents
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

// Basket types (client-side only)
export interface BasketItem {
  productId: string;
  quantity: number;
}

export interface Basket {
  items: BasketItem[];
  lastUpdated: Date;
}

export interface BasketItemWithProduct {
  productId: string;
  quantity: number;
  product: Product;
  lineTotal: number; // calculated: product.price * quantity
}

export interface BasketWithProducts {
  items: BasketItemWithProduct[];
  subtotal: number; // sum of all line totals
  itemCount: number; // sum of all quantities
}

