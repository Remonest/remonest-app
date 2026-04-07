'use client';

import { useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { submitJob, saveJobDraft } from '@/lib/jobs/actions';
import { toast } from 'sonner';
import { Loader2, Save, Send } from 'lucide-react';
import type { JobType } from '@/lib/jobs/actions';

interface PostJobFormProps {
  isAdmin?: boolean;
}

export function PostJobForm({ isAdmin = false }: PostJobFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmitAction = async (formData: FormData, action: 'submit' | 'draft') => {
    setIsLoading(true);
    setErrors({});

    try {
      const result =
        action === 'submit'
          ? await submitJob(formData)
          : await saveJobDraft(formData);

      if (result.success) {
        toast.success(result.message);
        if (action === 'submit') {
          router.push(isAdmin ? '/admin/jobs' : '/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        toast.error(result.error);
        if (result.errors) {
          const formattedErrors: Record<string, string> = {};
          Object.entries(result.errors).forEach(([key, value]) => {
            if (value && value[0]) {
              formattedErrors[key] = value[0];
            }
          });
          setErrors(formattedErrors);
        }
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memproses permintaan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isAdmin ? 'Posting Lowongan Kerja Baru' : 'Buat Lowongan Kerja'}
        </CardTitle>
        <CardDescription>
          {isAdmin
            ? 'Admin dapat langsung menerbitkan lowongan tanpa persetujuan'
            : 'Lowongan Anda akan ditinjau oleh admin sebelum diterbitkan'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Dasar</h3>

            <div className="space-y-2">
              <Label htmlFor="title">Judul Pekerjaan *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Contoh: Senior Frontend Developer"
                disabled={isLoading}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Nama Perusahaan *</Label>
              <Input
                id="company"
                name="company"
                placeholder="Contoh: TechCorp Indonesia"
                disabled={isLoading}
                className={errors.company ? 'border-red-500' : ''}
              />
              {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_type">Jenis Pekerjaan *</Label>
              <Select name="job_type" defaultValue="full-time" disabled={isLoading}>
                <SelectTrigger className={errors.job_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Pilih jenis pekerjaan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-Time</SelectItem>
                  <SelectItem value="part-time">Part-Time</SelectItem>
                  <SelectItem value="project">Proyek</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
              {errors.job_type && <p className="text-sm text-red-500">{errors.job_type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description_html">Deskripsi Pekerjaan *</Label>
              <Textarea
                id="description_html"
                name="description_html"
                placeholder="Deskripsi detail tentang pekerjaan (mendukung HTML)..."
                rows={8}
                disabled={isLoading}
                className={errors.description_html ? 'border-red-500' : ''}
              />
              {errors.description_html && (
                <p className="text-sm text-red-500">{errors.description_html}</p>
              )}
            </div>
          </div>

          {/* Salary Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Gaji</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary_min">Gaji Minimum (IDR)</Label>
                <Input
                  id="salary_min"
                  name="salary_min"
                  type="number"
                  placeholder="Contoh: 5000000"
                  disabled={isLoading}
                  className={errors.salary_min ? 'border-red-500' : ''}
                />
                {errors.salary_min && <p className="text-sm text-red-500">{errors.salary_min}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_max">Gaji Maksimum (IDR)</Label>
                <Input
                  id="salary_max"
                  name="salary_max"
                  type="number"
                  placeholder="Contoh: 10000000"
                  disabled={isLoading}
                  className={errors.salary_max ? 'border-red-500' : ''}
                />
                {errors.salary_max && <p className="text-sm text-red-500">{errors.salary_max}</p>}
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detail Pekerjaan</h3>

            <div className="space-y-2">
              <Label htmlFor="location">Lokasi *</Label>
              <Input
                id="location"
                name="location"
                placeholder="Contoh: Remote / WFH"
                disabled={isLoading}
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_estimate">Estimasi Durasi (Opsional)</Label>
              <Input
                id="duration_estimate"
                name="duration_estimate"
                placeholder="Contoh: 6 bulan, Permanen, 3 bulan"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline Lamaran (Opsional)</Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                disabled={isLoading}
                className={errors.deadline ? 'border-red-500' : ''}
              />
              {errors.deadline && <p className="text-sm text-red-500">{errors.deadline}</p>}
            </div>
          </div>

          {/* Application Method */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Metode Lamaran</h3>

            <div className="space-y-2">
              <Label>Metode Lamaran *</Label>
              <RadioGroup name="apply_method" defaultValue="url" className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="url" id="url" disabled={isLoading} />
                  <Label htmlFor="url" className="font-normal">
                    URL Lamaran Eksternal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" disabled={isLoading} />
                  <Label htmlFor="email" className="font-normal">
                    Email Lamaran
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apply_url">URL Lamaran (Opsional)</Label>
              <Input
                id="apply_url"
                name="apply_url"
                type="url"
                placeholder="https://example.com/apply"
                disabled={isLoading}
                className={errors.apply_url ? 'border-red-500' : ''}
              />
              {errors.apply_url && <p className="text-sm text-red-500">{errors.apply_url}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apply_email">Email Lamaran (Opsional)</Label>
              <Input
                id="apply_email"
                name="apply_email"
                type="email"
                placeholder="careers@company.com"
                disabled={isLoading}
                className={errors.apply_email ? 'border-red-500' : ''}
              />
              {errors.apply_email && <p className="text-sm text-red-500">{errors.apply_email}</p>}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              type="submit"
              formAction={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget as HTMLFormElement);
                handleSubmitAction(formData, 'submit');
              }}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {isAdmin ? 'Terbitkan Sekarang' : 'Kirim untuk Persetujuan'}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={(e) => {
                const formData = new FormData((e.target as HTMLElement).closest('form') as HTMLFormElement);
                handleSubmitAction(formData, 'draft');
              }}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Draft
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
