'use client';

import { useState, useEffect } from 'react';
import { PickupQueueItem } from '@/types/types';
import { getPickupQueue, updatePickupQueueStatus } from '@/lib/database';
import { formatCents } from '@/lib/points';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, Check, Clock, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function PickupQueueManagement() {
  const [queueItems, setQueueItems] = useState<PickupQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PickupQueueItem | null>(null);
  const [pickedUpBy, setPickedUpBy] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await getPickupQueue();
      setQueueItems(data);
    } catch (error) {
      console.error('Error loading pickup queue:', error);
      toast.error('Failed to load pickup queue');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReady = async (itemId: string) => {
    try {
      await updatePickupQueueStatus(itemId, 'ready');
      toast.success('Order marked as ready for pickup');
      loadQueue();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleCompleteClick = (item: PickupQueueItem) => {
    setSelectedItem(item);
    setPickedUpBy('');
    setNotes('');
    setCompleteDialogOpen(true);
  };

  const handleCompleteConfirm = async () => {
    if (!selectedItem) return;

    if (!pickedUpBy.trim()) {
      toast.error('Please enter who picked up the order');
      return;
    }

    try {
      await updatePickupQueueStatus(selectedItem.id, 'completed', pickedUpBy, notes);
      toast.success('Order marked as completed');
      setCompleteDialogOpen(false);
      setSelectedItem(null);
      setPickedUpBy('');
      setNotes('');
      loadQueue();
    } catch (error) {
      console.error('Error completing pickup:', error);
      toast.error('Failed to complete pickup');
    }
  };

  const getStatusBadge = (status: PickupQueueItem['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'ready':
        return (
          <Badge variant="default" className="gap-1">
            <Package className="h-3 w-3" />
            Ready
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="gap-1">
            <Check className="h-3 w-3" />
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  const activeItems = queueItems.filter(item => item.status !== 'completed');
  const completedItems = queueItems.filter(item => item.status === 'completed');

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
        <h2 className="text-2xl font-bold text-foreground">Pickup Queue</h2>
        <Badge variant="outline" className="gap-1">
          <MapPin className="h-3 w-3" />
          {activeItems.length} active
        </Badge>
      </div>

      {/* Active Pickups */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Active Pickups</h3>
        {activeItems.length === 0 ? (
          <div className="text-center py-12 bg-card border rounded-lg">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No active pickups</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeItems.map((item) => (
              <div key={item.id} className="bg-card border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">
                        Order #{item.orderId.slice(-8)}
                      </h3>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {item.userDisplayName} ({item.userEmail})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Placed: {new Date(item.createdAt).toLocaleString()}
                    </p>
                    {item.notifiedAt && (
                      <p className="text-sm text-primary">
                        Ready since: {new Date(item.notifiedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">
                      {formatCents(item.items.reduce((sum, i) => sum + (i.price * i.quantity), 0))}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Items:</h4>
                  <div className="space-y-1">
                    {item.items.map((orderItem, index) => (
                      <div key={index} className="text-sm text-muted-foreground flex justify-between">
                        <span>
                          {orderItem.quantity}x {orderItem.productName}
                          {orderItem.variant && ` (${orderItem.variant})`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {item.status === 'pending' && (
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => handleMarkReady(item.id)}
                    >
                      <Package className="h-4 w-4" />
                      Mark as Ready
                    </Button>
                  )}
                  {item.status === 'ready' && (
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => handleCompleteClick(item)}
                    >
                      <Check className="h-4 w-4" />
                      Complete Pickup
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Pickups */}
      {completedItems.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Recently Completed</h3>
          <div className="space-y-4">
            {completedItems.slice(0, 5).map((item) => (
              <div key={item.id} className="bg-card border rounded-lg p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">
                        Order #{item.orderId.slice(-8)}
                      </h4>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.userDisplayName}
                    </p>
                    {item.pickedUpAt && (
                      <p className="text-xs text-muted-foreground">
                        Picked up: {new Date(item.pickedUpAt).toLocaleString()}
                      </p>
                    )}
                    {item.pickedUpBy && (
                      <p className="text-xs text-muted-foreground">
                        By: {item.pickedUpBy}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold text-foreground">
                    {formatCents(item.items.reduce((sum, i) => sum + (i.price * i.quantity), 0))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Pickup Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Pickup</DialogTitle>
            <DialogDescription>
              Record who picked up this order and any additional notes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedItem && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Order #{selectedItem.orderId.slice(-8)}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedItem.userDisplayName}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="pickedUpBy">Picked up by *</Label>
              <Input
                id="pickedUpBy"
                value={pickedUpBy}
                onChange={(e) => setPickedUpBy(e.target.value)}
                placeholder="Enter name or student ID"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteConfirm}>
              Complete Pickup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
