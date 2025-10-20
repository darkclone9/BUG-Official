'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserStoreCreditBalance, getUser } from '@/lib/database';
import { formatCentsToDollars } from '@/lib/storeCredit';
import { DollarSign, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Link from 'next/link';

export default function StoreCreditBalanceWidget() {
  const { user } = useAuth();
  const [creditBalanceCents, setCreditBalanceCents] = useState(0);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBalances();
    }
  }, [user]);

  const loadBalances = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [balanceCents, userData] = await Promise.all([
        getUserStoreCreditBalance(user.uid),
        getUser(user.uid)
      ]);
      setCreditBalanceCents(balanceCents);
      setPointsBalance(userData?.pointsBalance || 0);
    } catch (error) {
      console.error('Error loading balances:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const creditDisplay = formatCentsToDollars(creditBalanceCents);
  const hasPoints = pointsBalance > 0;
  const estimatedCredit = Math.floor((pointsBalance / 200) * 100); // Convert to cents

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 hover:bg-primary/10 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <div className="flex flex-col items-start">
                <span className="text-xs text-muted-foreground">Store Credit (click for info)</span>
                <span className="font-semibold">
                  {loading ? '...' : creditDisplay}
                </span>
              </div>
            </div>
            {hasPoints && (
              <>
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-muted-foreground">Points</span>
                    <span className="font-semibold text-yellow-600">
                      {loading ? '...' : pointsBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </>
            )}
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

          {hasPoints && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Legacy Points</span>
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                {pointsBalance.toLocaleString()} points
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ≈ {formatCentsToDollars(estimatedCredit)} store credit
              </p>
              <Link href="/convert-points">
                <Button variant="outline" size="sm" className="w-full mt-3 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Convert to Store Credit
                </Button>
              </Link>
            </div>
          )}

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
              <Link href="/leaderboard">
                <TrendingUp className="h-4 w-4 mr-2" />
                Earn More
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href="/profile">View History</Link>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
