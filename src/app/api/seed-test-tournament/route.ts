import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

export async function POST() {
  try {
    const tournamentId = 'test-bracket-8';
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

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
        joinDate: Timestamp.fromDate(now),
        isActive: true,
        lastLoginDate: Timestamp.fromDate(now),
        preferences: {
          notifications: true,
          emailUpdates: false,
          favoriteGames: [],
        },
      };
    });

    // Seed users
    for (const u of users) {
      await setDoc(doc(db, 'users', u.uid), u, { merge: true });
    }

    // 2) Create tournament document
    const tournamentDoc = {
      id: tournamentId,
      name: 'UI Test Bracket (8 players)',
      description: 'Seeded test tournament to validate bracket visuals',
      game: 'super_smash_bros',
      date: Timestamp.fromDate(tomorrow),
      registrationDeadline: Timestamp.fromDate(new Date(now.getTime() + 6 * 60 * 60 * 1000)),
      maxParticipants: 8,
      participants: users.map(u => u.uid),
      rules: ['Best of 3', 'No items', 'Legal stages only'],
      status: 'ongoing',
      pointsAwarded: { first: 100, second: 75, third: 50, participation: 10 },
      createdAt: Timestamp.fromDate(now),
      createdBy: 'admin',
      format: 'single_elimination',
      entryFee: 0,
      prizePool: 0,
    };

    await setDoc(doc(db, 'tournaments', tournamentId), tournamentDoc);

    // 3) Create single-elimination bracket for 8 players
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
        createdAt: Timestamp.fromDate(now),
        completedAt: Timestamp.fromDate(new Date(now.getTime() + 30 * 60 * 1000)),
        scheduledTime: Timestamp.fromDate(tomorrow),
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
        createdAt: Timestamp.fromDate(now),
        completedAt: Timestamp.fromDate(new Date(now.getTime() + 35 * 60 * 1000)),
        scheduledTime: Timestamp.fromDate(tomorrow),
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
        createdAt: Timestamp.fromDate(now),
        scheduledTime: Timestamp.fromDate(tomorrow),
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
        createdAt: Timestamp.fromDate(now),
        scheduledTime: Timestamp.fromDate(tomorrow),
        location: 'Arena 2',
      },

      // Semifinals
      {
        id: `${tournamentId}_M5`,
        tournamentId,
        round: 2,
        matchNumber: 5,
        bracket: 'winners',
        status: 'pending',
        nextMatchId: `${tournamentId}_M7`,
        createdAt: Timestamp.fromDate(now),
        scheduledTime: Timestamp.fromDate(new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000)),
        location: 'Main Hall',
      },
      {
        id: `${tournamentId}_M6`,
        tournamentId,
        round: 2,
        matchNumber: 6,
        bracket: 'winners',
        status: 'pending',
        nextMatchId: `${tournamentId}_M7`,
        createdAt: Timestamp.fromDate(now),
        scheduledTime: Timestamp.fromDate(new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000)),
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
        createdAt: Timestamp.fromDate(now),
        scheduledTime: Timestamp.fromDate(new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000)),
        location: 'Main Stage',
      },
    ];

    const winnersMatches = matches.filter(m => m.bracket === 'winners');

    const bracketDoc = {
      id: `bracket_${tournamentId}`,
      tournamentId,
      format: 'single_elimination',
      matches,
      winnersMatches,
      totalRounds: 3,
      currentRound: 1,
      isComplete: false,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    await setDoc(doc(db, 'tournament_brackets', bracketDoc.id), bracketDoc);

    return NextResponse.json({
      success: true,
      message: 'Test tournament created successfully!',
      tournamentId,
      url: `/tournaments/${tournamentId}`,
    });
  } catch (error) {
    console.error('Error seeding test tournament:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create test tournament' },
      { status: 500 }
    );
  }
}
