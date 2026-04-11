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
  (uuid_generate_v4(), 'remote-working-basics', 'Remote Working Basics', 'Pelajari dasar-dasar kerja remote: etika komunikasi, tools kolaborasi, dan manajemen waktu untuk profesional Indonesia.', 'communication', '# Panduan Remote Working Basics\n\nBelajar cara kerja remote yang efektif dari rumah atau lokasi manapun.', null, 15, 'published'),
  (uuid_generate_v4(), 'skill-freelance', 'Skill Freelance', 'Panduan memulai karir freelance: menentukan niche, membangun portofolio, dan negosiasi rate dengan klien.', 'career', '# Skill Freelance Esensial\n\nKuasai skill yang dibutuhkan untuk sukses sebagai freelancer.', null, 20, 'published'),
  (uuid_generate_v4(), 'keuangan-freelancer', 'Keuangan Freelancer', 'Strategi mengelola keuangan freelancer: budgeting, pajak, invoice internasional, dan investasi.', 'productivity', '# Keuangan untuk Freelancer\n\nKelola penghasilan tidak tetap dengan strategi yang tepat.', null, 25, 'published'),
  (uuid_generate_v4(), 'growth-branding', 'Growth & Branding', 'Bangun personal brand global: LinkedIn, networking internasional, dan scaling dari solo ke tim.', 'design', '# Growth & Branding untuk Freelancer\n\nStrategi tumbuh dari freelancer lokal ke global.', null, 20, 'published'),
  (uuid_generate_v4(), 'tools-produktivitas', 'Tools & Produktivitas', 'Kuasai tools esensial: Figma, Notion, GitHub, Asana/Trello untuk workflow yang efisien.', 'productivity', '# Tools Produktivitas Modern\n\nTools yang wajib dikuasai freelancer modern.', null, 15, 'published'),
  (uuid_generate_v4(), 'cv-personal-branding', 'CV & Personal Branding', 'Buat CV ATS-friendly, portofolio yang convert, dan optimasi profil Upwork/Toptal.', 'career', '# CV & Personal Branding\n\nBangun profil profesional yang menarik klien global.', null, 20, 'published')
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
-- STEP 3: Insert Questions (4 per quiz = 24 total)
-- ============================================================

-- QUIZ 1: Remote Working Basics (4 questions)

INSERT INTO questions (id, quiz_config_id, question_text, options, correct_answer, explanation, difficulty, order_index) VALUES
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Dasar Remote Working' LIMIT 1),
  'Apa yang dimaksud dengan kerja remote?',
  '{"A": "Bekerja dari kantor pusat setiap hari", "B": "Bekerja dari lokasi di luar kantor tradisional menggunakan teknologi digital", "C": "Bekerja hanya di akhir pekan", "D": "Bekerja lembur tanpa batas waktu", "E": "Bekerja paruh waktu di dua perusahaan"}'::jsonb,
  'B',
  'Kerja remote atau kerja jarak jauh memungkinkan profesional bekerja dari lokasi fleksibel seperti rumah, co-working space, atau mana saja dengan koneksi internet.',
  'easy',
  0
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Dasar Remote Working' LIMIT 1),
  'Apa prinsip utama etika komunikasi dalam kerja remote lintas zona waktu?',
  '{"A": "Menunggu balasan real-time sebelum melanjutkan pekerjaan", "B": "Mengirim pesan tanpa konteks agar singkat", "C": "Menulis pesan dengan konteks lengkap, ekspektasi respons yang jelas, dan menghormati jadwal kerja rekan tim", "D": "Hanya berkomunikasi melalui panggilan video", "E": "Menghindari komunikasi tertulis agar efisien"}'::jsonb,
  'C',
  'Komunikasi async yang efektif memerlukan konteks lengkap, deadline jelas, dan penghormatan terhadap perbedaan zona waktu.',
  'easy',
  1
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Dasar Remote Working' LIMIT 1),
  'Manakah kombinasi tools yang paling tepat untuk kolaborasi tim remote?',
  '{"A": "Slack untuk komunikasi, Notion untuk dokumentasi, Google Meet untuk rapat virtual", "B": "SMS pribadi untuk update proyek", "C": "Email saja untuk semua jenis komunikasi", "D": "Telepon kantor untuk diskusi harian", "E": "Media sosial untuk manajemen tugas"}'::jsonb,
  'A',
  'Kombinasi Slack (chat), Notion (dokumen), dan Google Meet (video) memberikan ekosistem kolaborasi lengkap untuk tim remote.',
  'medium',
  2
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Dasar Remote Working' LIMIT 1),
  'Strategi apa yang paling efektif untuk manajemen waktu saat kerja remote?',
  '{"A": "Bekerja tanpa jadwal tetap agar fleksibel", "B": "Memblokir waktu fokus, menetapkan jam kerja reguler, menggunakan teknik Pomodoro, dan memisahkan ruang kerja dari area istirahat", "C": "Multitasking antara pekerjaan rumah dan tugas kantor", "D": "Selalu available 24 jam untuk klien", "E": "Hanya bekerja saat ada deadline mendesak"}'::jsonb,
  'B',
  'Manajemen waktu remote yang baik memerlukan struktur: time blocking, jam kerja konsisten, dan boundary fisik antara kerja dan istirahat.',
  'hard',
  3
);

-- QUIZ 2: Skill Freelance (4 questions)

INSERT INTO questions (id, quiz_config_id, question_text, options, correct_answer, explanation, difficulty, order_index) VALUES
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Skill Freelance' LIMIT 1),
  'Langkah pertama apa yang paling krusial sebelum mulai freelance?',
  '{"A": "Langsung mendaftar di semua platform freelance", "B": "Menentukan niche spesifik berdasarkan skill, passion, dan demand pasar", "C": "Membuat kantor rumah yang mahal", "D": "Mengikuti semua pelatihan online gratis", "E": "Menawarkan jasa gratis ke semua teman"}'::jsonb,
  'B',
  'Menentukan niche spesifik membantu Anda standout di pasar kompetitif dan memungkinkan rate lebih tinggi.',
  'easy',
  0
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Skill Freelance' LIMIT 1),
  'Bagaimana cara terbaik mengidentifikasi target klien ideal?',
  '{"A": "Menargetkan semua orang yang butuh jasa Anda", "B": "Riset industri, ukuran perusahaan, budget, pain points, dan platform dimana mereka mencari freelancer", "C": "Hanya melamar ke perusahaan besar", "D": "Menunggu klien datang sendiri", "E": "Hanya fokus pada klien lokal"}'::jsonb,
  'B',
  'Ideal client profile yang spesifik memungkinkan Anda menyesuaikan portfolio dan outreach strategy secara efektif.',
  'medium',
  1
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Skill Freelance' LIMIT 1),
  'Apa elemen paling penting dalam portofolio freelance yang menarik?',
  '{"A": "Jumlah proyek yang banyak meski tidak relevan", "B": "Desain visual yang mewah tanpa studi kasus", "C": "3-5 proyek terbaik dengan studi kasus mendalam: masalah, proses, hasil terukur, dan testimoni klien", "D": "Daftar semua skill yang pernah dipelajari", "E": "Sertifikat kursus tanpa proyek nyata"}'::jsonb,
  'C',
  'Portofolio berkualitas > kuantitas. Studi kasus dengan konteks dan hasil terukur memberi bukti nyata kompetensi Anda.',
  'medium',
  2
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Skill Freelance' LIMIT 1),
  'Strategi negosiasi rate apa yang paling efektif untuk freelancer pemula?',
  '{"A": "Selalu ambil rate terendah agar menang kompetisi", "B": "Riset rate pasar, tentukan minimum viable rate, tawarkan value-based pricing, dan jangan takut walk away dari klien toxic", "C": "Tidak pernah negosiasi, terima saja", "D": "Naikkan rate 200% setiap bulan", "E": "Berikan diskon permanen 50%"}'::jsonb,
  'B',
  'Value-based pricing lebih sustainable. Riset pasar memberi anchor, minimum rate melindungi finansial, dan willingness to walk away menjaga bargaining power.',
  'hard',
  3
);

-- QUIZ 3: Keuangan Freelancer (4 questions)

INSERT INTO questions (id, quiz_config_id, question_text, options, correct_answer, explanation, difficulty, order_index) VALUES
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Keuangan Freelancer' LIMIT 1),
  'Mengapa penghasilan freelancer tidak tetap menjadi tantangan utama?',
  '{"A": "Karena freelancer tidak perlu kerja keras", "B": "Karena tidak ada gaji bulanan tetap, sehingga perlu buffer fund, budgeting fleksibel, dan pipeline proyek berkelanjutan", "C": "Karena freelancer selalu dibayar terlalu tinggi", "D": "Karena pajak sudah dipotong otomatis", "E": "Karena klien selalu membayar di awal"}'::jsonb,
  'B',
  'Income volatility adalah realita freelance. Emergency fund 3-6 bulan dan continuous pipeline building adalah strategi utama.',
  'easy',
  0
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Keuangan Freelancer' LIMIT 1),
  'Platform pembayaran internasional mana yang paling umum digunakan freelancer Indonesia?',
  '{"A": "Transfer bank lokal saja", "B": "PayPal, Wise, Payoneer, dan bank transfer internasional dengan pertimbangan kurs, fee, dan kecepatan", "C": "Cryptocurrency saja", "D": "Cek pos internasional", "E": "Tukar uang tunai di bandara"}'::jsonb,
  'B',
  'Wise menawarkan kurs mid-market dengan fee rendah, PayPal widely accepted, Payoneer cocok untuk platform freelance.',
  'medium',
  1
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Keuangan Freelancer' LIMIT 1),
  'Bagaimana kewajiban pajak untuk freelancer yang menerima penghasilan dari klien luar negeri?',
  '{"A": "Tidak perlu bayar pajak karena uang dari luar negeri", "B": "Wajib lapor dan bayar pajak atas seluruh penghasilan worldwide sesuai UU PPh Indonesia", "C": "Hanya bayar pajak jika diminta", "D": "Pajak sudah otomatis dipotong klien asing", "E": "Cukup bayar pajak daerah"}'::jsonb,
  'B',
  'WNI wajib pajak atas penghasilan worldwide. Bisa gunakan PPh Final UMKM 0.5% atau tarif progresif umum.',
  'hard',
  2
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Keuangan Freelancer' LIMIT 1),
  'Apa strategi investasi paling cocok untuk freelancer dengan income fluktuatif?',
  '{"A": "Investasi semua penghasilan setiap bulan tanpa emergency fund", "B": "Bangun emergency fund 3-6 bulan dulu, lalu dollar-cost averaging rutin ke instrumen likuid", "C": "Hanya simpan uang di tabungan biasa", "D": "Investasi hanya di cryptocurrency", "E": "Tidak perlu investasi karena income tidak tetap"}'::jsonb,
  'B',
  'Emergency fund adalah prioritas #1. Setelah aman, DCA mengurangi timing risk. Reksadana pasar uang dan SBN cocok untuk likuiditas tinggi.',
  'hard',
  3
);

-- QUIZ 4: Growth & Branding (4 questions)

INSERT INTO questions (id, quiz_config_id, question_text, options, correct_answer, explanation, difficulty, order_index) VALUES
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Growth & Branding' LIMIT 1),
  'Apa strategi paling efektif untuk personal branding di LinkedIn?',
  '{"A": "Hanya update status ketika butuh proyek", "B": "Konsisten berbagi insight industri, pamerkan studi kasus, engage dengan komentar bermakna, dan optimasi headline", "C": "Kirim connection request massal ke semua orang", "D": "Hanya posting foto pribadi", "E": "Copy-paste artikel dari website orang"}'::jsonb,
  'B',
  'LinkedIn algorithm menyukai engagement bermakna. Posting insight spesifik dan studi kasus dengan data membangun credibility.',
  'medium',
  0
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Growth & Branding' LIMIT 1),
  'Bagaimana cara terbaik mendapatkan klien dari luar negeri?',
  '{"A": "Hanya tunggu job posting di platform freelance", "B": "Bangun portfolio English-first, networking di komunitas global, cold outreach personalized, dan content marketing", "C": "Spam email ke perusahaan asing", "D": "Tawarkan harga paling murah di dunia", "E": "Hanya fokus pada klien Asia Tenggara"}'::jsonb,
  'B',
  'Global client acquisition memerlukan: portfolio English, active networking, personalized outreach, dan content yang mendemonstrasikan expertise.',
  'medium',
  1
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Growth & Branding' LIMIT 1),
  'Mengapa reputasi dan review penting untuk freelancer?',
  '{"A": "Tidak penting karena klien hanya lihat harga", "B": "Review membangun social proof; dapatkan dengan deliver excellence dan minta testimoni spesifik setelah project sukses", "C": "Beli review palsu di internet", "D": "Minta teman memberikan review", "E": "Abaikan review karena tidak ada yang baca"}'::jsonb,
  'B',
  'Social proof adalah currency freelancer. Testimoni spesifik dengan angka/hasil lebih credible daripada pujian umum.',
  'easy',
  2
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Growth & Branding' LIMIT 1),
  'Apa langkah strategis untuk scaling dari solo freelancer menjadi tim kecil?',
  '{"A": "Langsung sewa kantor dan rekrut 10 orang", "B": "Standardisasi proses, dokumentasikan SOP, outsource tugas repetitif ke subcontractor, dan bangun QC system", "C": "Terima semua proyek tanpa filter", "D": "Turunkan kualitas untuk kecepatan", "E": "Kerjakan semuanya sendiri agar hemat biaya"}'::jsonb,
  'B',
  'Scaling sustainable memerlukan foundation: SOP terdokumentasi, trusted network subcontractor, dan QC system sebelum scale.',
  'hard',
  3
);

-- QUIZ 5: Tools & Produktivitas (4 questions)

INSERT INTO questions (id, quiz_config_id, question_text, options, correct_answer, explanation, difficulty, order_index) VALUES
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Tools & Produktivitas' LIMIT 1),
  'Bagaimana Figma paling efektif digunakan oleh desainer freelance?',
  '{"A": "Hanya untuk editing foto dasar", "B": "Kolaborasi desain UI/UX real-time, component library reusable, prototyping interaktif, dan handoff ke developer", "C": "Sebagai word processor", "D": "Hanya untuk presentasi slideshow", "E": "Untuk edit video panjang"}'::jsonb,
  'B',
  'Figma unggul di collaborative design: real-time multiplayer, component system, interactive prototype, dan Dev Mode untuk handoff.',
  'easy',
  0
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Tools & Produktivitas' LIMIT 1),
  'Apa konsep Notion sebagai "second brain" untuk freelancer?',
  '{"A": "Hanya untuk menulis catatan meeting", "B": "Sistem terpusat untuk project management, knowledge base, CRM klien, content calendar, dan database", "C": "Sebagai media sosial", "D": "Hanya untuk to-do list harian", "E": "Sebagai email client"}'::jsonb,
  'B',
  'Notion sebagai second brain: satu source of truth untuk projects, clients, templates, SOPs, notes dengan relation & rollup.',
  'medium',
  1
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Tools & Produktivitas' LIMIT 1),
  'Mengapa GitHub penting untuk developer remote?',
  '{"A": "Hanya untuk menyimpan file backup", "B": "Version control, collaboration via pull requests, issue tracking, CI/CD, dan portfolio publik open-source", "C": "Untuk chat dengan tim", "D": "Sebagai hosting website statis saja", "E": "Untuk desain grafis"}'::jsonb,
  'B',
  'GitHub adalah standar industri: Git version control, PR review, Issues tracking, Actions CI/CD, dan public repos sebagai portfolio.',
  'medium',
  2
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: Tools & Produktivitas' LIMIT 1),
  'Kapan sebaiknya menggunakan Asana vs Trello?',
  '{"A": "Asana untuk proyek sederhana, Trello untuk proyek kompleks", "B": "Trello untuk workflow Kanban sederhana; Asana untuk proyek multi-dependency, timeline view, dan reporting advanced", "C": "Keduanya sama persis", "D": "Trello hanya untuk personal use", "E": "Asana gratis selamanya untuk semua fitur"}'::jsonb,
  'B',
  'Trello cocok untuk Kanban sederhana. Asana lebih powerful untuk complex projects: dependencies, timeline, custom fields, reporting.',
  'hard',
  3
);

-- QUIZ 6: CV & Personal Branding (4 questions)

INSERT INTO questions (id, quiz_config_id, question_text, options, correct_answer, explanation, difficulty, order_index) VALUES
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: CV & Personal Branding' LIMIT 1),
  'Apa ciri CV yang ATS (Applicant Tracking System) friendly?',
  '{"A": "Desain grafis mewah dengan banyak kolom dan gambar", "B": "Format sederhana satu kolom, font standar, keyword dari job description, section heading jelas, tanpa tabel/graphics", "C": "Hanya satu halaman tanpa detail", "D": "Menggunakan infographic CV", "E": "CV video 5 menit"}'::jsonb,
  'B',
  'ATS adalah software screening otomatis. Gunakan format clean, keyword match job description, heading standar, dan file PDF/DOCX.',
  'easy',
  0
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: CV & Personal Branding' LIMIT 1),
  'Bagaimana membuat portofolio yang "convert" (menghasilkan klien)?',
  '{"A": "Tampilkan semua proyek yang pernah dikerjakan", "B": "Kurasi 3-5 proyek terbaik, tampilkan proses, sertakan metrik dampak, testimoni klien, dan clear CTA", "C": "Hanya screenshot akhir tanpa konteks", "D": "Portofolio 50 halaman", "E": "Tanpa informasi kontak"}'::jsonb,
  'B',
  'Converting portfolio: quality over quantity. Studi kasus dengan konteks, hasil terukur, testimoni, dan clear CTA membangun trust.',
  'medium',
  1
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: CV & Personal Branding' LIMIT 1),
  'Apa elemen kunci cover letter untuk posisi remote?',
  '{"A": "Template generik yang dikirim ke 100 perusahaan", "B": "Personalisasi spesifik, demonstrasi pengalaman remote work, alignment dengan nilai perusahaan, dan call-to-action", "C": "Hanya sebutkan gaji yang diminta", "D": "Fokus pada apa yang Anda mau", "E": "Cover letter 10 halaman"}'::jsonb,
  'B',
  'Remote cover letter harus membuktikan Anda bisa kerja mandiri: tools, timezone management, track record, dan company research.',
  'medium',
  2
),
(
  uuid_generate_v4(),
  (SELECT id FROM quiz_configs WHERE title = 'Kuis: CV & Personal Branding' LIMIT 1),
  'Bagaimana optimasi profil di Upwork/Toptal untuk lebih banyak job invitation?',
  '{"A": "Biarkan profil kosong", "B": "Headline spesifik dengan niche, overview berfokus client pain points, portfolio terkurasi, dan regularly update profil", "C": "Buat 10 akun sekaligus", "D": "Spam proposal ke semua job", "E": "Tawarkan rate $1/jam"}'::jsonb,
  'B',
  'Platform algorithm favoritkan profil complete & active. Headline spesifik, overview client-focused, portfolio relevan, dan regular updates.',
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
  RAISE NOTICE 'Learning Modules: %', module_count;
  RAISE NOTICE 'Quiz Configs: %', quiz_count;
  RAISE NOTICE 'Questions: %', question_count;
  RAISE NOTICE '========================================';
END $$;

COMMIT;
