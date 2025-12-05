/**
 * Shipping calculation utility
 * 
 * Simple flat rate shipping: $10.00
 * Local pickup: $0.00
 * 
 * Location-based adjustments can be added later if needed.
 */

import type { FulfillmentMethod } from './types';

/**
 * Calculate shipping cost based on fulfillment method
 * @param fulfillmentMethod - SHIPPING or PICKUP
 * @returns Shipping cost in cents (e.g., 1000 = $10.00)
 */
export { type FulfillmentMethod };

export function calculateShipping(fulfillmentMethod: FulfillmentMethod): number {
  if (fulfillmentMethod === 'PICKUP') {
    return 0;
  }
  
  // Flat rate shipping: $10.00
  return 1000; // $10.00 in cents
}

/**
 * Format shipping cost for display
 * @param shippingCost - Cost in cents
 * @returns Formatted string (e.g., "$10.00" or "Free")
 */
export function formatShippingCost(shippingCost: number): string {
  if (shippingCost === 0) {
    return 'Free';
  }
  
  return `$${(shippingCost / 100).toFixed(2)}`;
}

