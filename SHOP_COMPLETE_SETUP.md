# 🛍️ Complete Shop Setup Guide

This guide will walk you through setting up the BUG Gaming Club shop system from start to finish.

---

## ✅ Prerequisites Checklist

Before starting, make sure you have:

- [x] Stripe API keys added to `.env.local`
- [ ] Firestore security rules deployed
- [ ] Firestore indexes created
- [ ] Stripe webhook configured
- [ ] First product added

---

## Step 1: Deploy Firestore Security Rules

### Option A: Using Firebase Console (Recommended for Beginners)

1. **Open Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your project: `bug-96c26`

2. **Navigate to Firestore Rules**
   - Click "Firestore Database" in the left sidebar
   - Click the "Rules" tab at the top

3. **Copy and Paste Rules**
   - Open the `firestore.rules` file in your project
   - Copy ALL the content
   - Paste it into the Firebase Console rules editor
   - Click "Publish"

4. **Verify Deployment**
   - You should see a success message
   - The rules are now active!

### Option B: Using Firebase CLI (Advanced)

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

---

## Step 2: Create Firestore Indexes

Firestore requires indexes for complex queries. You need to create these manually.

### Method 1: Automatic (Let Firebase Create Them)

1. **Try to load the shop page** at http://localhost:3000/shop
2. **Check the browser console** for error messages
3. **Click the index creation link** in the error message
4. Firebase will automatically create the required index

### Method 2: Manual Creation

1. **Go to Firebase Console** > Firestore Database > Indexes tab

2. **Create these indexes:**

#### Index 1: Shop Products (Active + Created)
- **Collection ID:** `shop_products`
- **Fields:**
  - `active` (Ascending)
  - `createdAt` (Descending)
- **Query scope:** Collection

#### Index 2: Shop Products (Category + Created)
- **Collection ID:** `shop_products`
- **Fields:**
  - `category` (Ascending)
  - `createdAt` (Descending)
- **Query scope:** Collection

#### Index 3: Shop Orders (User + Created)
- **Collection ID:** `shop_orders`
- **Fields:**
  - `userId` (Ascending)
  - `createdAt` (Descending)
- **Query scope:** Collection

#### Index 4: Shop Orders (Status + Created)
- **Collection ID:** `shop_orders`
- **Fields:**
  - `status` (Ascending)
  - `createdAt` (Descending)
- **Query scope:** Collection

3. **Wait for indexes to build** (usually takes 1-5 minutes)

---

## Step 3: Configure Stripe Webhook

You already have Stripe CLI installed! Now let's get the webhook secret.

### Get Webhook Secret

1. **Open a NEW PowerShell window** (keep your dev server running in the other one)

2. **Navigate to your project:**
   ```powershell
   cd "C:\Users\haley\Desktop\Belhaven Files (Classes)\Personal Projects\BUG Website\BUG-Official"
   ```

3. **Login to Stripe** (if not already logged in):
   ```powershell
   stripe login
   ```
   - A browser window will open
   - Click "Allow access"
   - Wait for confirmation

4. **Start webhook listener:**
   ```powershell
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

5. **Copy the webhook secret:**
   - Look for this line in the output:
     ```
     > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
     ```
   - Copy the `whsec_...` value

6. **Update `.env.local`:**
   - Open `.env.local`
   - Replace `whsec_YOUR_WEBHOOK_SECRET_HERE` with your actual secret
   - Save the file

7. **Restart your dev server:**
   - Stop the server (Ctrl+C in the terminal running `npm run dev`)
   - Start it again: `npm run dev`

8. **Keep the webhook listener running!**
   - Leave the `stripe listen` command running in the background
   - This forwards Stripe events to your local server

---

## Step 4: Add Your First Product

Now let's add a product to test the shop!

### Using the Admin Panel

1. **Navigate to Admin Shop Management:**
   - Go to http://localhost:3000/admin/shop
   - You need to be logged in as an admin

2. **Click "Add Product" button**

3. **Fill in Product Details:**

   **Example Product:**
   ```
   Name: BUG Gaming T-Shirt
   Description: Official BUG Gaming Club t-shirt with logo
   Price: $25.00 (enter as 2500 cents)
   Category: Apparel
   Stock: 50
   Image URL: https://via.placeholder.com/400x400?text=BUG+T-Shirt
   Active: ✓ (checked)
   Featured: ✓ (checked)
   ```

4. **Click "Create Product"**

5. **Verify the product appears** in the products list

---

## Step 5: Test the Complete Checkout Flow

Now let's test the entire shop system!

### 5.1 Browse Products

1. Go to http://localhost:3000/shop
2. You should see your product!
3. Click on the product to view details

### 5.2 Add to Cart

1. Click "Add to Cart"
2. Click the cart icon in the top right
3. Verify the product is in your cart

### 5.3 Proceed to Checkout

1. Click "Checkout" in the cart
2. Fill in shipping information:
   ```
   Name: Test User
   Email: test@example.com
   Address: 123 Test St
   City: Jackson
   State: MS
   ZIP: 39201
   ```

3. Choose fulfillment type:
   - **Campus Pickup** (free) or **Shipping** ($5.00)

4. Adjust points slider (if you have points)

5. Click "Proceed to Payment"

### 5.4 Complete Stripe Checkout

1. You'll be redirected to Stripe Checkout
2. Use a **test card**:
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: 12/34 (any future date)
   CVC: 123
   ZIP: 12345
   ```

3. Click "Pay"

### 5.5 Verify Order Creation

1. You should be redirected to the success page
2. Check your terminal running `stripe listen` - you should see webhook events
3. Go to http://localhost:3000/profile/orders
4. Your order should appear!

---

## Step 6: Test Admin Features

### View Orders

1. Go to http://localhost:3000/admin/shop
2. Click the "Orders" tab
3. You should see the test order

### Manage Pickup Queue

1. Click the "Pickup Queue" tab
2. Orders with "Campus Pickup" appear here
3. Click "Mark as Ready" when the order is ready
4. Click "Complete Pickup" when the customer picks it up

### Approve Points

1. Click the "Points Approval" tab
2. Pending points transactions appear here
3. Approve or reject points earned from events

---

## 🎉 Congratulations!

Your shop is now fully functional! Here's what you've accomplished:

✅ Firestore security rules deployed
✅ Firestore indexes created
✅ Stripe webhook configured
✅ First product added
✅ Complete checkout flow tested
✅ Admin features verified

---

## 🚀 Next Steps

### Add More Products

- Add different categories (Apparel, Accessories, Stickers, etc.)
- Use real product images
- Set up product variants (sizes, colors)

### Configure Email Notifications (Optional)

1. Sign up for SendGrid: https://sendgrid.com
2. Get API key
3. Add to `.env.local`:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

### Set Up Print-on-Demand (Optional)

1. Sign up for Printful: https://www.printful.com
2. Get API key
3. Add to `.env.local`:
   ```
   PRINTFUL_API_KEY=your_printful_api_key
   ```
4. Sync products from Printful catalog

### Production Deployment

When ready to deploy:

1. Get production Stripe keys
2. Update `.env.local` with production keys
3. Deploy to Vercel
4. Set up production webhook endpoint
5. Update Firestore rules for production

---

## 🆘 Troubleshooting

### "Missing or insufficient permissions" error

- **Cause:** Firestore rules not deployed
- **Solution:** Follow Step 1 to deploy rules

### "Index not found" error

- **Cause:** Firestore indexes not created
- **Solution:** Click the link in the error or follow Step 2

### Webhook not receiving events

- **Cause:** `stripe listen` not running
- **Solution:** Start the webhook listener (Step 3)

### Products not showing

- **Cause:** No products in database or inactive products
- **Solution:** Add products via admin panel (Step 4)

### Checkout fails

- **Cause:** Stripe keys incorrect or webhook secret missing
- **Solution:** Verify `.env.local` has correct keys

---

## 📞 Need Help?

If you encounter any issues:

1. Check the browser console for errors
2. Check the terminal running `npm run dev` for server errors
3. Check the terminal running `stripe listen` for webhook events
4. Verify all environment variables are set correctly

---

**Happy selling! 🎮🛍️**

