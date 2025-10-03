# Shop System API Reference

## Overview

This document provides a comprehensive reference for all database functions, API routes, and utilities in the BUG Gaming Club Shop system.

## Database Functions (`src/lib/database.ts`)

### Shop Products

#### `getAllShopProducts()`
Get all shop products.

```typescript
const products = await getAllShopProducts();
// Returns: ShopProduct[]
```

#### `getShopProduct(productId: string)`
Get a single product by ID.

```typescript
const product = await getShopProduct('product-123');
// Returns: ShopProduct | null
```

#### `createShopProduct(product: Omit<ShopProduct, 'id' | 'createdAt' | 'updatedAt'>)`
Create a new product.

```typescript
const productId = await createShopProduct({
  name: 'BUG T-Shirt',
  description: 'Official BUG Gaming Club t-shirt',
  price: 1999, // in cents
  category: 'apparel',
  stock: 50,
  images: ['https://example.com/image.jpg'],
  tags: ['clothing', 'merch'],
  variants: ['Small', 'Medium', 'Large'],
  isActive: true,
  isFeatured: false,
  pointsEligible: true,
});
// Returns: string (product ID)
```

#### `updateShopProduct(productId: string, updates: Partial<ShopProduct>)`
Update an existing product.

```typescript
await updateShopProduct('product-123', {
  price: 1799,
  stock: 45,
});
// Returns: void
```

#### `deleteShopProduct(productId: string)`
Delete a product.

```typescript
await deleteShopProduct('product-123');
// Returns: void
```

#### `updateProductStock(productId: string, quantityChange: number)`
Update product stock (positive or negative).

```typescript
await updateProductStock('product-123', -2); // Decrease by 2
// Returns: void
```

### Shop Orders

#### `getAllShopOrders(status?: string)`
Get all orders, optionally filtered by status.

```typescript
const orders = await getAllShopOrders('paid');
// Returns: ShopOrder[]
```

#### `getUserShopOrders(userId: string)`
Get all orders for a specific user.

```typescript
const orders = await getUserShopOrders('user-123');
// Returns: ShopOrder[]
```

#### `getShopOrder(orderId: string)`
Get a single order by ID.

```typescript
const order = await getShopOrder('order-123');
// Returns: ShopOrder | null
```

#### `createShopOrder(order: Omit<ShopOrder, 'id' | 'createdAt' | 'updatedAt'>)`
Create a new order.

```typescript
const orderId = await createShopOrder({
  userId: 'user-123',
  userEmail: 'user@example.com',
  userDisplayName: 'John Doe',
  items: [...],
  subtotal: 2500,
  pointsDiscount: 500,
  pointsUsed: 500,
  shipping: 500,
  tax: 200,
  total: 2700,
  fulfillmentType: 'shipping',
  shippingAddress: {...},
  status: 'paid',
  stripeSessionId: 'cs_...',
  stripePaymentIntentId: 'pi_...',
});
// Returns: string (order ID)
```

#### `updateShopOrderStatus(orderId: string, status: ShopOrder['status'], updates?: Partial<ShopOrder>)`
Update order status.

```typescript
await updateShopOrderStatus('order-123', 'shipped', {
  trackingNumber: 'TRACK123',
});
// Returns: void
```

### Points System

#### `getUserAvailablePoints(userId: string)`
Get user's available points (excluding expired).

```typescript
const points = await getUserAvailablePoints('user-123');
// Returns: number
```

#### `awardPointsEnhanced(params)`
Award points to a user with approval workflow.

```typescript
await awardPointsEnhanced({
  userId: 'user-123',
  amount: 500,
  description: 'Tournament participation',
  eventId: 'event-123',
  requiresApproval: true,
  multiplierCampaignId: 'campaign-123',
  notes: 'First place winner',
});
// Returns: string (transaction ID)
```

#### `approvePointsTransaction(transactionId: string)`
Approve a pending points transaction.

```typescript
await approvePointsTransaction('transaction-123');
// Returns: void
```

#### `denyPointsTransaction(transactionId: string, reason: string)`
Deny a pending points transaction.

```typescript
await denyPointsTransaction('transaction-123', 'Invalid event attendance');
// Returns: void
```

#### `spendPoints(userId: string, amount: number, orderId: string, description: string)`
Deduct points from user's balance.

```typescript
await spendPoints('user-123', 1000, 'order-123', 'Shop purchase discount');
// Returns: void
```

#### `getPendingPointsTransactions()`
Get all pending points transactions.

```typescript
const transactions = await getPendingPointsTransactions();
// Returns: PointsTransaction[]
```

#### `getUserPointsHistory(userId: string, limit?: number)`
Get user's points transaction history.

```typescript
const history = await getUserPointsHistory('user-123', 20);
// Returns: PointsTransaction[]
```

### Points Settings

#### `getPointsSettings()`
Get current points system settings.

```typescript
const settings = await getPointsSettings();
// Returns: PointsSettings
```

#### `updatePointsSettings(settings: Partial<PointsSettings>)`
Update points system settings.

```typescript
await updatePointsSettings({
  pointsPerDollar: 1000,
  maxDiscountPerItem: 50,
  maxDiscountPerOrder: 3000,
});
// Returns: void
```

### Pickup Queue

#### `getPickupQueue(status?: PickupQueueItem['status'])`
Get pickup queue items.

```typescript
const queue = await getPickupQueue('ready');
// Returns: PickupQueueItem[]
```

#### `addToPickupQueue(order: ShopOrder)`
Add an order to the pickup queue.

```typescript
await addToPickupQueue(order);
// Returns: string (queue item ID)
```

#### `updatePickupQueueStatus(queueItemId: string, status: PickupQueueItem['status'], pickedUpBy?: string, notes?: string)`
Update pickup queue item status.

```typescript
await updatePickupQueueStatus('queue-123', 'completed', 'John Doe', 'Picked up at 2pm');
// Returns: void
```

## Points Calculation Functions (`src/lib/points.ts`)

### `calculateCartDiscount(items: OrderItem[], pointsToUse: number)`
Calculate discount for a cart with points.

```typescript
const result = calculateCartDiscount(items, 5000);
// Returns: {
//   pointsUsed: number;
//   discountCents: number;
//   itemDiscounts: Array<{
//     productId: string;
//     discountCents: number;
//   }>;
// }
```

### `pointsToDiscount(points: number)`
Convert points to discount amount in cents.

```typescript
const discount = pointsToDiscount(1000);
// Returns: 100 (cents) = $1.00
```

### `discountToPoints(discountCents: number)`
Convert discount amount to points.

```typescript
const points = discountToPoints(100);
// Returns: 1000 points
```

### `formatCents(cents: number)`
Format cents as currency string.

```typescript
const formatted = formatCents(1999);
// Returns: "$19.99"
```

### `formatPointsAsDiscount(points: number)`
Format points as discount value.

```typescript
const formatted = formatPointsAsDiscount(5000);
// Returns: "$5.00"
```

## Permission Functions (`src/lib/permissions.ts`)

### `canManageShopProducts(user: User)`
Check if user can manage shop products.

```typescript
const canManage = canManageShopProducts(user);
// Returns: boolean
```

### `canApprovePoints(user: User)`
Check if user can approve points transactions.

```typescript
const canApprove = canApprovePoints(user);
// Returns: boolean
```

### `canEditPointsSettings(user: User)`
Check if user can edit points settings.

```typescript
const canEdit = canEditPointsSettings(user);
// Returns: boolean
```

## API Routes

### POST `/api/create-checkout-session`
Create a Stripe Checkout session.

**Request Body:**
```typescript
{
  items: CartItem[];
  pointsToUse: number;
  fulfillmentType: 'campus_pickup' | 'shipping';
  userId: string;
  userEmail: string;
}
```

**Response:**
```typescript
{
  sessionId: string;
  url: string;
}
```

### POST `/api/webhooks/stripe`
Stripe webhook endpoint for payment events.

**Headers:**
- `stripe-signature`: Webhook signature

**Events Handled:**
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`

## React Hooks

### `usePermissions()`
Get user permissions.

```typescript
const { canManageShopProducts, canApprovePoints, canEditPointsSettings } = usePermissions();
```

### `useCart()`
Access shopping cart state.

```typescript
const {
  items,
  itemCount,
  subtotal,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  isInCart,
  getCartItem,
} = useCart();
```

### `useAuth()`
Access authentication state.

```typescript
const { user, loading } = useAuth();
```

## Email Functions (`src/lib/email.ts`)

### `sendOrderConfirmationEmail(order: ShopOrder)`
Send order confirmation email.

```typescript
await sendOrderConfirmationEmail(order);
// Returns: void
```

### `sendPickupReadyEmail(order: ShopOrder)`
Send pickup ready notification.

```typescript
await sendPickupReadyEmail(order);
// Returns: void
```

### `sendShippingNotificationEmail(order: ShopOrder, trackingNumber: string)`
Send shipping notification.

```typescript
await sendShippingNotificationEmail(order, 'TRACK123');
// Returns: void
```

## Type Definitions

See `src/types/types.ts` for complete type definitions including:
- `ShopProduct`
- `ShopOrder`
- `OrderItem`
- `PointsTransaction`
- `PointsSettings`
- `PointsMultiplier`
- `PickupQueueItem`
- `CartItem`

## Error Handling

All database functions throw errors that should be caught:

```typescript
try {
  const product = await getShopProduct('product-123');
} catch (error) {
  console.error('Error fetching product:', error);
  // Handle error
}
```

## Best Practices

1. **Always validate user permissions** before performing admin operations
2. **Use transactions** for operations that modify multiple documents
3. **Handle errors gracefully** with try-catch blocks
4. **Show loading states** during async operations
5. **Validate input data** before database operations
6. **Use TypeScript types** for type safety
7. **Log errors** for debugging and monitoring

