'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAvailablePoints } from '@/lib/database';
import { calculateMaxItemDiscount, pointsToDiscount, discountToPoints, formatCents } from '@/lib/points';
import { Sparkles, Info } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PointsDiscountCalculatorProps {
  productPrice: number; // in cents
  quantity: number;
}

export default function PointsDiscountCalculator({ productPrice, quantity }: PointsDiscountCalculatorProps) {
  const { user } = useAuth();
  const [availablePoints, setAvailablePoints] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPoints();
    }
  }, [user]);

  useEffect(() => {
    // Reset points to use when product price changes
    setPointsToUse(0);
  }, [productPrice, quantity]);

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

  if (!user || loading) return null;

  // Calculate maximum discount allowed for this item
  const maxItemDiscount = calculateMaxItemDiscount(productPrice);
  
  // Calculate maximum points that can be used
  const maxPointsForDiscount = discountToPoints(maxItemDiscount);
  const maxPointsToUse = Math.min(availablePoints, maxPointsForDiscount);

  // Calculate actual discount from selected points
  const discountAmount = pointsToDiscount(pointsToUse);
  const finalPrice = Math.max(0, productPrice - discountAmount);
  const discountPercent = productPrice > 0 ? (discountAmount / productPrice) * 100 : 0;

  const handleSliderChange = (value: number[]) => {
    setPointsToUse(value[0]);
  };

  if (availablePoints === 0) {
    return (
      <div className="bg-muted/50 rounded-lg p-4 border border-dashed">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">No Points Available</p>
            <p className="text-sm text-muted-foreground">
              Earn participation points by attending events and volunteering to get discounts!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Use Participation Points</h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                Use your points to get up to 50% off this item. 1,000 points = $1.00 discount.
                Shipping and taxes are always paid in full.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Points Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Points to use:</span>
          <span className="font-semibold text-foreground">
            {pointsToUse.toLocaleString()} / {availablePoints.toLocaleString()}
          </span>
        </div>
        <Slider
          value={[pointsToUse]}
          onValueChange={handleSliderChange}
          max={maxPointsToUse}
          step={100}
          className="w-full"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>0 points</span>
          <span>{maxPointsToUse.toLocaleString()} points (max)</span>
        </div>
      </div>

      {/* Discount Preview */}
      {pointsToUse > 0 && (
        <div className="bg-background rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Original Price:</span>
            <span className="text-foreground">{formatCents(productPrice)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Points Discount:</span>
            <span className="text-primary font-semibold">
              -{formatCents(discountAmount)} ({discountPercent.toFixed(0)}% off)
            </span>
          </div>
          <div className="border-t pt-2 flex items-center justify-between">
            <span className="font-semibold text-foreground">Final Price:</span>
            <span className="text-2xl font-bold text-foreground">
              {formatCents(finalPrice)}
            </span>
          </div>
        </div>
      )}

      {/* Info Text */}
      <p className="text-xs text-muted-foreground">
        {maxPointsToUse < availablePoints
          ? `Maximum 50% discount applied. You can use up to ${maxPointsToUse.toLocaleString()} points on this item.`
          : `You can use all your points for a discount of up to ${formatCents(pointsToDiscount(availablePoints))}.`}
      </p>
    </div>
  );
}

