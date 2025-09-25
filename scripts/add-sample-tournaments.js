const admin = require('firebase-admin');
const serviceAccount = require('../path/to/serviceAccountKey.json'); // You'll need to download this from Firebase Console

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const sampleTournaments = [
  {
    id: 'tournament-1',
    name: 'Mario Kart 8 Deluxe Championship',
    description: 'The ultimate Mario Kart tournament featuring all tracks and characters. Single elimination format with best of 3 races.',
    game: 'mario_kart',
    date: admin.firestore.Timestamp.fromDate(new Date('2024-02-15')),
    registrationDeadline: admin.firestore.Timestamp.fromDate(new Date('2024-02-14')),
    maxParticipants: 32,
    participants: [],
    status: 'upcoming',
    format: 'single_elimination',
    pointsAwarded: {
      first: 100,
      second: 75,
      third: 50,
      participation: 10
    },
    rules: [
      'No cheating or glitching',
      'Respect other players',
      'Must complete all races',
      'Items allowed'
    ],
    createdAt: admin.firestore.Timestamp.now(),
    createdBy: 'admin', // Replace with actual admin UID
    entryFee: 0,
    prizePool: 0
  },
  {
    id: 'tournament-2',
    name: 'Super Smash Bros Ultimate Tournament',
    description: 'Epic Super Smash Bros Ultimate tournament with double elimination brackets. All characters and stages allowed.',
    game: 'super_smash_bros',
    date: admin.firestore.Timestamp.fromDate(new Date('2024-02-20')),
    registrationDeadline: admin.firestore.Timestamp.fromDate(new Date('2024-02-18')),
    maxParticipants: 16,
    participants: [],
    status: 'upcoming',
    format: 'double_elimination',
    pointsAwarded: {
      first: 200,
      second: 150,
      third: 100,
      participation: 25
    },
    rules: [
      'Best of 3 matches',
      'No items',
      'Omega stages only',
      'Must be available for full tournament'
    ],
    createdAt: admin.firestore.Timestamp.now(),
    createdBy: 'admin', // Replace with actual admin UID
    entryFee: 0,
    prizePool: 0
  },
  {
    id: 'tournament-3',
    name: 'Mario Kart Weekly Race',
    description: 'Weekly Mario Kart racing event with rotating track selection. Perfect for casual competition!',
    game: 'mario_kart',
    date: admin.firestore.Timestamp.fromDate(new Date('2024-02-25')),
    registrationDeadline: admin.firestore.Timestamp.fromDate(new Date('2024-02-23')),
    maxParticipants: 16,
    participants: [],
    status: 'upcoming',
    format: 'round_robin',
    pointsAwarded: {
      first: 150,
      second: 100,
      third: 75,
      participation: 15
    },
    rules: [
      'All tracks random',
      'Items enabled',
      'Best of 5 races',
      'No custom karts'
    ],
    createdAt: admin.firestore.Timestamp.now(),
    createdBy: 'admin', // Replace with actual admin UID
    entryFee: 0,
    prizePool: 0
  },
  {
    id: 'tournament-4',
    name: 'Super Smash Bros Masters',
    description: 'Professional-level Super Smash Bros tournament with strict competitive rules.',
    game: 'super_smash_bros',
    date: admin.firestore.Timestamp.fromDate(new Date('2024-01-05')),
    registrationDeadline: admin.firestore.Timestamp.fromDate(new Date('2024-01-03')),
    maxParticipants: 8,
    participants: [],
    status: 'completed',
    format: 'double_elimination',
    pointsAwarded: {
      first: 180,
      second: 120,
      third: 80,
      participation: 20
    },
    rules: [
      'Competitive ruleset',
      'No items',
      'Legal stages only',
      'Best of 5 finals'
    ],
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-01')),
    createdBy: 'admin', // Replace with actual admin UID
    entryFee: 0,
    prizePool: 0
  }
];

async function addSampleTournaments() {
  try {
    console.log('Adding sample tournaments...');
    
    for (const tournament of sampleTournaments) {
      await db.collection('tournaments').doc(tournament.id).set(tournament);
      console.log(`Added tournament: ${tournament.name}`);
    }
    
    console.log('✅ All sample tournaments added successfully!');
  } catch (error) {
    console.error('❌ Error adding tournaments:', error);
  }
}

addSampleTournaments();