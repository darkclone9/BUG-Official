'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ShoppingCartButton() {
  // TODO: Replace with actual cart state from context in Phase 5
  const [cartItemCount] = useState(0);

  return (
    <Button variant="outline" className="relative gap-2">
      <ShoppingCart className="h-5 w-5" />
      <span className="hidden sm:inline">Cart</span>
      {cartItemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {cartItemCount > 9 ? '9+' : cartItemCount}
        </Badge>
      )}
    </Button>
  );
}

