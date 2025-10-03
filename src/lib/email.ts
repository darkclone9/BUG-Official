/**
 * Email Notification Service
 * 
 * This module handles sending email notifications for shop orders.
 * Uses a simple email service (can be replaced with SendGrid, Mailgun, etc.)
 */

import { ShopOrder } from '@/types/types';
import { formatCents } from './points';

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(order: ShopOrder): Promise<void> {
  const emailHtml = generateOrderConfirmationEmail(order);
  
  // TODO: Implement actual email sending
  // For now, just log the email content
  console.log('=== ORDER CONFIRMATION EMAIL ===');
  console.log('To:', order.userEmail);
  console.log('Subject: Order Confirmation - BUG Gaming Club Shop');
  console.log('HTML:', emailHtml);
  console.log('================================');

  // Example with SendGrid (uncomment when ready):
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: order.userEmail,
    from: 'noreply@buggamingclub.com',
    subject: 'Order Confirmation - BUG Gaming Club Shop',
    html: emailHtml,
  };
  
  await sgMail.send(msg);
  */
}

/**
 * Send pickup ready notification email
 */
export async function sendPickupReadyEmail(order: ShopOrder): Promise<void> {
  const emailHtml = generatePickupReadyEmail(order);
  
  console.log('=== PICKUP READY EMAIL ===');
  console.log('To:', order.userEmail);
  console.log('Subject: Your Order is Ready for Pickup!');
  console.log('HTML:', emailHtml);
  console.log('==========================');
}

/**
 * Send shipping notification email
 */
export async function sendShippingNotificationEmail(
  order: ShopOrder,
  trackingNumber: string
): Promise<void> {
  const emailHtml = generateShippingNotificationEmail(order, trackingNumber);
  
  console.log('=== SHIPPING NOTIFICATION EMAIL ===');
  console.log('To:', order.userEmail);
  console.log('Subject: Your Order Has Shipped!');
  console.log('HTML:', emailHtml);
  console.log('===================================');
}

/**
 * Generate order confirmation email HTML
 */
function generateOrderConfirmationEmail(order: ShopOrder): string {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.productName}${item.variant ? ` (${item.variant})` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${formatCents(item.price * item.quantity)}
      </td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="margin: 0;">Order Confirmed!</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
    <p>Hi ${order.userDisplayName},</p>
    
    <p>Thank you for your order! We've received your payment and are processing your order.</p>
    
    <h2 style="color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">Order Details</h2>
    
    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
    <p><strong>Fulfillment:</strong> ${order.fulfillmentType === 'campus_pickup' ? 'Campus Pickup' : 'Shipping'}</p>
    
    <h3>Items Ordered:</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #f0f0f0;">
          <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
          <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <table style="width: 100%; margin-bottom: 20px;">
      <tr>
        <td style="text-align: right; padding: 5px;"><strong>Subtotal:</strong></td>
        <td style="text-align: right; padding: 5px; width: 100px;">${formatCents(order.subtotal)}</td>
      </tr>
      ${
        order.pointsDiscount > 0
          ? `
      <tr>
        <td style="text-align: right; padding: 5px; color: #4CAF50;"><strong>Points Discount:</strong></td>
        <td style="text-align: right; padding: 5px; color: #4CAF50;">-${formatCents(order.pointsDiscount)}</td>
      </tr>
      `
          : ''
      }
      <tr>
        <td style="text-align: right; padding: 5px;"><strong>Shipping:</strong></td>
        <td style="text-align: right; padding: 5px;">${order.shipping === 0 ? 'Free' : formatCents(order.shipping)}</td>
      </tr>
      <tr>
        <td style="text-align: right; padding: 5px;"><strong>Tax:</strong></td>
        <td style="text-align: right; padding: 5px;">${formatCents(order.tax)}</td>
      </tr>
      <tr style="border-top: 2px solid #ddd;">
        <td style="text-align: right; padding: 10px;"><strong>Total Paid:</strong></td>
        <td style="text-align: right; padding: 10px; font-size: 1.2em;"><strong>${formatCents(order.total)}</strong></td>
      </tr>
    </table>
    
    ${
      order.fulfillmentType === 'campus_pickup'
        ? `
    <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin-top: 20px;">
      <h3 style="margin-top: 0; color: #856404;">Campus Pickup Instructions</h3>
      <p>We'll send you another email when your order is ready for pickup. Please bring your student ID when picking up your order.</p>
    </div>
    `
        : `
    <div style="background-color: #d1ecf1; border: 1px solid #17a2b8; padding: 15px; border-radius: 5px; margin-top: 20px;">
      <h3 style="margin-top: 0; color: #0c5460;">Shipping Information</h3>
      <p><strong>Ship to:</strong><br>
      ${order.shippingAddress?.name}<br>
      ${order.shippingAddress?.line1}<br>
      ${order.shippingAddress?.line2 ? order.shippingAddress.line2 + '<br>' : ''}
      ${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.postalCode}</p>
      <p>We'll send you a tracking number once your order ships.</p>
    </div>
    `
    }
    
    <p style="margin-top: 30px;">If you have any questions about your order, please contact us at <a href="mailto:belhavengamingclub@gmail.com">belhavengamingclub@gmail.com</a>.</p>
    
    <p>Thank you for supporting BUG Gaming Club!</p>
    
    <p style="color: #666; font-size: 0.9em; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
      This is an automated email. Please do not reply to this message.
    </p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate pickup ready email HTML
 */
function generatePickupReadyEmail(order: ShopOrder): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Ready for Pickup</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="margin: 0;">Your Order is Ready!</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
    <p>Hi ${order.userDisplayName},</p>
    
    <p>Great news! Your order is ready for pickup on campus.</p>
    
    <p><strong>Order ID:</strong> ${order.id}</p>
    
    <div style="background-color: #d4edda; border: 1px solid #28a745; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #155724;">Pickup Instructions</h3>
      <ul style="margin: 10px 0;">
        <li>Bring your student ID</li>
        <li>Visit the BUG Gaming Club office during office hours</li>
        <li>Mention your order ID: ${order.id}</li>
      </ul>
    </div>
    
    <p>If you have any questions, please contact us at <a href="mailto:belhavengamingclub@gmail.com">belhavengamingclub@gmail.com</a>.</p>
    
    <p>See you soon!</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate shipping notification email HTML
 */
function generateShippingNotificationEmail(order: ShopOrder, trackingNumber: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #17a2b8; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="margin: 0;">Your Order Has Shipped!</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
    <p>Hi ${order.userDisplayName},</p>
    
    <p>Your order is on its way!</p>
    
    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
    
    <div style="background-color: #d1ecf1; border: 1px solid #17a2b8; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #0c5460;">Shipping Details</h3>
      <p><strong>Ship to:</strong><br>
      ${order.shippingAddress?.name}<br>
      ${order.shippingAddress?.line1}<br>
      ${order.shippingAddress?.line2 ? order.shippingAddress.line2 + '<br>' : ''}
      ${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.postalCode}</p>
      <p><strong>Estimated Delivery:</strong> 5-10 business days</p>
    </div>
    
    <p>You can track your package using the tracking number above.</p>
    
    <p>If you have any questions, please contact us at <a href="mailto:belhavengamingclub@gmail.com">belhavengamingclub@gmail.com</a>.</p>
    
    <p>Thank you for your order!</p>
  </div>
</body>
</html>
  `;
}

