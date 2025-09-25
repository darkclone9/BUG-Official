'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Calendar, Users, Clock, Search } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            <Trophy className="inline h-10 w-10 mr-3 text-primary" />
            Tournaments
          </h1>
          <p className="text-xl text-muted-foreground">
            Join exciting tournaments and compete with fellow gamers
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tournaments.length}</div>
              <p className="text-xs text-muted-foreground">
                All tournaments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tournaments.filter(t => t.status === 'upcoming').length}</div>
              <p className="text-xs text-muted-foreground">
                Ready to join
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ongoing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tournaments.filter(t => t.status === 'ongoing').length}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tournaments.filter(t => t.status === 'completed').length}</div>
              <p className="text-xs text-muted-foreground">
                Finished tournaments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tournaments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
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

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getGameIcon(tournament.game)}</span>
                    <div>
                      <CardTitle className="text-lg">{tournament.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {tournament.game === 'mario_kart' ? 'Mario Kart 8 Deluxe' : 
                         tournament.game === 'super_smash_bros' ? 'Super Smash Bros Ultimate' : 
                         tournament.game}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(tournament.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {tournament.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatDate(tournament.date)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{tournament.participants} / {tournament.maxParticipants} participants</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Trophy className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{tournament.format.replace('_', ' ')} format</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Registration closes: {formatDate(tournament.registrationDeadline)}
                  </div>
                  <Link href={`/tournaments/${tournament.id}`}>
                    <Button size="sm">
                      View Details
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