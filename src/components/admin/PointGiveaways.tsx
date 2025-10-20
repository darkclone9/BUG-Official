'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Gift, Users, Calendar, Award } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { getAllUsers, awardPointsEnhanced } from '@/lib/database';
import { User, PointsCategory } from '@/types/types';

interface PointGiveaway {
  id: string;
  name: string;
  description: string;
  pointsAmount: number;
  category: PointsCategory;
  targetAudience: 'all' | 'active' | 'new' | 'specific';
  specificUserIds?: string[];
  scheduledDate: Date;
  isExecuted: boolean;
  executedAt?: Date;
  recipientCount: number;
  createdAt: Date;
  createdBy: string;
}

const POINTS_CATEGORIES: { value: PointsCategory; label: string }[] = [
  { value: 'event_attendance', label: 'Event Attendance' },
  { value: 'volunteer_work', label: 'Volunteer Work' },
  { value: 'event_hosting', label: 'Event Hosting' },
  { value: 'contribution', label: 'Contribution' },
  { value: 'adjustment', label: 'Admin Adjustment' },
];

export default function PointGiveaways() {
  const { user } = useAuth();
  const [giveaways, setGiveaways] = useState<PointGiveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pointsAmount: 100,
    category: 'contribution' as PointsCategory,
    targetAudience: 'all' as 'all' | 'active' | 'new' | 'specific',
    scheduledDate: new Date().toISOString().split('T')[0],
    executeNow: false,
  });

  useEffect(() => {
    loadGiveaways();
  }, []);

  const loadGiveaways = async () => {
    try {
      setLoading(true);
      const giveawaysQuery = query(
        collection(db, 'point_giveaways'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(giveawaysQuery);

      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          scheduledDate: docData.scheduledDate.toDate(),
          createdAt: docData.createdAt.toDate(),
          executedAt: docData.executedAt?.toDate(),
        } as PointGiveaway;
      });

      setGiveaways(data);
    } catch (error) {
      console.error('Error loading giveaways:', error);
      toast.error('Failed to load giveaways');
    } finally {
      setLoading(false);
    }
  };

  const getTargetUsers = async (): Promise<User[]> => {
    const allUsers = await getAllUsers();

    switch (formData.targetAudience) {
      case 'all':
        return allUsers;

      case 'active':
        // Users who logged in within last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return allUsers.filter(u =>
          u.lastLoginDate && new Date(u.lastLoginDate) >= thirtyDaysAgo
        );

      case 'new':
        // Users who joined within last 30 days
        const newUserCutoff = new Date();
        newUserCutoff.setDate(newUserCutoff.getDate() - 30);
        return allUsers.filter(u =>
          u.joinDate && new Date(u.joinDate) >= newUserCutoff
        );

      default:
        return allUsers;
    }
  };

  const executeGiveaway = async () => {
    if (!user) return;

    try {
      setExecuting(true);
      const targetUsers = await getTargetUsers();

      if (targetUsers.length === 0) {
        toast.error('No users match the target audience');
        return;
      }

      // Award points to all target users
      let successCount = 0;
      for (const targetUser of targetUsers) {
        try {
          await awardPointsEnhanced(
            targetUser.uid,
            formData.pointsAmount,
            `${formData.name}: ${formData.description}`,
            formData.category,
            user.uid,
            false, // No approval needed for giveaways
            1.0 // No multiplier
          );
          successCount++;
        } catch (error) {
          console.error(`Error awarding points to ${targetUser.email}:`, error);
        }
      }

      // Create giveaway record
      await addDoc(collection(db, 'point_giveaways'), {
        name: formData.name,
        description: formData.description,
        pointsAmount: formData.pointsAmount,
        category: formData.category,
        targetAudience: formData.targetAudience,
        scheduledDate: Timestamp.fromDate(new Date(formData.scheduledDate)),
        isExecuted: true,
        executedAt: Timestamp.now(),
        recipientCount: successCount,
        createdAt: Timestamp.now(),
        createdBy: user.uid,
      });

      toast.success(`Points awarded to ${successCount} users!`);
      setShowCreateDialog(false);
      resetForm();
      loadGiveaways();
    } catch (error) {
      console.error('Error executing giveaway:', error);
      toast.error('Failed to execute giveaway');
    } finally {
      setExecuting(false);
    }
  };

  const handleCreate = async () => {
    if (!user) return;

    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.executeNow) {
      // Execute immediately
      await executeGiveaway();
    } else {
      // Schedule for later
      try {
        await addDoc(collection(db, 'point_giveaways'), {
          name: formData.name,
          description: formData.description,
          pointsAmount: formData.pointsAmount,
          category: formData.category,
          targetAudience: formData.targetAudience,
          scheduledDate: Timestamp.fromDate(new Date(formData.scheduledDate)),
          isExecuted: false,
          recipientCount: 0,
          createdAt: Timestamp.now(),
          createdBy: user.uid,
        });

        toast.success('Giveaway scheduled successfully!');
        setShowCreateDialog(false);
        resetForm();
        loadGiveaways();
      } catch (error) {
        console.error('Error creating giveaway:', error);
        toast.error('Failed to create giveaway');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      pointsAmount: 100,
      category: 'contribution',
      targetAudience: 'all',
      scheduledDate: new Date().toISOString().split('T')[0],
      executeNow: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6 text-purple-500" />
            Point Giveaways
          </h2>
          <p className="text-muted-foreground mt-1">
            Award bonus points to users for special occasions or achievements
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Giveaway
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Point Giveaway</DialogTitle>
              <DialogDescription>
                Award bonus points to users for special occasions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Giveaway Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Holiday Bonus Points"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the giveaway..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pointsAmount">Points Amount *</Label>
                  <Input
                    id="pointsAmount"
                    type="number"
                    min="1"
                    value={formData.pointsAmount}
                    onChange={(e) => setFormData({ ...formData, pointsAmount: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: PointsCategory) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POINTS_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience *</Label>
                <Select
                  value={formData.targetAudience}
                  onValueChange={(value: 'all' | 'active' | 'new' | 'specific') =>
                    setFormData({ ...formData, targetAudience: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active Users (last 30 days)</SelectItem>
                    <SelectItem value="new">New Users (joined last 30 days)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Select which users will receive the points
                </p>
              </div>

              <div>
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  disabled={formData.executeNow}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="executeNow"
                  checked={formData.executeNow}
                  onCheckedChange={(checked) => setFormData({ ...formData, executeNow: checked as boolean })}
                />
                <label htmlFor="executeNow" className="text-sm font-medium">
                  Execute immediately (award points now)
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreate}
                  className="flex-1"
                  disabled={executing}
                >
                  {executing ? 'Awarding Points...' : formData.executeNow ? 'Award Points Now' : 'Schedule Giveaway'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    resetForm();
                  }}
                  disabled={executing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Giveaways List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading giveaways...</p>
        </div>
      ) : giveaways.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No point giveaways yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first giveaway to reward your community!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {giveaways.map((giveaway) => (
            <Card key={giveaway.id} className={giveaway.isExecuted ? 'border-purple-500' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {giveaway.name}
                      {giveaway.isExecuted ? (
                        <Badge className="bg-purple-500">Executed</Badge>
                      ) : (
                        <Badge variant="secondary">Scheduled</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {giveaway.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Points
                    </p>
                    <p className="text-2xl font-bold text-purple-600">{giveaway.pointsAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Recipients
                    </p>
                    <p className="font-medium">{giveaway.recipientCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {giveaway.isExecuted ? 'Executed' : 'Scheduled'}
                    </p>
                    <p className="font-medium">
                      {giveaway.isExecuted && giveaway.executedAt
                        ? new Date(giveaway.executedAt).toLocaleDateString()
                        : new Date(giveaway.scheduledDate).toLocaleDateString()
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Audience</p>
                    <p className="font-medium capitalize">{giveaway.targetAudience}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge variant="outline">
                    {POINTS_CATEGORIES.find(c => c.value === giveaway.category)?.label || giveaway.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
