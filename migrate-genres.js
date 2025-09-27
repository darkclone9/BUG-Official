/**
 * Simple migration script to populate game genres
 * Run with: node migrate-genres.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, Timestamp } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration
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

// Default game genres to migrate
const defaultGameGenres = [
  {
    id: 'mario_kart',
    name: 'mario_kart',
    displayName: 'Mario Kart',
    description: 'High-speed kart racing with power-ups and competitive multiplayer action',
    isActive: true,
    displayOrder: 1,
    color: '#FF6B6B',
    iconUrl: '',
  },
  {
    id: 'super_smash_bros',
    name: 'super_smash_bros',
    displayName: 'Super Smash Bros',
    description: 'Fighting game featuring Nintendo characters in epic battles',
    isActive: true,
    displayOrder: 2,
    color: '#4ECDC4',
    iconUrl: '',
  },
  {
    id: 'general',
    name: 'general',
    displayName: 'General Gaming',
    description: 'Mixed gaming events and general gaming activities',
    isActive: true,
    displayOrder: 3,
    color: '#45B7D1',
    iconUrl: '',
  },
  {
    id: 'rocket_league',
    name: 'rocket_league',
    displayName: 'Rocket League',
    description: 'Soccer meets driving in this high-octane sports game',
    isActive: true,
    displayOrder: 4,
    color: '#FFA726',
    iconUrl: '',
  },
  {
    id: 'fortnite',
    name: 'fortnite',
    displayName: 'Fortnite',
    description: 'Battle royale game with building mechanics and competitive gameplay',
    isActive: true,
    displayOrder: 5,
    color: '#9C27B0',
    iconUrl: '',
  },
  {
    id: 'valorant',
    name: 'valorant',
    displayName: 'Valorant',
    description: 'Tactical first-person shooter with unique agent abilities',
    isActive: true,
    displayOrder: 6,
    color: '#FF5722',
    iconUrl: '',
  },
  {
    id: 'league_of_legends',
    name: 'league_of_legends',
    displayName: 'League of Legends',
    description: 'Strategic multiplayer online battle arena (MOBA) game',
    isActive: true,
    displayOrder: 7,
    color: '#C9B037',
    iconUrl: '',
  },
  {
    id: 'minecraft',
    name: 'minecraft',
    displayName: 'Minecraft',
    description: 'Creative sandbox game with building, survival, and adventure modes',
    isActive: true,
    displayOrder: 8,
    color: '#8BC34A',
    iconUrl: '',
  },
];

async function migrateGameGenres() {
  console.log('Starting game genres migration...');
  
  try {
    const adminUserId = 'system-migration';
    
    for (const genre of defaultGameGenres) {
      const genreRef = doc(db, 'game_genres', genre.id);
      
      const genreData = {
        ...genre,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: adminUserId,
      };
      
      await setDoc(genreRef, genreData);
      console.log(`✅ Created genre: ${genre.displayName}`);
    }
    
    console.log('\n🎉 Game genres migration completed successfully!');
    console.log(`📊 Migrated ${defaultGameGenres.length} game genres`);
    
    // Log summary
    console.log('\n📋 Migration Summary:');
    defaultGameGenres.forEach((genre, index) => {
      console.log(`${index + 1}. ${genre.displayName} (${genre.name})`);
    });
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
}

// Run migration
migrateGameGenres()
  .then(() => {
    console.log('\n✨ Migration script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
