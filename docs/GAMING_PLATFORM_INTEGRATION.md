# Gaming Platform Integration - Research & Implementation Guide

## Overview
This document outlines the research and implementation plan for integrating gaming platforms (Steam, Xbox Live, PlayStation Network) with the BUG Gaming Club quests system to award store credit for gaming achievements.

---

## Important: Reward Balance

**Critical Principle:** Gaming achievements should award **significantly less** store credit than club participation activities.

### Recommended Reward Structure

**Club Participation (Primary Focus):**
- Event attendance: $1.00 - $2.00
- Volunteer work: $2.50 - $5.00
- Event hosting: $5.00 - $10.00
- Tournament wins: $5.00 - $20.00

**Gaming Achievements (Secondary):**
- Common achievement: $0.01 - $0.05
- Uncommon achievement: $0.05 - $0.10
- Rare achievement: $0.10 - $0.25
- Epic achievement: $0.25 - $0.50
- Legendary achievement: $0.50 - $1.00

**Rationale:**
- Encourages real-world club participation
- Prevents gaming achievement farming
- Maintains focus on community building
- Gaming achievements are bonus rewards, not primary income

---

## Steam API Integration

### Overview
Steam provides a comprehensive Web API for accessing user data, including achievements, game library, and playtime.

**Official Documentation:** https://steamcommunity.com/dev

---

### Steam API Capabilities

**Available Data:**
- ✅ User's game library
- ✅ Game achievements (per game)
- ✅ Achievement unlock timestamps
- ✅ Playtime statistics
- ✅ User profile information
- ✅ Friend list
- ❌ Real-time achievement notifications (polling required)

**Authentication:**
- Steam Web API Key (free)
- Steam OpenID for user authentication
- No OAuth - uses Steam's OpenID system

---

### Implementation Plan

#### Phase 1: Steam Account Linking

**Steps:**

1. **Get Steam Web API Key**
   - Register at: https://steamcommunity.com/dev/apikey
   - Free, instant approval
   - Store in environment variable: `STEAM_API_KEY`

2. **Implement Steam OpenID Authentication**
   ```typescript
   // src/lib/steam/steamAuth.ts
   import { SteamAuth } from 'node-steam-openid';
   
   const steam = new SteamAuth({
     realm: process.env.NEXT_PUBLIC_APP_URL,
     returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/steam/callback`,
     apiKey: process.env.STEAM_API_KEY!,
   });
   
   export async function getSteamLoginUrl() {
     return await steam.getRedirectUrl();
   }
   
   export async function verifySteamLogin(query: any) {
     const user = await steam.authenticate(query);
     return user; // Contains steamId, username, avatar, etc.
   }
   ```

3. **Create Steam Link Page** (`src/app/settings/integrations/page.tsx`)
   - Button to link Steam account
   - Display linked Steam profile
   - Unlink option
   - Show synced achievements

4. **Store Steam ID in User Profile**
   ```typescript
   // Add to User type
   export interface User {
     // ... existing fields
     steamId?: string;
     steamUsername?: string;
     steamAvatarUrl?: string;
     steamLinkedAt?: Date;
   }
   ```

**Estimated Time:** 2-3 days

---

#### Phase 2: Achievement Syncing

**Steps:**

1. **Fetch User's Steam Achievements**
   ```typescript
   // src/lib/steam/steamService.ts
   import axios from 'axios';
   
   const STEAM_API_BASE = 'https://api.steampowered.com';
   
   export async function getSteamAchievements(steamId: string, appId: number) {
     const response = await axios.get(
       `${STEAM_API_BASE}/ISteamUserStats/GetPlayerAchievements/v1/`,
       {
         params: {
           key: process.env.STEAM_API_KEY,
           steamid: steamId,
           appid: appId,
         },
       }
     );
     
     return response.data.playerstats.achievements;
   }
   
   export async function getOwnedGames(steamId: string) {
     const response = await axios.get(
       `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/`,
       {
         params: {
           key: process.env.STEAM_API_KEY,
           steamid: steamId,
           include_appinfo: true,
           include_played_free_games: true,
         },
       }
     );
     
     return response.data.response.games;
   }
   ```

2. **Create Achievement Mapping**
   - Map Steam achievements to BUG quests
   - Define reward values based on rarity
   - Store in Firestore collection: `steam_achievement_mappings`

3. **Sync Achievements Periodically**
   - Create cron job or scheduled function
   - Check for new achievements every 24 hours
   - Award store credit for new achievements
   - Prevent duplicate rewards

4. **Create Achievement Sync UI**
   - Manual "Sync Now" button
   - Last sync timestamp
   - List of synced achievements
   - Rewards earned from Steam

**Estimated Time:** 3-4 days

---

#### Phase 3: Automatic Syncing

**Options:**

**Option A: Polling (Recommended)**
- Check for new achievements every 24 hours
- Use Firebase Cloud Functions or Vercel Cron Jobs
- Low cost, simple implementation

**Option B: Webhooks (Not Available)**
- Steam does not provide webhooks
- Would need to poll anyway

**Implementation:**
```typescript
// src/app/api/cron/sync-steam/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Get all users with linked Steam accounts
  const users = await getUsersWithSteam();
  
  for (const user of users) {
    await syncUserSteamAchievements(user.uid, user.steamId);
  }
  
  return new Response('OK');
}
```

**Estimated Time:** 2 days

---

### Steam Integration Costs

- **API Key:** Free
- **API Calls:** Free, unlimited
- **Rate Limits:** 100,000 calls/day (very generous)
- **Total Cost:** $0/month

---

## Xbox Live API Integration

### Overview
Xbox Live provides APIs for accessing user data, achievements, and game statistics through the Xbox Live Services API.

**Official Documentation:** https://docs.microsoft.com/en-us/gaming/xbox-live/

---

### Xbox Live API Capabilities

**Available Data:**
- ✅ User profile
- ✅ Achievements
- ✅ Gamerscore
- ✅ Game library
- ✅ Playtime statistics
- ✅ Friends list
- ⚠️ Requires Xbox Live account

**Authentication:**
- Microsoft Azure AD OAuth 2.0
- Requires app registration
- User consent required

---

### Implementation Plan

#### Phase 1: Xbox Account Linking

**Steps:**

1. **Register App on Azure**
   - Create app at: https://portal.azure.com/
   - Get Client ID and Client Secret
   - Configure redirect URI
   - Request Xbox Live permissions

2. **Implement OAuth Flow**
   ```typescript
   // src/lib/xbox/xboxAuth.ts
   import { ConfidentialClientApplication } from '@azure/msal-node';
   
   const msalConfig = {
     auth: {
       clientId: process.env.XBOX_CLIENT_ID!,
       authority: 'https://login.microsoftonline.com/consumers',
       clientSecret: process.env.XBOX_CLIENT_SECRET!,
     },
   };
   
   const pca = new ConfidentialClientApplication(msalConfig);
   
   export async function getXboxLoginUrl() {
     const authCodeUrlParameters = {
       scopes: ['Xboxlive.signin', 'Xboxlive.offline_access'],
       redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/xbox/callback`,
     };
     
     return await pca.getAuthCodeUrl(authCodeUrlParameters);
   }
   ```

3. **Fetch Xbox User Token**
   - Exchange auth code for access token
   - Get Xbox Live token (XSTS token)
   - Store in user profile

**Estimated Time:** 3-4 days

---

#### Phase 2: Achievement Syncing

**Steps:**

1. **Fetch Xbox Achievements**
   ```typescript
   // src/lib/xbox/xboxService.ts
   export async function getXboxAchievements(xuid: string, titleId: string) {
     const response = await axios.get(
       `https://achievements.xboxlive.com/users/xuid(${xuid})/achievements`,
       {
         headers: {
           'Authorization': `XBL3.0 x=${userHash};${xstsToken}`,
           'x-xbl-contract-version': '2',
         },
         params: {
           titleId: titleId,
         },
       }
     );
     
     return response.data.achievements;
   }
   ```

2. **Map Achievements to Quests**
   - Similar to Steam implementation
   - Award store credit based on Gamerscore value
   - Prevent duplicate rewards

**Estimated Time:** 3-4 days

---

### Xbox Integration Costs

- **Azure App Registration:** Free
- **API Calls:** Free
- **Rate Limits:** Varies by endpoint
- **Total Cost:** $0/month

---

## PlayStation Network API Integration

### Overview
PlayStation Network (PSN) does not have an official public API. Third-party APIs exist but are unofficial and may violate ToS.

**Status:** ⚠️ **Not Recommended**

---

### PSN API Options

#### Option 1: Unofficial APIs (Not Recommended)

**Available Services:**
- PSN API (unofficial, community-maintained)
- TrueTrophies API (requires partnership)
- PSNProfiles API (scraping-based)

**Risks:**
- ✗ Violates PlayStation ToS
- ✗ No official support
- ✗ May break at any time
- ✗ Potential account bans
- ✗ Legal liability

**Recommendation:** **Do not implement** until Sony provides official API

---

#### Option 2: Manual Entry

**Alternative Approach:**
- Users manually enter PSN ID
- Display PSN profile (if public)
- Users self-report achievements
- Admin verification required

**Pros:**
- ✅ No ToS violations
- ✅ Simple implementation
- ✅ User control

**Cons:**
- ❌ Manual verification needed
- ❌ Potential for fraud
- ❌ Not automated

**Estimated Time:** 1-2 days

---

## Recommended Implementation Priority

### Phase 1: Steam Integration (Recommended First)
- **Reason:** Official API, free, unlimited, easy to implement
- **Timeline:** 1-2 weeks
- **Cost:** $0
- **User Base:** Large PC gaming community

### Phase 2: Xbox Live Integration
- **Reason:** Official API, free, good documentation
- **Timeline:** 2-3 weeks
- **Cost:** $0
- **User Base:** Console gamers

### Phase 3: PlayStation Network (Future)
- **Reason:** Wait for official API
- **Timeline:** TBD (when Sony releases API)
- **Alternative:** Manual entry with admin verification

---

## Achievement Reward Calculation

### Automatic Reward Assignment

**Steam:**
```typescript
function calculateSteamAchievementReward(achievement: SteamAchievement): number {
  // Base reward: $0.05 (5 cents)
  let rewardCents = 5;
  
  // Adjust based on global unlock percentage (rarity)
  if (achievement.percent < 1) {
    rewardCents = 100; // Legendary: $1.00
  } else if (achievement.percent < 5) {
    rewardCents = 50;  // Epic: $0.50
  } else if (achievement.percent < 15) {
    rewardCents = 25;  // Rare: $0.25
  } else if (achievement.percent < 40) {
    rewardCents = 10;  // Uncommon: $0.10
  }
  
  return rewardCents;
}
```

**Xbox:**
```typescript
function calculateXboxAchievementReward(achievement: XboxAchievement): number {
  // Base reward: $0.01 per Gamerscore point
  const baseReward = achievement.gamerscore * 1; // 1 cent per GS
  
  // Cap at $1.00 per achievement
  return Math.min(baseReward, 100);
}
```

---

## Security Considerations

1. **Prevent Duplicate Rewards**
   - Store synced achievement IDs in Firestore
   - Check before awarding credit
   - Use unique achievement identifiers

2. **Rate Limiting**
   - Limit sync frequency (max once per 24 hours)
   - Prevent API abuse
   - Implement cooldowns

3. **Verification**
   - Verify achievement unlock timestamps
   - Check for suspicious patterns
   - Admin review for high-value achievements

4. **Privacy**
   - Only sync public profile data
   - Allow users to unlink accounts
   - Don't store sensitive data

---

## Database Schema

### Firestore Collections

**`gaming_platform_links`**
```typescript
{
  userId: string;
  platform: 'steam' | 'xbox' | 'psn';
  platformUserId: string;
  platformUsername: string;
  platformAvatarUrl?: string;
  linkedAt: Date;
  lastSyncedAt?: Date;
  isActive: boolean;
}
```

**`synced_achievements`**
```typescript
{
  id: string;
  userId: string;
  platform: 'steam' | 'xbox' | 'psn';
  achievementId: string;
  achievementName: string;
  gameId: string;
  gameName: string;
  unlockedAt: Date;
  syncedAt: Date;
  rewardCents: number;
  rewardClaimed: boolean;
}
```

---

## Summary & Next Steps

### Completed
- ✅ Quest system types defined
- ✅ Quests page created with initial website-based quests
- ✅ Gaming platform integration research complete

### Ready to Implement
- 📋 Steam integration (1-2 weeks)
- 📋 Xbox Live integration (2-3 weeks)
- 📋 Quest reward claiming system
- 📋 Achievement sync cron jobs

### Future Enhancements
- 📋 PlayStation Network (when official API available)
- 📋 Discord Rich Presence integration
- 📋 Twitch integration (streaming achievements)
- 📋 Epic Games Store integration

### Recommended Next Steps
1. **Implement Steam integration first** (largest user base, easiest API)
2. **Create quest reward claiming system** (backend + UI)
3. **Set up achievement sync cron job**
4. **Add Xbox Live integration**
5. **Monitor and adjust reward values** based on user feedback

---

*Last Updated: 2025-10-15*

