// User role types
export type UserRole =
  | 'admin'
  | 'member'
  | 'guest'
  | 'event_organizer'
  | 'officer'
  | 'president'
  | 'vice_president'
  | 'treasurer'
  | string; // Allow dynamic game genre officer roles like "mario_kart_officer"

export interface User {
  uid: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: 'admin' | 'member' | 'guest'; // Primary role for backward compatibility
  roles: UserRole[]; // New: Array of roles for multi-role support
  points: number;
  weeklyPoints: number;
  monthlyPoints: number;
  eloRating: number; // New: ELO rating for competitive ranking
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

// Legacy GameType for backward compatibility
export type GameType = 'mario_kart' | 'super_smash_bros' | 'general' | string;

// New GameGenre interface for dynamic game management
export interface GameGenre {
  id: string;
  name: string;
  description: string;
  displayName: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin UID
  iconUrl?: string;
  color?: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  game: GameType;
  gameGenreId?: string; // New field for dynamic game genres
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
  priority: 'normal' | 'important' | 'urgent' | 'broadcast';
  expiresAt?: Date;
  targetAudience: 'all' | 'members' | 'admins';
  readBy: string[]; // User UIDs who have read the announcement
  dismissedBy?: string[]; // User UIDs who have dismissed the announcement (for broadcast)
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
  eloRating?: number; // New: ELO rating for competitive ranking
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
  eloChange?: number; // New: ELO rating change for this transaction
  opponentId?: string; // New: Opponent's ID for ELO calculations
  playerRankBefore?: number; // New: Player's rank before the match
  opponentRankBefore?: number; // New: Opponent's rank before the match
  isEloCalculated?: boolean; // New: Whether this transaction used ELO calculations
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
  eloRating: number; // New: ELO rating for this specific game
  eloHistory: EloHistoryEntry[]; // New: Track ELO changes over time
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
  metadata?: Record<string, unknown>;
}

export interface NotificationBadge {
  unreadAnnouncements: number;
  upcomingTournaments: number;
  pendingRegistrations: number;
}

// New ELO-specific interfaces
export interface EloHistoryEntry {
  date: Date;
  rating: number;
  change: number;
  opponentId: string;
  opponentRating: number;
  tournamentId: string;
  result: 'win' | 'loss' | 'draw';
}

export interface EloCalculationParams {
  playerRating: number;
  opponentRating: number;
  playerResult: 'win' | 'loss' | 'draw'; // 1 for win, 0 for loss, 0.5 for draw
  kFactor?: number; // K-factor for ELO calculation (default: 32)
}

export interface EloCalculationResult {
  newPlayerRating: number;
  newOpponentRating: number;
  playerRatingChange: number;
  opponentRatingChange: number;
  pointsAwarded: number; // Bonus points based on ELO difference
}

export interface TournamentResult {
  tournamentId: string;
  playerId: string;
  position: number;
  opponentResults: {
    opponentId: string;
    result: 'win' | 'loss' | 'draw';
  }[];
}

// Event Management Types
export type EventType =
  | 'tournament'
  | 'social_gathering'
  | 'workshop'
  | 'meeting'
  | 'stream'
  | 'competition'
  | 'other';

export type EventStatus =
  | 'draft'
  | 'published'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

export type LocationType = 'physical' | 'virtual' | 'hybrid';

export interface ClubEvent {
  id: string;
  name: string;
  description: string;
  eventType: EventType;
  date: Date;
  endDate?: Date;
  location: string;
  locationType: LocationType;
  virtualLink?: string; // For online events
  maxParticipants?: number;
  currentParticipants: number;
  registrationDeadline?: Date;
  status: EventStatus;
  game?: GameType; // Associated game if applicable
  gameGenreId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin UID
  imageUrl?: string;
  tags?: string[];
  customFields?: Record<string, unknown>; // For event-specific details
  requiresRegistration: boolean;
  registrationFee?: number;
  notes?: string; // Internal admin notes
}

export interface ClubEventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  registeredAt: Date;
  status: 'registered' | 'confirmed' | 'cancelled' | 'attended' | 'no_show';
  notes?: string;
  customResponses?: Record<string, unknown>; // For custom registration fields
}

export interface ClubEventNotification {
  id: string;
  eventId: string;
  eventName: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  message: string;
  sentAt: Date;
  sentBy: string; // Admin UID who sent the notification
  status: 'sent' | 'failed' | 'pending';
  errorMessage?: string;
  templateType?: 'event_created' | 'event_updated' | 'event_cancelled' | 'reminder' | 'custom';
}
