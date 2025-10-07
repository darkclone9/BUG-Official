/**
 * Feature Flags Configuration
 * 
 * Centralized feature flag management for gradual rollout and A/B testing.
 * Flags can be controlled per environment and updated without code deployment.
 */

export interface FeatureFlags {
  messaging: {
    enabled: boolean;
    dmEnabled: boolean;
    tournamentLobbyEnabled: boolean;
    teamChannelEnabled: boolean;
    matchThreadEnabled: boolean;
    notificationsEnabled: boolean;
    mentionsEnabled: boolean;
    attachmentsEnabled: boolean;
    reactionsEnabled: boolean;
  };
  // Future flags can be added here
  experimental: {
    typingIndicators: boolean;
    messageSearch: boolean;
    presenceStatus: boolean;
  };
}

/**
 * Default feature flags
 * Set messaging.enabled to true to enable the messaging system
 */
const defaultFlags: FeatureFlags = {
  messaging: {
    enabled: process.env.NEXT_PUBLIC_MESSAGING_ENABLED === 'true',
    dmEnabled: process.env.NEXT_PUBLIC_MESSAGING_DM_ENABLED !== 'false', // default true when messaging enabled
    tournamentLobbyEnabled: process.env.NEXT_PUBLIC_MESSAGING_TOURNAMENT_ENABLED !== 'false',
    teamChannelEnabled: process.env.NEXT_PUBLIC_MESSAGING_TEAM_ENABLED !== 'false',
    matchThreadEnabled: process.env.NEXT_PUBLIC_MESSAGING_MATCH_ENABLED !== 'false',
    notificationsEnabled: process.env.NEXT_PUBLIC_MESSAGING_NOTIFICATIONS_ENABLED !== 'false',
    mentionsEnabled: process.env.NEXT_PUBLIC_MESSAGING_MENTIONS_ENABLED !== 'false',
    attachmentsEnabled: process.env.NEXT_PUBLIC_MESSAGING_ATTACHMENTS_ENABLED !== 'false',
    reactionsEnabled: process.env.NEXT_PUBLIC_MESSAGING_REACTIONS_ENABLED !== 'false',
  },
  experimental: {
    typingIndicators: process.env.NEXT_PUBLIC_TYPING_INDICATORS_ENABLED === 'true',
    messageSearch: process.env.NEXT_PUBLIC_MESSAGE_SEARCH_ENABLED === 'true',
    presenceStatus: process.env.NEXT_PUBLIC_PRESENCE_STATUS_ENABLED === 'true',
  },
};

/**
 * Get feature flags
 * Can be extended to fetch from remote config (Firebase Remote Config, LaunchDarkly, etc.)
 */
export const getFeatureFlags = (): FeatureFlags => {
  return defaultFlags;
};

/**
 * Check if messaging feature is enabled
 */
export const isMessagingEnabled = (): boolean => {
  return getFeatureFlags().messaging.enabled;
};

/**
 * Check if a specific messaging sub-feature is enabled
 */
export const isMessagingFeatureEnabled = (feature: keyof FeatureFlags['messaging']): boolean => {
  const flags = getFeatureFlags();
  return flags.messaging.enabled && flags.messaging[feature];
};

/**
 * Check if an experimental feature is enabled
 */
export const isExperimentalFeatureEnabled = (feature: keyof FeatureFlags['experimental']): boolean => {
  return getFeatureFlags().experimental[feature];
};
