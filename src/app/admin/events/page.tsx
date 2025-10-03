'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Users, Plus, Search, Mail, Edit, Trash2, Copy } from 'lucide-react';
import { ClubEvent, EventStatus, EventType } from '@/types/types';
import { getAllEvents, deleteEvent, duplicateEvent } from '@/lib/database';
import CreateEventModal from '@/components/admin/CreateEventModal';
import EditEventModal from '@/components/admin/EditEventModal';
import NotificationPanel from '@/components/admin/NotificationPanel';

export default function EventsPage() {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, searchTerm, statusFilter, typeFilter]);

  const loadEvents = async () => {
    try {
      const eventsData = await getAllEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.eventType === typeFilter);
    }

    setFilteredEvents(filtered);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteEvent(eventId);
      await loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const handleDuplicate = async (event: ClubEvent) => {
    const newName = prompt('Enter name for duplicated event:', `${event.name} (Copy)`);
    if (!newName) return;

    try {
      await duplicateEvent(event.id, newName);
      await loadEvents();
    } catch (error) {
      console.error('Error duplicating event:', error);
      alert('Failed to duplicate event');
    }
  };

  const handleEdit = (event: ClubEvent) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'published': return 'bg-blue-500';
      case 'ongoing': return 'bg-green-500';
      case 'completed': return 'bg-purple-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: EventType) => {
    switch (type) {
      case 'tournament': return '🏆';
      case 'social_gathering': return '🎉';
      case 'workshop': return '📚';
      case 'meeting': return '💼';
      case 'stream': return '📺';
      case 'competition': return '⚔️';
      default: return '📅';
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Events Management</h1>
            <p className="text-muted-foreground">Create and manage club events</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
            <Button onClick={() => setShowNotificationPanel(true)} variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Send Notifications
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as EventStatus | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as EventType | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="tournament">Tournament</SelectItem>
                    <SelectItem value="social_gathering">Social Gathering</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="stream">Stream</SelectItem>
                    <SelectItem value="competition">Competition</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No events found</p>
                <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{getTypeIcon(event.eventType)}</span>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{event.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      {event.maxParticipants && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-4 w-4 mr-2" />
                          {event.currentParticipants} / {event.maxParticipants}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(event)} className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDuplicate(event)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        {/* Modals */}
        {showCreateModal && (
          <CreateEventModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadEvents();
            }}
          />
        )}

        {showEditModal && selectedEvent && (
          <EditEventModal
            event={selectedEvent}
            onClose={() => {
              setShowEditModal(false);
              setSelectedEvent(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedEvent(null);
              loadEvents();
            }}
          />
        )}

        {showNotificationPanel && (
          <NotificationPanel
            onClose={() => setShowNotificationPanel(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
