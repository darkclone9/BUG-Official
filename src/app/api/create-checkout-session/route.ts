import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CartItem } from '@/contexts/CartContext';
import { calculateStoreCreditDiscount } from '@/lib/storeCredit';
import { getStoreCreditSettings, getUserStoreCreditBalance } from '@/lib/database';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      creditToUseCents,
      fulfillmentType,
      shippingAddress,
      userId,
      userEmail,
    }: {
      items: CartItem[];
      creditToUseCents: number;
      fulfillmentType: 'campus_pickup' | 'shipping';
      shippingAddress?: {
        name: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
      };
      userId: string;
      userEmail: string;
    } = body;

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    // Get store credit settings and user balance
    const settings = await getStoreCreditSettings();
    const availableCreditCents = await getUserStoreCreditBalance(userId);

    // Calculate store credit discount
    const orderItems = items.map(item => ({
      priceCents: item.product.price,
      quantity: item.quantity,
      pointsEligible: item.product.pointsEligible,
    }));

    const discountResult = calculateStoreCreditDiscount(
      orderItems,
      creditToUseCents || 0,
      availableCreditCents,
      settings
    );

    // Validate discount calculation
    if (!discountResult.isValid) {
      return NextResponse.json(
        { error: discountResult.errorMessage || 'Invalid store credit discount' },
        { status: 400 }
      );
    }

    // Create Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item, index) => {
      // Find discount for this item
      const itemDiscount = discountResult.itemDiscounts.find(
        d => d.itemIndex === index
      );
      const discountAmount = itemDiscount?.discountCents || 0;
      const finalPrice = Math.max(0, item.product.price - Math.floor(discountAmount / item.quantity));

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.name,
            description: item.selectedVariant || undefined,
            images: item.product.images?.slice(0, 1) || [],
            metadata: {
              productId: item.product.id,
              variant: item.selectedVariant || '',
            },
          },
          unit_amount: finalPrice,
        },
        quantity: item.quantity,
      };
    });

    // Add shipping if needed
    const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [];

    if (fulfillmentType === 'shipping') {
      shippingOptions.push({
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: 500, // $5.00 flat rate shipping
            currency: 'usd',
          },
          display_name: 'Standard Shipping',
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: 5,
            },
            maximum: {
              unit: 'business_day',
              value: 10,
            },
          },
        },
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        userId,
        creditUsedCents: discountResult.discountCents.toString(),
        creditDiscount: discountResult.discountCents.toString(),
        fulfillmentType,
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : '',
      },
      shipping_options: shippingOptions.length > 0 ? shippingOptions : undefined,
      shipping_address_collection: fulfillmentType === 'shipping' ? {
        allowed_countries: ['US'],
      } : undefined,
      automatic_tax: {
        enabled: true,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
