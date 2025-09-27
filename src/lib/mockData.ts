// Mock data for development and testing
export const mockUser = {
  uid: 'mock-user-123',
  displayName: 'John Gamer',
  email: 'john@example.com',
  avatar: '/avatars/default.png',
  role: 'member' as 'admin' | 'member' | 'guest',
  points: 1250,
  joinDate: '2024-01-15',
};

export const mockTournaments = [
  {
    id: 'tournament-1',
    name: 'Spring Mario Kart Championship',
    game: 'mario_kart' as const,
    date: '2024-03-15',
    status: 'completed' as const,
    position: 2,
    points: 150,
  },
  {
    id: 'tournament-2',
    name: 'Smash Bros Weekly',
    game: 'super_smash_bros' as const,
    date: '2024-03-22',
    status: 'upcoming' as const,
    points: 0,
  },
  {
    id: 'tournament-3',
    name: 'Winter Mario Kart Cup',
    game: 'mario_kart' as const,
    date: '2024-02-10',
    status: 'completed' as const,
    position: 1,
    points: 200,
  },
];

export const mockAnnouncements = [
  {
    id: 'announcement-1',
    title: 'New Tournament Registration Open!',
    content: 'Sign up for the upcoming Spring Championship. Registration closes March 1st.',
    priority: 'important' as const,
    createdAt: '2024-02-20',
    readBy: [] as string[],
  },
  {
    id: 'announcement-2',
    title: 'Server Maintenance',
    content: 'The gaming servers will be down for maintenance on Sunday from 2-4 AM.',
    priority: 'normal' as const,
    createdAt: '2024-02-18',
    readBy: ['mock-user-123'],
  },
  {
    id: 'announcement-3',
    title: 'Emergency: Tournament Postponed',
    content: 'Due to technical issues, tonight\'s tournament has been postponed to tomorrow.',
    priority: 'urgent' as const,
    createdAt: '2024-02-25',
    readBy: [] as string[],
  },
];

export const mockRecentActivity = [
  {
    id: 'activity-1',
    type: 'tournament_win',
    title: 'Won Winter Mario Kart Cup',
    description: 'Placed 1st in the Winter Mario Kart Cup tournament',
    timestamp: new Date('2024-02-10'),
    points: 200,
  },
  {
    id: 'activity-2',
    type: 'achievement',
    title: 'Speed Demon Achievement',
    description: 'Unlocked for winning 3 Mario Kart races in a row',
    timestamp: new Date('2024-02-08'),
    points: 50,
  },
  {
    id: 'activity-3',
    type: 'registration',
    title: 'Registered for Spring Championship',
    description: 'Successfully registered for the upcoming Spring Mario Kart Championship',
    timestamp: new Date('2024-02-15'),
    points: 0,
  },
];

export const mockAchievements = [
  {
    name: 'First Victory',
    description: 'Win your first tournament',
    earned: true,
  },
  {
    name: 'Speed Demon',
    description: 'Win 3 Mario Kart races in a row',
    earned: true,
  },
  {
    name: 'Tournament Master',
    description: 'Win 5 tournaments',
    earned: false,
  },
  {
    name: 'Social Butterfly',
    description: 'Participate in 10 tournaments',
    earned: false,
  },
];

export const mockUserStats = {
  totalGamesPlayed: 25,
  totalWins: 12,
  winRate: 0.48,
  gameStats: {
    mario_kart: {
      gamesPlayed: 15,
      wins: 8,
      losses: 7,
      winRate: 0.53,
      averagePosition: 2.3,
      bestPosition: 1,
      pointsEarned: 450,
      tournamentsWon: 3,
      currentRank: 5,
      peakRank: 2,
    },
    super_smash_bros: {
      gamesPlayed: 10,
      wins: 4,
      losses: 6,
      winRate: 0.40,
      averagePosition: 3.1,
      bestPosition: 2,
      pointsEarned: 200,
      tournamentsWon: 1,
      currentRank: 12,
      peakRank: 8,
    },
  },
};
