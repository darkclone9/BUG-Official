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
import { Plus, Gift, Users, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { getAllUsers, createStoreCreditTransaction } from '@/lib/database';
import { User, StoreCreditCategory } from '@/types/types';
import { formatCentsToDollars, dollarsToCents } from '@/lib/storeCredit';

interface CreditGiveaway {
  id: string;
  name: string;
  description: string;
  creditAmountCents: number;
  category: StoreCreditCategory;
  targetAudience: 'all' | 'active' | 'new' | 'specific';
  specificUserIds?: string[];
  scheduledDate: Date;
  isExecuted: boolean;
  executedAt?: Date;
  recipientCount: number;
  createdAt: Date;
  createdBy: string;
}

const CREDIT_CATEGORIES: { value: StoreCreditCategory; label: string }[] = [
  { value: 'event_attendance', label: 'Event Attendance' },
  { value: 'volunteer_work', label: 'Volunteer Work' },
  { value: 'event_hosting', label: 'Event Hosting' },
  { value: 'contribution', label: 'Contribution' },
  { value: 'adjustment', label: 'Admin Adjustment' },
];

export default function StoreCreditGiveaways() {
  const { user } = useAuth();
  const [giveaways, setGiveaways] = useState<CreditGiveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    creditAmountDollars: 1.00,
    category: 'contribution' as StoreCreditCategory,
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
        collection(db, 'store_credit_giveaways'),
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
        } as CreditGiveaway;
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

      const creditAmountCents = dollarsToCents(formData.creditAmountDollars);

      // Award credit to all target users
      let successCount = 0;
      for (const targetUser of targetUsers) {
        try {
          await createStoreCreditTransaction({
            userId: targetUser.uid,
            amountCents: creditAmountCents,
            reason: `${formData.name}: ${formData.description}`,
            category: formData.category,
            approvalStatus: 'approved', // Auto-approve admin giveaways
          });
          successCount++;
        } catch (error) {
          console.error(`Error awarding credit to ${targetUser.email}:`, error);
        }
      }

      // Create giveaway record
      await addDoc(collection(db, 'store_credit_giveaways'), {
        name: formData.name,
        description: formData.description,
        creditAmountCents,
        category: formData.category,
        targetAudience: formData.targetAudience,
        scheduledDate: Timestamp.fromDate(new Date(formData.scheduledDate)),
        isExecuted: true,
        executedAt: Timestamp.now(),
        recipientCount: successCount,
        createdAt: Timestamp.now(),
        createdBy: user.uid,
      });

      toast.success(`Store credit awarded to ${successCount} users!`);
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
        const creditAmountCents = dollarsToCents(formData.creditAmountDollars);

        await addDoc(collection(db, 'store_credit_giveaways'), {
          name: formData.name,
          description: formData.description,
          creditAmountCents,
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
      creditAmountDollars: 1.00,
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
            Store Credit Giveaways
          </h2>
          <p className="text-muted-foreground mt-1">
            Award bonus store credit to users for special occasions or achievements
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
              <DialogTitle>Create Store Credit Giveaway</DialogTitle>
              <DialogDescription>
                Award bonus store credit to users for special occasions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Giveaway Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Holiday Bonus Credit"
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
                  <Label htmlFor="creditAmount">Credit Amount (USD) *</Label>
                  <Input
                    id="creditAmount"
                    type="number"
                    step="0.50"
                    min="0.50"
                    value={formData.creditAmountDollars}
                    onChange={(e) => setFormData({ ...formData, creditAmountDollars: parseFloat(e.target.value) })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Amount in dollars (e.g., 5.00 = $5.00)
                  </p>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: StoreCreditCategory) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CREDIT_CATEGORIES.map((cat) => (
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
                    <SelectItem value="active">Active Users (logged in last 30 days)</SelectItem>
                    <SelectItem value="new">New Users (joined last 30 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="executeNow"
                  checked={formData.executeNow}
                  onCheckedChange={(checked) => setFormData({ ...formData, executeNow: checked as boolean })}
                />
                <label htmlFor="executeNow" className="text-sm font-medium">
                  Execute immediately (award credit now)
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreate}
                  disabled={executing}
                  className="flex-1"
                >
                  {executing ? 'Executing...' : formData.executeNow ? 'Execute Now' : 'Schedule Giveaway'}
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
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No credit giveaways yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first giveaway to reward your users!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {giveaways.map((giveaway) => (
            <Card key={giveaway.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {giveaway.name}
                      {giveaway.isExecuted ? (
                        <Badge className="bg-green-500">Executed</Badge>
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
                    <p className="text-sm text-muted-foreground">Credit Amount</p>
                    <p className="text-2xl font-bold text-primary">
                      ${formatCentsToDollars(giveaway.creditAmountCents)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Audience</p>
                    <p className="font-medium capitalize">{giveaway.targetAudience}</p>
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
                        : new Date(giveaway.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge variant="secondary">{CREDIT_CATEGORIES.find(c => c.value === giveaway.category)?.label}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
