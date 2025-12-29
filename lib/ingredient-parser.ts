/**
 * Ingredient Parser for Natural Text Entry
 * 
 * Parses lines like "2 cups sugar" or "1/2 tbsp cinnamon" into structured data.
 * Used by the recipe editor for natural ingredient entry.
 */

import type { Ingredient, IngredientSource } from './types';

// ============================================
// Types
// ============================================

export interface ParsedIngredient {
  amount: number;
  unit: string;
  name: string;
  rawLine: string;
  matchedIngredient?: Ingredient;
  isNew?: boolean;
  parseError?: string;
}

export interface IngredientMatch {
  ingredient: Ingredient;
  score: number;  // Higher = better match
}

// ============================================
// Known Units (for parsing)
// ============================================

// Map of all recognized unit variations to their canonical form
const UNIT_ALIASES: Record<string, string> = {
  // Volume - cups
  'cup': 'cups',
  'cups': 'cups',
  'c': 'cups',
  
  // Volume - tablespoons
  'tbsp': 'tbsp',
  'tablespoon': 'tbsp',
  'tablespoons': 'tbsp',
  'tbs': 'tbsp',
  'T': 'tbsp',
  
  // Volume - teaspoons
  'tsp': 'tsp',
  'teaspoon': 'tsp',
  'teaspoons': 'tsp',
  't': 'tsp',
  
  // Weight - pounds
  'lb': 'lbs',
  'lbs': 'lbs',
  'pound': 'lbs',
  'pounds': 'lbs',
  
  // Weight - ounces
  'oz': 'oz',
  'ounce': 'oz',
  'ounces': 'oz',
  
  // Volume - quarts
  'quart': 'quarts',
  'quarts': 'quarts',
  'qt': 'quarts',
  
  // Volume - pints
  'pint': 'pints',
  'pints': 'pints',
  'pt': 'pints',
  
  // Volume - gallons
  'gallon': 'gallons',
  'gallons': 'gallons',
  'gal': 'gallons',
  
  // Count
  'each': 'each',
  'ea': 'each',
  'piece': 'each',
  'pieces': 'each',
  
  // Other common units
  'bunch': 'bunch',
  'bunches': 'bunch',
  'clove': 'clove',
  'cloves': 'clove',
  'head': 'head',
  'heads': 'head',
  'can': 'can',
  'cans': 'can',
  'jar': 'jar',
  'jars': 'jar',
  'bag': 'bag',
  'bags': 'bag',
  'packet': 'packet',
  'packets': 'packet',
  'box': 'box',
  'boxes': 'box',
};


// ============================================
// Fraction Parsing
// ============================================

/**
 * Parse a fraction string into a number.
 * Handles: "1/2", "1 1/2", "2", "2.5"
 */
export function parseFraction(str: string): number | null {
  const trimmed = str.trim();
  
  if (!trimmed) return null;
  
  // Try decimal first: "2.5"
  if (/^\d+\.?\d*$/.test(trimmed)) {
    return parseFloat(trimmed);
  }
  
  // Try simple fraction: "1/2"
  const simpleFractionMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (simpleFractionMatch) {
    const num = parseInt(simpleFractionMatch[1], 10);
    const denom = parseInt(simpleFractionMatch[2], 10);
    if (denom === 0) return null;
    return num / denom;
  }
  
  // Try mixed number: "1 1/2" or "1-1/2"
  const mixedMatch = trimmed.match(/^(\d+)[\s-]+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const num = parseInt(mixedMatch[2], 10);
    const denom = parseInt(mixedMatch[3], 10);
    if (denom === 0) return null;
    return whole + (num / denom);
  }
  
  return null;
}

/**
 * Normalize a unit string to its canonical form.
 * "tablespoon" → "tbsp", "pounds" → "lbs"
 */
export function normalizeUnit(unit: string): string {
  const lower = unit.toLowerCase().trim();
  return UNIT_ALIASES[lower] || lower;
}

/**
 * Check if a string is a known unit.
 */
export function isKnownUnit(str: string): boolean {
  return str.toLowerCase() in UNIT_ALIASES;
}

/**
 * Parse an amount string that may contain amount + unit.
 * 
 * Examples:
 *   "2 cups" → { amount: 2, unit: "cups" }
 *   "1/2 tbsp" → { amount: 0.5, unit: "tbsp" }
 *   "6" → { amount: 6, unit: "each" }
 *   "1 1/2" → { amount: 1.5, unit: "each" }
 *   "" → { amount: 1, unit: "each" }
 * 
 * If no unit is provided, defaults to "each".
 */
export function parseAmountAndUnit(input: string): { amount: number; unit: string } {
  const trimmed = input.trim();
  
  // Empty input defaults to 1 each
  if (!trimmed) {
    return { amount: 1, unit: 'each' };
  }
  
  // Try to find amount patterns at the start
  const amountPatterns = [
    /^(\d+\s+\d+\/\d+)/, // Mixed: "1 1/2"
    /^(\d+\/\d+)/,        // Fraction: "1/2"
    /^(\d+\.?\d*)/,       // Decimal/whole: "2" or "2.5"
  ];
  
  let amountStr: string | null = null;
  let remainder = trimmed;
  
  for (const pattern of amountPatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      amountStr = match[1];
      remainder = trimmed.slice(match[0].length).trim();
      break;
    }
  }
  
  // Parse the amount
  let amount = 1;
  if (amountStr) {
    const parsed = parseFraction(amountStr);
    if (parsed !== null && parsed > 0) {
      amount = parsed;
    }
  }
  
  // Check if remainder is a unit
  let unit = 'each';
  if (remainder) {
    // Take the first word as potential unit
    const words = remainder.split(/\s+/);
    const potentialUnit = words[0];
    
    if (isKnownUnit(potentialUnit)) {
      unit = normalizeUnit(potentialUnit);
    } else {
      // Unknown unit - use as-is (e.g., "handful")
      unit = potentialUnit.toLowerCase();
    }
  }
  
  return { amount, unit };
}

// ============================================
// Line Parsing
// ============================================

/**
 * Parse a single line of ingredient text.
 * 
 * Examples:
 *   "2 cups sugar" → { amount: 2, unit: "cups", name: "sugar" }
 *   "1/2 tbsp cinnamon" → { amount: 0.5, unit: "tbsp", name: "cinnamon" }
 *   "1 1/2 lbs apples" → { amount: 1.5, unit: "lbs", name: "apples" }
 * 
 * Returns null for empty lines.
 * Returns parseError for lines that can't be parsed.
 */
export function parseIngredientLine(line: string): ParsedIngredient | null {
  const trimmed = line.trim();
  
  // Empty line → null (ignore)
  if (!trimmed) return null;
  
  // Build regex for matching amount + unit + name
  // Pattern: (amount) (unit) (name)
  // Amount can be: "2", "2.5", "1/2", "1 1/2"
  
  // First, try to extract the amount from the start
  // Match: whole number, decimal, fraction, or mixed number
  const amountPatterns = [
    /^(\d+\s+\d+\/\d+)/, // Mixed: "1 1/2"
    /^(\d+\/\d+)/,        // Fraction: "1/2"
    /^(\d+\.?\d*)/,       // Decimal/whole: "2" or "2.5"
  ];
  
  let amountStr: string | null = null;
  let remainder = trimmed;
  
  for (const pattern of amountPatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      amountStr = match[1];
      remainder = trimmed.slice(match[0].length).trim();
      break;
    }
  }
  
  // No amount found
  if (!amountStr) {
    return {
      amount: 0,
      unit: '',
      name: trimmed,
      rawLine: line,
      parseError: 'Missing amount — try "2 cups sugar"',
    };
  }
  
  const amount = parseFraction(amountStr);
  if (amount === null || amount <= 0) {
    return {
      amount: 0,
      unit: '',
      name: trimmed,
      rawLine: line,
      parseError: 'Invalid amount',
    };
  }
  
  // Now parse unit and name from remainder
  // Try to find a known unit at the start of remainder
  const words = remainder.split(/\s+/);
  
  if (words.length === 0 || !words[0]) {
    return {
      amount,
      unit: '',
      name: '',
      rawLine: line,
      parseError: 'Missing unit and ingredient — try "2 cups sugar"',
    };
  }
  
  // Check if first word is a unit
  let unit = '';
  let nameWords: string[];
  
  if (isKnownUnit(words[0])) {
    unit = normalizeUnit(words[0]);
    nameWords = words.slice(1);
  } else {
    // First word is not a known unit — treat it as an unknown unit anyway
    // This allows "2 handfuls basil" to work
    unit = words[0].toLowerCase();
    nameWords = words.slice(1);
  }
  
  const name = nameWords.join(' ').trim();
  
  if (!name) {
    return {
      amount,
      unit,
      name: '',
      rawLine: line,
      parseError: 'Missing ingredient name — try "2 cups sugar"',
    };
  }
  
  return {
    amount,
    unit,
    name,
    rawLine: line,
  };
}

// ============================================
// Ingredient Matching
// ============================================

/**
 * Find matching ingredients from the library based on a name.
 * Returns matches sorted by relevance (best first).
 */
export function findMatchingIngredients(
  searchName: string,
  ingredients: Ingredient[],
  limit: number = 5
): IngredientMatch[] {
  const search = searchName.toLowerCase().trim();
  
  if (!search) return [];
  
  const matches: IngredientMatch[] = [];
  
  for (const ingredient of ingredients) {
    const name = ingredient.name.toLowerCase();
    
    // Exact match
    if (name === search) {
      matches.push({ ingredient, score: 100 });
      continue;
    }
    
    // Starts with search term
    if (name.startsWith(search)) {
      matches.push({ ingredient, score: 80 + (search.length / name.length) * 10 });
      continue;
    }
    
    // Contains search term
    if (name.includes(search)) {
      matches.push({ ingredient, score: 50 + (search.length / name.length) * 10 });
      continue;
    }
    
    // Search term contains ingredient name (e.g., search "brown sugar" matches "sugar")
    if (search.includes(name)) {
      matches.push({ ingredient, score: 30 });
      continue;
    }
  }
  
  // Sort by score descending, then by name length (prefer shorter names)
  matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.ingredient.name.length - b.ingredient.name.length;
  });
  
  return matches.slice(0, limit);
}

/**
 * Find the best matching ingredient for a parsed line.
 * Returns the ingredient if found, or null if no match.
 */
export function findBestMatch(
  parsedLine: ParsedIngredient,
  ingredients: Ingredient[]
): Ingredient | null {
  if (parsedLine.parseError || !parsedLine.name) return null;
  
  const matches = findMatchingIngredients(parsedLine.name, ingredients, 1);
  
  // Only return if it's a good match (score >= 80 means starts with or exact)
  if (matches.length > 0 && matches[0].score >= 80) {
    return matches[0].ingredient;
  }
  
  return null;
}

// ============================================
// Multi-Line Parsing
// ============================================

/**
 * Parse multiple lines of ingredient text.
 * Matches each line against the ingredient library.
 */
export function parseIngredientLines(
  text: string,
  ingredients: Ingredient[]
): ParsedIngredient[] {
  const lines = text.split('\n');
  const results: ParsedIngredient[] = [];
  
  for (const line of lines) {
    const parsed = parseIngredientLine(line);
    
    if (parsed === null) continue; // Skip empty lines
    
    if (!parsed.parseError) {
      // Try to match against existing ingredients
      const match = findBestMatch(parsed, ingredients);
      
      if (match) {
        parsed.matchedIngredient = match;
      } else {
        // No match found — mark as new ingredient needed
        parsed.isNew = true;
      }
    }
    
    results.push(parsed);
  }
  
  return results;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format an amount for display.
 * Converts decimals back to fractions where appropriate.
 */
export function formatAmount(amount: number): string {
  // Common fractions with tolerance for floating point
  const fractionMap: Array<{ decimal: number; display: string }> = [
    { decimal: 0.125, display: '⅛' },
    { decimal: 0.167, display: '⅙' },
    { decimal: 0.2, display: '⅕' },
    { decimal: 0.25, display: '¼' },
    { decimal: 0.333, display: '⅓' },
    { decimal: 0.375, display: '⅜' },
    { decimal: 0.4, display: '⅖' },
    { decimal: 0.5, display: '½' },
    { decimal: 0.6, display: '⅗' },
    { decimal: 0.625, display: '⅝' },
    { decimal: 0.667, display: '⅔' },
    { decimal: 0.75, display: '¾' },
    { decimal: 0.8, display: '⅘' },
    { decimal: 0.833, display: '⅚' },
    { decimal: 0.875, display: '⅞' },
  ];
  
  const whole = Math.floor(amount);
  const decimal = amount - whole;
  
  // Check if it's a whole number
  if (decimal < 0.01) {
    return whole.toString();
  }
  
  // Find the closest fraction within tolerance
  const tolerance = 0.02;
  for (const { decimal: fracDecimal, display } of fractionMap) {
    if (Math.abs(decimal - fracDecimal) < tolerance) {
      return whole > 0 ? `${whole} ${display}` : display;
    }
  }
  
  // No nice fraction found - format cleanly
  if (whole > 0) {
    // Show as mixed number with decimal
    const decimalPart = (amount - whole).toFixed(2).replace(/^0/, '').replace(/0+$/, '');
    return `${whole}${decimalPart}`;
  }
  
  return amount.toFixed(2).replace(/\.?0+$/, '');
}

/**
 * Get the source icon for an ingredient source.
 */
export function getSourceIcon(source: IngredientSource): string {
  switch (source) {
    case 'GARDEN': return '🌱';
    case 'PANTRY': return '🏪';
    case 'PACKAGING': return '📦';
    default: return '🏪';
  }
}

/**
 * Convert parsed ingredients to the format expected by recipe API.
 */
export function parsedToRecipeIngredients(
  parsed: ParsedIngredient[]
): { ingredientId: string; quantity: number }[] {
  return parsed
    .filter(p => p.matchedIngredient && !p.parseError)
    .map(p => ({
      ingredientId: p.matchedIngredient!.id,
      quantity: p.amount,
    }));
}

