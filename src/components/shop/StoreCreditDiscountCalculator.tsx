'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserStoreCreditBalance, getStoreCreditSettings } from '@/lib/database';
import { calculateItemMaxDiscount, formatCentsToDollars, centsToDollars } from '@/lib/storeCredit';
import { StoreCreditSettings } from '@/types/types';
import { DollarSign, Info } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StoreCreditDiscountCalculatorProps {
  productPrice: number; // in cents
  quantity: number;
}

export default function StoreCreditDiscountCalculator({ 
  productPrice, 
  quantity 
}: StoreCreditDiscountCalculatorProps) {
  const { user } = useAuth();
  const [availableCreditCents, setAvailableCreditCents] = useState(0);
  const [creditToUseCents, setCreditToUseCents] = useState(0);
  const [settings, setSettings] = useState<StoreCreditSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCreditAndSettings();
    }
  }, [user]);

  useEffect(() => {
    // Reset credit to use when product price changes
    setCreditToUseCents(0);
  }, [productPrice, quantity]);

  const loadCreditAndSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [balanceCents, creditSettings] = await Promise.all([
        getUserStoreCreditBalance(user.uid),
        getStoreCreditSettings(),
      ]);
      setAvailableCreditCents(balanceCents);
      setSettings(creditSettings);
    } catch (error) {
      console.error('Error loading store credit:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading || !settings) return null;

  // Calculate maximum discount allowed for this item
  const totalItemPrice = productPrice * quantity;
  const maxItemDiscount = calculateItemMaxDiscount(
    totalItemPrice,
    availableCreditCents,
    settings
  );

  // Calculate maximum credit that can be used
  const maxCreditToUse = Math.min(availableCreditCents, maxItemDiscount);

  // Calculate actual discount from selected credit
  const discountAmount = Math.min(creditToUseCents, maxItemDiscount);
  const finalPrice = Math.max(0, totalItemPrice - discountAmount);
  const discountPercent = totalItemPrice > 0 ? (discountAmount / totalItemPrice) * 100 : 0;

  const handleSliderChange = (value: number[]) => {
    setCreditToUseCents(value[0]);
  };

  // If user has no credit, show a message
  if (availableCreditCents === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-muted-foreground">Store Credit</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          You don't have any store credit yet. Earn credit by attending events, volunteering, and contributing to the club!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Use Store Credit</h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                Use your store credit to get up to 50% off this item. $1.00 credit = $1.00 discount.
                Shipping and taxes are always paid in full.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Credit Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Credit to use:</span>
          <span className="font-semibold text-foreground">
            {formatCentsToDollars(creditToUseCents)} / {formatCentsToDollars(availableCreditCents)}
          </span>
        </div>
        <Slider
          value={[creditToUseCents]}
          onValueChange={handleSliderChange}
          max={maxCreditToUse}
          step={50} // 50 cents increments
          className="w-full"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>$0.00</span>
          <span>{formatCentsToDollars(maxCreditToUse)} (max)</span>
        </div>
      </div>

      {/* Discount Summary */}
      <div className="bg-background rounded-lg p-3 border border-border space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Original Price:</span>
          <span className="text-foreground">{formatCentsToDollars(totalItemPrice)}</span>
        </div>
        {discountAmount > 0 && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Credit Discount:</span>
              <span className="text-primary font-semibold">
                -{formatCentsToDollars(discountAmount)} ({discountPercent.toFixed(0)}% off)
              </span>
            </div>
            <div className="h-px bg-border" />
          </>
        )}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">Final Price:</span>
          <span className="text-lg font-bold text-foreground">
            {formatCentsToDollars(finalPrice)}
          </span>
        </div>
      </div>

      {/* Cap Warning */}
      {discountPercent >= 50 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            ⚠️ Maximum 50% discount reached for this item
          </p>
        </div>
      )}

      {/* Remaining Credit */}
      {creditToUseCents > 0 && (
        <div className="text-xs text-muted-foreground">
          Remaining credit after purchase: {formatCentsToDollars(availableCreditCents - creditToUseCents)}
        </div>
      )}
    </div>
  );
}

