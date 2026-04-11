// File: scripts/seed-learning-materials-id.js
// Seed learning materials in Bahasa Indonesia directly via JS
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Delete old Buffer content (raw English)
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
  .select('id, title')
  .eq('slug', 'remote-working-basics')
  .single();

const { data: mod2 } = await supabase
  .from('learning_modules')
  .select('id, title')
  .eq('slug', 'skill-freelance')
  .single();

if (!mod1) { console.log('❌ Module remote-working-basics not found'); }
if (!mod2) { console.log('❌ Module skill-freelance not found'); }

// ============================================================
// Material 1: Remote Working (Bahasa Indonesia)
// ============================================================
if (mod1) {
  const content = `# Panduan Lengkap Bekerja dari Rumah untuk Pemula

## Pendahuluan

Bekerja dari rumah atau *remote work* telah menjadi tren global yang semakin populer, terutama setelah pandemi COVID-19. Menurut berbagai studi, produktivitas pekerja remote meningkat hingga 13% dibandingkan pekerja kantor. Namun, bekerja dari rumah juga memiliki tantangan tersendiri yang perlu dipahami dan diatasi dengan strategi yang tepat.

Modul ini akan membahas dasar-dasar bekerja dari rumah, termasuk pengaturan ruang kerja, manajemen waktu, komunikasi efektif, dan tools yang dapat membantu Anda produktif.

---

## 1. Apa Itu Remote Work?

Remote work adalah cara bekerja di mana pekerja tidak terikat pada lokasi fisik kantor. Pekerja remote dapat bekerja dari rumah, co-working space, kafe, atau bahkan dari negara lain.

### Jenis-Jenis Remote Work

- **Full Remote** — Bekerja sepenuhnya dari luar kantor
- **Hybrid** — Kombinasi bekerja dari kantor dan dari rumah
- **Flexible Location** — Bebas memilih lokasi kerja sesuai kebutuhan
- **Freelance Remote** — Bekerja sebagai freelancer untuk klien dari berbagai lokasi

### Keuntungan Remote Work

- **Fleksibilitas waktu** — Mengatur jadwal kerja sendiri
- **Tidak ada commute** — Menghemat waktu dan biaya transportasi
- **Work-life balance** — Lebih banyak waktu untuk keluarga dan hobi
- **Produktivitas tinggi** — Lebih sedikit gangguan dibandingkan kantor
- **Jangkauan kerja global** — Bisa bekerja untuk perusahaan dari seluruh dunia

---

## 2. Menyiapkan Ruang Kerja di Rumah

Ruang kerja yang baik adalah fondasi produktivitas remote work. Berikut hal-hal yang perlu diperhatikan:

### A. Pilih Tempat yang Tenang

- Cari ruangan yang terpisah dari area aktivitas keluarga
- Pastikan pencahayaan yang cukup (cahaya alami lebih baik)
- Hindari tempat tidur sebagai meja kerja

### B. Peralatan yang Diperlukan

| Peralatan | Fungsi |
|-----------|--------|
| Meja & Kursi Ergonomis | Kenyamanan dan kesehatan postur |
| Monitor Eksternal | Layar lebih besar, mengurangi kelelahan mata |
| Keyboard & Mouse | Kenyamanan mengetik jangka panjang |
| Headset dengan Mic | Komunikasi video/audio yang jernih |
| Koneksi Internet Stabil | Koneksi minimal 10 Mbps untuk video call |

### C. Pencahayaan & Ergonomi

- **Layar monitor** harus setinggi mata
- **Siku** membentuk sudut 90 derajat saat mengetik
- **Kaki** rata dengan lantai atau menggunakan footrest
- **Pencahayaan** dari samping, bukan dari belakang layar

---

## 3. Manajemen Waktu & Produktivitas

### Teknik Pomodoro

1. Fokus bekerja selama **25 menit**
2. Istirahat singkat **5 menit**
3. Setelah 4 siklus, istirahat panjang **15-30 menit**

### Tips Manajemen Waktu

- **Buat jadwal harian** — Tentukan jam kerja dan jam istirahat
- **Prioritaskan tugas** — Gunakan matriks Eisenhower (Urgent vs Important)
- **Hindari multitasking** — Fokus pada satu tugas pada satu waktu
- **Tetapkan batasan** — Beri tahu keluarga bahwa Anda sedang bekerja
- **Gunakan time tracking** — Catat berapa waktu yang dihabiskan per tugas

### Rutinitas Harian yang Disarankan

| Waktu | Aktivitas |
|-------|-----------|
| 07:00 - 08:00 | Bangun, olahraga ringan, sarapan |
| 08:00 - 08:30 | Persiapan kerja, review email & to-do |
| 08:30 - 12:00 | Deep work (tugas paling penting) |
| 12:00 - 13:00 | Istirahat makan siang |
| 13:00 - 15:00 | Meeting & kolaborasi |
| 15:00 - 17:00 | Tugas administratif & email |
| 17:00+ | Off work, waktu pribadi |

---

## 4. Komunikasi Efektif Secara Remote

Komunikasi adalah tantangan terbesar remote work. Berikut cara mengatasinya:

### Channel Komunikasi

| Channel | Kapan Digunakan | Contoh Tools |
|---------|-----------------|--------------|
| **Chat/IM** | Pertanyaan cepat, update singkat | Slack, WhatsApp, Discord |
| **Video Call** | Meeting, diskusi kompleks | Zoom, Google Meet, Teams |
| **Email** | Komunikasi formal, dokumentasi | Gmail, Outlook |
| **Project Board** | Tracking tugas & progress | Trello, Asana, Jira |
| **Dokumen Bersama** | Kolaborasi real-time | Google Docs, Notion |

### Etika Komunikasi Remote

1. **Responsif** — Balas pesan dalam waktu yang wajar (maksimal 2 jam)
2. **Clear & Concise** — Tulis pesan yang jelas dan langsung ke inti
3. **Gunakan video** — Nyalakan kamera saat meeting untuk koneksi personal
4. **Over-communicate** — Lebih baik terlalu banyak informasi daripada kurang
5. **Hormati zona waktu** — Perhatikan perbedaan waktu saat menjadwalkan meeting

---

## 5. Tools Kolaborasi yang Wajib Dikuasai

### A. Slack — Komunikasi Tim

- **Channel** — Buat channel berdasarkan topik (misal: #project-alpha, #random)
- **Direct Message** — Chat pribadi dengan anggota tim
- **Thread** — Balas pesan dalam thread untuk menjaga kerapihan
- **Integrasi** — Hubungkan dengan Google Drive, GitHub, dll

### B. Notion — Workspace Terpadu

- **Wiki tim** — Dokumentasi perusahaan & SOP
- **Project management** — Tracking tugas & milestone
- **Notes** — Catatan meeting & ide
- **Database** — Kelola kontak, resource, dll

### C. Google Workspace — Kolaborasi Real-Time

- **Google Docs** — Menulis bersama secara real-time
- **Google Sheets** — Spreadsheet kolaboratif
- **Google Drive** — Penyimpanan file bersama
- **Google Calendar** — Jadwal meeting & deadline

### D. Trello — Manajemen Proyek Visual

- **Board** — Papan proyek visual
- **List** — Kolom status (To Do, In Progress, Done)
- **Card** — Kartu tugas dengan detail & deadline
- **Power-Ups** — Integrasi dengan tools lain

---

## 6. Mengatasi Tantangan Remote Work

### Tantangan & Solusi

| Tantangan | Solusi |
|-----------|--------|
| Merasa kesepian | Bergabung komunitas remote worker, coffee chat virtual |
| Gangguan di rumah | Ruang kerja terpisah, headphone noise-cancelling |
| Sulit fokus | Teknik Pomodoro, matikan notifikasi non-esensial |
| Overwork | Tetapkan jam kerja, buat ritual "pulang kerja" |
| Komunikasi lambat | Gunakan channel yang tepat, set ekspektasi respons |
| Masalah teknis | Backup internet (hotspot), pelajari tools dengan baik |

### Menjaga Kesehatan Mental

- **Olahraga teratur** — Minimal 30 menit per hari
- **Social interaction** — Jadwalkan coffee chat virtual dengan rekan
- **Take breaks** — Jangan melewatkan jam makan siang
- **Set boundaries** — Pisahkan waktu kerja dan pribadi
- **Seek help** — Jangan ragu konsultasi profesional jika perlu

---

## 7. Kesimpulan

Remote work menawarkan fleksibilitas dan peluang besar, namun membutuhkan disiplin dan strategi yang tepat. Kunci sukses remote work:

1. ✅ Ruang kerja yang nyaman dan ergonomis
2. ✅ Manajemen waktu yang terstruktur
3. ✅ Komunikasi yang efektif dan responsif
4. ✅ Penguasaan tools kolaborasi
5. ✅ Menjaga keseimbangan kerja dan kesehatan

Dengan menerapkan prinsip-prinsip di atas, Anda bisa menjadi remote worker yang produktif dan bahagia.

---

## Daftar Istilah Penting

| Istilah | Definisi |
|---------|----------|
| Remote Work | Bekerja dari lokasi di luar kantor tradisional |
| Hybrid Work | Kombinasi bekerja dari kantor dan dari rumah |
| Co-working Space | Ruang kerja bersama yang disewa |
| Asynchronous | Komunikasi yang tidak terjadi secara real-time |
| Deep Work | Bekerja dengan fokus penuh tanpa gangguan |
| Burnout | Kelelahan fisik dan mental akibat kerja berlebihan |
| Ergonomis | Desain yang sesuai dengan postur tubuh manusia |
| Time Tracking | Mencatat waktu yang dihabiskan untuk tugas |
| Standup Meeting | Meeting singkat (15 menit) untuk update progress |
| Async-first | Budaya kerja yang mengutamakan komunikasi asynchronous |

---

## Rekomendasi Tools & Resources

### Komunikasi
- **Slack** — https://slack.com
- **Discord** — https://discord.com
- **Microsoft Teams** — https://teams.microsoft.com

### Kolaborasi
- **Notion** — https://notion.so
- **Google Workspace** — https://workspace.google.com
- **Miro** — https://miro.com (whiteboard virtual)

### Manajemen Proyek
- **Trello** — https://trello.com
- **Asana** — https://asana.com
- **Linear** — https://linear.app

### Time Tracking
- **Toggl** — https://toggl.com
- **Clockify** — https://clockify.me
- **Harvest** — https://www.getharvest.com

### Kesehatan & Wellness
- **Headspace** — https://www.headspace.com (meditasi)
- **Stretchly** — https://hovancik.net/stretchly/ (reminder istirahat)`;

  const { data: saved1, error: err1 } = await supabase
    .from('learning_materials')
    .insert({
      module_id: mod1.id,
      title: 'Panduan Lengkap Bekerja dari Rumah untuk Pemula',
      content: content,
      summary: 'Panduan komprehensif untuk memulai bekerja dari rumah, mencakup setup ruang kerja, manajemen waktu, komunikasi efektif, tools kolaborasi, dan tips kesehatan mental untuk remote worker Indonesia.',
      source_url: 'https://buffer.com/resources/remote-work/',
      source_type: 'article',
      language: 'id',
      reading_time_minutes: 15,
      difficulty: 'beginner',
      tags: ['remote work', 'produktivitas', 'komunikasi', 'tools', 'work from home'],
      is_published: true,
    })
    .select()
    .single();

  if (err1) {
    console.log(`❌ Error saving material 1: ${err1.message}`);
  } else {
    console.log(`✅ Saved Material 1 (Remote Work) — ID: ${saved1.id} (${content.length} chars)`);
  }
}

// ============================================================
// Material 2: Skill Freelance (Bahasa Indonesia)
// ============================================================
if (mod2) {
  const content = `# Panduan Memulai Karir Freelance untuk Pemula

## Pendahuluan

Freelance adalah cara kerja di mana Anda menawarkan jasa atau keahlian kepada berbagai klien secara independen, tanpa terikat kontrak jangka panjang dengan satu perusahaan. Di Indonesia, jumlah freelancer terus meningkat pesat seiring dengan perkembangan platform digital dan semakin banyaknya perusahaan yang terbuka dengan pekerja remote.

Modul ini akan membahas langkah-langkah praktis untuk memulai karir freelance, mulai dari menentukan niche, membuat portofolio, hingga mendapatkan klien pertama Anda.

---

## 1. Apa Itu Freelance?

Freelancer adalah pekerja independen yang menawarkan jasa kepada berbagai klien berdasarkan proyek atau kontrak. Berbeda dengan karyawan tetap, freelancer memiliki kebebasan dalam menentukan:

- **Klien yang ingin dikerjakan** — Pilih proyek yang sesuai minat
- **Tarif per proyek** — Tentukan harga sesuai nilai yang diberikan
- **Jadwal kerja** — Atur waktu kerja sendiri
- **Lokasi kerja** — Bisa dari mana saja

### Jenis-Jenis Pekerjaan Freelance

| Bidang | Contoh Pekerjaan |
|--------|-----------------|
| **Desain** | Logo, UI/UX, ilustrasi, branding |
| **Web Development** | Website, landing page, e-commerce |
| **Writing** | Artikel, copywriting, technical writing |
| **Marketing** | Social media, SEO, email marketing |
| **Video & Audio** | Editing, animasi, voice-over |
| **Administrasi** | Virtual assistant, data entry, customer service |

---

## 2. Menentukan Niche & Target Klien

Langkah pertama yang paling penting: tentukan spesialisasi Anda.

### Mengapa Perlu Spesialisasi?

- **Lebih mudah dipercaya** — Klien lebih percaya "spesialis" daripada "generalis"
- **Tarif lebih tinggi** — Spesialis bisa charge 2-5x lebih tinggi
- **Lebih sedikit kompetisi** — Niche yang spesifik = lebih sedikit saingan
- **Marketing lebih mudah** — Pesan lebih jelas dan terarah

### Cara Menentukan Niche

1. **Identifikasi keahlian** — Apa yang Anda kuasai?
2. **Cari passion** — Apa yang Anda sukai?
3. **Analisis pasar** — Apakah ada permintaan untuk skill tersebut?
4. **Tentukan target klien** — Siapa yang akan membayar jasa Anda?

### Contoh Niche yang Spesifik

| Niche Umum | Niche Spesifik (Lebih Baik) |
|------------|---------------------------|
| Desainer Grafis | Desainer Landing Page untuk UMKM |
| Penulis Konten | Penulis Artikel SEO untuk Industri Kesehatan |
| Web Developer | Developer E-commerce Shopify |
| Social Media Manager | Manager Instagram untuk Brand Fashion |

---

## 3. Membuat Portofolio yang Menarik

Portofolio adalah bukti kemampuan Anda. Tanpa portofolio, klien akan ragu untuk mempekerjakan Anda.

### Elemen Portofolio yang Baik

- **Contoh karya terbaik** — Tampilkan 5-8 karya terbaik
- **Studi kasus** — Jelaskan masalah klien, solusi Anda, dan hasil
- **Testimoni** — Review dari klien sebelumnya (jika ada)
- **About Me** — Cerita singkat tentang diri dan keahlian Anda
- **Contact** — Cara menghubungi Anda dengan jelas

### Platform untuk Portofolio

| Platform | Cocok Untuk | Biaya |
|----------|-------------|-------|
| **Behance** | Desain, fotografi | Gratis |
| **Dribbble** | UI/UX, desain | Gratis |
| **GitHub** | Developer | Gratis |
| **Medium** | Penulis | Gratis |
| **Wix/Squarespace** | Website personal | Berbayar |
| **Notion** | Semua jenis | Gratis |

### Tips Membuat Portofolio Tanpa Pengalaman

1. **Buat proyek fiktif** — Desain ulang website populer, buat mockup
2. **Kerja pro bono** — Tawarkan jasa gratis untuk organisasi/NGO
3. **Personal project** — Buat sesuatu untuk diri sendiri
4. **Tulis artikel** — Tulis tutorial di Medium atau blog pribadi

---

## 4. Menentukan Tarif

### Cara Menghitung Tarif

#### Metode 1: Berdasarkan Biaya Hidup

\`\`\`
Target Pendapatan Bulanan = Biaya Hidup + Tabungan + Investasi
Tarif Per Jam = Target / Jam Kerja per Bulan
\`\`\`

**Contoh:**
- Target: Rp 10.000.000/bulan
- Jam kerja: 160 jam/bulan (40 jam/minggu)
- Tarif minimal: Rp 10.000.000 / 160 = **Rp 62.500/jam**

#### Metode 2: Berdasarkan Nilai yang Diberikan

- **Basic** — Rp 500.000 - 1.000.000 per proyek kecil
- **Intermediate** — Rp 1.000.000 - 5.000.000 per proyek
- **Expert** — Rp 5.000.000+ per proyek

### Tips Menentukan Tarif

- **Jangan terlalu murah** — Tarif rendah = klien kurang menghargai
- **Mulai dari tengah** — Naikkan tarif perlahan seiring pengalaman
- **Charge berdasarkan nilai** — Bukan berdasarkan waktu
- **Buat paket** — Tawarkan paket Basic, Standard, Premium

---

## 5. Mendapatkan Klien Pertama

### Platform Freelance

| Platform | Jenis Klien | Fee |
|----------|-------------|-----|
| **Upwork** | Internasional | 10-20% |
| **Fiverr** | Internasional | 20% |
| **Freelancer.com** | Internasional | 10-20% |
| **Projects.co.id** | Indonesia | 5-10% |
| **Sribulancer** | Indonesia | 10-15% |

### Strategi Mendapatkan Klien

1. **Optimasi profil** — Foto profesional, deskripsi jelas, portofolio lengkap
2. **Proposal yang personal** — Jangan copy-paste, baca brief klien
3. **Mulai dari proyek kecil** — Bangun reputasi dan review dulu
4. **Network** — Ceritakan jasa Anda di media sosial
5. **Referral** — Minta klien yang puas untuk merekomendasikan

### Tips Menulis Proposal

\`\`\`
Struktur Proposal:
1. Sapa klien dengan nama
2. Tunjukkan bahwa Anda membaca brief mereka
3. Jelaskan pengalaman Anda terkait proyek
4. Tawarkan solusi spesifik
5. Sebutkan timeline & harga
6. Tanya apakah ada yang perlu diklarifikasi
\`\`\`

---

## 6. Mengelola Bisnis Freelance

### A. Kontrak & Agreement

Selalu gunakan kontrak tertulis yang mencakup:
- **Scope of work** — Apa yang akan dikerjakan
- **Timeline** — Deadline dan milestone
- **Pembayaran** — Berapa, kapan, metode pembayaran
- **Revisi** — Berapa kali revisi yang termasuk
- **Kepemilikan** — Siapa yang memiliki hasil akhir

### B. Invoice & Pembayaran

| Tools | Fungsi |
|-------|--------|
| **Wave** | Invoice gratis |
| **FreshBooks** | Invoice + accounting |
| **Paypal** | Pembayaran internasional |
| **Wise** | Transfer internasional, fee rendah |
| **GoPay/OVO/BCA** | Pembayaran lokal |

### C. Manajemen Waktu

- **Gunakan calendar** — Blokir waktu untuk setiap klien
- **Time blocking** — 2 jam deep work, 1 jam meeting, 1 jam admin
- **Set batasan** — Jangan available 24/7
- **Automasi** — Gunakan template email, invoice otomatis

---

## 7. Kesimpulan

Memulai karir freelance membutuhkan keberanian untuk melangkah, tapi hasilnya bisa sangat memuaskan. Ringkasan langkah:

1. ✅ Tentukan niche yang spesifik
2. ✅ Buat portofolio yang meyakinkan
3. ✅ Tentukan tarif yang adil
4. ✅ Mulai dari platform freelance atau network
5. ✅ Kelola bisnis dengan profesional

Konsistensi dan kualitas kerja adalah kunci kesuksesan freelance. Mulai dari mana saja, tapi **mulai sekarang**.

---

## Daftar Istilah Penting

| Istilah | Definisi |
|---------|----------|
| Freelancer | Pekerja independen yang menawarkan jasa per proyek |
| Niche | Spesialisasi atau fokus area kerja |
| Portofolio | Kumpulan karya untuk menunjukkan kemampuan |
| Proposal | Penawaran kerja yang dikirim ke klien |
| Scope of Work | Batasan pekerjaan yang disepakati |
| Milestone | Tahapan penting dalam proyek |
| Invoice | Tagihan pembayaran |
| Rate | Tarif per jam atau per proyek |
| Retainer | Kontrak jangka panjang dengan pembayaran rutin |
| Referral | Rekomendasi dari klien/kolega |

---

## Rekomendasi Tools & Resources

### Platform Freelance
- **Upwork** — https://www.upwork.com
- **Fiverr** — https://www.fiverr.com
- **Projects.co.id** — https://projects.co.id

### Portofolio
- **Behance** — https://www.behance.net
- **Dribbble** — https://dribbble.com
- **Notion** — https://notion.so

### Manajemen Bisnis
- **Wave** — https://www.waveapps.com (invoice gratis)
- **Toggl** — https://toggl.com (time tracking)
- **Wise** — https://wise.com (transfer internasional)`;

  const { data: saved2, error: err2 } = await supabase
    .from('learning_materials')
    .insert({
      module_id: mod2.id,
      title: 'Panduan Memulai Karir Freelance untuk Pemula',
      content: content,
      summary: 'Panduan lengkap memulai karir freelance, dari menentukan niche, membuat portofolio, menentukan tarif, mendapatkan klien pertama, hingga mengelola bisnis freelance secara profesional.',
      source_url: 'https://buffer.com/resources/freelance/',
      source_type: 'article',
      language: 'id',
      reading_time_minutes: 15,
      difficulty: 'beginner',
      tags: ['freelance', 'portofolio', 'klien', 'tarif', 'karir'],
      is_published: true,
    })
    .select()
    .single();

  if (err2) {
    console.log(`❌ Error saving material 2: ${err2.message}`);
  } else {
    console.log(`✅ Saved Material 2 (Freelance) — ID: ${saved2.id} (${content.length} chars)`);
  }
}

// Verify
const { data: allMaterials } = await supabase
  .from('learning_materials')
  .select('id, title, module_id, content, language')
  .eq('language', 'id')
  .order('created_at');

console.log(`\n📊 Bahasa Indonesia Materials in DB: ${allMaterials?.length || 0}\n`);
allMaterials?.forEach((m, i) => {
  console.log(`${i + 1}. ${m.title}`);
  console.log(`   ID: ${m.id}`);
  console.log(`   Content: ${m.content?.length || 0} chars`);
  console.log(`   Language: ${m.language}`);
  console.log('');
});
