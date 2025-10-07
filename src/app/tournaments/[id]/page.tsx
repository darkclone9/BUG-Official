'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Calendar, Users, Clock, Target } from 'lucide-react';
import Link from 'next/link';
import { getTournament, registerForTournament, unregisterFromTournament, getUser, getTournamentBracket, createTournamentBracket, updateMatchResult } from '@/lib/database';
import { Tournament, User } from '@/types/types';
import { TournamentBracket } from '@/types/bracket';
import { useAuth } from '@/contexts/AuthContext';
import { BracketVisualization } from '@/components/tournament/BracketVisualization';
import TournamentChat from '@/components/tournaments/TournamentChat';

export default function TournamentDetailPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<User[]>([]);
  const [bracket, setBracket] = useState<TournamentBracket | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [creatingBracket, setCreatingBracket] = useState(false);

  useEffect(() => {
    const loadTournamentData = async () => {
      try {
        setLoading(true);
        const tournamentData = await getTournament(tournamentId);

        if (tournamentData) {
          setTournament(tournamentData);

          // Check if current user is registered
          if (user && tournamentData.participants.includes(user.uid)) {
            setIsRegistered(true);
          }

          // Load participant details
          const participantDetails = await Promise.all(
            tournamentData.participants.map(async (participantId) => {
              const participantData = await getUser(participantId);
              return participantData;
            })
          );

          setParticipants(participantDetails.filter(p => p !== null) as User[]);

          // Load tournament bracket if it exists
          const bracketData = await getTournamentBracket(tournamentId);
          setBracket(bracketData);
        }
      } catch (error) {
        console.error('Error loading tournament data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTournamentData();
  }, [tournamentId, user]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleRegister = async () => {
    if (!user || !tournament) return;

    setRegistering(true);
    try {
      const registration = {
        id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tournamentId: tournament.id,
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        registeredAt: new Date(),
        status: 'registered' as const,
      };

      await registerForTournament(registration);

      // Refresh tournament data
      const updatedTournament = await getTournament(tournamentId);
      if (updatedTournament) {
        setTournament(updatedTournament);
        setIsRegistered(true);

        // Reload participant details
        const participantDetails = await Promise.all(
          updatedTournament.participants.map(async (participantId) => {
            const participantData = await getUser(participantId);
            return participantData;
          })
        );

        setParticipants(participantDetails.filter(p => p !== null) as User[]);
      }
    } catch (error) {
      console.error('Error registering for tournament:', error);
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!user || !tournament) return;

    setRegistering(true);
    try {
      await unregisterFromTournament(tournament.id, user.uid);

      // Refresh tournament data
      const updatedTournament = await getTournament(tournamentId);
      if (updatedTournament) {
        setTournament(updatedTournament);
        setIsRegistered(false);

        // Reload participant details
        const participantDetails = await Promise.all(
          updatedTournament.participants.map(async (participantId) => {
            const participantData = await getUser(participantId);
            return participantData;
          })
        );

        setParticipants(participantDetails.filter(p => p !== null) as User[]);
      }
    } catch (error) {
      console.error('Error unregistering from tournament:', error);
    } finally {
      setRegistering(false);
    }
  };

  const handleCreateBracket = async () => {
    if (!tournament || !user) return;

    setCreatingBracket(true);
    try {
      // Convert swiss format to round_robin for bracket generation
      const bracketFormat = tournament.format === 'swiss' ? 'round_robin' : tournament.format;

      const bracketData = await createTournamentBracket(
        tournament.id,
        bracketFormat as 'single_elimination' | 'double_elimination' | 'round_robin',
        tournament.participants
      );
      setBracket(bracketData);
    } catch (error) {
      console.error('Error creating bracket:', error);
    } finally {
      setCreatingBracket(false);
    }
  };

  const handleMatchUpdate = async (
    matchId: string,
    winnerId: string,
    score?: { player1: number; player2: number }
  ) => {
    try {
      await updateMatchResult(matchId, winnerId, score);

      // Refresh bracket data
      const updatedBracket = await getTournamentBracket(tournamentId);
      setBracket(updatedBracket);
    } catch (error) {
      console.error('Error updating match result:', error);
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
                <p className="text-muted-foreground">Loading tournament...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!tournament) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Tournament Not Found</h1>
              <p className="text-muted-foreground mb-4">The tournament you&apos;re looking for doesn&apos;t exist.</p>
              <Link href="/tournaments">
                <Button>Back to Tournaments</Button>
              </Link>
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  <Trophy className="inline h-10 w-10 mr-3 text-primary" />
                  {tournament.name}
                </h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  {getStatusBadge(tournament.status)}
                  <Badge variant="outline" className="border-primary text-primary">
                    {tournament.game === 'mario_kart' ? 'Mario Kart' : 'Super Smash Bros'}
                  </Badge>
                  <Badge variant="outline" className="border-accent text-accent">
                    {tournament.format.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {tournament.status === 'upcoming' && tournament.participants.length < tournament.maxParticipants && user && (
                  <>
                    {!isRegistered ? (
                      <Button
                        onClick={handleRegister}
                        disabled={registering}
                      >
                        {registering ? 'Registering...' : 'Register Now'}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleUnregister}
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        disabled={registering}
                      >
                        {registering ? 'Unregistering...' : 'Unregister'}
                      </Button>
                    )}
                  </>
                )}
                <Link href="/tournaments">
                  <Button variant="outline">
                    Back to Tournaments
                  </Button>
                </Link>
              </div>
            </div>
            <p className="text-xl text-muted-foreground">{tournament.description}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Tournament Info */}
            <div className="lg:col-span-2">
              <Card className="glass hover:shadow-lg transition-all duration-300 mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Tournament Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">Tournament Date:</span>
                        <span className="ml-2">{formatDate(tournament.date.toISOString())}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">Registration Deadline:</span>
                        <span className="ml-2">{formatDate(tournament.registrationDeadline.toISOString())}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">Participants:</span>
                        <span className="ml-2">
                          {tournament.participants}/{tournament.maxParticipants}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Points Awarded</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">1st Place:</span>
                            <span className="text-primary font-medium">{tournament.pointsAwarded.first} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">2nd Place:</span>
                            <span className="text-muted-foreground font-medium">{tournament.pointsAwarded.second} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">3rd Place:</span>
                            <span className="text-accent font-medium">{tournament.pointsAwarded.third} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Participation:</span>
                            <span className="text-accent font-medium">{tournament.pointsAwarded.participation} pts</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="font-medium mb-2">Rules</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {tournament.rules.map((rule, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Tournament Bracket */}
              <Card className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-accent" />
                    Tournament Bracket
                  </CardTitle>
                  <CardDescription>
                    {tournament.format.replace('_', ' ')} format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bracket ? (
                    <BracketVisualization
                      bracket={bracket}
                      participants={participants}
                      isAdmin={user?.role === 'admin'}
                      onMatchUpdate={handleMatchUpdate}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Tournament bracket not yet created</p>
                        <p className="text-sm">
                          {tournament.participants.length < 2
                            ? 'Need at least 2 participants to create bracket'
                            : 'Ready to generate tournament bracket'
                          }
                        </p>
                      </div>

                      {user?.role === 'admin' && tournament.participants.length >= 2 && (
                        <div className="flex justify-center">
                          <Button
                            onClick={handleCreateBracket}
                            disabled={creatingBracket}
                            className="flex items-center space-x-2"
                          >
                            <Target className="h-4 w-4" />
                            <span>{creatingBracket ? 'Creating Bracket...' : 'Create Tournament Bracket'}</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Registered Players */}
            <div>
              <Card className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Registered Players
                  </CardTitle>
                  <CardDescription>
                    {participants.length} players registered
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {participants.length > 0 ? (
                      participants.map((participant, index) => (
                        <Link
                          key={participant.uid}
                          href={`/profile/${participant.uid}`}
                          className="block"
                        >
                          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-medium text-primary-foreground">
                                {index + 1}
                              </div>
                            </div>
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {participant.displayName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium hover:text-primary transition-colors">{participant.displayName}</p>
                              <p className="text-xs text-muted-foreground">ELO: {participant.eloRating || 1200}</p>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No players registered yet</p>
                        <p className="text-sm">Be the first to join this tournament!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tournament Discussion */}
          <div className="mt-8">
            <TournamentChat
              tournamentId={tournamentId}
              isParticipant={isRegistered}
              isAdmin={user?.roles?.includes('admin') || false}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
