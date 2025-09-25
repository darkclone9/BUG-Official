export interface User {
  uid: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: 'admin' | 'member' | 'guest';
  points: number;
  weeklyPoints: number;
  monthlyPoints: number;
  joinDate: Date;
  achievements?: string[];
  isActive: boolean;
  lastLoginDate?: Date;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    favoriteGames: GameType[];
  };
}

export type GameType = 'mario_kart' | 'super_smash_bros' | 'general';

export interface Tournament {
  id: string;
  name: string;
  description: string;
  game: GameType;
  date: Date;
  registrationDeadline: Date;
  maxParticipants: number;
  participants: string[]; // User UIDs
  brackets?: BracketMatch[];
  rules: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  pointsAwarded: {
    first: number;
    second: number;
    third: number;
    participation: number;
  };
  createdAt: Date;
  createdBy: string; // Admin UID
  winner?: string; // User UID
  runnerUp?: string; // User UID
  thirdPlace?: string; // User UID
  format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  entryFee?: number;
  prizePool?: number;
}

export interface BracketMatch {
  id: string;
  round: number;
  matchNumber: number;
  player1: string | null; // User UID or null for bye
  player2: string | null; // User UID or null for bye
  winner: string | null; // User UID
  isCompleted: boolean;
  nextMatchId?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'tournament' | 'meeting' | 'social' | 'other';
  pointsAwarded: number;
  maxAttendees?: number;
  attendees: string[]; // User UIDs
  createdBy: string; // Admin UID
  createdAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string; // User UID
  authorName: string;
  createdAt: Date;
  updatedAt?: Date;
  isActive: boolean;
  priority: 'normal' | 'important' | 'urgent';
  expiresAt?: Date;
  targetAudience: 'all' | 'members' | 'admins';
  readBy: string[]; // User UIDs who have read the announcement
}

export interface Message {
  id: string;
  tournamentId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  isModerated: boolean;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  avatar?: string;
  points: number;
  weeklyPoints: number;
  monthlyPoints: number;
  rank: number;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  tournamentId?: string;
  eventId?: string;
  adminId: string; // Who awarded/deducted points
  timestamp: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsRequired: number;
  category: 'tournament' | 'participation' | 'social' | 'special';
  game?: GameType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// New interfaces for enhanced functionality
export interface UserStats {
  uid: string;
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  gameStats: {
    [key in GameType]?: GameStats;
  };
  lastUpdated: Date;
}

export interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  averagePosition: number;
  bestPosition: number;
  pointsEarned: number;
  tournamentsWon: number;
  currentRank?: number;
  peakRank?: number;
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  registeredAt: Date;
  status: 'registered' | 'confirmed' | 'cancelled' | 'no_show';
  teamName?: string;
  teammates?: string[]; // For team tournaments
  notes?: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  permissions: AdminPermission[];
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
  lastActivity?: Date;
}

export type AdminPermission =
  | 'manage_tournaments'
  | 'manage_users'
  | 'manage_announcements'
  | 'view_analytics'
  | 'manage_points'
  | 'super_admin';

export interface SearchResult {
  id: string;
  type: 'player' | 'tournament' | 'game';
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: string;
  metadata?: Record<string, any>;
}

export interface NotificationBadge {
  unreadAnnouncements: number;
  upcomingTournaments: number;
  pendingRegistrations: number;
}