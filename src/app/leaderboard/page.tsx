'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Search, Crown, Medal, Award, TrendingUp, Users, Star } from 'lucide-react';
import { getLeaderboard, getUserStats } from '@/lib/database';

export default function LeaderboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboardData = async () => {
      try {
        setLoading(true);
        const gameType = gameFilter === 'all' ? undefined : gameFilter as any;
        const timeframe = timeFilter as 'all' | 'weekly' | 'monthly';
        
        const data = await getLeaderboard(gameType, timeframe);
        
        // Enhance data with user stats
        const enhancedData = await Promise.all(
          data.map(async (entry, index) => {
            const userStats = await getUserStats(entry.uid);
            return {
              ...entry,
              rank: index + 1,
              wins: userStats?.totalWins || 0,
              tournaments: userStats?.totalGamesPlayed || 0,
              gameStats: userStats?.gameStats || {},
            };
          })
        );
        
        setLeaderboardData(enhancedData);
      } catch (error) {
        console.error('Error loading leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboardData();
  }, [timeFilter, gameFilter]);

  const getFilteredData = () => {
    let filtered = leaderboardData;
    
    if (searchTerm) {
      filtered = filtered.filter(player => 
        player.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (gameFilter !== 'all') {
      filtered = filtered.filter(player => 
        player.gameStats && player.gameStats[gameFilter]
      );
    }
    
    return filtered;
  };

  const getPointsForTimeFilter = (player: any) => {
    switch (timeFilter) {
      case 'weekly':
        return player.weeklyPoints || 0;
      case 'monthly':
        return player.monthlyPoints || 0;
      default:
        return player.points || 0;
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-orange-500" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-100 text-yellow-800">Champion</Badge>;
    if (rank === 2) return <Badge className="bg-gray-100 text-gray-800">Runner-up</Badge>;
    if (rank === 3) return <Badge className="bg-orange-100 text-orange-800">3rd Place</Badge>;
    if (rank <= 10) return <Badge className="bg-blue-100 text-blue-800">Top 10</Badge>;
    return <Badge variant="outline">Player</Badge>;
  };

  const filteredData = getFilteredData().sort((a, b) => 
    getPointsForTimeFilter(b) - getPointsForTimeFilter(a)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading leaderboard...</p>
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
            <Trophy className="inline h-10 w-10 mr-3 text-primary" />
            Leaderboard
          </h1>
          <p className="text-xl text-muted-foreground">
            See how you rank against other players in the community
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
              <div className="text-2xl font-bold">{leaderboardData.length}</div>
              <p className="text-xs text-muted-foreground">
                Active players
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Player</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leaderboardData.length > 0 ? leaderboardData[0].displayName : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {leaderboardData.length > 0 ? `${leaderboardData[0].points} points` : 'No players yet'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Points</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leaderboardData.length > 0 
                  ? Math.round(leaderboardData.reduce((sum, player) => sum + player.points, 0) / leaderboardData.length)
                  : 0
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Community average
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leaderboardData.filter(player => (player.weeklyPoints || 0) > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Players with weekly points
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
          
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
            </SelectContent>
          </Select>
          
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
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Player Rankings</CardTitle>
            <CardDescription>
              Rankings based on {timeFilter === 'all' ? 'total points' : timeFilter === 'weekly' ? 'weekly points' : 'monthly points'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredData.map((player, index) => (
                <div key={player.uid} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(player.rank)}
                    </div>
                    
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={player.avatar} alt={player.displayName} />
                      <AvatarFallback>
                        {player.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold text-lg">{player.displayName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Trophy className="h-4 w-4 mr-1" />
                          {player.wins} wins
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {player.tournaments} tournaments
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {getPointsForTimeFilter(player).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {timeFilter === 'all' ? 'total' : timeFilter === 'weekly' ? 'this week' : 'this month'} points
                    </div>
                    <div className="mt-2">
                      {getRankBadge(player.rank)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No players found</h3>
                <p className="text-muted-foreground">
                  {leaderboardData.length === 0 
                    ? "No players have joined yet. Be the first to register!"
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}