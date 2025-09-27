'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameGenre } from '@/types/types';
import { getGameGenres } from '@/lib/database';

interface UseGameGenresOptions {
  activeOnly?: boolean;
  includeGeneral?: boolean;
}

interface UseGameGenresReturn {
  genres: GameGenre[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getGenreById: (id: string) => GameGenre | undefined;
  getGenreByName: (name: string) => GameGenre | undefined;
  getGenreOptions: () => Array<{ value: string; label: string }>;
}

/**
 * Custom hook for managing game genres
 * Provides cached access to game genres with automatic loading and error handling
 */
export function useGameGenres(options: UseGameGenresOptions = {}): UseGameGenresReturn {
  const { activeOnly = true, includeGeneral = true } = options;
  
  const [genres, setGenres] = useState<GameGenre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGenres = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let genreData = await getGameGenres(activeOnly);
      
      // Filter out general genre if not included
      if (!includeGeneral) {
        genreData = genreData.filter(genre => genre.name !== 'general');
      }
      
      setGenres(genreData);
    } catch (err) {
      console.error('Error loading game genres:', err);
      setError(err instanceof Error ? err.message : 'Failed to load game genres');
    } finally {
      setLoading(false);
    }
  }, [activeOnly, includeGeneral]);

  useEffect(() => {
    loadGenres();
  }, [loadGenres]);

  const getGenreById = useCallback((id: string): GameGenre | undefined => {
    return genres.find(genre => genre.id === id);
  }, [genres]);

  const getGenreByName = useCallback((name: string): GameGenre | undefined => {
    return genres.find(genre => genre.name === name);
  }, [genres]);

  const getGenreOptions = useCallback((): Array<{ value: string; label: string }> => {
    return genres.map(genre => ({
      value: genre.name,
      label: genre.displayName
    }));
  }, [genres]);

  const refetch = useCallback(async () => {
    await loadGenres();
  }, [loadGenres]);

  return {
    genres,
    loading,
    error,
    refetch,
    getGenreById,
    getGenreByName,
    getGenreOptions,
  };
}

/**
 * Hook specifically for getting genre options for dropdowns
 * Returns a simplified interface for form components
 */
export function useGameGenreOptions(includeGeneral: boolean = true) {
  const { genres, loading, error } = useGameGenres({ 
    activeOnly: true, 
    includeGeneral 
  });

  const options = genres.map(genre => ({
    value: genre.name,
    label: genre.displayName,
    description: genre.description,
    color: genre.color,
  }));

  return { options, loading, error };
}

/**
 * Hook for getting a single genre by ID or name
 * Useful for displaying genre information in components
 */
export function useGameGenre(identifier: string, type: 'id' | 'name' = 'id') {
  const { genres, loading, error } = useGameGenres({ activeOnly: false });
  
  const genre = type === 'id' 
    ? genres.find(g => g.id === identifier)
    : genres.find(g => g.name === identifier);

  return { genre, loading, error };
}

/**
 * Legacy compatibility function
 * Maps old GameType values to new genre names
 */
export function mapLegacyGameType(gameType: string): string {
  const legacyMapping: Record<string, string> = {
    'mario_kart': 'mario_kart',
    'super_smash_bros': 'super_smash_bros',
    'general': 'general',
  };

  return legacyMapping[gameType] || gameType;
}

/**
 * Helper function to get display name for a game type
 * Handles both legacy and new genre systems
 */
export function getGameDisplayName(gameType: string, genres: GameGenre[]): string {
  const genre = genres.find(g => g.name === gameType || g.id === gameType);
  
  if (genre) {
    return genre.displayName;
  }

  // Fallback for legacy types
  const legacyNames: Record<string, string> = {
    'mario_kart': 'Mario Kart',
    'super_smash_bros': 'Super Smash Bros',
    'general': 'General Gaming',
  };

  return legacyNames[gameType] || gameType;
}
