/**
 * Points System Business Logic
 *
 * This module handles all calculations and validations for the participation points system.
 * Points can be used for discounts on shop purchases but have NO CASH VALUE.
 *
 * Key Rules:
 * - 1,000 points = $1.00 USD discount
 * - Maximum 50% off any single item
 * - Maximum $30.00 off total order
 * - Shipping & taxes ALWAYS paid in full (never covered by points)
 * - Points expire 12 months after being earned
 * - Monthly earning cap of 10,000 points per user
 */

import { PointsSettings, OrderItem, ShopOrder } from '@/types/types';

// Default points settings (used if no custom settings exist)
export const DEFAULT_POINTS_SETTINGS: Omit<PointsSettings, 'id' | 'updatedAt' | 'updatedBy'> = {
  conversionRate: 1000,              // 1000 points = $1.00
  perItemDiscountCap: 50,            // 50% max discount per item
  perOrderDiscountCap: 3000,         // $30.00 max discount per order (in cents)
  monthlyEarningCap: 10000,          // 10,000 points max per month
  expirationMonths: 12,              // Points expire after 12 months
  earningValues: {
    eventAttendance: 100,
    volunteerWork: 250,
    eventHosting: 500,
    contributionMin: 50,
    contributionMax: 150,
  },
  approvedEmailDomains: ['.edu', 'belhaven.edu'],
  approvedEmails: [],
};

/**
 * Calculate the maximum discount allowed for a single item
 * Respects the per-item discount cap (default 50%)
 */
export function calculateMaxItemDiscount(
  itemPrice: number,
  settings: PointsSettings = DEFAULT_POINTS_SETTINGS as PointsSettings
): number {
  const maxDiscountPercent = settings.perItemDiscountCap / 100;
  return Math.floor(itemPrice * maxDiscountPercent);
}

/**
 * Calculate the maximum discount allowed for an entire order
 * Respects the per-order discount cap (default $30.00)
 */
export function calculateMaxOrderDiscount(
  settings: PointsSettings = DEFAULT_POINTS_SETTINGS as PointsSettings
): number {
  return settings.perOrderDiscountCap; // Already in cents
}

/**
 * Convert points to discount amount in cents
 */
export function pointsToDiscount(
  points: number,
  settings: PointsSettings = DEFAULT_POINTS_SETTINGS as PointsSettings
): number {
  // conversionRate points = $1.00 (100 cents)
  return Math.floor((points / settings.conversionRate) * 100);
}

/**
 * Convert discount amount in cents to points required
 */
export function discountToPoints(
  discountCents: number,
  settings: PointsSettings = DEFAULT_POINTS_SETTINGS as PointsSettings
): number {
  // $1.00 (100 cents) = conversionRate points
  return Math.ceil((discountCents / 100) * settings.conversionRate);
}

/**
 * Calculate the legal discount for a cart, respecting all caps
 * Returns the actual discount amount in cents and points required
 */
export function calculateCartDiscount(
  items: OrderItem[],
  pointsToUse: number,
  settings: PointsSettings = DEFAULT_POINTS_SETTINGS as PointsSettings
): {
  discountCents: number;
  pointsUsed: number;
  itemDiscounts: { productId: string; discountCents: number }[];
  cappedByItemLimit: boolean;
  cappedByOrderLimit: boolean;
} {
  // Calculate subtotal and eligible items
  const eligibleItems = items.filter(item => item.pointsEligible);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (eligibleItems.length === 0 || pointsToUse <= 0) {
    return {
      discountCents: 0,
      pointsUsed: 0,
      itemDiscounts: [],
      cappedByItemLimit: false,
      cappedByOrderLimit: false,
    };
  }

  // Convert points to discount amount
  const requestedDiscount = pointsToDiscount(pointsToUse, settings);

  // Apply per-order cap
  const maxOrderDiscount = calculateMaxOrderDiscount(settings);
  const totalDiscount = Math.min(requestedDiscount, maxOrderDiscount);
  const cappedByOrderLimit = requestedDiscount > maxOrderDiscount;

  // Apply per-item caps
  const itemDiscounts: { productId: string; discountCents: number }[] = [];
  let remainingDiscount = totalDiscount;
  let cappedByItemLimit = false;

  // Distribute discount across eligible items proportionally
  const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  for (const item of eligibleItems) {
    const itemTotal = item.price * item.quantity;
    const maxItemDiscount = calculateMaxItemDiscount(itemTotal, settings);

    // Calculate proportional discount for this item
    const proportionalDiscount = Math.floor((itemTotal / eligibleSubtotal) * totalDiscount);

    // Apply per-item cap
    const actualItemDiscount = Math.min(proportionalDiscount, maxItemDiscount);

    if (actualItemDiscount < proportionalDiscount) {
      cappedByItemLimit = true;
    }

    itemDiscounts.push({
      productId: item.productId,
      discountCents: actualItemDiscount,
    });

    remainingDiscount -= actualItemDiscount;
  }

  // Calculate final discount and points used
  const finalDiscount = totalDiscount - Math.max(0, remainingDiscount);
  const pointsUsed = discountToPoints(finalDiscount, settings);

  return {
    discountCents: finalDiscount,
    pointsUsed,
    itemDiscounts,
    cappedByItemLimit,
    cappedByOrderLimit,
  };
}

/**
 * Check if user has exceeded monthly earning cap
 */
export function hasExceededMonthlyCap(
  monthlyPointsEarned: number,
  pointsToAdd: number,
  settings: PointsSettings = DEFAULT_POINTS_SETTINGS as PointsSettings
): boolean {
  return (monthlyPointsEarned + pointsToAdd) > settings.monthlyEarningCap;
}

/**
 * Calculate points to award with multiplier applied
 */
export function calculatePointsWithMultiplier(
  basePoints: number,
  multiplier: number = 1.0
): number {
  return Math.floor(basePoints * multiplier);
}

/**
 * Check if email is eligible for points program
 */
export function isEmailEligible(
  email: string,
  settings: PointsSettings = DEFAULT_POINTS_SETTINGS as PointsSettings
): boolean {
  const lowerEmail = email.toLowerCase();

  // Check approved email list
  if (settings.approvedEmails.some(approved => approved.toLowerCase() === lowerEmail)) {
    return true;
  }

  // Check approved domains
  return settings.approvedEmailDomains.some(domain =>
    lowerEmail.endsWith(domain.toLowerCase())
  );
}

/**
 * Calculate expiration date for points
 */
export function calculateExpirationDate(
  earnedDate: Date,
  settings: PointsSettings = DEFAULT_POINTS_SETTINGS as PointsSettings
): Date {
  const expirationDate = new Date(earnedDate);
  expirationDate.setMonth(expirationDate.getMonth() + settings.expirationMonths);
  return expirationDate;
}

/**
 * Check if points have expired
 */
export function arePointsExpired(expirationDate: Date): boolean {
  return new Date() > expirationDate;
}

/**
 * Format points as currency discount
 * Example: 5000 points -> "$5.00"
 */
export function formatPointsAsDiscount(
  points: number,
  settings: PointsSettings = DEFAULT_POINTS_SETTINGS as PointsSettings
): string {
  const discountCents = pointsToDiscount(points, settings);
  const dollars = discountCents / 100;
  return `$${dollars.toFixed(2)}`;
}

/**
 * Format currency cents as display string
 * Example: 2500 cents -> "$25.00"
 */
export function formatCents(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

/**
 * Validate points transaction amount
 */
export function validatePointsAmount(
  amount: number,
  category: string,
  settings: PointsSettings = DEFAULT_POINTS_SETTINGS as PointsSettings
): { valid: boolean; error?: string } {
  if (amount <= 0) {
    return { valid: false, error: 'Points amount must be positive' };
  }

  // Validate contribution points are within range
  if (category === 'contribution') {
    const { contributionMin, contributionMax } = settings.earningValues;
    if (amount < contributionMin || amount > contributionMax) {
      return {
        valid: false,
        error: `Contribution points must be between ${contributionMin} and ${contributionMax}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Calculate order breakdown for display
 */
export function calculateOrderBreakdown(
  items: OrderItem[],
  pointsDiscount: number,
  shipping: number,
  tax: number
): {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal - pointsDiscount + shipping + tax;

  return {
    subtotal,
    discount: pointsDiscount,
    shipping,
    tax,
    total: Math.max(0, total), // Ensure total is never negative
  };
}
