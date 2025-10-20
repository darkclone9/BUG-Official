'use client';

import React, { useState, useEffect } from 'react';
import {
  SingleEliminationBracket,
  DoubleEliminationBracket,
  Match,
  SVGViewer,
  createTheme,
} from '@g-loot/react-tournament-brackets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BracketMatch, TournamentBracket } from '@/types/bracket';
import { User } from '@/types/types';
import { Trophy, Calendar, MapPin, Clock, Users, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface PublicBracketDisplayProps {
  bracket: TournamentBracket;
  participants: User[];
  tournamentName: string;
  showLegend?: boolean;
}

// Create theme based on current mode (light/dark)
const createBracketTheme = (isDark: boolean) => {
  if (isDark) {
    // Dark mode theme - IMPROVED contrast for better visibility
    return createTheme({
      textColor: {
        main: '#e8f5eb', // Very light green text for maximum readability
        highlighted: '#7ee589', // Very bright green for highlights
        dark: '#9dd4a8' // Medium-light green for secondary text
      },
      matchBackground: {
        wonColor: 'hsl(145, 45%, 35%)', // Saturated medium-dark green for winners
        lostColor: 'hsl(145, 8%, 28%)' // Lighter dark gray-green for losers (better contrast)
      },
      score: {
        background: {
          wonColor: '#70d77b', // Bright green for winner scores
          lostColor: 'hsl(145, 6%, 32%)' // Medium-dark for loser scores
        },
        text: {
          highlightedWonColor: '#0f2912', // Very dark green text on bright bg
          highlightedLostColor: '#e8f5eb' // Very light green text
        },
      },
      border: {
        color: 'hsl(145, 8%, 40%)', // Lighter border for better visibility
        highlightedColor: '#f4f087', // Brighter yellow for highlights
      },
      roundHeader: {
        backgroundColor: '#70d77b', // Bright green header
        fontColor: '#0f2912' // Very dark green text for contrast
      },
      connectorColor: 'hsl(145, 8%, 40%)', // Lighter connectors
      connectorColorHighlight: '#f4f087', // Bright yellow highlight
      svgBackground: 'hsl(145, 6%, 16%)', // Slightly lighter dark background
    });
  } else {
    // Light mode theme - matches light mode green/yellow scheme
    return createTheme({
      textColor: {
        main: '#1d4d25', // Dark green text (--foreground)
        highlighted: '#4ab74c', // Bright green (--primary)
        dark: '#88c292' // Light green (--muted)
      },
      matchBackground: {
        wonColor: '#4ab74c', // Bright green for winners (--primary)
        lostColor: 'hsl(145, 8%, 75%)' // Light muted green for losers
      },
      score: {
        background: {
          wonColor: '#399a49', // Medium green (--secondary)
          lostColor: 'hsl(145, 8%, 85%)' // Very light green
        },
        text: {
          highlightedWonColor: '#FFFFFF',
          highlightedLostColor: '#1d4d25' // Dark green text
        },
      },
      border: {
        color: 'hsl(145, 5%, 85%)', // Light border (--border)
        highlightedColor: '#fdf579', // Yellow highlight (--accent)
      },
      roundHeader: {
        backgroundColor: '#4ab74c', // Bright green (--primary)
        fontColor: '#FFFFFF'
      },
      connectorColor: 'hsl(145, 5%, 85%)', // Light border
      connectorColorHighlight: '#fdf579', // Yellow highlight (--accent)
      svgBackground: 'hsl(145, 5%, 99%)', // Off-white background for light mode
    });
  }
};

export default function PublicBracketDisplay({
  bracket,
  participants,
  tournamentName,
  showLegend = true,
}: PublicBracketDisplayProps) {
  const [selectedBracket, setSelectedBracket] = useState<'all' | 'winners' | 'losers'>('all');
  const [hoveredMatch, setHoveredMatch] = useState<string | null>(null);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if dark mode is active
  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  // Create theme based on current mode
  const PublicBracketTheme = createBracketTheme(isDark);

  // Convert bracket matches to react-tournament-brackets format
  const convertToLibraryFormat = (matches: BracketMatch[]) => {
    return matches.map(match => {
      const player1 = participants.find(p => p.uid === match.player1Id);
      const player2 = participants.find(p => p.uid === match.player2Id);

      return {
        id: match.id,
        name: `Round ${match.round} - Match ${match.matchNumber}`,
        nextMatchId: match.nextMatchId || null,
        nextLooserMatchId: match.nextLoserMatchId || null,
        tournamentRoundText: getRoundName(match.round, bracket.totalRounds),
        startTime: match.scheduledTime?.toISOString() || null,
        state: match.status === 'completed' ? 'DONE' : match.status === 'in_progress' ? 'SCORE_DONE' : 'SCHEDULED',
        participants: [
          {
            id: match.player1Id || 'TBD',
            resultText: match.score ? String(match.score.player1) : null,
            isWinner: match.winnerId === match.player1Id,
            status: match.status === 'completed' ? 'PLAYED' : null,
            name: player1?.displayName || 'TBD',
          },
          {
            id: match.player2Id || 'TBD',
            resultText: match.score ? String(match.score.player2) : null,
            isWinner: match.winnerId === match.player2Id,
            status: match.status === 'completed' ? 'PLAYED' : null,
            name: player2?.displayName || 'TBD',
          },
        ],
      };
    });
  };

  const getRoundName = (round: number, totalRounds: number): string => {
    if (round === totalRounds) return 'Final';
    if (round === totalRounds - 1) return 'Semi Finals';
    if (round === totalRounds - 2) return 'Quarter Finals';
    return `Round ${round}`;
  };

  // Custom match component with hover effects and match details
  // Filter out non-DOM props to prevent React warnings
  const CustomMatch = (props: any) => {
    const { match, onMatchClick, won, hovered, highlighted, ...cleanProps } = props;

    // Guard against undefined match or match without id
    if (!match || !match.id) {
      return null;
    }

    const isHovered = hoveredMatch === match.id;
    const matchData = bracket.matches.find(m => m.id === match.id);

    return (
      <div
        onMouseEnter={() => setHoveredMatch(match.id)}
        onMouseLeave={() => setHoveredMatch(null)}
        className="relative group"
      >
        <div className="transition-all duration-200 group-hover:scale-105">
          <Match match={match} />
        </div>

        {/* Hover tooltip with match details */}
        {isHovered && matchData && (
          <div className="absolute z-50 top-full left-0 mt-3 p-4 bg-card border-2 border-primary/30 rounded-xl shadow-2xl min-w-[280px] backdrop-blur-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-foreground text-base">
                  {match.name}
                </div>
                <Trophy className="h-4 w-4 text-primary" />
              </div>

              <div className="h-px bg-border"></div>

              {matchData.scheduledTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>{format(matchData.scheduledTime, 'PPP p')}</span>
                </div>
              )}

              {matchData.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="p-1.5 rounded-md bg-secondary/10">
                    <MapPin className="h-3.5 w-3.5 text-secondary" />
                  </div>
                  <span>{matchData.location}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <Badge
                  variant={matchData.status === 'completed' ? 'default' : matchData.status === 'in_progress' ? 'secondary' : 'outline'}
                  className={cn(
                    "font-semibold",
                    matchData.status === 'completed' && "bg-primary",
                    matchData.status === 'in_progress' && "bg-accent text-accent-foreground"
                  )}
                >
                  {matchData.status === 'completed' ? '✓ Completed' : matchData.status === 'in_progress' ? '⚡ Live Now' : '📅 Scheduled'}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBracket = () => {
    if (bracket.format === 'single_elimination') {
      console.log('🏆 Bracket Data:', {
        totalMatches: bracket.matches.length,
        winnersMatches: bracket.winnersMatches.length,
        totalRounds: bracket.totalRounds,
        format: bracket.format,
      });
      console.log('🏆 Winners Matches:', bracket.winnersMatches);

      const matches = convertToLibraryFormat(bracket.winnersMatches);
      console.log('🏆 Converted Matches for Library:', matches);

      return (
        <SingleEliminationBracket
          matches={matches}
          matchComponent={CustomMatch}
          theme={PublicBracketTheme}
          options={{
            style: {
              roundHeader: {
                backgroundColor: PublicBracketTheme.roundHeader.backgroundColor,
                fontColor: PublicBracketTheme.roundHeader.fontColor,
              },
              connectorColor: PublicBracketTheme.connectorColor,
              connectorColorHighlight: PublicBracketTheme.connectorColorHighlight,
            },
          }}
          svgWrapper={({ children, ...props }) => (
            <SVGViewer
              background={PublicBracketTheme.svgBackground}
              SVGBackground={PublicBracketTheme.svgBackground}
              width={1800}
              height={900}
              {...props}
            >
              {children}
            </SVGViewer>
          )}
        />
      );
    } else if (bracket.format === 'double_elimination') {
      const upperMatches = convertToLibraryFormat(bracket.winnersMatches);
      const lowerMatches = convertToLibraryFormat(bracket.losersMatches || []);

      // Filter based on selected bracket
      const displayMatches = selectedBracket === 'winners'
        ? { upper: upperMatches, lower: [] }
        : selectedBracket === 'losers'
        ? { upper: [], lower: lowerMatches }
        : { upper: upperMatches, lower: lowerMatches };

      return (
        <DoubleEliminationBracket
          matches={displayMatches}
          matchComponent={CustomMatch}
          theme={PublicBracketTheme}
          options={{
            style: {
              roundHeader: {
                backgroundColor: PublicBracketTheme.roundHeader.backgroundColor,
                fontColor: PublicBracketTheme.roundHeader.fontColor,
              },
              connectorColor: PublicBracketTheme.connectorColor,
              connectorColorHighlight: PublicBracketTheme.connectorColorHighlight,
            },
          }}
          svgWrapper={({ children, ...props }) => (
            <SVGViewer
              background={PublicBracketTheme.svgBackground}
              SVGBackground={PublicBracketTheme.svgBackground}
              width={2000}
              height={1200}
              {...props}
            >
              {children}
            </SVGViewer>
          )}
        />
      );
    }

    return null;
  };

  // Calculate statistics
  const completedMatches = bracket.matches.filter(m => m.status === 'completed').length;
  const totalMatches = bracket.matches.length;
  const liveMatches = bracket.matches.filter(m => m.status === 'in_progress').length;
  const upcomingMatches = bracket.matches.filter(m => m.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Tournament Bracket Section - Dedicated with visual separation */}
      <div className="relative">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>

        {/* Tournament Bracket Header */}
        <div className="text-center space-y-3 pt-8 pb-6">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-primary/10 border-2 border-primary/20">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
              Tournament Bracket
            </h2>
          </div>
          <p className="text-muted-foreground text-lg font-medium">
            {bracket.format.replace('_', ' ').charAt(0).toUpperCase() + bracket.format.replace('_', ' ').slice(1)} Format
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary"></div>
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">Participants</div>
              <div className="text-3xl font-bold text-foreground">{participants.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/20 hover:border-secondary/40 transition-colors">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 rounded-full bg-secondary/10">
                <Trophy className="h-6 w-6 text-secondary" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">Completed</div>
              <div className="text-3xl font-bold text-foreground">{completedMatches}<span className="text-lg text-muted-foreground">/{totalMatches}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-accent/20 hover:border-accent/40 transition-colors">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 rounded-full bg-accent/10">
                <Zap className="h-6 w-6 text-accent-foreground" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">Live Now</div>
              <div className="text-3xl font-bold text-foreground">{liveMatches}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-muted/40 hover:border-muted/60 transition-colors">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 rounded-full bg-muted/30">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">Upcoming</div>
              <div className="text-3xl font-bold text-foreground">{upcomingMatches}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bracket selector for double elimination */}
      {bracket.format === 'double_elimination' && (
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg border-2 border-primary/20 p-1 bg-muted/30">
            <Button
              variant={selectedBracket === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedBracket('all')}
              className={cn(
                "transition-all",
                selectedBracket === 'all' && "bg-primary text-primary-foreground shadow-md"
              )}
            >
              All Brackets
            </Button>
            <Button
              variant={selectedBracket === 'winners' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedBracket('winners')}
              className={cn(
                "transition-all",
                selectedBracket === 'winners' && "bg-primary text-primary-foreground shadow-md"
              )}
            >
              Winners Bracket
            </Button>
            <Button
              variant={selectedBracket === 'losers' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedBracket('losers')}
              className={cn(
                "transition-all",
                selectedBracket === 'losers' && "bg-primary text-primary-foreground shadow-md"
              )}
            >
              Losers Bracket
            </Button>
          </div>
        </div>
      )}

      {/* Bracket visualization - WIDER with dedicated section */}
      <div className="relative -mx-4 md:-mx-8 lg:-mx-12 px-4 md:px-8 lg:px-12 py-12 bg-gradient-to-b from-muted/30 via-muted/10 to-transparent border-y-2 border-primary/10">
        {/* Section background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(74,183,76,0.05),transparent_50%)]"></div>

        <Card className="relative border-2 border-primary/30 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="border-b-2 border-primary/10 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <div className="h-8 w-1 bg-primary rounded-full"></div>
                Bracket Visualization
              </CardTitle>
              <Badge variant="outline" className="text-sm font-semibold border-primary/30">
                {totalMatches} Total Matches
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 md:p-12">
            {/* WIDER bracket container with better overflow handling */}
            <div className="bracket-container-wrapper w-full">
              <div className="bracket-container bg-card rounded-xl overflow-x-auto overflow-y-hidden border-2 border-border shadow-inner min-h-[600px]">
                {renderBracket()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      {showLegend && (
        <Card className="border-2 border-muted/40 bg-muted/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="h-1 w-8 bg-primary rounded-full"></div>
              Bracket Legend
            </CardTitle>
            <CardDescription>
              Understanding the bracket visualization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Match Status</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="bg-primary">Completed</Badge>
                    <span className="text-sm">Match finished</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-accent text-accent-foreground">Live</Badge>
                    <span className="text-sm">Currently playing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Scheduled</Badge>
                    <span className="text-sm">Upcoming match</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Match Results</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary rounded border-2 border-primary shadow-sm"></div>
                    <span className="text-sm font-medium">Winner</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-muted rounded border-2 border-border"></div>
                    <span className="text-sm">Eliminated</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-card rounded border-2 border-dashed border-muted-foreground"></div>
                    <span className="text-sm text-muted-foreground">TBD (To Be Determined)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Highlights</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-8 bg-accent rounded-full shadow-sm"></div>
                    <span className="text-sm">Active connection</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-8 bg-border rounded-full"></div>
                    <span className="text-sm">Standard connection</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
