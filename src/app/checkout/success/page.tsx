'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const session = searchParams.get('session_id');
    if (session) {
      setSessionId(session);
      // Clear the cart after successful checkout
      clearCart();
    } else {
      // Redirect to shop if no session ID
      router.push('/shop');
    }
  }, [searchParams, clearCart, router]);

  if (!sessionId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card border rounded-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your purchase. Your order has been successfully placed.
          </p>

          {/* Order Details */}
          <div className="bg-muted rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-1">
                  What's next?
                </p>
                <p className="text-sm text-muted-foreground">
                  You'll receive an email confirmation shortly with your order details.
                  We'll notify you when your order is ready for pickup or has shipped.
                </p>
              </div>
            </div>
          </div>

          {/* Session ID */}
          <div className="mb-6">
            <p className="text-xs text-muted-foreground">
              Order Reference: <span className="font-mono">{sessionId.slice(-12)}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button size="lg" className="w-full gap-2" asChild>
              <Link href="/profile">
                View Order History
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full" asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact us at{' '}
            <a
              href="mailto:belhavengamingclub@gmail.com"
              className="text-primary hover:underline"
            >
              belhavengamingclub@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

