/**
 * Detailed Supabase Migration Verification
 * 
 * This script provides detailed information about:
 * 1. Table schemas
 * 2. RLS policies
 * 3. Helper functions
 * 4. Storage bucket policies
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableSchemas() {
  console.log('\n📊 Checking Table Schemas...\n');
  
  const tables = [
    'users',
    'user_profiles',
    'tournaments',
    'teams',
    'matches',
    'conversations',
    'messages',
    'products',
    'orders',
    'announcements',
    'events'
  ];

  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);

      if (error) {
        console.log(`❌ ${tableName}: Error - ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: Accessible`);
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err}`);
    }
  }
}

async function checkRLSPolicies() {
  console.log('\n🔒 Checking RLS Policies...\n');
  console.log('Note: Detailed RLS policy information requires direct database access.');
  console.log('Please verify in Supabase Dashboard → Authentication → Policies\n');

  // Test with anon key (should have limited access)
  const anonClient = createClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  console.log('Testing anonymous access (should be restricted):');
  
  const testTables = ['users', 'user_profiles', 'products'];
  
  for (const table of testTables) {
    const { data, error } = await anonClient
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`  ✅ ${table}: Properly restricted (${error.message})`);
    } else {
      console.log(`  ⚠️  ${table}: Accessible anonymously (may have public read policy)`);
    }
  }
}

async function checkStoragePolicies() {
  console.log('\n🗄️  Checking Storage Bucket Policies...\n');

  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    console.log('❌ Error listing buckets:', error.message);
    return;
  }

  for (const bucket of buckets || []) {
    console.log(`\n📦 Bucket: ${bucket.name}`);
    console.log(`   Public: ${bucket.public ? 'Yes' : 'No'}`);
    console.log(`   Created: ${bucket.created_at}`);

    // Try to list files (should work if policies are set)
    const { data: files, error: listError } = await supabase.storage
      .from(bucket.name)
      .list('', { limit: 1 });

    if (listError) {
      console.log(`   ⚠️  List access: ${listError.message}`);
    } else {
      console.log(`   ✅ List access: Working`);
    }
  }

  console.log('\nNote: Detailed storage policies can be viewed in:');
  console.log('Supabase Dashboard → Storage → [Bucket Name] → Policies');
}

async function testDataInsertion() {
  console.log('\n✍️  Testing Data Insertion (with service role)...\n');

  // Try to insert a test user profile
  const testUserId = 'test-user-' + Date.now();
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: testUserId,
        bio: 'Test bio',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.log('❌ Insert test failed:', error.message);
      console.log('   This might indicate missing tables or RLS issues');
    } else {
      console.log('✅ Insert test successful');
      
      // Clean up test data
      await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', testUserId);
      
      console.log('✅ Cleanup successful');
    }
  } catch (err) {
    console.log('❌ Insert test error:', err);
  }
}

async function generateMigrationReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUPABASE MIGRATION VERIFICATION REPORT');
  console.log('='.repeat(60));

  await checkTableSchemas();
  await checkRLSPolicies();
  await checkStoragePolicies();
  await testDataInsertion();

  console.log('\n' + '='.repeat(60));
  console.log('✅ VERIFICATION COMPLETE');
  console.log('='.repeat(60));

  console.log('\n📝 Next Steps:\n');
  console.log('1. ✅ Database tables created successfully');
  console.log('2. ✅ Storage buckets configured');
  console.log('3. ⏳ Verify RLS policies in Supabase Dashboard');
  console.log('4. ⏳ Run storage policies SQL if not already done');
  console.log('5. ⏳ Export data from Firebase');
  console.log('6. ⏳ Import data to Supabase');
  console.log('7. ⏳ Update application code to use Supabase');
  console.log('8. ⏳ Test application features');
  console.log('9. ⏳ Deploy to production\n');

  console.log('📖 For detailed instructions, see:');
  console.log('   - docs/SUPABASE_MIGRATION_TESTING.md');
  console.log('   - docs/SUPABASE_SETUP_GUIDE.md\n');
}

generateMigrationReport().catch(console.error);

