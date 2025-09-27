'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { dismissBroadcastAnnouncement, getBroadcastAnnouncements, markAnnouncementAsRead } from '@/lib/database';
import { cn } from '@/lib/utils';
import { Announcement } from '@/types/types';
import { ChevronLeft, ChevronRight, Radio, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BroadcastBarProps {
  className?: string;
}

export default function BroadcastBar({ className }: BroadcastBarProps) {
  const { user, loading: authLoading } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load broadcast announcements
  useEffect(() => {
    // Don't load announcements until authentication is complete
    if (authLoading) {
      return;
    }

    const loadBroadcastAnnouncements = async () => {
      try {
        setIsLoading(true);
        // Reset visibility immediately to prevent flicker
        setIsVisible(false);

        const allBroadcasts = await getBroadcastAnnouncements();

        // Filter announcements based on user authentication and dismissal status
        const visibleBroadcasts = allBroadcasts.filter(announcement => {
          // Check if announcement is expired
          if (announcement.expiresAt && new Date() > announcement.expiresAt) {
            return false;
          }

          // Check target audience - broadcast announcements should be visible to all users
          if (announcement.targetAudience === 'members' && !user) {
            return false;
          }
          if (announcement.targetAudience === 'admins' && user?.role !== 'admin') {
            return false;
          }

          // Check if user has dismissed the broadcast
          if (user && announcement.dismissedBy?.includes(user.uid)) {
            return false;
          }

          return true;
        });

        // Update all state atomically to prevent intermediate renders
        setAnnouncements(visibleBroadcasts);
        setCurrentIndex(0);
        setIsLoading(false);
        // Only set visible AFTER all other state is updated and we have filtered announcements
        setIsVisible(visibleBroadcasts.length > 0);
      } catch (error) {
        console.error('Error loading broadcast announcements:', error);
        setAnnouncements([]);
        setIsVisible(false);
        setIsLoading(false);
      }
    };

    loadBroadcastAnnouncements();
  }, [user, authLoading]);

  // Auto-advance through announcements
  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 8000); // 8 seconds for broadcast messages

    return () => clearInterval(interval);
  }, [announcements.length]);

  // Automatic read tracking when broadcast announcement is displayed
  useEffect(() => {
    if (!user || announcements.length === 0) return;

    const currentAnnouncement = announcements[currentIndex];
    if (!currentAnnouncement) return;

    // Mark as read after 2 seconds of being displayed
    const readTimer = setTimeout(async () => {
      try {
        // Only mark as read if user hasn't already read it
        if (!currentAnnouncement.readBy?.includes(user.uid)) {
          await markAnnouncementAsRead(currentAnnouncement.id, user.uid);

          // Update the local state to reflect the read status
          setAnnouncements(prev =>
            prev.map(ann =>
              ann.id === currentAnnouncement.id
                ? { ...ann, readBy: [...(ann.readBy || []), user.uid] }
                : ann
            )
          );
        }
      } catch (error) {
        console.error('Error marking broadcast announcement as read:', error);
      }
    }, 2000); // Mark as read after 2 seconds

    return () => clearTimeout(readTimer);
  }, [currentIndex, announcements, user]);

  const handleDismiss = async () => {
    if (!user || announcements.length === 0) return;

    const currentAnnouncement = announcements[currentIndex];

    try {
      // Dismiss the current announcement in the database
      await dismissBroadcastAnnouncement(currentAnnouncement.id, user.uid);

      // Remove the dismissed announcement from the local state
      const updatedAnnouncements = announcements.filter((_, index) => index !== currentIndex);
      setAnnouncements(updatedAnnouncements);

      // Adjust current index if necessary
      if (updatedAnnouncements.length === 0) {
        setIsVisible(false);
      } else if (currentIndex >= updatedAnnouncements.length) {
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error dismissing broadcast announcement:', error);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  // Don't render if loading, not visible, or no announcements
  // Extra safety check: only render if we have both filtered announcements AND visibility is explicitly set
  if (isLoading || !isVisible || announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className={cn(
      "relative w-full border-b transition-all duration-300 ease-in-out",
      "bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white border-purple-500/20",
      "shadow-lg",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Navigation arrows for multiple announcements */}
          {announcements.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              className="text-white hover:bg-white/10 p-1 h-auto flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Broadcast content */}
          <div className="flex-1 flex items-center justify-center space-x-4 min-w-0">
            {/* Broadcast icon */}
            <div className="flex-shrink-0">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>

            {/* Announcement text */}
            <div className="flex-1 text-center min-w-0">
              <p className="text-sm font-medium">
                <span className="font-bold text-yellow-200">BROADCAST:</span>
                <span className="mx-2 font-semibold">{currentAnnouncement.title}</span>
                {currentAnnouncement.content && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="font-normal">{currentAnnouncement.content}</span>
                  </>
                )}
              </p>
            </div>

            {/* Multiple announcements indicator */}
            {announcements.length > 1 && (
              <div className="flex-shrink-0 text-xs opacity-75 bg-white/10 px-2 py-1 rounded">
                {currentIndex + 1} of {announcements.length}
              </div>
            )}
          </div>

          {/* Navigation arrows for multiple announcements */}
          {announcements.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="text-white hover:bg-white/10 p-1 h-auto flex-shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {/* Dismiss button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-white hover:bg-white/10 p-1 h-auto ml-2 flex-shrink-0"
            title="Dismiss broadcast"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
