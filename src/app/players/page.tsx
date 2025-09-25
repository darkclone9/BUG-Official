'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search, Trophy, Crown, Medal, Award, Gamepad2, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getAllUsers, getUserStats } from '@/lib/database';

export default function PlayersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState('all');
  const [sortBy, setSortBy] = useState('points');
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true);
        const users = await getAllUsers();
        
        // Enhance users with stats
        const playersWithStats = await Promise.all(
          users.map(async (user, index) => {
            const userStats = await getUserStats(user.uid);
            return {
              ...user,
              rank: index + 1,
              wins: userStats?.totalWins || 0,
              tournaments: userStats?.totalGamesPlayed || 0,
              gameStats: userStats?.gameStats || {},
              joinDate: user.joinDate.toISOString().split('T')[0],
              lastLoginDate: user.lastLoginDate?.toISOString().split('T')[0] || 'Never'
            };
          })
        );
        
        setPlayers(playersWithStats);
      } catch (error) {
        console.error('Error loading players:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, []);

  const getFilteredAndSortedPlayers = () => {
    let filtered = players;
    
    if (searchTerm) {
      filtered = filtered.filter(player => 
        player.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (gameFilter !== 'all') {
      filtered = filtered.filter(player => 
        player.gameStats && player.gameStats[gameFilter]
      );
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'points':
          return b.points - a.points;
        case 'wins':
          return b.wins - a.wins;
        case 'tournaments':
          return b.tournaments - a.tournaments;
        case 'name':
          return a.displayName.localeCompare(b.displayName);
        case 'joinDate':
          return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
        default:
          return b.points - a.points;
      }
    });
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-primary" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-muted-foreground" />;
    if (rank === 3) return <Award className="h-5 w-5 text-accent" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-primary text-primary-foreground">Champion</Badge>;
    if (rank === 2) return <Badge variant="secondary">Runner-up</Badge>;
    if (rank === 3) return <Badge className="bg-accent text-accent-foreground">3rd Place</Badge>;
    if (rank <= 10) return <Badge className="bg-primary text-primary-foreground">Top 10</Badge>;
    return <Badge variant="outline">Player</Badge>;
  };

  const filteredPlayers = getFilteredAndSortedPlayers();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading players...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            <Users className="inline h-10 w-10 mr-3 text-primary" />
            Players Directory
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover and connect with fellow gamers in our community
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{players.length}</div>
              <p className="text-xs text-muted-foreground">
                Active community members
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Players</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{players.filter(p => p.points > 1000).length}</div>
              <p className="text-xs text-muted-foreground">
                Players with 1000+ points
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Players</CardTitle>
              <Gamepad2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{players.filter(p => p.isActive).length}</div>
              <p className="text-xs text-muted-foreground">
                Currently active members
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {players.filter(p => {
                  const joinDate = new Date(p.joinDate);
                  const oneMonthAgo = new Date();
                  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                  return joinDate > oneMonthAgo;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Joined in the last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={gameFilter} onValueChange={setGameFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by game" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              <SelectItem value="mario_kart">Mario Kart</SelectItem>
              <SelectItem value="super_smash_bros">Super Smash Bros</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="points">Points</SelectItem>
              <SelectItem value="wins">Wins</SelectItem>
              <SelectItem value="tournaments">Tournaments</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="joinDate">Join Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Players Table */}
        <Card>
          <CardHeader>
            <CardTitle>Players ({filteredPlayers.length})</CardTitle>
            <CardDescription>
              Browse and discover players in the gaming community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Wins</TableHead>
                    <TableHead>Tournaments</TableHead>
                    <TableHead>Games</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.map((player) => (
                    <TableRow key={player.uid}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getRankIcon(player.rank)}
                          <span className="font-medium">#{player.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={player.avatar} alt={player.displayName} />
                            <AvatarFallback>
                              {player.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{player.displayName}</div>
                            <div className="text-sm text-muted-foreground">{player.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{player.points}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4 text-green-500" />
                          <span>{player.wins}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Gamepad2 className="h-4 w-4 text-blue-500" />
                          <span>{player.tournaments}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {Object.keys(player.gameStats).map((game) => (
                            <Badge key={game} variant="outline" className="text-xs">
                              {game === 'mario_kart' ? 'MK' : game === 'super_smash_bros' ? 'SSB' : game}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRankBadge(player.rank)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(player.joinDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredPlayers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No players found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}