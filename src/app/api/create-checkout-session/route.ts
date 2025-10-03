import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CartItem } from '@/contexts/CartContext';
import { calculateCartDiscount } from '@/lib/points';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      pointsToUse,
      fulfillmentType,
      shippingAddress,
      userId,
      userEmail,
    }: {
      items: CartItem[];
      pointsToUse: number;
      fulfillmentType: 'campus_pickup' | 'shipping';
      shippingAddress?: any;
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

    // Calculate points discount
    const orderItems = items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.images?.[0] || '',
      quantity: item.quantity,
      price: item.product.price,
      variant: item.selectedVariant,
      pointsEligible: item.product.pointsEligible,
    }));

    const discountResult = calculateCartDiscount(orderItems, pointsToUse);

    // Create Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
      // Find discount for this item
      const itemDiscount = discountResult.itemDiscounts.find(
        d => d.productId === item.product.id
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
        pointsUsed: discountResult.pointsUsed.toString(),
        pointsDiscount: discountResult.discountCents.toString(),
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

