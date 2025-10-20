'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGameGenreOptions } from '@/hooks/useGameGenres';
import { createTournament } from '@/lib/database';
import { uploadImage, deleteImageByURL } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { GameType, Tournament } from '@/types/types';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import AiAssistantButton from '@/components/admin/AiAssistantButton';
import { Progress } from '@/components/ui/progress';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTournamentModal({ isOpen, onClose, onSuccess }: CreateTournamentModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const { options: gameOptions, loading: genresLoading } = useGameGenreOptions(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    game: (gameOptions[0]?.value || 'mario_kart') as GameType,
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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const url = await uploadImage(selectedImage, {
        category: 'tournament-images',
        fileName: `tournament_${Date.now()}_${selectedImage.name}`,
        onProgress: (progress) => {
          setUploadProgress(progress.progress);
        },
      });

      setUploadedImageUrl(url);
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = async () => {
    if (uploadedImageUrl) {
      try {
        await deleteImageByURL(uploadedImageUrl);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    setUploadedImageUrl(null);
    setImagePreview(null);
    setSelectedImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const tournamentId = `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const tournamentData: Partial<Tournament> = {
        id: tournamentId,
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
        participants: [],
        createdAt: new Date(),
        createdBy: 'current-admin-id', // This should be the current admin's ID
      };

      // Add image URL if uploaded
      if (uploadedImageUrl) {
        tournamentData.imageUrl = uploadedImageUrl;
      }

      // Only add entryFee and prizePool if they have values
      if (formData.entryFee && formData.entryFee > 0) {
        tournamentData.entryFee = formData.entryFee;
      }
      if (formData.prizePool && formData.prizePool > 0) {
        tournamentData.prizePool = formData.prizePool;
      }

      await createTournament(tournamentData as Tournament);

      onSuccess();
      onClose();

      // Reset form
      setFormData({
        name: '',
        description: '',
        game: 'mario_kart',
        date: new Date(),
        registrationDeadline: new Date(),
        maxParticipants: 16,
        format: 'single_elimination',
        entryFee: 0,
        prizePool: 0,
        pointsAwarded: {
          first: 100,
          second: 50,
          third: 25,
          participation: 10,
        },
        rules: [''],
        status: 'upcoming',
      });
      setUploadedImageUrl(null);
      setImagePreview(null);
      setSelectedImage(null);
    } catch (error) {
      console.error('Error creating tournament:', error);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Tournament</DialogTitle>
          <DialogDescription>
            Create a new tournament for the community
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
              <AiAssistantButton
                currentText={formData.name}
                type="tournament_name"
                onAccept={(improvedText) => setFormData(prev => ({ ...prev, name: improvedText }))}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="game">Game</Label>
              <Select
                value={formData.game}
                onValueChange={(value: GameType) => setFormData(prev => ({ ...prev, game: value }))}
                disabled={genresLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={genresLoading ? "Loading games..." : "Select a game"} />
                </SelectTrigger>
                <SelectContent>
                  {gameOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
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
            <AiAssistantButton
              currentText={formData.description}
              type="tournament_description"
              onAccept={(improvedText) => setFormData(prev => ({ ...prev, description: improvedText }))}
              disabled={loading}
            />
          </div>

          {/* Tournament Banner Image Upload */}
          <div className="space-y-2">
            <Label>Tournament Banner Image (Optional)</Label>
            <div className="space-y-4">
              {!uploadedImageUrl && !imagePreview && (
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={uploading || loading}
                    className="flex-1"
                  />
                  {selectedImage && (
                    <Button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={uploading || loading}
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  )}
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-center text-muted-foreground">
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}

              {imagePreview && !uploadedImageUrl && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedImage(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {uploadedImageUrl && (
                <div className="relative">
                  <img
                    src={uploadedImageUrl}
                    alt="Tournament banner"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    Image uploaded
                  </div>
                </div>
              )}
            </div>
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
              {loading ? 'Creating...' : 'Create Tournament'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
