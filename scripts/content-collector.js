// File: scripts/content-collector.js
// Install dependencies: npm install node-fetch cheerio openai dotenv @supabase/supabase-js

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import puppeteer from 'puppeteer';

dotenv.config({ path: '.env.local' });

// Inisialisasi — USE SERVICE ROLE KEY to bypass RLS for server-side inserts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

if (!openai) {
  console.warn('⚠️  OPENAI_API_KEY not set — AI summarization/generation will be skipped');
}

// Topik yang akan dicari — maps to existing learning_modules
// Buffer.com is the only reliably scrapable site found so far
const TOPICS = [
  {
    moduleSlug: 'remote-working-basics',
    module: 'Remote Working Basics',
    keywords: ['remote work', 'collaboration tools', 'productivity'],
    sourceUrls: [
      'https://buffer.com/resources/remote-work/',
    ]
  },
  {
    moduleSlug: 'skill-freelance',
    module: 'Skill Freelance',
    keywords: ['freelance portfolio', 'freelancer tips', 'freelance career'],
    sourceUrls: [
      'https://buffer.com/resources/freelance-tips/',
    ]
  },
];

// Fungsi scraping konten dari URL — dual mode: cheerio first, Puppeteer fallback
async function scrapeContent(url) {
  // === MODE 1: Try lightweight cheerio + node-fetch ===
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html);
      $('script, style, nav, footer, header, aside, .ad, .advertisement, .cookie-banner, .sidebar, .popup').remove();
      
      let content = '';
      const article = $('article').first();
      if (article.length) {
        content = article.text();
      } else {
        const main = $('main').first();
        content = main.length ? main.text() : $('body').text();
      }
      
      content = content.replace(/\n\s*\n/g, '\n').replace(/\t/g, ' ').trim();
      
      // If cheerio got meaningful content, use it
      if (content.length > 500) {
        const title = $('h1').first().text().trim() || $('title').text().trim();
        console.log(`  ✅ Cheerio succeeded (${content.length} chars)`);
        return { title, content, url };
      }
      
      console.log(`  ⚠️  Cheerio got short content (${content.length} chars), trying Puppeteer...`);
    } else {
      console.log(`  ⚠️  HTTP ${response.status}, trying Puppeteer...`);
    }
  } catch (error) {
    console.log(`  ⚠️  Cheerio failed: ${error.message}, trying Puppeteer...`);
  }

  // === MODE 2: Use Puppeteer for JS-rendered pages ===
  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate with wait for network idle (ensures JS renders)
    const navResponse = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    if (!navResponse || !navResponse.ok()) {
      console.log(`  ❌ Puppeteer got HTTP ${navResponse?.status() || 'unknown'}`);
      return null;
    }

    // Wait a bit more for lazy-loaded content
    await new Promise(r => setTimeout(r, 2000));

    // Try to get article content with multiple selectors
    const content = await page.evaluate(() => {
      // Try article tag first
      let el = document.querySelector('article');
      // Try main content area
      if (!el) el = document.querySelector('main');
      // Try content divs
      if (!el) el = document.querySelector('.content, .article, .post, .entry, .article-body');
      // Fallback to body
      if (!el) el = document.body;
      
      // Remove non-content elements
      el.querySelectorAll('script, style, nav, footer, header, aside, .ad, .sidebar, .popup, .cookie-banner, .newsletter, .comments').forEach(e => e.remove());
      
      return el.innerText;
    });

    const title = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.innerText.trim() : document.title.trim();
    });

    const cleaned = content.replace(/\n\s*\n/g, '\n').trim();

    if (cleaned.length < 200) {
      console.log(`  ⚠️  Puppeteer got short content (${cleaned.length} chars)`);
      return null;
    }

    console.log(`  ✅ Puppeteer succeeded (${cleaned.length} chars)`);
    return { title, content: cleaned, url };

  } catch (error) {
    console.error(`  ❌ Puppeteer failed: ${error.message}`);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

// Fungsi summarization dengan OpenAI
async function summarizeContent(content) {
  if (!openai) return null;

  const prompt = `
Anda adalah asisten yang ahli dalam merangkum konten pembelajaran.

Tugas:
1. Rangkum konten berikut dalam Bahasa Indonesia
2. Buat ringkasan yang komprehensif namun mudah dipahami
3. Highlight poin-poin penting

Konten:
${content.substring(0, 15000)}

Berikan output dalam format JSON:
{
  "summary": "Ringkasan eksekutif 150-200 kata",
  "keyPoints": ["poin 1", "poin 2", "poin 3"],
  "estimatedReadingTime": 5
}
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'Anda adalah asisten yang membantu merangkum konten edukasi.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('  ❌ Error summarizing:', error.message);
    return null;
  }
}

// Fungsi generate full content dengan AI
async function generateLearningContent(topic, scrapedData) {
  if (!openai) return null;

  const prompt = `
Buatkan materi pembelajaran komprehensif dalam Bahasa Indonesia dengan struktur berikut:

**TOPIK:** ${topic.module}
**KONTEKS SUMBER:**
Judul: ${scrapedData.title}
URL: ${scrapedData.url}

Gunakan informasi dari sumber di atas sebagai referensi, tapi kembangkan menjadi materi orisinal yang lebih mendalam.

STRUKTUR YANG DIMINTA:
1. Judul Artikel
2. Ringkasan Eksekutif (150-200 kata)
3. Konten Utama dengan sub-bab:
   - Pengertian dan Konsep Dasar
   - Penjelasan Mendalam
   - Implementasi Praktis (step-by-step)
   - Studi Kasus/Contoh Nyata
   - Action Plan
4. Kesimpulan (100-150 kata)
5. Daftar Istilah Penting (5-10 istilah)
6. Rekomendasi Tools/Resources

REQUIREMENTS:
- Bahasa Indonesia yang formal dan mudah dipahami
- Minimal 1500 kata
- Gunakan heading H2 (##) dan H3 (###)
- Sertakan bullet points dan numbered list
- Tone: Edukatif dan motivatif
- Relevan untuk freelancer Indonesia

Output dalam format Markdown.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'Anda adalah instructional designer ahli.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 4000
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('  ❌ Error generating content:', error.message);
    return null;
  }
}

// Fungsi simpan ke Supabase — uses module_id NOT lesson_id
async function saveToDatabase(moduleId, data) {
  const { data: inserted, error } = await supabase
    .from('learning_materials')
    .insert({
      module_id: moduleId,
      title: data.title,
      content: data.content,
      summary: data.summary,
      source_url: data.source_url,
      source_type: data.source_type || 'article',
      language: 'id',
      reading_time_minutes: data.reading_time || 5,
      difficulty: data.difficulty || 'beginner',
      tags: data.tags || [],
      is_published: false
    })
    .select();

  if (error) {
    console.error(`  ❌ DB Error: ${error.message}`);
    return null;
  }

  return inserted[0];
}

// Main execution
async function collectAndGenerateContent() {
  console.log('🚀 Starting content collection and generation...\n');

  for (const topic of TOPICS) {
    console.log(`📚 Processing: ${topic.module} (slug: ${topic.moduleSlug})`);
    
    // Step 1: Get module_id from learning_modules
    const { data: module, error: modErr } = await supabase
      .from('learning_modules')
      .select('id, title, slug')
      .eq('slug', topic.moduleSlug)
      .single();

    if (modErr || !module) {
      console.log(`  ⚠️  Module not found: ${topic.moduleSlug}. Creating it first...`);
      
      // Create the module if it doesn't exist
      const { data: newModule, error: createErr } = await supabase
        .from('learning_modules')
        .insert({
          slug: topic.moduleSlug,
          title: topic.module,
          category: 'career',
          description: `Modul pembelajaran tentang ${topic.module}`,
          content: `# ${topic.module}\n\nMateri pembelajaran untuk ${topic.module}.`,
          status: 'published',
          duration_min: 30,
        })
        .select()
        .single();

      if (createErr || !newModule) {
        console.log(`  ❌ Failed to create module: ${createErr?.message}`);
        continue;
      }

      console.log(`  ✅ Created module: ${newModule.id}`);
      module = newModule;
    }

    console.log(`  📦 Module ID: ${module.id}`);

    // Step 2: Process each source URL
    for (const url of topic.sourceUrls) {
      console.log(`  🔍 Scraping: ${url}`);
      
      const scrapedData = await scrapeContent(url);
      if (!scrapedData) {
        console.log(`  ⏭️  Skipping ${url}`);
        continue;
      }

      console.log(`  📄 Scraped: ${scrapedData.title} (${scrapedData.content.length} chars)`);

      // Step 3: Summarize
      let summary = null;
      if (openai) {
        console.log(`  🤖 Summarizing...`);
        summary = await summarizeContent(scrapedData.content);
      } else {
        console.log(`  ⏭️  Skipping AI summary (no OPENAI_API_KEY)`);
        // Fallback: create a simple summary from first paragraph
        const firstSentences = scrapedData.content.split('. ').slice(0, 3).join('. ') + '.';
        summary = { summary: firstSentences, estimatedReadingTime: Math.max(1, Math.ceil(scrapedData.content.length / 1000)) };
      }

      // Step 4: Generate full content
      let fullContent = null;
      if (openai) {
        console.log(`  ✍️  Generating full content...`);
        fullContent = await generateLearningContent(topic, scrapedData);
      } else {
        console.log(`  ⏭️  Skipping AI generation (no OPENAI_API_KEY), using raw content`);
        // Fallback: use raw scraped content as markdown
        fullContent = `# ${scrapedData.title}\n\n${scrapedData.content}`;
      }

      if (!fullContent) {
        console.log(`  ⚠️  No content generated, skipping`);
        continue;
      }

      // Step 5: Save to database
      console.log(`  💾 Saving to database...`);
      const saved = await saveToDatabase(module.id, {
        title: scrapedData.title || `Materi: ${topic.module}`,
        content: fullContent,
        summary: summary?.summary || scrapedData.content.substring(0, 300),
        source_url: url,
        source_type: 'article',
        reading_time: summary?.estimatedReadingTime || 5,
        tags: topic.keywords,
        difficulty: 'beginner',
      });

      if (saved) {
        console.log(`  ✅ Saved! ID: ${saved.id}\n`);
      } else {
        console.log(`  ❌ Failed to save\n`);
      }
    }
  }

  console.log('\n🎉 Content collection completed!');
}

// Run
collectAndGenerateContent().catch(console.error);
