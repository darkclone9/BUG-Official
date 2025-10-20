'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Users, Clock, ExternalLink, Video, Building2, Globe } from 'lucide-react';
import { ClubEvent, EventType, LocationType } from '@/types/types';
import { getUpcomingPublishedEvents } from '@/lib/database';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState<LocationType | 'all'>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, searchTerm, typeFilter, locationFilter]);

  const loadEvents = async () => {
    try {
      const eventsData = await getUpcomingPublishedEvents();
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

    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.eventType === typeFilter);
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(event => event.locationType === locationFilter);
    }

    setFilteredEvents(filtered);
  };

  const getTypeIcon = (type: EventType) => {
    const icons = {
      tournament: '🏆',
      social_gathering: '🎉',
      workshop: '📚',
      meeting: '💼',
      stream: '📺',
      competition: '⚔️',
      other: '📅',
    };
    return icons[type] || '📅';
  };

  const getLocationIcon = (type: LocationType) => {
    switch (type) {
      case 'physical':
        return <Building2 className="h-4 w-4" />;
      case 'virtual':
        return <Video className="h-4 w-4" />;
      case 'hybrid':
        return <Globe className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const formatEventDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatEventTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isRegistrationOpen = (event: ClubEvent) => {
    if (!event.requiresRegistration) return false;
    if (!event.registrationDeadline) return true;
    return new Date() < new Date(event.registrationDeadline);
  };

  const isFull = (event: ClubEvent) => {
    if (!event.maxParticipants) return false;
    return event.currentParticipants >= event.maxParticipants;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            <Calendar className="inline h-10 w-10 mr-3 text-primary" />
            Upcoming Events
          </h1>
          <p className="text-xl text-muted-foreground">
            Join us for exciting gaming events, tournaments, and social gatherings
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4"
            />
          </div>

          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as EventType | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Event Type" />
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

          <Select value={locationFilter} onValueChange={(value) => setLocationFilter(value as LocationType | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Location Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="physical">In-Person</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-xl text-muted-foreground mb-2">No events found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || typeFilter !== 'all' || locationFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Check back soon for upcoming events!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{getTypeIcon(event.eventType)}</span>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant="outline" className="capitalize">
                        {event.eventType.replace('_', ' ')}
                      </Badge>
                      {event.locationType && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {getLocationIcon(event.locationType)}
                          <span className="capitalize">{event.locationType}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{event.name}</CardTitle>
                  <CardDescription className="line-clamp-3">{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-foreground">{formatEventDate(event.date)}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatEventTime(event.date)}
                          {event.endDate && ` - ${formatEventTime(event.endDate)}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start text-sm text-muted-foreground">
                      {getLocationIcon(event.locationType)}
                      <span className="ml-2 line-clamp-2">{event.location}</span>
                    </div>

                    {event.maxParticipants && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        <span>
                          {event.currentParticipants} / {event.maxParticipants} participants
                        </span>
                        {isFull(event) && (
                          <Badge variant="destructive" className="ml-2 text-xs">Full</Badge>
                        )}
                      </div>
                    )}

                    {event.game && (
                      <div className="flex items-center text-sm">
                        <Badge variant="outline" className="capitalize">
                          {event.game.replace('_', ' ')}
                        </Badge>
                      </div>
                    )}

                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {event.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {event.virtualLink && (
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={event.virtualLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Join Virtual Event
                        </a>
                      </Button>
                    )}

                    {event.requiresRegistration && (
                      <Button 
                        size="sm" 
                        className="w-full"
                        disabled={!isRegistrationOpen(event) || isFull(event)}
                      >
                        {isFull(event) 
                          ? 'Event Full' 
                          : isRegistrationOpen(event) 
                            ? 'Register Now' 
                            : 'Registration Closed'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

