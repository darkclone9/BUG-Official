/**
 * Unit Tests for Store Credit Business Logic
 *
 * Run with: npx tsx src/__tests__/storeCredit.test.ts
 */

import {
  calculateItemMaxDiscount,
  calculateStoreCreditDiscount,
  applyStoreCreditToOrder,
  validateStoreCreditTransaction,
  checkMonthlyEarningCap,
  shouldResetMonthlyCap,
  applyMultiplier,
  formatCentsToDollars,
  dollarsToCents,
  centsToDollars,
} from '../lib/storeCredit';
import { StoreCreditSettings, StoreCreditTransaction, StoreCreditMultiplier, User } from '../types/types';

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    testsFailed++;
  }
}

function assertEquals(actual: any, expected: any, message: string) {
  const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
  if (isEqual) {
    console.log(`✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    console.error(`  Expected: ${JSON.stringify(expected)}`);
    console.error(`  Actual: ${JSON.stringify(actual)}`);
    testsFailed++;
  }
}

// Default test settings
const defaultSettings: StoreCreditSettings = {
  perItemDiscountCap: 50, // 50%
  perOrderDiscountCap: 3000, // $30.00
  monthlyEarningCap: 5000, // $50.00
  earningValues: {
    eventAttendance: 100, // $1.00
    volunteerWork: 250, // $2.50
    eventHosting: 500, // $5.00
    contributionMin: 50, // $0.50
    contributionMax: 150, // $1.50
  },
};

console.log('\n🧪 Running Store Credit Business Logic Tests...\n');

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

console.log('📦 Testing Utility Functions\n');

// Test formatCentsToDollars
assertEquals(formatCentsToDollars(100), '$1.00', 'formatCentsToDollars(100) should return $1.00');
assertEquals(formatCentsToDollars(1050), '$10.50', 'formatCentsToDollars(1050) should return $10.50');
assertEquals(formatCentsToDollars(0), '$0.00', 'formatCentsToDollars(0) should return $0.00');
assertEquals(formatCentsToDollars(5), '$0.05', 'formatCentsToDollars(5) should return $0.05');

// Test dollarsToCents
assertEquals(dollarsToCents(1), 100, 'dollarsToCents(1) should return 100');
assertEquals(dollarsToCents(10.50), 1050, 'dollarsToCents(10.50) should return 1050');
assertEquals(dollarsToCents(0), 0, 'dollarsToCents(0) should return 0');

// Test centsToDollars
assertEquals(centsToDollars(100), 1, 'centsToDollars(100) should return 1');
assertEquals(centsToDollars(1050), 10.5, 'centsToDollars(1050) should return 10.5');
assertEquals(centsToDollars(0), 0, 'centsToDollars(0) should return 0');

// ============================================================================
// DISCOUNT CALCULATION TESTS
// ============================================================================

console.log('\n💰 Testing Discount Calculations\n');

// Test calculateItemMaxDiscount - 50% cap
const itemPrice1 = 2000; // $20.00
const maxDiscount1 = calculateItemMaxDiscount(itemPrice1, 5000, defaultSettings);
assertEquals(maxDiscount1, 1000, 'Max discount for $20 item should be $10 (50% cap)');

// Test calculateItemMaxDiscount - available credit limit
const itemPrice2 = 10000; // $100.00
const availableCredit = 500; // $5.00
const maxDiscount2 = calculateItemMaxDiscount(itemPrice2, availableCredit, defaultSettings);
assertEquals(maxDiscount2, 500, 'Max discount should be limited by available credit ($5.00)');

// Test calculateStoreCreditDiscount - valid discount
const items1 = [
  { priceCents: 2000, quantity: 1, pointsEligible: true }, // $20.00
  { priceCents: 3000, quantity: 1, pointsEligible: true }, // $30.00
];
const result1 = calculateStoreCreditDiscount(items1, 1000, 5000, defaultSettings);
assert(result1.isValid, 'Discount calculation should be valid');
assertEquals(result1.discountCents, 1000, 'Discount should be $10.00');

// Test calculateStoreCreditDiscount - insufficient credit
const result2 = calculateStoreCreditDiscount(items1, 6000, 5000, defaultSettings);
assert(!result2.isValid, 'Should fail with insufficient credit');
assert(result2.errorMessage?.includes('Insufficient'), 'Error message should mention insufficient credit');

// Test calculateStoreCreditDiscount - per-order cap
const items2 = [
  { priceCents: 10000, quantity: 1, pointsEligible: true }, // $100.00
];
const result3 = calculateStoreCreditDiscount(items2, 4000, 10000, defaultSettings);
assert(!result3.isValid, 'Should fail when exceeding per-order cap');
assert(result3.errorMessage?.includes('Maximum discount'), 'Error message should mention maximum discount');

// Test calculateStoreCreditDiscount - no eligible items
const items3 = [
  { priceCents: 2000, quantity: 1, pointsEligible: false },
];
const result4 = calculateStoreCreditDiscount(items3, 1000, 5000, defaultSettings);
assert(!result4.isValid, 'Should fail with no eligible items');
assert(result4.errorMessage?.includes('No items eligible'), 'Error message should mention no eligible items');

// Test applyStoreCreditToOrder
const orderTotal1 = 5000; // $50.00
const discount1 = 1000; // $10.00
const finalTotal1 = applyStoreCreditToOrder(orderTotal1, discount1);
assertEquals(finalTotal1, 4000, 'Final total should be $40.00 after $10 discount');

// Test applyStoreCreditToOrder - never go below 0
const orderTotal2 = 500; // $5.00
const discount2 = 1000; // $10.00
const finalTotal2 = applyStoreCreditToOrder(orderTotal2, discount2);
assertEquals(finalTotal2, 0, 'Final total should never go below $0.00');

// ============================================================================
// TRANSACTION VALIDATION TESTS
// ============================================================================

console.log('\n✅ Testing Transaction Validation\n');

const testUser: User = {
  uid: 'test-user',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'member',
  roles: ['member'],
  storeCreditBalance: 1000,
  storeCreditEarned: 1000,
  storeCreditSpent: 0,
  monthlyStoreCreditEarned: 2000,
  lastStoreCreditMonthlyReset: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Test valid transaction
const validTransaction: Omit<StoreCreditTransaction, 'id' | 'timestamp'> = {
  userId: 'test-user',
  amountCents: 100,
  reason: 'Event attendance',
  category: 'event_attendance',
  approvalStatus: 'pending',
};
const validationResult1 = validateStoreCreditTransaction(validTransaction, testUser, defaultSettings);
assert(validationResult1.isValid, 'Valid transaction should pass validation');

// Test negative earning amount
const negativeTransaction: Omit<StoreCreditTransaction, 'id' | 'timestamp'> = {
  ...validTransaction,
  amountCents: -100,
};
const validationResult2 = validateStoreCreditTransaction(negativeTransaction, testUser, defaultSettings);
assert(validationResult2.isValid, 'Negative amounts (spending) should be valid');

// Test monthly cap exceeded
const testUserNearCap: User = {
  ...testUser,
  monthlyStoreCreditEarned: 4900, // $49.00 earned
};
const largeTransaction: Omit<StoreCreditTransaction, 'id' | 'timestamp'> = {
  ...validTransaction,
  amountCents: 200, // $2.00 would exceed $50 cap
};
const validationResult3 = validateStoreCreditTransaction(largeTransaction, testUserNearCap, defaultSettings);
assert(!validationResult3.isValid, 'Should fail when exceeding monthly cap');
assert(validationResult3.errorMessage?.includes('Monthly earning cap'), 'Error should mention monthly cap');

// ============================================================================
// MONTHLY CAP TESTS
// ============================================================================

console.log('\n📅 Testing Monthly Cap Logic\n');

// Test checkMonthlyEarningCap - under cap
const capCheck1 = checkMonthlyEarningCap(testUser, defaultSettings);
assert(!capCheck1.hasReachedCap, 'User should be able to earn when under cap');
assertEquals(capCheck1.remainingCents, 3000, 'Should have $30 remaining (cap $50 - earned $20)');

// Test checkMonthlyEarningCap - at cap
const testUserAtCap: User = {
  ...testUser,
  monthlyStoreCreditEarned: 5000,
};
const capCheck2 = checkMonthlyEarningCap(testUserAtCap, defaultSettings);
assert(capCheck2.hasReachedCap, 'User should have reached cap');
assertEquals(capCheck2.remainingCents, 0, 'No amount should be remaining');

// Test checkMonthlyEarningCap - partial amount allowed
const testUserNearCap2: User = {
  ...testUser,
  monthlyStoreCreditEarned: 4950, // $49.50
};
const capCheck3 = checkMonthlyEarningCap(testUserNearCap2, defaultSettings);
assert(!capCheck3.hasReachedCap, 'User should not have reached cap yet');
assertEquals(capCheck3.remainingCents, 50, 'Only $0.50 should be remaining');

// Test shouldResetMonthlyCap - same month
const lastReset1 = new Date();
const shouldReset1 = shouldResetMonthlyCap(lastReset1);
assert(!shouldReset1, 'Should not reset cap in same month');

// Test shouldResetMonthlyCap - different month
const lastReset2 = new Date();
lastReset2.setMonth(lastReset2.getMonth() - 1);
const shouldReset2 = shouldResetMonthlyCap(lastReset2);
assert(shouldReset2, 'Should reset cap in different month');

// ============================================================================
// MULTIPLIER TESTS
// ============================================================================

console.log('\n⚡ Testing Multiplier Logic\n');

const testMultiplier: StoreCreditMultiplier = {
  id: 'test-multiplier',
  name: 'Double Credit Weekend',
  description: 'Earn 2x credit',
  multiplier: 2.0,
  startDate: new Date(Date.now() - 86400000), // Yesterday
  endDate: new Date(Date.now() + 86400000), // Tomorrow
  applicableCategories: ['event_attendance'],
  isActive: true,
  createdAt: new Date(),
  createdBy: 'admin',
};

// Test applyMultiplier - matching category
const baseAmount1 = 100;
const multipliedResult1 = applyMultiplier(baseAmount1, [testMultiplier], 'event_attendance');
assertEquals(multipliedResult1.finalCreditCents, 200, 'Amount should be doubled with 2x multiplier');
assertEquals(multipliedResult1.multiplierApplied, 2.0, 'Multiplier should be 2.0');

// Test applyMultiplier - non-matching category
const multipliedResult2 = applyMultiplier(baseAmount1, [testMultiplier], 'volunteer_work');
assertEquals(multipliedResult2.finalCreditCents, 100, 'Amount should not change for non-matching category');
assert(!multipliedResult2.multiplierApplied, 'No multiplier should be applied');

// Test applyMultiplier - inactive multiplier
const inactiveMultiplier: StoreCreditMultiplier = {
  ...testMultiplier,
  isActive: false,
};
const multipliedResult3 = applyMultiplier(baseAmount1, [inactiveMultiplier], 'event_attendance');
assertEquals(multipliedResult3.finalCreditCents, 100, 'Inactive multiplier should not apply');

// Test applyMultiplier - expired multiplier (note: expiration check happens in database query, not in this function)
const expiredMultiplier: StoreCreditMultiplier = {
  ...testMultiplier,
  endDate: new Date(Date.now() - 86400000), // Yesterday
};
const multipliedResult4 = applyMultiplier(baseAmount1, [expiredMultiplier], 'event_attendance');
// Note: The function doesn't check expiration, that's done when fetching active multipliers
assertEquals(multipliedResult4.finalCreditCents, 200, 'Function applies multiplier (expiration checked elsewhere)');

// Test applyMultiplier - multiple multipliers
const multiplier2: StoreCreditMultiplier = {
  ...testMultiplier,
  id: 'test-multiplier-2',
  multiplier: 1.5,
};
const multipliedResult5 = applyMultiplier(baseAmount1, [testMultiplier, multiplier2], 'event_attendance');
assertEquals(multipliedResult5.finalCreditCents, 200, 'Should use highest multiplier (2.0)');
assertEquals(multipliedResult5.multiplierApplied, 2.0, 'Should report 2.0 as applied multiplier');

// ============================================================================
// EDGE CASES
// ============================================================================

console.log('\n🔍 Testing Edge Cases\n');

// Test zero amounts
const zeroDiscount = calculateStoreCreditDiscount(items1, 0, 5000, defaultSettings);
assert(zeroDiscount.isValid, 'Zero discount should be valid');
assertEquals(zeroDiscount.discountCents, 0, 'Zero discount should result in 0');

// Test very large amounts
const largeItems = [
  { priceCents: 1000000, quantity: 1, pointsEligible: true }, // $10,000
];
const largeResult = calculateStoreCreditDiscount(largeItems, 3000, 10000, defaultSettings);
assert(largeResult.isValid, 'Large amounts should be handled correctly');
assertEquals(largeResult.discountCents, 3000, 'Should respect per-order cap');

// Test multiple items with mixed eligibility
const mixedItems = [
  { priceCents: 2000, quantity: 1, pointsEligible: true },
  { priceCents: 3000, quantity: 1, pointsEligible: false },
  { priceCents: 1000, quantity: 2, pointsEligible: true },
];
const mixedResult = calculateStoreCreditDiscount(mixedItems, 1500, 5000, defaultSettings);
assert(mixedResult.isValid, 'Mixed eligibility should work');
assert(mixedResult.discountCents > 0, 'Should apply discount to eligible items only');

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('📊 Test Summary');
console.log('='.repeat(60));
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📈 Total: ${testsPassed + testsFailed}`);
console.log(`🎯 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)}%`);
console.log('='.repeat(60) + '\n');

if (testsFailed > 0) {
  process.exit(1);
}
