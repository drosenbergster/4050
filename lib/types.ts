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
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  stripePaymentIntentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Seeds of Kindness fields (optional - may not be present in all orders)
  proceedsChoice?: string | null;
  seedCount?: number | null;
  extraSupportAmount?: number | null;
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

// Cart types (client-side only)
export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  lastUpdated: Date;
}

export interface CartItemWithProduct {
  productId: string;
  quantity: number;
  product: Product;
  lineTotal: number; // calculated: product.price * quantity
}

export interface CartWithProducts {
  items: CartItemWithProduct[];
  subtotal: number; // sum of all line totals
  itemCount: number; // sum of all quantities
}

