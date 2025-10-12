/**
 * Role-Based Permission System
 *
 * This module handles all permission checks for the BUG Gaming Club website.
 *
 * Role Hierarchy (highest to lowest):
 * 1. President - Can do everything, edit all roles
 * 2. Co-President - Can do everything, edit all roles except President
 * 3. Head Admin - Can edit admin roles and below, manage shop settings
 * 4. Admin - Can approve points, manage orders, create events
 * 5. Officer - Can approve volunteer points, manage events
 * 6. Event Organizer - Can create/manage events
 * 7. Member - Regular user
 * 8. Guest - Limited access
 */

import { UserRole } from '@/types/types';

// Role hierarchy levels (higher number = more authority)
const ROLE_HIERARCHY: Record<string, number> = {
  president: 100,
  co_president: 90,
  head_admin: 80,
  admin: 70,
  officer: 60,
  event_organizer: 50,
  vice_president: 45, // Legacy role
  treasurer: 45, // Legacy role
  member: 10,
  guest: 0,
};

/**
 * Get the highest role level from a user's roles array
 */
export function getHighestRoleLevel(roles: UserRole[]): number {
  if (!roles || roles.length === 0) return 0;

  return Math.max(...roles.map(role => ROLE_HIERARCHY[role] || 0));
}

/**
 * Get the highest role from a user's roles array
 */
export function getHighestRole(roles: UserRole[]): UserRole {
  if (!roles || roles.length === 0) return 'guest';

  let highestRole: UserRole = 'guest';
  let highestLevel = 0;

  for (const role of roles) {
    const level = ROLE_HIERARCHY[role] || 0;
    if (level > highestLevel) {
      highestLevel = level;
      highestRole = role;
    }
  }

  return highestRole;
}

/**
 * Check if user has a specific role
 */
export function hasRole(userRoles: UserRole[], requiredRole: UserRole): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  return userRoles.includes(requiredRole);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  return requiredRoles.every(role => userRoles.includes(role));
}

/**
 * Check if user has minimum role level
 */
export function hasMinimumRoleLevel(userRoles: UserRole[], minimumLevel: number): boolean {
  return getHighestRoleLevel(userRoles) >= minimumLevel;
}

// ============================================================================
// ROLE MANAGEMENT PERMISSIONS
// ============================================================================

/**
 * Check if user can edit another user's roles
 *
 * Rules:
 * - President can edit all roles
 * - Co-President can edit all roles except President
 * - Head Admin can edit Admin and below
 * - Others cannot edit roles
 */
export function canEditUserRoles(
  editorRoles: UserRole[],
  targetUserRoles: UserRole[]
): boolean {
  const editorLevel = getHighestRoleLevel(editorRoles);
  const targetLevel = getHighestRoleLevel(targetUserRoles);

  // President can edit anyone
  if (hasRole(editorRoles, 'president')) {
    return true;
  }

  // Co-President can edit anyone except President
  if (hasRole(editorRoles, 'co_president')) {
    return !hasRole(targetUserRoles, 'president');
  }

  // Head Admin can edit Admin and below
  if (hasRole(editorRoles, 'head_admin')) {
    return targetLevel < ROLE_HIERARCHY.head_admin;
  }

  // Others cannot edit roles
  return false;
}

/**
 * Check if user can assign a specific role
 *
 * Rules:
 * - Can only assign roles at or below your level
 * - President can assign any role
 * - Co-President can assign any role except President
 * - Head Admin can assign Admin and below
 */
export function canAssignRole(
  assignerRoles: UserRole[],
  roleToAssign: UserRole
): boolean {
  const assignerLevel = getHighestRoleLevel(assignerRoles);
  const roleLevel = ROLE_HIERARCHY[roleToAssign] || 0;

  // President can assign any role
  if (hasRole(assignerRoles, 'president')) {
    return true;
  }

  // Co-President can assign any role except President
  if (hasRole(assignerRoles, 'co_president')) {
    return roleToAssign !== 'president';
  }

  // Head Admin can assign Admin and below
  if (hasRole(assignerRoles, 'head_admin')) {
    return roleLevel < ROLE_HIERARCHY.head_admin;
  }

  // Others cannot assign roles
  return false;
}

// ============================================================================
// POINTS SYSTEM PERMISSIONS
// ============================================================================

/**
 * Check if user can edit points settings
 * Only President and Co-President can edit settings
 */
export function canEditPointsSettings(userRoles: UserRole[]): boolean {
  return hasAnyRole(userRoles, ['president', 'co_president']);
}

/**
 * Check if user can approve points transactions
 * Only President and Co-President can approve points
 */
export function canApprovePoints(userRoles: UserRole[]): boolean {
  return hasAnyRole(userRoles, ['president', 'co_president']);
}

/**
 * Check if user can award points
 * Only President and Co-President can award points
 */
export function canAwardPoints(userRoles: UserRole[]): boolean {
  return hasAnyRole(userRoles, ['president', 'co_president']);
}

/**
 * Check if user can approve volunteer points
 * Only President and Co-President can approve volunteer points
 */
export function canApproveVolunteerPoints(userRoles: UserRole[]): boolean {
  return hasAnyRole(userRoles, ['president', 'co_president']);
}

/**
 * Check if user can create points multiplier campaigns
 * Only President and Co-President can create multipliers
 */
export function canCreateMultipliers(userRoles: UserRole[]): boolean {
  return hasAnyRole(userRoles, ['president', 'co_president']);
}

/**
 * Check if user can view all points transactions
 * Admin and above can view all transactions
 */
export function canViewAllPointsTransactions(userRoles: UserRole[]): boolean {
  return getHighestRoleLevel(userRoles) >= ROLE_HIERARCHY.admin;
}

// ============================================================================
// SHOP MANAGEMENT PERMISSIONS
// ============================================================================

/**
 * Check if user can manage shop products
 * Admin and above can manage products
 */
export function canManageShopProducts(userRoles: UserRole[]): boolean {
  return getHighestRoleLevel(userRoles) >= ROLE_HIERARCHY.admin;
}

/**
 * Check if user can manage shop orders
 * Admin and above can manage orders
 */
export function canManageShopOrders(userRoles: UserRole[]): boolean {
  return getHighestRoleLevel(userRoles) >= ROLE_HIERARCHY.admin;
}

/**
 * Check if user can manage pickup queue
 * Admin and above can manage pickup queue
 */
export function canManagePickupQueue(userRoles: UserRole[]): boolean {
  return getHighestRoleLevel(userRoles) >= ROLE_HIERARCHY.admin;
}

/**
 * Check if user can view all orders
 * Admin and above can view all orders
 */
export function canViewAllOrders(userRoles: UserRole[]): boolean {
  return getHighestRoleLevel(userRoles) >= ROLE_HIERARCHY.admin;
}

/**
 * Check if user can refund orders
 * Head Admin and above can refund orders
 */
export function canRefundOrders(userRoles: UserRole[]): boolean {
  return getHighestRoleLevel(userRoles) >= ROLE_HIERARCHY.head_admin;
}

// ============================================================================
// EVENT MANAGEMENT PERMISSIONS
// ============================================================================

/**
 * Check if user can create events
 * Event Organizer and above can create events
 */
export function canCreateEvents(userRoles: UserRole[]): boolean {
  return getHighestRoleLevel(userRoles) >= ROLE_HIERARCHY.event_organizer;
}

/**
 * Check if user can edit any event
 * Admin and above can edit any event
 */
export function canEditAnyEvent(userRoles: UserRole[]): boolean {
  return getHighestRoleLevel(userRoles) >= ROLE_HIERARCHY.admin;
}

/**
 * Check if user can delete events
 * Admin and above can delete events
 */
export function canDeleteEvents(userRoles: UserRole[]): boolean {
  return getHighestRoleLevel(userRoles) >= ROLE_HIERARCHY.admin;
}

// ============================================================================
// TOURNAMENT MANAGEMENT PERMISSIONS
// ============================================================================

/**
 * Check if user can create tournaments
 * Admin and above can create tournaments
 */
export function canCreateTournaments(userRoles: UserRole[]): boolean {
  return getHighestRoleLevel(userRoles) >= ROLE_HIERARCHY.admin;
}

/**
 * Check if user can manage tournament brackets
 * Admin and above can manage brackets
 */
export function canManageBrackets(userRoles: UserRole[]): boolean {
  return getHighestRoleLevel(userRoles) >= ROLE_HIERARCHY.admin;
}

// ============================================================================
// ADMIN PANEL ACCESS
// ============================================================================

/**
 * Check if user can access admin panel
 * Event Organizer and above can access admin panel
 */
export function canAccessAdminPanel(userRoles: UserRole[]): boolean {
  return getHighestRoleLevel(userRoles) >= ROLE_HIERARCHY.event_organizer;
}

/**
 * Check if user can access shop management panel
 * Admin and above can access shop management
 */
export function canAccessShopManagement(userRoles: UserRole[]): boolean {
  return getHighestRoleLevel(userRoles) >= ROLE_HIERARCHY.admin;
}

/**
 * Check if user can access points management panel
 * Only President and Co-President can access points management
 */
export function canAccessPointsManagement(userRoles: UserRole[]): boolean {
  return hasAnyRole(userRoles, ['president', 'co_president']);
}

/**
 * Check if user can access settings panel
 * Head Admin and above can access settings
 */
export function canAccessSettings(userRoles: UserRole[]): boolean {
  return getHighestRoleLevel(userRoles) >= ROLE_HIERARCHY.head_admin;
}
