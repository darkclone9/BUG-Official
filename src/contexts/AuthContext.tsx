'use client';

import { createUser, createUserStats, getAdminUser, getUser, updateUser, awardWelcomePoints } from '@/lib/database';
import { auth, signInWithGoogle as firebaseSignInWithGoogle } from '@/lib/firebase';
import { AdminUser, User, UserStats, UserRole } from '@/types/types';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    User as FirebaseUser,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as permissions from '@/lib/permissions';

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
  // Permission checking functions
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllRoles: (roles: UserRole[]) => boolean;
  canEditPointsSettings: () => boolean;
  canApprovePoints: () => boolean;
  canAwardPoints: () => boolean;
  canManageShopProducts: () => boolean;
  canManageShopOrders: () => boolean;
  canCreateEvents: () => boolean;
  canAccessAdminPanel: () => boolean;
  canAccessShopManagement: () => boolean;
  canAccessPointsManagement: () => boolean;
  canEditUserRoles: (targetUserRoles: UserRole[]) => boolean;
  canAssignRole: (roleToAssign: UserRole) => boolean;
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
              ...(firebaseUser.photoURL && { avatar: firebaseUser.photoURL }),
              role: 'member',
              roles: ['member'], // Initialize with member role
              points: 0,
              weeklyPoints: 0,
              monthlyPoints: 0,
              eloRating: 1200, // Default ELO rating for new users
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

            // Check for and award welcome points promotion
            try {
              const welcomeResult = await awardWelcomePoints(
                firebaseUser.uid,
                firebaseUser.email!,
                firebaseUser.displayName || 'Anonymous'
              );

              if (welcomeResult.awarded) {
                console.log(`Welcome points awarded: ${welcomeResult.points} points (recipient #${welcomeResult.recipientNumber})`);
                // Update local user state with the awarded points
                newUser.points = welcomeResult.points;
              }
            } catch (error) {
              console.error('Error awarding welcome points:', error);
              // Don't fail signup if welcome points fail
            }

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
      ...(firebaseUser.photoURL && { avatar: firebaseUser.photoURL }),
      role: 'member',
      roles: ['member'], // Initialize with member role
      points: 0,
      weeklyPoints: 0,
      monthlyPoints: 0,
      eloRating: 1200, // Default ELO rating for new users
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

    // Check for and award welcome points promotion
    try {
      const welcomeResult = await awardWelcomePoints(
        firebaseUser.uid,
        firebaseUser.email!,
        displayName
      );

      if (welcomeResult.awarded) {
        console.log(`Welcome points awarded: ${welcomeResult.points} points (recipient #${welcomeResult.recipientNumber})`);
        // Update local user state with the awarded points
        newUser.points = welcomeResult.points;
      }
    } catch (error) {
      console.error('Error awarding welcome points:', error);
      // Don't fail signup if welcome points fail
    }

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

  // Permission checking functions
  const getUserRoles = (): UserRole[] => {
    return user?.roles || [];
  };

  const hasRole = (role: UserRole): boolean => {
    return permissions.hasRole(getUserRoles(), role);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return permissions.hasAnyRole(getUserRoles(), roles);
  };

  const hasAllRoles = (roles: UserRole[]): boolean => {
    return permissions.hasAllRoles(getUserRoles(), roles);
  };

  const canEditPointsSettings = (): boolean => {
    return permissions.canEditPointsSettings(getUserRoles());
  };

  const canApprovePoints = (): boolean => {
    return permissions.canApprovePoints(getUserRoles());
  };

  const canAwardPoints = (): boolean => {
    return permissions.canAwardPoints(getUserRoles());
  };

  const canManageShopProducts = (): boolean => {
    return permissions.canManageShopProducts(getUserRoles());
  };

  const canManageShopOrders = (): boolean => {
    return permissions.canManageShopOrders(getUserRoles());
  };

  const canCreateEvents = (): boolean => {
    return permissions.canCreateEvents(getUserRoles());
  };

  const canAccessAdminPanel = (): boolean => {
    return permissions.canAccessAdminPanel(getUserRoles());
  };

  const canAccessShopManagement = (): boolean => {
    return permissions.canAccessShopManagement(getUserRoles());
  };

  const canAccessPointsManagement = (): boolean => {
    return permissions.canAccessPointsManagement(getUserRoles());
  };

  const canEditUserRoles = (targetUserRoles: UserRole[]): boolean => {
    return permissions.canEditUserRoles(getUserRoles(), targetUserRoles);
  };

  const canAssignRole = (roleToAssign: UserRole): boolean => {
    return permissions.canAssignRole(getUserRoles(), roleToAssign);
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
    // Permission checking functions
    hasRole,
    hasAnyRole,
    hasAllRoles,
    canEditPointsSettings,
    canApprovePoints,
    canAwardPoints,
    canManageShopProducts,
    canManageShopOrders,
    canCreateEvents,
    canAccessAdminPanel,
    canAccessShopManagement,
    canAccessPointsManagement,
    canEditUserRoles,
    canAssignRole,
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
