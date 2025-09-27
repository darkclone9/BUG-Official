'use client';

import AdminSettings from '@/components/admin/AdminSettings';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import CreateAnnouncementModal from '@/components/admin/CreateAnnouncementModal';
import CreateTournamentModal from '@/components/admin/CreateTournamentModal';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';
import EditAnnouncementModal from '@/components/admin/EditAnnouncementModal';
import EditTournamentModal from '@/components/admin/EditTournamentModal';
import GameGenreManagement from '@/components/admin/GameGenreManagement';
import EloManagement from '@/components/admin/EloManagement';
import PointsManagement from '@/components/admin/PointsManagement';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import {
    deleteAnnouncement,
    deleteTournament,
    demoteAdminToUser,
    getAdminOverviewStats,
    getAllUsers,
    getAnnouncements,
    getTournaments,
    promoteUserToAdmin
} from '@/lib/database';
import { Announcement, Tournament, User } from '@/types/types';
import {
    AlertTriangle,
    Bell,
    CheckCircle,
    Clock,
    Edit,
    Plus,
    Settings,
    Trash2,
    Trophy,
    Users
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type TournamentWithParticipantCount = Omit<Tournament, 'participants' | 'date'> & {
  participants: number;
  date: string;
};
type AnnouncementWithReadCount = Omit<Announcement, 'createdAt' | 'readBy'> & {
  createdAt: string;
  readBy: number;
};

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewStats, setOverviewStats] = useState<{
    totalUsers: number;
    activeUsers: number;
    totalTournaments: number;
    upcomingTournaments: number;
    totalAnnouncements: number;
    unreadAnnouncements: number;
  } | null>(null);
  const [tournaments, setTournaments] = useState<TournamentWithParticipantCount[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementWithReadCount[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotingUser, setPromotingUser] = useState<string | null>(null);

  // Modal states
  const [createTournamentModalOpen, setCreateTournamentModalOpen] = useState(false);
  const [createAnnouncementModalOpen, setCreateAnnouncementModalOpen] = useState(false);
  const [editTournamentModalOpen, setEditTournamentModalOpen] = useState(false);
  const [editAnnouncementModalOpen, setEditAnnouncementModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ type: 'tournament' | 'announcement'; id: string; name: string } | null>(null);

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

  const handleCreateTournament = () => {
    setCreateTournamentModalOpen(true);
  };

  const handleCreateAnnouncement = () => {
    setCreateAnnouncementModalOpen(true);
  };

  const handleEditTournament = (tournament: TournamentWithParticipantCount) => {
    // Convert back to Tournament type for the modal
    const tournamentForModal: Tournament = {
      ...tournament,
      date: new Date(tournament.date),
      participants: []
    };
    setSelectedTournament(tournamentForModal);
    setEditTournamentModalOpen(true);
  };

  const handleEditAnnouncement = (announcement: AnnouncementWithReadCount) => {
    // Convert back to Announcement type for the modal
    const announcementForModal: Announcement = {
      ...announcement,
      createdAt: new Date(announcement.createdAt),
      readBy: []
    };
    setSelectedAnnouncement(announcementForModal);
    setEditAnnouncementModalOpen(true);
  };

  const handleDeleteTournament = (tournament: TournamentWithParticipantCount) => {
    setDeleteItem({ type: 'tournament', id: tournament.id, name: tournament.name });
    setDeleteModalOpen(true);
  };

  const handleDeleteAnnouncement = (announcement: AnnouncementWithReadCount) => {
    setDeleteItem({ type: 'announcement', id: announcement.id, name: announcement.title });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    try {
      if (deleteItem.type === 'tournament') {
        await deleteTournament(deleteItem.id);
        console.log('Tournament deleted:', deleteItem.id);
      } else {
        await deleteAnnouncement(deleteItem.id);
        console.log('Announcement deleted:', deleteItem.id);
      }

      // Refresh data
      const [tournamentsData, announcementsData] = await Promise.all([
        getTournaments(),
        getAnnouncements(false)
      ]);

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

      setDeleteModalOpen(false);
      setDeleteItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleModalSuccess = async () => {
    // Refresh data after successful creation/update
    const [tournamentsData, announcementsData] = await Promise.all([
      getTournaments(),
      getAnnouncements(false)
    ]);

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
      case 'broadcast':
        return <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">Broadcast</Badge>;
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
                    <p className="text-2xl font-bold">{overviewStats?.totalUsers || 0}</p>
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
                    <p className="text-2xl font-bold">{overviewStats?.activeUsers || 0}</p>
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
                    <p className="text-2xl font-bold">{overviewStats?.totalTournaments || 0}</p>
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
                    <p className="text-2xl font-bold">{overviewStats?.upcomingTournaments || 0}</p>
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
                    <p className="text-2xl font-bold">{overviewStats?.totalAnnouncements || 0}</p>
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
                    <p className="text-2xl font-bold">{overviewStats?.unreadAnnouncements || 0}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-9">
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
              <TabsTrigger value="games">
                Games
              </TabsTrigger>
              <TabsTrigger value="analytics">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="points">
                Points
              </TabsTrigger>
              <TabsTrigger value="elo">
                ELO System
              </TabsTrigger>
              <TabsTrigger value="settings">
                Settings
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
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={handleCreateTournament}
                    >
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
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-600 text-white hover:bg-slate-700"
                                onClick={() => handleEditTournament(tournament)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                onClick={() => handleDeleteTournament(tournament)}
                              >
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
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={handleCreateAnnouncement}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Announcement
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Broadcast Announcements Section */}
                    {announcements.filter(a => a.isActive && a.priority === 'broadcast').length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-purple-300 mb-4 flex items-center">
                          <span className="w-3 h-3 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
                          Broadcast Announcements
                        </h3>
                        <div className="space-y-4">
                          {announcements.filter(a => a.isActive && a.priority === 'broadcast').map((announcement) => (
                            <div key={announcement.id} className="p-4 bg-gradient-to-r from-purple-700/30 to-indigo-700/30 rounded-lg border border-purple-500/20">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="font-medium text-white">{announcement.title}</h4>
                                    {getPriorityBadge(announcement.priority)}
                                    <Badge variant="outline" className="text-xs">
                                      {announcement.readBy} reads
                                    </Badge>
                                    <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500">
                                      Active
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-300 mb-2">{announcement.content}</p>
                                  <p className="text-xs text-gray-400">
                                    Created {new Date(announcement.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-600 text-white hover:bg-slate-700"
                                    onClick={() => handleEditAnnouncement(announcement)}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                    onClick={() => handleDeleteAnnouncement(announcement)}
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Regular Announcements Section */}
                    {announcements.filter(a => a.isActive && a.priority !== 'broadcast').length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-300 mb-4">Regular Announcements</h3>
                        <div className="space-y-4">
                          {announcements.filter(a => a.isActive && a.priority !== 'broadcast').map((announcement) => (
                      <div key={announcement.id} className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-white">{announcement.title}</h4>
                              {getPriorityBadge(announcement.priority)}
                              <Badge variant="outline" className="text-xs">
                                {announcement.readBy} reads
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500">
                                Active
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">{announcement.content}</p>
                            <p className="text-xs text-gray-400">
                              Created {new Date(announcement.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-white hover:bg-slate-700"
                              onClick={() => handleEditAnnouncement(announcement)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              onClick={() => handleDeleteAnnouncement(announcement)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Inactive Announcements Section */}
                    {announcements.filter(a => !a.isActive).length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-300 mb-4">Inactive Announcements</h3>
                        <div className="space-y-4">
                          {announcements.filter(a => !a.isActive).map((announcement) => (
                            <div key={announcement.id} className="p-4 bg-slate-700/30 rounded-lg opacity-60">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="font-medium text-gray-400">{announcement.title}</h4>
                                    {getPriorityBadge(announcement.priority)}
                                    <Badge variant="outline" className="text-xs">
                                      {announcement.readBy} reads
                                    </Badge>
                                    <Badge variant="outline" className="text-xs bg-red-500/20 text-red-400 border-red-500">
                                      Inactive
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-400 mb-2">{announcement.content}</p>
                                  <p className="text-xs text-gray-500">
                                    Created {new Date(announcement.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-600 text-gray-400 hover:bg-slate-700"
                                    onClick={() => handleEditAnnouncement(announcement)}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                                <Image
                                  src={userData.avatar}
                                  alt={userData.displayName}
                                  width={32}
                                  height={32}
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

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsDashboard />
            </TabsContent>

            {/* Points Tab */}
            <TabsContent value="points" className="space-y-6">
              <PointsManagement />
            </TabsContent>

            {/* ELO System Tab */}
            <TabsContent value="elo" className="space-y-6">
              <EloManagement />
            </TabsContent>

            {/* Games Tab */}
            <TabsContent value="games" className="space-y-6">
              <GameGenreManagement />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <AdminSettings />
            </TabsContent>

          </Tabs>
        </div>

        {/* Modals */}
        <CreateTournamentModal
          isOpen={createTournamentModalOpen}
          onClose={() => setCreateTournamentModalOpen(false)}
          onSuccess={handleModalSuccess}
        />

        <CreateAnnouncementModal
          isOpen={createAnnouncementModalOpen}
          onClose={() => setCreateAnnouncementModalOpen(false)}
          onSuccess={handleModalSuccess}
          authorId={user?.uid || ''}
          authorName={user?.displayName || 'Admin'}
        />

        <EditTournamentModal
          isOpen={editTournamentModalOpen}
          onClose={() => {
            setEditTournamentModalOpen(false);
            setSelectedTournament(null);
          }}
          onSuccess={handleModalSuccess}
          tournament={selectedTournament}
        />

        <EditAnnouncementModal
          isOpen={editAnnouncementModalOpen}
          onClose={() => {
            setEditAnnouncementModalOpen(false);
            setSelectedAnnouncement(null);
          }}
          onSuccess={handleModalSuccess}
          announcement={selectedAnnouncement}
        />

        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setDeleteItem(null);
          }}
          onConfirm={handleConfirmDelete}
          title={`Delete ${deleteItem?.type === 'tournament' ? 'Tournament' : 'Announcement'}`}
          description={`Are you sure you want to delete this ${deleteItem?.type}? This action cannot be undone.`}
          itemName={deleteItem?.name || ''}
        />

      </div>
    </ProtectedRoute>
  );
}
