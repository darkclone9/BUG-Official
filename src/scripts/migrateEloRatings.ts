/**
 * Migration Script: Add ELO Ratings to Existing Users
 *
 * This script adds default ELO ratings to existing users and game stats
 * that don't have ELO data yet.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { ELO_CONSTANTS } from '../lib/eloSystem';

// Firebase configuration (replace with your config)
const firebaseConfig = {
  // Your Firebase config here
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateUserEloRatings() {
  console.log('🚀 Starting ELO rating migration...');

  try {
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const batch = writeBatch(db);
    let userUpdateCount = 0;

    console.log(`📊 Found ${usersSnapshot.docs.length} users to process`);

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();

      // Add ELO rating if it doesn't exist
      if (userData.eloRating === undefined) {
        const userRef = doc(db, 'users', userDoc.id);
        batch.update(userRef, {
          eloRating: ELO_CONSTANTS.DEFAULT_RATING,
        });
        userUpdateCount++;
      }
    }

    // Commit user updates
    if (userUpdateCount > 0) {
      await batch.commit();
      console.log(`✅ Updated ${userUpdateCount} users with default ELO ratings`);
    } else {
      console.log('✅ All users already have ELO ratings');
    }

  } catch (error) {
    console.error('❌ Error migrating user ELO ratings:', error);
    throw error;
  }
}

async function migrateGameStatsElo() {
  console.log('🎮 Starting game stats ELO migration...');

  try {
    // Get all user stats
    const statsSnapshot = await getDocs(collection(db, 'user_stats'));
    let statsUpdateCount = 0;

    console.log(`📊 Found ${statsSnapshot.docs.length} user stats to process`);

    for (const statsDoc of statsSnapshot.docs) {
      const statsData = statsDoc.data();
      const gameStats = statsData.gameStats || {};
      let needsUpdate = false;

      // Check each game's stats
      for (const [, stats] of Object.entries(gameStats)) {
        if (stats && typeof stats === 'object') {
          const gameStatsObj = stats as Record<string, unknown>;

          // Add ELO rating if it doesn't exist
          if (gameStatsObj.eloRating === undefined) {
            gameStatsObj.eloRating = ELO_CONSTANTS.DEFAULT_RATING;
            needsUpdate = true;
          }

          // Add ELO history if it doesn't exist
          if (gameStatsObj.eloHistory === undefined) {
            gameStatsObj.eloHistory = [];
            needsUpdate = true;
          }
        }
      }

      // Update the document if needed
      if (needsUpdate) {
        const statsRef = doc(db, 'user_stats', statsDoc.id);
        await updateDoc(statsRef, {
          gameStats: gameStats,
          lastUpdated: new Date(),
        });
        statsUpdateCount++;
      }
    }

    console.log(`✅ Updated ${statsUpdateCount} user stats with ELO data`);

  } catch (error) {
    console.error('❌ Error migrating game stats ELO:', error);
    throw error;
  }
}

async function createEloIndexes() {
  console.log('📋 ELO indexes should be created manually in Firebase Console:');
  console.log('');
  console.log('1. Go to Firestore Database > Indexes');
  console.log('2. Create composite index for users collection:');
  console.log('   - Collection: users');
  console.log('   - Fields: eloRating (Descending)');
  console.log('');
  console.log('3. Create composite indexes for user_stats collection:');
  console.log('   - Collection: user_stats');
  console.log('   - Fields: gameStats.mario_kart.eloRating (Descending)');
  console.log('   - Fields: gameStats.super_smash_bros.eloRating (Descending)');
  console.log('   - Add more as needed for each game type');
  console.log('');
  console.log('Or add to firestore.indexes.json:');
  console.log(`
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "eloRating", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "user_stats",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "gameStats.mario_kart.eloRating", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "user_stats",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "gameStats.super_smash_bros.eloRating", "order": "DESCENDING" }
      ]
    }
  ]
}
  `);
}

async function runMigration() {
  console.log('🔄 Starting ELO Rating System Migration');
  console.log('=====================================');

  try {
    await migrateUserEloRatings();
    await migrateGameStatsElo();
    await createEloIndexes();

    console.log('');
    console.log('🎉 ELO Rating Migration Completed Successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Deploy the Firestore indexes shown above');
    console.log('2. Test the ELO system with a tournament');
    console.log('3. Monitor ELO calculations in the admin panel');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  runMigration();
}

export { runMigration, migrateUserEloRatings, migrateGameStatsElo };
