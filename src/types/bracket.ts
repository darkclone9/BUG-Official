export interface BracketMatch {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  bracket: 'winners' | 'losers' | 'grand_final';
  player1Id?: string;
  player2Id?: string;
  player1Name?: string;
  player2Name?: string;
  winnerId?: string;
  loserId?: string;
  score?: {
    player1: number;
    player2: number;
  };
  status: 'pending' | 'in_progress' | 'completed';
  scheduledTime?: Date;
  location?: string;
  nextMatchId?: string; // For winners
  nextLoserMatchId?: string; // For losers bracket
  isElimination?: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface BracketNode {
  match: BracketMatch;
  children?: BracketNode[];
  position: {
    x: number;
    y: number;
  };
}

export interface TournamentBracket {
  id: string;
  tournamentId: string;
  format: 'single_elimination' | 'double_elimination' | 'round_robin';
  matches: BracketMatch[];
  winnersMatches: BracketMatch[];
  losersMatches?: BracketMatch[];
  grandFinalMatch?: BracketMatch;
  totalRounds: number;
  currentRound: number;
  isComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BracketPosition {
  round: number;
  position: number;
  bracket: 'winners' | 'losers' | 'grand_final';
}

export interface TournamentResult {
  playerId: string;
  playerName: string;
  position: number;
  wins: number;
  losses: number;
  pointsEarned: number;
  eloChange: number;
  eliminated: boolean;
  eliminatedInRound?: number;
}

export interface RoundRobinMatch {
  id: string;
  tournamentId: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  winnerId?: string;
  score?: {
    player1: number;
    player2: number;
  };
  status: 'pending' | 'in_progress' | 'completed';
  scheduledTime?: Date;
  location?: string;
  round: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface RoundRobinStanding {
  playerId: string;
  playerName: string;
  wins: number;
  losses: number;
  winRate: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDifference: number;
  position: number;
}

// Bracket generation utilities
export interface BracketGenerationOptions {
  format: 'single_elimination' | 'double_elimination' | 'round_robin';
  participants: string[];
  tournamentId: string;
  randomizeSeeding?: boolean;
  seedByElo?: boolean;
}

export interface MatchSchedule {
  matchId: string;
  scheduledTime: Date;
  location: string;
  estimatedDuration: number; // in minutes
}

export interface BracketVisualizationData {
  rounds: {
    roundNumber: number;
    bracket: 'winners' | 'losers' | 'grand_final';
    matches: BracketMatch[];
    x: number;
    width: number;
  }[];
  connections: {
    fromMatchId: string;
    toMatchId: string;
    type: 'winner' | 'loser';
    path: string; // SVG path data
  }[];
  dimensions: {
    width: number;
    height: number;
  };
}
