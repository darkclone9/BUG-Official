'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { getUserAvailablePoints } from '@/lib/database';
import { calculateCartDiscount, formatCents } from '@/lib/points';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, CreditCard, Sparkles, Truck, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [fulfillmentType, setFulfillmentType] = useState<'campus_pickup' | 'shipping'>('campus_pickup');

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }

    // Redirect if cart is empty
    if (items.length === 0) {
      router.push('/shop');
      return;
    }

    // Load user's available points
    loadPoints();
  }, [user, items, router]);

  const loadPoints = async () => {
    if (!user) return;

    try {
      const points = await getUserAvailablePoints(user.uid);
      setAvailablePoints(points);
    } catch (error) {
      console.error('Error loading points:', error);
    }
  };

  const handleCheckout = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          pointsToUse,
          fulfillmentType,
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to proceed to checkout');
      setLoading(false);
    }
  };

  if (!user || items.length === 0) {
    return null;
  }

  // Calculate discount
  const orderItems = items.map(item => ({
    productId: item.product.id,
    productName: item.product.name,
    productImage: item.product.images?.[0] || '',
    quantity: item.quantity,
    price: item.product.price,
    variant: item.selectedVariant,
    pointsEligible: item.product.pointsEligible,
  }));

  const discountResult = calculateCartDiscount(orderItems, pointsToUse);
  const estimatedShipping = fulfillmentType === 'shipping' ? 500 : 0; // $5.00 flat rate
  const estimatedTotal = subtotal - discountResult.discountCents + estimatedShipping;

  // Calculate max points that can be used
  const maxPointsForDiscount = Math.min(
    availablePoints,
    discountResult.pointsUsed + 10000 // Allow some buffer for calculation
  );

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

      {/* Checkout Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fulfillment Type */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Fulfillment Method
              </h2>
              <RadioGroup
                value={fulfillmentType}
                onValueChange={(value) => setFulfillmentType(value as 'campus_pickup' | 'shipping')}
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="campus_pickup" id="campus_pickup" />
                  <Label htmlFor="campus_pickup" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4" />
                      <span className="font-semibold">Campus Pickup</span>
                      <span className="text-sm text-primary">(Free)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pick up your order on campus. We&apos;ll notify you when it&apos;s ready.
                    </p>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="shipping" id="shipping" />
                  <Label htmlFor="shipping" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="h-4 w-4" />
                      <span className="font-semibold">Shipping</span>
                      <span className="text-sm text-muted-foreground">($5.00 flat rate)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Standard shipping (5-10 business days)
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Points Discount */}
            {availablePoints > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Use Participation Points
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Points to use:</span>
                    <span className="font-semibold text-foreground">
                      {pointsToUse.toLocaleString()} / {availablePoints.toLocaleString()}
                    </span>
                  </div>

                  <Slider
                    value={[pointsToUse]}
                    onValueChange={(value) => setPointsToUse(value[0])}
                    max={maxPointsForDiscount}
                    step={100}
                    className="w-full"
                  />

                  {pointsToUse > 0 && (
                    <div className="bg-background rounded-lg p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount:</span>
                        <span className="text-primary font-semibold">
                          -{formatCents(discountResult.discountCents)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.selectedVariant}`} className="flex gap-3">
                    <div className="relative w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {item.product.images?.[0] && (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {item.product.name}
                      </p>
                      {item.selectedVariant && (
                        <p className="text-xs text-muted-foreground">
                          {item.selectedVariant}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} × {formatCents(item.product.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatCents(subtotal)}</span>
                </div>

                {discountResult.discountCents > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Points Discount</span>
                    <span className="text-primary font-semibold">
                      -{formatCents(discountResult.discountCents)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">
                    {fulfillmentType === 'campus_pickup' ? 'Free' : formatCents(estimatedShipping)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">Calculated at checkout</span>
                </div>

                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold text-foreground">Estimated Total</span>
                  <span className="text-xl font-bold text-foreground">
                    {formatCents(estimatedTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                size="lg"
                className="w-full mt-6 gap-2"
                onClick={handleCheckout}
                disabled={loading}
              >
                <CreditCard className="h-5 w-5" />
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
