"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createLearningMaterial, updateLearningMaterial } from "@/features/learning-module/actions/materials";
import type { LearningMaterial, MaterialDifficulty, SourceType } from "@/features/learning-module/types/materials";

interface MaterialFormProps {
  moduleId: string;
  material?: LearningMaterial | null;
  onSuccess?: () => void;
}

export function MaterialForm({ moduleId, material, onSuccess }: MaterialFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(material?.title || "");
  const [content, setContent] = useState(material?.content || "");
  const [summary, setSummary] = useState(material?.summary || "");
  const [sourceUrl, setSourceUrl] = useState(material?.source_url || "");
  const [sourceType, setSourceType] = useState<"" | SourceType>(material?.source_type || "");
  const [language, setLanguage] = useState(material?.language || "id");
  const [readingTime, setReadingTime] = useState<number | "">(material?.reading_time_minutes || "");
  const [difficulty, setDifficulty] = useState<MaterialDifficulty>(material?.difficulty || "beginner");
  const [tags, setTags] = useState(material?.tags?.join(", ") || "");
  const [isPublished, setIsPublished] = useState(material?.is_published || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const result = material
        ? await updateLearningMaterial(material.id, {
            title,
            content,
            summary,
            sourceUrl,
            sourceType,
            language,
            readingTimeMinutes: readingTime,
            difficulty,
            tags,
            isPublished,
          })
        : await createLearningMaterial(moduleId, {
            title,
            content,
            summary,
            sourceUrl,
            sourceType,
            language,
            readingTimeMinutes: readingTime,
            difficulty,
            tags,
            isPublished,
          });

      if (result.success) {
        toast.success(material ? "Materi berhasil diupdate" : "Materi berhasil dibuat");
        router.refresh();
        onSuccess?.();
      } else {
        toast.error(result.error || "Terjadi kesalahan");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <Label htmlFor="title">Judul Materi *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Mengenal Figma untuk Desainer Remote"
          required
        />
      </div>

      {/* Summary */}
      <div>
        <Label htmlFor="summary">Ringkasan</Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Ringkasan singkat dalam Bahasa Indonesia"
          rows={2}
        />
      </div>

      {/* Content */}
      <div>
        <Label htmlFor="content">Konten (Markdown)</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="# Header\n\nIsi materi dalam format Markdown..."
          rows={8}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Gunakan format Markdown untuk format teks
        </p>
      </div>

      {/* Source Type & URL */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sourceType">Tipe Sumber</Label>
          <Select value={sourceType} onValueChange={(v) => setSourceType(v as "" | SourceType)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="article">Artikel</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="documentation">Dokumentasi</SelectItem>
              <SelectItem value="tutorial">Tutorial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sourceUrl">URL Sumber</Label>
          <Input
            id="sourceUrl"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://..."
            type="url"
          />
        </div>
      </div>

      {/* Difficulty & Language */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as MaterialDifficulty)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="language">Bahasa</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">🇮🇩 Indonesia</SelectItem>
              <SelectItem value="en">🇬🇧 English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reading Time & Tags */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="readingTime">Estimasi Waktu Baca (menit)</Label>
          <Input
            id="readingTime"
            type="number"
            min="0"
            value={readingTime}
            onChange={(e) => setReadingTime(e.target.value === "" ? "" : parseInt(e.target.value))}
            placeholder="10"
          />
        </div>
        <div>
          <Label htmlFor="tags">Tags (pisahkan koma)</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="remote, komunikasi, tools"
          />
        </div>
      </div>

      {/* Published Toggle */}
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div>
          <Label htmlFor="published">Publikasikan</Label>
          <p className="text-xs text-muted-foreground">
            Materi akan terlihat oleh pengguna
          </p>
        </div>
        <Switch
          id="published"
          checked={isPublished}
          onCheckedChange={setIsPublished}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess?.()}
          disabled={loading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {material ? "Update Materi" : "Simpan Materi"}
        </Button>
      </div>
    </form>
  );
}
