'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import CartSidebar from './CartSidebar';

export default function ShoppingCartButton() {
  const { itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="relative gap-2"
        onClick={() => setIsOpen(true)}
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="hidden sm:inline">Cart</span>
        {itemCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {itemCount > 9 ? '9+' : itemCount}
          </Badge>
        )}
      </Button>

      <CartSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
