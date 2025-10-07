/**
 * Cleanup Duplicate Conversations Script
 * 
 * This script finds and removes duplicate conversations for all users.
 * Run this once to clean up any existing duplicates.
 * 
 * Usage:
 *   npx ts-node scripts/cleanup-duplicate-conversations.ts
 */

import { initializeApp } from 'firebase/app';
import { collection, deleteDoc, doc, getDocs, getFirestore } from 'firebase/firestore';

// Firebase configuration (use your actual config)
const firebaseConfig = {
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

async function cleanupDuplicateConversations() {
  try {
    console.log('🔍 Scanning for duplicate conversations...\n');

    const conversationsRef = collection(db, 'conversations');
    const snapshot = await getDocs(conversationsRef);
    
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📊 Total conversations found: ${conversations.length}\n`);

    // Group conversations by participant pair
    const conversationGroups = new Map<string, any[]>();
    
    conversations.forEach(conv => {
      const participants = (conv.participants as string[]).sort().join('_');
      if (!conversationGroups.has(participants)) {
        conversationGroups.set(participants, []);
      }
      conversationGroups.get(participants)!.push(conv);
    });

    // Find and delete duplicates (keep the oldest one)
    let duplicateGroupsCount = 0;
    let totalDeletedCount = 0;

    for (const [participantPair, group] of conversationGroups) {
      if (group.length > 1) {
        duplicateGroupsCount++;
        console.log(`\n🔄 Found ${group.length} duplicate conversations for: ${participantPair}`);
        
        // Sort by createdAt, keep the oldest
        group.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
          const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
          return aTime - bTime;
        });

        console.log(`   ✅ Keeping conversation: ${group[0].id} (created: ${group[0].createdAt?.toDate?.()})`);

        // Delete all except the first (oldest)
        for (let i = 1; i < group.length; i++) {
          console.log(`   ❌ Deleting duplicate: ${group[i].id} (created: ${group[i].createdAt?.toDate?.()})`);
          await deleteDoc(doc(db, 'conversations', group[i].id));
          totalDeletedCount++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Cleanup Complete!');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Total conversations scanned: ${conversations.length}`);
    console.log(`   - Duplicate groups found: ${duplicateGroupsCount}`);
    console.log(`   - Conversations deleted: ${totalDeletedCount}`);
    console.log(`   - Conversations remaining: ${conversations.length - totalDeletedCount}`);
    console.log('='.repeat(60) + '\n');

    if (totalDeletedCount === 0) {
      console.log('🎉 No duplicates found! Your database is clean.\n');
    } else {
      console.log('🎉 All duplicate conversations have been removed!\n');
    }

  } catch (error) {
    console.error('❌ Error cleaning up duplicate conversations:', error);
    throw error;
  }
}

// Run the cleanup
cleanupDuplicateConversations()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

