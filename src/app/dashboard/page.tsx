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
import { Activity, Award, Bell, Calendar, Crown, Edit, Gamepad2, Settings, Star, TrendingUp, Trophy, Users, MessageCircle } from 'lucide-react';
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
    { label: 'Total Points', value: user?.points || 0, icon: Star, color: 'text-yellow-400' },
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
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.avatar} alt={user?.displayName} />
                  <AvatarFallback className="text-lg">
                    {user?.displayName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Welcome back, {user?.displayName}!
                  </h1>
                  <p className="text-muted-foreground">
                    {user?.role === 'admin' ? 'Administrator' : 'Member'} • Joined {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
              <Link href="/profile/edit">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="glass hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 text-primary`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Announcements */}
          <Card className="glass hover:shadow-lg transition-all duration-300 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-primary" />
                Announcements
                <Badge variant="secondary" className="ml-2 bg-destructive text-destructive-foreground">
                  {announcements.filter(a => !a.read).length} new
                </Badge>
              </CardTitle>
              <CardDescription>
                Latest updates and important information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className={`p-4 rounded-lg border-l-4 ${
                    announcement.priority === 'urgent' ? 'border-destructive bg-destructive/10' :
                    announcement.priority === 'important' ? 'border-accent bg-accent/10' :
                    'border-primary bg-primary/10'
                  } ${!announcement.read ? 'ring-2 ring-primary/50' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{announcement.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant="outline" className="text-xs">
                          {announcement.priority}
                        </Badge>
                        {!announcement.read && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card className="glass hover:shadow-lg transition-all duration-300 mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                    Recent Messages
                  </CardTitle>
                  <CardDescription>
                    Your latest conversations
                  </CardDescription>
                </div>
                <Link href="/messages">
                  <Button variant="outline" size="sm">
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
              <Card className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-primary" />
                    My Tournaments
                  </CardTitle>
                  <CardDescription>
                    Your tournament history and upcoming events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userTournaments.map((tournament) => (
                      <div key={tournament.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{tournament.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            {new Date(tournament.date).toLocaleDateString()}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {tournament.game === 'mario_kart' ? 'Mario Kart' : 'Super Smash Bros'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          {tournament.status === 'upcoming' && (
                            <Badge variant="secondary" className="bg-primary text-primary-foreground">
                              Upcoming
                            </Badge>
                          )}
                          {tournament.status === 'completed' && tournament.position && (
                            <Badge variant="secondary" className="bg-accent text-accent-foreground">
                              #{tournament.position} Place
                            </Badge>
                          )}
                          {tournament.points > 0 && (
                            <span className="text-sm text-primary font-medium">
                              +{tournament.points} pts
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link href="/tournaments">
                      <Button variant="outline" className="w-full">
                        View All Tournaments
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-accent" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your latest gaming achievements and activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                        <div className="flex-shrink-0">
                          {activity.type === 'tournament_win' && <Crown className="h-5 w-5 text-primary" />}
                          {activity.type === 'achievement' && <Award className="h-5 w-5 text-accent" />}
                          {activity.type === 'registration' && <Gamepad2 className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        {activity.points > 0 && (
                          <div className="text-sm text-accent font-medium">
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
              <Card className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-accent" />
                    Achievements
                  </CardTitle>
                  <CardDescription>
                    Your gaming milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          achievement.earned ? 'bg-accent' : 'bg-muted'
                        }`}>
                          {achievement.earned ? (
                            <Star className="h-4 w-4 text-accent-foreground" />
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
              <Card className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gamepad2 className="h-5 w-5 mr-2 text-primary" />
                    Game Statistics
                  </CardTitle>
                  <CardDescription>
                    Your performance by game
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gameStats.map((stat, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">{stat.game}</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Games:</span>
                            <span className="ml-1">{stat.gamesPlayed}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Wins:</span>
                            <span className="ml-1">{stat.wins}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Win Rate:</span>
                            <span className="ml-1">{stat.winRate}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Best:</span>
                            <span className="ml-1">#{stat.bestPosition}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/tournaments" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Trophy className="mr-2 h-4 w-4" />
                      Browse Tournaments
                    </Button>
                  </Link>
                  <Link href="/leaderboard" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Leaderboard
                    </Button>
                  </Link>
                  <Link href="/profile" className="block">
                    <Button variant="outline" className="w-full justify-start">
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
