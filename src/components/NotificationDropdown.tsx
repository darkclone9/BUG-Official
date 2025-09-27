'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getRegularAnnouncements, markAnnouncementAsRead } from '@/lib/database';
import { Announcement } from '@/types/types';
import { AlertTriangle, Bell, Clock, ExternalLink, Info, Megaphone, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({ className }: NotificationDropdownProps) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load announcements and calculate unread count
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.uid) {
        setAnnouncements([]);
        setUnreadCount(0);
        return;
      }

      try {
        setIsLoading(true);
        const allAnnouncements = await getRegularAnnouncements(true);

        // Filter announcements based on user authentication
        const visibleAnnouncements = allAnnouncements.filter(announcement => {
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

          return true;
        });

        // Sort by priority and creation date
        const sortedAnnouncements = visibleAnnouncements.sort((a, b) => {
          const priorityOrder = { urgent: 3, important: 2, normal: 1 };
          const priorityDiff = priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
          if (priorityDiff !== 0) return priorityDiff;
          return b.createdAt.getTime() - a.createdAt.getTime();
        });

        // Calculate unread count
        const unread = sortedAnnouncements.filter(ann => !ann.readBy?.includes(user.uid)).length;

        setAnnouncements(sortedAnnouncements.slice(0, 10)); // Show only latest 10
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setAnnouncements([]);
        setUnreadCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (announcementId: string) => {
    if (!user?.uid) return;

    try {
      await markAnnouncementAsRead(announcementId, user.uid);

      // Update local state
      setAnnouncements(prev =>
        prev.map(ann =>
          ann.id === announcementId
            ? { ...ann, readBy: [...(ann.readBy || []), user.uid] }
            : ann
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'important':
        return <Megaphone className="h-4 w-4 text-orange-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      case 'important':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative h-9 w-9"
        onClick={toggleDropdown}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading notifications...
              </div>
            ) : announcements.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No notifications to show
              </div>
            ) : (
              <div className="p-2">
                {announcements.map((announcement) => {
                  const isRead = announcement.readBy?.includes(user?.uid || '');

                  return (
                    <div
                      key={announcement.id}
                      className={cn(
                        "p-3 mb-2 rounded-lg border-l-4 cursor-pointer transition-colors",
                        getPriorityColor(announcement.priority),
                        isRead ? "opacity-60" : "hover:bg-muted/50"
                      )}
                      onClick={() => !isRead && handleMarkAsRead(announcement.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getPriorityIcon(announcement.priority)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={cn(
                              "text-sm font-medium truncate",
                              isRead ? "text-muted-foreground" : "text-foreground"
                            )}>
                              {announcement.title}
                            </h4>
                            {!isRead && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>

                          {announcement.content && (
                            <p className={cn(
                              "text-xs mb-2 line-clamp-2",
                              isRead ? "text-muted-foreground" : "text-muted-foreground"
                            )}>
                              {announcement.content}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatDistanceToNow(announcement.createdAt, { addSuffix: true })}</span>
                            </div>

                            {!isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(announcement.id);
                                }}
                              >
                                Mark read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border">
            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                View All Notifications
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
