'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, Star, Gamepad2, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import { getUpcomingTournaments, getTopUsers } from '@/lib/firebase';

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentWinners, setRecentWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournaments, topUsers] = await Promise.all([
          getUpcomingTournaments(3),
          getTopUsers(3)
        ]);
        
        setUpcomingEvents(tournaments);
        setRecentWinners(topUsers);
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

      {/* Upcoming Events */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8 md:mb-12">
            Upcoming Events
          </h2>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="glass">
                  <CardHeader className="p-4 md:p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="glass hover:shadow-lg transition-all duration-300">
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base md:text-lg">{event.title}</CardTitle>
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs">
                          {event.pointsAwarded || 100} pts
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {event.game === 'mario_kart' ? 'Mario Kart' : 'Super Smash Bros'}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      {new Date(event.date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>
                        <Users className="inline h-4 w-4 mr-1" />
                        {event.participants || 0}/{event.maxParticipants || 16} players
                      </span>
                      <span className="text-primary font-medium">
                        {(event.maxParticipants || 16) - (event.participants || 0)} spots left
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No upcoming tournaments</h3>
              <p className="text-muted-foreground mb-4">Check back later for new tournaments!</p>
            </div>
          )}
          <div className="text-center mt-8">
            <Link href="/tournaments">
              <Button variant="outline">
                View All Tournaments
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Winners */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8 md:mb-12">
            Recent Champions
          </h2>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="glass">
                  <CardHeader className="p-4 md:p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : recentWinners.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentWinners.map((winner, index) => (
                <Card key={winner.id || index} className="glass hover:shadow-lg transition-all duration-300">
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {index === 0 && <Trophy className="h-6 w-6 md:h-8 md:w-8 text-primary" />}
                        {index === 1 && <Trophy className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />}
                        {index === 2 && <Trophy className="h-6 w-6 md:h-8 md:w-8 text-accent" />}
                      </div>
                      <div>
                        <CardTitle className="text-base md:text-lg">{winner.displayName || winner.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {winner.tournament || 'Top Player'}
                        </CardDescription>
                        <Badge variant="outline" className="text-xs mt-1">
                          {winner.game === 'mario_kart' ? 'Mario Kart' : 'Super Smash Bros'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
                    <div className="flex items-center text-sm text-primary">
                      <Star className="h-4 w-4 mr-1" />
                      {winner.points || 0} points earned
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No champions yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to compete and earn points!</p>
            </div>
          )}
          <div className="text-center mt-8">
            <Link href="/leaderboard">
              <Button variant="outline">
                View Full Leaderboard
              </Button>
            </Link>
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
