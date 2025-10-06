// User role types
export type UserRole =
  | 'president'        // Highest authority - can edit all roles and settings
  | 'co_president'     // Second highest - can edit all roles and settings
  | 'head_admin'       // Can edit admin roles and below, manage shop settings
  | 'admin'            // Can approve points, manage orders
  | 'officer'          // Can approve volunteer points
  | 'event_organizer'  // Can create/manage events
  | 'vice_president'   // Legacy role
  | 'treasurer'        // Legacy role
  | 'member'           // Regular user
  | 'guest'            // Guest user
  | string;            // Allow dynamic game genre officer roles like "mario_kart_officer"

export interface User {
  uid: string;
  email: string;
  displayName: string;
  avatar?: string;
  avatarUrl?: string;              // New: Profile avatar URL
  bio?: string;                    // New: User bio/description
  role: 'admin' | 'member' | 'guest'; // Primary role for backward compatibility
  roles: UserRole[]; // New: Array of roles for multi-role support
  points: number;
  weeklyPoints: number;
  monthlyPoints: number;
  eloRating: number; // New: ELO rating for competitive ranking
  joinDate: Date;
  achievements?: string[];         // Legacy: kept for backward compatibility
  achievementsList?: Achievement[]; // New: Full achievement objects
  stickersList?: Sticker[];        // New: User's sticker collection
  isActive: boolean;
  lastLoginDate?: Date;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    favoriteGames: GameType[];
  };
  // Shop & Points System fields
  pointsBalance?: number;          // Current available points for redemption
  pointsEarned?: number;           // Total points earned all-time
  pointsSpent?: number;            // Total points spent all-time
  pointsExpired?: number;          // Total points that have expired
  lastMonthlyReset?: Date;         // Last time monthly cap was reset
  monthlyPointsEarned?: number;    // Points earned this month (for cap tracking)
  campusEmail?: string;            // Verified .edu email for eligibility
  isEmailVerified?: boolean;       // Email verification status
  // Profile & Social fields
  privacySettings?: ProfilePrivacySettings; // New: Privacy controls
  socialMediaAccounts?: SocialMediaLink[];  // New: Linked social accounts
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
  latestPointsReason?: string; // Latest reason for points awarded
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

// ============================================================================
// SHOP & POINTS SYSTEM TYPES
// ============================================================================

// Shop Product
export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number;                    // Price in USD cents (e.g., 2500 = $25.00)
  images: string[];                 // Array of image URLs
  category: ProductCategory;
  pointsEligible: boolean;          // Can points be used for discount?
  stock: number;                    // Available quantity (-1 = unlimited)
  isActive: boolean;                // Is product visible in shop?
  printfulId?: string;              // Printful product ID for POD integration
  printifyId?: string;              // Printify product ID for POD integration
  variants?: ProductVariant[];      // Size, color, etc.
  tags?: string[];                  // For filtering/search
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;                // Admin UID
}

export type ProductCategory =
  | 'apparel'
  | 'accessories'
  | 'stickers'
  | 'posters'
  | 'digital'
  | 'other';

export interface ProductVariant {
  id: string;
  name: string;                     // e.g., "Size", "Color"
  options: string[];                // e.g., ["S", "M", "L", "XL"]
  priceModifier?: number;           // Additional cost in cents
}

// Shop Order
export interface ShopOrder {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  items: OrderItem[];
  subtotal: number;                 // Total before discounts (cents)
  pointsDiscount: number;           // Discount from points (cents)
  pointsUsed: number;               // Number of points redeemed
  shipping: number;                 // Shipping cost (cents)
  tax: number;                      // Tax amount (cents)
  total: number;                    // Final total paid (cents)
  fulfillmentType: 'campus_pickup' | 'shipping';
  shippingAddress?: ShippingAddress;
  status: OrderStatus;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  printfulOrderId?: string;         // POD order ID
  printifyOrderId?: string;         // POD order ID
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type OrderStatus =
  | 'pending'           // Payment pending
  | 'paid'              // Payment successful
  | 'processing'        // Being fulfilled
  | 'ready_pickup'      // Ready for campus pickup
  | 'shipped'           // Shipped to customer
  | 'completed'         // Order complete
  | 'cancelled'         // Order cancelled
  | 'refunded';         // Order refunded

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;                    // Price per item (cents)
  variant?: string;                 // Selected variant (e.g., "Size: L")
  pointsEligible: boolean;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// Points Settings (configurable by President/Co-President/Head Admin)
export interface PointsSettings {
  id: string;
  conversionRate: number;           // Points per $1 (default: 1000)
  perItemDiscountCap: number;       // Max discount % per item (default: 50)
  perOrderDiscountCap: number;      // Max discount $ per order in cents (default: 3000 = $30)
  monthlyEarningCap: number;        // Max points per month (default: 10000)
  expirationMonths: number;         // Points expire after X months (default: 12)
  earningValues: {
    eventAttendance: number;        // Points for QR check-in (default: 100)
    volunteerWork: number;          // Points for volunteering (default: 250)
    eventHosting: number;           // Points for hosting event (default: 500)
    contributionMin: number;        // Min contribution points (default: 50)
    contributionMax: number;        // Max contribution points (default: 150)
  };
  approvedEmailDomains: string[];   // e.g., [".edu", "belhaven.edu"]
  approvedEmails: string[];         // Manually approved emails
  updatedAt: Date;
  updatedBy: string;                // Admin UID
}

// Points Transaction (enhanced from existing)
export interface PointsTransactionEnhanced extends PointsTransaction {
  expirationDate?: Date;            // When these points expire
  multiplierApplied?: number;       // Sponsor multiplier (e.g., 1.5, 2.0)
  multiplierCampaignId?: string;    // Which campaign applied the multiplier
  approvalStatus: 'pending' | 'approved' | 'denied';
  approvedBy?: string;              // Admin UID who approved
  approvedAt?: Date;
  deniedReason?: string;
  category: PointsCategory;
}

export type PointsCategory =
  | 'event_attendance'
  | 'volunteer_work'
  | 'event_hosting'
  | 'contribution'
  | 'purchase'              // Points spent on shop purchase
  | 'expired'               // Points that expired
  | 'adjustment';           // Manual admin adjustment

// Points Multiplier Campaign
export interface PointsMultiplier {
  id: string;
  name: string;                     // e.g., "Double Points Weekend"
  description: string;
  multiplier: number;               // e.g., 1.5, 2.0
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  applicableCategories: PointsCategory[]; // Which earning types get multiplier
  createdAt: Date;
  createdBy: string;                // Admin UID
}

// Campus Pickup Queue Item
export interface PickupQueueItem {
  id: string;
  orderId: string;
  userId: string;
  userDisplayName: string;
  userEmail: string;
  items: OrderItem[];
  status: 'pending' | 'ready' | 'completed';
  notifiedAt?: Date;                // When user was notified order is ready
  pickedUpAt?: Date;
  pickedUpBy?: string;              // Admin UID who marked as picked up
  notes?: string;
  createdAt: Date;
}

// ============================================================================
// PROFILE, MESSAGING & SOCIAL TYPES
// ============================================================================

// Achievement System
export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  category: 'tournament' | 'points' | 'participation' | 'special' | 'social';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  progress?: number;                // For progressive achievements (0-100)
  maxProgress?: number;             // Max value for progress
}

// Sticker/Badge System
export interface Sticker {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  category: 'event' | 'tournament' | 'seasonal' | 'special' | 'purchased';
  obtainedAt: Date;
  isDisplayed: boolean;             // Whether user chose to display it
  displayOrder?: number;            // Order on profile
}

// Social Media Platform Types
export type SocialPlatform = 'discord' | 'twitch' | 'youtube' | 'twitter' | 'instagram' | 'tiktok';

// Social Media Account Link
export interface SocialMediaLink {
  platform: SocialPlatform;
  username: string;
  url: string;
  isPublic: boolean;                // Privacy toggle per platform
  verifiedAt?: Date;                // Optional verification timestamp
}

// Profile Privacy Settings
export interface ProfilePrivacySettings {
  showEmail: boolean;
  showRoles: boolean;
  showAchievements: boolean;
  showStickers: boolean;
  showPoints: boolean;
  showEloRating: boolean;
  showJoinDate: boolean;
  showSocialMedia: boolean;         // Global social media toggle
  allowDirectMessages: boolean;
}

// Extended User Profile (for profile pages)
export interface UserProfile extends User {
  bio?: string;
  avatarUrl?: string;
  achievements: Achievement[];
  stickers: Sticker[];
  privacySettings: ProfilePrivacySettings;
  socialMediaAccounts: SocialMediaLink[];
}

// Direct Messaging Types
export interface Conversation {
  id: string;
  participants: string[];           // Array of user UIDs (always 2 for DM)
  participantNames: Record<string, string>; // UID -> displayName mapping
  participantAvatars: Record<string, string>; // UID -> avatarUrl mapping
  lastMessage?: string;
  lastMessageAt?: Date;
  lastMessageBy?: string;           // UID of last sender
  unreadCount: Record<string, number>; // UID -> unread count mapping
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  readAt?: Date;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
}

// Message Notification
export interface MessageNotification {
  id: string;
  userId: string;                   // Recipient
  senderId: string;
  senderName: string;
  conversationId: string;
  messagePreview: string;
  isRead: boolean;
  createdAt: Date;
}

// Tournament Communication
export interface TournamentMessage {
  id: string;
  tournamentId: string;
  userId: string;
  userDisplayName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedBy?: string;               // Admin UID if deleted by admin
}

// Social Media Feed Types
export type SocialFeedPlatform = 'youtube' | 'twitch' | 'tiktok' | 'instagram';

export interface SocialPost {
  id: string;
  platform: SocialFeedPlatform;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  url: string;
  author: string;
  publishedAt: Date;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  embedHtml?: string;               // For embedded content
}
