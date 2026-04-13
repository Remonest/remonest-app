-- ================================================================
-- Demo Learning Module: "Dasar-Dasar Remote Working"
-- ================================================================
-- This script creates ONE complete learning module with:
--   - Module record (published)
--   - 4 lessons (article, video, exercise, quiz)
--   - 3 learning materials
--   - 1 learning resource
--   - 1 quiz config with 5 questions
--   - Auto-completes the module for the first admin user found
--
-- PURPOSE: End-to-end demo flow
--   1. Browse → see module on /learning
--   2. Enroll → click "Enroll" on /learning/dasar-remote-working
--   3. Complete → progress goes to 100%
--   4. Certificate → generated at /certificates/[id]
--   5. Download → PNG via html2canvas
--   6. Verify → /verify/RMN-2026-XXXXX (public, no auth)
--
-- CLEANUP: See docs/guides/demo-learning-module.md
-- ================================================================

BEGIN;

-- 1. Create the module
DO $$
DECLARE
  v_module_id UUID;
  v_material_1 UUID;
  v_material_2 UUID;
  v_material_3 UUID;
  v_resource_1 UUID;
  v_quiz_id UUID;
  v_user_id UUID;
BEGIN

  -- Create module
  INSERT INTO learning_modules (
    slug,
    title,
    description,
    category,
    content,
    thumbnail_url,
    duration_min,
    status,
    difficulty_level
  ) VALUES (
    'dasar-remote-working',
    'Dasar-Dasar Remote Working',
    'Pelajari fundamental kerja remote: komunikasi异步, manajemen waktu, tool kolaborasi, dan etika profesional. Modul ini cocok untuk freelancer pemula yang ingin memulai karier remote.',
    'communication',
    '# Dasar-Dasar Remote Working

Remote working telah mengubah cara jutaan orang bekerja di seluruh dunia. Modul ini akan membekali Anda dengan fondasi yang kuat untuk sukses sebagai pekerja remote.

## Apa yang Akan Anda Pelajari

- Memahami apa itu remote working dan perbedaannya dengan kerja tradisional
- Mengelola waktu dan produktivitas secara efektif
- Menggunakan tool kolaborasi utama (Slack, Notion, Zoom)
- Menjaga work-life balance
- Etika komunikasi async profesional',
    'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop',
    30,
    'published',
    'beginner'
  ) RETURNING id INTO v_module_id;

  RAISE NOTICE 'Created module: %', v_module_id;

  -- 2. Create learning materials

  -- Material 1: Article
  INSERT INTO learning_materials (
    module_id,
    title,
    content,
    summary,
    source_url,
    source_type,
    language,
    reading_time_minutes,
    difficulty,
    tags,
    order_index,
    is_published
  ) VALUES (
    v_module_id,
    'Apa Itu Remote Working?',
    '<h2>Pengertian Remote Working</h2>
<p>Remote working (kerja jarak jauh) adalah model kerja di mana karyawan tidak perlu datang ke kantor fisik. Mereka bekerja dari rumah, co-working space, atau lokasi manapun yang memiliki koneksi internet.</p>

<h2>Perbedaan dengan Kerja Tradisional</h2>
<ul>
  <li><strong>Lokasi fleksibel</strong> — Tidak terikat satu tempat</li>
  <li><strong>Jadwal lebih lentur</strong> — Fokus pada output, bukan jam kerja</li>
  <li><strong>Komunikasi async</strong> — Tidak harus real-time</li>
</ul>

<h2>Keuntungan Remote Working</h2>
<ol>
  <li>Hemat waktu & biaya transportasi</li>
  <li>Lebih produktif — minim distraksi kantor</li>
  <li>Work-life balance lebih baik</li>
  <li>Akses ke klien global</li>
</ol>',
    'Pengenalan remote working: definisi, perbedaan dengan kerja tradisional, dan keuntungan utama.',
    NULL,
    'article',
    'id',
    8,
    'beginner',
    ARRAY['remote work', 'freelance', 'dasar'],
    1,
    true
  ) RETURNING id INTO v_material_1;

  RAISE NOTICE 'Created material 1: %', v_material_1;

  -- Material 2: Article
  INSERT INTO learning_materials (
    module_id,
    title,
    content,
    summary,
    source_url,
    source_type,
    language,
    reading_time_minutes,
    difficulty,
    tags,
    order_index,
    is_published
  ) VALUES (
    v_module_id,
    'Manajemen Waktu & Produktivitas',
    '<h2>Mengelola Waktu di Rumah</h2>
<p>Bekerja dari rumah membutuhkan disiplin. Berikut teknik yang terbukti efektif:</p>

<h3>Time Blocking</h3>
<p>Bagi hari Anda menjadi blok-blok waktu:</p>
<ul>
  <li><strong>09:00-11:00</strong> — Deep work (tugas berat)</li>
  <li><strong>11:00-12:00</strong> — Meeting & komunikasi</li>
  <li><strong>13:00-15:00</strong> — Deep work sesi 2</li>
  <li><strong>15:00-16:00</strong> — Admin & review</li>
</ul>

<h3>Teknik Pomodoro</h3>
<p>Kerja 25 menit, istirahat 5 menit. Setelah 4 siklus, istirahat panjang 15-30 menit.</p>

<h3>Tips Tambahan</h3>
<ul>
  <li>Siapkan workspace khusus</li>
  <li>Gunakan noise-cancelling headphone</li>
  <li>Matikan notifikasi non-urgent saat deep work</li>
</ul>',
    'Teknik manajemen waktu: time blocking, Pomodoro, dan tips produktivitas remote worker.',
    NULL,
    'article',
    'id',
    10,
    'beginner',
    ARRAY['produktivitas', 'time management', 'pomodoro'],
    2,
    true
  ) RETURNING id INTO v_material_2;

  RAISE NOTICE 'Created material 2: %', v_material_2;

  -- Material 3: Video
  INSERT INTO learning_materials (
    module_id,
    title,
    content,
    summary,
    source_url,
    source_type,
    language,
    reading_time_minutes,
    difficulty,
    tags,
    order_index,
    is_published
  ) VALUES (
    v_module_id,
    'Tool Kolaborasi: Slack, Notion & Zoom',
    '<h2>Tool Wajib untuk Remote Worker</h2>

<h3>Slack — Komunikasi Tim</h3>
<p>Gunakan channel terpisah per topik. Manfaatkan thread agar percakapan tetap terorganisir.</p>

<h3>Notion — Knowledge Base</h3>
<p>Sentralisasi dokumentasi, SOP, dan catatan meeting di satu tempat.</p>

<h3>Zoom — Video Meeting</h3>
<p>Standar untuk meeting virtual. Selalu nyalakan kamera untuk komunikasi lebih personal.</p>',
    'Panduan penggunaan Slack, Notion, dan Zoom untuk kolaborasi remote.',
    NULL,
    'tutorial',
    'id',
    5,
    'beginner',
    ARRAY['slack', 'notion', 'zoom', 'tools'],
    3,
    true
  ) RETURNING id INTO v_material_3;

  RAISE NOTICE 'Created material 3: %', v_material_3;

  -- 3. Create learning resource
  INSERT INTO learning_resources (
    module_id,
    title,
    description,
    url,
    resource_type,
    is_free
  ) VALUES (
    v_module_id,
    'Remote Work Starter Kit (Notion Template)',
    'Template Notion siap pakai: daily planner, project tracker, dan meeting notes — khusus untuk remote worker.',
    'https://www.notion.so/templates',
    'template',
    true
  ) RETURNING id INTO v_resource_1;

  RAISE NOTICE 'Created resource 1: %', v_resource_1;

  -- 4. Create lessons (ordered)

  -- Lesson 1: Article → Material 1
  INSERT INTO module_lessons (
    module_id,
    title,
    description,
    order_index,
    lesson_type,
    material_id,
    duration_minutes,
    is_preview
  ) VALUES (
    v_module_id,
    'Apa Itu Remote Working?',
    'Memahami konsep dasar remote working',
    1,
    'article',
    v_material_1,
    8,
    true
  );

  -- Lesson 2: Article → Material 2
  INSERT INTO module_lessons (
    module_id,
    title,
    description,
    order_index,
    lesson_type,
    material_id,
    duration_minutes,
    is_preview
  ) VALUES (
    v_module_id,
    'Manajemen Waktu & Produktivitas',
    'Teknik time blocking dan Pomodoro',
    2,
    'article',
    v_material_2,
    10,
    false
  );

  -- Lesson 3: Article → Material 3
  INSERT INTO module_lessons (
    module_id,
    title,
    description,
    order_index,
    lesson_type,
    material_id,
    duration_minutes,
    is_preview
  ) VALUES (
    v_module_id,
    'Tool Kolaborasi',
    'Slack, Notion, dan Zoom untuk remote work',
    3,
    'article',
    v_material_3,
    5,
    false
  );

  -- Lesson 4: Quiz → linked to quiz_config (created below)

  -- 5. Create quiz config
  INSERT INTO quiz_configs (
    module_id,
    title,
    description,
    duration_minutes,
    passing_grade,
    is_published
  ) VALUES (
    v_module_id,
    'Kuis: Dasar-Dasar Remote Working',
    'Uji pemahaman Anda tentang fundamental remote working. Minimal 70% untuk lulus.',
    10,
    70,
    true
  ) RETURNING id INTO v_quiz_id;

  RAISE NOTICE 'Created quiz: %', v_quiz_id;

  -- Link quiz to lesson 4
  INSERT INTO module_lessons (
    module_id,
    title,
    description,
    order_index,
    lesson_type,
    quiz_config_id,
    duration_minutes,
    is_preview
  ) VALUES (
    v_module_id,
    'Kuis Akhir',
    'Uji pemahaman — minimal 70% untuk lulus',
    4,
    'quiz',
    v_quiz_id,
    10,
    false
  );

  -- 6. Create quiz questions
  INSERT INTO questions (quiz_config_id, question_text, options, correct_answer, explanation, difficulty, order_index)
  VALUES
    (
      v_quiz_id,
      'Apa keuntungan utama remote working?',
      '{"A": "Harus datang ke kantor setiap hari", "B": "Hemat waktu & biaya transportasi, lebih produktif", "C": "Tidak perlu berkomunikasi sama sekali", "D": "Gaji lebih rendah", "E": "Tidak ada tantangan"}',
      'B',
      'Remote working menghemat waktu transportasi dan banyak studi menunjukkan peningkatan produktivitas karena minim distraksi kantor.',
      'easy',
      1
    ),
    (
      v_quiz_id,
      'Teknik Pomodoro menggunakan siklus kerja berapa menit?',
      '{"A": "15 menit", "B": "20 menit", "C": "25 menit", "D": "45 menit", "E": "60 menit"}',
      'C',
      'Teknik Pomodoro standar: kerja fokus 25 menit, istirahat 5 menit.',
      'easy',
      2
    ),
    (
      v_quiz_id,
      'Tool mana yang paling cocok untuk komunikasi async tim?',
      '{"A": "WhatsApp personal", "B": "Slack", "C": "Surat pos", "D": "Telepon rumah", "E": "Fax"}',
      'B',
      'Slack dirancang khusus untuk komunikasi tim async dengan channel dan thread yang terorganisir.',
      'easy',
      3
    ),
    (
      v_quiz_id,
      'Apa arti "komunikasi async"?',
      '{"A": "Komunikasi tatap muka", "B": "Komunikasi yang harus dijawab dalam 1 menit", "C": "Komunikasi real-time via telepon", "D": "Komunikasi yang tidak memerlukan respons instan", "E": "Komunikasi hanya via emoji"}',
      'D',
      'Async (asynchronous) communication = pesan dikirim dan penerima membalas saat tersedia, tidak harus langsung.',
      'medium',
      4
    ),
    (
      v_quiz_id,
      'Berapa passing grade untuk lulus kuis modul ini?',
      '{"A": "50%", "B": "60%", "C": "70%", "D": "80%", "E": "90%"}',
      'C',
      'Passing grade modul ini adalah 70%. Anda harus menjawab minimal 70% soal dengan benar.',
      'easy',
      5
    );

  RAISE NOTICE 'Created 5 quiz questions';

  -- 7. Auto-complete for first admin user (so certificate can be generated)
  SELECT id INTO v_user_id
  FROM user_profiles
  WHERE role = 'admin'
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Create progress and mark as completed
    INSERT INTO user_learning_progress (
      user_id,
      module_id,
      progress,
      started_at,
      completed_at
    ) VALUES (
      v_user_id,
      v_module_id,
      100,
      NOW() - INTERVAL '2 hours',
      NOW()
    )
    ON CONFLICT (user_id, module_id) DO UPDATE SET
      progress = 100,
      completed_at = NOW();

    RAISE NOTICE 'Auto-completed module for admin user: %', v_user_id;
  ELSE
    RAISE NOTICE 'No admin user found — skip auto-completion. Enroll manually to generate certificate.';
  END IF;

END $$;

COMMIT;
