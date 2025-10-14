/**
 * Migration Script: Points to Store Credit
 * 
 * This script migrates the existing points system to the new store credit system.
 * Conversion rate: 200 points = $1.00 store credit
 * 
 * IMPORTANT: Run this script during a maintenance window with a full database backup.
 * 
 * Usage:
 *   npx ts-node scripts/migratePointsToStoreCredit.ts
 * 
 * Options:
 *   --dry-run: Preview changes without writing to database
 *   --batch-size=N: Process N users at a time (default: 50)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const CONVERSION_RATE = 200; // 200 points = $1.00 store credit
const DEFAULT_BATCH_SIZE = 50;
const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_SIZE = parseInt(process.argv.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || String(DEFAULT_BATCH_SIZE));

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found!');
  console.error('Please download your Firebase service account key and place it in the project root.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Migration statistics
interface MigrationStats {
  totalUsers: number;
  usersProcessed: number;
  usersSkipped: number;
  totalPointsConverted: number;
  totalCreditCreated: number; // in cents
  errors: Array<{ userId: string; error: string }>;
  startTime: Date;
  endTime?: Date;
}

const stats: MigrationStats = {
  totalUsers: 0,
  usersProcessed: 0,
  usersSkipped: 0,
  totalPointsConverted: 0,
  totalCreditCreated: 0,
  errors: [],
  startTime: new Date(),
};

/**
 * Convert points to store credit in cents
 */
function pointsToStoreCreditCents(points: number): number {
  return Math.floor((points / CONVERSION_RATE) * 100);
}

/**
 * Migrate a single user's points to store credit
 */
async function migrateUser(userId: string, userData: any): Promise<boolean> {
  try {
    const pointsBalance = userData.pointsBalance || userData.points || 0;
    const pointsEarned = userData.pointsEarned || 0;
    const pointsSpent = userData.pointsSpent || 0;

    // Skip users with no points
    if (pointsBalance === 0 && pointsEarned === 0 && pointsSpent === 0) {
      stats.usersSkipped++;
      console.log(`  ⏭️  Skipped ${userData.email || userId} (no points)`);
      return true;
    }

    // Calculate store credit amounts
    const storeCreditBalance = pointsToStoreCreditCents(pointsBalance);
    const storeCreditEarned = pointsToStoreCreditCents(pointsEarned);
    const storeCreditSpent = pointsToStoreCreditCents(pointsSpent);

    console.log(`  💰 ${userData.email || userId}:`);
    console.log(`     Points: ${pointsBalance} → Store Credit: $${(storeCreditBalance / 100).toFixed(2)}`);
    console.log(`     Earned: ${pointsEarned} pts → $${(storeCreditEarned / 100).toFixed(2)}`);
    console.log(`     Spent: ${pointsSpent} pts → $${(storeCreditSpent / 100).toFixed(2)}`);

    if (!DRY_RUN) {
      // Update user document
      await db.collection('users').doc(userId).update({
        storeCreditBalance,
        storeCreditEarned,
        storeCreditSpent,
        monthlyStoreCreditEarned: 0, // Reset monthly tracking
        lastStoreCreditMonthlyReset: Timestamp.now(),
        // Keep legacy points fields for rollback capability
        pointsBalance_legacy: pointsBalance,
        pointsEarned_legacy: pointsEarned,
        pointsSpent_legacy: pointsSpent,
        migratedAt: Timestamp.now(),
      });

      // Create migration transaction record
      if (storeCreditBalance > 0) {
        await db.collection('store_credit_transactions').add({
          userId,
          amountCents: storeCreditBalance,
          reason: `Migration from points system (${pointsBalance} points converted)`,
          category: 'migration',
          timestamp: Timestamp.now(),
          approvalStatus: 'approved',
        });
      }
    }

    stats.usersProcessed++;
    stats.totalPointsConverted += pointsBalance;
    stats.totalCreditCreated += storeCreditBalance;

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    stats.errors.push({ userId, error: errorMessage });
    console.error(`  ❌ Error migrating ${userId}: ${errorMessage}`);
    return false;
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('\n🚀 Starting Points to Store Credit Migration');
  console.log('='.repeat(60));
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (no changes will be made)' : '✍️  LIVE MIGRATION'}`);
  console.log(`Conversion Rate: ${CONVERSION_RATE} points = $1.00 store credit`);
  console.log(`Batch Size: ${BATCH_SIZE} users`);
  console.log('='.repeat(60));
  console.log('');

  if (!DRY_RUN) {
    console.log('⚠️  WARNING: This will modify the database!');
    console.log('⚠️  Make sure you have a backup before proceeding.');
    console.log('');
    
    // Wait 5 seconds to allow cancellation
    console.log('Starting in 5 seconds... (Press Ctrl+C to cancel)');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('');
  }

  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    stats.totalUsers = usersSnapshot.size;

    console.log(`📊 Found ${stats.totalUsers} users to process\n`);

    // Process users in batches
    const users = usersSnapshot.docs;
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(users.length / BATCH_SIZE);

      console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} users)...`);

      // Process batch
      await Promise.all(
        batch.map(doc => migrateUser(doc.id, doc.data()))
      );

      // Progress update
      const progress = ((i + batch.length) / users.length * 100).toFixed(1);
      console.log(`   Progress: ${progress}% (${i + batch.length}/${users.length} users)`);
    }

    stats.endTime = new Date();

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration Complete!');
    console.log('='.repeat(60));
    console.log(`Total Users: ${stats.totalUsers}`);
    console.log(`Users Processed: ${stats.usersProcessed}`);
    console.log(`Users Skipped: ${stats.usersSkipped} (no points)`);
    console.log(`Total Points Converted: ${stats.totalPointsConverted.toLocaleString()}`);
    console.log(`Total Store Credit Created: $${(stats.totalCreditCreated / 100).toFixed(2)}`);
    console.log(`Errors: ${stats.errors.length}`);
    console.log(`Duration: ${((stats.endTime.getTime() - stats.startTime.getTime()) / 1000).toFixed(1)}s`);

    if (stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      stats.errors.forEach(({ userId, error }) => {
        console.log(`   ${userId}: ${error}`);
      });
    }

    if (DRY_RUN) {
      console.log('\n🔍 This was a DRY RUN - no changes were made to the database.');
      console.log('   Run without --dry-run to perform the actual migration.');
    } else {
      console.log('\n✅ Migration completed successfully!');
      console.log('   Legacy points fields have been preserved for rollback capability.');
      console.log('   Monitor the system for 24-48 hours before removing legacy fields.');
    }

    // Save migration report
    const reportPath = path.join(__dirname, `../migration-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2));
    console.log(`\n📄 Migration report saved to: ${reportPath}`);

  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error);
    process.exit(1);
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n✨ Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });

