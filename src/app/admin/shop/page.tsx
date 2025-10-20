'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  DollarSign,
  MapPin,
  ShoppingBag,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import OrderManagement from '@/components/admin/OrderManagement';
import ProductManagement from '@/components/admin/ProductManagement';
import StoreCreditApproval from '@/components/admin/StoreCreditApproval';
import PickupQueueManagement from '@/components/admin/PickupQueueManagement';
import StoreCreditSettings from '@/components/admin/StoreCreditSettings';

export default function ShopAdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const permissions = usePermissions();
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/admin/shop');
      return;
    }

    // Check if user has any admin permissions
    if (!permissions.canManageShopProducts() && !permissions.canApprovePoints() && !permissions.canEditPointsSettings()) {
      router.push('/');
      return;
    }
  }, [user, permissions, router]);

  if (!user || (!permissions.canManageShopProducts() && !permissions.canApprovePoints() && !permissions.canEditPointsSettings())) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Shop Admin</h1>
              <p className="text-muted-foreground">Manage shop, store credit, and orders</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Link>
              </Button>
              <Button asChild>
                <Link href="/shop">View Shop</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8">
            {permissions.canManageShopProducts() && (
              <>
                <TabsTrigger value="products" className="gap-2">
                  <Package className="h-4 w-4" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="orders" className="gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Orders
                </TabsTrigger>
                <TabsTrigger value="pickup" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Pickup Queue
                </TabsTrigger>
              </>
            )}
            {permissions.canApprovePoints() && (
              <TabsTrigger value="credit-approval" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Credit Approval
              </TabsTrigger>
            )}
            {permissions.canEditPointsSettings() && (
              <TabsTrigger value="credit-settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Credit Settings
              </TabsTrigger>
            )}
          </TabsList>

          {/* Products Tab */}
          {permissions.canManageShopProducts() && (
            <TabsContent value="products">
              <ProductManagement />
            </TabsContent>
          )}

          {/* Orders Tab */}
          {permissions.canManageShopProducts() && (
            <TabsContent value="orders">
              <OrderManagement />
            </TabsContent>
          )}

          {/* Pickup Queue Tab */}
          {permissions.canManageShopProducts() && (
            <TabsContent value="pickup">
              <PickupQueueManagement />
            </TabsContent>
          )}

          {/* Store Credit Approval Tab */}
          {permissions.canApprovePoints() && (
            <TabsContent value="credit-approval">
              <StoreCreditApproval />
            </TabsContent>
          )}

          {/* Store Credit Settings Tab */}
          {permissions.canEditPointsSettings() && (
            <TabsContent value="credit-settings">
              <StoreCreditSettings />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
