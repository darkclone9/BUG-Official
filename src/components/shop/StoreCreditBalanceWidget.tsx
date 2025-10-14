'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserStoreCreditBalance } from '@/lib/database';
import { formatCentsToDollars } from '@/lib/storeCredit';
import { DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function StoreCreditBalanceWidget() {
  const { user } = useAuth();
  const [creditBalanceCents, setCreditBalanceCents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCredit();
    }
  }, [user]);

  const loadCredit = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const balanceCents = await getUserStoreCreditBalance(user.uid);
      setCreditBalanceCents(balanceCents);
    } catch (error) {
      console.error('Error loading store credit:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const creditDisplay = formatCentsToDollars(creditBalanceCents);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <div className="flex flex-col items-start">
            <span className="text-xs text-muted-foreground">Store Credit</span>
            <span className="font-semibold">
              {loading ? '...' : creditDisplay}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-1">
              Store Credit Balance
            </h4>
            <p className="text-sm text-muted-foreground">
              Use your store credit to get discounts on merchandise
            </p>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Available Credit</span>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {creditDisplay}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Direct dollar-for-dollar discount
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-foreground">How it works:</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• $1.00 credit = $1.00 discount</li>
              <li>• Maximum 50% off any single item</li>
              <li>• Maximum $30.00 off per order</li>
              <li>• No expiration - use anytime!</li>
              <li>• Shipping & taxes always paid in full</li>
            </ul>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 border border-border">
            <h5 className="text-sm font-semibold text-foreground mb-2">Earn Store Credit:</h5>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Event attendance: $1.00</li>
              <li>• Volunteer work: $2.50</li>
              <li>• Event hosting: $5.00</li>
              <li>• Contributions: $0.50 - $1.50</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2 italic">
              Maximum $50.00 earned per month
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a href="/leaderboard">
                <TrendingUp className="h-4 w-4 mr-2" />
                Earn More
              </a>
            </Button>
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a href="/profile">View History</a>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

