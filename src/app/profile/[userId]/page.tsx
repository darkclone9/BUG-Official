'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/database';
import { UserProfile, Achievement, Sticker, SocialMediaLink } from '@/types/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mail, 
  Calendar, 
  Trophy, 
  Star, 
  MessageCircle, 
  Edit,
  Shield,
  Award,
  Sparkles
} from 'lucide-react';
import { 
  FaDiscord, 
  FaTwitch, 
  FaYoutube, 
  FaTwitter, 
  FaInstagram, 
  FaTiktok 
} from 'react-icons/fa';
import Link from 'next/link';

const socialIcons = {
  discord: FaDiscord,
  twitch: FaTwitch,
  youtube: FaYoutube,
  twitter: FaTwitter,
  instagram: FaInstagram,
  tiktok: FaTiktok,
};

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = params.userId as string;
  const isOwnProfile = currentUser?.uid === userId;

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await getUserProfile(userId);
      
      if (!profileData) {
        setError('User not found');
        return;
      }

      setProfile(profileData);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const canViewField = (field: keyof typeof profile.privacySettings): boolean => {
    if (isOwnProfile) return true;
    if (!profile?.privacySettings) return true;
    return profile.privacySettings[field];
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRarityColor = (rarity: Achievement['rarity']): string => {
    const colors = {
      common: 'bg-gray-500',
      uncommon: 'bg-green-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-yellow-500',
    };
    return colors[rarity] || colors.common;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error || 'Profile not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.avatarUrl || profile.avatar} alt={profile.displayName} />
                <AvatarFallback className="text-4xl">
                  {profile.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {profile.displayName}
                    </h1>
                    {profile.bio && (
                      <p className="text-muted-foreground mb-4">{profile.bio}</p>
                    )}
                  </div>
                  
                  {isOwnProfile && (
                    <Link href="/profile/edit">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {canViewField('showPoints') && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{profile.points || 0}</div>
                      <div className="text-xs text-muted-foreground">Points</div>
                    </div>
                  )}
                  {canViewField('showEloRating') && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{profile.eloRating || 1000}</div>
                      <div className="text-xs text-muted-foreground">ELO Rating</div>
                    </div>
                  )}
                  {canViewField('showAchievements') && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {profile.achievementsList?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Achievements</div>
                    </div>
                  )}
                  {canViewField('showStickers') && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {profile.stickersList?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Stickers</div>
                    </div>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {canViewField('showJoinDate') && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(profile.joinDate)}</span>
                    </div>
                  )}
                  {canViewField('showEmail') && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {!isOwnProfile && canViewField('allowDirectMessages') && (
                  <div className="mt-4">
                    <Link href={`/messages?userId=${userId}`}>
                      <Button>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Roles */}
            {canViewField('showRoles') && profile.roles && profile.roles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Roles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.roles.map((role) => (
                      <Badge key={role} variant="secondary" className="capitalize">
                        {role.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            {canViewField('showAchievements') && profile.achievementsList && profile.achievementsList.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                  <CardDescription>
                    {profile.achievementsList.length} achievement{profile.achievementsList.length !== 1 ? 's' : ''} unlocked
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.achievementsList.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {achievement.iconUrl && (
                          <img 
                            src={achievement.iconUrl} 
                            alt={achievement.name}
                            className="h-12 w-12 rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm truncate">{achievement.name}</h4>
                            <Badge className={`${getRarityColor(achievement.rarity)} text-white text-xs`}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {achievement.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Unlocked {formatDate(achievement.unlockedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Displayed Stickers */}
            {canViewField('showStickers') && profile.stickersList && profile.stickersList.filter(s => s.isDisplayed).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Stickers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {profile.stickersList
                      .filter(s => s.isDisplayed)
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                      .map((sticker) => (
                        <div
                          key={sticker.id}
                          className="aspect-square relative group"
                          title={sticker.name}
                        >
                          <img
                            src={sticker.imageUrl}
                            alt={sticker.name}
                            className="w-full h-full object-cover rounded-lg border-2 border-border hover:border-primary transition-colors"
                          />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Media Links */}
            {canViewField('showSocialMedia') && profile.socialMediaAccounts && profile.socialMediaAccounts.filter(s => s.isPublic).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profile.socialMediaAccounts
                      .filter(account => account.isPublic)
                      .map((account) => {
                        const Icon = socialIcons[account.platform];
                        return (
                          <a
                            key={account.platform}
                            href={account.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            <Icon className="h-5 w-5" />
                            <div className="flex-1">
                              <div className="text-sm font-medium capitalize">{account.platform}</div>
                              <div className="text-xs text-muted-foreground">{account.username}</div>
                            </div>
                          </a>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

