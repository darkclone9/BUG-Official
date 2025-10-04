'use client';

import { useState, useEffect } from 'react';
import { ShopProduct } from '@/types/types';
import { getShopProducts, createShopProduct, updateShopProduct, deleteShopProduct } from '@/lib/database';
import { formatCents } from '@/lib/points';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Package, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function ProductManagement() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null);
  const [formData, setFormData] = useState<Partial<ShopProduct>>({
    name: '',
    description: '',
    price: 0,
    category: 'apparel',
    stock: 0,
    images: [],
    tags: [],
    variants: [],
    isActive: true,
    isFeatured: false,
    pointsEligible: true,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getShopProducts(true); // Include inactive products for admin
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'apparel',
      stock: 0,
      images: [],
      tags: [],
      variants: [],
      isActive: true,
      isFeatured: false,
      pointsEligible: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (product: ShopProduct) => {
    setEditingProduct(product);
    setFormData(product);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.description || formData.price === undefined) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (editingProduct) {
        await updateShopProduct(editingProduct.id, formData);
        toast.success('Product updated successfully');
      } else {
        await createShopProduct(formData as Omit<ShopProduct, 'id' | 'createdAt' | 'updatedAt'>);
        toast.success('Product created successfully');
      }

      setDialogOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteShopProduct(productId);
      toast.success('Product deleted successfully');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleToggleActive = async (product: ShopProduct) => {
    try {
      await updateShopProduct(product.id, { isActive: !product.isActive });
      toast.success(`Product ${product.isActive ? 'hidden' : 'activated'}`);
      loadProducts();
    } catch (error) {
      console.error('Error toggling product:', error);
      toast.error('Failed to update product');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Product Management</h2>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-lg">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No products yet</p>
          <Button onClick={handleCreate} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create First Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-card border rounded-lg overflow-hidden">
              {/* Product Image */}
              <div className="relative h-48 bg-muted">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
                {!product.isActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive">Hidden</Badge>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
                  <div className="flex gap-1">
                    {product.isFeatured && (
                      <Badge variant="default" className="text-xs">Featured</Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-foreground">
                    {formatCents(product.price)}
                  </span>
                  <Badge variant="outline">
                    {product.stock === -1 ? 'Unlimited' : `${product.stock} in stock`}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(product)}
                  >
                    {product.isActive ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Create Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product details' : 'Add a new product to the shop'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (in cents) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 1999 for $19.99"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Preview: {formatCents(formData.price || 0)}
                </p>
              </div>

              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  placeholder="-1 for unlimited"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as ShopProduct['category'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apparel">Apparel</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="stickers">Stickers</SelectItem>
                  <SelectItem value="posters">Posters</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="images">Image URLs (one per line)</Label>
              <Textarea
                id="images"
                value={formData.images?.join('\n') || ''}
                onChange={(e) => setFormData({ ...formData, images: e.target.value.split('\n').filter(url => url.trim()) })}
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingProduct ? 'Update' : 'Create'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
