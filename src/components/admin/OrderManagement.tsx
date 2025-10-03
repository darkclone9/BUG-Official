'use client';

import { useState, useEffect } from 'react';
import { ShopOrder } from '@/types/types';
import { getAllShopOrders, updateShopOrderStatus, updatePickupQueueStatus } from '@/lib/database';
import { formatCents } from '@/lib/points';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function OrderManagement() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllShopOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: ShopOrder['status']) => {
    try {
      await updateShopOrderStatus(orderId, newStatus);
      
      // If marking as ready for pickup, update pickup queue
      if (newStatus === 'ready_pickup') {
        const queueItemId = `pickup_${orderId}`;
        await updatePickupQueueStatus(queueItemId, 'ready');
      }
      
      // If marking as completed and it's a pickup order, update pickup queue
      if (newStatus === 'completed') {
        const order = orders.find(o => o.id === orderId);
        if (order?.fulfillmentType === 'campus_pickup') {
          const queueItemId = `pickup_${orderId}`;
          await updatePickupQueueStatus(queueItemId, 'completed');
        }
      }

      toast.success('Order status updated');
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusIcon = (status: ShopOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'ready_pickup':
        return <MapPin className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
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

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

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
        <h2 className="text-2xl font-bold text-foreground">Order Management</h2>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="ready_pickup">Ready for Pickup</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-lg">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-card border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">Order #{order.id.slice(-8)}</h3>
                    <Badge variant={getStatusColor(order.status)} className="gap-1">
                      {getStatusIcon(order.status)}
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.userDisplayName} ({order.userEmail})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">
                    {formatCents(order.total)}
                  </p>
                  {order.pointsUsed > 0 && (
                    <p className="text-sm text-primary">
                      {order.pointsUsed.toLocaleString()} points used
                    </p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">Items:</h4>
                <div className="space-y-1">
                  {order.items.map((item, index) => (
                    <div key={index} className="text-sm text-muted-foreground flex justify-between">
                      <span>
                        {item.quantity}x {item.productName}
                        {item.variant && ` (${item.variant})`}
                      </span>
                      <span>{formatCents(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fulfillment Info */}
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  {order.fulfillmentType === 'campus_pickup' ? (
                    <MapPin className="h-4 w-4" />
                  ) : (
                    <Truck className="h-4 w-4" />
                  )}
                  <span className="font-semibold text-sm">
                    {order.fulfillmentType === 'campus_pickup' ? 'Campus Pickup' : 'Shipping'}
                  </span>
                </div>
                {order.shippingAddress && (
                  <p className="text-xs text-muted-foreground">
                    {order.shippingAddress.name}, {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                )}
              </div>

              {/* Status Update */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Update Status:</span>
                <Select
                  value={order.status}
                  onValueChange={(value) => handleStatusChange(order.id, value as ShopOrder['status'])}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    {order.fulfillmentType === 'campus_pickup' && (
                      <SelectItem value="ready_pickup">Ready for Pickup</SelectItem>
                    )}
                    {order.fulfillmentType === 'shipping' && (
                      <SelectItem value="shipped">Shipped</SelectItem>
                    )}
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

