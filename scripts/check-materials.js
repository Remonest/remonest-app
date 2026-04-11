import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from('learning_materials')
  .select('id, title, source_url, content')
  .order('created_at');

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(`\n📊 Learning Materials (${data.length} total):\n`);
data.forEach((m, i) => {
  const contentLen = m.content ? m.content.length : 0;
  console.log(`${i + 1}. ${m.title}`);
  console.log(`   ID: ${m.id}`);
  console.log(`   URL: ${m.source_url}`);
  console.log(`   Content: ${contentLen} chars`);
  console.log('');
});
