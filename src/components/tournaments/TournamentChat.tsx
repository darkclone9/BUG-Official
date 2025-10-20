'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { postTournamentMessage, getTournamentMessages, deleteTournamentMessage } from '@/lib/database';
import { TournamentMessage } from '@/types/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TournamentChatProps {
  tournamentId: string;
  isParticipant: boolean;
  isAdmin: boolean;
}

export default function TournamentChat({ tournamentId, isParticipant, isAdmin }: TournamentChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TournamentMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    // Set up polling for new messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [tournamentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const msgs = await getTournamentMessages(tournamentId);
      setMessages(msgs);
    } catch (err) {
      console.error('Error loading tournament messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    if (!isParticipant) {
      toast.error('Only registered participants can post messages');
      return;
    }

    try {
      setSending(true);
      await postTournamentMessage(tournamentId, user.uid, newMessage.trim());
      setNewMessage('');
      await loadMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!user || !isAdmin) return;

    try {
      await deleteTournamentMessage(messageId, user.uid);
      await loadMessages();
      toast.success('Message deleted');
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error('Failed to delete message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Tournament Discussion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading messages...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Tournament Discussion
        </CardTitle>
        <CardDescription>
          {isParticipant 
            ? 'Chat with other participants about the tournament' 
            : 'Only registered participants can post messages'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-[500px]">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Be the first to start the discussion!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.userId === user?.uid;
                  
                  return (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.userAvatar} alt={message.userDisplayName} />
                        <AvatarFallback>
                          {message.userDisplayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{message.userDisplayName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatMessageTime(message.timestamp)}
                          </span>
                          {message.isEdited && (
                            <span className="text-xs text-muted-foreground italic">(edited)</span>
                          )}
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMessage(message.id)}
                              className="h-6 w-6 p-0 ml-auto"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <div className="bg-muted rounded-lg px-3 py-2">
                          <p className="text-sm break-words">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t p-4">
            {user ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isParticipant ? "Type a message..." : "Register to participate in the discussion"}
                  disabled={sending || !isParticipant}
                  className="flex-1"
                  maxLength={500}
                />
                <Button type="submit" disabled={sending || !newMessage.trim() || !isParticipant}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                Please log in to participate in the discussion
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

