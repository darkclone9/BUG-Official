/**
 * Script to create a test product for discount testing
 * Usage: npx ts-node scripts/createTestProduct.ts
 */

import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.join(process.cwd(), 'scripts', 'serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://bug-96c26.firebaseio.com',
});

const db = admin.firestore();

interface TestProduct {
  name: string;
  description: string;
  price: number; // in cents
  category: 'apparel' | 'accessories' | 'merchandise' | 'digital';
  images: string[];
  stock: number;
  isActive: boolean;
  pointsEligible: boolean;
  tags: string[];
  isTestProduct?: boolean;
  discountOptions?: Array<{
    name: string;
    discountPercent: number;
  }>;
}

async function createTestProduct() {
  try {
    console.log('🧪 Creating test product for discount testing...\n');

    const testProduct: TestProduct = {
      name: '[TEST] Discount Testing Product',
      description: 'This is a test product for testing discount functionality. It includes 30% and 50% discount options for testing purposes. This product can be toggled on/off by admins.',
      price: 2999, // $29.99
      category: 'merchandise',
      images: [
        'https://via.placeholder.com/500x500?text=Test+Product+30%25+Off',
        'https://via.placeholder.com/500x500?text=Test+Product+50%25+Off',
      ],
      stock: -1, // Unlimited stock
      isActive: false, // Start disabled
      pointsEligible: true,
      tags: ['test', 'discount-testing', 'admin-only'],
      isTestProduct: true,
      discountOptions: [
        {
          name: '30% Discount',
          discountPercent: 30,
        },
        {
          name: '50% Discount',
          discountPercent: 50,
        },
      ],
    };

    // Create the product
    const productRef = db.collection('shop_products').doc();
    const productId = productRef.id;

    await productRef.set({
      ...testProduct,
      id: productId,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    console.log('✅ Test product created successfully!\n');
    console.log('📋 Product Details:');
    console.log(`   ID: ${productId}`);
    console.log(`   Name: ${testProduct.name}`);
    console.log(`   Price: $${(testProduct.price / 100).toFixed(2)}`);
    console.log(`   Status: ${testProduct.isActive ? 'ACTIVE' : 'INACTIVE (disabled by default)'}`);
    console.log(`   Stock: ${testProduct.stock === -1 ? 'Unlimited' : testProduct.stock}`);
    console.log(`   Discount Options:`);
    testProduct.discountOptions?.forEach((option) => {
      console.log(`     - ${option.name}: ${option.discountPercent}% off`);
    });

    console.log('\n📝 Next Steps:');
    console.log('1. Go to /admin/shop to manage this product');
    console.log('2. Toggle the product ON to make it visible in the shop');
    console.log('3. Test the discount options during checkout');
    console.log('4. Verify store credit is applied correctly');
    console.log('5. Delete the product when testing is complete\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test product:', error);
    process.exit(1);
  }
}

createTestProduct();

