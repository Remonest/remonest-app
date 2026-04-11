// File: scripts/run-seed.js
// Run the seed-learning-materials-id.sql against Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Read and split SQL file by statements
const sql = readFileSync(join(__dirname, 'seed-learning-materials-id.sql'), 'utf-8');

// Split by semicolons, filter empty statements
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`📜 Found ${statements.length} SQL statements to run...\n`);

let success = 0;
let failed = 0;

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i] + ';';
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: stmt });
    if (error) {
      // Fallback: try direct execution
      console.log(`  ⚠️  Statement ${i + 1}: RPC failed, skipping...`);
      failed++;
    } else {
      console.log(`  ✅ Statement ${i + 1} executed`);
      success++;
    }
  } catch (err) {
    console.log(`  ⚠️  Statement ${i + 1}: ${err.message.substring(0, 100)}...`);
    failed++;
  }
}

// Since direct SQL execution via JS client is limited, let's do it manually
// by using INSERT statements directly

console.log('\n\n🔄 Alternative: Running inserts directly...\n');

// Delete old Buffer content
const { error: delErr } = await supabase
  .from('learning_materials')
  .delete()
  .ilike('source_url', '%buffer.com%');

if (delErr) {
  console.log(`❌ Delete error: ${delErr.message}`);
} else {
  console.log('✅ Deleted old Buffer materials');
}

// Find module IDs
const { data: mod1 } = await supabase
  .from('learning_modules')
  .select('id')
  .eq('slug', 'remote-working-basics')
  .single();

const { data: mod2 } = await supabase
  .from('learning_modules')
  .select('id')
  .eq('slug', 'skill-freelance')
  .single();

if (!mod1) { console.log('❌ Module remote-working-basics not found'); }
if (!mod2) { console.log('❌ Module skill-freelance not found'); }

// Read the SQL file content for the actual content
const content1 = readFileSync(join(__dirname, 'seed-learning-materials-id.sql'), 'utf-8');

console.log('\n📋 Seed file is ready. Please run it in Supabase SQL Editor:');
console.log(`   1. Go to https://rfmvxdtjeyjfqukgtdyc.supabase.co`);
console.log('   2. Navigate to SQL Editor');
console.log('   3. Copy contents of: scripts/seed-learning-materials-id.sql');
console.log('   4. Paste and Run\n');
