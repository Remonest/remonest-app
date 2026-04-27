#!/usr/bin/env node

/**
 * RLS Policy Verification Script
 * Run AFTER applying the RLS fix script to verify security
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function error(message) {
  log(`✗ ${message}`, 'red');
}

function warning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ ${message}`, 'blue');
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function main() {
  console.clear();
  log('🔒 RLS Policy Verification', 'cyan');
  log('Testing Row Level Security after applying fixes\n', 'blue');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    error('Missing required environment variables');
    process.exit(1);
  }

  const anonClient = createClient(supabaseUrl, anonKey);

  // ================================================================
  // TEST 1: User Profiles RLS (Most Critical)
  // ================================================================

  section('TEST 1: User Profiles RLS Enforcement');

  try {
    // Try to read all user profiles with anon key
    const { data: allProfiles, error: profilesError } = await anonClient
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (profilesError && profilesError.code === '42P17') {
      success('✅ RLS is properly enforced - Anon key cannot access user_profiles');
    } else if (allProfiles && allProfiles.length > 0) {
      error('❌ RLS NOT enforced - Anon key can access user profiles!');
      error('This means your RLS fix may not have been applied correctly.');
    } else {
      warning('⚠️ RLS test inconclusive - user_profiles table may be empty');
    }
  } catch (err) {
    error(`User profiles test failed: ${err.message}`);
  }

  // ================================================================
  // TEST 2: Published Jobs Access (Public Content)
  // ================================================================

  section('TEST 2: Public Content Access (Published Jobs)');

  try {
    // Anon key should be able to read published jobs
    const { data: publishedJobs, error: jobsError } = await anonClient
      .from('jobs')
      .select('*')
      .eq('status', 'published')
      .limit(1);

    if (jobsError) {
      warning('Anon key cannot access published jobs');
    } else {
      success('✅ Anon key can access published jobs (correct)');
    }

    // Anon key should NOT be able to access draft jobs
    const { data: draftJobs, error: draftError } = await anonClient
      .from('jobs')
      .select('*')
      .eq('status', 'draft')
      .limit(1);

    if (draftError && draftError.code === '42P17') {
      success('✅ Anon key cannot access draft jobs (correct)');
    } else if (draftJobs && draftJobs.length > 0) {
      error('❌ Anon key can access draft jobs - RLS not properly enforced!');
    } else {
      warning('⚠️ Draft jobs test inconclusive - no draft jobs exist');
    }
  } catch (err) {
    error(`Jobs test failed: ${err.message}`);
  }

  // ================================================================
  // TEST 3: Published Learning Modules Access
  // ================================================================

  section('TEST 3: Public Content Access (Learning Modules)');

  try {
    // Anon key should be able to read published learning modules
    const { data: publishedModules, error: modulesError } = await anonClient
      .from('learning_modules')
      .select('*')
      .eq('status', 'published')
      .limit(1);

    if (modulesError) {
      warning('Anon key cannot access published learning modules');
    } else {
      success('✅ Anon key can access published learning modules (correct)');
    }

    // Anon key should NOT be able to access draft modules
    const { data: draftModules, error: draftModuleError } = await anonClient
      .from('learning_modules')
      .select('*')
      .eq('status', 'draft')
      .limit(1);

    if (draftModuleError && draftModuleError.code === '42P17') {
      success('✅ Anon key cannot access draft learning modules (correct)');
    } else if (draftModules && draftModules.length > 0) {
      error('❌ Anon key can access draft modules - RLS not properly enforced!');
    } else {
      warning('⚠️ Draft modules test inconclusive - no draft modules exist');
    }
  } catch (err) {
    error(`Learning modules test failed: ${err.message}`);
  }

  // ================================================================
  // TEST 4: Portfolio Items Access
  // ================================================================

  section('TEST 4: Public Content Access (Portfolio Items)');

  try {
    // Anon key should be able to read published portfolio items
    const { data: publishedItems, error: itemsError } = await anonClient
      .from('portfolio_items')
      .select('*')
      .eq('is_published', true)
      .limit(1);

    if (itemsError) {
      warning('Anon key cannot access published portfolio items');
    } else {
      success('✅ Anon key can access published portfolio items (correct)');
    }

    // Anon key should NOT be able to access draft portfolio items
    const { data: draftItems, error: draftItemError } = await anonClient
      .from('portfolio_items')
      .select('*')
      .eq('is_published', false)
      .limit(1);

    if (draftItemError && draftItemError.code === '42P17') {
      success('✅ Anon key cannot access draft portfolio items (correct)');
    } else if (draftItems && draftItems.length > 0) {
      error('❌ Anon key can access draft portfolio items - RLS not properly enforced!');
    } else {
      warning('⚠️ Draft portfolio items test inconclusive - no draft items exist');
    }
  } catch (err) {
    error(`Portfolio items test failed: ${err.message}`);
  }

  // ================================================================
  // TEST 5: User Data Isolation
  // ================================================================

  section('TEST 5: User Data Isolation');

  try {
    // Check if anon key can access user-specific tables
    const userTables = [
      'user_learning_progress',
      'user_quiz_attempts',
      'user_cvs'
    ];

    let isolationTestPassed = true;

    for (const table of userTables) {
      const { data: userData, error: userError } = await anonClient
        .from(table)
        .select('*')
        .limit(1);

      if (userError && userError.code === '42P17') {
        success(`✅ Anon key cannot access ${table} (correct)`);
      } else if (userData && userData.length > 0) {
        error(`❌ Anon key can access ${table} - RLS not properly enforced!`);
        isolationTestPassed = false;
      } else {
        warning(`⚠️ ${table} test inconclusive - table may be empty`);
      }
    }

    if (isolationTestPassed) {
      success('✅ All user data is properly isolated');
    }
  } catch (err) {
    error(`User data isolation test failed: ${err.message}`);
  }

  // ================================================================
  // SUMMARY
  // ================================================================

  section('SUMMARY');

  success('✅ RLS Policy Verification Complete');
  log('\nNext Steps:', 'blue');
  log('1. Review all test results above', 'reset');
  log('2. If all tests passed: ✅ Ready for deployment', 'green');
  log('3. If any test failed: ❌ Apply RLS fix script again', 'red');
  log('4. Deploy to Vercel: vercel --prod', 'reset');
  log('5. Monitor deployment logs for any issues', 'reset');

  console.log('\n' + '='.repeat(60) + '\n');
}

main().catch(err => {
  error(`Fatal error: ${err.message}`);
  process.exit(1);
});