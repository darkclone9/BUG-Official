# Points Management Access Restrictions

## Overview

As of commit `4f914f8`, **Points Management** is now restricted to **President and Co-President roles only**. This change provides better security and control over the rewards program by limiting access to the highest-level administrators.

---

## What Changed

### 1. **Permission Functions Updated** (`src/lib/permissions.ts`)

All points-related permission functions now restrict access to President and Co-President only:

| Function | Previous Access | New Access |
|----------|----------------|------------|
| `canAccessPointsManagement()` | Admin and above | President & Co-President only |
| `canEditPointsSettings()` | President, Co-President, Head Admin | President & Co-President only |
| `canApprovePoints()` | Admin and above | President & Co-President only |
| `canAwardPoints()` | Admin and above | President & Co-President only |
| `canApproveVolunteerPoints()` | Officer and above | President & Co-President only |
| `canCreateMultipliers()` | Head Admin and above | President & Co-President only |

### 2. **Admin Panel Updates** (`src/app/admin/page.tsx`)

- The **Points** tab is now conditionally rendered based on `canAccessPointsManagement()` permission
- Only President and Co-President users will see the Points tab in the admin panel
- The tab content is also conditionally rendered for additional security

### 3. **Protected Route Component** (`src/components/ProtectedRoute.tsx`)

Added a new `presidentOnly` prop to the `ProtectedRoute` component:

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  presidentOnly?: boolean;  // NEW
}
```

This allows pages to be protected at the route level, redirecting unauthorized users to the dashboard.

### 4. **Promotions Page** (`src/app/admin/promotions/page.tsx`)

- Changed from `<ProtectedRoute adminOnly>` to `<ProtectedRoute presidentOnly>`
- Updated page description to indicate "President/Co-President Only"
- Ensures only authorized users can access promotions and campaigns

### 5. **Firestore Security Rules** (`firestore.rules`)

#### New Helper Functions

```javascript
// Check if user has a specific role in their roles array
function hasRole(role) {
  return isSignedIn() &&
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         (role in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles);
}

// Check if user is President or Co-President
function isPresidentOrCoPresident() {
  return hasRole('president') || hasRole('co_president');
}
```

#### Updated Collection Rules

All points-related collections now use `isPresidentOrCoPresident()` for write access:

- **points_transactions** - Only President/Co-President can create, update, delete
- **points_settings** - Only President/Co-President can modify settings
- **points_multipliers** - Only President/Co-President can manage multipliers
- **welcome_bonuses** - Only President/Co-President can manage bonuses
- **sales_promotions** - Only President/Co-President can manage promotions
- **point_giveaways** - Only President/Co-President can manage giveaways

**Note:** Read access for active promotions remains public, but all promotions can only be read by President/Co-President.

---

## Impact on Users

### President & Co-President
✅ **Full Access** - No changes, continue to have full access to all points management features

### Head Admin
❌ **Access Removed** - Can no longer:
- Edit points settings
- Create points multipliers
- Access points management panel

### Admin
❌ **Access Removed** - Can no longer:
- Approve points transactions
- Award points
- Access points management panel

### Officer
❌ **Access Removed** - Can no longer:
- Approve volunteer points

### Other Roles
❌ **No Access** - No changes, continue to have no access

---

## Affected Features

### Admin Panel
- **Points Tab** - Only visible to President/Co-President
- **Shop Admin > Points Approval** - Only accessible to President/Co-President
- **Shop Admin > Points Settings** - Only accessible to President/Co-President

### Promotions & Campaigns
- **Points Multipliers** - Only manageable by President/Co-President
- **Welcome Bonuses** - Only manageable by President/Co-President
- **Sales & Discounts** - Only manageable by President/Co-President
- **Point Giveaways** - Only manageable by President/Co-President

### Points Management
- **Award Points** - Only President/Co-President can award points
- **Approve Transactions** - Only President/Co-President can approve
- **Edit Settings** - Only President/Co-President can modify

---

## Security Benefits

1. **Centralized Control** - Points system is now controlled by top leadership only
2. **Reduced Risk** - Fewer users with access means lower risk of unauthorized changes
3. **Clear Accountability** - Only President and Co-President are responsible for points
4. **Database Security** - Firestore rules enforce restrictions at the database level
5. **UI Security** - Frontend hides features from unauthorized users

---

## Migration Notes

### For Existing Admins/Head Admins

If you previously had access to points management features and now see them missing:

1. This is expected behavior - access is now restricted to President/Co-President only
2. Contact the President or Co-President if you need points-related actions performed
3. Your other admin permissions remain unchanged

### For Developers

When working with points-related features:

1. Always check `canAccessPointsManagement()` before showing points UI
2. Use `presidentOnly` prop on routes that should be President/Co-President only
3. Remember that Firestore rules will reject unauthorized writes even if UI allows them
4. Test with different role levels to ensure proper access control

---

## Testing Checklist

- [x] President can access Points tab in admin panel
- [x] Co-President can access Points tab in admin panel
- [x] Head Admin cannot access Points tab
- [x] Admin cannot access Points tab
- [x] Firestore rules deployed successfully
- [x] Promotions page restricted to President/Co-President
- [x] Shop admin points features restricted properly

---

## Rollback Instructions

If you need to rollback these changes:

1. Revert commit `4f914f8`:
   ```bash
   git revert 4f914f8
   ```

2. Redeploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

3. Restart the development server

---

## Related Documentation

- [Permission System Documentation](../src/lib/permissions.ts)
- [Admin Promotions Guide](./ADMIN_PROMOTIONS_GUIDE.md)
- [Firestore Security Rules](../firestore.rules)

---

## Questions or Issues?

If you have questions about these changes or encounter issues:

1. Check the [Permission System](../src/lib/permissions.ts) for role definitions
2. Review the [Firestore Rules](../firestore.rules) for database-level restrictions
3. Contact the development team or President/Co-President for assistance

---

**Last Updated:** 2025-10-12  
**Commit:** 4f914f8  
**Branch:** profile-messaging-social

