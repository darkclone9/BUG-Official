/**
 * Store Credit Business Logic
 *
 * This module contains all business logic for the store credit system,
 * including discount calculations, validation, and cap enforcement.
 */

import { StoreCreditSettings, StoreCreditTransaction, StoreCreditMultiplier, User } from '@/types/types';

// ============================================================================
// DISCOUNT CALCULATION
// ============================================================================

/**
 * Calculate the maximum store credit discount that can be applied to an item
 *
 * @param itemPriceCents - Item price in cents
 * @param availableCreditCents - User's available credit in cents
 * @param settings - Store credit settings (for caps)
 * @returns Maximum discount in cents that can be applied to this item
 */
export function calculateItemMaxDiscount(
  itemPriceCents: number,
  availableCreditCents: number,
  settings: StoreCreditSettings
): number {
  // Calculate 50% cap (or configured cap)
  const perItemCapPercent = settings.perItemDiscountCap;
  const maxDiscountByPercentage = Math.floor((itemPriceCents * perItemCapPercent) / 100);

  // Return the minimum of: available credit, 50% of item price
  return Math.min(availableCreditCents, maxDiscountByPercentage);
}

/**
 * Calculate store credit discount for an entire order
 *
 * @param items - Array of cart items with prices
 * @param creditToUseCents - Amount of credit user wants to use in cents
 * @param availableCreditCents - User's available credit in cents
 * @param settings - Store credit settings
 * @returns Object with discount breakdown and validation
 */
export function calculateStoreCreditDiscount(
  items: { priceCents: number; quantity: number; pointsEligible: boolean }[],
  creditToUseCents: number,
  availableCreditCents: number,
  settings: StoreCreditSettings
): {
  isValid: boolean;
  discountCents: number;
  errorMessage?: string;
  itemDiscounts: { itemIndex: number; discountCents: number }[];
} {
  // Validation: Check if user has enough credit
  if (creditToUseCents > availableCreditCents) {
    return {
      isValid: false,
      discountCents: 0,
      errorMessage: 'Insufficient store credit balance',
      itemDiscounts: [],
    };
  }

  // Validation: Check if credit amount is positive
  if (creditToUseCents < 0) {
    return {
      isValid: false,
      discountCents: 0,
      errorMessage: 'Credit amount must be positive',
      itemDiscounts: [],
    };
  }

  // Calculate eligible items total and max discounts
  const eligibleItems = items
    .map((item, index) => ({
      index,
      priceCents: item.priceCents * item.quantity,
      maxDiscount: calculateItemMaxDiscount(
        item.priceCents * item.quantity,
        availableCreditCents,
        settings
      ),
      pointsEligible: item.pointsEligible,
    }))
    .filter(item => item.pointsEligible);

  if (eligibleItems.length === 0) {
    return {
      isValid: false,
      discountCents: 0,
      errorMessage: 'No items eligible for store credit discount',
      itemDiscounts: [],
    };
  }

  // Calculate total max discount across all items
  const totalMaxDiscount = eligibleItems.reduce((sum, item) => sum + item.maxDiscount, 0);

  // Apply per-order cap
  const perOrderCap = settings.perOrderDiscountCap;
  const maxAllowedDiscount = Math.min(totalMaxDiscount, perOrderCap);

  // Validate requested credit doesn't exceed max allowed
  if (creditToUseCents > maxAllowedDiscount) {
    return {
      isValid: false,
      discountCents: 0,
      errorMessage: `Maximum discount for this order is $${(maxAllowedDiscount / 100).toFixed(2)}`,
      itemDiscounts: [],
    };
  }

  // Distribute discount across items proportionally
  const itemDiscounts = distributeDiscountAcrossItems(
    eligibleItems,
    creditToUseCents
  );

  return {
    isValid: true,
    discountCents: creditToUseCents,
    itemDiscounts: itemDiscounts.map(d => ({
      itemIndex: d.index,
      discountCents: d.discount,
    })),
  };
}

/**
 * Distribute discount across items proportionally
 */
function distributeDiscountAcrossItems(
  items: { index: number; priceCents: number; maxDiscount: number }[],
  totalDiscountCents: number
): { index: number; discount: number }[] {
  const totalPrice = items.reduce((sum, item) => sum + item.priceCents, 0);
  let remainingDiscount = totalDiscountCents;
  const discounts: { index: number; discount: number }[] = [];

  items.forEach((item, i) => {
    const proportionalDiscount = Math.floor((item.priceCents / totalPrice) * totalDiscountCents);
    const actualDiscount = Math.min(proportionalDiscount, item.maxDiscount, remainingDiscount);

    discounts.push({
      index: item.index,
      discount: actualDiscount,
    });

    remainingDiscount -= actualDiscount;
  });

  return discounts;
}

/**
 * Apply store credit discount to order total
 *
 * @param orderTotalCents - Order total before discount
 * @param creditDiscountCents - Credit discount to apply
 * @returns Final order total after discount
 */
export function applyStoreCreditToOrder(
  orderTotalCents: number,
  creditDiscountCents: number
): number {
  const finalTotal = orderTotalCents - creditDiscountCents;
  return Math.max(0, finalTotal); // Never go below 0
}

// ============================================================================
// TRANSACTION VALIDATION
// ============================================================================

/**
 * Validate a store credit transaction before processing
 *
 * @param transaction - Transaction to validate
 * @param user - User making the transaction
 * @param settings - Store credit settings
 * @returns Validation result
 */
export function validateStoreCreditTransaction(
  transaction: Partial<StoreCreditTransaction>,
  user: User,
  settings: StoreCreditSettings
): {
  isValid: boolean;
  errorMessage?: string;
} {
  // Check if amount is valid
  if (!transaction.amountCents || transaction.amountCents === 0) {
    return {
      isValid: false,
      errorMessage: 'Transaction amount must be non-zero',
    };
  }

  // For spending transactions (negative amount)
  if (transaction.amountCents < 0) {
    const userBalance = user.storeCreditBalance || 0;
    const spendAmount = Math.abs(transaction.amountCents);

    if (spendAmount > userBalance) {
      return {
        isValid: false,
        errorMessage: `Insufficient balance. Available: $${(userBalance / 100).toFixed(2)}`,
      };
    }
  }

  // For earning transactions (positive amount)
  if (transaction.amountCents > 0) {
    // Check monthly earning cap
    const monthlyEarned = user.monthlyStoreCreditEarned || 0;
    const monthlyCap = settings.monthlyEarningCap;

    if (monthlyEarned + transaction.amountCents > monthlyCap) {
      const remaining = monthlyCap - monthlyEarned;
      return {
        isValid: false,
        errorMessage: `Monthly earning cap reached. Remaining: $${(remaining / 100).toFixed(2)}`,
      };
    }
  }

  // Check if category is valid
  if (!transaction.category) {
    return {
      isValid: false,
      errorMessage: 'Transaction category is required',
    };
  }

  return { isValid: true };
}

// ============================================================================
// MONTHLY CAP ENFORCEMENT
// ============================================================================

/**
 * Check if user has reached monthly earning cap
 *
 * @param user - User to check
 * @param settings - Store credit settings
 * @returns Object with cap status and remaining amount
 */
export function checkMonthlyEarningCap(
  user: User,
  settings: StoreCreditSettings
): {
  hasReachedCap: boolean;
  remainingCents: number;
  monthlyEarnedCents: number;
  monthlyCapCents: number;
} {
  const monthlyEarned = user.monthlyStoreCreditEarned || 0;
  const monthlyCap = settings.monthlyEarningCap;
  const remaining = Math.max(0, monthlyCap - monthlyEarned);

  return {
    hasReachedCap: monthlyEarned >= monthlyCap,
    remainingCents: remaining,
    monthlyEarnedCents: monthlyEarned,
    monthlyCapCents: monthlyCap,
  };
}

/**
 * Check if monthly cap needs to be reset (new month)
 *
 * @param lastResetDate - Last time cap was reset
 * @returns True if cap should be reset
 */
export function shouldResetMonthlyCap(lastResetDate?: Date): boolean {
  if (!lastResetDate) return true;

  const now = new Date();
  const lastReset = new Date(lastResetDate);

  // Check if we're in a different month
  return (
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear()
  );
}

// ============================================================================
// MULTIPLIER APPLICATION
// ============================================================================

/**
 * Apply multiplier to credit amount if applicable
 *
 * @param baseCreditCents - Base credit amount before multiplier
 * @param activeMultipliers - Active multiplier campaigns
 * @param category - Transaction category
 * @returns Object with final amount and applied multiplier info
 */
export function applyMultiplier(
  baseCreditCents: number,
  activeMultipliers: StoreCreditMultiplier[],
  category: string
): {
  finalCreditCents: number;
  multiplierApplied?: number;
  multiplierCampaignId?: string;
} {
  // Find applicable multiplier (highest one if multiple)
  const applicableMultipliers = activeMultipliers.filter(
    m => m.isActive && m.applicableCategories.includes(category as any)
  );

  if (applicableMultipliers.length === 0) {
    return { finalCreditCents: baseCreditCents };
  }

  // Get highest multiplier
  const bestMultiplier = applicableMultipliers.reduce((best, current) =>
    current.multiplier > best.multiplier ? current : best
  );

  const finalAmount = Math.floor(baseCreditCents * bestMultiplier.multiplier);

  return {
    finalCreditCents: finalAmount,
    multiplierApplied: bestMultiplier.multiplier,
    multiplierCampaignId: bestMultiplier.id,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format cents to dollar string
 *
 * @param cents - Amount in cents
 * @returns Formatted dollar string (e.g., "$5.00")
 */
export function formatCentsToDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Convert dollars to cents
 *
 * @param dollars - Amount in dollars
 * @returns Amount in cents
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollars
 *
 * @param cents - Amount in cents
 * @returns Amount in dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}
