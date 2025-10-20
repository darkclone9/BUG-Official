/**
 * Quest Seeding Script
 *
 * This script seeds the Firestore database with initial quests.
 *
 * Usage:
 *   npx tsx scripts/seedQuests.ts [--dry-run] [--force]
 *
 * Options:
 *   --dry-run: Preview changes without saving
 *   --force: Overwrite existing quests
 *
 * Note: This script requires Firebase Admin SDK credentials.
 * Set up your credentials by:
 * 1. Download service account key from Firebase Console
 * 2. Save as firebase-adminsdk.json in project root
 * 3. Run this script
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Try to initialize Firebase Admin SDK
let db: admin.firestore.Firestore;

try {
  const serviceAccountPath = path.join(process.cwd(), 'firebase-adminsdk.json');

  if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Error: firebase-adminsdk.json not found');
    console.error('\n📋 Setup Instructions:');
    console.error('1. Go to Firebase Console → Project Settings → Service Accounts');
    console.error('2. Click "Generate New Private Key"');
    console.error('3. Save the JSON file as "firebase-adminsdk.json" in the project root');
    console.error('4. Run this script again\n');
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  db = admin.firestore();
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
  process.exit(1);
}

// Define initial quests
const INITIAL_QUESTS = [
  {
    id: 'create_account',
    name: 'Welcome to BUG!',
    description: 'Create your account and join the gaming club',
    category: 'profile_setup',
    type: 'one_time',
    rewardCents: 100,
    isActive: true,
    requirementType: 'boolean',
    requirementTarget: 1,
    trackingKey: 'account_created',
  },
  {
    id: 'complete_profile',
    name: 'Profile Master',
    description: 'Complete your profile with avatar, bio, and social links',
    category: 'profile_setup',
    type: 'one_time',
    rewardCents: 150,
    isActive: true,
    requirementType: 'count',
    requirementTarget: 3,
    trackingKey: 'profile_fields_completed',
  },
  {
    id: 'first_event',
    name: 'First Steps',
    description: 'Attend your first club event',
    category: 'club_participation',
    type: 'one_time',
    rewardCents: 200,
    isActive: true,
    requirementType: 'count',
    requirementTarget: 1,
    trackingKey: 'events_attended',
  },
  {
    id: 'event_regular',
    name: 'Regular Attendee',
    description: 'Attend 5 club events',
    category: 'club_participation',
    type: 'progressive',
    rewardCents: 500,
    isActive: true,
    requirementType: 'count',
    requirementTarget: 5,
    trackingKey: 'events_attended',
  },
  {
    id: 'first_tournament',
    name: 'Tournament Debut',
    description: 'Join your first tournament',
    category: 'club_participation',
    type: 'one_time',
    rewardCents: 250,
    isActive: true,
    requirementType: 'count',
    requirementTarget: 1,
    trackingKey: 'tournaments_joined',
  },
  {
    id: 'first_win',
    name: 'Victory!',
    description: 'Win your first match in any tournament',
    category: 'club_participation',
    type: 'one_time',
    rewardCents: 300,
    isActive: true,
    requirementType: 'count',
    requirementTarget: 1,
    trackingKey: 'matches_won',
  },
  {
    id: 'tournament_champion',
    name: 'Champion',
    description: 'Win a tournament',
    category: 'club_participation',
    type: 'progressive',
    rewardCents: 1000,
    isActive: true,
    requirementType: 'count',
    requirementTarget: 1,
    trackingKey: 'tournaments_won',
  },
  {
    id: 'first_purchase',
    name: 'Shopaholic',
    description: 'Make your first shop purchase',
    category: 'social',
    type: 'one_time',
    rewardCents: 100,
    isActive: true,
    requirementType: 'count',
    requirementTarget: 1,
    trackingKey: 'shop_purchases',
  },
  {
    id: 'refer_friend',
    name: 'Recruiter',
    description: 'Refer a friend to join BUG Gaming Club',
    category: 'social',
    type: 'progressive',
    rewardCents: 500,
    isActive: true,
    requirementType: 'count',
    requirementTarget: 1,
    trackingKey: 'referrals',
  },
];

async function seedQuests() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');

  console.log('🎯 Quest Seeding Script');
  console.log('='.repeat(50));

  if (dryRun) {
    console.log('📋 DRY RUN MODE - No changes will be made');
  }

  try {
    let created = 0;
    let skipped = 0;
    let updated = 0;

    for (const questData of INITIAL_QUESTS) {
      const questRef = db.collection('quests').doc(questData.id);
      const questDoc = await questRef.get();

      if (questDoc.exists && !force) {
        console.log(`⏭️  Skipped: ${questData.name} (already exists)`);
        skipped++;
      } else {
        const now = admin.firestore.Timestamp.now();
        const dataToSave = {
          ...questData,
          createdAt: now,
          createdBy: 'system',
          updatedAt: questDoc.exists ? now : undefined,
        };

        if (dryRun) {
          console.log(`✅ Would create: ${questData.name}`);
          created++;
        } else {
          if (questDoc.exists) {
            await questRef.update(dataToSave);
            console.log(`🔄 Updated: ${questData.name}`);
            updated++;
          } else {
            await questRef.set(dataToSave);
            console.log(`✅ Created: ${questData.name}`);
            created++;
          }
        }
      }
    }

    console.log('='.repeat(50));
    console.log('📊 Summary:');
    console.log(`  ✅ Created: ${created}`);
    console.log(`  🔄 Updated: ${updated}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  📈 Total: ${created + updated + skipped}/${INITIAL_QUESTS.length}`);

    if (dryRun) {
      console.log('\n💡 Run without --dry-run to apply changes');
    } else {
      console.log('\n✨ Seeding complete!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding quests:', error);
    process.exit(1);
  }
}

seedQuests();
