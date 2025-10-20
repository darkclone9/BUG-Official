#!/usr/bin/env node

/**
 * Create Cloudinary Upload Presets
 *
 * This script creates two unsigned upload presets for the BUG website:
 * 1. user_avatars - for avatar uploads
 * 2. profile_banners - for banner uploads
 *
 * Usage: node scripts/create-cloudinary-presets.js
 */

const https = require('https');

// Configuration
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'djowsskks';
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY || '437651992916769';

// Try to get API secret from various sources
let finalApiSecret = '';

// Try CLOUDINARY_API_SECRET first
if (process.env.CLOUDINARY_API_SECRET && !process.env.CLOUDINARY_API_SECRET.includes('CLOUDINARY_URL')) {
  finalApiSecret = process.env.CLOUDINARY_API_SECRET;
}

// Try to extract from CLOUDINARY_URL
if (!finalApiSecret && process.env.CLOUDINARY_URL) {
  const match = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/[^:]+:([^@]+)@/);
  if (match) {
    finalApiSecret = match[1];
  }
}

// If still not found, try to extract from malformed CLOUDINARY_API_SECRET
if (!finalApiSecret && process.env.CLOUDINARY_API_SECRET) {
  const match = process.env.CLOUDINARY_API_SECRET.match(/cloudinary:\/\/[^:]+:([^@]+)@/);
  if (match) {
    finalApiSecret = match[1];
  }
}

if (!finalApiSecret) {
  console.error('❌ Error: CLOUDINARY_API_SECRET not found in environment variables');
  console.error('Please set CLOUDINARY_API_SECRET in your .env.local file');
  console.error('\nExample:');
  console.error('CLOUDINARY_API_SECRET=your_api_secret_here');
  process.exit(1);
}

// Presets to create
const presets = [
  {
    name: 'user_avatars',
    unsigned: true,
    folder: 'bug_website/avatars',
    resource_type: 'image',
  },
  {
    name: 'profile_banners',
    unsigned: true,
    folder: 'bug_website/banners',
    resource_type: 'image',
  },
];

/**
 * Create an upload preset via Cloudinary Admin API
 */
function createPreset(preset) {
  return new Promise((resolve, reject) => {
    // Create Basic Auth header
    const auth = Buffer.from(`${API_KEY}:${finalApiSecret}`).toString('base64');

    // Prepare request data
    const data = new URLSearchParams();
    Object.entries(preset).forEach(([key, value]) => {
      data.append(key, value);
    });

    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${CLOUD_NAME}/upload_presets`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.toString().length,
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode === 200) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error (${res.statusCode}): ${parsed.error?.message || responseData}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data.toString());
    req.end();
  });
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Creating Cloudinary Upload Presets...\n');
  console.log(`Cloud Name: ${CLOUD_NAME}`);
  console.log(`API Key: ${API_KEY}\n`);

  for (const preset of presets) {
    try {
      console.log(`⏳ Creating preset: ${preset.name}...`);
      const result = await createPreset(preset);
      console.log(`✅ Successfully created preset: ${preset.name}`);
      console.log(`   Folder: ${preset.folder}`);
      console.log(`   Unsigned: ${preset.unsigned}\n`);
    } catch (error) {
      console.error(`❌ Failed to create preset ${preset.name}:`);
      console.error(`   ${error.message}\n`);
      process.exit(1);
    }
  }

  console.log('🎉 All presets created successfully!\n');
  console.log('✅ You can now use the upload presets:');
  console.log('   - user_avatars (for avatar uploads)');
  console.log('   - profile_banners (for banner uploads)\n');
  console.log('🚀 Next steps:');
  console.log('   1. Restart your dev server: npm run dev');
  console.log('   2. Test avatar upload at http://localhost:3002/profile/edit');
  console.log('   3. Test banner upload at http://localhost:3002/profile/edit\n');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
