'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  Users, 
  Trophy, 
  Calendar,
  Award,
  Activity
} from 'lucide-react';
import { getLeaderboard, getTournaments, getAllUsers } from '@/lib/database';
import { LeaderboardEntry, Tournament } from '@/types/types';

interface AnalyticsData {
  topPlayers: LeaderboardEntry[];
  recentTournaments: Tournament[];
  userGrowth: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  tournamentStats: {
    total: number;
    upcoming: number;
    completed: number;
    averageParticipants: number;
  };
  gameStats: {
    marioKart: number;
    superSmashBros: number;
    general: number;
  };
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'weekly' | 'monthly'>('all');

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        
        const [leaderboardData, tournamentsData, usersData] = await Promise.all([
          getLeaderboard(undefined, timeframe),
          getTournaments(),
          getAllUsers()
        ]);

        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const newUsersThisMonth = usersData.filter(user => 
          user.joinDate >= thisMonth
        ).length;

        const activeUsers = usersData.filter(user => user.isActive).length;

        const gameStats = tournamentsData.reduce((acc, tournament) => {
          if (tournament.game === 'mario_kart') acc.marioKart++;
          else if (tournament.game === 'super_smash_bros') acc.superSmashBros++;
          else acc.general++;
          return acc;
        }, { marioKart: 0, superSmashBros: 0, general: 0 });

        const totalParticipants = tournamentsData.reduce((sum, tournament) => 
          sum + (tournament.participants?.length || 0), 0
        );

        setAnalyticsData({
          topPlayers: leaderboardData.slice(0, 10),
          recentTournaments: tournamentsData.slice(0, 5),
          userGrowth: {
            total: usersData.length,
            active: activeUsers,
            newThisMonth: newUsersThisMonth,
          },
          tournamentStats: {
            total: tournamentsData.length,
            upcoming: tournamentsData.filter(t => t.status === 'upcoming').length,
            completed: tournamentsData.filter(t => t.status === 'completed').length,
            averageParticipants: tournamentsData.length > 0 ? 
              Math.round(totalParticipants / tournamentsData.length) : 0,
          },
          gameStats,
        });
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <div className="animate-pulse bg-slate-700 h-10 w-32 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-800 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <Select value={timeframe} onValueChange={(value: 'all' | 'weekly' | 'monthly') => setTimeframe(value)}>
          <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="monthly">This Month</SelectItem>
            <SelectItem value="weekly">This Week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Users</p>
                <p className="text-2xl font-bold">{analyticsData.userGrowth.total}</p>
                <p className="text-xs text-green-400">+{analyticsData.userGrowth.newThisMonth} this month</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Active Users</p>
                <p className="text-2xl font-bold">{analyticsData.userGrowth.active}</p>
                <p className="text-xs text-gray-400">
                  {Math.round((analyticsData.userGrowth.active / analyticsData.userGrowth.total) * 100)}% active
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Tournaments</p>
                <p className="text-2xl font-bold">{analyticsData.tournamentStats.total}</p>
                <p className="text-xs text-gray-400">
                  {analyticsData.tournamentStats.upcoming} upcoming
                </p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Avg Participants</p>
                <p className="text-2xl font-bold">{analyticsData.tournamentStats.averageParticipants}</p>
                <p className="text-xs text-gray-400">per tournament</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Players */}
        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-400" />
              Top Players ({timeframe === 'all' ? 'All Time' : timeframe === 'monthly' ? 'This Month' : 'This Week'})
            </CardTitle>
            <CardDescription className="text-gray-300">
              Highest scoring players
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topPlayers.map((player, index) => (
                <div key={player.uid} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-slate-600 rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{player.displayName}</p>
                      <p className="text-xs text-gray-400">
                        {timeframe === 'all' ? player.points : 
                         timeframe === 'monthly' ? player.monthlyPoints : 
                         player.weeklyPoints} points
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    #{player.rank}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Game Statistics */}
        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
              Game Statistics
            </CardTitle>
            <CardDescription className="text-gray-300">
              Tournament distribution by game
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-white">Mario Kart</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{analyticsData.gameStats.marioKart}</p>
                  <p className="text-xs text-gray-400">tournaments</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-white">Super Smash Bros</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{analyticsData.gameStats.superSmashBros}</p>
                  <p className="text-xs text-gray-400">tournaments</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-white">General</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{analyticsData.gameStats.general}</p>
                  <p className="text-xs text-gray-400">tournaments</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tournaments */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-400" />
            Recent Tournaments
          </CardTitle>
          <CardDescription className="text-gray-300">
            Latest tournament activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.recentTournaments.map((tournament) => (
              <div key={tournament.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{tournament.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {tournament.game === 'mario_kart' ? 'Mario Kart' : 
                       tournament.game === 'super_smash_bros' ? 'Super Smash Bros' : 'General'}
                    </Badge>
                    <Badge 
                      className={
                        tournament.status === 'upcoming' ? 'bg-blue-600 text-white' :
                        tournament.status === 'ongoing' ? 'bg-green-600 text-white' :
                        'bg-gray-600 text-white'
                      }
                    >
                      {tournament.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-300">
                    {tournament.participants?.length || 0}/{tournament.maxParticipants}
                  </div>
                  <div className="text-xs text-gray-400">participants</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}