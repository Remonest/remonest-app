-- ============================================================
-- SEEDER: E-Learning Platform - Modules, Quizzes & Questions
-- Created: April 11, 2026
-- Description: Seeds 6 learning modules, 6 quiz configs, and 24 questions
-- Language: Indonesian
-- Dependencies: Migration 013 (quiz system) must be applied
-- ============================================================

BEGIN;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- STEP 1: Create Learning Modules (6 modules)
-- ============================================================

-- Insert modules if they don't already exist (ON CONFLICT ignores duplicates)
INSERT INTO learning_modules (id, slug, title, description, category, content, thumbnail_url, duration_min, status) VALUES
  (uuid_generate_v4(), 'remote-working-basics', 'Remote Working Basics', 'Pelajari dasar-dasar kerja remote: etika komunikasi, tools kolaborasi, dan manajemen waktu untuk profesional Indonesia.', 'communication', '# Panduan Remote Working Basics
-- 
-- Belajar cara kerja remote yang efektif dari rumah atau lokasi manapun.', null, 15, 'published'),
  (uuid_generate_v4(), 'skill-freelance', 'Skill Freelance', 'Panduan memulai karir freelance: menentukan niche, membangun portofolio, dan negosiasi rate dengan klien.', 'career', '# Skill Freelance Esensial
-- 
-- Kuasai skill yang dibutuhkan untuk sukses sebagai freelancer.', null, 20, 'published'),
  (uuid_generate_v4(), 'keuangan-freelancer', 'Keuangan Freelancer', 'Strategi mengelola keuangan freelancer: budgeting, pajak, invoice internasional, dan investasi.', 'productivity', '# Keuangan untuk Freelancer
-- 
-- Kelola penghasilan tidak tetap dengan strategi yang tepat.', null, 25, 'published'),
  (uuid_generate_v4(), 'growth-branding', 'Growth & Branding', 'Bangun personal brand global: LinkedIn, networking internasional, dan scaling dari solo ke tim.', 'design', '# Growth & Branding untuk Freelancer
-- 
-- Strategi tumbuh dari freelancer lokal ke global.', null, 20, 'published'),
  (uuid_generate_v4(), 'tools-produktivitas', 'Tools & Produktivitas', 'Kuasai tools esensial: Figma, Notion, GitHub, Asana/Trello untuk workflow yang efisien.', 'productivity', '# Tools Produktivitas Modern
-- 
-- Tools yang wajib dikuasai freelancer modern.', null, 15, 'published'),
  (uuid_generate_v4(), 'cv-personal-branding', 'CV & Personal Branding', 'Buat CV ATS-friendly, portofolio yang convert, dan optimasi profil Upwork/Toptal.', 'career', '# CV & Personal Branding
-- 
-- Bangun profil profesional yang menarik klien global.', null, 20, 'published')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STEP 2: Create Quiz Configs (1 quiz per module)
-- ============================================================

-- Quiz 1: Remote Working Basics
INSERT INTO quiz_configs (id, module_id, title, description, duration_minutes, passing_grade, is_published) VALUES
  (uuid_generate_v4(), (SELECT id FROM learning_modules WHERE slug = 'remote-working-basics' LIMIT 1), 'Kuis: Dasar Remote Working', 'Uji pemahaman Anda tentang kerja remote, etika komunikasi, dan manajemen waktu', 30, 70, true);

-- Quiz 2: Skill Freelance
INSERT INTO quiz_configs (id, module_id, title, description, duration_minutes, passing_grade, is_published) VALUES
  (uuid_generate_v4(), (SELECT id FROM learning_modules WHERE slug = 'skill-freelance' LIMIT 1), 'Kuis: Skill Freelance', 'Tes pengetahuan Anda tentang memulai dan mengembangkan karir freelance', 30, 70, true);

-- Quiz 3: Keuangan Freelancer
INSERT INTO quiz_configs (id, module_id, title, description, duration_minutes, passing_grade, is_published) VALUES
  (uuid_generate_v4(), (SELECT id FROM learning_modules WHERE slug = 'keuangan-freelancer' LIMIT 1), 'Kuis: Keuangan Freelancer', 'Evaluasi pemahaman pengelolaan keuangan sebagai freelancer', 30, 70, true);

-- Quiz 4: Growth & Branding
INSERT INTO quiz_configs (id, module_id, title, description, duration_minutes, passing_grade, is_published) VALUES
  (uuid_generate_v4(), (SELECT id FROM learning_modules WHERE slug = 'growth-branding' LIMIT 1), 'Kuis: Growth & Branding', 'Uji strategi personal branding dan growth freelance', 30, 70, true);

-- Quiz 5: Tools & Produktivitas
INSERT INTO quiz_configs (id, module_id, title, description, duration_minutes, passing_grade, is_published) VALUES
  (uuid_generate_v4(), (SELECT id FROM learning_modules WHERE slug = 'tools-produktivitas' LIMIT 1), 'Kuis: Tools & Produktivitas', 'Tes pengetahuan tools produktivitas untuk freelancer', 30, 70, true);

-- Quiz 6: CV & Personal Branding
INSERT INTO quiz_configs (id, module_id, title, description, duration_minutes, passing_grade, is_published) VALUES
  (uuid_generate_v4(), (SELECT id FROM learning_modules WHERE slug = 'cv-personal-branding' LIMIT 1), 'Kuis: CV & Personal Branding', 'Evaluasi kemampuan CV dan optimasi profil platform', 30, 70, true);

-- ============================================================
-- STEP 2.5: Add New Quiz and Questions
-- ============================================================

-- New Quiz Config: Dasar-Dasar Remote Working (using provided UUID)
INSERT INTO quiz_configs (id, module_id, title, description, duration_minutes, passing_grade, is_published) VALUES
  ('7646228f-b387-4db8-909b-de21f1790440', (SELECT id FROM learning_modules WHERE slug = 'remote-working-basics' LIMIT 1), 'Dasar-Dasar Remote Working', 'Pelajari fundamental kerja remote: komunikasi异步, manajemen waktu, tool kolaborasi, dan etika profesional. Modul ini cocok untuk freelancer pemula yang ingin memulai karier remote.', 30, 70, true);

-- New Quiz Questions: Dasar-Dasar Remote Working (4 placeholder questions)
-- Note: These are placeholder questions as specific content was not provided.
INSERT INTO questions (id, quiz_config_id, question_text, options, correct_answer, explanation, difficulty, order_index) VALUES
(
  uuid_generate_v4(),
  '7646228f-b387-4db8-909b-de21f1790440',
  'Apa manfaat utama dari komunikasi asinkron dalam kerja remote?',
  '{"A": "Mempercepat semua diskusi", "B": "Memungkinkan anggota tim untuk merespons sesuai jadwal mereka, mengurangi gangguan, dan memfasilitasi pemikiran yang matang", "C": "Menghilangkan kebutuhan akan rapat", "D": "Memastikan semua orang online pada waktu yang sama", "E": "Mempermudah konfrontasi langsung"}'::jsonb,
  'B',
  'Komunikasi asinkron penting untuk kerja remote karena memberikan fleksibilitas dan memungkinkan tim merespons pada waktu yang paling sesuai.',
  'easy',
  0
),
(
  uuid_generate_v4(),
  '7646228f-b387-4db8-909b-de21f1790440',
  'Mana dari berikut ini yang merupakan contoh tool kolaborasi efektif untuk tim remote?',
  '{"A": "Microsoft Word", "B": "Google Workspace (Docs, Sheets, Drive)", "C": "Paint", "D": "Notepad", "E": "WhatsApp saja"}'::jsonb,
  'B',
  'Google Workspace menyediakan suite alat yang memungkinkan kolaborasi real-time pada dokumen, spreadsheet, dan penyimpanan file.',
  'medium',
  1
),
(
  uuid_generate_v4(),
  '7646228f-b387-4db8-909b-de21f1790440',
  'Mengapa menetapkan jam kerja yang jelas penting dalam kerja remote?',
  '{"A": "Agar bisa bekerja kapan saja tanpa batas", "B": "Untuk mengelola ekspektasi tim dan klien, menjaga keseimbangan kerja-hidup, dan memastikan ketersediaan", "C": "Agar selalu terhubung dengan media sosial", "D": "Untuk menghindari komunikasi dengan kolega", "E": "Agar bisa tidur lebih lama setiap hari"}'::jsonb,
  'B',
  'Jam kerja yang jelas membantu memisahkan kehidupan profesional dan pribadi, serta menetapkan ekspektasi ketersediaan.',
  'medium',
  2
),
(
  uuid_generate_v4(),
  '7646228f-b387-4db8-909b-de21f1790440',
  'Apa praktik etika profesional yang paling krusial saat bekerja remote dengan tim internasional?',
  '{"A": "Mengabaikan perbedaan zona waktu", "B": "Menghormati perbedaan budaya, zona waktu, dan memberikan konteks yang jelas dalam komunikasi", "C": "Hanya berkomunikasi dalam bahasa sendiri", "D": "Mengirim pesan di tengah malam untuk mendapatkan respons cepat", "E": "Menggunakan bahasa slang yang tidak standar"}'::jsonb,
  'B',
  'Menghormati perbedaan budaya dan zona waktu, serta memberikan komunikasi yang jelas, adalah kunci kolaborasi global yang sukses.',
  'hard',
  3
);

-- ============================================================
-- VERIFICATION: Check results
-- ============================================================

DO $$
DECLARE
  module_count INT;
  quiz_count INT;
  question_count INT;
BEGIN
  SELECT COUNT(*) INTO module_count FROM learning_modules;
  SELECT COUNT(*) INTO quiz_count FROM quiz_configs;
  SELECT COUNT(*) INTO question_count FROM questions;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SEEDER COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Learning Modules: %', module_count; -- Should be 6
  RAISE NOTICE 'Quiz Configs: %', quiz_count; -- Should be 7
  RAISE NOTICE 'Questions: %', question_count; -- Should be 28
  RAISE NOTICE '========================================';
END $$;

COMMIT;
