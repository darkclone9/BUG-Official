# Migration Scripts

This directory contains database migration scripts for the BUG Gaming Club website.

## Points to Store Credit Migration

### Overview

The `migratePointsToStoreCredit.ts` script migrates the existing participation points system to the new store credit system.

**Conversion Rate:** 200 points = $1.00 store credit

### Prerequisites

1. **Firebase Service Account Key**
   - Download your Firebase service account key from the Firebase Console
   - Save it as `serviceAccountKey.json` in the project root
   - **NEVER commit this file to version control!**

2. **Full Database Backup**
   - Create a complete backup of your Firestore database before running the migration
   - Store the backup securely for at least 90 days
   - Test the backup restoration process

3. **Maintenance Window**
   - Schedule a 1-2 hour maintenance window
   - Notify users 48 hours in advance
   - Prepare a status page

### Installation

```bash
# Install dependencies
npm install firebase-admin

# Install TypeScript (if not already installed)
npm install -D typescript ts-node @types/node
```

### Usage

#### Dry Run (Recommended First Step)

Preview the migration without making any changes:

```bash
npx ts-node scripts/migratePointsToStoreCredit.ts --dry-run
```

This will:
- Show you exactly what will be migrated
- Display conversion calculations for each user
- Generate a migration report
- **NOT modify the database**

#### Live Migration

Run the actual migration:

```bash
npx ts-node scripts/migratePointsToStoreCredit.ts
```

**WARNING:** This will modify your production database!

#### Custom Batch Size

Process users in smaller or larger batches:

```bash
npx ts-node scripts/migratePointsToStoreCredit.ts --batch-size=100
```

Default batch size is 50 users.

### What the Script Does

1. **Reads all users** from the `users` collection
2. **Converts points to store credit:**
   - `pointsBalance` → `storeCreditBalance` (in cents)
   - `pointsEarned` → `storeCreditEarned` (in cents)
   - `pointsSpent` → `storeCreditSpent` (in cents)
3. **Preserves legacy data:**
   - Saves original points as `pointsBalance_legacy`, etc.
   - Allows for rollback if needed
4. **Creates transaction records:**
   - Logs migration as a store credit transaction
   - Category: `migration`
   - Auto-approved
5. **Generates a report:**
   - JSON file with complete migration statistics
   - Includes errors and processing time

### Migration Report

After running, a report is saved as `migration-report-{timestamp}.json`:

```json
{
  "totalUsers": 150,
  "usersProcessed": 142,
  "usersSkipped": 8,
  "totalPointsConverted": 45000,
  "totalCreditCreated": 22500,
  "errors": [],
  "startTime": "2025-10-14T10:00:00.000Z",
  "endTime": "2025-10-14T10:02:30.000Z"
}
```

### Rollback Procedure

If you need to rollback the migration:

1. **Stop the application** to prevent new store credit transactions
2. **Run the rollback script** (to be created):
   ```bash
   npx ts-node scripts/rollbackStoreCreditMigration.ts
   ```
3. **Restore from backup** if rollback script fails
4. **Verify data integrity** before resuming operations

### Post-Migration Steps

1. **Monitor for 24-48 hours:**
   - Check error logs
   - Verify user balances
   - Test checkout flow
   - Monitor support requests

2. **Validate migration:**
   - Spot-check user balances
   - Verify transaction history
   - Test earning and spending credit

3. **After 90 days:**
   - Remove legacy points fields from database
   - Archive old points system code
   - Delete backup (if no longer needed)

### Troubleshooting

#### Error: serviceAccountKey.json not found

Download your Firebase service account key:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `serviceAccountKey.json` in project root

#### Error: Permission denied

Make sure your service account has the following roles:
- Cloud Datastore User
- Firebase Admin

#### Migration takes too long

Try reducing the batch size:
```bash
npx ts-node scripts/migratePointsToStoreCredit.ts --batch-size=25
```

#### Some users have incorrect balances

1. Check the migration report for errors
2. Manually verify affected users
3. Use the admin panel to adjust balances if needed

### Support

If you encounter issues during migration:
1. Check the migration report for specific errors
2. Review the Firebase Console logs
3. Contact the development team
4. **DO NOT** run the migration multiple times without investigating errors

---

## Future Scripts

Additional migration scripts will be added here as needed:
- `rollbackStoreCreditMigration.ts` - Rollback to points system
- `cleanupLegacyPoints.ts` - Remove legacy points fields after 90 days
- `migratePointsTransactions.ts` - Migrate points transaction history

