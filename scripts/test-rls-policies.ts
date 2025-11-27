/**
 * Test Script: RLS Policies Verification
 *
 * This script tests Row Level Security policies on:
 * - price_tracking table
 * - price_history table
 * - price_alerts table
 *
 * Run: npx ts-node scripts/test-rls-policies.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Test data
const TEST_USER_EMAIL = 'test-user@igosa.com';
const TEST_PRODUCT_ID = 'test-product-rls-001';

async function main() {
  console.log('🔐 Testing RLS Policies...\n');

  // 1. Test with service role (should have full access)
  console.log('1️⃣ Testing with Service Role Key (full access)...');
  const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Insert test record
  const { data: inserted, error: insertError } = await serviceClient
    .from('price_tracking')
    .insert({
      user_id: TEST_USER_EMAIL,
      product_id: TEST_PRODUCT_ID,
      product_name: 'Test Product for RLS',
      target_price: 100000,
      current_price: 120000,
      status: 'active',
    })
    .select()
    .single();

  if (insertError) {
    console.error('  ❌ Insert failed:', insertError.message);
    return;
  }
  console.log('  ✅ Service role can insert:', inserted.id);

  // Read test record
  const { data: readData, error: readError } = await serviceClient
    .from('price_tracking')
    .select('*')
    .eq('id', inserted.id)
    .single();

  if (readError) {
    console.error('  ❌ Read failed:', readError.message);
  } else {
    console.log('  ✅ Service role can read');
  }

  // 2. Test with anon key (should be restricted)
  console.log('\n2️⃣ Testing with Anon Key (should be restricted)...');
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Try to read without authentication
  const { data: anonData, error: anonError } = await anonClient
    .from('price_tracking')
    .select('*')
    .eq('id', inserted.id);

  if (anonError) {
    console.log('  ✅ Anon access blocked (expected):', anonError.message);
  } else if (!anonData || anonData.length === 0) {
    console.log('  ✅ Anon access returns empty (RLS working)');
  } else {
    console.error('  ❌ Anon can read data (RLS NOT working!)');
  }

  // Try to insert without authentication
  const { error: anonInsertError } = await anonClient
    .from('price_tracking')
    .insert({
      user_id: 'unauthorized@test.com',
      product_id: 'unauthorized-product',
      product_name: 'Unauthorized Product',
      target_price: 50000,
      current_price: 60000,
    });

  if (anonInsertError) {
    console.log('  ✅ Anon insert blocked (expected):', anonInsertError.message);
  } else {
    console.error('  ❌ Anon can insert data (RLS NOT working!)');
  }

  // 3. Test price_history (should be readable by all authenticated users)
  console.log('\n3️⃣ Testing price_history table...');

  // Insert price history record
  const { data: historyInserted, error: historyInsertError } = await serviceClient
    .from('price_history')
    .insert({
      product_id: TEST_PRODUCT_ID,
      platform: 'coupang',
      price: 110000,
      recorded_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (historyInsertError) {
    console.error('  ❌ History insert failed:', historyInsertError.message);
  } else {
    console.log('  ✅ Service role can insert price history');
  }

  // Try to read price history with anon key
  const { data: historyAnonData, error: historyAnonError } = await anonClient
    .from('price_history')
    .select('*')
    .eq('id', historyInserted?.id);

  if (historyAnonError) {
    console.log('  ✅ Anon access to price_history blocked (expected)');
  } else if (!historyAnonData || historyAnonData.length === 0) {
    console.log('  ✅ Anon access returns empty (RLS working)');
  } else {
    console.error('  ❌ Anon can read price_history (check RLS policy)');
  }

  // 4. Test indexes
  console.log('\n4️⃣ Testing database indexes...');

  // Query with indexed columns (should be fast)
  const start = Date.now();
  const { data: indexedQuery } = await serviceClient
    .from('price_tracking')
    .select('*')
    .eq('user_id', TEST_USER_EMAIL)
    .eq('status', 'active');
  const duration = Date.now() - start;

  console.log(`  ⏱️  Query with indexes: ${duration}ms`);
  if (duration < 100) {
    console.log('  ✅ Indexes working (fast query)');
  } else {
    console.log('  ⚠️  Query slow (check indexes)');
  }

  // 5. Cleanup
  console.log('\n5️⃣ Cleaning up test data...');

  await serviceClient
    .from('price_tracking')
    .delete()
    .eq('id', inserted.id);

  if (historyInserted) {
    await serviceClient
      .from('price_history')
      .delete()
      .eq('id', historyInserted.id);
  }

  console.log('  ✅ Test data cleaned up');

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('🎉 RLS Policy Test Complete!');
  console.log('='.repeat(50));
  console.log('\nNext steps:');
  console.log('1. Review any ❌ errors above');
  console.log('2. Check Supabase Dashboard → Authentication → Policies');
  console.log('3. Run E2E tests with authenticated users');
}

main().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
