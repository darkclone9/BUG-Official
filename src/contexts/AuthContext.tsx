'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, signInWithGoogle as firebaseSignInWithGoogle } from '@/lib/firebase';
import { User, AdminUser, UserStats } from '@/types/types';
import { createUser, getUser, updateUser, getAdminUser, createUserStats } from '@/lib/database';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  adminUser: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin' && adminUser !== null;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Fetch user data from Firestore using database service
          let userData = await getUser(firebaseUser.uid);

          if (!userData) {
            // Create new user document
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || 'Anonymous',
              avatar: firebaseUser.photoURL || undefined,
              role: 'member',
              points: 0,
              weeklyPoints: 0,
              monthlyPoints: 0,
              joinDate: new Date(),
              achievements: [],
              isActive: true,
              lastLoginDate: new Date(),
              preferences: {
                notifications: true,
                emailUpdates: true,
                favoriteGames: [],
              },
            };

            await createUser(newUser);

            // Create initial user stats
            const initialStats: UserStats = {
              uid: firebaseUser.uid,
              totalGamesPlayed: 0,
              totalWins: 0,
              totalLosses: 0,
              winRate: 0,
              currentStreak: 0,
              longestStreak: 0,
              gameStats: {},
              lastUpdated: new Date(),
            };

            await createUserStats(initialStats);
            userData = newUser;
          } else {
            // Update last login date
            await updateUser(firebaseUser.uid, { lastLoginDate: new Date() });
          }

          setUser(userData);

          // Check if user is admin and fetch admin data
          if (userData.role === 'admin') {
            const adminData = await getAdminUser(firebaseUser.uid);
            setAdminUser(adminData);
          } else {
            setAdminUser(null);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setUser(null);
          setAdminUser(null);
        }
      } else {
        setUser(null);
        setAdminUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

    // Create user document in Firestore using database service
    const newUser: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName,
      avatar: firebaseUser.photoURL || undefined,
      role: 'member',
      points: 0,
      weeklyPoints: 0,
      monthlyPoints: 0,
      joinDate: new Date(),
      achievements: [],
      isActive: true,
      lastLoginDate: new Date(),
      preferences: {
        notifications: true,
        emailUpdates: true,
        favoriteGames: [],
      },
    };

    await createUser(newUser);

    // Create initial user stats
    const initialStats: UserStats = {
      uid: firebaseUser.uid,
      totalGamesPlayed: 0,
      totalWins: 0,
      totalLosses: 0,
      winRate: 0,
      currentStreak: 0,
      longestStreak: 0,
      gameStats: {},
      lastUpdated: new Date(),
    };

    await createUserStats(initialStats);

    // Update the local state immediately to ensure the user is authenticated
    setUser(newUser);
    setFirebaseUser(firebaseUser);
  };

  const signInWithGoogle = async () => {
    await firebaseSignInWithGoogle();
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshUser = async () => {
    if (!firebaseUser) return;
    
    try {
      const userData = await getUser(firebaseUser.uid);
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const value = {
    user,
    firebaseUser,
    adminUser,
    loading,
    isAdmin,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile: async () => {},
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

