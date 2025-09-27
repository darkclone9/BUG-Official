'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { updateTournament } from '@/lib/database';
import { Tournament, GameType } from '@/types/types';

interface EditTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tournament: Tournament | null;
}

export default function EditTournamentModal({ isOpen, onClose, onSuccess, tournament }: EditTournamentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    game: 'mario_kart' as GameType,
    date: new Date(),
    registrationDeadline: new Date(),
    maxParticipants: 16,
    format: 'single_elimination' as 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss',
    entryFee: 0,
    prizePool: 0,
    pointsAwarded: {
      first: 100,
      second: 50,
      third: 25,
      participation: 10,
    },
    rules: [''],
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed',
  });

  useEffect(() => {
    if (tournament) {
      setFormData({
        name: tournament.name,
        description: tournament.description,
        game: tournament.game,
        date: tournament.date,
        registrationDeadline: tournament.registrationDeadline,
        maxParticipants: tournament.maxParticipants,
        format: tournament.format,
        entryFee: tournament.entryFee || 0,
        prizePool: tournament.prizePool || 0,
        pointsAwarded: tournament.pointsAwarded,
        rules: tournament.rules.length > 0 ? tournament.rules : [''],
        status: tournament.status,
      });
    }
  }, [tournament]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;

    setLoading(true);

    try {
      const updates: Record<string, unknown> = {
        name: formData.name,
        description: formData.description,
        game: formData.game,
        date: formData.date,
        registrationDeadline: formData.registrationDeadline,
        maxParticipants: formData.maxParticipants,
        format: formData.format,
        pointsAwarded: formData.pointsAwarded,
        rules: formData.rules.filter(rule => rule.trim() !== ''),
        status: formData.status,
      };

      // Only add entryFee and prizePool if they have values
      if (formData.entryFee && formData.entryFee > 0) {
        updates.entryFee = formData.entryFee;
      }
      if (formData.prizePool && formData.prizePool > 0) {
        updates.prizePool = formData.prizePool;
      }

      await updateTournament(tournament.id, updates);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, '']
    }));
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const updateRule = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? value : rule)
    }));
  };

  if (!tournament) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Tournament</DialogTitle>
          <DialogDescription>
            Update tournament details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter tournament name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="game">Game</Label>
              <Select value={formData.game} onValueChange={(value: GameType) => setFormData(prev => ({ ...prev, game: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mario_kart">Mario Kart</SelectItem>
                  <SelectItem value="super_smash_bros">Super Smash Bros</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter tournament description"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tournament Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Registration Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.registrationDeadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.registrationDeadline ? format(formData.registrationDeadline, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.registrationDeadline}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, registrationDeadline: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="2"
                max="64"
                value={formData.maxParticipants}
                onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select value={formData.format} onValueChange={(value: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss') => setFormData(prev => ({ ...prev, format: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_elimination">Single Elimination</SelectItem>
                  <SelectItem value="double_elimination">Double Elimination</SelectItem>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                  <SelectItem value="swiss">Swiss</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'upcoming' | 'ongoing' | 'completed') => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryFee">Entry Fee ($)</Label>
              <Input
                id="entryFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.entryFee}
                onChange={(e) => setFormData(prev => ({ ...prev, entryFee: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizePool">Prize Pool ($)</Label>
              <Input
                id="prizePool"
                type="number"
                min="0"
                step="0.01"
                value={formData.prizePool}
                onChange={(e) => setFormData(prev => ({ ...prev, prizePool: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Points Awarded</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first">1st Place</Label>
                <Input
                  id="first"
                  type="number"
                  min="0"
                  value={formData.pointsAwarded.first}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pointsAwarded: { ...prev.pointsAwarded, first: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="second">2nd Place</Label>
                <Input
                  id="second"
                  type="number"
                  min="0"
                  value={formData.pointsAwarded.second}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pointsAwarded: { ...prev.pointsAwarded, second: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="third">3rd Place</Label>
                <Input
                  id="third"
                  type="number"
                  min="0"
                  value={formData.pointsAwarded.third}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pointsAwarded: { ...prev.pointsAwarded, third: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="participation">Participation</Label>
                <Input
                  id="participation"
                  type="number"
                  min="0"
                  value={formData.pointsAwarded.participation}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pointsAwarded: { ...prev.pointsAwarded, participation: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tournament Rules</Label>
            <div className="space-y-2">
              {formData.rules.map((rule, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={rule}
                    onChange={(e) => updateRule(index, e.target.value)}
                    placeholder={`Rule ${index + 1}`}
                  />
                  {formData.rules.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRule(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRule}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Tournament'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
