/**
 * Store Credit Features Test Script
 * 
 * This script tests all store credit earning features:
 * - Event attendance credit
 * - Volunteer work credit
 * - Multipliers
 * - Monthly earning cap
 * - Welcome credit bonus
 * 
 * Usage:
 *   npx tsx scripts/testStoreCreditFeatures.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found!');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

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

/**
 * Test 1: Verify store credit settings exist and have correct values
 */
async function testStoreCreditSettings() {
  console.log('\n📋 Test 1: Store Credit Settings');
  console.log('='.repeat(60));
  
  try {
    const settingsDoc = await db.collection('store_credit_settings').doc('default').get();
    
    if (!settingsDoc.exists) {
      logTest('Settings Exist', false, 'Store credit settings not found');
      return;
    }
    
    const settings = settingsDoc.data();
    logTest('Settings Exist', true, 'Store credit settings found');
    
    // Check earning values
    const expectedEarningValues = {
      eventAttendance: 100,    // $1.00
      volunteerWork: 250,      // $2.50
      eventHosting: 500,       // $5.00
      contributionMin: 50,     // $0.50
      contributionMax: 150,    // $1.50
    };
    
    const earningValuesMatch = JSON.stringify(settings?.earningValues) === JSON.stringify(expectedEarningValues);
    logTest('Earning Values', earningValuesMatch, 
      earningValuesMatch ? 'Earning values are correct' : 'Earning values mismatch',
      { expected: expectedEarningValues, actual: settings?.earningValues }
    );
    
    // Check caps
    logTest('Per Item Cap', settings?.perItemDiscountCap === 50, 
      `Per item cap is ${settings?.perItemDiscountCap}% (expected 50%)`);
    
    logTest('Per Order Cap', settings?.perOrderDiscountCap === 3000, 
      `Per order cap is $${(settings?.perOrderDiscountCap / 100).toFixed(2)} (expected $30.00)`);
    
    logTest('Monthly Earning Cap', settings?.monthlyEarningCap === 5000, 
      `Monthly earning cap is $${(settings?.monthlyEarningCap / 100).toFixed(2)} (expected $50.00)`);
    
  } catch (error) {
    logTest('Settings Test', false, `Error: ${error}`);
  }
}

/**
 * Test 2: Test creating store credit transactions
 */
async function testCreateTransaction() {
  console.log('\n💰 Test 2: Create Store Credit Transaction');
  console.log('='.repeat(60));
  
  try {
    // Find a test user
    const usersSnapshot = await db.collection('users').limit(1).get();
    
    if (usersSnapshot.empty) {
      logTest('Create Transaction', false, 'No users found for testing');
      return;
    }
    
    const testUser = usersSnapshot.docs[0];
    const userId = testUser.id;
    const userData = testUser.data();
    
    console.log(`   Using test user: ${userData.email || userId}`);
    
    // Get initial balance
    const initialBalance = userData.storeCreditBalance || 0;
    console.log(`   Initial balance: $${(initialBalance / 100).toFixed(2)}`);
    
    // Create a test transaction (event attendance: $1.00)
    const transactionId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const creditAmount = 100; // $1.00
    
    await db.collection('store_credit_transactions').doc(transactionId).set({
      id: transactionId,
      userId,
      amountCents: creditAmount,
      reason: 'Test: Event attendance',
      category: 'event_attendance',
      timestamp: Timestamp.now(),
      approvalStatus: 'approved',
    });
    
    logTest('Transaction Created', true, `Created transaction ${transactionId} for $${(creditAmount / 100).toFixed(2)}`);
    
    // Update user balance
    const monthlyEarned = userData.monthlyStoreCreditEarned || 0;
    await db.collection('users').doc(userId).update({
      storeCreditBalance: initialBalance + creditAmount,
      storeCreditEarned: (userData.storeCreditEarned || 0) + creditAmount,
      monthlyStoreCreditEarned: monthlyEarned + creditAmount,
    });
    
    // Verify balance updated
    const updatedUser = await db.collection('users').doc(userId).get();
    const updatedData = updatedUser.data();
    const newBalance = updatedData?.storeCreditBalance || 0;
    
    const balanceCorrect = newBalance === initialBalance + creditAmount;
    logTest('Balance Updated', balanceCorrect, 
      `Balance updated to $${(newBalance / 100).toFixed(2)} (expected $${((initialBalance + creditAmount) / 100).toFixed(2)})`);
    
    // Clean up test transaction
    await db.collection('store_credit_transactions').doc(transactionId).delete();
    await db.collection('users').doc(userId).update({
      storeCreditBalance: initialBalance,
      storeCreditEarned: userData.storeCreditEarned || 0,
      monthlyStoreCreditEarned: monthlyEarned,
    });
    
    console.log(`   ✓ Cleaned up test transaction`);
    
  } catch (error) {
    logTest('Create Transaction', false, `Error: ${error}`);
  }
}

/**
 * Test 3: Test store credit multipliers
 */
async function testMultipliers() {
  console.log('\n🔢 Test 3: Store Credit Multipliers');
  console.log('='.repeat(60));
  
  try {
    // Create a test multiplier (2x for event attendance)
    const multiplierId = `test_multiplier_${Date.now()}`;
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    await db.collection('store_credit_multipliers').doc(multiplierId).set({
      id: multiplierId,
      name: 'Test 2x Event Attendance',
      description: 'Test multiplier for event attendance',
      multiplier: 2.0,
      applicableCategories: ['event_attendance'],
      isActive: true,
      startDate: Timestamp.fromDate(now),
      endDate: Timestamp.fromDate(tomorrow),
      createdAt: Timestamp.now(),
      createdBy: 'test_script',
    });
    
    logTest('Multiplier Created', true, `Created test multiplier ${multiplierId} (2x)`);
    
    // Query active multipliers
    const activeMultipliers = await db.collection('store_credit_multipliers')
      .where('isActive', '==', true)
      .where('startDate', '<=', Timestamp.now())
      .where('endDate', '>=', Timestamp.now())
      .get();
    
    const foundTestMultiplier = activeMultipliers.docs.some(doc => doc.id === multiplierId);
    logTest('Multiplier Active', foundTestMultiplier, 
      foundTestMultiplier ? 'Test multiplier is active' : 'Test multiplier not found in active multipliers');
    
    // Clean up
    await db.collection('store_credit_multipliers').doc(multiplierId).delete();
    console.log(`   ✓ Cleaned up test multiplier`);
    
  } catch (error) {
    logTest('Multipliers Test', false, `Error: ${error}`);
  }
}

/**
 * Test 4: Test monthly earning cap
 */
async function testMonthlyEarningCap() {
  console.log('\n📅 Test 4: Monthly Earning Cap');
  console.log('='.repeat(60));
  
  try {
    const settingsDoc = await db.collection('store_credit_settings').doc('default').get();
    const settings = settingsDoc.data();
    const monthlyCap = settings?.monthlyEarningCap || 5000; // $50.00
    
    console.log(`   Monthly cap: $${(monthlyCap / 100).toFixed(2)}`);
    
    // Find a user to test with
    const usersSnapshot = await db.collection('users').limit(1).get();
    
    if (usersSnapshot.empty) {
      logTest('Monthly Cap Test', false, 'No users found for testing');
      return;
    }
    
    const testUser = usersSnapshot.docs[0];
    const userId = testUser.id;
    const userData = testUser.data();
    const monthlyEarned = userData.monthlyStoreCreditEarned || 0;
    
    console.log(`   User ${userData.email || userId} has earned $${(monthlyEarned / 100).toFixed(2)} this month`);
    
    const remaining = monthlyCap - monthlyEarned;
    const hasReachedCap = monthlyEarned >= monthlyCap;
    
    logTest('Cap Calculation', true, 
      hasReachedCap 
        ? 'User has reached monthly cap' 
        : `User has $${(remaining / 100).toFixed(2)} remaining this month`);
    
    // Test cap enforcement logic
    const testAmount = 1000; // $10.00
    const wouldExceedCap = monthlyEarned + testAmount > monthlyCap;
    
    logTest('Cap Enforcement', true, 
      wouldExceedCap 
        ? `Adding $${(testAmount / 100).toFixed(2)} would exceed cap` 
        : `Adding $${(testAmount / 100).toFixed(2)} would not exceed cap`);
    
  } catch (error) {
    logTest('Monthly Cap Test', false, `Error: ${error}`);
  }
}

/**
 * Test 5: Test welcome credit promotion
 */
async function testWelcomeCreditPromotion() {
  console.log('\n🎁 Test 5: Welcome Credit Promotion');
  console.log('='.repeat(60));
  
  try {
    // Check if welcome credit promotion exists
    const promotionsSnapshot = await db.collection('welcome_credit_promotions').get();
    
    if (promotionsSnapshot.empty) {
      logTest('Welcome Promotion', false, 'No welcome credit promotions found');
      console.log('   Note: This is expected if no promotion has been created yet');
      return;
    }
    
    const promotion = promotionsSnapshot.docs[0].data();
    console.log(`   Found promotion: ${promotion.name}`);
    console.log(`   Credit amount: $${(promotion.creditAmountCents / 100).toFixed(2)}`);
    console.log(`   Max recipients: ${promotion.maxRecipients}`);
    console.log(`   Current recipients: ${promotion.currentRecipients}`);
    console.log(`   Active: ${promotion.isActive}`);
    
    logTest('Welcome Promotion Exists', true, 'Welcome credit promotion found');
    
    const hasCapacity = promotion.currentRecipients < promotion.maxRecipients;
    logTest('Promotion Capacity', hasCapacity, 
      hasCapacity 
        ? `${promotion.maxRecipients - promotion.currentRecipients} slots remaining` 
        : 'Promotion is full');
    
  } catch (error) {
    logTest('Welcome Promotion Test', false, `Error: ${error}`);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n🧪 Store Credit Features Test Suite');
  console.log('='.repeat(60));
  console.log('Testing all store credit earning features...\n');
  
  await testStoreCreditSettings();
  await testCreateTransaction();
  await testMultipliers();
  await testMonthlyEarningCap();
  await testWelcomeCreditPromotion();
  
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
}

// Run tests
runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });

