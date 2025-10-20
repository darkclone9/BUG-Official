'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getUserConversations } from '@/lib/database';
import { cn } from '@/lib/utils';
import { Conversation } from '@/types/types';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface MessageNotificationDropdownProps {
  className?: string;
}

export default function MessageNotificationDropdown({ className }: MessageNotificationDropdownProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load conversations and calculate unread count
  useEffect(() => {
    const loadConversations = async () => {
      if (!user?.uid) {
        setConversations([]);
        setUnreadCount(0);
        return;
      }

      try {
        setIsLoading(true);
        const allConversations = await getUserConversations(user.uid);

        // Calculate total unread count
        const totalUnread = allConversations.reduce((sum, conv) => {
          return sum + (conv.unreadCount[user.uid] || 0);
        }, 0);

        setConversations(allConversations.slice(0, 5)); // Show only latest 5
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Error loading message notifications:', error);
        setConversations([]);
        setUnreadCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(loadConversations, 30000);

    return () => clearInterval(interval);
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

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const getOtherParticipant = (conversation: Conversation) => {
    const otherParticipantId = conversation.participants.find(id => id !== user?.uid);
    if (!otherParticipantId) {
      return { name: 'Unknown', avatar: null };
    }
    return {
      name: conversation.participantNames[otherParticipantId] || 'Unknown',
      avatar: conversation.participantAvatars[otherParticipantId] || null
    };
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Message Icon Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative h-9 w-9"
        onClick={toggleDropdown}
      >
        <MessageCircle className="h-4 w-4" />
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
            <h3 className="font-semibold text-foreground">Messages</h3>
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
                Loading messages...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-xs mt-1">Start a conversation!</p>
              </div>
            ) : (
              <div className="p-2">
                {conversations.map((conversation) => {
                  const other = getOtherParticipant(conversation);
                  const unread = user ? conversation.unreadCount[user.uid] || 0 : 0;
                  const lastMessagePreview = conversation.lastMessage ?
                    (conversation.lastMessage.length > 50 ? conversation.lastMessage.substring(0, 50) + '...' : conversation.lastMessage)
                    : 'No messages yet';

                  return (
                    <Link
                      key={conversation.id}
                      href={`/messages?conversationId=${conversation.id}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div
                        className={cn(
                          "p-3 mb-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                          unread > 0 && "bg-primary/5 border border-primary/20"
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={(other as any).avatarUrl || other.avatar || undefined} alt={other.name} />
                            <AvatarFallback>
                              {other.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={cn(
                                "text-sm font-medium truncate",
                                unread > 0 ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {other.name}
                              </h4>
                              {unread > 0 && (
                                <Badge variant="destructive" className="text-xs ml-2">
                                  {unread}
                                </Badge>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                              {lastMessagePreview}
                            </p>

                            {conversation.lastMessageAt && (
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(conversation.lastMessageAt, { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border">
            <Link href="/messages" onClick={() => setIsOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                View All Messages
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
