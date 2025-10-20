/**
 * Store Credit Edge Cases Test Script
 *
 * This script tests edge cases and error handling:
 * - Insufficient credit scenarios
 * - Expired multipliers
 * - Invalid amounts
 * - Boundary conditions
 * - Error messages
 *
 * Usage:
 *   npx tsx scripts/testStoreCreditEdgeCases.ts
 */

import {
  calculateItemMaxDiscount,
  calculateStoreCreditDiscount,
  validateStoreCreditTransaction,
  checkMonthlyEarningCap,
  applyMultiplier,
  formatCentsToDollars,
  dollarsToCents,
} from '../src/lib/storeCredit';
import { StoreCreditSettings, StoreCreditTransaction, StoreCreditMultiplier, User } from '../src/types/types';

// Test results tracking
interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

const testResults: TestResult[] = [];

function logTest(testName: string, passed: boolean, message: string, details?: any) {
  testResults.push({ testName, passed, message, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${testName}: ${message}`);
  if (details) {
    console.log(`   Details:`, JSON.stringify(details, null, 2));
  }
}

// Default settings
const defaultSettings: StoreCreditSettings = {
  id: 'default',
  perItemDiscountCap: 50,
  perOrderDiscountCap: 3000,
  monthlyEarningCap: 5000,
  earningValues: {
    eventAttendance: 100,
    volunteerWork: 250,
    eventHosting: 500,
    contributionMin: 50,
    contributionMax: 150,
  },
  updatedAt: new Date(),
  updatedBy: 'test_script',
};

/**
 * Test 1: Insufficient Credit Scenarios
 */
function testInsufficientCredit() {
  console.log('\n💳 Test 1: Insufficient Credit Scenarios');
  console.log('='.repeat(60));

  const items = [
    { priceCents: 5000, quantity: 1, pointsEligible: true },
  ];

  // Scenario 1: Try to use more credit than available
  const result1 = calculateStoreCreditDiscount(items, 10000, 1000, defaultSettings);
  logTest('Insufficient Credit Detection', !result1.isValid,
    result1.isValid ? 'Should reject insufficient credit' : 'Correctly rejected',
    { requested: '$100.00', available: '$10.00', error: result1.errorMessage }
  );

  // Scenario 2: Exactly at limit
  const result2 = calculateStoreCreditDiscount(items, 1000, 1000, defaultSettings);
  logTest('Exact Credit Limit', result2.isValid,
    result2.isValid ? 'Accepted credit at exact limit' : 'Should accept exact limit'
  );

  // Scenario 3: One cent over limit
  const result3 = calculateStoreCreditDiscount(items, 1001, 1000, defaultSettings);
  logTest('One Cent Over Limit', !result3.isValid,
    result3.isValid ? 'Should reject one cent over' : 'Correctly rejected'
  );
}

/**
 * Test 2: Expired Multipliers
 */
function testExpiredMultipliers() {
  console.log('\n⏰ Test 2: Expired Multipliers');
  console.log('='.repeat(60));

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Expired multiplier (ended yesterday)
  const expiredMultiplier: StoreCreditMultiplier = {
    id: 'expired_test',
    name: 'Expired Multiplier',
    description: 'Test expired multiplier',
    multiplier: 2.0,
    applicableCategories: ['event_attendance'],
    isActive: true,
    startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    endDate: yesterday,
    createdAt: new Date(),
    createdBy: 'test',
  };

  // Active multiplier
  const activeMultiplier: StoreCreditMultiplier = {
    id: 'active_test',
    name: 'Active Multiplier',
    description: 'Test active multiplier',
    multiplier: 2.0,
    applicableCategories: ['event_attendance'],
    isActive: true,
    startDate: yesterday,
    endDate: nextWeek,
    createdAt: new Date(),
    createdBy: 'test',
  };

  // Future multiplier (starts tomorrow)
  const futureMultiplier: StoreCreditMultiplier = {
    id: 'future_test',
    name: 'Future Multiplier',
    description: 'Test future multiplier',
    multiplier: 2.0,
    applicableCategories: ['event_attendance'],
    isActive: true,
    startDate: tomorrow,
    endDate: nextWeek,
    createdAt: new Date(),
    createdBy: 'test',
  };

  const baseAmount = 100;

  // Test expired multiplier (should not apply)
  const expiredResult = applyMultiplier(baseAmount, [expiredMultiplier], 'event_attendance');
  logTest('Expired Multiplier Not Applied', expiredResult.finalCreditCents === baseAmount,
    expiredResult.finalCreditCents === baseAmount ? 'Correctly ignored expired multiplier' : 'Should not apply expired multiplier',
    { baseAmount: formatCentsToDollars(baseAmount), result: formatCentsToDollars(expiredResult.finalCreditCents) }
  );

  // Test active multiplier (should apply)
  const activeResult = applyMultiplier(baseAmount, [activeMultiplier], 'event_attendance');
  logTest('Active Multiplier Applied', activeResult.finalCreditCents === baseAmount * 2,
    activeResult.finalCreditCents === baseAmount * 2 ? 'Correctly applied active multiplier' : 'Should apply active multiplier',
    { baseAmount: formatCentsToDollars(baseAmount), result: formatCentsToDollars(activeResult.finalCreditCents), multiplier: activeResult.multiplierApplied }
  );

  // Test future multiplier (should not apply)
  const futureResult = applyMultiplier(baseAmount, [futureMultiplier], 'event_attendance');
  logTest('Future Multiplier Not Applied', futureResult.finalCreditCents === baseAmount,
    futureResult.finalCreditCents === baseAmount ? 'Correctly ignored future multiplier' : 'Should not apply future multiplier',
    { baseAmount: formatCentsToDollars(baseAmount), result: formatCentsToDollars(futureResult.finalCreditCents) }
  );
}

/**
 * Test 3: Invalid Amounts
 */
function testInvalidAmounts() {
  console.log('\n🚫 Test 3: Invalid Amounts');
  console.log('='.repeat(60));

  const items = [
    { priceCents: 2000, quantity: 1, pointsEligible: true },
  ];

  // Negative credit
  const negativeResult = calculateStoreCreditDiscount(items, -100, 5000, defaultSettings);
  logTest('Negative Credit Rejected', !negativeResult.isValid,
    negativeResult.isValid ? 'Should reject negative credit' : 'Correctly rejected negative credit',
    { error: negativeResult.errorMessage }
  );

  // Zero credit (should be valid but no discount)
  const zeroResult = calculateStoreCreditDiscount(items, 0, 5000, defaultSettings);
  logTest('Zero Credit Accepted', zeroResult.isValid && zeroResult.discountCents === 0,
    'Zero credit is valid with no discount'
  );

  // Very large amount (exceeds order total)
  const largeResult = calculateStoreCreditDiscount(items, 1000000, 1000000, defaultSettings);
  logTest('Excessive Credit Capped', !largeResult.isValid,
    largeResult.isValid ? 'Should cap excessive credit' : 'Correctly capped to order limits',
    { error: largeResult.errorMessage }
  );

  // Fractional cents (should work)
  const fractionalResult = calculateStoreCreditDiscount(items, 1, 5000, defaultSettings);
  logTest('Fractional Cents Handled', fractionalResult.isValid,
    fractionalResult.isValid ? 'Correctly handled 1 cent' : 'Should handle fractional amounts'
  );
}

/**
 * Test 4: Monthly Earning Cap
 */
function testMonthlyEarningCap() {
  console.log('\n📅 Test 4: Monthly Earning Cap');
  console.log('='.repeat(60));

  const mockUser: Partial<User> = {
    uid: 'test_user',
    email: 'test@example.com',
    storeCreditBalance: 0,
    storeCreditEarned: 0,
    storeCreditSpent: 0,
    monthlyStoreCreditEarned: 4500, // $45.00 already earned
    lastMonthlyReset: new Date(),
  };

  const monthlyCap = defaultSettings.monthlyEarningCap; // $50.00

  // Scenario 1: Within cap ($5.00 more, total $50.00)
  const withinCapResult = checkMonthlyEarningCap(
    mockUser as User,
    500, // $5.00
    defaultSettings
  );
  logTest('Within Monthly Cap', withinCapResult.canEarn,
    withinCapResult.canEarn ? 'Can earn within cap' : 'Should allow earning within cap',
    { currentEarned: '$45.00', toEarn: '$5.00', cap: '$50.00' }
  );

  // Scenario 2: Exactly at cap ($5.00 more, total $50.00)
  const atCapResult = checkMonthlyEarningCap(
    mockUser as User,
    500,
    defaultSettings
  );
  logTest('At Monthly Cap Limit', atCapResult.canEarn && atCapResult.amountCents === 500,
    'Can earn up to exact cap'
  );

  // Scenario 3: Exceeds cap ($10.00 more, would be $55.00)
  const exceedsCapResult = checkMonthlyEarningCap(
    mockUser as User,
    1000, // $10.00
    defaultSettings
  );
  logTest('Exceeds Monthly Cap', !exceedsCapResult.canEarn || exceedsCapResult.amountCents < 1000,
    !exceedsCapResult.canEarn ? 'Correctly prevented exceeding cap' : 'Capped to remaining amount',
    {
      canEarn: exceedsCapResult.canEarn,
      allowed: formatCentsToDollars(exceedsCapResult.amountCents),
      remaining: formatCentsToDollars(exceedsCapResult.remainingCents)
    }
  );

  // Scenario 4: Already at cap
  const atCapUser: Partial<User> = {
    ...mockUser,
    monthlyStoreCreditEarned: 5000, // $50.00 (at cap)
  };

  const alreadyAtCapResult = checkMonthlyEarningCap(
    atCapUser as User,
    100,
    defaultSettings
  );
  logTest('Already At Cap', !alreadyAtCapResult.canEarn,
    !alreadyAtCapResult.canEarn ? 'Correctly prevented earning when at cap' : 'Should prevent earning at cap',
    { error: alreadyAtCapResult.errorMessage }
  );
}

/**
 * Test 5: Transaction Validation
 */
function testTransactionValidation() {
  console.log('\n✅ Test 5: Transaction Validation');
  console.log('='.repeat(60));

  const mockUser: Partial<User> = {
    uid: 'test_user',
    email: 'test@example.com',
    storeCreditBalance: 1000,
    monthlyStoreCreditEarned: 0,
  };

  // Valid earning transaction
  const validEarning: Omit<StoreCreditTransaction, 'id' | 'timestamp'> = {
    userId: 'test_user',
    amountCents: 100,
    reason: 'Event attendance',
    category: 'event_attendance',
    approvalStatus: 'approved',
  };

  const validResult = validateStoreCreditTransaction(
    validEarning,
    mockUser as User,
    defaultSettings
  );
  logTest('Valid Transaction Accepted', validResult.isValid,
    validResult.isValid ? 'Valid transaction accepted' : `Failed: ${validResult.errorMessage}`
  );

  // Invalid: Missing category
  const missingCategory: Omit<StoreCreditTransaction, 'id' | 'timestamp'> = {
    userId: 'test_user',
    amountCents: 100,
    reason: 'Test',
    category: '' as any,
    approvalStatus: 'approved',
  };

  const missingCategoryResult = validateStoreCreditTransaction(
    missingCategory,
    mockUser as User,
    defaultSettings
  );
  logTest('Missing Category Rejected', !missingCategoryResult.isValid,
    !missingCategoryResult.isValid ? 'Correctly rejected missing category' : 'Should reject missing category',
    { error: missingCategoryResult.errorMessage }
  );

  // Invalid: Spending more than balance
  const overspending: Omit<StoreCreditTransaction, 'id' | 'timestamp'> = {
    userId: 'test_user',
    amountCents: -2000, // Spending $20.00 but only have $10.00
    reason: 'Purchase',
    category: 'purchase',
    approvalStatus: 'approved',
  };

  const overspendingResult = validateStoreCreditTransaction(
    overspending,
    mockUser as User,
    defaultSettings
  );
  logTest('Overspending Rejected', !overspendingResult.isValid,
    !overspendingResult.isValid ? 'Correctly rejected overspending' : 'Should reject overspending',
    { error: overspendingResult.errorMessage }
  );
}

/**
 * Test 6: Boundary Conditions
 */
function testBoundaryConditions() {
  console.log('\n🎯 Test 6: Boundary Conditions');
  console.log('='.repeat(60));

  // Test with minimum item price (1 cent)
  const minPriceResult = calculateItemMaxDiscount(1, 10000, defaultSettings);
  logTest('Minimum Price Handling', minPriceResult === 0,
    minPriceResult === 0 ? 'Correctly handled 1 cent item (50% = 0)' : 'Should handle minimum price',
    { itemPrice: '$0.01', maxDiscount: formatCentsToDollars(minPriceResult) }
  );

  // Test with maximum realistic price ($10,000)
  const maxPriceResult = calculateItemMaxDiscount(1000000, 1000000, defaultSettings);
  const expectedMax = 500000; // 50% of $10,000
  logTest('Maximum Price Handling', maxPriceResult === expectedMax,
    `Max discount for $10,000 item is ${formatCentsToDollars(maxPriceResult)}`,
    { itemPrice: '$10,000.00', maxDiscount: formatCentsToDollars(maxPriceResult) }
  );

  // Test per-order cap with single expensive item
  const expensiveItems = [
    { priceCents: 10000000, quantity: 1, pointsEligible: true }, // $100,000
  ];

  const capResult = calculateStoreCreditDiscount(expensiveItems, 5000, 10000, defaultSettings);
  logTest('Per-Order Cap on Expensive Item', !capResult.isValid,
    !capResult.isValid ? 'Correctly enforced $30 cap on expensive item' : 'Should enforce per-order cap',
    { error: capResult.errorMessage }
  );

  // Test with zero quantity (edge case)
  const zeroQuantityItems = [
    { priceCents: 2000, quantity: 0, pointsEligible: true },
  ];

  const zeroQtyResult = calculateStoreCreditDiscount(zeroQuantityItems, 100, 5000, defaultSettings);
  logTest('Zero Quantity Handling', !zeroQtyResult.isValid,
    !zeroQtyResult.isValid ? 'Correctly handled zero quantity' : 'Should handle zero quantity',
    { error: zeroQtyResult.errorMessage }
  );
}

/**
 * Main test runner
 */
function runTests() {
  console.log('\n🧪 Store Credit Edge Cases Test Suite');
  console.log('='.repeat(60));
  console.log('Testing edge cases and error handling...\n');

  testInsufficientCredit();
  testExpiredMultipliers();
  testInvalidAmounts();
  testMonthlyEarningCap();
  testTransactionValidation();
  testBoundaryConditions();

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));

  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  const total = testResults.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.testName}: ${r.message}`);
    });
  }

  console.log('\n✨ Test suite completed!');

  return failed === 0;
}

// Run tests
const success = runTests();
process.exit(success ? 0 : 1);
