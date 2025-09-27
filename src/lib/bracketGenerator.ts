import { BracketMatch, BracketGenerationOptions, RoundRobinMatch } from '@/types/bracket';

export class BracketGenerator {
  static generateSingleElimination(options: BracketGenerationOptions): BracketMatch[] {
    const { participants, tournamentId } = options;
    const matches: BracketMatch[] = [];

    // Ensure we have a power of 2 participants (add byes if needed)
    const totalSlots = this.getNextPowerOfTwo(participants.length);
    const paddedParticipants = [...participants];

    // Add byes for missing participants
    while (paddedParticipants.length < totalSlots) {
      paddedParticipants.push(''); // Empty string represents a bye
    }

    // Shuffle participants if randomization is enabled
    if (options.randomizeSeeding) {
      this.shuffleArray(paddedParticipants);
    }

    const totalRounds = Math.log2(totalSlots);
    let matchId = 1;

    // Generate first round matches
    for (let i = 0; i < paddedParticipants.length; i += 2) {
      const player1 = paddedParticipants[i];
      const player2 = paddedParticipants[i + 1];

      const match: BracketMatch = {
        id: `${tournamentId}_match_${matchId}`,
        tournamentId,
        round: 1,
        matchNumber: matchId,
        bracket: 'winners',
        player1Id: player1 || undefined,
        player2Id: player2 || undefined,
        status: (player1 && player2) ? 'pending' : 'completed',
        winnerId: player1 && !player2 ? player1 : (player2 && !player1 ? player2 : undefined),
        createdAt: new Date(),
      };

      matches.push(match);
      matchId++;
    }

    // Generate subsequent rounds
    for (let round = 2; round <= totalRounds; round++) {
      const previousRoundMatches = matches.filter(m => m.round === round - 1);
      const matchesInRound = previousRoundMatches.length / 2;

      for (let i = 0; i < matchesInRound; i++) {
        const match: BracketMatch = {
          id: `${tournamentId}_match_${matchId}`,
          tournamentId,
          round,
          matchNumber: matchId,
          bracket: 'winners',
          status: 'pending',
          createdAt: new Date(),
        };

        matches.push(match);
        matchId++;
      }
    }

    // Set up next match connections
    this.setupSingleEliminationConnections(matches);

    return matches;
  }

  static generateDoubleElimination(options: BracketGenerationOptions): BracketMatch[] {
    const { participants, tournamentId } = options;
    const matches: BracketMatch[] = [];

    // Ensure we have a power of 2 participants
    const totalSlots = this.getNextPowerOfTwo(participants.length);
    const paddedParticipants = [...participants];

    while (paddedParticipants.length < totalSlots) {
      paddedParticipants.push('');
    }

    if (options.randomizeSeeding) {
      this.shuffleArray(paddedParticipants);
    }

    let matchId = 1;

    // Generate Winners Bracket
    const winnersMatches = this.generateWinnersBracket(
      paddedParticipants,
      tournamentId,
      matchId
    );
    matches.push(...winnersMatches);
    matchId += winnersMatches.length;

    // Generate Losers Bracket
    const losersMatches = this.generateLosersBracket(
      totalSlots,
      tournamentId,
      matchId
    );
    matches.push(...losersMatches);
    matchId += losersMatches.length;

    // Generate Grand Final
    const grandFinal: BracketMatch = {
      id: `${tournamentId}_grand_final`,
      tournamentId,
      round: 1,
      matchNumber: matchId,
      bracket: 'grand_final',
      status: 'pending',
      createdAt: new Date(),
    };
    matches.push(grandFinal);

    // Set up connections for double elimination
    this.setupDoubleEliminationConnections(matches);

    return matches;
  }

  static generateRoundRobin(options: BracketGenerationOptions): RoundRobinMatch[] {
    const { participants, tournamentId } = options;
    const matches: RoundRobinMatch[] = [];
    let matchId = 1;

    // Generate all possible pairings
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const match: RoundRobinMatch = {
          id: `${tournamentId}_rr_match_${matchId}`,
          tournamentId,
          player1Id: participants[i],
          player2Id: participants[j],
          player1Name: '', // Will be populated when creating the tournament
          player2Name: '', // Will be populated when creating the tournament
          status: 'pending',
          round: Math.floor((matchId - 1) / Math.floor(participants.length / 2)) + 1,
          createdAt: new Date(),
        };

        matches.push(match);
        matchId++;
      }
    }

    return matches;
  }

  private static generateWinnersBracket(
    participants: string[],
    tournamentId: string,
    startMatchId: number
  ): BracketMatch[] {
    const matches: BracketMatch[] = [];
    const totalRounds = Math.log2(participants.length);
    let matchId = startMatchId;

    // First round
    for (let i = 0; i < participants.length; i += 2) {
      const player1 = participants[i];
      const player2 = participants[i + 1];

      const match: BracketMatch = {
        id: `${tournamentId}_wb_${matchId}`,
        tournamentId,
        round: 1,
        matchNumber: matchId,
        bracket: 'winners',
        player1Id: player1 || undefined,
        player2Id: player2 || undefined,
        status: (player1 && player2) ? 'pending' : 'completed',
        winnerId: player1 && !player2 ? player1 : (player2 && !player1 ? player2 : undefined),
        createdAt: new Date(),
      };

      matches.push(match);
      matchId++;
    }

    // Subsequent rounds
    for (let round = 2; round <= totalRounds; round++) {
      const previousRoundMatches = matches.filter(m => m.round === round - 1);
      const matchesInRound = previousRoundMatches.length / 2;

      for (let i = 0; i < matchesInRound; i++) {
        const match: BracketMatch = {
          id: `${tournamentId}_wb_${matchId}`,
          tournamentId,
          round,
          matchNumber: matchId,
          bracket: 'winners',
          status: 'pending',
          createdAt: new Date(),
        };

        matches.push(match);
        matchId++;
      }
    }

    return matches;
  }

  private static generateLosersBracket(
    totalSlots: number,
    tournamentId: string,
    startMatchId: number
  ): BracketMatch[] {
    const matches: BracketMatch[] = [];
    const losersRounds = (Math.log2(totalSlots) - 1) * 2;
    let matchId = startMatchId;

    // Generate losers bracket structure
    for (let round = 1; round <= losersRounds; round++) {
      const isEliminationRound = round % 2 === 0;
      const matchesInRound = this.getLosersBracketMatchCount(round, totalSlots);

      for (let i = 0; i < matchesInRound; i++) {
        const match: BracketMatch = {
          id: `${tournamentId}_lb_${matchId}`,
          tournamentId,
          round,
          matchNumber: matchId,
          bracket: 'losers',
          status: 'pending',
          isElimination: isEliminationRound,
          createdAt: new Date(),
        };

        matches.push(match);
        matchId++;
      }
    }

    return matches;
  }

  private static getLosersBracketMatchCount(round: number, totalSlots: number): number {
    const winnersRounds = Math.log2(totalSlots);

    if (round === 1) {
      return totalSlots / 4; // First round of losers bracket
    }

    if (round % 2 === 1) {
      // Odd rounds: matches between losers bracket survivors
      const winnersDropping = Math.pow(2, winnersRounds - Math.floor(round / 2) - 1);
      return winnersDropping;
    } else {
      // Even rounds: elimination rounds
      return Math.pow(2, winnersRounds - Math.floor(round / 2) - 1);
    }
  }

  private static setupSingleEliminationConnections(matches: BracketMatch[]): void {
    const roundGroups = this.groupMatchesByRound(matches);

    Object.keys(roundGroups).forEach(roundStr => {
      const round = parseInt(roundStr);
      const currentRoundMatches = roundGroups[round];
      const nextRoundMatches = roundGroups[round + 1];

      if (nextRoundMatches) {
        currentRoundMatches.forEach((match, index) => {
          const nextMatchIndex = Math.floor(index / 2);
          if (nextRoundMatches[nextMatchIndex]) {
            match.nextMatchId = nextRoundMatches[nextMatchIndex].id;
          }
        });
      }
    });
  }

  private static setupDoubleEliminationConnections(matches: BracketMatch[]): void {
    // This is a complex setup that would require detailed bracket logic
    // For now, we'll implement a basic structure
    const winnersMatches = matches.filter(m => m.bracket === 'winners');

    // Set up winners bracket connections
    this.setupSingleEliminationConnections(winnersMatches);

    // Set up losers bracket connections (simplified)
    // This would need more complex logic for a full implementation
  }

  private static groupMatchesByRound(matches: BracketMatch[]): Record<number, BracketMatch[]> {
    return matches.reduce((groups, match) => {
      if (!groups[match.round]) {
        groups[match.round] = [];
      }
      groups[match.round].push(match);
      return groups;
    }, {} as Record<number, BracketMatch[]>);
  }

  private static getNextPowerOfTwo(n: number): number {
    return Math.pow(2, Math.ceil(Math.log2(n)));
  }

  private static shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
