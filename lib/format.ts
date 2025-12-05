/**
 * Formatting utilities for 4050
 * 
 * Currency, date, and other formatting helpers.
 */

/**
 * Format price in cents to currency string
 * @param price - Price in cents (e.g., 999 = $9.99)
 * @returns Formatted currency string (e.g., "$9.99")
 */
export function formatPrice(price: number): string {
  return `$${(price / 100).toFixed(2)}`;
}

/**
 * Format price in cents to currency string without dollar sign
 * @param price - Price in cents
 * @returns Formatted string (e.g., "9.99")
 */
export function formatPriceNumber(price: number): string {
  return (price / 100).toFixed(2);
}

/**
 * Parse currency string to cents
 * @param priceString - Currency string (e.g., "$9.99" or "9.99")
 * @returns Price in cents
 */
export function parsePrice(priceString: string): number {
  const cleaned = priceString.replace(/[^0-9.]/g, '');
  const dollars = parseFloat(cleaned);
  return Math.round(dollars * 100);
}

/**
 * Format date to readable string
 * @param date - Date object or ISO string
 * @returns Formatted date string (e.g., "November 28, 2025")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date and time to readable string
 * @param date - Date object or ISO string
 * @returns Formatted datetime string (e.g., "November 28, 2025 at 2:30 PM")
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

