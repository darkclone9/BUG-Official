import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import {
  createShopOrder,
  spendPoints,
  updateProductStock,
  addToPickupQueue,
  getShopProduct,
  createStoreCreditTransaction,
} from '@/lib/database';
import { ShopOrder, OrderItem } from '@/types/types';
import { sendOrderConfirmationEmail } from '@/lib/email';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'checkout.session.async_payment_succeeded':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'checkout.session.async_payment_failed':
        console.log('Payment failed:', event.data.object);
        // TODO: Handle failed payment (notify user, restore points if deducted)
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing completed checkout session:', session.id);

  // Extract metadata
  const userId = session.client_reference_id || session.metadata?.userId;
  const creditUsedCents = parseInt(session.metadata?.creditUsedCents || '0');
  const creditDiscount = parseInt(session.metadata?.creditDiscount || '0');
  const fulfillmentType = session.metadata?.fulfillmentType as 'campus_pickup' | 'shipping';
  const shippingAddressStr = session.metadata?.shippingAddress;

  if (!userId) {
    console.error('No user ID found in session metadata');
    return;
  }

  // Get line items
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ['data.price.product'],
  });

  // Parse order items
  const orderItems: OrderItem[] = lineItems.data.map((item) => {
    const product = item.price?.product as Stripe.Product;
    return {
      productId: product.metadata?.productId || '',
      productName: item.description || '',
      productImage: product.images?.[0] || '',
      quantity: item.quantity || 1,
      price: item.price?.unit_amount || 0,
      variant: product.metadata?.variant || undefined,
      pointsEligible: true, // Assume eligible since discount was applied
    };
  });

  // Parse shipping address
  let shippingAddress;
  if (shippingAddressStr) {
    try {
      shippingAddress = JSON.parse(shippingAddressStr);
    } catch (e) {
      console.error('Failed to parse shipping address:', e);
    }
  }

  // If shipping was selected, use Stripe's shipping details
  if (fulfillmentType === 'shipping' && session.shipping_cost) {
    const shippingDetails = session.customer_details;
    if (shippingDetails) {
      shippingAddress = {
        name: shippingDetails.name || '',
        line1: shippingDetails.address?.line1 || '',
        line2: shippingDetails.address?.line2 || '',
        city: shippingDetails.address?.city || '',
        state: shippingDetails.address?.state || '',
        postalCode: shippingDetails.address?.postal_code || '',
        country: shippingDetails.address?.country || '',
      };
    }
  }

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = session.shipping_cost?.amount_total || 0;
  const tax = session.total_details?.amount_tax || 0;
  const total = session.amount_total || 0;

  // Create order in Firestore
  const order: Omit<ShopOrder, 'id' | 'createdAt' | 'updatedAt'> = {
    userId,
    userEmail: session.customer_email || '',
    userDisplayName: session.customer_details?.name || 'Unknown',
    items: orderItems,
    subtotal,
    pointsDiscount: creditDiscount, // Store credit discount (for backward compatibility)
    pointsUsed: 0, // No longer using points
    storeCreditDiscount: creditDiscount, // New field for store credit
    storeCreditUsed: creditUsedCents, // New field for store credit
    shipping,
    tax,
    total,
    fulfillmentType,
    shippingAddress,
    status: 'paid',
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent as string,
  };

  try {
    // Create order
    const orderId = await createShopOrder(order);
    console.log('Order created:', orderId);

    // Deduct store credit if used
    if (creditUsedCents > 0) {
      await createStoreCreditTransaction({
        userId,
        amountCents: -creditUsedCents, // Negative for spending
        reason: `Store credit used for order ${orderId}`,
        category: 'purchase',
        approvalStatus: 'approved',
        orderId,
      });
      console.log(`Deducted $${(creditUsedCents / 100).toFixed(2)} store credit from user ${userId}`);
    }

    // Update product stock
    for (const item of orderItems) {
      if (item.productId) {
        const product = await getShopProduct(item.productId);
        if (product && product.stock !== -1) {
          await updateProductStock(item.productId, -item.quantity);
          console.log(`Updated stock for product ${item.productId}: -${item.quantity}`);
        }
      }
    }

    // Add to pickup queue if campus pickup
    if (fulfillmentType === 'campus_pickup') {
      const pickupOrder: ShopOrder = {
        ...order,
        id: orderId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await addToPickupQueue(pickupOrder);
      console.log('Added order to pickup queue:', orderId);
    }

    // Send order confirmation email
    try {
      const fullOrder: ShopOrder = {
        ...order,
        id: orderId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await sendOrderConfirmationEmail(fullOrder);
      console.log('Order confirmation email sent');
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the webhook if email fails
    }

    console.log('Order processing completed successfully');

  } catch (error) {
    console.error('Error processing order:', error);
    throw error;
  }
}
