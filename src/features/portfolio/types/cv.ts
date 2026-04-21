import { z } from "zod";

export interface CVExperience {
  id: string;
  title: string;
  company: string;
  location?: string;
  years: string;
  description: string;
}

export interface CVEducation {
  id: string;
  degree: string;
  school: string;
  years: string;
  location?: string;
  description?: string;
}

export interface CVSkill {
  id: string;
  name: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface CVData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: CVExperience[];
  education: CVEducation[];
  skills: string; // Keep as string for now for compatibility, but can be CVSkill[]
  languages?: string;
}

export interface UserCV {
  id: string;
  user_id: string;
  cv_name: string;
  data: CVData;
  template_id: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Zod Schemas ─────────────────────────────────────────────

export const cvExperienceSchema = z.object({
  id: z.string(),
  title: z.string().min(2, "Judul pekerjaan minimal 2 karakter"),
  company: z.string().min(2, "Nama perusahaan minimal 2 karakter"),
  location: z.string().optional(),
  years: z.string().min(4, "Format tahun minimal 4 karakter (contoh: 2020)"),
  description: z.string().min(10, "Deskripsi pengalaman minimal 10 karakter"),
});

export const cvEducationSchema = z.object({
  id: z.string(),
  degree: z.string().min(2, "Gelar/Jurusan minimal 2 karakter"),
  school: z.string().min(2, "Nama sekolah/universitas minimal 2 karakter"),
  years: z.string().min(4, "Format tahun minimal 4 karakter"),
  location: z.string().optional(),
  description: z.string().optional(),
});

export const cvDataSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  location: z.string().min(3, "Lokasi minimal 3 karakter (contoh: Jakarta)"),
  summary: z.string().min(20, "Ringkasan profesional minimal 20 karakter"),
  experience: z.array(cvExperienceSchema).min(1, "Tambahkan minimal satu pengalaman kerja"),
  education: z.array(cvEducationSchema).min(1, "Tambahkan minimal satu riwayat pendidikan"),
  skills: z.string().min(3, "Tambahkan minimal beberapa keahlian"),
  languages: z.string().optional(),
});

export const userCVSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  cv_name: z.string(),
  data: cvDataSchema,
  template_id: z.string(),
  is_primary: z.boolean(),
});
