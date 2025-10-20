'use client';

import { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Calendar, Users, Clock, Search, Flame, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getTournaments } from '@/lib/database';
import { Tournament, GameType } from '@/types/types';

type TournamentWithParticipantCount = Omit<Tournament, 'participants' | 'date' | 'registrationDeadline'> & {
  participants: number;
  date: string;
  registrationDeadline: string;
};

export default function TournamentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all');
  const [tournaments, setTournaments] = useState<TournamentWithParticipantCount[]>([]);
  const [loading, setLoading] = useState(true);
  const tournamentsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        setLoading(true);
        const gameType = gameFilter === 'all' ? undefined : gameFilter as GameType;
        const status = statusFilter === 'all' ? undefined : statusFilter;

        const data = await getTournaments(gameType, status);
        setTournaments(data.map(t => ({
          ...t,
          participants: t.participants?.length || 0,
          date: t.date.toISOString().split('T')[0],
          registrationDeadline: t.registrationDeadline.toISOString().split('T')[0]
        })));
      } catch (error) {
        console.error('Error loading tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTournaments();
  }, [statusFilter, gameFilter]);

  const handleBrowseTournaments = () => {
    tournamentsListRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    const matchesGame = gameFilter === 'all' || tournament.game === gameFilter;

    return matchesSearch && matchesStatus && matchesGame;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case 'ongoing':
        return <Badge className="bg-green-100 text-green-800">Ongoing</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getGameIcon = (game: string) => {
    switch (game) {
      case 'mario_kart':
        return '🏎️';
      case 'super_smash_bros':
        return '🥊';
      default:
        return '🎮';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading tournaments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get featured tournaments (upcoming with most participants)
  const featuredTournaments = tournaments
    .filter(t => t.status === 'upcoming')
    .sort((a, b) => b.participants - a.participants)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-yellow-400 via-yellow-500 to-green-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Trophy className="h-12 w-12 mr-3" />
              <h1 className="text-5xl sm:text-6xl font-bold">Tournaments</h1>
            </div>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Compete with fellow gamers, prove your skills, and win amazing prizes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-primary font-semibold" onClick={handleBrowseTournaments}>
                Browse Tournaments
              </Button>
              <Link href="/tournaments/rules">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Rules
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Tournaments Section */}
        {featuredTournaments.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Flame className="h-6 w-6 text-orange-500 mr-2" />
              <h2 className="text-3xl font-bold text-foreground">Featured Tournaments</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredTournaments.map((tournament) => (
                <Card key={tournament.id} className="hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  {tournament.imageUrl && (
                    <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-primary to-purple-600">
                      <img
                        src={tournament.imageUrl}
                        alt={tournament.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Badge className="bg-orange-500 text-white flex items-center gap-1">
                          <Flame className="h-3 w-3" /> Featured
                        </Badge>
                        {getStatusBadge(tournament.status)}
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-3xl">{getGameIcon(tournament.game)}</span>
                        <div>
                          <CardTitle className="text-lg">{tournament.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {tournament.game === 'mario_kart' ? 'Mario Kart 8 Deluxe' :
                             tournament.game === 'super_smash_bros' ? 'Super Smash Bros Ultimate' :
                             tournament.game}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tournament.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span>{formatDate(tournament.date)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-semibold">{tournament.participants}/{tournament.maxParticipants}</span>
                        <span className="text-muted-foreground ml-1">participants</span>
                      </div>
                    </div>
                    <Link href={`/tournaments/${tournament.id}`} className="block">
                      <Button className="w-full group/btn">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">All Tournaments</h2>
          <p className="text-muted-foreground">
            Browse all available tournaments and find one that matches your skill level
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
              <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{tournaments.length}</div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                All tournaments
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">{tournaments.filter(t => t.status === 'upcoming').length}</div>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Ready to join
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ongoing</CardTitle>
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{tournaments.filter(t => t.status === 'ongoing').length}</div>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{tournaments.filter(t => t.status === 'completed').length}</div>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                Finished tournaments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Find Your Tournament</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={gameFilter} onValueChange={setGameFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Filter by game" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                <SelectItem value="mario_kart">🏎️ Mario Kart</SelectItem>
                <SelectItem value="super_smash_bros">🥊 Super Smash Bros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tournaments Grid */}
        <div ref={tournamentsListRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <Card key={tournament.id} className="hover:shadow-2xl transition-all duration-300 overflow-hidden group border-0">
              {tournament.imageUrl && (
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary to-purple-600">
                  <img
                    src={tournament.imageUrl}
                    alt={tournament.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(tournament.status)}
                  </div>
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getGameIcon(tournament.game)}</span>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{tournament.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {tournament.game === 'mario_kart' ? 'Mario Kart 8 Deluxe' :
                         tournament.game === 'super_smash_bros' ? 'Super Smash Bros Ultimate' :
                         tournament.game}
                      </CardDescription>
                    </div>
                  </div>
                  {!tournament.imageUrl && getStatusBadge(tournament.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {tournament.description}
                </p>

                <div className="space-y-3 bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center text-sm font-medium">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <span>{formatDate(tournament.date)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center font-medium">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      <span>{tournament.participants}/{tournament.maxParticipants}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((tournament.participants / tournament.maxParticipants) * 100)}% full
                    </div>
                  </div>

                  <div className="flex items-center text-sm font-medium">
                    <Trophy className="h-4 w-4 mr-2 text-primary" />
                    <span className="capitalize">{tournament.format.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-3">
                    Registration closes: {formatDate(tournament.registrationDeadline)}
                  </p>
                  <Link href={`/tournaments/${tournament.id}`} className="block">
                    <Button className="w-full group/btn">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tournaments found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
