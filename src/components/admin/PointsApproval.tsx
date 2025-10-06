'use client';

import { useState, useEffect } from 'react';
import { PointsTransaction } from '@/types/types';
import { getPendingPointsTransactions, approvePointsTransaction, denyPointsTransaction } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function PointsApproval() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<PointsTransaction | null>(null);
  const [denyReason, setDenyReason] = useState('');

  useEffect(() => {
    loadPendingTransactions();
  }, []);

  const loadPendingTransactions = async () => {
    try {
      setLoading(true);
      const data = await getPendingPointsTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading pending transactions:', error);
      toast.error('Failed to load pending transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transactionId: string) => {
    try {
      const adminId = user?.uid || '';
      await approvePointsTransaction(transactionId, adminId);
      toast.success('Points approved successfully');
      loadPendingTransactions();
    } catch (error) {
      console.error('Error approving points:', error);
      toast.error('Failed to approve points');
    }
  };

  const handleDenyClick = (transaction: PointsTransaction) => {
    setSelectedTransaction(transaction);
    setDenyReason('');
    setDenyDialogOpen(true);
  };

  const handleDenyConfirm = async () => {
    if (!selectedTransaction) return;

    if (!denyReason.trim()) {
      toast.error('Please provide a reason for denial');
      return;
    }

    try {
      const adminId = user?.uid || '';
      await denyPointsTransaction(selectedTransaction.id, adminId, denyReason);
      toast.success('Points denied');
      setDenyDialogOpen(false);
      setSelectedTransaction(null);
      setDenyReason('');
      loadPendingTransactions();
    } catch (error) {
      console.error('Error denying points:', error);
      toast.error('Failed to deny points');
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
        <h2 className="text-2xl font-bold text-foreground">Points Approval</h2>
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          {transactions.length} pending
        </Badge>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-lg">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No pending points transactions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="bg-card border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">
                      User ID: {transaction.userId}
                    </h3>
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      +{transaction.amount.toLocaleString()} points
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {transaction.reason}
                  </p>
                  {transaction.eventId && (
                    <p className="text-xs text-muted-foreground">
                      Event ID: {transaction.eventId}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Requested: {new Date(transaction.timestamp).toLocaleString()}
                  </p>
                  {transaction.eloChange && (
                    <Badge variant="outline" className="mt-2">
                      ELO Change: {transaction.eloChange > 0 ? '+' : ''}{transaction.eloChange}
                    </Badge>
                  )}
                </div>
              </div>

              {transaction.tournamentId && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-foreground">
                    <strong>Tournament ID:</strong> {transaction.tournamentId}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => handleApprove(transaction.id)}
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={() => handleDenyClick(transaction)}
                >
                  <X className="h-4 w-4" />
                  Deny
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deny Dialog */}
      <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Points Transaction</DialogTitle>
            <DialogDescription>
              Please provide a reason for denying this points transaction. The user will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedTransaction && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>User ID: {selectedTransaction.userId}</strong> - {selectedTransaction.amount.toLocaleString()} points
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedTransaction.reason}
                </p>
              </div>
            )}

            <div>
              <Textarea
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                placeholder="Enter reason for denial..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDenyConfirm}>
              Deny Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
