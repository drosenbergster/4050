export type ProductSizeOption = {
  /** Stable key for cart + checkout validation */
  key: string;
  /** Human label shown to customer */
  label: string;
  /** Price in cents */
  unitPrice: number;
};

export type ProductDetails = {
  sizes: ProductSizeOption[];
  ingredients: string[];
  allergens: string[];
};

// NOTE: This is intentionally a lightweight, code-driven catalog for now.
// If/when you move sizes/ingredients/allergens into the DB, this file can become a fallback.
export const PRODUCT_DETAILS_BY_NAME: Record<string, ProductDetails> = {
  'Apple Butter': {
    sizes: [
      { key: 'small-8oz', label: 'Small Jar (8 oz)', unitPrice: 799 },
      { key: 'regular-16oz', label: 'Regular Jar (16 oz)', unitPrice: 1099 },
    ],
    ingredients: ['Apples', 'Brown sugar', 'Cinnamon', 'Nutmeg', 'Cloves', 'Lemon juice'],
    allergens: [],
  },
  'Apple Chips': {
    sizes: [
      { key: 'snack-2oz', label: 'Snack Bag (2 oz)', unitPrice: 499 },
      { key: 'family-4oz', label: 'Family Bag (4 oz)', unitPrice: 699 },
    ],
    ingredients: ['Apples'],
    allergens: [],
  },
  Applesauce: {
    sizes: [
      { key: 'small-8oz', label: 'Small Jar (8 oz)', unitPrice: 599 },
      { key: 'regular-16oz', label: 'Regular Jar (16 oz)', unitPrice: 899 },
    ],
    ingredients: ['Apples', 'Water', 'Cinnamon (optional)'],
    allergens: [],
  },
  'Blackberry Jam': {
    sizes: [
      { key: 'small-4oz', label: 'Small Jar (4 oz)', unitPrice: 699 },
      { key: 'regular-8oz', label: 'Regular Jar (8 oz)', unitPrice: 999 },
    ],
    ingredients: ['Blackberries', 'Cane sugar', 'Pectin', 'Lemon juice'],
    allergens: [],
  },
  'Dilly Beans': {
    sizes: [{ key: 'pint-16oz', label: 'Pint Jar (16 oz)', unitPrice: 899 }],
    ingredients: ['Green beans', 'Dill', 'Garlic', 'White vinegar', 'Water', 'Salt', 'Red pepper flakes'],
    allergens: [],
  },
  'Garlic Dill Pickles': {
    sizes: [
      { key: 'pint-16oz', label: 'Pint Jar (16 oz)', unitPrice: 799 },
      { key: 'quart-32oz', label: 'Quart Jar (32 oz)', unitPrice: 1199 },
    ],
    ingredients: ['Cucumbers', 'Garlic', 'Fresh dill', 'White vinegar', 'Water', 'Salt', 'Peppercorns'],
    allergens: [],
  },
};

export function getProductDetailsByName(name: string): ProductDetails | null {
  return PRODUCT_DETAILS_BY_NAME[name] ?? null;
}



