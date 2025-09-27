'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getRegularAnnouncements, markAnnouncementAsRead } from '@/lib/database';
import { cn } from '@/lib/utils';
import { Announcement } from '@/types/types';
import { AlertTriangle, ChevronLeft, ChevronRight, Info, Megaphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnnouncementBarProps {
  className?: string;
}

export default function AnnouncementBar({ className }: AnnouncementBarProps) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<Set<string>>(new Set());

  // Load announcements
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setIsLoading(true);
        const allAnnouncements = await getRegularAnnouncements(true);

        // Filter announcements based on user authentication and read status
        const unreadAnnouncements = allAnnouncements.filter(announcement => {
          // Check if announcement is expired
          if (announcement.expiresAt && new Date() > announcement.expiresAt) {
            return false;
          }

          // Check target audience
          if (announcement.targetAudience === 'members' && !user) {
            return false;
          }
          if (announcement.targetAudience === 'admins' && user?.role !== 'admin') {
            return false;
          }

          // Check if user has read the announcement
          if (user && announcement.readBy?.includes(user.uid)) {
            return false;
          }

          // Check if announcement was dismissed in this session
          if (dismissedAnnouncements.has(announcement.id)) {
            return false;
          }

          return true;
        });

        // Sort by priority (urgent first, then important, then normal)
        const sortedAnnouncements = unreadAnnouncements.sort((a, b) => {
          const priorityOrder: Record<string, number> = { urgent: 3, important: 2, normal: 1, broadcast: 0 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        });

        setAnnouncements(sortedAnnouncements);
        setIsVisible(sortedAnnouncements.length > 0);
        setCurrentIndex(0);
      } catch (error) {
        console.error('Error loading announcements:', error);
        setAnnouncements([]);
        setIsVisible(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnnouncements();
  }, [user, dismissedAnnouncements]);

  // Auto-advance announcements
  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 8000); // Change announcement every 8 seconds

    return () => clearInterval(interval);
  }, [announcements.length]);

  // Automatic read tracking when announcement is displayed
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
        console.error('Error marking announcement as read:', error);
      }
    }, 2000); // Mark as read after 2 seconds

    return () => clearTimeout(readTimer);
  }, [currentIndex, announcements, user]);

  const handleDismiss = async (announcementId: string) => {
    try {
      // Mark as read in database if user is authenticated
      if (user) {
        await markAnnouncementAsRead(announcementId, user.uid);
      }

      // Add to dismissed set for session-based dismissal
      setDismissedAnnouncements(prev => new Set(prev).add(announcementId));

      // Remove from current announcements
      const newAnnouncements = announcements.filter(a => a.id !== announcementId);
      setAnnouncements(newAnnouncements);

      // Adjust current index if necessary
      if (currentIndex >= newAnnouncements.length && newAnnouncements.length > 0) {
        setCurrentIndex(newAnnouncements.length - 1);
      }

      // Hide bar if no announcements left
      if (newAnnouncements.length === 0) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error dismissing announcement:', error);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4" />;
      case 'important':
        return <Megaphone className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive text-destructive-foreground border-destructive/20';
      case 'important':
        return 'bg-orange-500 text-white border-orange-500/20';
      default:
        return 'bg-primary text-primary-foreground border-primary/20';
    }
  };

  // Don't render if loading, not visible, or no announcements
  if (isLoading || !isVisible || announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className={cn(
      "relative w-full border-b transition-all duration-300 ease-in-out",
      getPriorityStyles(currentAnnouncement.priority),
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Navigation arrows for multiple announcements */}
          {announcements.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              className="text-current hover:bg-white/10 p-1 h-auto"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Announcement content */}
          <div className="flex-1 flex items-center justify-center space-x-3 min-w-0">
            {/* Priority icon */}
            <div className="flex-shrink-0">
              {getPriorityIcon(currentAnnouncement.priority)}
            </div>

            {/* Announcement text */}
            <div className="flex-1 text-center min-w-0">
              <p className="text-sm font-medium truncate">
                <span className="font-semibold">{currentAnnouncement.title}</span>
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
              <div className="flex-shrink-0 text-xs opacity-75">
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
              className="text-current hover:bg-white/10 p-1 h-auto"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {/* Dismiss button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDismiss(currentAnnouncement.id)}
            className="text-current hover:bg-white/10 p-1 h-auto ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress indicator for multiple announcements */}
      {announcements.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          <div
            className="h-full bg-white/30 transition-all duration-300 ease-in-out"
            style={{
              width: `${((currentIndex + 1) / announcements.length) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
}
