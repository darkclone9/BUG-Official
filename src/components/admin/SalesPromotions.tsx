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
import { Plus, Edit, Trash2, TrendingUp, Tag, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';

interface SalePromotion {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  applicableProducts: string[]; // 'all' or specific product IDs
  minimumPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  createdAt: Date;
  createdBy: string;
}

export default function SalesPromotions() {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<SalePromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<SalePromotion | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    applicableProducts: 'all',
    minimumPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    isActive: true,
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const promotionsQuery = query(
        collection(db, 'sales_promotions'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(promotionsQuery);
      
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          startDate: docData.startDate.toDate(),
          endDate: docData.endDate.toDate(),
          createdAt: docData.createdAt.toDate(),
        } as SalePromotion;
      });
      
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

    if (!formData.name || !formData.description || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addDoc(collection(db, 'sales_promotions'), {
        name: formData.name,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: Timestamp.fromDate(new Date(formData.endDate)),
        isActive: formData.isActive,
        applicableProducts: [formData.applicableProducts],
        minimumPurchase: formData.minimumPurchase ? parseFloat(formData.minimumPurchase) : undefined,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        usageCount: 0,
        createdAt: Timestamp.now(),
        createdBy: user.uid,
      });

      toast.success('Sale promotion created successfully!');
      setShowCreateDialog(false);
      resetForm();
      loadPromotions();
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast.error('Failed to create promotion');
    }
  };

  const handleUpdate = async () => {
    if (!editingPromotion) return;

    try {
      await updateDoc(doc(db, 'sales_promotions', editingPromotion.id), {
        name: formData.name,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: Timestamp.fromDate(new Date(formData.endDate)),
        isActive: formData.isActive,
        applicableProducts: [formData.applicableProducts],
        minimumPurchase: formData.minimumPurchase ? parseFloat(formData.minimumPurchase) : undefined,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      });

      toast.success('Promotion updated successfully!');
      setEditingPromotion(null);
      resetForm();
      loadPromotions();
    } catch (error) {
      console.error('Error updating promotion:', error);
      toast.error('Failed to update promotion');
    }
  };

  const handleToggleActive = async (promotion: SalePromotion) => {
    try {
      await updateDoc(doc(db, 'sales_promotions', promotion.id), {
        isActive: !promotion.isActive,
      });
      toast.success(`Promotion ${promotion.isActive ? 'deactivated' : 'activated'}`);
      loadPromotions();
    } catch (error) {
      console.error('Error toggling promotion:', error);
      toast.error('Failed to update promotion');
    }
  };

  const handleDelete = async (promotionId: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    try {
      await deleteDoc(doc(db, 'sales_promotions', promotionId));
      toast.success('Promotion deleted');
      loadPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Failed to delete promotion');
    }
  };

  const handleEdit = (promotion: SalePromotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      startDate: new Date(promotion.startDate).toISOString().split('T')[0],
      endDate: new Date(promotion.endDate).toISOString().split('T')[0],
      applicableProducts: promotion.applicableProducts[0] || 'all',
      minimumPurchase: promotion.minimumPurchase?.toString() || '',
      maxDiscount: promotion.maxDiscount?.toString() || '',
      usageLimit: promotion.usageLimit?.toString() || '',
      isActive: promotion.isActive,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 10,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      applicableProducts: 'all',
      minimumPurchase: '',
      maxDiscount: '',
      usageLimit: '',
      isActive: true,
    });
  };

  const isActive = (promotion: SalePromotion) => {
    const now = new Date();
    return promotion.isActive && 
           new Date(promotion.startDate) <= now && 
           new Date(promotion.endDate) >= now;
  };

  const formatDiscount = (promotion: SalePromotion) => {
    if (promotion.discountType === 'percentage') {
      return `${promotion.discountValue}% off`;
    }
    return `$${promotion.discountValue.toFixed(2)} off`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-500" />
            Sales & Discount Promotions
          </h2>
          <p className="text-muted-foreground mt-1">
            Create sales and discount campaigns for shop products
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingPromotion(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? 'Edit' : 'Create'} Sale Promotion
              </DialogTitle>
              <DialogDescription>
                Set up a discount campaign for shop products
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Promotion Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Summer Sale 2025"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
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
                  <Label htmlFor="discountType">Discount Type *</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value: 'percentage' | 'fixed') => 
                      setFormData({ ...formData, discountType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discountValue">
                    Discount Value * {formData.discountType === 'percentage' ? '(%)' : '($)'}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    step={formData.discountType === 'percentage' ? '1' : '0.01'}
                    min="0"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                  />
                </div>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimumPurchase">Minimum Purchase ($)</Label>
                  <Input
                    id="minimumPurchase"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimumPurchase}
                    onChange={(e) => setFormData({ ...formData, minimumPurchase: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label htmlFor="maxDiscount">Max Discount ($)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min="0"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="Optional - leave empty for unlimited"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Maximum number of times this promotion can be used
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={editingPromotion ? handleUpdate : handleCreate}
                  className="flex-1"
                >
                  {editingPromotion ? 'Update Promotion' : 'Create Promotion'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingPromotion(null);
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

      {/* Promotions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading promotions...</p>
        </div>
      ) : promotions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No sale promotions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first sale to boost shop revenue!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {promotions.map((promotion) => (
            <Card key={promotion.id} className={isActive(promotion) ? 'border-green-500' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {promotion.name}
                      {isActive(promotion) && (
                        <Badge className="bg-green-500">Active Now</Badge>
                      )}
                      {!promotion.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {promotion.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        handleEdit(promotion);
                        setShowCreateDialog(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(promotion.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      Discount
                    </p>
                    <p className="text-2xl font-bold text-green-600">{formatDiscount(promotion)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {new Date(promotion.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">
                      {new Date(promotion.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Usage</p>
                    <p className="font-medium">
                      {promotion.usageCount}
                      {promotion.usageLimit ? ` / ${promotion.usageLimit}` : ' / ∞'}
                    </p>
                  </div>
                </div>
                {(promotion.minimumPurchase || promotion.maxDiscount) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {promotion.minimumPurchase && (
                      <Badge variant="outline">
                        Min Purchase: ${promotion.minimumPurchase.toFixed(2)}
                      </Badge>
                    )}
                    {promotion.maxDiscount && (
                      <Badge variant="outline">
                        Max Discount: ${promotion.maxDiscount.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant={promotion.isActive ? 'destructive' : 'default'}
                    onClick={() => handleToggleActive(promotion)}
                  >
                    {promotion.isActive ? 'Deactivate' : 'Activate'}
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

