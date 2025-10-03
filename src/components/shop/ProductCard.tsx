'use client';

import { ShopProduct } from '@/types/types';
import { formatCents } from '@/lib/points';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: ShopProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <Link href={`/shop/${product.id}`}>
      <div className="group bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Product Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {product.pointsEligible && (
              <Badge className="bg-primary/90 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 mr-1" />
                Points Eligible
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="destructive" className="backdrop-blur-sm">
                Out of Stock
              </Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge variant="secondary" className="backdrop-blur-sm">
                Only {product.stock} left
              </Badge>
            )}
          </div>

          {/* Category Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm capitalize">
              {product.category}
            </Badge>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
            {product.description}
          </p>

          {/* Price and Action */}
          <div className="flex items-center justify-between mt-auto">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {formatCents(product.price)}
              </p>
              {product.pointsEligible && (
                <p className="text-xs text-muted-foreground">
                  Use points for discount
                </p>
              )}
            </div>

            <Button
              size="sm"
              disabled={isOutOfStock}
              className="group-hover:bg-primary group-hover:text-primary-foreground"
            >
              {isOutOfStock ? 'Out of Stock' : 'View Details'}
            </Button>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

