/**
 * Custom hook for permission checking
 * 
 * This hook provides easy access to all permission checking functions
 * through the AuthContext.
 * 
 * Usage:
 * ```tsx
 * const { canEditPointsSettings, canManageShopProducts } = usePermissions();
 * 
 * if (canEditPointsSettings()) {
 *   // Show settings UI
 * }
 * ```
 */

import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/types';

export function usePermissions() {
  const auth = useAuth();

  return {
    // Role checking
    hasRole: (role: UserRole) => auth.hasRole(role),
    hasAnyRole: (roles: UserRole[]) => auth.hasAnyRole(roles),
    hasAllRoles: (roles: UserRole[]) => auth.hasAllRoles(roles),

    // Points system permissions
    canEditPointsSettings: () => auth.canEditPointsSettings(),
    canApprovePoints: () => auth.canApprovePoints(),
    canAwardPoints: () => auth.canAwardPoints(),

    // Shop permissions
    canManageShopProducts: () => auth.canManageShopProducts(),
    canManageShopOrders: () => auth.canManageShopOrders(),

    // Event permissions
    canCreateEvents: () => auth.canCreateEvents(),

    // Admin panel access
    canAccessAdminPanel: () => auth.canAccessAdminPanel(),
    canAccessShopManagement: () => auth.canAccessShopManagement(),
    canAccessPointsManagement: () => auth.canAccessPointsManagement(),

    // Role management permissions
    canEditUserRoles: (targetUserRoles: UserRole[]) => auth.canEditUserRoles(targetUserRoles),
    canAssignRole: (roleToAssign: UserRole) => auth.canAssignRole(roleToAssign),

    // User info
    user: auth.user,
    userRoles: auth.user?.roles || [],
    isAdmin: auth.isAdmin,
  };
}

/**
 * Hook to check if user has minimum required role
 * Returns true if user has any of the specified roles
 */
export function useRequireRole(requiredRoles: UserRole[]): boolean {
  const { hasAnyRole } = usePermissions();
  return hasAnyRole(requiredRoles);
}

/**
 * Hook to check if user can access admin features
 */
export function useIsAdmin(): boolean {
  const { hasAnyRole } = usePermissions();
  return hasAnyRole(['admin', 'head_admin', 'co_president', 'president']);
}

/**
 * Hook to check if user is a top-level admin (President, Co-President, Head Admin)
 */
export function useIsTopAdmin(): boolean {
  const { hasAnyRole } = usePermissions();
  return hasAnyRole(['president', 'co_president', 'head_admin']);
}

/**
 * Hook to get user's highest role
 */
export function useHighestRole(): UserRole {
  const { userRoles } = usePermissions();
  
  // Import permissions to use getHighestRole
  const { getHighestRole } = require('@/lib/permissions');
  return getHighestRole(userRoles);
}

