// Simple script to populate game genres - run this in browser console after authentication
// Copy and paste this entire script into the browser console on the admin page

async function populateGameGenres() {
  console.log('🎮 Starting game genres population...');
  
  const defaultGenres = [
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
    }
  ];

  try {
    // Import Firebase functions (assuming they're available globally)
    const { getFirestore, collection, doc, setDoc, Timestamp } = window.firebase || {};
    
    if (!getFirestore) {
      console.error('❌ Firebase not available. Make sure you are on the admin page.');
      return;
    }

    const db = getFirestore();
    const adminUserId = 'system-migration';

    for (const genre of defaultGenres) {
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
    
    console.log('\n🎉 Game genres populated successfully!');
    console.log(`📊 Created ${defaultGenres.length} game genres`);
    
    // Refresh the page to see the changes
    console.log('🔄 Refreshing page to show new genres...');
    setTimeout(() => window.location.reload(), 1000);
    
  } catch (error) {
    console.error('❌ Error populating genres:', error);
  }
}

// Run the function
populateGameGenres();
