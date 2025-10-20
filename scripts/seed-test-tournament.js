/*
  Seed a complete test tournament with 8 participants and a generated single-elimination bracket.
  Requirements:
  - Place your Firebase service account JSON at scripts/serviceAccountKey.json
    OR set GOOGLE_APPLICATION_CREDENTIALS env var to the absolute path of your service account JSON.

  Run:
    node scripts/seed-test-tournament.js

  After running, open:
    http://localhost:3002/tournaments/test-bracket-8
*/

const admin = require('firebase-admin');
const path = require('path');

function initFirebaseAdmin() {
  // Prefer GOOGLE_APPLICATION_CREDENTIALS if provided
  if (!admin.apps.length) {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      return;
    }
    // Fallback to local JSON key in scripts/
    const keyPath = path.join(__dirname, 'serviceAccountKey.json');
    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const serviceAccount = require(keyPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      console.error('\n❌ Missing service account credentials.');
      console.error('   Provide one of:');
      console.error('   1) Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path');
      console.error('   2) Put serviceAccountKey.json at scripts/serviceAccountKey.json');
      process.exit(1);
    }
  }
}

function ts(date) {
  return admin.firestore.Timestamp.fromDate(date);
}

async function up() {
  initFirebaseAdmin();
  const db = admin.firestore();

  const tournamentId = 'test-bracket-8';

  // 1) Create 8 test users
  const users = Array.from({ length: 8 }).map((_, i) => {
    const num = i + 1;
    const uid = `testuser${num}`;
    return {
      uid,
      email: `${uid}@example.com`,
      displayName: `Player ${num}`,
      role: 'member',
      roles: ['member'],
      points: 0,
      weeklyPoints: 0,
      monthlyPoints: 0,
      eloRating: 1200,
      joinDate: ts(new Date()),
      isActive: true,
      lastLoginDate: ts(new Date()),
      preferences: {
        notifications: true,
        emailUpdates: false,
        favoriteGames: [],
      },
    };
  });

  console.log('→ Seeding users...');
  for (const u of users) {
    await db.collection('users').doc(u.uid).set(u, { merge: true });
  }
  console.log(`✓ Seeded ${users.length} users`);

  // 2) Create tournament document
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const tournamentDoc = {
    id: tournamentId,
    name: 'UI Test Bracket (8 players)',
    description: 'Seeded test tournament to validate bracket visuals',
    game: 'super_smash_bros',
    date: ts(tomorrow),
    registrationDeadline: ts(new Date(now.getTime() + 6 * 60 * 60 * 1000)),
    maxParticipants: 8,
    participants: users.map(u => u.uid),
    rules: ['Best of 3', 'No items', 'Legal stages only'],
    status: 'ongoing',
    pointsAwarded: { first: 100, second: 75, third: 50, participation: 10 },
    createdAt: ts(now),
    createdBy: 'admin',
    format: 'single_elimination',
    entryFee: 0,
    prizePool: 0,
  };

  console.log('→ Creating tournament...');
  await db.collection('tournaments').doc(tournamentId).set(tournamentDoc);
  console.log('✓ Tournament created');

  // 3) Create single-elimination bracket for 8 players
  // Round 1: M1-M4, Round 2 (Semis): M5-M6, Round 3 (Final): M7
  const pid = users.map(u => u.uid);

  const matches = [
    // Round 1
    {
      id: `${tournamentId}_M1`,
      tournamentId,
      round: 1,
      matchNumber: 1,
      bracket: 'winners',
      player1Id: pid[0],
      player2Id: pid[1],
      player1Name: 'Player 1',
      player2Name: 'Player 2',
      winnerId: pid[0],
      score: { player1: 2, player2: 0 },
      status: 'completed',
      nextMatchId: `${tournamentId}_M5`,
      createdAt: ts(now),
      completedAt: ts(new Date(now.getTime() + 30 * 60 * 1000)),
      scheduledTime: ts(tomorrow),
      location: 'Main Hall',
    },
    {
      id: `${tournamentId}_M2`,
      tournamentId,
      round: 1,
      matchNumber: 2,
      bracket: 'winners',
      player1Id: pid[2],
      player2Id: pid[3],
      player1Name: 'Player 3',
      player2Name: 'Player 4',
      winnerId: pid[3],
      score: { player1: 1, player2: 2 },
      status: 'completed',
      nextMatchId: `${tournamentId}_M5`,
      createdAt: ts(now),
      completedAt: ts(new Date(now.getTime() + 35 * 60 * 1000)),
      scheduledTime: ts(tomorrow),
      location: 'Main Hall',
    },
    {
      id: `${tournamentId}_M3`,
      tournamentId,
      round: 1,
      matchNumber: 3,
      bracket: 'winners',
      player1Id: pid[4],
      player2Id: pid[5],
      player1Name: 'Player 5',
      player2Name: 'Player 6',
      status: 'in_progress',
      score: { player1: 1, player2: 0 },
      nextMatchId: `${tournamentId}_M6`,
      createdAt: ts(now),
      scheduledTime: ts(tomorrow),
      location: 'Arena 2',
    },
    {
      id: `${tournamentId}_M4`,
      tournamentId,
      round: 1,
      matchNumber: 4,
      bracket: 'winners',
      player1Id: pid[6],
      player2Id: pid[7],
      player1Name: 'Player 7',
      player2Name: 'Player 8',
      status: 'pending',
      nextMatchId: `${tournamentId}_M6`,
      createdAt: ts(now),
      scheduledTime: ts(tomorrow),
      location: 'Arena 2',
    },

    // Semifinals
    {
      id: `${tournamentId}_M5`,
      tournamentId,
      round: 2,
      matchNumber: 5,
      bracket: 'winners',
      // Winners of M1 and M2
      status: 'pending',
      nextMatchId: `${tournamentId}_M7`,
      createdAt: ts(now),
      scheduledTime: ts(new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000)),
      location: 'Main Hall',
    },
    {
      id: `${tournamentId}_M6`,
      tournamentId,
      round: 2,
      matchNumber: 6,
      bracket: 'winners',
      // Winners of M3 and M4
      status: 'pending',
      nextMatchId: `${tournamentId}_M7`,
      createdAt: ts(now),
      scheduledTime: ts(new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000)),
      location: 'Arena 2',
    },

    // Final
    {
      id: `${tournamentId}_M7`,
      tournamentId,
      round: 3,
      matchNumber: 7,
      bracket: 'winners',
      status: 'pending',
      createdAt: ts(now),
      scheduledTime: ts(new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000)),
      location: 'Main Stage',
    },
  ];

  const winnersMatches = matches.filter(m => m.bracket === 'winners');

  // Firestore document mirrors app's expected schema
  const bracketDoc = {
    id: `bracket_${tournamentId}`,
    tournamentId,
    format: 'single_elimination',
    matches,
    winnersMatches,
    totalRounds: 3,
    currentRound: 1,
    isComplete: false,
    createdAt: ts(now),
    updatedAt: ts(now),
  };

  console.log('→ Creating bracket...');
  await db.collection('tournament_brackets').doc(bracketDoc.id).set(bracketDoc);
  console.log('✓ Bracket created');

  console.log('\n✅ Done! View the tournament at:');
  console.log(`   http://localhost:3002/tournaments/${tournamentId}`);
}

up().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

