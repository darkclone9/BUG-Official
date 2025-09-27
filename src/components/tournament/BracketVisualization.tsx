'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BracketMatch, TournamentBracket } from '@/types/bracket';
import { User } from '@/types/types';
import { Trophy, Clock, MapPin, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BracketVisualizationProps {
  bracket: TournamentBracket;
  participants: User[];
  isAdmin?: boolean;
  onMatchUpdate?: (matchId: string, winnerId: string, score?: { player1: number; player2: number }) => void;
}

interface MatchCardProps {
  match: BracketMatch;
  participants: User[];
  isAdmin?: boolean;
  onMatchUpdate?: (matchId: string, winnerId: string, score?: { player1: number; player2: number }) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, participants, isAdmin, onMatchUpdate }) => {
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [score, setScore] = useState({ player1: 0, player2: 0 });

  const getPlayerName = (playerId?: string) => {
    if (!playerId) return 'TBD';
    const participant = participants.find(p => p.uid === playerId);
    return participant?.displayName || 'Unknown Player';
  };

  const getPlayerElo = (playerId?: string) => {
    if (!playerId) return null;
    const participant = participants.find(p => p.uid === playerId);
    return participant?.eloRating || 1200;
  };

  const handleWinnerSelect = (winnerId: string) => {
    if (onMatchUpdate) {
      onMatchUpdate(match.id, winnerId, score);
      setShowScoreInput(false);
    }
  };

  const isMatchComplete = match.status === 'completed';
  const hasPlayers = match.player1Id && match.player2Id;

  return (
    <Card className={cn(
      "w-64 transition-all duration-200",
      isMatchComplete ? "bg-muted/50" : "hover:shadow-md",
      match.bracket === 'losers' && "border-orange-200 bg-orange-50/50",
      match.bracket === 'grand_final' && "border-yellow-200 bg-yellow-50/50"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {match.bracket === 'grand_final' ? 'Grand Final' : `Round ${match.round}`}
          </CardTitle>
          <Badge variant={
            match.status === 'completed' ? 'default' :
            match.status === 'in_progress' ? 'secondary' : 'outline'
          }>
            {match.status === 'completed' ? 'Complete' :
             match.status === 'in_progress' ? 'Live' : 'Pending'}
          </Badge>
        </div>
        {match.scheduledTime && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(match.scheduledTime).toLocaleString()}
          </div>
        )}
        {match.location && (
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            {match.location}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Player 1 */}
        <div className={cn(
          "flex items-center justify-between p-2 rounded border",
          match.winnerId === match.player1Id ? "bg-green-100 border-green-300" : "bg-background",
          match.winnerId && match.winnerId !== match.player1Id ? "opacity-50" : ""
        )}>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
              1
            </div>
            <div>
              <p className="text-sm font-medium">{getPlayerName(match.player1Id)}</p>
              {match.player1Id && (
                <p className="text-xs text-muted-foreground">ELO: {getPlayerElo(match.player1Id)}</p>
              )}
            </div>
          </div>
          {match.winnerId && match.winnerId !== match.player1Id && (
            <X className="h-4 w-4 text-red-500" />
          )}
          {match.score && (
            <span className="text-sm font-bold">{match.score.player1}</span>
          )}
        </div>

        {/* Player 2 */}
        <div className={cn(
          "flex items-center justify-between p-2 rounded border",
          match.winnerId === match.player2Id ? "bg-green-100 border-green-300" : "bg-background",
          match.winnerId && match.winnerId !== match.player2Id ? "opacity-50" : ""
        )}>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
              2
            </div>
            <div>
              <p className="text-sm font-medium">{getPlayerName(match.player2Id)}</p>
              {match.player2Id && (
                <p className="text-xs text-muted-foreground">ELO: {getPlayerElo(match.player2Id)}</p>
              )}
            </div>
          </div>
          {match.winnerId && match.winnerId !== match.player2Id && (
            <X className="h-4 w-4 text-red-500" />
          )}
          {match.score && (
            <span className="text-sm font-bold">{match.score.player2}</span>
          )}
        </div>

        {/* Admin Controls */}
        {isAdmin && hasPlayers && !isMatchComplete && (
          <div className="space-y-2 pt-2 border-t">
            {!showScoreInput ? (
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setShowScoreInput(true)}
              >
                Record Result
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="P1"
                    className="w-16 px-2 py-1 text-sm border rounded"
                    value={score.player1}
                    onChange={(e) => setScore(prev => ({ ...prev, player1: parseInt(e.target.value) || 0 }))}
                  />
                  <input
                    type="number"
                    placeholder="P2"
                    className="w-16 px-2 py-1 text-sm border rounded"
                    value={score.player2}
                    onChange={(e) => setScore(prev => ({ ...prev, player2: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleWinnerSelect(match.player1Id!)}
                    disabled={!match.player1Id}
                  >
                    P1 Wins
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleWinnerSelect(match.player2Id!)}
                    disabled={!match.player2Id}
                  >
                    P2 Wins
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowScoreInput(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Winner Display */}
        {isMatchComplete && match.winnerId && (
          <div className="flex items-center justify-center pt-2 border-t">
            <div className="flex items-center space-x-1 text-green-600">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-medium">
                {getPlayerName(match.winnerId)} Wins
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const BracketVisualization: React.FC<BracketVisualizationProps> = ({
  bracket,
  participants,
  isAdmin,
  onMatchUpdate
}) => {
  const [selectedBracket, setSelectedBracket] = useState<'winners' | 'losers' | 'all'>('all');

  const winnersMatches = bracket.matches.filter(m => m.bracket === 'winners');
  const losersMatches = bracket.matches.filter(m => m.bracket === 'losers');
  const grandFinalMatch = bracket.matches.find(m => m.bracket === 'grand_final');

  const groupMatchesByRound = (matches: BracketMatch[]) => {
    return matches.reduce((groups, match) => {
      if (!groups[match.round]) {
        groups[match.round] = [];
      }
      groups[match.round].push(match);
      return groups;
    }, {} as Record<number, BracketMatch[]>);
  };

  const winnersRounds = groupMatchesByRound(winnersMatches);
  const losersRounds = groupMatchesByRound(losersMatches);

  const renderBracketSection = (title: string, rounds: Record<number, BracketMatch[]>, bracketType: string) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center">
        {title}
        <Badge variant="outline" className="ml-2">
          {Object.values(rounds).flat().length} matches
        </Badge>
      </h3>
      <div className="flex space-x-8 overflow-x-auto pb-4">
        {Object.entries(rounds)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([round, matches]) => (
            <div key={`${bracketType}-${round}`} className="flex-shrink-0">
              <h4 className="text-sm font-medium mb-4 text-center">
                Round {round}
              </h4>
              <div className="space-y-4">
                {matches.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    participants={participants}
                    isAdmin={isAdmin}
                    onMatchUpdate={onMatchUpdate}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Bracket Type Selector */}
      {bracket.format === 'double_elimination' && (
        <div className="flex space-x-2">
          <Button
            variant={selectedBracket === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedBracket('all')}
          >
            All Brackets
          </Button>
          <Button
            variant={selectedBracket === 'winners' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedBracket('winners')}
          >
            Winners Bracket
          </Button>
          <Button
            variant={selectedBracket === 'losers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedBracket('losers')}
          >
            Losers Bracket
          </Button>
        </div>
      )}

      {/* Winners Bracket */}
      {(selectedBracket === 'all' || selectedBracket === 'winners') && Object.keys(winnersRounds).length > 0 &&
        renderBracketSection('Winners Bracket', winnersRounds, 'winners')}

      {/* Losers Bracket */}
      {(selectedBracket === 'all' || selectedBracket === 'losers') && Object.keys(losersRounds).length > 0 &&
        renderBracketSection('Losers Bracket', losersRounds, 'losers')}

      {/* Grand Final */}
      {grandFinalMatch && selectedBracket === 'all' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Grand Final</h3>
          <div className="flex justify-center">
            <MatchCard
              match={grandFinalMatch}
              participants={participants}
              isAdmin={isAdmin}
              onMatchUpdate={onMatchUpdate}
            />
          </div>
        </div>
      )}

      {/* Tournament Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Tournament Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{participants.length}</p>
              <p className="text-sm text-muted-foreground">Total Players</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {bracket.matches.filter(m => m.status === 'completed').length}
              </p>
              <p className="text-sm text-muted-foreground">Completed Matches</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {bracket.matches.filter(m => m.status === 'in_progress').length}
              </p>
              <p className="text-sm text-muted-foreground">Live Matches</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {bracket.matches.filter(m => m.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">Pending Matches</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
