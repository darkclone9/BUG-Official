'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Star,
  CheckCircle,
  Lock,
  Gamepad2,
  Users,
  UserCircle,
  Gift,
  TrendingUp,
  Calendar,
  ShoppingBag,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import { getActiveQuests, getUserQuestProgress, syncUserQuestProgress, claimQuestReward } from '@/lib/database';
import { Quest, UserQuest } from '@/types/types';

// Define initial website-based quests (fallback if no quests in database)
const INITIAL_QUESTS = [
  // Profile Setup Quests
  {
    id: 'create_account',
    name: 'Welcome to BUG!',
    description: 'Create your account and join the gaming club',
    category: 'profile_setup',
    rewardCents: 100, // $1.00
    icon: UserCircle,
    requirementType: 'boolean',
    requirementTarget: 1,
    trackingKey: 'account_created',
  },
  {
    id: 'complete_profile',
    name: 'Profile Master',
    description: 'Complete your profile with avatar, bio, and social links',
    category: 'profile_setup',
    rewardCents: 150, // $1.50
    icon: UserCircle,
    requirementType: 'count',
    requirementTarget: 3, // Avatar, bio, and at least one social link
    trackingKey: 'profile_fields_completed',
  },

  // Club Participation Quests
  {
    id: 'first_event',
    name: 'First Steps',
    description: 'Attend your first club event',
    category: 'club_participation',
    rewardCents: 200, // $2.00
    icon: Calendar,
    requirementType: 'count',
    requirementTarget: 1,
    trackingKey: 'events_attended',
  },
  {
    id: 'event_regular',
    name: 'Regular Attendee',
    description: 'Attend 5 club events',
    category: 'club_participation',
    rewardCents: 500, // $5.00
    icon: Calendar,
    requirementType: 'count',
    requirementTarget: 5,
    trackingKey: 'events_attended',
  },
  {
    id: 'first_tournament',
    name: 'Tournament Debut',
    description: 'Join your first tournament',
    category: 'club_participation',
    rewardCents: 250, // $2.50
    icon: Trophy,
    requirementType: 'count',
    requirementTarget: 1,
    trackingKey: 'tournaments_joined',
  },
  {
    id: 'first_win',
    name: 'Victory!',
    description: 'Win your first match in any tournament',
    category: 'club_participation',
    rewardCents: 300, // $3.00
    icon: Trophy,
    requirementType: 'count',
    requirementTarget: 1,
    trackingKey: 'matches_won',
  },
  {
    id: 'tournament_champion',
    name: 'Champion',
    description: 'Win a tournament',
    category: 'club_participation',
    rewardCents: 1000, // $10.00
    icon: Award,
    requirementType: 'count',
    requirementTarget: 1,
    trackingKey: 'tournaments_won',
  },

  // Shop & Social Quests
  {
    id: 'first_purchase',
    name: 'Shopaholic',
    description: 'Make your first shop purchase',
    category: 'social',
    rewardCents: 100, // $1.00
    icon: ShoppingBag,
    requirementType: 'count',
    requirementTarget: 1,
    trackingKey: 'shop_purchases',
  },
  {
    id: 'refer_friend',
    name: 'Recruiter',
    description: 'Refer a friend to join BUG Gaming Club',
    category: 'social',
    rewardCents: 500, // $5.00
    icon: Users,
    requirementType: 'count',
    requirementTarget: 1,
    trackingKey: 'referrals',
  },

  // Gaming Achievement Quests (Future - placeholder)
  {
    id: 'steam_connect',
    name: 'Steam Gamer',
    description: 'Connect your Steam account (Coming Soon)',
    category: 'gaming_achievements',
    rewardCents: 50, // $0.50
    icon: Gamepad2,
    requirementType: 'boolean',
    requirementTarget: 1,
    trackingKey: 'steam_connected',
    isLocked: true,
  },
];

export default function QuestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [userQuestProgress, setUserQuestProgress] = useState<Map<string, UserQuest>>(new Map());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadQuestsAndProgress();
  }, [user, router]);

  const loadQuestsAndProgress = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load active quests from database
      const activeQuests = await getActiveQuests();

      // If no quests in database, use initial quests as fallback
      if (activeQuests.length === 0) {
        console.warn('No quests found in database, using fallback quests');
        // You could optionally create the initial quests in the database here
      } else {
        setQuests(activeQuests);
      }

      // Sync user quest progress (calculates current progress for all quests)
      await syncUserQuestProgress(user.uid);

      // Load user quest progress
      const progress = await getUserQuestProgress(user.uid);
      const progressMap = new Map<string, UserQuest>();
      progress.forEach(p => progressMap.set(p.questId, p));
      setUserQuestProgress(progressMap);

    } catch (error) {
      console.error('Error loading quests and progress:', error);
      toast.error('Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncProgress = async () => {
    if (!user) return;

    try {
      setSyncing(true);
      toast.info('Syncing quest progress...');

      await syncUserQuestProgress(user.uid);
      const progress = await getUserQuestProgress(user.uid);
      const progressMap = new Map<string, UserQuest>();
      progress.forEach(p => progressMap.set(p.questId, p));
      setUserQuestProgress(progressMap);

      toast.success('Quest progress synced!');
    } catch (error) {
      console.error('Error syncing progress:', error);
      toast.error('Failed to sync progress');
    } finally {
      setSyncing(false);
    }
  };

  const getQuestProgress = (quest: Quest) => {
    const progress = userQuestProgress.get(quest.id);
    if (!progress) {
      return {
        current: 0,
        target: quest.requirementTarget,
        percentage: 0,
      };
    }

    return {
      current: Math.min(progress.currentProgress, progress.targetProgress),
      target: progress.targetProgress,
      percentage: Math.min((progress.currentProgress / progress.targetProgress) * 100, 100),
    };
  };

  const isQuestCompleted = (questId: string) => {
    const progress = userQuestProgress.get(questId);
    return progress?.isCompleted || false;
  };

  const isRewardClaimed = (questId: string) => {
    const progress = userQuestProgress.get(questId);
    return progress?.rewardClaimed || false;
  };

  const handleClaimReward = async (questId: string) => {
    if (!user) return;

    try {
      const result = await claimQuestReward(user.uid, questId);

      if (result.success) {
        toast.success(result.message);
        // Reload progress to reflect claimed reward
        await loadQuestsAndProgress();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward');
    }
  };

  const filteredQuests = quests.filter(quest => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return isQuestCompleted(quest.id);
    if (activeTab === 'available') return !isQuestCompleted(quest.id);
    return quest.category === activeTab;
  });

  const completedQuestsCount = quests.filter(q => isQuestCompleted(q.id)).length;

  const totalRewardsEarned = quests.reduce((sum, quest) => {
    const progress = userQuestProgress.get(quest.id);
    if (progress?.rewardClaimed) {
      return sum + (progress.rewardCents || 0);
    }
    return sum;
  }, 0);

  const totalRewardsAvailable = quests.reduce((sum, quest) => sum + quest.rewardCents, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white overflow-hidden py-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-2">Quests & Achievements</h1>
              <p className="text-lg text-white/90">
                Complete quests to earn store credit and unlock achievements
              </p>
            </div>
            <Button
              onClick={handleSyncProgress}
              disabled={syncing}
              className="bg-white text-purple-600 hover:bg-white/90 font-semibold"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {syncing ? 'Syncing...' : 'Sync Progress'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview - Cleaner Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Quests Completed</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {completedQuestsCount}/{quests.length}
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-500 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Rewards Earned</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  ${(totalRewardsEarned / 100).toFixed(2)}
                </p>
              </div>
              <Gift className="h-12 w-12 text-yellow-500 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Available</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  ${(totalRewardsAvailable / 100).toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-500 opacity-80" />
            </div>
          </div>
        </div>

        {/* Quests Tabs - Cleaner Design */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8 bg-muted/50">
            <TabsTrigger value="all" className="text-xs md:text-sm">All</TabsTrigger>
            <TabsTrigger value="available" className="text-xs md:text-sm">Available</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs md:text-sm">Completed</TabsTrigger>
            <TabsTrigger value="profile_setup" className="text-xs md:text-sm">Profile</TabsTrigger>
            <TabsTrigger value="club_participation" className="text-xs md:text-sm">Club</TabsTrigger>
            <TabsTrigger value="gaming_achievements" className="text-xs md:text-sm">Gaming</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredQuests.length === 0 ? (
              <div className="text-center py-16">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground text-lg">No quests found in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredQuests.map((quest) => {
                  const progress = getQuestProgress(quest);
                  const completed = isQuestCompleted(quest.id);
                  const claimed = isRewardClaimed(quest.id);

                  // Get icon based on category
                  const getIcon = () => {
                    switch (quest.category) {
                      case 'profile_setup': return UserCircle;
                      case 'club_participation': return Calendar;
                      case 'social': return Users;
                      case 'gaming_achievements': return Gamepad2;
                      default: return Trophy;
                    }
                  };
                  const Icon = getIcon();

                  return (
                    <div
                      key={quest.id}
                      className={`rounded-lg border-2 p-5 transition-all duration-200 ${
                        completed
                          ? 'border-green-400 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/40 dark:to-green-900/20'
                          : 'border-muted hover:border-primary/50 bg-card hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-3 rounded-lg flex-shrink-0 ${
                          completed
                            ? 'bg-green-200 dark:bg-green-900/50'
                            : 'bg-primary/10'
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            completed
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-primary'
                          }`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                              {quest.name}
                              {completed && <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />}
                            </h3>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">{quest.description}</p>

                          {/* Badges */}
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Badge variant="outline" className="capitalize text-xs">
                              {quest.category.replace('_', ' ')}
                            </Badge>
                            <Badge className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              ${(quest.rewardCents / 100).toFixed(2)}
                            </Badge>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium text-foreground">
                                {progress.current} / {progress.target}
                              </span>
                            </div>
                            <Progress value={progress.percentage} className="h-2" />
                          </div>

                          {/* Action Button */}
                          {completed && !claimed && (
                            <Button
                              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleClaimReward(quest.id)}
                              size="sm"
                            >
                              <Gift className="h-4 w-4 mr-2" />
                              Claim Reward
                            </Button>
                          )}

                          {completed && claimed && (
                            <Button
                              className="w-full mt-4"
                              variant="outline"
                              disabled
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Reward Claimed
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
