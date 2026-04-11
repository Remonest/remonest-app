"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { saveLearningModule } from "@/lib/learning/actions";
import type { LearningModuleResult } from "@/lib/learning/schemas";
import { LEARNING_CATEGORIES, CATEGORY_LABELS } from "@/lib/learning/schemas";
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

const initialState: LearningModuleResult = { success: false };

function NewLearningModuleForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveLearningModule,
    initialState
  );

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    if (state?.success) {
      toast.success("Modul berhasil dibuat!");
      router.push("/admin/learning");
    }
  }, [state]);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Buat Modul Baru</CardTitle>
        <CardDescription>
          Buat modul pembelajaran baru untuk pengguna Remonest.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="Contoh: Dasar Komunikasi Async"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select name="category" required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {LEARNING_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Ringkasan singkat tentang apa yang akan dipelajari..."
              className="min-h-[100px] resize-y"
              required
            />
            <p className="text-xs text-muted-foreground">
              Deskripsi singkat yang terlihat oleh pengguna di katalog.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Menyimpan…
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  Simpan Modul
                </>
              )}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/learning">
                <ArrowLeft className="mr-2 size-4" />
                Batal
              </Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function NewLearningModulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link href="/admin/learning">
            <ArrowLeft className="size-4" />
            Kembali ke Learning
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Buat Modul Pembelajaran
        </h1>
        <p className="text-sm text-muted-foreground">
          Tambahkan modul baru ke katalog pembelajaran Remonest.
        </p>
      </div>

      <NewLearningModuleForm />
    </div>
  );
}
