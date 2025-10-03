'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, Star, Gamepad2, Target, Zap, MapPin } from 'lucide-react';
import Link from 'next/link';
import { getUpcomingTournaments, getTopUsers } from '@/lib/firebase';
import { getUpcomingPublishedEvents } from '@/lib/database';
import { ClubEvent } from '@/types/types';

type TournamentData = {
  id: string;
  name: string;
  date: string;
  game: string;
  participants: number;
  maxParticipants: number;
  pointsAwarded?: number;
};

type UserData = {
  id: string;
  displayName: string;
  points: number;
  avatar?: string;
  tournament?: string;
  game?: string;
};

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState<TournamentData[]>([]);
  const [clubEvents, setClubEvents] = useState<ClubEvent[]>([]);
  const [recentWinners, setRecentWinners] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournaments, topUsers, events] = await Promise.all([
          getUpcomingTournaments(3),
          getTopUsers(3),
          getUpcomingPublishedEvents(6)
        ]);

        setUpcomingEvents(tournaments as unknown as TournamentData[]);
        setRecentWinners(topUsers as unknown as UserData[]);
        setClubEvents(events);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-4 md:mb-6">
            Welcome to the
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              {' '}Gaming Club
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto">
            Compete in Mario Kart and Super Smash Bros tournaments, climb the leaderboards, and prove your skills.
            Earn points, track your statistics, and become a legend in our gaming community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full px-6 md:px-8 py-3">
                <Gamepad2 className="mr-2 h-5 w-5" />
                Join Now
              </Button>
            </Link>
            <Link href="/tournaments" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full px-6 md:px-8 py-3">
                <Trophy className="mr-2 h-5 w-5" />
                View Tournaments
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8 md:mb-12">
            Why Join Our Gaming Club?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="glass hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Trophy className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Epic Tournaments</CardTitle>
                <CardDescription>
                  Compete in Mario Kart and Super Smash Bros tournaments with comprehensive tracking and recognition.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="glass hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Target className="h-12 w-12 text-accent mb-4" />
                <CardTitle>Points System</CardTitle>
                <CardDescription>
                  Earn points for participation, wins, and achievements. Climb the leaderboards and show your skills.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="glass hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Gaming Community</CardTitle>
                <CardDescription>
                  Connect with fellow gamers, share strategies, and build lasting friendships in our community.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Consolidated What's Happening Section - Horizontal 3-Column Layout */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8 md:mb-12">
            What&apos;s Happening
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Column 1: Upcoming Club Events */}
            <div className="flex flex-col">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Upcoming Club Events
              </h3>
              <div className="flex-1 space-y-3">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="glass">
                        <CardHeader className="p-3">
                          <div className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </>
                ) : clubEvents.length > 0 ? (
                  <>
                    {clubEvents.slice(0, 3).map((event) => (
                      <Card key={event.id} className="glass hover:shadow-lg transition-all duration-300">
                        <CardHeader className="p-3">
                          <div className="flex justify-between items-start mb-1">
                            <CardTitle className="text-sm line-clamp-1">{event.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                              {event.eventType.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs space-y-1">
                            <div className="flex items-center">
                              <Calendar className="inline h-3 w-3 mr-1" />
                              {new Date(event.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="inline h-3 w-3 mr-1" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No upcoming events</p>
                  </div>
                )}
              </div>
              <div className="text-center mt-4">
                <Link href="/events">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Events
                  </Button>
                </Link>
              </div>
            </div>

            {/* Column 2: Upcoming Tournaments */}
            <div className="flex flex-col">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-primary" />
                Upcoming Tournaments
              </h3>
              <div className="flex-1 space-y-3">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="glass">
                        <CardHeader className="p-3">
                          <div className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </>
                ) : upcomingEvents.length > 0 ? (
                  <>
                    {upcomingEvents.slice(0, 3).map((event) => (
                      <Card key={event.id} className="glass hover:shadow-lg transition-all duration-300">
                        <CardHeader className="p-3">
                          <div className="flex justify-between items-start mb-1">
                            <CardTitle className="text-sm line-clamp-1">{event.name}</CardTitle>
                            <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs shrink-0 ml-2">
                              {event.pointsAwarded || 100} pts
                            </Badge>
                          </div>
                          <CardDescription className="text-xs space-y-1">
                            <div className="flex items-center">
                              <Calendar className="inline h-3 w-3 mr-1" />
                              {new Date(event.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center">
                              <Gamepad2 className="inline h-3 w-3 mr-1" />
                              {event.game === 'mario_kart' ? 'Mario Kart' : 'Super Smash Bros'}
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Users className="inline h-3 w-3 mr-1" />
                              {event.participants || 0}/{event.maxParticipants || 16}
                            </div>
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No upcoming tournaments</p>
                  </div>
                )}
              </div>
              <div className="text-center mt-4">
                <Link href="/tournaments">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Tournaments
                  </Button>
                </Link>
              </div>
            </div>

            {/* Column 3: Recent Champions */}
            <div className="flex flex-col">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-primary" />
                Recent Champions
              </h3>
              <div className="flex-1 space-y-3">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="glass">
                        <CardHeader className="p-3">
                          <div className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </>
                ) : recentWinners.length > 0 ? (
                  <>
                    {recentWinners.slice(0, 3).map((winner, index) => (
                      <Card key={winner.id || index} className="glass hover:shadow-lg transition-all duration-300">
                        <CardHeader className="p-3">
                          <div className="flex items-center space-x-2">
                            <div className="flex-shrink-0">
                              {index === 0 && <Trophy className="h-5 w-5 text-primary" />}
                              {index === 1 && <Trophy className="h-5 w-5 text-muted-foreground" />}
                              {index === 2 && <Trophy className="h-5 w-5 text-accent" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm line-clamp-1">{winner.displayName}</CardTitle>
                              <CardDescription className="text-xs line-clamp-1">
                                {winner.tournament || 'Top Player'}
                              </CardDescription>
                              <div className="flex items-center text-xs text-primary mt-1">
                                <Star className="h-3 w-3 mr-1" />
                                {winner.points || 0} pts
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No champions yet</p>
                  </div>
                )}
              </div>
              <div className="text-center mt-4">
                <Link href="/leaderboard">
                  <Button variant="outline" size="sm" className="w-full">
                    View Full Leaderboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">
            Ready to Start Your Gaming Journey?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto">
            Join thousands of gamers competing in tournaments, earning points, and building their legacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90 px-6 md:px-8 py-3">
                <Zap className="mr-2 h-5 w-5" />
                Get Started Now
              </Button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-white text-white hover:bg-white hover:text-primary px-6 md:px-8 py-3">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 text-muted-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Gaming Club</span>
          </div>
          <p className="text-muted-foreground mb-4">
            The ultimate destination for competitive gaming and community building.
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
