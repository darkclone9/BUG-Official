'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Youtube, TwitchIcon as Twitch, Instagram, Music } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

type Platform = 'all' | 'youtube' | 'twitch' | 'tiktok' | 'instagram';

export default function FeedPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('all');

  // Placeholder data - in production, this would come from API integrations
  const socialPosts = [
    {
      id: '1',
      platform: 'youtube' as const,
      title: 'BUG Tournament Highlights - Week 12',
      description: 'Check out the best plays from last week\'s tournament!',
      thumbnailUrl: 'https://via.placeholder.com/400x225',
      url: 'https://youtube.com',
      author: 'BUG Gaming',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      viewCount: 1234,
      likeCount: 89,
    },
    {
      id: '2',
      platform: 'twitch' as const,
      title: 'Live: Super Smash Bros Tournament',
      description: 'Join us live for the finals!',
      thumbnailUrl: 'https://via.placeholder.com/400x225',
      url: 'https://twitch.tv',
      author: 'BUG_Official',
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      viewCount: 456,
    },
    {
      id: '3',
      platform: 'tiktok' as const,
      title: 'Epic comeback moment! 🔥',
      description: 'You won\'t believe this clutch play',
      thumbnailUrl: 'https://via.placeholder.com/400x400',
      url: 'https://tiktok.com',
      author: '@bug_gaming',
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      viewCount: 5678,
      likeCount: 234,
    },
    {
      id: '4',
      platform: 'instagram' as const,
      title: 'Tournament winners celebration',
      description: 'Congratulations to our champions! 🏆',
      thumbnailUrl: 'https://via.placeholder.com/400x400',
      url: 'https://instagram.com',
      author: '@bug_official',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      likeCount: 156,
      commentCount: 23,
    },
  ];

  const filteredPosts = selectedPlatform === 'all' 
    ? socialPosts 
    : socialPosts.filter(post => post.platform === selectedPlatform);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-500" />;
      case 'twitch':
        return <Twitch className="h-5 w-5 text-purple-500" />;
      case 'tiktok':
        return <FaTiktok className="h-5 w-5" />;
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-500" />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'twitch':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'tiktok':
        return 'bg-black/10 text-foreground border-border';
      case 'instagram':
        return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Social Feed</h1>
          <p className="text-muted-foreground">
            Stay updated with our latest content across all platforms
          </p>
        </div>

        {/* Platform Filter */}
        <Tabs value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as Platform)} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2">
              <Youtube className="h-4 w-4" />
              YouTube
            </TabsTrigger>
            <TabsTrigger value="twitch" className="flex items-center gap-2">
              <Twitch className="h-4 w-4" />
              Twitch
            </TabsTrigger>
            <TabsTrigger value="tiktok" className="flex items-center gap-2">
              <FaTiktok className="h-4 w-4" />
              TikTok
            </TabsTrigger>
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Music className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground">
                Check back later for new content from this platform
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-video bg-muted">
                  <img
                    src={post.thumbnailUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge 
                    className={`absolute top-2 right-2 ${getPlatformColor(post.platform)}`}
                    variant="outline"
                  >
                    <span className="flex items-center gap-1">
                      {getPlatformIcon(post.platform)}
                      <span className="capitalize">{post.platform}</span>
                    </span>
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {post.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{post.author}</span>
                      <span>{formatTimeAgo(post.publishedAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {post.viewCount && (
                        <span>{formatNumber(post.viewCount)} views</span>
                      )}
                      {post.likeCount && (
                        <span>❤️ {formatNumber(post.likeCount)}</span>
                      )}
                      {post.commentCount && (
                        <span>💬 {formatNumber(post.commentCount)}</span>
                      )}
                    </div>

                    <Button asChild className="w-full">
                      <a href={post.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Follow Us on Social Media</CardTitle>
            <CardDescription>
              Stay connected and never miss an update!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <a href="https://youtube.com/@bug" target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-4 w-4 mr-2" />
                  YouTube
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://twitch.tv/bug" target="_blank" rel="noopener noreferrer">
                  <Twitch className="h-4 w-4 mr-2" />
                  Twitch
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://tiktok.com/@bug" target="_blank" rel="noopener noreferrer">
                  <FaTiktok className="h-4 w-4 mr-2" />
                  TikTok
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://instagram.com/bug" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4 mr-2" />
                  Instagram
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

