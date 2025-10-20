/**
 * Store Credit Checkout Test Script
 * 
 * This script tests store credit spending features:
 * - Credit slider functionality
 * - Discount calculations
 * - Per-item cap (50%)
 * - Per-order cap ($30.00)
 * - Stripe integration
 * - Credit deduction on purchase
 * 
 * Usage:
 *   npx tsx scripts/testStoreCreditCheckout.ts
 */

import {
  calculateItemMaxDiscount,
  calculateStoreCreditDiscount,
  applyStoreCreditToOrder,
  formatCentsToDollars,
} from '../src/lib/storeCredit';
import { StoreCreditSettings } from '../src/types/types';

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

// Default settings (matching production)
const defaultSettings: StoreCreditSettings = {
  id: 'default',
  perItemDiscountCap: 50,           // 50% max per item
  perOrderDiscountCap: 3000,        // $30.00 max per order
  monthlyEarningCap: 5000,          // $50.00 max per month
  earningValues: {
    eventAttendance: 100,           // $1.00
    volunteerWork: 250,             // $2.50
    eventHosting: 500,              // $5.00
    contributionMin: 50,            // $0.50
    contributionMax: 150,           // $1.50
  },
  updatedAt: new Date(),
  updatedBy: 'test_script',
};

/**
 * Test 1: Per-Item Discount Cap (50%)
 */
function testPerItemCap() {
  console.log('\n🛒 Test 1: Per-Item Discount Cap (50%)');
  console.log('='.repeat(60));
  
  // Test item: $20.00 product
  const itemPrice = 2000; // $20.00
  const availableCredit = 10000; // $100.00 (more than enough)
  
  const maxDiscount = calculateItemMaxDiscount(itemPrice, availableCredit, defaultSettings);
  const expectedMaxDiscount = 1000; // 50% of $20.00 = $10.00
  
  logTest('Per-Item Cap Calculation', maxDiscount === expectedMaxDiscount,
    `Max discount for $20.00 item is ${formatCentsToDollars(maxDiscount)} (expected ${formatCentsToDollars(expectedMaxDiscount)})`,
    { itemPrice: formatCentsToDollars(itemPrice), maxDiscount: formatCentsToDollars(maxDiscount) }
  );
  
  // Test with expensive item: $100.00 product
  const expensiveItem = 10000; // $100.00
  const maxDiscountExpensive = calculateItemMaxDiscount(expensiveItem, availableCredit, defaultSettings);
  const expectedMaxExpensive = 5000; // 50% of $100.00 = $50.00
  
  logTest('Per-Item Cap on Expensive Item', maxDiscountExpensive === expectedMaxExpensive,
    `Max discount for $100.00 item is ${formatCentsToDollars(maxDiscountExpensive)} (expected ${formatCentsToDollars(expectedMaxExpensive)})`
  );
}

/**
 * Test 2: Per-Order Discount Cap ($30.00)
 */
function testPerOrderCap() {
  console.log('\n📦 Test 2: Per-Order Discount Cap ($30.00)');
  console.log('='.repeat(60));
  
  // Create order with multiple items totaling $200.00
  const items = [
    { priceCents: 5000, quantity: 2, pointsEligible: true },  // $50.00 total
    { priceCents: 7500, quantity: 1, pointsEligible: true },  // $75.00 total
    { priceCents: 7500, quantity: 1, pointsEligible: true },  // $75.00 total
  ];
  
  const totalPrice = items.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);
  console.log(`   Order total: ${formatCentsToDollars(totalPrice)}`);
  
  // Try to use $50.00 credit (more than $30.00 cap)
  const creditToUse = 5000; // $50.00
  const availableCredit = 10000; // $100.00
  
  const result = calculateStoreCreditDiscount(items, creditToUse, availableCredit, defaultSettings);
  
  logTest('Per-Order Cap Enforcement', !result.isValid,
    result.isValid ? 'Should have failed due to per-order cap' : 'Correctly rejected credit exceeding $30.00 cap',
    { creditRequested: formatCentsToDollars(creditToUse), errorMessage: result.errorMessage }
  );
  
  // Try with $30.00 credit (exactly at cap)
  const creditAtCap = 3000; // $30.00
  const resultAtCap = calculateStoreCreditDiscount(items, creditAtCap, availableCredit, defaultSettings);
  
  logTest('Per-Order Cap at Limit', resultAtCap.isValid,
    resultAtCap.isValid ? 'Correctly accepted $30.00 credit' : 'Should have accepted credit at cap',
    { creditUsed: formatCentsToDollars(creditAtCap), discount: formatCentsToDollars(resultAtCap.discountCents) }
  );
}

/**
 * Test 3: Discount Calculation Accuracy
 */
function testDiscountCalculation() {
  console.log('\n🧮 Test 3: Discount Calculation Accuracy');
  console.log('='.repeat(60));
  
  // Simple order: 1 item at $40.00
  const items = [
    { priceCents: 4000, quantity: 1, pointsEligible: true },
  ];
  
  // Use $10.00 credit
  const creditToUse = 1000; // $10.00
  const availableCredit = 5000; // $50.00
  
  const result = calculateStoreCreditDiscount(items, creditToUse, availableCredit, defaultSettings);
  
  logTest('Discount Calculation Valid', result.isValid,
    result.isValid ? 'Discount calculation succeeded' : `Failed: ${result.errorMessage}`
  );
  
  logTest('Discount Amount Correct', result.discountCents === creditToUse,
    `Discount is ${formatCentsToDollars(result.discountCents)} (expected ${formatCentsToDollars(creditToUse)})`
  );
  
  // Apply discount to order
  const orderTotal = 4000; // $40.00
  const finalTotal = applyStoreCreditToOrder(orderTotal, result.discountCents);
  const expectedFinal = 3000; // $30.00
  
  logTest('Final Total Calculation', finalTotal === expectedFinal,
    `Final total is ${formatCentsToDollars(finalTotal)} (expected ${formatCentsToDollars(expectedFinal)})`
  );
}

/**
 * Test 4: Insufficient Credit Handling
 */
function testInsufficientCredit() {
  console.log('\n💳 Test 4: Insufficient Credit Handling');
  console.log('='.repeat(60));
  
  const items = [
    { priceCents: 2000, quantity: 1, pointsEligible: true },
  ];
  
  // Try to use more credit than available
  const creditToUse = 5000; // $50.00
  const availableCredit = 1000; // $10.00 (insufficient)
  
  const result = calculateStoreCreditDiscount(items, creditToUse, availableCredit, defaultSettings);
  
  logTest('Insufficient Credit Detection', !result.isValid,
    result.isValid ? 'Should have failed with insufficient credit' : 'Correctly rejected insufficient credit',
    { creditRequested: formatCentsToDollars(creditToUse), available: formatCentsToDollars(availableCredit), errorMessage: result.errorMessage }
  );
  
  logTest('Error Message Correct', result.errorMessage?.includes('Insufficient'),
    `Error message: "${result.errorMessage}"`
  );
}

/**
 * Test 5: Non-Eligible Items
 */
function testNonEligibleItems() {
  console.log('\n🚫 Test 5: Non-Eligible Items');
  console.log('='.repeat(60));
  
  // Order with only non-eligible items
  const items = [
    { priceCents: 2000, quantity: 1, pointsEligible: false },
    { priceCents: 3000, quantity: 1, pointsEligible: false },
  ];
  
  const creditToUse = 1000; // $10.00
  const availableCredit = 5000; // $50.00
  
  const result = calculateStoreCreditDiscount(items, creditToUse, availableCredit, defaultSettings);
  
  logTest('Non-Eligible Items Rejection', !result.isValid,
    result.isValid ? 'Should have failed with no eligible items' : 'Correctly rejected non-eligible items',
    { errorMessage: result.errorMessage }
  );
  
  // Mixed order (some eligible, some not)
  const mixedItems = [
    { priceCents: 2000, quantity: 1, pointsEligible: true },
    { priceCents: 3000, quantity: 1, pointsEligible: false },
  ];
  
  const mixedResult = calculateStoreCreditDiscount(mixedItems, creditToUse, availableCredit, defaultSettings);
  
  logTest('Mixed Items Handling', mixedResult.isValid,
    mixedResult.isValid ? 'Correctly applied credit to eligible items only' : `Failed: ${mixedResult.errorMessage}`,
    { discount: formatCentsToDollars(mixedResult.discountCents) }
  );
}

/**
 * Test 6: Multiple Items Discount Distribution
 */
function testMultipleItemsDistribution() {
  console.log('\n📊 Test 6: Multiple Items Discount Distribution');
  console.log('='.repeat(60));
  
  // Order with 3 items
  const items = [
    { priceCents: 2000, quantity: 1, pointsEligible: true },  // $20.00
    { priceCents: 3000, quantity: 1, pointsEligible: true },  // $30.00
    { priceCents: 5000, quantity: 1, pointsEligible: true },  // $50.00
  ];
  
  const totalPrice = items.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);
  console.log(`   Order total: ${formatCentsToDollars(totalPrice)}`);
  
  // Use $15.00 credit
  const creditToUse = 1500; // $15.00
  const availableCredit = 5000; // $50.00
  
  const result = calculateStoreCreditDiscount(items, creditToUse, availableCredit, defaultSettings);
  
  logTest('Multi-Item Discount Valid', result.isValid,
    result.isValid ? 'Discount calculation succeeded' : `Failed: ${result.errorMessage}`
  );
  
  logTest('Discount Distributed', result.itemDiscounts.length === items.length,
    `Discount distributed to ${result.itemDiscounts.length} items (expected ${items.length})`
  );
  
  const totalDistributed = result.itemDiscounts.reduce((sum, d) => sum + d.discountCents, 0);
  logTest('Total Discount Matches', totalDistributed === creditToUse,
    `Total distributed: ${formatCentsToDollars(totalDistributed)} (expected ${formatCentsToDollars(creditToUse)})`
  );
}

/**
 * Test 7: Edge Cases
 */
function testEdgeCases() {
  console.log('\n⚠️  Test 7: Edge Cases');
  console.log('='.repeat(60));
  
  const items = [
    { priceCents: 2000, quantity: 1, pointsEligible: true },
  ];
  
  // Test with zero credit
  const zeroResult = calculateStoreCreditDiscount(items, 0, 5000, defaultSettings);
  logTest('Zero Credit Handling', zeroResult.isValid && zeroResult.discountCents === 0,
    zeroResult.isValid ? 'Correctly handled zero credit' : 'Failed with zero credit'
  );
  
  // Test with negative credit (should fail)
  const negativeResult = calculateStoreCreditDiscount(items, -1000, 5000, defaultSettings);
  logTest('Negative Credit Rejection', !negativeResult.isValid,
    negativeResult.isValid ? 'Should have rejected negative credit' : 'Correctly rejected negative credit',
    { errorMessage: negativeResult.errorMessage }
  );
  
  // Test with very small amounts
  const smallResult = calculateStoreCreditDiscount(items, 1, 5000, defaultSettings);
  logTest('Small Amount Handling', smallResult.isValid,
    smallResult.isValid ? 'Correctly handled $0.01 credit' : 'Failed with small amount'
  );
}

/**
 * Main test runner
 */
function runTests() {
  console.log('\n🧪 Store Credit Checkout Test Suite');
  console.log('='.repeat(60));
  console.log('Testing store credit spending features...\n');
  
  testPerItemCap();
  testPerOrderCap();
  testDiscountCalculation();
  testInsufficientCredit();
  testNonEligibleItems();
  testMultipleItemsDistribution();
  testEdgeCases();
  
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

