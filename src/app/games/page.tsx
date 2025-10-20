'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getGameGenres } from '@/lib/database';
import { GameGenre } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Trophy, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import CollapsibleSidebar from '@/components/CollapsibleSidebar';

export default function GamesPage() {
  const [games, setGames] = useState<GameGenre[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(false);
      const gameData = await getGameGenres(true); // Get active games only
      setGames(gameData);
    } catch (error) {
      console.error('Error loading games:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <CollapsibleSidebar />

      <div className="ml-16 min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-green-500 via-green-600 to-yellow-500 text-white overflow-hidden py-16">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
          </div>

          <div className="container max-w-7xl mx-auto px-4 relative z-10">
            <h1 className="text-5xl font-bold mb-4">
              <Gamepad2 className="inline h-12 w-12 mr-3" />
              Available Games
            </h1>
            <p className="text-xl text-white/90">
              Explore all the games we host tournaments and events for
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container max-w-7xl mx-auto px-4 py-12">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading games...</p>
              </div>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-12">
              <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">No Games Available</h2>
              <p className="text-muted-foreground mb-6">
                Check back soon for available games and tournaments!
              </p>
              <Link href="/tournaments">
                <Button>View Tournaments</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <Card
                  key={game.id}
                  className="hover:shadow-lg transition-all duration-300 border-green-200 dark:border-green-800 overflow-hidden group"
                >
                  <div
                    className="h-32 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 flex items-center justify-center"
                    style={{
                      backgroundColor: game.color || '#10b981',
                      opacity: 0.2
                    }}
                  >
                    <Gamepad2 className="h-16 w-16 text-green-600 dark:text-green-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <CardHeader>
                    <CardTitle className="text-green-900 dark:text-green-100">
                      {game.displayName}
                    </CardTitle>
                    <CardDescription className="text-green-700 dark:text-green-300">
                      {game.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Badge className="bg-green-600 hover:bg-green-700 text-white">
                        <Trophy className="h-3 w-3 mr-1" />
                        Tournaments
                      </Badge>
                      <Badge variant="outline" className="border-green-200 dark:border-green-800">
                        <Users className="h-3 w-3 mr-1" />
                        Competitive
                      </Badge>
                    </div>

                    <Link href="/tournaments">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium">
                        View Tournaments
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

