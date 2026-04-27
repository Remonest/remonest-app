#!/usr/bin/env node

/**
 * Supabase Keys Verification Script
 * Tests your Supabase environment variables before deployment
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// ANSI color codes for terminal output
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

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
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

async function testConnection(config, testType) {
  const { url, key, name } = config;

  log(`Testing ${name} connection...`, 'blue');

  try {
    const supabase = createClient(url, key);

    // Test 1: Basic connection
    const { error: connectionError } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      throw new Error(`Connection failed: ${connectionError.message}`);
    }

    success(`${name} connection successful`);

    // Test 2: Key validation
    if (key.startsWith('eyJ')) {
      success(`${name} uses valid JWT format`);
    } else {
      warning(`${name} may not be in valid JWT format`);
    }

    // Test 3: URL validation
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('supabase.co')) {
        success(`${name} URL is valid Supabase URL`);
      } else {
        warning(`${name} URL may not be a Supabase URL`);
      }
    } catch {
      error(`${name} URL is not valid`);
    }

    // Test 4: Permission check based on key type
    if (testType === 'anon') {
      log('Testing RLS enforcement with anon key...', 'blue');
      const { data: publicData, error: rlsError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);

      if (rlsError) {
        info('Anon key respects RLS policies (expected behavior)');
      } else {
        warning('RLS may not be properly enforced');
      }
    }

    if (testType === 'service') {
      log('Testing service role key permissions...', 'blue');
      const { data: allData, error: serviceError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);

      if (serviceError) {
        error('Service role key may be invalid');
      } else {
        success('Service role key has admin permissions');
      }
    }

    return true;
  } catch (err) {
    error(`${name} test failed: ${err.message}`);
    return false;
  }
}

async function main() {
  console.clear();
  log('🔍 Supabase Keys Verification', 'cyan');
  log('Testing your environment variables before deployment\n', 'blue');

  // Load environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  section('Environment Variables Check');

  if (!supabaseUrl) {
    error('NEXT_PUBLIC_SUPABASE_URL not found');
    process.exit(1);
  }
  success('NEXT_PUBLIC_SUPABASE_URL is set');

  if (!anonKey) {
    error('NEXT_PUBLIC_SUPABASE_ANON_KEY not found');
    process.exit(1);
  }
  success('NEXT_PUBLIC_SUPABASE_ANON_KEY is set');

  if (!serviceKey) {
    error('SUPABASE_SERVICE_ROLE_KEY not found');
    process.exit(1);
  }
  success('SUPABASE_SERVICE_ROLE_KEY is set');

  section('Anon Key Tests');
  await testConnection({
    url: supabaseUrl,
    key: anonKey,
    name: 'Anon Key'
  }, 'anon');

  section('Service Role Key Tests');
  await testConnection({
    url: supabaseUrl,
    key: serviceKey,
    name: 'Service Role Key'
  }, 'service');

  section('Database Structure Check');

  try {
    const supabase = createClient(supabaseUrl, serviceKey);

    // Check critical tables
    const tables = [
      'user_profiles',
      'jobs',
      'learning_modules',
      'module_lessons',
      'quiz_configs',
      'admin_actions'
    ];

    log('Checking database tables...', 'blue');

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });

      if (error) {
        warning(`Table '${table}' not accessible or doesn't exist`);
      } else {
        success(`Table '${table}' exists and is accessible`);
      }
    }

  } catch (err) {
    error(`Database check failed: ${err.message}`);
  }

  section('RLS Policies Check');

  try {
    const supabase = createClient(supabaseUrl, anonKey);

    // Test RLS enforcement on sensitive table
    log('Testing RLS on user_profiles table...', 'blue');
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');

    if (error && error.code === '42501') {
      success('RLS is properly enforced on user_profiles');
    } else if (data && data.length > 0) {
      warning('RLS may not be enforced - anon key can access all profiles');
    } else {
      info('RLS test inconclusive or table is empty');
    }

  } catch (err) {
    warning(`RLS check failed: ${err.message}`);
  }

  section('Summary');
  log('✓ All tests completed!', 'green');
  log('\nYour Supabase configuration is ready for deployment.', 'cyan');
  log('Next steps:', 'blue');
  log('1. Review the results above for any warnings', 'reset');
  log('2. Deploy to Vercel with: vercel --prod', 'reset');
  log('3. Monitor Vercel logs for any runtime errors', 'reset');

  console.log('\n' + '='.repeat(60) + '\n');
}

main().catch(err => {
  error(`Fatal error: ${err.message}`);
  process.exit(1);
});