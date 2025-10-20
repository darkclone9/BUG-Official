'use client';

import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  getAnnouncements,
  getUserAchievements,
  getUserRecentActivity,
  getUserStats,
  getUserTournaments,
  getUserConversations
} from '@/lib/database';
import { Announcement, Tournament, UserStats, Conversation } from '@/types/types';
import { Activity, Award, Bell, Calendar, Crown, Edit, Gamepad2, Settings, Star, TrendingUp, Trophy, Users, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type AnnouncementWithRead = Announcement & { read: boolean };
type UserTournament = Tournament & {
  position?: number;
  points: number;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [userTournaments, setUserTournaments] = useState<UserTournament[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementWithRead[]>([]);
  const [recentActivity, setRecentActivity] = useState<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: Date;
    points: number;
  }[]>([]);
  const [achievements, setAchievements] = useState<{
    name: string;
    description: string;
    earned: boolean;
  }[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const [tournaments, announcementsData, activity, achievementsData, statsData, conversationsData] = await Promise.all([
          getUserTournaments(user.uid),
          getAnnouncements(true),
          getUserRecentActivity(user.uid),
          getUserAchievements(user.uid),
          getUserStats(user.uid),
          getUserConversations(user.uid)
        ]);

        setUserTournaments(tournaments as UserTournament[]);
        setAnnouncements(announcementsData.map(ann => ({
          ...ann,
          read: ann.readBy?.includes(user.uid) || false
        })));
        setRecentActivity(activity);
        setAchievements(achievementsData);
        setUserStats(statsData);
        setConversations(conversationsData.slice(0, 5)); // Get top 5 recent conversations
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.uid]);

  const stats = [
    { label: 'Store Credit', value: `$${((user?.storeCreditBalance || 0) / 100).toFixed(2)}`, icon: Star, color: 'text-yellow-400' },
    { label: 'Tournaments Played', value: userStats?.totalGamesPlayed || 0, icon: Trophy, color: 'text-purple-400' },
    { label: 'Wins', value: userStats?.totalWins || 0, icon: Award, color: 'text-green-400' },
    { label: 'Win Rate', value: userStats ? `${Math.round(userStats.winRate * 100)}%` : '0%', icon: TrendingUp, color: 'text-blue-400' },
  ];

  const gameStats = userStats?.gameStats ? Object.entries(userStats.gameStats)
    .filter(([, stats]) => stats !== undefined)
    .map(([game, stats]) => ({
      game: game === 'mario_kart' ? 'Mario Kart' : game === 'super_smash_bros' ? 'Super Smash Bros' : game,
      gamesPlayed: stats!.gamesPlayed || 0,
      wins: stats!.wins || 0,
      winRate: `${Math.round((stats!.winRate || 0) * 100)}%`,
      bestPosition: stats!.bestPosition || 0
    })) : [];

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80">
        <Navigation />

        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-green-500 via-green-600 to-yellow-500 text-white overflow-hidden py-16">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
          </div>

          <div className="container max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20 border-4 border-white/20">
                  <AvatarImage src={user?.avatarUrl || user?.avatar} alt={user?.displayName} />
                  <AvatarFallback className="text-2xl bg-white/20 text-white">
                    {user?.displayName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-5xl font-bold mb-2">
                    Welcome back, {user?.displayName}!
                  </h1>
                  <p className="text-lg text-white/90">
                    {user?.role === 'admin' ? 'Administrator' : 'Member'} • Joined {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
              <Link href="/profile/edit">
                <Button size="lg" className="bg-white text-green-600 hover:bg-white/90 font-semibold">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Convert Points Banner */}
          {user && (user.pointsBalance || 0) > 0 && !(user as any).pointsConverted && (
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-200 dark:bg-yellow-900/50 p-2 rounded-full">
                    <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                      You have {(user.pointsBalance || 0).toLocaleString()} legacy points!
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Convert them to ${(((user.pointsBalance || 0) / 200) * 1).toFixed(2)} store credit
                    </p>
                  </div>
                </div>
                <Link href="/convert-points">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Convert Now
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Stats Grid - Color Coded */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Store Credit - Green */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Store Credit</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                    ${((user?.storeCreditBalance || 0) / 100).toFixed(2)}
                  </p>
                </div>
                <Star className="h-12 w-12 text-green-500 opacity-80" />
              </div>
            </div>

            {/* Tournaments Played - Yellow */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Tournaments Played</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                    {userStats?.totalGamesPlayed || 0}
                  </p>
                </div>
                <Trophy className="h-12 w-12 text-yellow-500 opacity-80" />
              </div>
            </div>

            {/* Wins - Green */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Wins</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {userStats?.totalWins || 0}
                  </p>
                </div>
                <Award className="h-12 w-12 text-green-500 opacity-80" />
              </div>
            </div>

            {/* Win Rate - Yellow */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Win Rate</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                    {userStats ? `${Math.round(userStats.winRate * 100)}%` : '0%'}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-yellow-500 opacity-80" />
              </div>
            </div>
          </div>

          {/* Announcements */}
          <Card className="glass hover:shadow-lg transition-all duration-300 mb-8 border-green-200 dark:border-green-800">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
              <CardTitle className="flex items-center text-green-900 dark:text-green-100">
                <Bell className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                Announcements
                {announcements.filter(a => !a.read).length > 0 && (
                  <Badge className="ml-2 bg-green-600 text-white">
                    {announcements.filter(a => !a.read).length} new
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Latest updates and important information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className={`p-4 rounded-lg border-l-4 transition-all ${
                    announcement.priority === 'urgent' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' :
                    announcement.priority === 'important' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' :
                    'border-green-500 bg-green-50 dark:bg-green-950/20'
                  } ${!announcement.read ? 'ring-2 ring-green-400/50' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{announcement.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant="outline" className="text-xs capitalize">
                          {announcement.priority}
                        </Badge>
                        {!announcement.read && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card className="glass hover:shadow-lg transition-all duration-300 mb-8 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-yellow-900 dark:text-yellow-100">
                    <MessageCircle className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                    Recent Messages
                  </CardTitle>
                  <CardDescription className="text-yellow-700 dark:text-yellow-300">
                    Your latest conversations
                  </CardDescription>
                </div>
                <Link href="/messages">
                  <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm mt-1">Start a conversation with other members!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conversation) => {
                    const otherParticipantId = conversation.participants.find(id => id !== user?.uid);
                    const otherParticipantName = otherParticipantId ? conversation.participantNames[otherParticipantId] : 'Unknown';
                    const otherParticipantAvatar = otherParticipantId ? conversation.participantAvatars[otherParticipantId] : null;
                    const unreadCount = user ? conversation.unreadCount[user.uid] || 0 : 0;
                    const lastMessagePreview = conversation.lastMessage ?
                      (conversation.lastMessage.length > 50 ? conversation.lastMessage.substring(0, 50) + '...' : conversation.lastMessage)
                      : 'No messages yet';

                    return (
                      <Link
                        key={conversation.id}
                        href={`/messages?conversationId=${conversation.id}`}
                        className="block"
                      >
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={otherParticipantAvatar || undefined} alt={otherParticipantName} />
                            <AvatarFallback>
                              {otherParticipantName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold truncate">{otherParticipantName}</h3>
                              {conversation.lastMessageAt && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(conversation.lastMessageAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {lastMessagePreview}
                            </p>
                          </div>
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - My Tournaments and Recent Activity */}
            <div className="lg:col-span-2 space-y-8">
              {/* My Tournaments */}
              <Card className="glass hover:shadow-lg transition-all duration-300 border-green-200 dark:border-green-800">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
                  <CardTitle className="flex items-center text-green-900 dark:text-green-100">
                    <Trophy className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                    My Tournaments
                  </CardTitle>
                  <CardDescription className="text-green-700 dark:text-green-300">
                    Your tournament history and upcoming events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userTournaments.map((tournament) => (
                      <div key={tournament.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 rounded-lg border border-green-200 dark:border-green-800 hover:shadow-md transition-all">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{tournament.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            {new Date(tournament.date).toLocaleDateString()}
                          </p>
                          <Badge className="text-xs mt-1 bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                            {tournament.game === 'mario_kart' ? 'Mario Kart' : 'Super Smash Bros'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          {tournament.status === 'upcoming' && (
                            <Badge className="bg-green-600 text-white">
                              Upcoming
                            </Badge>
                          )}
                          {tournament.status === 'completed' && tournament.position && (
                            <Badge className="bg-yellow-500 text-white">
                              #{tournament.position} Place
                            </Badge>
                          )}
                          {tournament.points > 0 && (
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                              +{tournament.points} pts
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link href="/tournaments">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium">
                        View All Tournaments
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="glass hover:shadow-lg transition-all duration-300 border-yellow-200 dark:border-yellow-800">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10">
                  <CardTitle className="flex items-center text-yellow-900 dark:text-yellow-100">
                    <Activity className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-yellow-700 dark:text-yellow-300">
                    Your latest gaming achievements and activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-all">
                        <div className="flex-shrink-0">
                          {activity.type === 'tournament_win' && <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
                          {activity.type === 'achievement' && <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
                          {activity.type === 'registration' && <Gamepad2 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        {activity.points > 0 && (
                          <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                            +{activity.points} pts
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - Achievements, Game Stats, Quick Actions */}
            <div className="space-y-6">
              {/* Achievements */}
              <Card className="glass hover:shadow-lg transition-all duration-300 border-green-200 dark:border-green-800">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
                  <CardTitle className="flex items-center text-green-900 dark:text-green-100">
                    <Award className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                    Achievements
                  </CardTitle>
                  <CardDescription className="text-green-700 dark:text-green-300">
                    Your gaming milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          achievement.earned ? 'bg-green-500' : 'bg-muted'
                        }`}>
                          {achievement.earned ? (
                            <Star className="h-4 w-4 text-white" />
                          ) : (
                            <Star className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            achievement.earned ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {achievement.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Game Statistics */}
              <Card className="glass hover:shadow-lg transition-all duration-300 border-yellow-200 dark:border-yellow-800">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10">
                  <CardTitle className="flex items-center text-yellow-900 dark:text-yellow-100">
                    <Gamepad2 className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                    Game Statistics
                  </CardTitle>
                  <CardDescription className="text-yellow-700 dark:text-yellow-300">
                    Your performance by game
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gameStats.map((stat, index) => (
                      <div key={index} className="p-3 bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <h4 className="font-medium mb-2 text-foreground">{stat.game}</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Games:</span>
                            <span className="ml-1 font-medium text-foreground">{stat.gamesPlayed}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Wins:</span>
                            <span className="ml-1 font-medium text-foreground">{stat.wins}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Win Rate:</span>
                            <span className="ml-1 font-medium text-foreground">{stat.winRate}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Best:</span>
                            <span className="ml-1 font-medium text-foreground">#{stat.bestPosition}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="glass hover:shadow-lg transition-all duration-300 border-green-200 dark:border-green-800">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
                  <CardTitle className="flex items-center text-green-900 dark:text-green-100">
                    <Settings className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/tournaments" className="block">
                    <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white font-medium">
                      <Trophy className="mr-2 h-4 w-4" />
                      Browse Tournaments
                    </Button>
                  </Link>
                  <Link href="/leaderboard" className="block">
                    <Button className="w-full justify-start bg-yellow-500 hover:bg-yellow-600 text-white font-medium">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Leaderboard
                    </Button>
                  </Link>
                  <Link href="/profile" className="block">
                    <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white font-medium">
                      <Users className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
