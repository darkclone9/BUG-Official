'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile, uploadUserAvatar, updateDisplayedStickers, uploadProfileBanner } from '@/lib/database';
import { UserProfile, SocialMediaLink, ProfilePrivacySettings, SocialPlatform, GamingInfo, GamingPlatform, SkillLevel, ProfileVisibility } from '@/types/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Upload, Save, Loader2, X, Plus } from 'lucide-react';
import { FaDiscord, FaTwitch, FaYoutube, FaTwitter, FaInstagram, FaTiktok, FaSteam, FaXbox, FaPlaystation } from 'react-icons/fa';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const SOCIAL_PLATFORMS: Array<{ id: SocialPlatform; name: string; icon: React.ComponentType<{ className?: string }>; placeholder: string }> = [
  { id: 'discord', name: 'Discord', icon: FaDiscord, placeholder: 'username#1234' },
  { id: 'steam', name: 'Steam', icon: FaSteam, placeholder: 'steamcommunity.com/id/username' },
  { id: 'xbox', name: 'Xbox Live', icon: FaXbox, placeholder: 'Xbox Gamertag' },
  { id: 'playstation', name: 'PlayStation', icon: FaPlaystation, placeholder: 'PSN ID' },
  { id: 'twitch', name: 'Twitch', icon: FaTwitch, placeholder: 'twitch.tv/username' },
  { id: 'youtube', name: 'YouTube', icon: FaYoutube, placeholder: 'youtube.com/@username' },
  { id: 'twitter', name: 'Twitter/X', icon: FaTwitter, placeholder: 'twitter.com/username' },
  { id: 'instagram', name: 'Instagram', icon: FaInstagram, placeholder: 'instagram.com/username' },
  { id: 'tiktok', name: 'TikTok', icon: FaTiktok, placeholder: 'tiktok.com/@username' },
];

const GAMING_PLATFORMS: Array<{ id: GamingPlatform; name: string }> = [
  { id: 'pc', name: 'PC' },
  { id: 'xbox', name: 'Xbox' },
  { id: 'playstation', name: 'PlayStation' },
  { id: 'nintendo_switch', name: 'Nintendo Switch' },
  { id: 'mobile', name: 'Mobile' },
  { id: 'other', name: 'Other' },
];

const SKILL_LEVELS: Array<{ id: SkillLevel; name: string; description: string }> = [
  { id: 'beginner', name: 'Beginner', description: 'Just starting out' },
  { id: 'intermediate', name: 'Intermediate', description: 'Some experience' },
  { id: 'advanced', name: 'Advanced', description: 'Experienced player' },
  { id: 'expert', name: 'Expert', description: 'Highly skilled' },
];

const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening', 'Night'];
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ProfileEditPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [bio, setBio] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [location, setLocation] = useState('');
  const [timezone, setTimezone] = useState('');
  const [customStatus, setCustomStatus] = useState('');
  const [themeColor, setThemeColor] = useState('#3b82f6');
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [privacySettings, setPrivacySettings] = useState<ProfilePrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showRoles: true,
    showAchievements: true,
    showStickers: true,
    showPoints: true,
    showEloRating: true,
    showJoinDate: true,
    showSocialMedia: true,
    showOnlineStatus: true,
    showGamingStats: true,
    showLocation: true,
    allowDirectMessages: true,
    allowDirectMessagesFromNonFriends: true,
  });
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);

  // Gaming Info state
  const [favoriteGames, setFavoriteGames] = useState<string[]>([]);
  const [newGame, setNewGame] = useState('');
  const [primaryPlatform, setPrimaryPlatform] = useState<GamingPlatform | ''>('');
  const [platforms, setPlatforms] = useState<GamingPlatform[]>([]);
  const [skillLevel, setSkillLevel] = useState<SkillLevel | ''>('');
  const [lookingForTeam, setLookingForTeam] = useState(false);
  const [competitivePlayer, setCompetitivePlayer] = useState(false);

  // Banner upload state
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const profileData = await getUserProfile(user.uid);

      if (profileData) {
        setProfile(profileData);
        setBio(profileData.bio || '');
        setPronouns(profileData.pronouns || '');
        setLocation(profileData.location || '');
        setTimezone(profileData.timezone || '');
        setCustomStatus(profileData.customStatus || '');
        setThemeColor(profileData.themeColor || '#3b82f6');
        setSocialLinks(profileData.socialMediaAccounts || []);
        setPrivacySettings(profileData.privacySettings || privacySettings);

        // Load gaming info
        if (profileData.gamingInfo) {
          setFavoriteGames(profileData.gamingInfo.favoriteGames || []);
          setPrimaryPlatform(profileData.gamingInfo.primaryPlatform || '');
          setPlatforms(profileData.gamingInfo.platforms || []);
          setSkillLevel(profileData.gamingInfo.skillLevel || '');
          setLookingForTeam(profileData.gamingInfo.lookingForTeam || false);
          setCompetitivePlayer(profileData.gamingInfo.competitivePlayer || false);
        }

        // Get displayed stickers
        const displayedStickers = profileData.stickersList
          ?.filter(s => s.isDisplayed)
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          .map(s => s.id) || [];
        setSelectedStickers(displayedStickers);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0]) {
      console.log('No file selected or user not logged in');
      return;
    }

    const file = e.target.files[0];
    console.log('File selected for upload:', file.name);

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      e.target.value = ''; // Reset input
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      e.target.value = ''; // Reset input
      return;
    }

    try {
      console.log('Starting upload process...');
      setUploading(true);

      const avatarUrl = await uploadUserAvatar(user.uid, file);
      console.log('Upload completed, avatar URL:', avatarUrl);

      // Update local state
      setProfile(prev => prev ? { ...prev, avatarUrl } : null);

      toast.success('Avatar uploaded successfully!');

      // Reset input
      e.target.value = '';

      // Reload profile to ensure we have the latest data
      await loadProfile();

    } catch (err) {
      console.error('Error in handleAvatarUpload:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to upload avatar');
      e.target.value = ''; // Reset input on error
    } finally {
      console.log('Upload process finished, resetting uploading state');
      setUploading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0]) {
      return;
    }

    const file = e.target.files[0];

    // Validate file size (max 10MB for banner)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      e.target.value = '';
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      e.target.value = '';
      return;
    }

    try {
      setUploadingBanner(true);
      const bannerUrl = await uploadProfileBanner(user.uid, file);
      setProfile(prev => prev ? { ...prev, bannerUrl } : null);
      toast.success('Banner uploaded successfully!');
      e.target.value = '';
      await loadProfile();
    } catch (err) {
      console.error('Error uploading banner:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to upload banner');
      e.target.value = '';
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSocialLinkChange = (platform: SocialPlatform, url: string, isPublic: boolean) => {
    setSocialLinks(prev => {
      const existing = prev.find(link => link.platform === platform);

      // Extract username from URL (simple extraction)
      const username = url.split('/').pop() || url;

      if (existing) {
        // Update existing link
        return prev.map(link =>
          link.platform === platform
            ? { ...link, url, username, isPublic }
            : link
        );
      } else {
        // Add new link
        return [...prev, { platform, url, username, isPublic }];
      }
    });
  };

  const addFavoriteGame = () => {
    if (newGame.trim() && !favoriteGames.includes(newGame.trim())) {
      setFavoriteGames([...favoriteGames, newGame.trim()]);
      setNewGame('');
    }
  };

  const removeFavoriteGame = (game: string) => {
    setFavoriteGames(favoriteGames.filter(g => g !== game));
  };

  const togglePlatform = (platform: GamingPlatform) => {
    setPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handlePrivacyToggle = (field: keyof ProfilePrivacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleStickerToggle = (stickerId: string) => {
    setSelectedStickers(prev => {
      if (prev.includes(stickerId)) {
        return prev.filter(id => id !== stickerId);
      } else {
        if (prev.length >= 9) {
          toast.error('You can only display up to 9 stickers');
          return prev;
        }
        return [...prev, stickerId];
      }
    });
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Build gaming info object - only include fields with values
      const gamingInfo: GamingInfo = {};

      if (favoriteGames.length > 0) {
        gamingInfo.favoriteGames = favoriteGames;
      }
      if (primaryPlatform) {
        gamingInfo.primaryPlatform = primaryPlatform;
      }
      if (platforms.length > 0) {
        gamingInfo.platforms = platforms;
      }
      if (skillLevel) {
        gamingInfo.skillLevel = skillLevel;
      }
      gamingInfo.lookingForTeam = lookingForTeam;
      gamingInfo.competitivePlayer = competitivePlayer;

      // Build update object - only include non-empty fields
      const updateData: Partial<UserProfile> = {
        privacySettings,
        socialMediaAccounts: socialLinks.filter(link => link.url.trim() !== ''),
      };

      // Only add fields if they have values
      if (bio.trim()) updateData.bio = bio.trim();
      if (pronouns.trim()) updateData.pronouns = pronouns.trim();
      if (location.trim()) updateData.location = location.trim();
      if (timezone.trim()) updateData.timezone = timezone.trim();
      if (customStatus.trim()) updateData.customStatus = customStatus.trim();
      if (themeColor) updateData.themeColor = themeColor;

      // Only add gamingInfo if it has any data
      if (Object.keys(gamingInfo).length > 0) {
        updateData.gamingInfo = gamingInfo;
      }

      // Update profile
      await updateUserProfile(user.uid, updateData);

      // Update displayed stickers
      if (selectedStickers.length > 0) {
        await updateDisplayedStickers(user.uid, selectedStickers);
      }

      toast.success('Profile updated successfully');
      router.push(`/profile/${user.uid}`);
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
        </div>

        <div className="space-y-6">
          {/* Avatar Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Upload a profile picture (max 5MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatarUrl} alt={profile?.displayName} />
                  <AvatarFallback className="text-2xl">
                    {profile?.displayName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Banner */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Banner</CardTitle>
              <CardDescription>Upload a banner image for your profile (max 10MB, recommended: 1500x500px)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile?.bannerUrl && (
                  <div className="w-full h-40 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={profile.bannerUrl}
                      alt="Profile banner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    disabled={uploadingBanner}
                    className="hidden"
                    id="banner-upload"
                    ref={(input) => {
                      if (input) {
                        (window as any).bannerInput = input;
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('banner-upload')?.click()}
                    disabled={uploadingBanner}
                  >
                    {uploadingBanner ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Banner
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>Bio</CardTitle>
              <CardDescription>Tell others about yourself</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio..."
                maxLength={500}
                rows={4}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {bio.length}/500 characters
              </p>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Share more about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pronouns">Pronouns</Label>
                <Input
                  id="pronouns"
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                  placeholder="e.g., he/him, she/her, they/them"
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., New York, NY"
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="e.g., America/New_York, EST"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Helps others know when you're available to play
                </p>
              </div>
              <div>
                <Label htmlFor="customStatus">Custom Status</Label>
                <Input
                  id="customStatus"
                  value={customStatus}
                  onChange={(e) => setCustomStatus(e.target.value)}
                  placeholder="e.g., Looking for teammates, Streaming now"
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="themeColor">Profile Theme Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="themeColor"
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    placeholder="#3b82f6"
                    maxLength={7}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose an accent color for your profile
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Gaming Information */}
          <Card>
            <CardHeader>
              <CardTitle>Gaming Information</CardTitle>
              <CardDescription>Share your gaming preferences and availability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Favorite Games */}
              <div>
                <Label>Favorite Games</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newGame}
                    onChange={(e) => setNewGame(e.target.value)}
                    placeholder="Add a game..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFavoriteGame())}
                  />
                  <Button type="button" onClick={addFavoriteGame} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {favoriteGames.map((game) => (
                    <Badge key={game} variant="secondary" className="gap-1">
                      {game}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeFavoriteGame(game)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Primary Platform */}
              <div>
                <Label htmlFor="primaryPlatform">Primary Gaming Platform</Label>
                <Select value={primaryPlatform} onValueChange={(value) => setPrimaryPlatform(value as GamingPlatform)}>
                  <SelectTrigger id="primaryPlatform">
                    <SelectValue placeholder="Select your main platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {GAMING_PLATFORMS.map((platform) => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* All Platforms */}
              <div>
                <Label>All Platforms You Use</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {GAMING_PLATFORMS.map((platform) => (
                    <Button
                      key={platform.id}
                      type="button"
                      variant={platforms.includes(platform.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => togglePlatform(platform.id)}
                      className="justify-start"
                    >
                      {platform.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Skill Level */}
              <div>
                <Label htmlFor="skillLevel">Overall Skill Level</Label>
                <Select value={skillLevel} onValueChange={(value) => setSkillLevel(value as SkillLevel)}>
                  <SelectTrigger id="skillLevel">
                    <SelectValue placeholder="Select your skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_LEVELS.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        <div>
                          <div className="font-medium">{level.name}</div>
                          <div className="text-xs text-muted-foreground">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Gaming Preferences */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Looking for Team</Label>
                    <p className="text-xs text-muted-foreground">Show that you're looking for teammates</p>
                  </div>
                  <Switch
                    checked={lookingForTeam}
                    onCheckedChange={setLookingForTeam}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Competitive Player</Label>
                    <p className="text-xs text-muted-foreground">Interested in competitive/ranked play</p>
                  </div>
                  <Switch
                    checked={competitivePlayer}
                    onCheckedChange={setCompetitivePlayer}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media & Gaming Accounts</CardTitle>
              <CardDescription>Link your social media and gaming profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {SOCIAL_PLATFORMS.map((platform) => {
                const link = socialLinks.find(l => l.platform === platform.id);
                const Icon = platform.icon;

                return (
                  <div key={platform.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <Label>{platform.name}</Label>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={link?.url || ''}
                        onChange={(e) => handleSocialLinkChange(platform.id, e.target.value, link?.isPublic ?? true)}
                        placeholder={platform.placeholder}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={link?.isPublic ?? true}
                          onCheckedChange={(checked) => handleSocialLinkChange(platform.id, link?.url || '', checked)}
                          disabled={!link?.url}
                        />
                        <Label className="text-sm">Public</Label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control what others can see on your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Visibility */}
              <div>
                <Label htmlFor="profileVisibility">Profile Visibility</Label>
                <Select
                  value={privacySettings.profileVisibility}
                  onValueChange={(value) => setPrivacySettings(prev => ({ ...prev, profileVisibility: value as ProfileVisibility }))}
                >
                  <SelectTrigger id="profileVisibility" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div>
                        <div className="font-medium">Public</div>
                        <div className="text-xs text-muted-foreground">Anyone can view your profile</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="members_only">
                      <div>
                        <div className="font-medium">Members Only</div>
                        <div className="text-xs text-muted-foreground">Only BUG members can view</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div>
                        <div className="font-medium">Private</div>
                        <div className="text-xs text-muted-foreground">Only you can view your profile</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Other Privacy Toggles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Email</Label>
                    <p className="text-xs text-muted-foreground">Display your email on your profile</p>
                  </div>
                  <Switch
                    checked={privacySettings.showEmail}
                    onCheckedChange={() => handlePrivacyToggle('showEmail')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Roles</Label>
                    <p className="text-xs text-muted-foreground">Display your club roles</p>
                  </div>
                  <Switch
                    checked={privacySettings.showRoles}
                    onCheckedChange={() => handlePrivacyToggle('showRoles')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Achievements</Label>
                    <p className="text-xs text-muted-foreground">Display your achievements</p>
                  </div>
                  <Switch
                    checked={privacySettings.showAchievements}
                    onCheckedChange={() => handlePrivacyToggle('showAchievements')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Points</Label>
                    <p className="text-xs text-muted-foreground">Display your points balance</p>
                  </div>
                  <Switch
                    checked={privacySettings.showPoints}
                    onCheckedChange={() => handlePrivacyToggle('showPoints')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show ELO Rating</Label>
                    <p className="text-xs text-muted-foreground">Display your competitive rating</p>
                  </div>
                  <Switch
                    checked={privacySettings.showEloRating}
                    onCheckedChange={() => handlePrivacyToggle('showEloRating')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Online Status</Label>
                    <p className="text-xs text-muted-foreground">Let others see when you're online</p>
                  </div>
                  <Switch
                    checked={privacySettings.showOnlineStatus}
                    onCheckedChange={() => handlePrivacyToggle('showOnlineStatus')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Gaming Stats</Label>
                    <p className="text-xs text-muted-foreground">Display your gaming statistics</p>
                  </div>
                  <Switch
                    checked={privacySettings.showGamingStats}
                    onCheckedChange={() => handlePrivacyToggle('showGamingStats')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Location</Label>
                    <p className="text-xs text-muted-foreground">Display your location/timezone</p>
                  </div>
                  <Switch
                    checked={privacySettings.showLocation}
                    onCheckedChange={() => handlePrivacyToggle('showLocation')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Direct Messages</Label>
                    <p className="text-xs text-muted-foreground">Let others send you messages</p>
                  </div>
                  <Switch
                    checked={privacySettings.allowDirectMessages}
                    onCheckedChange={() => handlePrivacyToggle('allowDirectMessages')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow DMs from Non-Friends</Label>
                    <p className="text-xs text-muted-foreground">Receive messages from anyone</p>
                  </div>
                  <Switch
                    checked={privacySettings.allowDirectMessagesFromNonFriends}
                    onCheckedChange={() => handlePrivacyToggle('allowDirectMessagesFromNonFriends')}
                    disabled={!privacySettings.allowDirectMessages}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.back()} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
