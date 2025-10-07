'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile, uploadUserAvatar, updateDisplayedStickers } from '@/lib/database';
import { UserProfile, SocialMediaLink, ProfilePrivacySettings, SocialPlatform } from '@/types/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Upload, Save, Loader2 } from 'lucide-react';
import { FaDiscord, FaTwitch, FaYoutube, FaTwitter, FaInstagram, FaTiktok } from 'react-icons/fa';
import { toast } from 'sonner';

const SOCIAL_PLATFORMS: Array<{ id: SocialPlatform; name: string; icon: React.ComponentType<{ className?: string }>; placeholder: string }> = [
  { id: 'discord', name: 'Discord', icon: FaDiscord, placeholder: 'username#1234' },
  { id: 'twitch', name: 'Twitch', icon: FaTwitch, placeholder: 'twitch.tv/username' },
  { id: 'youtube', name: 'YouTube', icon: FaYoutube, placeholder: 'youtube.com/@username' },
  { id: 'twitter', name: 'Twitter/X', icon: FaTwitter, placeholder: 'twitter.com/username' },
  { id: 'instagram', name: 'Instagram', icon: FaInstagram, placeholder: 'instagram.com/username' },
  { id: 'tiktok', name: 'TikTok', icon: FaTiktok, placeholder: 'tiktok.com/@username' },
];

export default function ProfileEditPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [privacySettings, setPrivacySettings] = useState<ProfilePrivacySettings>({
    showEmail: false,
    showRoles: true,
    showAchievements: true,
    showStickers: true,
    showPoints: true,
    showEloRating: true,
    showJoinDate: true,
    showSocialMedia: true,
    allowDirectMessages: true,
  });
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);

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
        setSocialLinks(profileData.socialMediaAccounts || []);
        setPrivacySettings(profileData.privacySettings || privacySettings);

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

      // Update profile
      await updateUserProfile(user.uid, {
        bio,
        socialMediaAccounts: socialLinks.filter(link => link.url.trim() !== ''),
        privacySettings,
      });

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
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Label htmlFor="avatar-upload">
                    <Button asChild disabled={uploading}>
                      <span className="cursor-pointer">
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
                      </span>
                    </Button>
                  </Label>
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

          {/* Social Media Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media Accounts</CardTitle>
              <CardDescription>Link your social media profiles</CardDescription>
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
              {Object.entries(privacySettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Switch
                    checked={value}
                    onCheckedChange={() => handlePrivacyToggle(key as keyof ProfilePrivacySettings)}
                  />
                </div>
              ))}
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
