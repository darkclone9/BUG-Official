'use client';

import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Calendar, Target, Gamepad2, Heart } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6">
            About BUG Gaming Club
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Building a vibrant community of gamers through competitive tournaments,
            social events, and shared passion for gaming.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
            Our Mission
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-8">
            BUG Gaming Club is dedicated to creating an inclusive, competitive, and fun environment
            for gamers of all skill levels. We believe in the power of gaming to bring people together,
            foster friendships, and create memorable experiences.
          </p>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 md:mb-12 text-center">
            What We Offer
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="glass hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Trophy className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Competitive Tournaments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Regular Mario Kart and Super Smash Bros tournaments with comprehensive
                  bracket systems, ELO ratings, and point tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="glass hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Club Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Social gatherings, workshops, game nights, and special events designed
                  to bring our community together beyond competition.
                </p>
              </CardContent>
            </Card>

            <Card className="glass hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Vibrant Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with fellow gamers, share strategies, make friends, and be part
                  of a supportive gaming community.
                </p>
              </CardContent>
            </Card>

            <Card className="glass hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Target className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Points & Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Earn points through participation and victories, climb the leaderboards,
                  and track your progress over time.
                </p>
              </CardContent>
            </Card>

            <Card className="glass hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Gamepad2 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Multiple Games</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Compete in your favorite games including Mario Kart 8 Deluxe and
                  Super Smash Bros Ultimate, with more games coming soon.
                </p>
              </CardContent>
            </Card>

            <Card className="glass hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Heart className="h-12 w-12 text-primary mb-4" />
                <CardTitle>All Skill Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Whether you&apos;re a casual player or a competitive gamer, everyone is
                  welcome to join and enjoy our events.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            Our Values
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Inclusivity</h3>
              <p className="text-muted-foreground">
                We welcome gamers of all backgrounds, skill levels, and experience. Everyone
                deserves a place in our community.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Fair Play</h3>
              <p className="text-muted-foreground">
                We promote sportsmanship, respect, and fair competition in all our tournaments
                and events.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Community First</h3>
              <p className="text-muted-foreground">
                Our members are at the heart of everything we do. We prioritize creating
                meaningful connections and lasting friendships.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Continuous Improvement</h3>
              <p className="text-muted-foreground">
                We&apos;re always looking for ways to enhance our platform, add new features,
                and improve the gaming experience for our members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
            Our Story
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            BUG Gaming Club was founded by a group of passionate gamers who wanted to create
            a space where competitive gaming and community building could thrive together.
            What started as small local tournaments has grown into a comprehensive gaming
            platform with advanced features like ELO ratings, tournament brackets, and
            event management.
          </p>
          <p className="text-lg text-muted-foreground">
            Today, we continue to grow and evolve, always staying true to our core mission:
            bringing gamers together through the joy of competition and camaraderie.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">
            Ready to Join Us?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
            Become part of our growing community and start your gaming journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 md:px-8 py-3 rounded-md font-medium transition-colors">
                Join Now
              </button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <button className="w-full border border-border hover:bg-muted px-6 md:px-8 py-3 rounded-md font-medium transition-colors">
                Contact Us
              </button>
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
