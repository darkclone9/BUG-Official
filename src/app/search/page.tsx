'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Users,
  Trophy,
  Gamepad2,
  Calendar,
  Star,
  Crown,
  Medal,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { searchUsers, searchTournaments } from '@/lib/database';

type SearchResult = {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  wins: number;
  tournaments: number;
  gameStats: {
    mario_kart?: {
      wins: number;
      tournaments: number;
      winRate: string;
    };
    super_smash_bros?: {
      wins: number;
      tournaments: number;
      winRate: string;
    };
  };
};

type TournamentResult = {
  id: string;
  name: string;
  game: string;
  date: string;
  participants: number;
  maxParticipants: number;
  status: string;
  format: string;
};

type GameResult = {
  id: string;
  name: string;
  description: string;
  icon: string;
  activeTournaments: number;
  totalPlayers: number;
};

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{
    players: SearchResult[];
    tournaments: TournamentResult[];
    games: GameResult[];
  }>({
    players: [],
    tournaments: [],
    games: []
  });
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback(async (term: string) => {
    // Static games data (no need to search)
    const games = [
      {
        id: 'mario_kart',
        name: 'Mario Kart 8 Deluxe',
        description: 'Racing tournament game with all tracks and characters',
        icon: '🏎️',
        activeTournaments: 0, // Will be calculated from real data
        totalPlayers: 0, // Will be calculated from real data
      },
      {
        id: 'super_smash_bros',
        name: 'Super Smash Bros Ultimate',
        description: 'Fighting tournament game with all characters and stages',
        icon: '🥊',
        activeTournaments: 0, // Will be calculated from real data
        totalPlayers: 0, // Will be calculated from real data
      },
    ];
    if (!term.trim()) {
      setSearchResults({ players: [], tournaments: [], games: [] });
      return;
    }

    try {
      setIsSearching(true);
      const [players, tournaments] = await Promise.all([
        searchUsers(term, 10),
        searchTournaments(term, 10)
      ]);

      setSearchResults({
        players: players.map(player => ({
          id: player.id,
          name: player.title,
          avatar: player.avatar,
          points: (player.metadata?.points as number) || 0,
          rank: 0, // Will be calculated based on leaderboard
          wins: 0, // Will be fetched from user stats
          tournaments: 0, // Will be fetched from user stats
          gameStats: {
            mario_kart: undefined,
            super_smash_bros: undefined
          } // Will be fetched from user stats
        })),
        tournaments: tournaments.map(tournament => ({
          id: tournament.id,
          name: tournament.title,
          game: tournament.subtitle || 'unknown',
          date: tournament.metadata?.date ?
            (tournament.metadata.date instanceof Date ?
              tournament.metadata.date.toISOString().split('T')[0] :
              String(tournament.metadata.date)) : '',
          participants: (tournament.metadata?.participants as number) || 0,
          maxParticipants: (tournament.metadata?.maxParticipants as number) || 0,
          status: (tournament.metadata?.status as string) || 'upcoming',
          format: 'single_elimination' // Default format
        })),
        games: games.filter(game =>
          game.name.toLowerCase().includes(term.toLowerCase()) ||
          game.id.toLowerCase().includes(term.toLowerCase())
        )
      });
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-primary text-primary-foreground">Upcoming</Badge>;
      case 'ongoing':
        return <Badge className="bg-accent text-accent-foreground">Ongoing</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-primary" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-muted-foreground" />;
    if (rank === 3) return <Award className="h-4 w-4 text-accent" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const totalResults = searchResults.players.length + searchResults.tournaments.length + searchResults.games.length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            <Search className="inline h-10 w-10 mr-3 text-primary" />
            Search
          </h1>
          <p className="text-xl text-muted-foreground">
            Find players, tournaments, and games across the platform
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for players, tournaments, or games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-lg py-3"
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchTerm && (
          <div className="space-y-6">
            {/* Results Summary */}
            <div className="text-sm text-muted-foreground">
              {isSearching ? (
                'Searching...'
              ) : (
                `${totalResults} result${totalResults !== 1 ? 's' : ''} found for "${searchTerm}"`
              )}
            </div>

            {/* Players Results */}
            {searchResults.players.length > 0 && (
              <Card className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Players ({searchResults.players.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchResults.players.map((player) => (
                      <div key={player.id} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                        <div className="flex-shrink-0">
                          {getRankIcon(player.rank)}
                        </div>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={player.avatarUrl || player.avatar} alt={player.name} />
                          <AvatarFallback>
                            {player.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium">{player.name}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                            <span>{player.points.toLocaleString()} points</span>
                            <span>#{player.rank} rank</span>
                            <span>{player.wins} wins</span>
                          </div>
                          {player.gameStats && (
                            <div className="flex space-x-4 mt-2 text-xs">
                              {player.gameStats.mario_kart && (
                                <span className="text-primary">
                                  MK: {player.gameStats.mario_kart.wins}/{player.gameStats.mario_kart.tournaments} ({player.gameStats.mario_kart.winRate})
                                </span>
                              )}
                              {player.gameStats.super_smash_bros && (
                                <span className="text-accent">
                                  SSB: {player.gameStats.super_smash_bros.wins}/{player.gameStats.super_smash_bros.tournaments} ({player.gameStats.super_smash_bros.winRate})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <Link href={`/players`}>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tournaments Results */}
            {searchResults.tournaments.length > 0 && (
              <Card className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-primary" />
                    Tournaments ({searchResults.tournaments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchResults.tournaments.map((tournament) => (
                      <div key={tournament.id} className="p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium mb-2">{tournament.name}</h3>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {tournament.game === 'mario_kart' ? 'Mario Kart' : 'Super Smash Bros'}
                              </Badge>
                              {getStatusBadge(tournament.status)}
                              <Badge variant="outline" className="text-xs">
                                {tournament.format.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(tournament.date).toLocaleDateString()}
                              </span>
                              <span>
                                {tournament.participants}/{tournament.maxParticipants} participants
                              </span>
                            </div>
                          </div>
                          <Link href={`/tournaments/${tournament.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Games Results */}
            {searchResults.games.length > 0 && (
              <Card className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gamepad2 className="h-5 w-5 mr-2 text-accent" />
                    Games ({searchResults.games.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchResults.games.map((game) => (
                      <div key={game.id} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                        <div className="text-3xl">{game.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-medium">{game.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{game.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <span>{game.activeTournaments} active tournaments</span>
                            <span>{game.totalPlayers} players</span>
                          </div>
                        </div>
                        <Link href={`/tournaments?game=${game.id}`}>
                          <Button variant="outline" size="sm">
                            View Tournaments
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Results */}
            {!isSearching && totalResults === 0 && (
              <Card className="glass">
                <CardContent className="p-12 text-center">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try searching for different terms or check your spelling
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Search Suggestions */}
        {!searchTerm && (
          <div className="space-y-6">
            <Card className="glass hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-primary" />
                  Popular Searches
                </CardTitle>
                <CardDescription>
                  Try searching for these popular terms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['Mario Kart', 'Super Smash Bros', 'SpeedDemon', 'SmashMaster', 'Championship', 'Tournament'].map((term) => (
                    <Button
                      key={term}
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchTerm(term)}
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Top Players
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {searchResults.players.slice(0, 3).map((player) => (
                      <div key={player.id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getRankIcon(player.rank)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{player.name}</p>
                          <p className="text-xs text-muted-foreground">{player.points.toLocaleString()} points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-primary" />
                    Upcoming Tournaments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {searchResults.tournaments.slice(0, 3).map((tournament) => (
                      <div key={tournament.id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-medium text-primary-foreground">
                            {tournament.game === 'mario_kart' ? '🏎️' : '🥊'}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{tournament.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tournament.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gamepad2 className="h-5 w-5 mr-2 text-accent" />
                    Available Games
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {searchResults.games.map((game) => (
                      <div key={game.id} className="flex items-center space-x-3">
                        <div className="text-2xl">{game.icon}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{game.name}</p>
                          <p className="text-xs text-muted-foreground">{game.totalPlayers} players</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
