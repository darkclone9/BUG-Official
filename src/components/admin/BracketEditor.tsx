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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { BracketMatch, TournamentBracket } from '@/types/bracket';
import { User } from '@/types/types';
import { CalendarIcon, MapPin, Clock, Save, Edit2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BracketEditorProps {
  bracket: TournamentBracket;
  participants: User[];
  onMatchUpdate: (matchId: string, updates: Partial<BracketMatch>) => Promise<void>;
  onBracketSave?: () => void;
}

// Custom theme for the bracket editor - IMPROVED contrast for better visibility
const BracketTheme = createTheme({
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

export default function BracketEditor({
  bracket,
  participants,
  onMatchUpdate,
  onBracketSave,
}: BracketEditorProps) {
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [matchDate, setMatchDate] = useState<Date | undefined>(undefined);
  const [matchLocation, setMatchLocation] = useState('');
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [winnerId, setWinnerId] = useState<string>('');
  const [saving, setSaving] = useState(false);

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
        tournamentRoundText: `Round ${match.round}`,
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

  const handleMatchClick = (matchId: string) => {
    const match = bracket.matches.find(m => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
      setMatchDate(match.scheduledTime);
      setMatchLocation(match.location || '');
      setPlayer1Score(match.score?.player1 || 0);
      setPlayer2Score(match.score?.player2 || 0);
      setWinnerId(match.winnerId || 'none');
      setEditDialogOpen(true);
    }
  };

  const handleSaveMatch = async () => {
    if (!selectedMatch) return;

    setSaving(true);
    try {
      // Treat "none" as no winner
      const actualWinnerId = winnerId === 'none' ? undefined : winnerId;

      const updates: Partial<BracketMatch> = {
        scheduledTime: matchDate,
        location: matchLocation,
        score: {
          player1: player1Score,
          player2: player2Score,
        },
        winnerId: actualWinnerId,
        status: actualWinnerId ? 'completed' : selectedMatch.status,
        completedAt: actualWinnerId ? new Date() : undefined,
      };

      await onMatchUpdate(selectedMatch.id, updates);
      setEditDialogOpen(false);

      if (onBracketSave) {
        onBracketSave();
      }
    } catch (error) {
      console.error('Error saving match:', error);
    } finally {
      setSaving(false);
    }
  };

  // Custom match component with click handler
  // Filter out non-DOM props to prevent React warnings
  const CustomMatch = (props: any) => {
    const { match, onMatchClick, won, hovered, highlighted, ...cleanProps } = props;

    // Guard against undefined match or match without id
    if (!match || !match.id) {
      return null;
    }

    // Only pass the match prop to the Match component, nothing else
    return (
      <div
        onClick={() => handleMatchClick(match.id)}
        className="cursor-pointer hover:opacity-80 transition-opacity"
      >
        <Match match={match} />
      </div>
    );
  };

  const renderBracket = () => {
    if (bracket.format === 'single_elimination') {
      console.log('🏆 [ADMIN] Bracket Data:', {
        totalMatches: bracket.matches.length,
        winnersMatches: bracket.winnersMatches.length,
        totalRounds: bracket.totalRounds,
        format: bracket.format,
      });
      console.log('🏆 [ADMIN] Winners Matches:', bracket.winnersMatches);

      const matches = convertToLibraryFormat(bracket.winnersMatches);
      console.log('🏆 [ADMIN] Converted Matches for Library:', matches);

      return (
        <SingleEliminationBracket
          matches={matches}
          matchComponent={CustomMatch}
          theme={BracketTheme}
          options={{
            style: {
              roundHeader: {
                backgroundColor: BracketTheme.roundHeader.backgroundColor,
                fontColor: BracketTheme.roundHeader.fontColor,
              },
              connectorColor: BracketTheme.connectorColor,
              connectorColorHighlight: BracketTheme.connectorColorHighlight,
            },
          }}
          svgWrapper={({ children, ...props }: any) => (
            <SVGViewer
              background={BracketTheme.svgBackground}
              SVGBackground={BracketTheme.svgBackground}
              width={1200}
              height={800}
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

      return (
        <DoubleEliminationBracket
          matches={{
            upper: upperMatches,
            lower: lowerMatches,
          }}
          matchComponent={CustomMatch}
          theme={BracketTheme}
          options={{
            style: {
              roundHeader: {
                backgroundColor: BracketTheme.roundHeader.backgroundColor,
                fontColor: BracketTheme.roundHeader.fontColor,
              },
              connectorColor: BracketTheme.connectorColor,
              connectorColorHighlight: BracketTheme.connectorColorHighlight,
            },
          }}
          svgWrapper={({ children, ...props }: any) => (
            <SVGViewer
              background={BracketTheme.svgBackground}
              SVGBackground={BracketTheme.svgBackground}
              width={1400}
              height={1000}
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

  const player1 = participants.find(p => p.uid === selectedMatch?.player1Id);
  const player2 = participants.find(p => p.uid === selectedMatch?.player2Id);

  return (
    <div className="space-y-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-accent" />
              Tournament Bracket Editor
            </span>
            <Badge variant="outline">
              {bracket.format.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>
            Click on any match to edit details, set schedule, or update results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bracket-container bg-background rounded-lg p-4 overflow-auto">
            {renderBracket()}
          </div>
        </CardContent>
      </Card>

      {/* Match Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit2 className="h-5 w-5 mr-2" />
              Edit Match Details
            </DialogTitle>
            <DialogDescription>
              Update match schedule, location, and results
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Match Info */}
            <div className="space-y-2">
              <Label>Match</Label>
              <div className="text-sm text-muted-foreground">
                Round {selectedMatch?.round} - Match {selectedMatch?.matchNumber}
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">{player1?.displayName || 'TBD'}</span>
                <span className="text-muted-foreground">vs</span>
                <span className="font-medium">{player2?.displayName || 'TBD'}</span>
              </div>
            </div>

            {/* Schedule Date */}
            <div className="space-y-2">
              <Label htmlFor="match-date">
                <CalendarIcon className="h-4 w-4 inline mr-2" />
                Match Date & Time
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !matchDate && 'text-muted-foreground'
                    )}
                  >
                    {matchDate ? format(matchDate, 'PPP p') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={matchDate}
                    onSelect={setMatchDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="h-4 w-4 inline mr-2" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., Main Hall, Server: NA-East-1"
                value={matchLocation}
                onChange={(e) => setMatchLocation(e.target.value)}
              />
            </div>

            {/* Scores */}
            {selectedMatch?.player1Id && selectedMatch?.player2Id && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{player1?.displayName} Score</Label>
                    <Input
                      type="number"
                      min="0"
                      value={player1Score}
                      onChange={(e) => setPlayer1Score(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{player2?.displayName} Score</Label>
                    <Input
                      type="number"
                      min="0"
                      value={player2Score}
                      onChange={(e) => setPlayer2Score(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Winner Selection */}
                <div className="space-y-2">
                  <Label>Winner</Label>
                  <Select value={winnerId} onValueChange={setWinnerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select winner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No winner yet</SelectItem>
                      {selectedMatch.player1Id && (
                        <SelectItem value={selectedMatch.player1Id}>
                          {player1?.displayName || 'Player 1'}
                        </SelectItem>
                      )}
                      {selectedMatch.player2Id && (
                        <SelectItem value={selectedMatch.player2Id}>
                          {player2?.displayName || 'Player 2'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMatch} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
