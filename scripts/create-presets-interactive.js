#!/usr/bin/env node

/**
 * Interactive Cloudinary Upload Presets Creator
 * 
 * This script will prompt you for your Cloudinary API credentials
 * and create the upload presets.
 */

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n🚀 Cloudinary Upload Presets Creator\n');
  console.log('This script will create two upload presets for your BUG website:\n');
  console.log('  1. user_avatars - for avatar uploads');
  console.log('  2. profile_banners - for banner uploads\n');

  // Get credentials
  const cloudName = await question('Enter your Cloudinary Cloud Name (e.g., djowsskks): ');
  const apiKey = await question('Enter your Cloudinary API Key (e.g., 437651992916769): ');
  const apiSecret = await question('Enter your Cloudinary API Secret: ');

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('\n❌ Error: All credentials are required');
    rl.close();
    process.exit(1);
  }

  rl.close();

  console.log('\n⏳ Creating presets...\n');

  const presets = [
    {
      name: 'user_avatars',
      unsigned: true,
      folder: 'bug_website/avatars',
    },
    {
      name: 'profile_banners',
      unsigned: true,
      folder: 'bug_website/banners',
    },
  ];

  for (const preset of presets) {
    try {
      await createPreset(cloudName, apiKey, apiSecret, preset);
      console.log(`✅ Created preset: ${preset.name}`);
    } catch (error) {
      console.error(`❌ Failed to create preset ${preset.name}: ${error.message}`);
      process.exit(1);
    }
  }

  console.log('\n🎉 All presets created successfully!\n');
  console.log('✅ Next steps:');
  console.log('   1. Restart your dev server: npm run dev');
  console.log('   2. Test avatar upload at http://localhost:3002/profile/edit');
  console.log('   3. Test banner upload at http://localhost:3002/profile/edit\n');
}

function createPreset(cloudName, apiKey, apiSecret, preset) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    const data = new URLSearchParams();
    Object.entries(preset).forEach(([key, value]) => {
      data.append(key, value);
    });

    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${cloudName}/upload_presets`,
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

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});

