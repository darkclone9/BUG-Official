'use client';

import { useState, useEffect } from 'react';
import { StoreCreditTransaction, User } from '@/types/types';
import { 
  getPendingStoreCreditTransactions, 
  approveStoreCreditTransaction, 
  denyStoreCreditTransaction,
  getUser 
} from '@/lib/database';
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
import { DollarSign, Check, X, Clock, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { formatCentsToDollars } from '@/lib/storeCredit';

interface TransactionWithUser extends StoreCreditTransaction {
  userName?: string;
  userEmail?: string;
}

export default function StoreCreditApproval() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithUser | null>(null);
  const [denyReason, setDenyReason] = useState('');

  useEffect(() => {
    loadPendingTransactions();
  }, []);

  const loadPendingTransactions = async () => {
    try {
      setLoading(true);
      const data = await getPendingStoreCreditTransactions();
      
      // Fetch user details for each transaction
      const transactionsWithUsers = await Promise.all(
        data.map(async (transaction) => {
          try {
            const userData = await getUser(transaction.userId);
            return {
              ...transaction,
              userName: userData?.displayName || 'Unknown User',
              userEmail: userData?.email || '',
            };
          } catch (error) {
            return {
              ...transaction,
              userName: 'Unknown User',
              userEmail: '',
            };
          }
        })
      );
      
      setTransactions(transactionsWithUsers);
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
      await approveStoreCreditTransaction(transactionId, adminId);
      toast.success('Store credit approved successfully');
      loadPendingTransactions();
    } catch (error) {
      console.error('Error approving store credit:', error);
      toast.error('Failed to approve store credit');
    }
  };

  const handleDenyClick = (transaction: TransactionWithUser) => {
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
      await denyStoreCreditTransaction(selectedTransaction.id, adminId, denyReason);
      toast.success('Store credit denied');
      setDenyDialogOpen(false);
      setSelectedTransaction(null);
      setDenyReason('');
      loadPendingTransactions();
    } catch (error) {
      console.error('Error denying store credit:', error);
      toast.error('Failed to deny store credit');
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
        <h2 className="text-2xl font-bold text-foreground">Store Credit Approval</h2>
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          {transactions.length} pending
        </Badge>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-lg">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No pending store credit transactions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* User Info */}
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{transaction.userName}</span>
                    <span className="text-sm text-muted-foreground">
                      ({transaction.userEmail})
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold text-green-500">
                      {formatCentsToDollars(transaction.amountCents)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Reason:</span>
                      <span className="font-medium">{transaction.reason}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="secondary">
                        {transaction.category.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{transaction.timestamp.toLocaleDateString()}</span>
                    </div>
                    {transaction.multiplierApplied && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Multiplier:</span>
                        <Badge variant="outline" className="text-purple-500">
                          {transaction.multiplierApplied}x
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(transaction.id)}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleDenyClick(transaction)}
                    variant="destructive"
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Deny
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deny Dialog */}
      <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Store Credit</DialogTitle>
            <DialogDescription>
              Please provide a reason for denying this store credit transaction.
              The user will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter reason for denial..."
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDenyConfirm}>
              Confirm Denial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

