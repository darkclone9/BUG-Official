'use client';

import { useState, useEffect } from 'react';
import {
  createWelcomePointsPromotion,
  getAllWelcomePointsPromotions,
  updateWelcomePointsPromotion,
  deactivateWelcomePointsPromotion,
  getWelcomePointsRecipients,
} from '@/lib/database';
import { WelcomePointsPromotion, WelcomePointsRecipient } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Gift, Users, Calendar, TrendingUp, Eye, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function WelcomePointsPromotions() {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<WelcomePointsPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<WelcomePointsPromotion | null>(null);
  const [recipients, setRecipients] = useState<WelcomePointsRecipient[]>([]);
  const [showRecipientsDialog, setShowRecipientsDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pointsAmount: 1500,
    maxUsers: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true,
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const data = await getAllWelcomePointsPromotions();
      setPromotions(data);
    } catch (error) {
      console.error('Error loading promotions:', error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!user) return;

    try {
      await createWelcomePointsPromotion({
        name: formData.name,
        description: formData.description,
        pointsAmount: formData.pointsAmount,
        maxUsers: formData.maxUsers,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        isActive: formData.isActive,
        createdBy: user.uid,
      });

      toast.success('Promotion created successfully!');
      setShowCreateDialog(false);
      setFormData({
        name: '',
        description: '',
        pointsAmount: 1500,
        maxUsers: 100,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        isActive: true,
      });
      loadPromotions();
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast.error('Failed to create promotion');
    }
  };

  const handleToggleActive = async (promotionId: string, isActive: boolean) => {
    try {
      if (!isActive) {
        await deactivateWelcomePointsPromotion(promotionId);
      } else {
        await updateWelcomePointsPromotion(promotionId, { isActive: true });
      }
      toast.success(`Promotion ${isActive ? 'activated' : 'deactivated'}`);
      loadPromotions();
    } catch (error) {
      console.error('Error toggling promotion:', error);
      toast.error('Failed to update promotion');
    }
  };

  const handleViewRecipients = async (promotion: WelcomePointsPromotion) => {
    try {
      setSelectedPromotion(promotion);
      const data = await getWelcomePointsRecipients(promotion.id);
      setRecipients(data);
      setShowRecipientsDialog(true);
    } catch (error) {
      console.error('Error loading recipients:', error);
      toast.error('Failed to load recipients');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading promotions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Welcome Points Promotions</h2>
          <p className="text-sm text-muted-foreground">
            Automatically award points to new users who join during promotion periods
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Welcome Points Promotion</DialogTitle>
              <DialogDescription>
                Set up a new promotion to award points to new users
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Promotion Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., First 100 Users Bonus"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the promotion..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pointsAmount">Points to Award</Label>
                  <Input
                    id="pointsAmount"
                    type="number"
                    value={formData.pointsAmount}
                    onChange={(e) => setFormData({ ...formData, pointsAmount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxUsers">Maximum Users</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!formData.name || !formData.description}>
                  Create Promotion
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Promotions List */}
      <div className="grid gap-4">
        {promotions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No promotions created yet</p>
              <p className="text-sm">Create your first welcome points promotion to get started</p>
            </CardContent>
          </Card>
        ) : (
          promotions.map((promotion) => (
            <Card key={promotion.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{promotion.name}</CardTitle>
                      <Badge variant={promotion.isActive ? 'default' : 'secondary'}>
                        {promotion.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {promotion.currentCount >= promotion.maxUsers && (
                        <Badge variant="destructive">Full</Badge>
                      )}
                    </div>
                    <CardDescription>{promotion.description}</CardDescription>
                  </div>
                  <Switch
                    checked={promotion.isActive}
                    onCheckedChange={(checked) => handleToggleActive(promotion.id, checked)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Points</p>
                      <p className="font-semibold">{promotion.pointsAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Recipients</p>
                      <p className="font-semibold">
                        {promotion.currentCount} / {promotion.maxUsers}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-semibold">{new Date(promotion.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="font-semibold">
                        {Math.round((promotion.currentCount / promotion.maxUsers) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewRecipients(promotion)}
                  disabled={promotion.currentCount === 0}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Recipients ({promotion.currentCount})
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recipients Dialog */}
      <Dialog open={showRecipientsDialog} onOpenChange={setShowRecipientsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPromotion?.name} - Recipients
            </DialogTitle>
            <DialogDescription>
              Users who received welcome points from this promotion
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {recipients.map((recipient) => (
              <div
                key={recipient.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Badge variant="outline">#{recipient.recipientNumber}</Badge>
                  <div>
                    <p className="font-semibold">{recipient.userDisplayName}</p>
                    <p className="text-sm text-muted-foreground">{recipient.userEmail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">+{recipient.pointsAwarded} points</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(recipient.awardedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

