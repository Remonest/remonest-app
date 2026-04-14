"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Save, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { updateLearningModule } from "@/lib/learning/actions";
import type { LearningModuleRow } from "@/lib/learning/actions";
import type { LearningModuleResult } from "@/lib/learning/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// DB categories from the migration CHECK constraint
const DB_CATEGORIES = [
  { value: "communication", label: "Komunikasi" },
  { value: "mindset", label: "Mindset" },
  { value: "career", label: "Karir" },
  { value: "design", label: "Desain" },
  { value: "productivity", label: "Produktivitas" },
] as const;

const DB_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Terbit" },
  { value: "archived", label: "Diarsipkan" },
] as const;

interface EditLearningModuleFormProps {
  module: LearningModuleRow;
}

const initialState: LearningModuleResult = { success: false };

export function EditLearningModuleForm({
  module,
}: EditLearningModuleFormProps) {
  const [state, formAction, pending] = useActionState(
    updateLearningModule,
    initialState,
  );

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    if (state?.success) {
      toast.success("Modul berhasil diperbarui!");
    }
  }, [state]);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Edit Modul</CardTitle>
        <CardDescription>
          Perbarui informasi modul learning ini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {/* Hidden ID */}
          <input type="hidden" name="id" value={module.id} />

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              name="title"
              type="text"
              defaultValue={module.title}
              placeholder="e.g., Async Communication Basics"
              required
              minLength={3}
              maxLength={200}
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select name="category" defaultValue={module.category} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {DB_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={module.status} required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {DB_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={module.description ?? ""}
              placeholder="Ringkasan singkat tentang apa yang akan dipelajari..."
              className="min-h-[100px] resize-y"
              required
              minLength={10}
            />
            <p className="text-xs text-muted-foreground">
              Deskripsi singkat yang terlihat oleh pengguna di katalog.
            </p>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail_url">Cover Image URL</Label>
            <Input
              id="thumbnail_url"
              name="thumbnail_url"
              type="url"
              defaultValue={module.thumbnail_url ?? ""}
              placeholder="https://images.unsplash.com/photo-..."
            />
            <p className="text-xs text-muted-foreground">
              Optional. URL for the module cover image (shown in catalog and hero section).
            </p>
            {module.thumbnail_url && (
              <div className="mt-3 overflow-hidden rounded-lg border border-border">
                <img
                  src={module.thumbnail_url}
                  alt="Current cover"
                  className="h-32 w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Konten (Markdown)</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={module.content ?? ""}
              placeholder="Tulis konten modul dalam format Markdown..."
              className="min-h-[200px] resize-y font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Konten utama modul. Gunakan format Markdown untuk heading, list,
              bold, dll.
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration_min">Durasi (menit)</Label>
            <Input
              id="duration_min"
              name="duration_min"
              type="number"
              min="0"
              max="600"
              defaultValue={module.duration_min}
              placeholder="30"
            />
            <p className="text-xs text-muted-foreground">
              Estimasi waktu yang dibutuhkan untuk menyelesaikan modul.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Menyimpan…
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  Simpan Perubahan
                </>
              )}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/learning">Batal</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
