'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClubEvent, ClubEventNotification, User } from '@/types/types';
import { getAllEvents, sendEventNotification, getAllEventNotifications, getAllUsers } from '@/lib/database';
import { X, Send, Mail, Clock } from 'lucide-react';

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<ClubEventNotification[]>([]);
  const [formData, setFormData] = useState({
    eventId: '',
    recipientEmail: '',
    subject: '',
    message: '',
    templateType: 'custom' as ClubEventNotification['templateType'],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, usersData, notificationsData] = await Promise.all([
        getAllEvents(),
        getAllUsers(),
        getAllEventNotifications(),
      ]);

      setEvents(eventsData.filter(e => e.status !== 'cancelled' && e.status !== 'completed'));
      setAdmins(usersData.filter(u => u.role === 'admin'));
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleTemplateChange = (templateType: ClubEventNotification['templateType']) => {
    setFormData({ ...formData, templateType });

    // Auto-fill subject and message based on template
    const selectedEvent = events.find(e => e.id === formData.eventId);
    if (!selectedEvent) return;

    switch (templateType) {
      case 'event_created':
        setFormData({
          ...formData,
          templateType,
          subject: `New Event: ${selectedEvent.name}`,
          message: `A new event has been created:\n\nEvent: ${selectedEvent.name}\nDate: ${new Date(selectedEvent.date).toLocaleDateString()}\nLocation: ${selectedEvent.location}\n\nDescription:\n${selectedEvent.description}`,
        });
        break;
      case 'event_updated':
        setFormData({
          ...formData,
          templateType,
          subject: `Event Updated: ${selectedEvent.name}`,
          message: `The event "${selectedEvent.name}" has been updated. Please review the latest details.`,
        });
        break;
      case 'event_cancelled':
        setFormData({
          ...formData,
          templateType,
          subject: `Event Cancelled: ${selectedEvent.name}`,
          message: `The event "${selectedEvent.name}" scheduled for ${new Date(selectedEvent.date).toLocaleDateString()} has been cancelled.`,
        });
        break;
      case 'reminder':
        setFormData({
          ...formData,
          templateType,
          subject: `Reminder: ${selectedEvent.name}`,
          message: `This is a reminder about the upcoming event:\n\nEvent: ${selectedEvent.name}\nDate: ${new Date(selectedEvent.date).toLocaleDateString()}\nLocation: ${selectedEvent.location}`,
        });
        break;
      default:
        setFormData({ ...formData, templateType });
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const selectedEvent = events.find(e => e.id === formData.eventId);
    if (!selectedEvent) {
      alert('Please select an event');
      return;
    }

    setLoading(true);
    try {
      const notification: ClubEventNotification = {
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventId: formData.eventId,
        eventName: selectedEvent.name,
        recipientEmail: formData.recipientEmail,
        subject: formData.subject,
        message: formData.message,
        sentAt: new Date(),
        sentBy: user.uid,
        status: 'sent',
        templateType: formData.templateType,
      };

      await sendEventNotification(notification);

      // Note: In a real implementation, you would integrate with an email service like SendGrid, AWS SES, or Resend
      // For now, we're just logging the notification to Firestore
      alert('Notification logged successfully! (Email integration pending)');

      // Reset form
      setFormData({
        eventId: '',
        recipientEmail: '',
        subject: '',
        message: '',
        templateType: 'custom',
      });

      await loadData();
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-background rounded-lg max-w-4xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Event Notifications</h2>
            <p className="text-sm text-muted-foreground">Send notifications to admins about events</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Send Notification Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Notification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSend} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="event">Select Event *</Label>
                    <Select value={formData.eventId} onValueChange={(value) => setFormData({ ...formData, eventId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map(event => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.name} - {new Date(event.date).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template">Template</Label>
                    <Select
                      value={formData.templateType || 'custom'}
                      onValueChange={(value) => handleTemplateChange(value as ClubEventNotification['templateType'])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="event_created">Event Created</SelectItem>
                        <SelectItem value="event_updated">Event Updated</SelectItem>
                        <SelectItem value="event_cancelled">Event Cancelled</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipientEmail">Recipient Email *</Label>
                    <Select value={formData.recipientEmail} onValueChange={(value) => setFormData({ ...formData, recipientEmail: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select admin" />
                      </SelectTrigger>
                      <SelectContent>
                        {admins.map(admin => (
                          <SelectItem key={admin.uid} value={admin.email}>
                            {admin.displayName} ({admin.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full gap-2">
                    <Mail className="h-4 w-4" />
                    {loading ? 'Sending...' : 'Send Notification'}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Note: Email integration is pending. Notifications are currently logged to the database.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Notification History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Notifications
                </CardTitle>
                <CardDescription>Last 10 sent notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No notifications sent yet
                    </p>
                  ) : (
                    notifications.slice(0, 10).map(notification => (
                      <div key={notification.id} className="border rounded-lg p-3 space-y-1">
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-sm">{notification.subject}</p>
                          <Badge variant={notification.status === 'sent' ? 'default' : 'destructive'}>
                            {notification.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          To: {notification.recipientEmail}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Event: {notification.eventName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.sentAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
