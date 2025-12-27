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
  category: string | null;
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

// ============================================
// COGS Calculator Types (Planning Tools)
// ============================================

export interface Ingredient {
  id: string;
  name: string;
  unitCost: number;
  unit: string;
  isFromGarden: boolean;
  category: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CogsRecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: number;
  ingredient: Ingredient;
}

export interface CogsRecipe {
  id: string;
  name: string;
  description: string | null;
  containerType: string;
  containerCost: number;
  labelCost: number;
  energyCost: number;
  retailPrice: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  ingredients: CogsRecipeIngredient[];
}

// Calculated cost breakdown for a recipe
export interface RecipeCostBreakdown {
  ingredientsCost: number;
  containerCost: number;
  labelCost: number;
  energyCost: number;
  totalCost: number;
  retailPrice: number;
  profit: number;
  marginPercent: number;
}

// ============================================
// Seasonal Planner Types
// ============================================

export type CropType = 'ANNUAL' | 'PERENNIAL' | 'BIENNIAL';

export interface Crop {
  id: string;
  name: string;
  type: CropType;
  
  // Planting Phase (for annuals/biennials)
  seedStartWeek: number | null;
  seedStartNotes: string | null;
  plantOutWeekStart: number | null;
  plantOutWeekEnd: number | null;
  directSow: boolean;
  
  // Harvest Phase
  harvestStart: number;
  harvestEnd: number;
  peakStart: number | null;
  peakEnd: number | null;
  
  // Display
  color: string;
  notes: string | null;
  
  // Relations
  ingredientId: string | null;
  ingredient?: Ingredient | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SeasonalTask {
  id: string;
  title: string;
  month: number; // 1-12
  weekOfMonth: number | null; // 1-4 or null
  isCompleted: boolean;
  completedAt: Date | null;
  year: number;
  notes: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

