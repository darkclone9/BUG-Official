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
import { Checkbox } from '@/components/ui/checkbox';
import { StoreCreditMultiplier, StoreCreditCategory } from '@/types/types';
import {
  createStoreCreditMultiplier,
  getAllStoreCreditMultipliers,
  updateStoreCreditMultiplier,
  deleteStoreCreditMultiplier
} from '@/lib/database';
import { Plus, Edit, Trash2, Zap, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const CREDIT_CATEGORIES: { value: StoreCreditCategory; label: string }[] = [
  { value: 'event_attendance', label: 'Event Attendance' },
  { value: 'volunteer_work', label: 'Volunteer Work' },
  { value: 'event_hosting', label: 'Event Hosting' },
  { value: 'contribution', label: 'Contribution' },
];

export default function StoreCreditMultiplierManagement() {
  const { user } = useAuth();
  const [multipliers, setMultipliers] = useState<StoreCreditMultiplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingMultiplier, setEditingMultiplier] = useState<StoreCreditMultiplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    multiplier: 2.0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    applicableCategories: ['event_attendance'] as StoreCreditCategory[],
    isActive: true,
  });

  useEffect(() => {
    loadMultipliers();
  }, []);

  const loadMultipliers = async () => {
    try {
      setLoading(true);
      const data = await getAllStoreCreditMultipliers();
      setMultipliers(data);
    } catch (error) {
      console.error('Error loading multipliers:', error);
      toast.error('Failed to load multipliers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!user) return;

    if (!formData.name || !formData.description || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createStoreCreditMultiplier({
        name: formData.name,
        description: formData.description,
        multiplier: formData.multiplier,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        applicableCategories: formData.applicableCategories,
        isActive: formData.isActive,
        createdBy: user.uid,
      });

      toast.success('Store credit multiplier created successfully!');
      setShowCreateDialog(false);
      resetForm();
      loadMultipliers();
    } catch (error) {
      console.error('Error creating multiplier:', error);
      toast.error('Failed to create multiplier');
    }
  };

  const handleUpdate = async () => {
    if (!editingMultiplier) return;

    try {
      await updateStoreCreditMultiplier(editingMultiplier.id, {
        name: formData.name,
        description: formData.description,
        multiplier: formData.multiplier,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        applicableCategories: formData.applicableCategories,
        isActive: formData.isActive,
      });

      toast.success('Multiplier updated successfully!');
      setEditingMultiplier(null);
      resetForm();
      loadMultipliers();
    } catch (error) {
      console.error('Error updating multiplier:', error);
      toast.error('Failed to update multiplier');
    }
  };

  const handleToggleActive = async (multiplier: StoreCreditMultiplier) => {
    try {
      await updateStoreCreditMultiplier(multiplier.id, {
        isActive: !multiplier.isActive,
      });
      toast.success(`Multiplier ${multiplier.isActive ? 'deactivated' : 'activated'}`);
      loadMultipliers();
    } catch (error) {
      console.error('Error toggling multiplier:', error);
      toast.error('Failed to update multiplier');
    }
  };

  const handleDelete = async (multiplierId: string) => {
    if (!confirm('Are you sure you want to delete this multiplier?')) return;

    try {
      await deleteStoreCreditMultiplier(multiplierId);
      toast.success('Multiplier deleted');
      loadMultipliers();
    } catch (error) {
      console.error('Error deleting multiplier:', error);
      toast.error('Failed to delete multiplier');
    }
  };

  const handleEdit = (multiplier: StoreCreditMultiplier) => {
    setEditingMultiplier(multiplier);
    setFormData({
      name: multiplier.name,
      description: multiplier.description,
      multiplier: multiplier.multiplier,
      startDate: new Date(multiplier.startDate).toISOString().split('T')[0],
      endDate: new Date(multiplier.endDate).toISOString().split('T')[0],
      applicableCategories: multiplier.applicableCategories,
      isActive: multiplier.isActive,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      multiplier: 2.0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      applicableCategories: ['event_attendance'],
      isActive: true,
    });
  };

  const toggleCategory = (category: StoreCreditCategory) => {
    setFormData(prev => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(category)
        ? prev.applicableCategories.filter(c => c !== category)
        : [...prev.applicableCategories, category]
    }));
  };

  const isActive = (multiplier: StoreCreditMultiplier) => {
    const now = new Date();
    return multiplier.isActive &&
           new Date(multiplier.startDate) <= now &&
           new Date(multiplier.endDate) >= now;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Store Credit Multiplier Campaigns
          </h2>
          <p className="text-muted-foreground mt-1">
            Create campaigns to multiply store credit earned during specific periods
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingMultiplier(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMultiplier ? 'Edit' : 'Create'} Store Credit Multiplier Campaign
              </DialogTitle>
              <DialogDescription>
                Set up a campaign to multiply store credit earned during a specific period
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Double Credit Weekend"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the campaign..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="multiplier">Multiplier *</Label>
                <Input
                  id="multiplier"
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="10.0"
                  value={formData.multiplier}
                  onChange={(e) => setFormData({ ...formData, multiplier: parseFloat(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Store credit will be multiplied by this value (e.g., 2.0 = double credit)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Applicable Categories *</Label>
                <div className="space-y-2 mt-2">
                  {CREDIT_CATEGORIES.map((category) => (
                    <div key={category.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.value}
                        checked={formData.applicableCategories.includes(category.value)}
                        onCheckedChange={() => toggleCategory(category.value)}
                      />
                      <label
                        htmlFor={category.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Select which credit earning activities will receive the multiplier
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Active (campaign will run during the specified dates)
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={editingMultiplier ? handleUpdate : handleCreate}
                  className="flex-1"
                >
                  {editingMultiplier ? 'Update Campaign' : 'Create Campaign'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingMultiplier(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Multipliers List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading campaigns...</p>
        </div>
      ) : multipliers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No multiplier campaigns yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first campaign to boost user engagement!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {multipliers.map((multiplier) => (
            <Card key={multiplier.id} className={isActive(multiplier) ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {multiplier.name}
                      {isActive(multiplier) && (
                        <Badge className="bg-green-500">Active Now</Badge>
                      )}
                      {!multiplier.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {multiplier.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        handleEdit(multiplier);
                        setShowCreateDialog(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(multiplier.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Multiplier</p>
                    <p className="text-2xl font-bold text-primary">{multiplier.multiplier}x</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Start Date
                    </p>
                    <p className="font-medium">
                      {new Date(multiplier.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      End Date
                    </p>
                    <p className="font-medium">
                      {new Date(multiplier.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="font-medium">{multiplier.applicableCategories.length}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Applies to:</p>
                  <div className="flex flex-wrap gap-2">
                    {multiplier.applicableCategories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {CREDIT_CATEGORIES.find(c => c.value === category)?.label || category}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant={multiplier.isActive ? 'destructive' : 'default'}
                    onClick={() => handleToggleActive(multiplier)}
                  >
                    {multiplier.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
