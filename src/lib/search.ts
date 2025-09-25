import { SearchResult, GameType } from '@/types/types';
import { searchUsers, searchTournaments } from './database';

export interface SearchOptions {
  query: string;
  categories?: ('players' | 'tournaments' | 'games')[];
  limit?: number;
  gameFilter?: GameType;
}

export interface SearchResults {
  players: SearchResult[];
  tournaments: SearchResult[];
  games: SearchResult[];
  total: number;
}

const GAME_DATA: SearchResult[] = [
  {
    id: 'mario_kart',
    type: 'game',
    title: 'Mario Kart',
    subtitle: 'Racing Game',
    description: 'High-speed kart racing with power-ups and competitive tournaments',
    metadata: {
      category: 'racing',
      players: 'up to 12',
      difficulty: 'easy',
    },
  },
  {
    id: 'super_smash_bros',
    type: 'game',
    title: 'Super Smash Bros',
    subtitle: 'Fighting Game',
    description: 'Ultimate fighting game featuring Nintendo characters',
    metadata: {
      category: 'fighting',
      players: 'up to 8',
      difficulty: 'medium',
    },
  },
];

export const performSearch = async (options: SearchOptions): Promise<SearchResults> => {
  const { query, categories = ['players', 'tournaments', 'games'], limit = 10 } = options;
  
  if (!query.trim()) {
    return {
      players: [],
      tournaments: [],
      games: [],
      total: 0,
    };
  }

  const results: SearchResults = {
    players: [],
    tournaments: [],
    games: [],
    total: 0,
  };

  // Search players
  if (categories.includes('players')) {
    try {
      results.players = await searchUsers(query, limit);
    } catch (error) {
      console.error('Error searching users:', error);
      results.players = [];
    }
  }

  // Search tournaments
  if (categories.includes('tournaments')) {
    try {
      results.tournaments = await searchTournaments(query, limit);
      
      // Filter by game if specified
      if (options.gameFilter) {
        results.tournaments = results.tournaments.filter(
          tournament => tournament.metadata?.game === options.gameFilter
        );
      }
    } catch (error) {
      console.error('Error searching tournaments:', error);
      results.tournaments = [];
    }
  }

  // Search games
  if (categories.includes('games')) {
    results.games = GAME_DATA.filter(game =>
      game.title.toLowerCase().includes(query.toLowerCase()) ||
      game.description.toLowerCase().includes(query.toLowerCase()) ||
      game.subtitle.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);
  }

  results.total = results.players.length + results.tournaments.length + results.games.length;

  return results;
};

export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!query.trim() || query.length < 2) {
    return [];
  }

  const suggestions = new Set<string>();

  // Add game suggestions
  GAME_DATA.forEach(game => {
    if (game.title.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(game.title);
    }
  });

  // Add common tournament terms
  const tournamentTerms = [
    'Mario Kart Tournament',
    'Super Smash Bros Championship',
    'Weekly Tournament',
    'Monthly Championship',
    'Beginner Tournament',
    'Advanced Tournament',
  ];

  tournamentTerms.forEach(term => {
    if (term.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(term);
    }
  });

  return Array.from(suggestions).slice(0, 5);
};

export const getPopularSearches = (): string[] => {
  return [
    'Mario Kart',
    'Super Smash Bros',
    'Weekly Tournament',
    'Championship',
    'Leaderboard',
    'Top Players',
  ];
};

export const formatSearchResult = (result: SearchResult): string => {
  switch (result.type) {
    case 'player':
      return `${result.title} - ${result.metadata?.points || 0} points`;
    case 'tournament':
      return `${result.title} - ${result.metadata?.status || 'Unknown'} (${result.metadata?.participants || 0}/${result.metadata?.maxParticipants || 0})`;
    case 'game':
      return `${result.title} - ${result.subtitle}`;
    default:
      return result.title;
  }
};

export const getSearchResultIcon = (result: SearchResult): string => {
  switch (result.type) {
    case 'player':
      return 'user';
    case 'tournament':
      return 'trophy';
    case 'game':
      return 'gamepad-2';
    default:
      return 'search';
  }
};

export const getSearchResultColor = (result: SearchResult): string => {
  switch (result.type) {
    case 'player':
      return 'text-blue-400';
    case 'tournament':
      return 'text-yellow-400';
    case 'game':
      return 'text-green-400';
    default:
      return 'text-gray-400';
  }
};

// Advanced search filters
export interface AdvancedSearchFilters {
  gameType?: GameType;
  tournamentStatus?: 'upcoming' | 'ongoing' | 'completed';
  pointsRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  userRole?: 'admin' | 'member' | 'guest';
}

export const performAdvancedSearch = async (
  query: string,
  filters: AdvancedSearchFilters
): Promise<SearchResults> => {
  const baseOptions: SearchOptions = {
    query,
    categories: ['players', 'tournaments', 'games'],
    limit: 20,
  };

  if (filters.gameType) {
    baseOptions.gameFilter = filters.gameType;
  }

  let results = await performSearch(baseOptions);

  // Apply additional filters
  if (filters.pointsRange) {
    results.players = results.players.filter(player => {
      const points = player.metadata?.points || 0;
      return points >= filters.pointsRange!.min && points <= filters.pointsRange!.max;
    });
  }

  if (filters.userRole) {
    results.players = results.players.filter(player => 
      player.metadata?.role === filters.userRole
    );
  }

  if (filters.tournamentStatus) {
    results.tournaments = results.tournaments.filter(tournament =>
      tournament.metadata?.status === filters.tournamentStatus
    );
  }

  if (filters.dateRange) {
    results.tournaments = results.tournaments.filter(tournament => {
      const tournamentDate = tournament.metadata?.date;
      if (!tournamentDate) return false;
      
      return tournamentDate >= filters.dateRange!.start && 
             tournamentDate <= filters.dateRange!.end;
    });
  }

  // Recalculate total
  results.total = results.players.length + results.tournaments.length + results.games.length;

  return results;
};

export const exportSearchResults = (results: SearchResults): string => {
  const lines: string[] = [];
  
  lines.push('Gaming Club Search Results');
  lines.push('========================');
  lines.push('');
  
  if (results.players.length > 0) {
    lines.push('Players:');
    results.players.forEach(player => {
      lines.push(`- ${formatSearchResult(player)}`);
    });
    lines.push('');
  }
  
  if (results.tournaments.length > 0) {
    lines.push('Tournaments:');
    results.tournaments.forEach(tournament => {
      lines.push(`- ${formatSearchResult(tournament)}`);
    });
    lines.push('');
  }
  
  if (results.games.length > 0) {
    lines.push('Games:');
    results.games.forEach(game => {
      lines.push(`- ${formatSearchResult(game)}`);
    });
    lines.push('');
  }
  
  lines.push(`Total Results: ${results.total}`);
  
  return lines.join('\n');
};
