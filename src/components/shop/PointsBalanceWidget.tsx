'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAvailablePoints } from '@/lib/database';
import { formatPointsAsDiscount } from '@/lib/points';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function PointsBalanceWidget() {
  const { user } = useAuth();
  const [availablePoints, setAvailablePoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPoints();
    }
  }, [user]);

  const loadPoints = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const points = await getUserAvailablePoints(user.uid);
      setAvailablePoints(points);
    } catch (error) {
      console.error('Error loading points:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const discountValue = formatPointsAsDiscount(availablePoints);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <div className="flex flex-col items-start">
            <span className="text-xs text-muted-foreground">Your Points</span>
            <span className="font-semibold">
              {loading ? '...' : availablePoints.toLocaleString()}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-1">
              Participation Points Balance
            </h4>
            <p className="text-sm text-muted-foreground">
              Use your points to get discounts on merchandise
            </p>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Available Points</span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {availablePoints.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Worth up to {discountValue} in discounts
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-foreground">How it works:</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 1,000 points = $1.00 discount</li>
              <li>• Maximum 50% off any single item</li>
              <li>• Maximum $30.00 off per order</li>
              <li>• Shipping & taxes always paid in full</li>
            </ul>
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

