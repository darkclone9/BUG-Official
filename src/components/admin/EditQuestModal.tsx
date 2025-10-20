'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { updateQuest } from '@/lib/database';
import { toast } from 'sonner';
import { Quest, QuestCategory, QuestType } from '@/types/types';

interface EditQuestModalProps {
  isOpen: boolean;
  quest: Quest;
  onClose: () => void;
  onSuccess: () => void;
}

const TRACKING_KEYS = [
  'account_created',
  'profile_fields_completed',
  'events_attended',
  'tournaments_joined',
  'matches_won',
  'tournaments_won',
  'shop_purchases',
  'referrals',
];

const QUEST_TYPES: QuestType[] = ['one_time', 'repeatable', 'daily', 'weekly', 'progressive'];
const CATEGORIES: QuestCategory[] = ['profile_setup', 'club_participation', 'social', 'gaming_achievements', 'special'];

export default function EditQuestModal({ isOpen, onClose, quest, onSuccess }: EditQuestModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: quest.name,
    description: quest.description,
    category: quest.category,
    type: quest.type,
    rewardDollars: quest.rewardCents / 100,
    requirementType: quest.requirementType,
    requirementTarget: quest.requirementTarget,
    trackingKey: quest.trackingKey,
    isActive: quest.isActive,
    iconUrl: quest.iconUrl || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Quest name is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Quest description is required');
      return;
    }

    try {
      setLoading(true);

      const updateData: Partial<Quest> = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        rewardCents: Math.round(formData.rewardDollars * 100),
        iconUrl: formData.iconUrl || undefined,
        isActive: formData.isActive,
        requirementType: formData.requirementType,
        requirementTarget: formData.requirementTarget,
        trackingKey: formData.trackingKey,
      };

      await updateQuest(quest.id, updateData);
      toast.success('Quest updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating quest:', error);
      toast.error('Failed to update quest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Quest</DialogTitle>
          <DialogDescription>Update quest details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <Label htmlFor="name">Quest Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Welcome to BUG!"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what players need to do..."
              required
            />
          </div>

          {/* Category and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as QuestCategory })}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Quest Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as QuestType })}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUEST_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reward and Requirement */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reward">Reward (Dollars) *</Label>
              <Input
                id="reward"
                type="number"
                step="0.01"
                min="0"
                value={formData.rewardDollars}
                onChange={(e) => setFormData({ ...formData, rewardDollars: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label htmlFor="requirementTarget">Requirement Target *</Label>
              <Input
                id="requirementTarget"
                type="number"
                min="1"
                value={formData.requirementTarget}
                onChange={(e) => setFormData({ ...formData, requirementTarget: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>

          {/* Requirement Type and Tracking Key */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requirementType">Requirement Type *</Label>
              <Select value={formData.requirementType} onValueChange={(value) => setFormData({ ...formData, requirementType: value as 'count' | 'boolean' | 'value' })}>
                <SelectTrigger id="requirementType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="count">Count</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="trackingKey">Tracking Key *</Label>
              <Select value={formData.trackingKey} onValueChange={(value) => setFormData({ ...formData, trackingKey: value })}>
                <SelectTrigger id="trackingKey">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRACKING_KEYS.map(key => (
                    <SelectItem key={key} value={key}>{key.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Icon URL */}
          <div>
            <Label htmlFor="iconUrl">Icon URL (Optional)</Label>
            <Input
              id="iconUrl"
              value={formData.iconUrl}
              onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
              placeholder="https://example.com/icon.png"
            />
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
            />
            <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Quest'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

