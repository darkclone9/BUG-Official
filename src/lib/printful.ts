/**
 * Printful API Integration
 * 
 * This module provides integration with Printful for print-on-demand fulfillment.
 * 
 * Setup:
 * 1. Create a Printful account at https://www.printful.com
 * 2. Get your API key from Settings → Stores → API
 * 3. Add PRINTFUL_API_KEY to .env.local
 * 
 * Features:
 * - Product catalog sync
 * - Automatic order fulfillment
 * - Shipping cost calculation
 * - Order tracking
 */

import { ShopOrder } from '@/types/types';

const PRINTFUL_API_URL = 'https://api.printful.com';
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

/**
 * Printful product variant
 */
export interface PrintfulVariant {
  id: number;
  product_id: number;
  name: string;
  size: string;
  color: string;
  price: string;
  in_stock: boolean;
  availability_status: string;
}

/**
 * Printful product
 */
export interface PrintfulProduct {
  id: number;
  type: string;
  type_name: string;
  title: string;
  brand: string;
  model: string;
  image: string;
  variant_count: number;
  currency: string;
  files: Array<{
    id: number;
    type: string;
    title: string;
    additional_price: string;
  }>;
}

/**
 * Printful order item
 */
export interface PrintfulOrderItem {
  variant_id: number;
  quantity: number;
  retail_price: string;
  name: string;
  files?: Array<{
    url: string;
  }>;
}

/**
 * Printful order
 */
export interface PrintfulOrder {
  external_id: string;
  shipping: string;
  recipient: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state_code: string;
    country_code: string;
    zip: string;
    email?: string;
    phone?: string;
  };
  items: PrintfulOrderItem[];
  retail_costs?: {
    currency: string;
    subtotal: string;
    discount: string;
    shipping: string;
    tax: string;
  };
}

/**
 * Make authenticated request to Printful API
 */
async function printfulRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<any> {
  if (!PRINTFUL_API_KEY) {
    throw new Error('PRINTFUL_API_KEY is not configured');
  }

  const response = await fetch(`${PRINTFUL_API_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Printful API error: ${error.error?.message || response.statusText}`);
  }

  const result = await response.json();
  return result.result;
}

/**
 * Get all products from Printful catalog
 */
export async function getPrintfulProducts(): Promise<PrintfulProduct[]> {
  try {
    const products = await printfulRequest('/products');
    return products;
  } catch (error) {
    console.error('Error fetching Printful products:', error);
    throw error;
  }
}

/**
 * Get product variants
 */
export async function getPrintfulProductVariants(productId: number): Promise<PrintfulVariant[]> {
  try {
    const product = await printfulRequest(`/products/${productId}`);
    return product.variants || [];
  } catch (error) {
    console.error('Error fetching Printful product variants:', error);
    throw error;
  }
}

/**
 * Calculate shipping costs
 */
export async function calculatePrintfulShipping(
  recipient: PrintfulOrder['recipient'],
  items: PrintfulOrderItem[]
): Promise<{
  id: string;
  name: string;
  rate: string;
  currency: string;
}[]> {
  try {
    const result = await printfulRequest('/shipping/rates', 'POST', {
      recipient,
      items,
    });
    return result;
  } catch (error) {
    console.error('Error calculating Printful shipping:', error);
    throw error;
  }
}

/**
 * Create order in Printful
 */
export async function createPrintfulOrder(order: PrintfulOrder): Promise<{
  id: number;
  external_id: string;
  status: string;
  shipping: string;
  created: number;
  updated: number;
}> {
  try {
    const result = await printfulRequest('/orders', 'POST', order);
    return result;
  } catch (error) {
    console.error('Error creating Printful order:', error);
    throw error;
  }
}

/**
 * Get order status from Printful
 */
export async function getPrintfulOrderStatus(orderId: number): Promise<{
  id: number;
  external_id: string;
  status: string;
  shipping: string;
  shipments: Array<{
    id: number;
    carrier: string;
    service: string;
    tracking_number: string;
    tracking_url: string;
    created: number;
    ship_date: string;
    shipped_at: number;
    reshipment: boolean;
    items: Array<{
      item_id: number;
      quantity: number;
    }>;
  }>;
}> {
  try {
    const result = await printfulRequest(`/orders/${orderId}`);
    return result;
  } catch (error) {
    console.error('Error fetching Printful order status:', error);
    throw error;
  }
}

/**
 * Confirm order for fulfillment
 */
export async function confirmPrintfulOrder(orderId: number): Promise<{
  id: number;
  status: string;
}> {
  try {
    const result = await printfulRequest(`/orders/${orderId}/confirm`, 'POST');
    return result;
  } catch (error) {
    console.error('Error confirming Printful order:', error);
    throw error;
  }
}

/**
 * Convert shop order to Printful order format
 */
export function convertToPrintfulOrder(shopOrder: ShopOrder): PrintfulOrder | null {
  // Only process shipping orders (not campus pickup)
  if (shopOrder.fulfillmentType !== 'shipping') {
    return null;
  }

  // Ensure shipping address exists
  if (!shopOrder.shippingAddress) {
    throw new Error('Shipping address is required for Printful orders');
  }

  // Convert items to Printful format
  // Note: This requires mapping your shop products to Printful variant IDs
  // You would store the Printful variant ID in your product metadata
  const printfulItems: PrintfulOrderItem[] = shopOrder.items
    .filter(item => item.productId) // Only items with product IDs
    .map(item => ({
      variant_id: 0, // TODO: Map to actual Printful variant ID from product metadata
      quantity: item.quantity,
      retail_price: (item.price / 100).toFixed(2),
      name: item.productName,
    }));

  if (printfulItems.length === 0) {
    return null; // No Printful items in order
  }

  return {
    external_id: shopOrder.id,
    shipping: 'STANDARD', // or calculate based on shipping method
    recipient: {
      name: shopOrder.shippingAddress.name,
      address1: shopOrder.shippingAddress.line1,
      address2: shopOrder.shippingAddress.line2,
      city: shopOrder.shippingAddress.city,
      state_code: shopOrder.shippingAddress.state,
      country_code: shopOrder.shippingAddress.country || 'US',
      zip: shopOrder.shippingAddress.postalCode,
      email: shopOrder.userEmail,
    },
    items: printfulItems,
    retail_costs: {
      currency: 'USD',
      subtotal: (shopOrder.subtotal / 100).toFixed(2),
      discount: (shopOrder.pointsDiscount / 100).toFixed(2),
      shipping: (shopOrder.shipping / 100).toFixed(2),
      tax: (shopOrder.tax / 100).toFixed(2),
    },
  };
}

/**
 * Process order fulfillment with Printful
 * Call this after order is paid
 */
export async function fulfillOrderWithPrintful(shopOrder: ShopOrder): Promise<void> {
  try {
    // Convert to Printful format
    const printfulOrder = convertToPrintfulOrder(shopOrder);
    
    if (!printfulOrder) {
      console.log('Order does not require Printful fulfillment');
      return;
    }

    // Create order in Printful
    const createdOrder = await createPrintfulOrder(printfulOrder);
    console.log('Printful order created:', createdOrder.id);

    // Optionally auto-confirm the order
    // await confirmPrintfulOrder(createdOrder.id);

    // TODO: Store Printful order ID in shop order metadata
    // await updateShopOrder(shopOrder.id, {
    //   printfulOrderId: createdOrder.id,
    //   printfulStatus: createdOrder.status,
    // });

  } catch (error) {
    console.error('Error fulfilling order with Printful:', error);
    throw error;
  }
}

