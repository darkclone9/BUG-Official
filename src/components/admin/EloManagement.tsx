'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trophy, Calculator, Settings, RefreshCw } from 'lucide-react';
import { getAllUsers, getEloLeaderboard, updateUserEloRating } from '@/lib/database';
import { calculateEloChange, ELO_CONSTANTS } from '@/lib/eloSystem';
import { User, LeaderboardEntry } from '@/types/types';

export default function EloManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [eloLeaderboard, setEloLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRating, setNewRating] = useState<number>(1200);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // ELO Calculator state
  const [player1Rating, setPlayer1Rating] = useState<number>(1200);
  const [player2Rating, setPlayer2Rating] = useState<number>(1200);
  const [player1Games, setPlayer1Games] = useState<number>(50);
  const [player2Games, setPlayer2Games] = useState<number>(50);
  const [result, setResult] = useState<'win' | 'loss' | 'draw'>('win');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, leaderboardData] = await Promise.all([
        getAllUsers(),
        getEloLeaderboard()
      ]);
      setUsers(usersData);
      setEloLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading ELO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRating = async () => {
    if (!selectedUser) return;

    try {
      setUpdating(true);
      await updateUserEloRating(selectedUser.uid, newRating);
      await loadData(); // Refresh data
      setSelectedUser(null);
      setNewRating(1200);
    } catch (error) {
      console.error('Error updating ELO rating:', error);
    } finally {
      setUpdating(false);
    }
  };

  const calculateEloPreview = () => {
    try {
      return calculateEloChange(
        {
          playerRating: player1Rating,
          opponentRating: player2Rating,
          playerResult: result,
        },
        player1Games,
        player2Games
      );
    } catch {
      return null;
    }
  };

  const eloPreview = calculateEloPreview();

  const getRatingColor = (rating: number) => {
    if (rating >= 2000) return 'text-purple-400';
    if (rating >= 1800) return 'text-blue-400';
    if (rating >= 1600) return 'text-green-400';
    if (rating >= 1400) return 'text-yellow-400';
    if (rating >= 1200) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRatingTier = (rating: number) => {
    if (rating >= 2000) return 'Master';
    if (rating >= 1800) return 'Expert';
    if (rating >= 1600) return 'Advanced';
    if (rating >= 1400) return 'Intermediate';
    if (rating >= 1200) return 'Beginner';
    return 'Novice';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading ELO data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">ELO Rating System</h2>
          <p className="text-gray-400 mt-2">Manage competitive rankings and skill-based matchmaking</p>
        </div>
        <Button onClick={loadData} variant="outline" className="border-slate-600">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-slate-700">
            <Trophy className="h-4 w-4 mr-2" />
            ELO Leaderboard
          </TabsTrigger>
          <TabsTrigger value="calculator" className="data-[state=active]:bg-slate-700">
            <Calculator className="h-4 w-4 mr-2" />
            ELO Calculator
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700">
            <Settings className="h-4 w-4 mr-2" />
            Rating Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                ELO Leaderboard
              </CardTitle>
              <CardDescription className="text-gray-300">
                Current competitive rankings based on ELO ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eloLeaderboard.map((player) => (
                  <div key={player.uid} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-slate-600 rounded-full">
                        <span className="text-sm font-bold text-white">#{player.rank}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{player.displayName}</h3>
                        <p className="text-sm text-gray-400">{player.points} total points</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getRatingColor(player.eloRating || 1200)}`}>
                        {player.eloRating || 1200}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getRatingTier(player.eloRating || 1200)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-blue-400" />
                ELO Calculator
              </CardTitle>
              <CardDescription className="text-gray-300">
                Preview ELO changes and point awards for match results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Player 1</h3>
                  <div className="space-y-2">
                    <Label htmlFor="player1Rating">Current Rating</Label>
                    <Input
                      id="player1Rating"
                      type="number"
                      value={player1Rating}
                      onChange={(e) => setPlayer1Rating(parseInt(e.target.value) || 1200)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="player1Games">Games Played</Label>
                    <Input
                      id="player1Games"
                      type="number"
                      value={player1Games}
                      onChange={(e) => setPlayer1Games(parseInt(e.target.value) || 50)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Player 2</h3>
                  <div className="space-y-2">
                    <Label htmlFor="player2Rating">Current Rating</Label>
                    <Input
                      id="player2Rating"
                      type="number"
                      value={player2Rating}
                      onChange={(e) => setPlayer2Rating(parseInt(e.target.value) || 1200)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="player2Games">Games Played</Label>
                    <Input
                      id="player2Games"
                      type="number"
                      value={player2Games}
                      onChange={(e) => setPlayer2Games(parseInt(e.target.value) || 50)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="result">Match Result (from Player 1&apos;s perspective)</Label>
                <Select value={result} onValueChange={(value: 'win' | 'loss' | 'draw') => setResult(value)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="win">Player 1 Wins</SelectItem>
                    <SelectItem value="loss">Player 1 Loses</SelectItem>
                    <SelectItem value="draw">Draw</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {eloPreview && (
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Calculation Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-white">Player 1</h4>
                      <p className="text-sm text-gray-300">
                        Rating: {player1Rating} → {eloPreview.newPlayerRating}
                        <span className={eloPreview.playerRatingChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {' '}({eloPreview.playerRatingChange >= 0 ? '+' : ''}{eloPreview.playerRatingChange})
                        </span>
                      </p>
                      <p className="text-sm text-blue-400">Points Awarded: {eloPreview.pointsAwarded}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Player 2</h4>
                      <p className="text-sm text-gray-300">
                        Rating: {player2Rating} → {eloPreview.newOpponentRating}
                        <span className={eloPreview.opponentRatingChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {' '}({eloPreview.opponentRatingChange >= 0 ? '+' : ''}{eloPreview.opponentRatingChange})
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gray-400" />
                Rating Management
              </CardTitle>
              <CardDescription className="text-gray-300">
                Manually adjust player ELO ratings when needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {users.slice(0, 10).map((user) => (
                    <div key={user.uid} className="p-4 bg-slate-700/50 rounded-lg">
                      <h3 className="font-semibold text-white">{user.displayName}</h3>
                      <p className="text-sm text-gray-400">Current: {user.eloRating || 1200}</p>
                      <Button
                        onClick={() => {
                          setSelectedUser(user);
                          setNewRating(user.eloRating || 1200);
                        }}
                        variant="outline"
                        size="sm"
                        className="mt-2 border-slate-600"
                      >
                        Adjust Rating
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rating Adjustment Dialog */}
      <AlertDialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Adjust ELO Rating for {selectedUser?.displayName}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Current rating: {selectedUser?.eloRating || 1200}. Enter the new rating below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="newRating" className="text-white">New Rating</Label>
            <Input
              id="newRating"
              type="number"
              value={newRating}
              onChange={(e) => setNewRating(parseInt(e.target.value) || 1200)}
              className="bg-slate-700 border-slate-600 text-white"
              min={ELO_CONSTANTS.MIN_RATING}
              max={ELO_CONSTANTS.MAX_RATING}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateRating}
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updating ? 'Updating...' : 'Update Rating'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
