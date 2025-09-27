import {
    AdminUser,
    Announcement,
    GameGenre,
    GameType,
    LeaderboardEntry,
    SearchResult,
    Tournament,
    TournamentRegistration,
    User,
    UserStats,
    EloHistoryEntry
} from '@/types/types';
import { BracketMatch, TournamentBracket, BracketGenerationOptions } from '@/types/bracket';
import { BracketGenerator } from './bracketGenerator';
import {
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    limit,
    orderBy,
    query,
    setDoc,
    Timestamp,
    updateDoc,
    where,
    writeBatch,
    WriteBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// User Management
export const createUser = async (user: User): Promise<void> => {
  await setDoc(doc(db, 'users', user.uid), {
    ...user,
    joinDate: Timestamp.fromDate(user.joinDate),
  });
};

export const getUser = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;

  const data = userDoc.data();
  return {
    ...data,
    joinDate: data.joinDate.toDate(),
    lastLoginDate: data.lastLoginDate?.toDate(),
  } as User;
};

export const updateUser = async (uid: string, updates: Partial<User>): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  const updateData: Record<string, unknown> = { ...updates };

  if (updates.joinDate) {
    updateData.joinDate = Timestamp.fromDate(updates.joinDate);
  }
  if (updates.lastLoginDate) {
    updateData.lastLoginDate = Timestamp.fromDate(updates.lastLoginDate);
  }

  await updateDoc(docRef, updateData);
};

export const updateUserProfile = async (uid: string, profileData: {
  displayName?: string;
  email?: string;
  avatar?: string;
}): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    ...profileData,
    updatedAt: Timestamp.now()
  });
};

export const getAllUsers = async (): Promise<User[]> => {
  const usersQuery = query(collection(db, 'users'));
  const snapshot = await getDocs(usersQuery);

  const users = snapshot.docs.map(doc => ({
    ...doc.data(),
    joinDate: doc.data().joinDate.toDate(),
    lastLoginDate: doc.data().lastLoginDate?.toDate(),
  })) as User[];

  // Sort by displayName on the client side
  return users.sort((a, b) => a.displayName.localeCompare(b.displayName));
};

// Tournament Management
export const createTournament = async (tournament: Tournament): Promise<void> => {
  await setDoc(doc(db, 'tournaments', tournament.id), {
    ...tournament,
    date: Timestamp.fromDate(tournament.date),
    registrationDeadline: Timestamp.fromDate(tournament.registrationDeadline),
    createdAt: Timestamp.fromDate(tournament.createdAt),
  });
};

export const getTournament = async (id: string): Promise<Tournament | null> => {
  const tournamentDoc = await getDoc(doc(db, 'tournaments', id));
  if (!tournamentDoc.exists()) return null;

  const data = tournamentDoc.data();
  return {
    ...data,
    date: data.date.toDate(),
    registrationDeadline: data.registrationDeadline.toDate(),
    createdAt: data.createdAt.toDate(),
  } as Tournament;
};

export const getTournaments = async (gameType?: GameType, status?: string): Promise<Tournament[]> => {
  let tournamentQuery = query(collection(db, 'tournaments'), orderBy('date', 'desc'));

  if (gameType) {
    tournamentQuery = query(tournamentQuery, where('game', '==', gameType));
  }

  if (status) {
    tournamentQuery = query(tournamentQuery, where('status', '==', status));
  }

  const snapshot = await getDocs(tournamentQuery);

  return snapshot.docs.map(doc => ({
    ...doc.data(),
    date: doc.data().date.toDate(),
    registrationDeadline: doc.data().registrationDeadline.toDate(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Tournament[];
};

export const updateTournament = async (id: string, updates: Partial<Tournament>): Promise<void> => {
  const docRef = doc(db, 'tournaments', id);
  const updateData: Record<string, unknown> = { ...updates };

  if (updates.date) {
    updateData.date = Timestamp.fromDate(updates.date);
  }
  if (updates.registrationDeadline) {
    updateData.registrationDeadline = Timestamp.fromDate(updates.registrationDeadline);
  }
  if (updates.createdAt) {
    updateData.createdAt = Timestamp.fromDate(updates.createdAt);
  }

  await updateDoc(docRef, updateData);
};

export const deleteTournament = async (id: string): Promise<void> => {
  const batch = writeBatch(db);

  // Delete tournament document
  const tournamentRef = doc(db, 'tournaments', id);
  batch.delete(tournamentRef);

  // Delete all tournament registrations
  const registrationsQuery = query(
    collection(db, 'tournament_registrations'),
    where('tournamentId', '==', id)
  );
  const registrationsSnapshot = await getDocs(registrationsQuery);

  registrationsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};

// Tournament Registration Management
export const registerForTournament = async (registration: TournamentRegistration): Promise<void> => {
  const batch = writeBatch(db);

  // Add registration document
  const registrationRef = doc(db, 'tournament_registrations', registration.id);
  batch.set(registrationRef, {
    ...registration,
    registeredAt: Timestamp.fromDate(registration.registeredAt),
  });

  // Update tournament participants
  const tournamentRef = doc(db, 'tournaments', registration.tournamentId);
  batch.update(tournamentRef, {
    participants: arrayUnion(registration.userId),
  });

  await batch.commit();
};

export const unregisterFromTournament = async (tournamentId: string, userId: string): Promise<void> => {
  const batch = writeBatch(db);

  // Find and delete registration
  const registrationsQuery = query(
    collection(db, 'tournament_registrations'),
    where('tournamentId', '==', tournamentId),
    where('userId', '==', userId)
  );
  const registrations = await getDocs(registrationsQuery);

  registrations.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Update tournament participants
  const tournamentRef = doc(db, 'tournaments', tournamentId);
  batch.update(tournamentRef, {
    participants: arrayRemove(userId),
  });

  await batch.commit();
};

export const getTournamentRegistrations = async (tournamentId: string): Promise<TournamentRegistration[]> => {
  const registrationsQuery = query(
    collection(db, 'tournament_registrations'),
    where('tournamentId', '==', tournamentId),
    orderBy('registeredAt')
  );
  const snapshot = await getDocs(registrationsQuery);

  return snapshot.docs.map(doc => ({
    ...doc.data(),
    registeredAt: doc.data().registeredAt.toDate(),
  })) as TournamentRegistration[];
};

export const getUserRegistrations = async (userId: string): Promise<TournamentRegistration[]> => {
  const registrationsQuery = query(
    collection(db, 'tournament_registrations'),
    where('userId', '==', userId),
    orderBy('registeredAt', 'desc')
  );
  const snapshot = await getDocs(registrationsQuery);

  return snapshot.docs.map(doc => ({
    ...doc.data(),
    registeredAt: doc.data().registeredAt.toDate(),
  })) as TournamentRegistration[];
};

// User Statistics Management
export const createUserStats = async (userStats: UserStats): Promise<void> => {
  await setDoc(doc(db, 'user_stats', userStats.uid), {
    ...userStats,
    lastUpdated: Timestamp.fromDate(userStats.lastUpdated),
  });
};

export const getUserStats = async (uid: string): Promise<UserStats | null> => {
  const statsDoc = await getDoc(doc(db, 'user_stats', uid));
  if (!statsDoc.exists()) return null;

  const data = statsDoc.data();
  return {
    ...data,
    lastUpdated: data.lastUpdated.toDate(),
  } as UserStats;
};

export const updateUserStats = async (uid: string, updates: Partial<UserStats>): Promise<void> => {
  const docRef = doc(db, 'user_stats', uid);
  const updateData: Record<string, unknown> = { ...updates };

  if (updates.lastUpdated) {
    updateData.lastUpdated = Timestamp.fromDate(updates.lastUpdated);
  }

  await updateDoc(docRef, updateData);
};

// Leaderboard Functions
export const getLeaderboard = async (gameType?: GameType, timeframe: 'all' | 'weekly' | 'monthly' = 'all'): Promise<LeaderboardEntry[]> => {
  let pointsField = 'points';
  if (timeframe === 'weekly') pointsField = 'weeklyPoints';
  if (timeframe === 'monthly') pointsField = 'monthlyPoints';

  const usersQuery = query(
    collection(db, 'users'),
    orderBy(pointsField, 'desc'),
    limit(100)
  );

  const snapshot = await getDocs(usersQuery);

  return snapshot.docs.map((doc, index) => ({
    uid: doc.id,
    displayName: doc.data().displayName,
    avatar: doc.data().avatar,
    points: doc.data().points,
    weeklyPoints: doc.data().weeklyPoints,
    monthlyPoints: doc.data().monthlyPoints,
    rank: index + 1,
  })) as LeaderboardEntry[];
};

// Announcement Management
export const createAnnouncement = async (announcement: Announcement): Promise<void> => {
  await setDoc(doc(db, 'announcements', announcement.id), {
    ...announcement,
    createdAt: Timestamp.fromDate(announcement.createdAt),
    updatedAt: announcement.updatedAt ? Timestamp.fromDate(announcement.updatedAt) : null,
    expiresAt: announcement.expiresAt ? Timestamp.fromDate(announcement.expiresAt) : null,
  });
};

export const getAnnouncements = async (activeOnly: boolean = true): Promise<Announcement[]> => {
  let announcementsQuery;

  if (activeOnly) {
    // When filtering by isActive, put the where clause first, then orderBy
    announcementsQuery = query(
      collection(db, 'announcements'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
  } else {
    // When not filtering, just orderBy
    announcementsQuery = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc')
    );
  }

  const snapshot = await getDocs(announcementsQuery);

  return snapshot.docs.map(doc => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
    expiresAt: doc.data().expiresAt?.toDate(),
  })) as Announcement[];
};

export const updateAnnouncement = async (id: string, updates: Partial<Announcement>): Promise<void> => {
  const docRef = doc(db, 'announcements', id);
  const updateData: Record<string, unknown> = { ...updates };

  if (updates.createdAt) {
    updateData.createdAt = Timestamp.fromDate(updates.createdAt);
  }
  if (updates.updatedAt) {
    updateData.updatedAt = Timestamp.fromDate(updates.updatedAt);
  }

  // Handle expiresAt field - can be a Date, null, or undefined
  if ('expiresAt' in updates) {
    if (updates.expiresAt) {
      updateData.expiresAt = Timestamp.fromDate(updates.expiresAt);
    } else {
      updateData.expiresAt = null;
    }
  }

  await updateDoc(docRef, updateData);
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  const docRef = doc(db, 'announcements', id);
  await updateDoc(docRef, { isActive: false });
};

export const markAnnouncementAsRead = async (announcementId: string, userId: string): Promise<void> => {
  const docRef = doc(db, 'announcements', announcementId);
  await updateDoc(docRef, {
    readBy: arrayUnion(userId),
  });
};

export const dismissBroadcastAnnouncement = async (announcementId: string, userId: string): Promise<void> => {
  const docRef = doc(db, 'announcements', announcementId);
  await updateDoc(docRef, {
    dismissedBy: arrayUnion(userId),
  });
};

export const getBroadcastAnnouncements = async (): Promise<Announcement[]> => {
  // Temporarily remove orderBy to avoid composite index requirement
  const announcementsQuery = query(
    collection(db, 'announcements'),
    where('isActive', '==', true),
    where('priority', '==', 'broadcast')
  );

  const snapshot = await getDocs(announcementsQuery);

  const announcements = snapshot.docs.map(doc => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
    expiresAt: doc.data().expiresAt?.toDate(),
  })) as Announcement[];

  // Sort in memory instead of using orderBy
  return announcements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getRegularAnnouncements = async (activeOnly: boolean = true): Promise<Announcement[]> => {
  let announcementsQuery;

  if (activeOnly) {
    announcementsQuery = query(
      collection(db, 'announcements'),
      where('isActive', '==', true),
      where('priority', 'in', ['normal', 'important', 'urgent']),
      orderBy('createdAt', 'desc')
    );
  } else {
    announcementsQuery = query(
      collection(db, 'announcements'),
      where('priority', 'in', ['normal', 'important', 'urgent']),
      orderBy('createdAt', 'desc')
    );
  }

  const snapshot = await getDocs(announcementsQuery);

  return snapshot.docs.map(doc => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
    expiresAt: doc.data().expiresAt?.toDate(),
  })) as Announcement[];
};

// Admin User Management
export const createAdminUser = async (adminUser: AdminUser): Promise<void> => {
  await setDoc(doc(db, 'admin_users', adminUser.uid), {
    ...adminUser,
    createdAt: Timestamp.fromDate(adminUser.createdAt),
    lastActivity: adminUser.lastActivity ? Timestamp.fromDate(adminUser.lastActivity) : null,
  });
};

export const getAdminUser = async (uid: string): Promise<AdminUser | null> => {
  const adminDoc = await getDoc(doc(db, 'admin_users', uid));
  if (!adminDoc.exists()) return null;

  const data = adminDoc.data();
  return {
    ...data,
    createdAt: data.createdAt.toDate(),
    lastActivity: data.lastActivity?.toDate(),
  } as AdminUser;
};

export const updateAdminUser = async (uid: string, updates: Partial<AdminUser>): Promise<void> => {
  const docRef = doc(db, 'admin_users', uid);
  const updateData: Record<string, unknown> = { ...updates };

  if (updates.createdAt) {
    updateData.createdAt = Timestamp.fromDate(updates.createdAt);
  }
  if (updates.lastActivity) {
    updateData.lastActivity = Timestamp.fromDate(updates.lastActivity);
  }

  await updateDoc(docRef, updateData);
};

export const promoteUserToAdmin = async (userId: string, promotedBy: string): Promise<void> => {
  const batch = writeBatch(db);

  // Update user role to admin
  const userRef = doc(db, 'users', userId);
  batch.update(userRef, { role: 'admin' });

  // Create admin user document
  const adminUser: AdminUser = {
    uid: userId,
    email: '', // Will be filled from user data
    displayName: '', // Will be filled from user data
    permissions: ['manage_tournaments', 'manage_users', 'manage_announcements', 'view_analytics', 'manage_points'],
    createdAt: new Date(),
    createdBy: promotedBy,
    isActive: true,
    lastActivity: new Date(),
  };

  const adminUserRef = doc(db, 'admin_users', userId);
  batch.set(adminUserRef, {
    ...adminUser,
    createdAt: Timestamp.fromDate(adminUser.createdAt),
    lastActivity: adminUser.lastActivity ? Timestamp.fromDate(adminUser.lastActivity) : null,
  });

  await batch.commit();
};

export const demoteAdminToUser = async (userId: string): Promise<void> => {
  const batch = writeBatch(db);

  // Update user role to member
  const userRef = doc(db, 'users', userId);
  batch.update(userRef, { role: 'member' });

  // Delete admin user document
  const adminUserRef = doc(db, 'admin_users', userId);
  batch.delete(adminUserRef);

  await batch.commit();
};

// Search Functions
export const searchUsers = async (searchTerm: string, limit_count: number = 10): Promise<SearchResult[]> => {
  const usersQuery = query(
    collection(db, 'users'),
    orderBy('displayName'),
    limit(limit_count)
  );

  const snapshot = await getDocs(usersQuery);

  return snapshot.docs
    .filter(doc =>
      doc.data().displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.data().email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(doc => ({
      id: doc.id,
      type: 'player' as const,
      title: doc.data().displayName,
      subtitle: doc.data().email,
      description: `${doc.data().points} points`,
      avatar: doc.data().avatar,
      metadata: {
        points: doc.data().points,
        role: doc.data().role,
      },
    }));
};

export const searchTournaments = async (searchTerm: string, limit_count: number = 10): Promise<SearchResult[]> => {
  const tournamentsQuery = query(
    collection(db, 'tournaments'),
    orderBy('name'),
    limit(limit_count)
  );

  const snapshot = await getDocs(tournamentsQuery);

  return snapshot.docs
    .filter(doc =>
      doc.data().name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.data().description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(doc => ({
      id: doc.id,
      type: 'tournament' as const,
      title: doc.data().name,
      subtitle: doc.data().game,
      description: doc.data().description,
      metadata: {
        status: doc.data().status,
        participants: doc.data().participants?.length || 0,
        maxParticipants: doc.data().maxParticipants,
        date: doc.data().date.toDate(),
      },
    }));
};

// Points Management
export const awardPoints = async (userId: string, points: number, reason: string, adminId: string): Promise<void> => {
  const batch = writeBatch(db);

  // Update user points
  const userRef = doc(db, 'users', userId);
  batch.update(userRef, {
    points: increment(points),
    weeklyPoints: increment(points),
    monthlyPoints: increment(points),
  });

  // Create points transaction record
  const transactionRef = doc(collection(db, 'points_transactions'));
  batch.set(transactionRef, {
    userId,
    amount: points,
    reason,
    adminId,
    timestamp: Timestamp.now(),
  });

  await batch.commit();
};

// ELO-based Points Management
export const awardEloBasedPoints = async (
  userId: string,
  points: number,
  eloChange: number,
  reason: string,
  adminId: string,
  tournamentId?: string,
  opponentId?: string,
  playerRankBefore?: number,
  opponentRankBefore?: number
): Promise<void> => {
  const batch = writeBatch(db);

  // Update user points and ELO rating
  const userRef = doc(db, 'users', userId);
  batch.update(userRef, {
    points: increment(points),
    weeklyPoints: increment(points),
    monthlyPoints: increment(points),
    eloRating: increment(eloChange),
  });

  // Create enhanced points transaction record
  const transactionRef = doc(collection(db, 'points_transactions'));
  batch.set(transactionRef, {
    userId,
    amount: points,
    reason,
    adminId,
    timestamp: Timestamp.now(),
    eloChange,
    opponentId,
    playerRankBefore,
    opponentRankBefore,
    isEloCalculated: true,
    tournamentId,
  });

  await batch.commit();
};

// User Dashboard Functions
export const getUserTournaments = async (userId: string): Promise<{
  id: string;
  name: string;
  date: Date;
  status: 'upcoming' | 'ongoing' | 'completed';
  position: number | null;
  points: number;
  game: GameType;
}[]> => {
  const registrationsQuery = query(
    collection(db, 'tournament_registrations'),
    where('userId', '==', userId),
    orderBy('registeredAt', 'desc')
  );
  const registrationsSnapshot = await getDocs(registrationsQuery);

  const tournaments = [];
  for (const regDoc of registrationsSnapshot.docs) {
    const regData = regDoc.data();
    const tournament = await getTournament(regData.tournamentId);
    if (tournament) {
      tournaments.push({
        id: tournament.id,
        name: tournament.name,
        date: tournament.date,
        status: tournament.status,
        position: tournament.winner === userId ? 1 :
                 tournament.runnerUp === userId ? 2 :
                 tournament.thirdPlace === userId ? 3 : null,
        points: tournament.winner === userId ? tournament.pointsAwarded.first :
                tournament.runnerUp === userId ? tournament.pointsAwarded.second :
                tournament.thirdPlace === userId ? tournament.pointsAwarded.third :
                tournament.pointsAwarded.participation,
        game: tournament.game,
      });
    }
  }

  return tournaments;
};

export const getUserRecentActivity = async (userId: string): Promise<{
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  points: number;
}[]> => {
  const transactionsQuery = query(
    collection(db, 'points_transactions'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(10)
  );
  const snapshot = await getDocs(transactionsQuery);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      type: data.reason.includes('tournament') ? 'tournament_win' :
            data.reason.includes('achievement') ? 'achievement' : 'registration',
      title: data.reason,
      description: `Earned ${data.amount} points`,
      timestamp: data.timestamp.toDate(),
      points: data.amount,
    };
  });
};

export const getUserAchievements = async (userId: string): Promise<{
  name: string;
  description: string;
  earned: boolean;
}[]> => {
  const user = await getUser(userId);
  if (!user) return [];

  // Define available achievements
  const availableAchievements = [
    { name: 'First Win', description: 'Win your first tournament', earned: user.points >= 50 },
    { name: 'Consistent Player', description: 'Participate in 5 tournaments', earned: (user.points / 20) >= 5 },
    { name: 'Top Performer', description: 'Finish in top 3', earned: user.points >= 100 },
    { name: 'Champion', description: 'Win 10 tournaments', earned: user.points >= 500 },
    { name: 'Legend', description: 'Reach 1000 points', earned: user.points >= 1000 },
  ];

  return availableAchievements;
};

// ELO Rating System Functions
export const updateUserEloRating = async (userId: string, newRating: number): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    eloRating: newRating,
  });
};

export const updateGameStatsElo = async (
  userId: string,
  gameType: GameType,
  newRating: number,
  eloHistoryEntry: EloHistoryEntry
): Promise<void> => {
  const statsRef = doc(db, 'user_stats', userId);
  const statsDoc = await getDoc(statsRef);

  if (statsDoc.exists()) {
    const currentStats = statsDoc.data();
    const gameStats = currentStats.gameStats || {};
    const currentGameStats = gameStats[gameType] || {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      averagePosition: 0,
      bestPosition: 999,
      pointsEarned: 0,
      tournamentsWon: 0,
      eloRating: 1200,
      eloHistory: [],
    };

    // Update ELO rating and history
    currentGameStats.eloRating = newRating;
    currentGameStats.eloHistory = [...(currentGameStats.eloHistory || []), eloHistoryEntry];

    // Keep only last 50 ELO history entries to prevent document size issues
    if (currentGameStats.eloHistory.length > 50) {
      currentGameStats.eloHistory = currentGameStats.eloHistory.slice(-50);
    }

    gameStats[gameType] = currentGameStats;

    await updateDoc(statsRef, {
      [`gameStats.${gameType}`]: currentGameStats,
      lastUpdated: Timestamp.now(),
    });
  }
};

export const getEloLeaderboard = async (gameType?: GameType): Promise<LeaderboardEntry[]> => {
  let usersQuery;

  if (gameType) {
    // For game-specific leaderboards, we need to query user_stats
    const statsQuery = query(
      collection(db, 'user_stats'),
      orderBy(`gameStats.${gameType}.eloRating`, 'desc'),
      limit(100)
    );

    const statsSnapshot = await getDocs(statsQuery);
    const leaderboard: LeaderboardEntry[] = [];

    for (const statDoc of statsSnapshot.docs) {
      const statData = statDoc.data();
      const gameStats = statData.gameStats?.[gameType];

      if (gameStats && gameStats.eloRating) {
        const userDoc = await getDoc(doc(db, 'users', statDoc.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          leaderboard.push({
            uid: statDoc.id,
            displayName: userData.displayName,
            avatar: userData.avatar,
            points: userData.points,
            weeklyPoints: userData.weeklyPoints,
            monthlyPoints: userData.monthlyPoints,
            rank: 0, // Will be set after sorting
            eloRating: gameStats.eloRating,
          });
        }
      }
    }

    // Sort by ELO rating and assign ranks
    leaderboard.sort((a, b) => (b.eloRating || 0) - (a.eloRating || 0));
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard;
  } else {
    // For overall leaderboard, use user ELO ratings
    usersQuery = query(
      collection(db, 'users'),
      orderBy('eloRating', 'desc'),
      limit(100)
    );

    const snapshot = await getDocs(usersQuery);

    return snapshot.docs.map((doc, index) => ({
      uid: doc.id,
      displayName: doc.data().displayName,
      avatar: doc.data().avatar,
      points: doc.data().points,
      weeklyPoints: doc.data().weeklyPoints,
      monthlyPoints: doc.data().monthlyPoints,
      rank: index + 1,
      eloRating: doc.data().eloRating || 1200,
    })) as LeaderboardEntry[];
  }
};

// Tournament ELO Processing
export const processTournamentWithElo = async (
  tournamentId: string,
  results: Array<{
    playerId: string;
    position: number;
    opponentResults?: Array<{
      opponentId: string;
      result: 'win' | 'loss' | 'draw';
    }>;
  }>
): Promise<void> => {
  const tournament = await getTournament(tournamentId);
  if (!tournament) {
    throw new Error('Tournament not found');
  }

  const batch = writeBatch(db);

  // Get all participant data
  const participantData = new Map();
  for (const result of results) {
    const user = await getUser(result.playerId);
    const userStats = await getUserStats(result.playerId);

    if (user && userStats) {
      const gameStats = userStats.gameStats[tournament.game] || {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        averagePosition: 0,
        bestPosition: 999,
        pointsEarned: 0,
        tournamentsWon: 0,
        eloRating: user.eloRating || 1200,
        eloHistory: [],
      };

      participantData.set(result.playerId, {
        user,
        userStats,
        gameStats,
        currentRating: gameStats.eloRating,
        gamesPlayed: gameStats.gamesPlayed,
      });
    }
  }

  // Process ELO changes for each participant
  for (const result of results) {
    const participant = participantData.get(result.playerId);
    if (!participant || !result.opponentResults) continue;

    let totalEloChange = 0;
    let totalBonusPoints = 0;
    let currentRating = participant.currentRating;

    // Process each match result
    for (const opponentResult of result.opponentResults) {
      const opponent = participantData.get(opponentResult.opponentId);
      if (!opponent) continue;

      // Import ELO calculation functions
      const { calculateEloChange, createEloHistoryEntry } = await import('./eloSystem');

      const eloResult = calculateEloChange(
        {
          playerRating: currentRating,
          opponentRating: opponent.currentRating,
          playerResult: opponentResult.result,
        },
        participant.gamesPlayed,
        opponent.gamesPlayed
      );

      totalEloChange += eloResult.playerRatingChange;
      totalBonusPoints += eloResult.pointsAwarded;
      currentRating = eloResult.newPlayerRating;

      // Create ELO history entry
      const historyEntry = createEloHistoryEntry(
        currentRating,
        eloResult.playerRatingChange,
        opponentResult.opponentId,
        opponent.currentRating,
        tournamentId,
        opponentResult.result
      );

      // Update game stats with new ELO data
      await updateGameStatsElo(
        result.playerId,
        tournament.game,
        currentRating,
        historyEntry
      );
    }

    // Award ELO-based points
    const adminId = tournament.createdBy;
    const reason = `Tournament ${tournament.name} - Position ${result.position} (ELO-based)`;

    await awardEloBasedPoints(
      result.playerId,
      totalBonusPoints,
      totalEloChange,
      reason,
      adminId,
      tournamentId,
      undefined, // No single opponent for tournament
      participantData.get(result.playerId)?.currentRating,
      undefined
    );

    // Update user's overall ELO rating
    await updateUserEloRating(result.playerId, currentRating);
  }

  // Update tournament status
  const tournamentRef = doc(db, 'tournaments', tournamentId);
  batch.update(tournamentRef, {
    status: 'completed',
    completedAt: Timestamp.now(),
  });

  await batch.commit();
};

export const getAdminOverviewStats = async (): Promise<{
  totalUsers: number;
  activeUsers: number;
  totalTournaments: number;
  upcomingTournaments: number;
  totalAnnouncements: number;
  unreadAnnouncements: number;
}> => {
  const usersQuery = query(collection(db, 'users'));
  const tournamentsQuery = query(collection(db, 'tournaments'));
  const announcementsQuery = query(collection(db, 'announcements'), where('isActive', '==', true));

  const [usersSnapshot, tournamentsSnapshot, announcementsSnapshot] = await Promise.all([
    getDocs(usersQuery),
    getDocs(tournamentsQuery),
    getDocs(announcementsQuery)
  ]);

  const totalUsers = usersSnapshot.size;
  const activeUsers = usersSnapshot.docs.filter(doc => doc.data().isActive).length;
  const totalTournaments = tournamentsSnapshot.size;
  const upcomingTournaments = tournamentsSnapshot.docs.filter(doc => doc.data().status === 'upcoming').length;
  const totalAnnouncements = announcementsSnapshot.size;
  const unreadAnnouncements = announcementsSnapshot.docs.filter(doc =>
    !doc.data().readBy || doc.data().readBy.length === 0
  ).length;

  return {
    totalUsers,
    activeUsers,
    totalTournaments,
    upcomingTournaments,
    totalAnnouncements,
    unreadAnnouncements,
  };
};

// Utility Functions
export const resetWeeklyPoints = async (): Promise<void> => {
  const usersQuery = query(collection(db, 'users'));
  const snapshot = await getDocs(usersQuery);

  const batch = writeBatch(db);

  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { weeklyPoints: 0 });
  });

  await batch.commit();
};

export const resetMonthlyPoints = async (): Promise<void> => {
  const usersQuery = query(collection(db, 'users'));
  const snapshot = await getDocs(usersQuery);

  const batch = writeBatch(db);

  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { monthlyPoints: 0 });
  });

  await batch.commit();
};

// Game Genre Management
export const createGameGenre = async (genre: Omit<GameGenre, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const genreRef = doc(collection(db, 'game_genres'));
  const genreData = {
    ...genre,
    id: genreRef.id,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(genreRef, genreData);
  return genreRef.id;
};

export const getGameGenres = async (activeOnly: boolean = false): Promise<GameGenre[]> => {
  let genresQuery;

  if (activeOnly) {
    genresQuery = query(
      collection(db, 'game_genres'),
      where('isActive', '==', true),
      orderBy('displayOrder')
    );
  } else {
    // For all genres, just get all documents and sort on client side
    genresQuery = query(collection(db, 'game_genres'));
  }

  const snapshot = await getDocs(genresQuery);

  const genres = snapshot.docs.map(doc => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
  })) as GameGenre[];

  // Sort on client side if not using server-side ordering
  if (!activeOnly) {
    genres.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  return genres;
};

export const getGameGenre = async (id: string): Promise<GameGenre | null> => {
  const genreDoc = await getDoc(doc(db, 'game_genres', id));
  if (!genreDoc.exists()) return null;

  const data = genreDoc.data();
  return {
    ...data,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  } as GameGenre;
};

export const updateGameGenre = async (id: string, updates: Partial<Omit<GameGenre, 'id' | 'createdAt'>>): Promise<void> => {
  const docRef = doc(db, 'game_genres', id);
  const updateData: Record<string, unknown> = {
    ...updates,
    updatedAt: Timestamp.now()
  };

  await updateDoc(docRef, updateData);
};

export const deleteGameGenre = async (id: string): Promise<void> => {
  // Instead of deleting, we deactivate to preserve tournament history
  await updateGameGenre(id, { isActive: false });
};

export const reorderGameGenres = async (genreIds: string[]): Promise<void> => {
  const batch = writeBatch(db);

  genreIds.forEach((id, index) => {
    const genreRef = doc(db, 'game_genres', id);
    batch.update(genreRef, {
      displayOrder: index + 1,
      updatedAt: Timestamp.now()
    });
  });

  await batch.commit();
};

// Bracket Management Functions
export const createTournamentBracket = async (
  tournamentId: string,
  format: 'single_elimination' | 'double_elimination' | 'round_robin',
  participants: string[]
): Promise<TournamentBracket> => {
  const options: BracketGenerationOptions = {
    format,
    participants,
    tournamentId,
    randomizeSeeding: false,
    seedByElo: true,
  };

  let matches: BracketMatch[] = [];

  switch (format) {
    case 'single_elimination':
      matches = BracketGenerator.generateSingleElimination(options);
      break;
    case 'double_elimination':
      matches = BracketGenerator.generateDoubleElimination(options);
      break;
    case 'round_robin':
      // For round robin, we'll convert to BracketMatch format
      const rrMatches = BracketGenerator.generateRoundRobin(options);
      matches = rrMatches.map(rrMatch => ({
        id: rrMatch.id,
        tournamentId: rrMatch.tournamentId,
        round: rrMatch.round,
        matchNumber: parseInt(rrMatch.id.split('_').pop() || '0'),
        bracket: 'winners' as const,
        player1Id: rrMatch.player1Id,
        player2Id: rrMatch.player2Id,
        player1Name: rrMatch.player1Name,
        player2Name: rrMatch.player2Name,
        winnerId: rrMatch.winnerId,
        score: rrMatch.score,
        status: rrMatch.status,
        scheduledTime: rrMatch.scheduledTime,
        location: rrMatch.location,
        createdAt: rrMatch.createdAt,
        completedAt: rrMatch.completedAt,
      }));
      break;
  }

  const bracket: TournamentBracket = {
    id: `bracket_${tournamentId}`,
    tournamentId,
    format,
    matches,
    winnersMatches: matches.filter(m => m.bracket === 'winners'),
    losersMatches: format === 'double_elimination' ? matches.filter(m => m.bracket === 'losers') : undefined,
    grandFinalMatch: format === 'double_elimination' ? matches.find(m => m.bracket === 'grand_final') : undefined,
    totalRounds: Math.max(...matches.map(m => m.round)),
    currentRound: 1,
    isComplete: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Save bracket to Firestore
  await setDoc(doc(db, 'tournament_brackets', bracket.id), {
    ...bracket,
    createdAt: Timestamp.fromDate(bracket.createdAt),
    updatedAt: Timestamp.fromDate(bracket.updatedAt),
    matches: bracket.matches.map(match => ({
      ...match,
      createdAt: Timestamp.fromDate(match.createdAt),
      completedAt: match.completedAt ? Timestamp.fromDate(match.completedAt) : null,
      scheduledTime: match.scheduledTime ? Timestamp.fromDate(match.scheduledTime) : null,
    })),
  });

  return bracket;
};

export const getTournamentBracket = async (tournamentId: string): Promise<TournamentBracket | null> => {
  const bracketDoc = await getDoc(doc(db, 'tournament_brackets', `bracket_${tournamentId}`));

  if (!bracketDoc.exists()) return null;

  const data = bracketDoc.data();
  return {
    ...data,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    matches: data.matches.map((match: Record<string, unknown>) => ({
      ...match,
      createdAt: (match.createdAt as Timestamp).toDate(),
      completedAt: match.completedAt ? (match.completedAt as Timestamp).toDate() : undefined,
      scheduledTime: match.scheduledTime ? (match.scheduledTime as Timestamp).toDate() : undefined,
    })),
  } as TournamentBracket;
};

export const updateMatchResult = async (
  matchId: string,
  winnerId: string,
  score?: { player1: number; player2: number }
): Promise<void> => {
  const batch = writeBatch(db);

  // Find the bracket containing this match
  const bracketsQuery = query(
    collection(db, 'tournament_brackets'),
    where('matches', 'array-contains-any', [{ id: matchId }])
  );

  const bracketsSnapshot = await getDocs(bracketsQuery);

  if (bracketsSnapshot.empty) {
    throw new Error('Match not found in any bracket');
  }

  const bracketDoc = bracketsSnapshot.docs[0];
  const bracketData = bracketDoc.data() as TournamentBracket & { matches: BracketMatch[] };

  // Update the specific match
  const updatedMatches = bracketData.matches.map(match => {
    if (match.id === matchId) {
      const loserId = match.player1Id === winnerId ? match.player2Id : match.player1Id;
      return {
        ...match,
        winnerId,
        loserId,
        score,
        status: 'completed' as const,
        completedAt: new Date(),
      };
    }
    return match;
  });

  // Update bracket document
  batch.update(bracketDoc.ref, {
    matches: updatedMatches.map(match => ({
      ...match,
      createdAt: Timestamp.fromDate(match.createdAt),
      completedAt: match.completedAt ? Timestamp.fromDate(match.completedAt) : null,
      scheduledTime: match.scheduledTime ? Timestamp.fromDate(match.scheduledTime) : null,
    })),
    updatedAt: Timestamp.now(),
  });

  // Advance winners to next matches (simplified logic)
  await advanceWinnerToNextMatch(updatedMatches, matchId, winnerId, batch);

  await batch.commit();
};

const advanceWinnerToNextMatch = async (
  matches: BracketMatch[],
  completedMatchId: string,
  winnerId: string,
  _batch: WriteBatch
): Promise<void> => {
  const completedMatch = matches.find(m => m.id === completedMatchId);
  if (!completedMatch || !completedMatch.nextMatchId) return;

  const nextMatch = matches.find(m => m.id === completedMatch.nextMatchId);
  if (!nextMatch) return;

  // Determine which player slot to fill in the next match
  const isFirstMatch = completedMatch.matchNumber % 2 === 1;

  // Update the next match in the batch
  // This would require finding the bracket document and updating it
  // For now, this is a simplified implementation
  console.log(`Advancing winner ${winnerId} to match ${nextMatch.id} as ${isFirstMatch ? 'player1' : 'player2'}`);
};
