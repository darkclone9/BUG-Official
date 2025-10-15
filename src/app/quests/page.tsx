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

// Define initial website-based quests
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
  const [quests, setQuests] = useState(INITIAL_QUESTS);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    loadUserProgress();
  }, [user, router]);

  const loadUserProgress = async () => {
    if (!user) return;

    // TODO: Load from Firestore
    // For now, use mock data based on user profile
    const progress: Record<string, number> = {
      account_created: 1,
      profile_fields_completed: user.avatar ? 1 : 0,
      events_attended: 0, // TODO: Get from user stats
      tournaments_joined: 0, // TODO: Get from user stats
      matches_won: 0, // TODO: Get from user stats
      tournaments_won: 0, // TODO: Get from user stats
      shop_purchases: 0, // TODO: Get from orders
      referrals: 0, // TODO: Get from referrals
      steam_connected: 0,
    };

    setUserProgress(progress);

    // Mark completed quests
    const completed = new Set<string>();
    INITIAL_QUESTS.forEach(quest => {
      const currentProgress = progress[quest.trackingKey] || 0;
      if (currentProgress >= quest.requirementTarget) {
        completed.add(quest.id);
      }
    });
    setCompletedQuests(completed);
  };

  const getQuestProgress = (quest: typeof INITIAL_QUESTS[0]) => {
    const current = userProgress[quest.trackingKey] || 0;
    const target = quest.requirementTarget;
    return {
      current: Math.min(current, target),
      target,
      percentage: Math.min((current / target) * 100, 100),
    };
  };

  const isQuestCompleted = (questId: string) => {
    return completedQuests.has(questId);
  };

  const claimReward = async (questId: string) => {
    // TODO: Implement reward claiming
    toast.success('Reward claimed! (Feature coming soon)');
  };

  const filteredQuests = quests.filter(quest => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return isQuestCompleted(quest.id);
    if (activeTab === 'available') return !isQuestCompleted(quest.id) && !quest.isLocked;
    return quest.category === activeTab;
  });

  const totalRewardsEarned = Array.from(completedQuests).reduce((sum, questId) => {
    const quest = quests.find(q => q.id === questId);
    return sum + (quest?.rewardCents || 0);
  }, 0);

  const totalRewardsAvailable = quests.reduce((sum, quest) => sum + quest.rewardCents, 0);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Quests & Achievements</h1>
          <p className="text-xl text-muted-foreground">
            Complete quests to earn store credit and unlock achievements
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quests Completed</p>
                  <p className="text-3xl font-bold text-primary">
                    {completedQuests.size}/{quests.length}
                  </p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rewards Earned</p>
                  <p className="text-3xl font-bold text-primary">
                    ${(totalRewardsEarned / 100).toFixed(2)}
                  </p>
                </div>
                <Gift className="h-12 w-12 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Available</p>
                  <p className="text-3xl font-bold text-primary">
                    ${(totalRewardsAvailable / 100).toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quests Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="profile_setup">Profile</TabsTrigger>
            <TabsTrigger value="club_participation">Club</TabsTrigger>
            <TabsTrigger value="gaming_achievements">Gaming</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredQuests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No quests found in this category</p>
                </CardContent>
              </Card>
            ) : (
              filteredQuests.map((quest) => {
                const progress = getQuestProgress(quest);
                const completed = isQuestCompleted(quest.id);
                const Icon = quest.icon;

                return (
                  <Card key={quest.id} className={completed ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : quest.isLocked ? 'opacity-60' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary/10'}`}>
                            <Icon className={`h-6 w-6 ${completed ? 'text-green-600 dark:text-green-500' : 'text-primary'}`} />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {quest.name}
                              {completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                              {quest.isLocked && <Lock className="h-5 w-5 text-muted-foreground" />}
                            </CardTitle>
                            <CardDescription className="mt-1">{quest.description}</CardDescription>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="capitalize">
                                {quest.category.replace('_', ' ')}
                              </Badge>
                              <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                                <Star className="h-3 w-3 mr-1" />
                                ${(quest.rewardCents / 100).toFixed(2)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {!quest.isLocked && (
                        <>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">
                                {progress.current} / {progress.target}
                              </span>
                            </div>
                            <Progress value={progress.percentage} className="h-2" />
                          </div>
                          
                          {completed && (
                            <Button 
                              className="w-full mt-4" 
                              onClick={() => claimReward(quest.id)}
                              disabled
                            >
                              <Gift className="h-4 w-4 mr-2" />
                              Reward Claimed
                            </Button>
                          )}
                        </>
                      )}
                      
                      {quest.isLocked && (
                        <div className="text-center py-4 text-muted-foreground">
                          <Lock className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Coming Soon</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

