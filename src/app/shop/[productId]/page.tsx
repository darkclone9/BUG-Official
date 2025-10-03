'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShopProduct } from '@/types/types';
import { getShopProduct } from '@/lib/database';
import { formatCents, formatPointsAsDiscount } from '@/lib/points';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ShoppingCart, Sparkles, Minus, Plus, Package, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import PointsDiscountCalculator from '@/components/shop/PointsDiscountCalculator';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const productId = params.productId as string;

  const [product, setProduct] = useState<ShopProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getShopProduct(productId);
      if (!data) {
        router.push('/shop');
        return;
      }
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
      router.push('/shop');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && (product?.stock === -1 || newQuantity <= (product?.stock || 0))) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // TODO: Implement cart functionality in Phase 5
    console.log('Add to cart:', { productId, quantity, selectedVariant });
    alert('Cart functionality will be implemented in Phase 5!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const totalPrice = product.price * quantity;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/shop">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 25vw, 12.5vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Category */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
                <Badge variant="outline" className="capitalize">
                  {product.category}
                </Badge>
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.pointsEligible && (
                  <Badge className="bg-primary/90">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Points Eligible
                  </Badge>
                )}
                {isOutOfStock && (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
                {isLowStock && !isOutOfStock && (
                  <Badge variant="secondary">Only {product.stock} left</Badge>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-b py-4">
              <p className="text-4xl font-bold text-foreground mb-2">
                {formatCents(product.price)}
              </p>
              {product.pointsEligible && user && (
                <p className="text-sm text-muted-foreground">
                  Use your participation points for up to 50% off
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  {product.variants[0].name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants[0].options.map((option) => (
                    <Button
                      key={option}
                      variant={selectedVariant === option ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedVariant(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      if (val >= 1 && (product.stock === -1 || val <= product.stock)) {
                        setQuantity(val);
                      }
                    }}
                    className="w-16 text-center border-0 focus-visible:ring-0"
                    min={1}
                    max={product.stock === -1 ? undefined : product.stock}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={product.stock !== -1 && quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Total: <span className="font-semibold text-foreground">{formatCents(totalPrice)}</span>
                </p>
              </div>
            </div>

            {/* Points Discount Calculator */}
            {product.pointsEligible && user && (
              <PointsDiscountCalculator productPrice={totalPrice} quantity={quantity} />
            )}

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleAddToCart}
              disabled={isOutOfStock || (product.variants && product.variants.length > 0 && !selectedVariant)}
            >
              <ShoppingCart className="h-5 w-5" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>

            {/* Shipping Info */}
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Campus Pickup Available</p>
                  <p className="text-sm text-muted-foreground">
                    Pick up your order on campus or choose shipping at checkout
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

