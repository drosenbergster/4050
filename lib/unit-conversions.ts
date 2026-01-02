/**
 * Unit Conversion System for Ingredient Costing
 * 
 * Handles conversions between purchase units (what you buy) 
 * and recipe units (what you use in recipes).
 * 
 * Example: Buy 2 lb sugar for $4 → Calculate cost per tablespoon
 */

// Standard volume conversions (all relative to 1 cup)
const VOLUME_TO_CUPS: Record<string, number> = {
  'cup': 1,
  'cups': 1,
  'tbsp': 1/16,      // 16 tbsp = 1 cup
  'tablespoon': 1/16,
  'tablespoons': 1/16,
  'tsp': 1/48,       // 48 tsp = 1 cup
  'teaspoon': 1/48,
  'teaspoons': 1/48,
  'fl oz': 1/8,      // 8 fl oz = 1 cup
  'fluid oz': 1/8,
  'ml': 1/236.588,   // ~236.6 ml = 1 cup
  'liter': 4.227,    // 1 liter = ~4.2 cups
  'l': 4.227,
  'quart': 4,        // 1 quart = 4 cups
  'qt': 4,
  'pint': 2,         // 1 pint = 2 cups
  'pt': 2,
  'gallon': 16,      // 1 gallon = 16 cups
  'gal': 16,
};

// Standard weight conversions (all relative to 1 oz)
const WEIGHT_TO_OZ: Record<string, number> = {
  'oz': 1,
  'ounce': 1,
  'ounces': 1,
  'lb': 16,          // 1 lb = 16 oz
  'lbs': 16,
  'pound': 16,
  'pounds': 16,
  'g': 1/28.35,      // 1 oz = 28.35g
  'gram': 1/28.35,
  'grams': 1/28.35,
  'kg': 35.274,      // 1 kg = 35.27 oz
  'kilogram': 35.274,
};

// Ingredient-specific: cups per pound (density varies by ingredient!)
// Source: USDA and common baking references
const CUPS_PER_POUND: Record<string, number> = {
  // Sugars
  'sugar': 2.25,
  'granulated sugar': 2.25,
  'white sugar': 2.25,
  'brown sugar': 2.25,
  'powdered sugar': 3.75,
  'confectioners sugar': 3.75,
  
  // Flours
  'flour': 3.5,
  'all-purpose flour': 3.5,
  'ap flour': 3.5,
  'bread flour': 3.33,
  'whole wheat flour': 3.33,
  'cake flour': 4,
  
  // Liquids (by weight - though usually sold by volume)
  'honey': 1.33,
  'maple syrup': 1.4,
  'molasses': 1.33,
  'corn syrup': 1.4,
  
  // Fats
  'butter': 2,        // 1 lb butter = 2 cups = 4 sticks
  'oil': 2.2,
  'vegetable oil': 2.2,
  'olive oil': 2.2,
  'shortening': 2.1,
  
  // Dairy
  'cream cheese': 2,
  'sour cream': 2,
  'yogurt': 2,
  
  // Nuts & Seeds
  'nuts': 4,
  'pine nuts': 4,
  'almonds': 3,
  'walnuts': 4,
  
  // Dried goods
  'rice': 2.5,
  'oats': 5,
  'rolled oats': 5,
  
  // Produce (approximate)
  'tomatoes': 2.5,
  'apples': 3,
  'berries': 3.5,
  'blueberries': 3.5,
  'raspberries': 4,
  
  // Spices (cups per pound - rarely buy by pound!)
  'cinnamon': 4.5,
  'spices': 4.5,
  'salt': 1.75,
  'pickling salt': 1.5,
  
  // Misc
  'pectin': 3,
  'vinegar': 2,       // similar to water density
  'lemon juice': 2,
  'lime juice': 2,
  
  // Default for unknown ingredients
  'default': 2.5,
};

// Count-based items (how many per pound)
const COUNT_PER_POUND: Record<string, number> = {
  'eggs': 8,          // ~8 large eggs per pound
  'egg': 8,
  'garlic': 48,       // ~48 cloves per pound
  'clove': 48,
  'cloves': 48,
  'onions': 3,        // ~3 medium onions per pound
  'onion': 3,
};

export type UnitType = 'volume' | 'weight' | 'count' | 'each';

/**
 * Determine what type of unit this is
 */
export function getUnitType(unit: string): UnitType {
  const normalizedUnit = unit.toLowerCase().trim();
  
  if (VOLUME_TO_CUPS[normalizedUnit] !== undefined) return 'volume';
  if (WEIGHT_TO_OZ[normalizedUnit] !== undefined) return 'weight';
  if (['each', 'piece', 'item', 'clove', 'bunch', 'packet', 'batch'].includes(normalizedUnit)) return 'each';
  if (COUNT_PER_POUND[normalizedUnit] !== undefined) return 'count';
  
  return 'each'; // default to 'each' for unknown units
}

/**
 * Convert between two volume units
 */
export function convertVolume(amount: number, fromUnit: string, toUnit: string): number | null {
  const from = VOLUME_TO_CUPS[fromUnit.toLowerCase()];
  const to = VOLUME_TO_CUPS[toUnit.toLowerCase()];
  
  if (from === undefined || to === undefined) return null;
  
  // Convert to cups, then to target unit
  const inCups = amount * from;
  return inCups / to;
}

/**
 * Convert between two weight units
 */
export function convertWeight(amount: number, fromUnit: string, toUnit: string): number | null {
  const from = WEIGHT_TO_OZ[fromUnit.toLowerCase()];
  const to = WEIGHT_TO_OZ[toUnit.toLowerCase()];
  
  if (from === undefined || to === undefined) return null;
  
  // Convert to oz, then to target unit
  const inOz = amount * from;
  return inOz / to;
}

/**
 * Convert weight to volume for a specific ingredient
 * Returns cups from a given weight
 */
export function weightToVolume(
  weightAmount: number, 
  weightUnit: string, 
  ingredientName: string
): number | null {
  // First convert weight to pounds
  const weightInOz = WEIGHT_TO_OZ[weightUnit.toLowerCase()];
  if (weightInOz === undefined) return null;
  
  const pounds = (weightAmount * weightInOz) / 16;
  
  // Find cups per pound for this ingredient
  const normalizedName = ingredientName.toLowerCase();
  let cupsPerPound = CUPS_PER_POUND['default'];
  
  for (const [key, value] of Object.entries(CUPS_PER_POUND)) {
    if (normalizedName.includes(key)) {
      cupsPerPound = value;
      break;
    }
  }
  
  return pounds * cupsPerPound;
}

/**
 * Convert volume to weight for a specific ingredient
 * Returns pounds from a given volume
 */
export function volumeToWeight(
  volumeAmount: number,
  volumeUnit: string,
  ingredientName: string
): number | null {
  // First convert volume to cups
  const volumeInCups = VOLUME_TO_CUPS[volumeUnit.toLowerCase()];
  if (volumeInCups === undefined) return null;
  
  const cups = volumeAmount * volumeInCups;
  
  // Find cups per pound for this ingredient
  const normalizedName = ingredientName.toLowerCase();
  let cupsPerPound = CUPS_PER_POUND['default'];
  
  for (const [key, value] of Object.entries(CUPS_PER_POUND)) {
    if (normalizedName.includes(key)) {
      cupsPerPound = value;
      break;
    }
  }
  
  return cups / cupsPerPound;
}

/**
 * Calculate the cost per recipe unit based on purchase info
 * 
 * Example: 
 *   purchaseSize: 2, purchaseUnit: "lb", purchaseCost: 4.00
 *   recipeUnit: "tbsp", ingredientName: "sugar"
 *   → Returns cost per tablespoon
 */
export function calculateCostPerRecipeUnit(
  purchaseSize: number,
  purchaseUnit: string,
  purchaseCost: number,
  recipeUnit: string,
  ingredientName: string
): number | null {
  const purchaseType = getUnitType(purchaseUnit);
  const recipeType = getUnitType(recipeUnit);
  
  // Same type - direct conversion
  if (purchaseType === recipeType) {
    if (purchaseType === 'volume') {
      const recipeUnitsPerPurchase = convertVolume(purchaseSize, purchaseUnit, recipeUnit);
      if (recipeUnitsPerPurchase === null) return null;
      return purchaseCost / recipeUnitsPerPurchase;
    }
    if (purchaseType === 'weight') {
      const recipeUnitsPerPurchase = convertWeight(purchaseSize, purchaseUnit, recipeUnit);
      if (recipeUnitsPerPurchase === null) return null;
      return purchaseCost / recipeUnitsPerPurchase;
    }
    // 'each' to 'each' - just divide
    return purchaseCost / purchaseSize;
  }
  
  // Weight purchase → Volume recipe (e.g., buy lbs, use cups)
  if (purchaseType === 'weight' && recipeType === 'volume') {
    // Convert purchase weight to cups
    const purchaseInCups = weightToVolume(purchaseSize, purchaseUnit, ingredientName);
    if (purchaseInCups === null) return null;
    
    // Convert cups to recipe unit
    const recipeUnitsPerPurchase = convertVolume(purchaseInCups, 'cup', recipeUnit);
    if (recipeUnitsPerPurchase === null) return null;
    
    return purchaseCost / recipeUnitsPerPurchase;
  }
  
  // Volume purchase → Weight recipe (less common)
  if (purchaseType === 'volume' && recipeType === 'weight') {
    // Convert purchase volume to pounds
    const purchaseInCups = convertVolume(purchaseSize, purchaseUnit, 'cup');
    if (purchaseInCups === null) return null;
    
    const purchaseInPounds = volumeToWeight(purchaseInCups, 'cup', ingredientName);
    if (purchaseInPounds === null) return null;
    
    // Convert pounds to recipe unit
    const recipeUnitsPerPurchase = convertWeight(purchaseInPounds, 'lb', recipeUnit);
    if (recipeUnitsPerPurchase === null) return null;
    
    return purchaseCost / recipeUnitsPerPurchase;
  }
  
  // Can't convert between these types
  return null;
}

/**
 * Format a cost per unit nicely
 */
export function formatCostPerUnit(cost: number | null, unit: string): string {
  if (cost === null) return '?';
  if (cost < 0.01) return `<$0.01/${unit}`;
  return `$${cost.toFixed(2)}/${unit}`;
}

/**
 * Get available recipe units for dropdown
 */
export function getCommonRecipeUnits(): string[] {
  return [
    'cup',
    'tbsp',
    'tsp',
    'oz',
    'lb',
    'each',
    'bunch',
    'clove',
    'packet',
  ];
}

/**
 * Get available purchase units for dropdown
 */
export function getCommonPurchaseUnits(): string[] {
  return [
    'lb',
    'oz',
    'cup',
    'quart',
    'gallon',
    'each',
    'bag',
    'box',
    'jar',
    'bottle',
    'can',
    'packet',
  ];
}


