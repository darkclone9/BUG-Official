'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Settings, 
  Trophy, 
  Bell, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Gamepad2,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  getAdminOverviewStats, 
  getTournaments, 
  getAnnouncements, 
  getAllUsers,
  promoteUserToAdmin,
  demoteAdminToUser
} from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotingUser, setPromotingUser] = useState<string | null>(null);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);
        const [stats, tournamentsData, announcementsData, usersData] = await Promise.all([
          getAdminOverviewStats(),
          getTournaments(),
          getAnnouncements(false),
          getAllUsers()
        ]);
        
        setOverviewStats(stats);
        setTournaments(tournamentsData.map(t => ({
          ...t,
          participants: t.participants?.length || 0,
          date: t.date.toISOString().split('T')[0]
        })));
        setAnnouncements(announcementsData.map(a => ({
          ...a,
          createdAt: a.createdAt.toISOString().split('T')[0],
          readBy: a.readBy?.length || 0
        })));
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const handlePromoteToAdmin = async (userId: string) => {
    if (!user) return;
    
    try {
      setPromotingUser(userId);
      await promoteUserToAdmin(userId, user.uid);
      
      // Refresh users data
      const usersData = await getAllUsers();
      setUsers(usersData);
      
      // Show success message (you could add a toast notification here)
      console.log('User promoted to admin successfully');
    } catch (error) {
      console.error('Error promoting user to admin:', error);
    } finally {
      setPromotingUser(null);
    }
  };

  const handleDemoteFromAdmin = async (userId: string) => {
    try {
      setPromotingUser(userId);
      await demoteAdminToUser(userId);
      
      // Refresh users data
      const usersData = await getAllUsers();
      setUsers(usersData);
      
      // Show success message (you could add a toast notification here)
      console.log('Admin demoted to user successfully');
    } catch (error) {
      console.error('Error demoting admin to user:', error);
    } finally {
      setPromotingUser(null);
    }
  };

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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-destructive text-destructive-foreground">Urgent</Badge>;
      case 'important':
        return <Badge className="bg-accent text-accent-foreground">Important</Badge>;
      case 'normal':
        return <Badge className="bg-primary text-primary-foreground">Normal</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading admin data...</p>
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              <Settings className="inline h-10 w-10 mr-3 text-primary" />
              Admin Panel
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage tournaments, announcements, and community settings
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <Card className="glass hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{overviewStats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{overviewStats.activeUsers}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tournaments</p>
                    <p className="text-2xl font-bold">{overviewStats.totalTournaments}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                    <p className="text-2xl font-bold">{overviewStats.upcomingTournaments}</p>
                  </div>
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Announcements</p>
                    <p className="text-2xl font-bold">{overviewStats.totalAnnouncements}</p>
                  </div>
                  <Bell className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unread</p>
                    <p className="text-2xl font-bold">{overviewStats.unreadAnnouncements}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                Overview
              </TabsTrigger>
              <TabsTrigger value="tournaments">
                Tournaments
              </TabsTrigger>
              <TabsTrigger value="announcements">
                Announcements
              </TabsTrigger>
              <TabsTrigger value="users">
                Users
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Tournaments */}
                <Card className="bg-slate-800/50 border-slate-700 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                      Recent Tournaments
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Latest tournament activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tournaments.slice(0, 3).map((tournament) => (
                        <div key={tournament.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{tournament.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {tournament.game === 'mario_kart' ? 'Mario Kart' : 'Super Smash Bros'}
                              </Badge>
                              {getStatusBadge(tournament.status)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">
                              {tournament.participants}/{tournament.maxParticipants}
                            </div>
                            <div className="text-xs text-gray-500">participants</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Announcements */}
                <Card className="bg-slate-800/50 border-slate-700 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-blue-400" />
                      Recent Announcements
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Latest community updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {announcements.slice(0, 3).map((announcement) => (
                        <div key={announcement.id} className="p-3 bg-slate-700/50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-white">{announcement.title}</h4>
                              <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                                {announcement.content}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(announcement.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="ml-4">
                              {getPriorityBadge(announcement.priority)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tournaments Tab */}
            <TabsContent value="tournaments" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700 text-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                        Tournament Management
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Create and manage tournaments
                      </CardDescription>
                    </div>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Tournament
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-gray-300">Tournament</TableHead>
                        <TableHead className="text-gray-300">Game</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Participants</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tournaments.map((tournament) => (
                        <TableRow key={tournament.id} className="border-slate-700">
                          <TableCell className="text-white">{tournament.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {tournament.game === 'mario_kart' ? 'Mario Kart' : 'Super Smash Bros'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(tournament.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {tournament.participants}/{tournament.maxParticipants}
                          </TableCell>
                          <TableCell>{getStatusBadge(tournament.status)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Announcements Tab */}
            <TabsContent value="announcements" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700 text-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Bell className="h-5 w-5 mr-2 text-blue-400" />
                        Announcement Management
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Create and manage community announcements
                      </CardDescription>
                    </div>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Announcement
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-white">{announcement.title}</h4>
                              {getPriorityBadge(announcement.priority)}
                              <Badge variant="outline" className="text-xs">
                                {announcement.readBy} reads
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">{announcement.content}</p>
                            <p className="text-xs text-gray-400">
                              Created {new Date(announcement.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button size="sm" variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-400" />
                    User Management
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage user accounts and admin permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Email</TableHead>
                        <TableHead className="text-gray-300">Role</TableHead>
                        <TableHead className="text-gray-300">Points</TableHead>
                        <TableHead className="text-gray-300">Join Date</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userData) => (
                        <TableRow key={userData.uid} className="border-slate-700">
                          <TableCell className="text-white">
                            <div className="flex items-center space-x-3">
                              {userData.avatar ? (
                                <img 
                                  src={userData.avatar} 
                                  alt={userData.displayName}
                                  className="h-8 w-8 rounded-full"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center">
                                  <span className="text-sm font-medium">
                                    {userData.displayName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <span>{userData.displayName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">{userData.email}</TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                userData.role === 'admin' 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-blue-600 text-white'
                              }
                            >
                              {userData.role === 'admin' ? 'Admin' : 'Member'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">{userData.points}</TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(userData.joinDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {userData.role === 'admin' ? (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                                  onClick={() => handleDemoteFromAdmin(userData.uid)}
                                  disabled={promotingUser === userData.uid}
                                >
                                  {promotingUser === userData.uid ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                                  ) : (
                                    <Users className="h-3 w-3 mr-1" />
                                  )}
                                  Demote
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                                  onClick={() => handlePromoteToAdmin(userData.uid)}
                                  disabled={promotingUser === userData.uid}
                                >
                                  {promotingUser === userData.uid ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                                  ) : (
                                    <Users className="h-3 w-3 mr-1" />
                                  )}
                                  Promote to Admin
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}