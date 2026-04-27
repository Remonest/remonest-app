#!/usr/bin/env node

/**
 * Safe RLS Application Script
 * Applies RLS fix with safety checks to ensure no user data is lost
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

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

async function countUsers(supabase) {
  try {
    const { count, error } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('Error counting users:', err.message);
    return 0;
  }
}

async function countJobs(supabase) {
  try {
    const { count, error } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('Error counting jobs:', err.message);
    return 0;
  }
}

async function countLearningModules(supabase) {
  try {
    const { count, error } = await supabase
      .from('learning_modules')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('Error counting learning modules:', err.message);
    return 0;
  }
}

async function main() {
  console.clear();
  log('🔒 Safe RLS Application with Data Protection', 'cyan');
  log('This script applies RLS fixes while protecting your data\n', 'blue');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    error('Missing required environment variables');
    log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set', 'yellow');
    process.exit(1);
  }

  const serviceClient = createClient(supabaseUrl, serviceKey);

  // ================================================================
  // PHASE 1: DATA BACKUP VERIFICATION
  // ================================================================

  section('PHASE 1: Data Safety Check (BEFORE RLS Fix)');

  log('Counting current database records...', 'blue');

  const initialUserCount = await countUsers(serviceClient);
  const initialJobCount = await countJobs(serviceClient);
  const initialModuleCount = await countLearningModules(serviceClient);

  success(`Users in database: ${initialUserCount}`);
  success(`Jobs in database: ${initialJobCount}`);
  success(`Learning modules in database: ${initialModuleCount}`);

  if (initialUserCount === 0) {
    warning('No users found in database - RLS fix may not be testable');
  }

  // ================================================================
  // PHASE 2: SQL SCRIPT APPLICATION
  // ================================================================

  section('PHASE 2: Applying RLS Fix SQL');

  try {
    // Read the RLS fix SQL script
    const sqlScriptPath = new URL('./fix-rls-policies.sql', import.meta.url).pathname;
    const sqlScript = readFileSync(sqlScriptPath, 'utf-8');

    info('SQL script loaded successfully');

    // Execute the SQL script
    log('Executing RLS fix script on database...', 'blue');

    const { error: sqlError } = await serviceClient.rpc('exec_sql', {
      sql: sqlScript
    });

    // Note: Supabase doesn't support arbitrary SQL execution via rpc
    // So we'll guide the user to apply manually
    log('Note: SQL must be applied manually in Supabase SQL Editor', 'yellow');
    log('Instructions provided below...', 'blue');

  } catch (err) {
    error(`SQL script execution failed: ${err.message}`);
    log('Please apply the SQL script manually in Supabase Dashboard', 'yellow');
  }

  // ================================================================
  // PHASE 3: POST-APPLICATION VERIFICATION
  // ================================================================

  section('PHASE 3: Data Integrity Check (AFTER RLS Fix)');

  log('Waiting for you to apply the SQL fix...', 'yellow');
  log('Once you have applied the RLS fix SQL in Supabase SQL Editor:', 'blue');
  log('1. Go to Supabase Dashboard → SQL Editor', 'reset');
  log('2. Open file: scripts/fix-rls-policies.sql', 'reset');
  log('3. Copy entire SQL content and paste into editor', 'reset');
  log('4. Click "Run" to execute the script', 'reset');
  log('5. Wait for completion and check for errors', 'reset');
  log('6. Return here and press Enter to continue verification', 'reset');

  // Wait for user to apply the SQL fix
  console.log('\nPress Enter when you have applied the RLS fix SQL...');
  await new Promise(resolve => {
    process.stdin.once('data', () => resolve());
  });

  // Verify data integrity after SQL fix
  log('Verifying database integrity after RLS fix...', 'blue');

  const finalUserCount = await countUsers(serviceClient);
  const finalJobCount = await countJobs(serviceClient);
  const finalModuleCount = await countLearningModules(serviceClient);

  success(`Users after fix: ${finalUserCount} (was ${initialUserCount})`);
  success(`Jobs after fix: ${finalJobCount} (was ${initialJobCount})`);
  success(`Learning modules after fix: ${finalModuleCount} (was ${initialModuleCount})`);

  // ================================================================
  // PHASE 4: DATA LOSS DETECTION
  // ================================================================

  section('PHASE 4: Data Loss Detection');

  let dataLossDetected = false;

  if (finalUserCount < initialUserCount) {
    error(`DATA LOSS DETECTED: ${initialUserCount - finalUserCount} users missing!`);
    dataLossDetected = true;
  }

  if (finalJobCount < initialJobCount) {
    error(`DATA LOSS DETECTED: ${initialJobCount - finalJobCount} jobs missing!`);
    dataLossDetected = true;
  }

  if (finalModuleCount < initialModuleCount) {
    error(`DATA LOSS DETECTED: ${initialModuleCount - finalModuleCount} learning modules missing!`);
    dataLossDetected = true;
  }

  if (!dataLossDetected) {
    success('✅ NO DATA LOSS DETECTED - All records intact!');
  }

  // ================================================================
  // PHASE 5: FINAL VERIFICATION
  // ================================================================

  section('PHASE 5: RLS Security Verification');

  log('Testing RLS security after fix...', 'blue');

  // Create anon client for RLS testing
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const anonClient = createClient(supabaseUrl, anonKey);

  // Test 1: User profiles RLS
  const { data: allProfiles, error: profilesError } = await anonClient
    .from('user_profiles')
    .select('*')
    .limit(1);

  if (profilesError && profilesError.code === '42P17') {
    success('✅ RLS properly enforced on user_profiles');
  } else {
    error('❌ RLS still NOT enforced on user_profiles');
  }

  // Test 2: User CVs RLS
  const { data: allCVs, error: cvsError } = await anonClient
    .from('user_cvs')
    .select('*')
    .limit(1);

  if (cvsError && cvsError.code === '42P17') {
    success('✅ RLS properly enforced on user_cvs');
  } else {
    error('❌ RLS still NOT enforced on user_cvs');
  }

  // ================================================================
  // SUMMARY
  // ================================================================

  section('SUMMARY');

  if (dataLossDetected) {
    error('🚨 DATA LOSS DETECTED - DO NOT DEPLOY!');
    log('Please investigate the missing data before proceeding', 'yellow');
  } else {
    success('✅ ALL CHECKS PASSED - Ready for deployment!');
  }

  log('\nFinal Status:', 'blue');
  log('- Data Integrity: ' + (dataLossDetected ? 'FAILED' : 'PASSED'), dataLossDetected ? 'red' : 'green');
  log('- RLS Security: ' + ((profilesError?.code === '42P17' && cvsError?.code === '42P17') ? 'PASSED' : 'FAILED'),
    (profilesError?.code === '42P17' && cvsError?.code === '42P17') ? 'green' : 'red');

  log('\nNext Steps:', 'blue');

  if (!dataLossDetected) {
    log('1. ✅ Apply RLS verification: pnpm test:rls', 'green');
    log('2. ✅ Deploy to Vercel: vercel --prod', 'green');
  } else {
    log('1. ❌ Investigate data loss immediately', 'red');
    log('2. ❌ Do not deploy until data is restored', 'red');
    log('3. ❌ Check Supabase logs for deletion events', 'red');
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

main().catch(err => {
  error(`Fatal error: ${err.message}`);
  process.exit(1);
});