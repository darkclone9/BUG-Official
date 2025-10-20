/**
 * Initialize Store Credit Settings
 *
 * This script creates the default store credit settings in Firestore.
 *
 * Usage:
 *   npx tsx scripts/initializeStoreCreditSettings.ts
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

async function initializeSettings() {
  console.log('\n🔧 Initializing Store Credit Settings');
  console.log('='.repeat(60));

  try {
    // Check if settings already exist
    const settingsRef = db.collection('store_credit_settings').doc('default');
    const settingsDoc = await settingsRef.get();

    if (settingsDoc.exists) {
      console.log('⚠️  Settings already exist. Current settings:');
      console.log(JSON.stringify(settingsDoc.data(), null, 2));
      console.log('\nDo you want to overwrite? (This script will exit. Run with --force to overwrite)');

      if (!process.argv.includes('--force')) {
        console.log('✅ Exiting without changes.');
        return;
      }

      console.log('⚠️  Overwriting existing settings...');
    }

    // Create default settings
    const defaultSettings = {
      id: 'default',
      perItemDiscountCap: 50,           // 50% max per item
      perOrderDiscountCap: 3000,        // $30.00 max per order
      monthlyEarningCap: 5000,          // $50.00 max per month
      earningValues: {
        eventAttendance: 100,           // $1.00 for event attendance
        volunteerWork: 250,             // $2.50 for volunteer work
        eventHosting: 500,              // $5.00 for event hosting
        contributionMin: 50,            // $0.50 minimum
        contributionMax: 150,           // $1.50 maximum
      },
      updatedAt: Timestamp.now(),
      updatedBy: 'initialization_script',
    };

    await db.collection('store_credit_settings').doc('default').set(defaultSettings);

    console.log('✅ Store credit settings created successfully!');
    console.log('\nSettings:');
    console.log(`  Per Item Discount Cap: ${defaultSettings.perItemDiscountCap}%`);
    console.log(`  Per Order Discount Cap: $${(defaultSettings.perOrderDiscountCap / 100).toFixed(2)}`);
    console.log(`  Monthly Earning Cap: $${(defaultSettings.monthlyEarningCap / 100).toFixed(2)}`);
    console.log('\nEarning Values:');
    console.log(`  Event Attendance: $${(defaultSettings.earningValues.eventAttendance / 100).toFixed(2)}`);
    console.log(`  Volunteer Work: $${(defaultSettings.earningValues.volunteerWork / 100).toFixed(2)}`);
    console.log(`  Event Hosting: $${(defaultSettings.earningValues.eventHosting / 100).toFixed(2)}`);
    console.log(`  Contribution Min: $${(defaultSettings.earningValues.contributionMin / 100).toFixed(2)}`);
    console.log(`  Contribution Max: $${(defaultSettings.earningValues.contributionMax / 100).toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error initializing settings:', error);
    process.exit(1);
  }
}

// Run initialization
initializeSettings()
  .then(() => {
    console.log('\n✨ Initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  });
