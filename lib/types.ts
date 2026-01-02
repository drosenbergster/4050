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
  /**
   * Optional variant metadata (e.g. jar size).
   * When present, checkout will validate and use unitPrice.
   */
  variantKey?: string;
  variantLabel?: string;
  unitPrice?: number; // in cents (overrides product.price for this cart line)
}

export interface CartWithProducts {
  items: CartItemWithProduct[];
  subtotal: number; // sum of all line totals
  itemCount: number; // sum of all quantities
}

// ============================================
// COGS Calculator Types (Planning Tools)
// ============================================

export type IngredientSource = 'GARDEN' | 'PANTRY' | 'PACKAGING';
export type RecipeStatus = 'IDEA' | 'READY' | 'PUBLISHED';

export interface Ingredient {
  id: string;
  name: string;
  unitCost: number;
  unit: string;
  source: IngredientSource;
  category: string | null;
  notes: string | null;
  // Purchase tracking (what you buy at the store)
  purchaseSize: number | null;
  purchaseUnit: string | null;
  purchaseCost: number | null;
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
  status: RecipeStatus;
  batchYield: number | null;  // Number of jars this batch makes (null = per-jar mode)
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
  
  // Yield Tracking
  plantCount: number;
  yieldPerUnit: number | null;
  yieldUnit: string;
  lastYearYield: number | null;
  
  // Spacing (for Layout Sandbox)
  spacingInches: number | null;
  
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

// ============================================
// Garden Layout Sandbox Types
// ============================================

export interface GardenBed {
  id: string;
  x: number;      // position in inches from top-left of canvas
  y: number;
  width: number;  // in inches
  height: number; // in inches
  rotation: 0 | 90 | 180 | 270; // degrees, snaps to 90° increments
}

export interface PlacedPlant {
  id: string;
  cropId: string; // references Crop.id
  x: number;      // position in inches from top-left of canvas
  y: number;
}

export interface GardenCanvasData {
  beds: GardenBed[];
  plants: PlacedPlant[];
  width?: number;  // Canvas width in inches (default 600 = 50ft)
  height?: number; // Canvas height in inches (default 600 = 50ft)
}

export interface GardenLayout {
  id: string;
  name: string;
  canvasData: GardenCanvasData;
  createdAt: Date;
  updatedAt: Date;
}

