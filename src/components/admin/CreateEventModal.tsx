'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClubEvent, EventType, EventStatus, LocationType } from '@/types/types';
import { createEvent } from '@/lib/database';
import { X } from 'lucide-react';

interface CreateEventModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateEventModal({ onClose, onSuccess }: CreateEventModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventType: 'social_gathering' as EventType,
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    location: '',
    locationType: 'physical' as LocationType,
    virtualLink: '',
    maxParticipants: '',
    registrationDeadline: '',
    registrationDeadlineTime: '',
    status: 'draft' as EventStatus,
    game: '',
    requiresRegistration: true,
    registrationFee: '',
    notes: '',
    tags: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const eventDate = new Date(`${formData.date}T${formData.time || '00:00'}`);
      const endDate = formData.endDate ? new Date(`${formData.endDate}T${formData.endTime || '23:59'}`) : undefined;
      const regDeadline = formData.registrationDeadline
        ? new Date(`${formData.registrationDeadline}T${formData.registrationDeadlineTime || '23:59'}`)
        : undefined;

      const event: ClubEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name,
        description: formData.description,
        eventType: formData.eventType,
        date: eventDate,
        endDate,
        location: formData.location,
        locationType: formData.locationType,
        virtualLink: formData.virtualLink || undefined,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        currentParticipants: 0,
        registrationDeadline: regDeadline,
        status: formData.status,
        game: formData.game || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : undefined,
        requiresRegistration: formData.requiresRegistration,
        registrationFee: formData.registrationFee ? parseFloat(formData.registrationFee) : undefined,
        notes: formData.notes || undefined,
      };

      await createEvent(event);
      onSuccess();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-background rounded-lg max-w-2xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Create New Event</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Basic Information */}
          <div className="space-y-2">
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type *</Label>
              <Select value={formData.eventType} onValueChange={(value) => setFormData({ ...formData, eventType: value as EventType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as EventStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Start Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Start Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="locationType">Location Type *</Label>
            <Select value={formData.locationType} onValueChange={(value) => setFormData({ ...formData, locationType: value as LocationType })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="physical">Physical</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Student Center Room 101 or Discord Server"
              required
            />
          </div>

          {(formData.locationType === 'virtual' || formData.locationType === 'hybrid') && (
            <div className="space-y-2">
              <Label htmlFor="virtualLink">Virtual Link</Label>
              <Input
                id="virtualLink"
                type="url"
                value={formData.virtualLink}
                onChange={(e) => setFormData({ ...formData, virtualLink: e.target.value })}
                placeholder="https://discord.gg/..."
              />
            </div>
          )}

          {/* Registration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="1"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationFee">Registration Fee ($)</Label>
              <Input
                id="registrationFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.registrationFee}
                onChange={(e) => setFormData({ ...formData, registrationFee: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registrationDeadline">Registration Deadline</Label>
              <Input
                id="registrationDeadline"
                type="date"
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationDeadlineTime">Deadline Time</Label>
              <Input
                id="registrationDeadlineTime"
                type="time"
                value={formData.registrationDeadlineTime}
                onChange={(e) => setFormData({ ...formData, registrationDeadlineTime: e.target.value })}
              />
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-2">
            <Label htmlFor="game">Associated Game</Label>
            <Input
              id="game"
              value={formData.game}
              onChange={(e) => setFormData({ ...formData, game: e.target.value })}
              placeholder="e.g., Super Smash Bros, Mario Kart"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., competitive, casual, beginner-friendly"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Notes for admins only"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
