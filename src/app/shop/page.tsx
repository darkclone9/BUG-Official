'use client';

import { useState, useEffect } from 'react';
import { ShopProduct, ProductCategory } from '@/types/types';
import { getShopProducts, getUser } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import ProductCard from '@/components/shop/ProductCard';
import StoreCreditBalanceWidget from '@/components/shop/StoreCreditBalanceWidget';
import ShoppingCartButton from '@/components/shop/ShoppingCartButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Products' },
  { value: 'apparel', label: 'Apparel' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'stickers', label: 'Stickers' },
  { value: 'posters', label: 'Posters' },
  { value: 'digital', label: 'Digital' },
  { value: 'other', label: 'Other' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
];

export default function ShopPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState('newest');
  const [hasLegacyPoints, setHasLegacyPoints] = useState(false);

  // Load products and check for legacy points
  useEffect(() => {
    loadProducts();
    if (user) {
      checkLegacyPoints();
    }
  }, [user]);

  const checkLegacyPoints = async () => {
    if (!user) return;
    try {
      const userData = await getUser(user.uid);
      setHasLegacyPoints((userData?.pointsBalance || 0) > 0 && !userData?.pointsConverted);
    } catch (error) {
      console.error('Error checking legacy points:', error);
    }
  };

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery, sortBy]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getShopProducts(false); // Only active products
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">BUG Shop</h1>
              <p className="text-muted-foreground mt-1">
                Official BUG Gaming Club merchandise
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user && <StoreCreditBalanceWidget />}
              <ShoppingCartButton />
            </div>
          </div>

          {/* Convert Points Banner */}
          {hasLegacyPoints && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                    <ArrowRight className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                      You have legacy points!
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Convert your points to store credit for easier shopping
                    </p>
                  </div>
                </div>
                <Link href="/convert-points">
                  <Button variant="outline" className="border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Convert Now
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {CATEGORIES.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="whitespace-nowrap"
                >
                  {category.label}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background text-foreground"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              No products found
            </h2>
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Check back soon for new merchandise!'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info Banner */}
      {user && (
        <div className="bg-primary/10 border-t border-primary/20">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  Use your participation points for discounts!
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  1,000 points = $1.00 off • Max 50% off per item • Max $30 off per order
                </p>
              </div>
              <Button variant="outline" asChild>
                <a href="/leaderboard">View Points</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
