'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ShopOrder } from '@/types/types';
import { getUserShopOrders } from '@/lib/database';
import { formatCents } from '@/lib/points';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function OrderHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/profile/orders');
      return;
    }

    loadOrders();
  }, [user, router]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getUserShopOrders(user.uid);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ShopOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'paid':
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'ready_pickup':
        return <MapPin className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ShopOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'paid':
      case 'processing':
        return 'default';
      case 'ready_pickup':
        return 'default';
      case 'shipped':
        return 'default';
      case 'completed':
        return 'default';
      case 'cancelled':
      case 'refunded':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusMessage = (order: ShopOrder) => {
    switch (order.status) {
      case 'pending':
        return 'Payment pending';
      case 'paid':
        return 'Payment received, processing your order';
      case 'processing':
        return 'Your order is being prepared';
      case 'ready_pickup':
        return 'Ready for pickup! Bring your student ID';
      case 'shipped':
        return 'Your order has been shipped';
      case 'completed':
        return 'Order completed';
      case 'cancelled':
        return 'Order cancelled';
      case 'refunded':
        return 'Order refunded';
      default:
        return '';
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Order History</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-card border rounded-lg">
            <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No orders yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start shopping to see your orders here!
            </p>
            <Button asChild>
              <Link href="/shop">Browse Shop</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-card border rounded-lg overflow-hidden">
                {/* Order Header */}
                <div className="bg-muted p-4 border-b">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          Order #{order.id.slice(-8)}
                        </h3>
                        <Badge variant={getStatusColor(order.status)} className="gap-1">
                          {getStatusIcon(order.status)}
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">
                        {formatCents(order.total)}
                      </p>
                      {order.pointsUsed > 0 && (
                        <p className="text-sm text-primary">
                          Saved {formatCents(order.pointsDiscount)} with points!
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-4">
                  {/* Status Message */}
                  <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      {getStatusMessage(order)}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="relative w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                          {item.productImage ? (
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            {item.productName}
                          </p>
                          {item.variant && (
                            <p className="text-sm text-muted-foreground">
                              {item.variant}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × {formatCents(item.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {formatCents(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Fulfillment Info */}
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      {order.fulfillmentType === 'campus_pickup' ? (
                        <>
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-sm">Campus Pickup</span>
                        </>
                      ) : (
                        <>
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-sm">Shipping</span>
                        </>
                      )}
                    </div>
                    {order.shippingAddress && (
                      <p className="text-sm text-muted-foreground">
                        {order.shippingAddress.name}<br />
                        {order.shippingAddress.line1}<br />
                        {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                      </p>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t mt-4 pt-4 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatCents(order.subtotal)}</span>
                    </div>
                    {order.pointsDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Points Discount</span>
                        <span className="text-primary">-{formatCents(order.pointsDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">
                        {order.shipping === 0 ? 'Free' : formatCents(order.shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="text-foreground">{formatCents(order.tax)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">{formatCents(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

