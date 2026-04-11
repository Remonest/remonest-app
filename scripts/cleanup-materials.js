import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Delete duplicates and junk (404 pages)
const idsToDelete = [
  '28cff7e2-a3ea-46be-af62-49e595399a5a',  // duplicate buffer
  '78b64d0c-58c7-42f7-960e-299bb88eefa8',  // duplicate buffer (keep this one instead)
  'e0795c56-9463-4079-aae1-ded599949074',  // hubspot 404
  '33ef0f47-56cf-4aca-addf-e91806650b7a',  // hubspot 404
];

console.log('🗑️  Cleaning up junk materials...\n');

for (const id of idsToDelete) {
  const { error } = await supabase.from('learning_materials').delete().eq('id', id);
  if (error) {
    console.log(`  ❌ Failed to delete ${id}: ${error.message}`);
  } else {
    console.log(`  ✅ Deleted ${id}`);
  }
}

// Verify remaining
const { data, error } = await supabase
  .from('learning_materials')
  .select('id, title, content')
  .order('created_at');

console.log(`\n📊 Remaining: ${data?.length || 0} materials\n`);
data?.forEach((m, i) => {
  console.log(`${i + 1}. ${m.title} (${m.content?.length || 0} chars)`);
});
