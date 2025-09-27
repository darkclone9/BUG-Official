/**
 * ELO Rating System Implementation
 * 
 * This module implements a comprehensive ELO rating system for the gaming club
 * that calculates dynamic points based on player rankings and skill differences.
 */

import { EloCalculationParams, EloCalculationResult, EloHistoryEntry } from '@/types/types';

// ELO System Constants
export const ELO_CONSTANTS = {
  DEFAULT_RATING: 1200, // Starting ELO rating for new players
  K_FACTOR_HIGH: 40,    // K-factor for new players (< 30 games)
  K_FACTOR_MEDIUM: 20,  // K-factor for intermediate players (30-100 games)
  K_FACTOR_LOW: 10,     // K-factor for experienced players (> 100 games)
  MIN_RATING: 100,      // Minimum possible rating
  MAX_RATING: 3000,     // Maximum possible rating
  RATING_DIFFERENCE_THRESHOLD: 400, // Maximum meaningful rating difference
};

// Points multipliers based on ELO difference
export const POINTS_MULTIPLIERS = {
  MASSIVE_UPSET: 3.0,   // 400+ rating difference upset
  MAJOR_UPSET: 2.5,     // 300-399 rating difference upset
  MODERATE_UPSET: 2.0,  // 200-299 rating difference upset
  MINOR_UPSET: 1.5,     // 100-199 rating difference upset
  EVEN_MATCH: 1.0,      // < 100 rating difference
  EXPECTED_WIN: 0.8,    // Higher rated player wins as expected
};

/**
 * Calculate expected score for a player based on ELO ratings
 * @param playerRating - Player's current ELO rating
 * @param opponentRating - Opponent's current ELO rating
 * @returns Expected score (0-1, where 1 is certain win)
 */
export function calculateExpectedScore(playerRating: number, opponentRating: number): number {
  const ratingDifference = opponentRating - playerRating;
  return 1 / (1 + Math.pow(10, ratingDifference / 400));
}

/**
 * Determine K-factor based on player's game experience
 * @param gamesPlayed - Number of games the player has played
 * @param currentRating - Player's current rating (for additional adjustments)
 * @returns K-factor for ELO calculation
 */
export function getKFactor(gamesPlayed: number, currentRating: number): number {
  // New players get higher K-factor for faster rating adjustment
  if (gamesPlayed < 30) {
    return ELO_CONSTANTS.K_FACTOR_HIGH;
  }
  
  // Intermediate players
  if (gamesPlayed < 100) {
    return ELO_CONSTANTS.K_FACTOR_MEDIUM;
  }
  
  // Experienced players get lower K-factor for stability
  // But slightly higher K-factor for very high or very low ratings
  if (currentRating > 2000 || currentRating < 800) {
    return ELO_CONSTANTS.K_FACTOR_MEDIUM;
  }
  
  return ELO_CONSTANTS.K_FACTOR_LOW;
}

/**
 * Calculate new ELO ratings and bonus points for both players
 * @param params - ELO calculation parameters
 * @param playerGamesPlayed - Number of games the player has played
 * @param opponentGamesPlayed - Number of games the opponent has played
 * @returns Complete ELO calculation result with new ratings and bonus points
 */
export function calculateEloChange(
  params: EloCalculationParams,
  playerGamesPlayed: number = 50,
  opponentGamesPlayed: number = 50
): EloCalculationResult {
  const { playerRating, opponentRating, playerResult } = params;
  
  // Convert result to numeric score
  let actualScore: number;
  switch (playerResult) {
    case 'win':
      actualScore = 1.0;
      break;
    case 'loss':
      actualScore = 0.0;
      break;
    case 'draw':
      actualScore = 0.5;
      break;
    default:
      throw new Error('Invalid player result');
  }
  
  // Calculate expected scores
  const playerExpectedScore = calculateExpectedScore(playerRating, opponentRating);
  const opponentExpectedScore = calculateExpectedScore(opponentRating, playerRating);
  
  // Get K-factors for both players
  const playerKFactor = params.kFactor || getKFactor(playerGamesPlayed, playerRating);
  const opponentKFactor = getKFactor(opponentGamesPlayed, opponentRating);
  
  // Calculate rating changes
  const playerRatingChange = Math.round(playerKFactor * (actualScore - playerExpectedScore));
  const opponentRatingChange = Math.round(opponentKFactor * ((1 - actualScore) - opponentExpectedScore));
  
  // Calculate new ratings with bounds checking
  let newPlayerRating = playerRating + playerRatingChange;
  let newOpponentRating = opponentRating + opponentRatingChange;
  
  // Enforce rating bounds
  newPlayerRating = Math.max(ELO_CONSTANTS.MIN_RATING, Math.min(ELO_CONSTANTS.MAX_RATING, newPlayerRating));
  newOpponentRating = Math.max(ELO_CONSTANTS.MIN_RATING, Math.min(ELO_CONSTANTS.MAX_RATING, newOpponentRating));
  
  // Calculate bonus points based on upset potential
  const pointsAwarded = calculateBonusPoints(playerRating, opponentRating, playerResult);
  
  return {
    newPlayerRating,
    newOpponentRating,
    playerRatingChange,
    opponentRatingChange,
    pointsAwarded,
  };
}

/**
 * Calculate bonus points based on ELO difference and match result
 * @param playerRating - Player's ELO rating
 * @param opponentRating - Opponent's ELO rating
 * @param result - Match result from player's perspective
 * @returns Bonus points to award
 */
export function calculateBonusPoints(
  playerRating: number,
  opponentRating: number,
  result: 'win' | 'loss' | 'draw'
): number {
  // Base points for participation
  const basePoints = 10;
  
  // No bonus for losses
  if (result === 'loss') {
    return basePoints;
  }
  
  // Small bonus for draws
  if (result === 'draw') {
    return Math.round(basePoints * 1.2);
  }
  
  // Calculate rating difference (positive means opponent is higher rated)
  const ratingDifference = opponentRating - playerRating;
  
  // Determine multiplier based on upset magnitude
  let multiplier: number;
  
  if (ratingDifference >= 400) {
    multiplier = POINTS_MULTIPLIERS.MASSIVE_UPSET;
  } else if (ratingDifference >= 300) {
    multiplier = POINTS_MULTIPLIERS.MAJOR_UPSET;
  } else if (ratingDifference >= 200) {
    multiplier = POINTS_MULTIPLIERS.MODERATE_UPSET;
  } else if (ratingDifference >= 100) {
    multiplier = POINTS_MULTIPLIERS.MINOR_UPSET;
  } else if (ratingDifference >= -100) {
    multiplier = POINTS_MULTIPLIERS.EVEN_MATCH;
  } else {
    // Higher rated player beating lower rated player
    multiplier = POINTS_MULTIPLIERS.EXPECTED_WIN;
  }
  
  // Calculate final points (minimum 15 for wins, maximum 150)
  const bonusPoints = Math.round(basePoints * multiplier);
  return Math.max(15, Math.min(150, bonusPoints));
}

/**
 * Create an ELO history entry for tracking rating changes
 * @param playerId - Player's ID
 * @param newRating - Player's new rating
 * @param ratingChange - Change in rating
 * @param opponentId - Opponent's ID
 * @param opponentRating - Opponent's rating before the match
 * @param tournamentId - Tournament ID
 * @param result - Match result
 * @returns ELO history entry
 */
export function createEloHistoryEntry(
  newRating: number,
  ratingChange: number,
  opponentId: string,
  opponentRating: number,
  tournamentId: string,
  result: 'win' | 'loss' | 'draw'
): EloHistoryEntry {
  return {
    date: new Date(),
    rating: newRating,
    change: ratingChange,
    opponentId,
    opponentRating,
    tournamentId,
    result,
  };
}

/**
 * Calculate tournament-wide ELO changes for all participants
 * This function processes tournament results and calculates ELO changes
 * for all matches that occurred during the tournament
 */
export function calculateTournamentEloChanges(
  participants: Array<{
    playerId: string;
    currentRating: number;
    gamesPlayed: number;
    matches: Array<{
      opponentId: string;
      opponentRating: number;
      opponentGamesPlayed: number;
      result: 'win' | 'loss' | 'draw';
    }>;
  }>
): Map<string, { newRating: number; ratingChange: number; totalBonusPoints: number }> {
  const results = new Map();
  
  // Process each participant's matches
  for (const participant of participants) {
    let totalRatingChange = 0;
    let totalBonusPoints = 0;
    let currentRating = participant.currentRating;
    
    // Calculate changes for each match
    for (const match of participant.matches) {
      const eloResult = calculateEloChange(
        {
          playerRating: currentRating,
          opponentRating: match.opponentRating,
          playerResult: match.result,
        },
        participant.gamesPlayed,
        match.opponentGamesPlayed
      );
      
      totalRatingChange += eloResult.playerRatingChange;
      totalBonusPoints += eloResult.pointsAwarded;
      currentRating = eloResult.newPlayerRating;
    }
    
    results.set(participant.playerId, {
      newRating: currentRating,
      ratingChange: totalRatingChange,
      totalBonusPoints,
    });
  }
  
  return results;
}
