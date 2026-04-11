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
import {
  Loader2,
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  createLearningMaterial,
  updateLearningMaterial,
} from "@/features/learning-module/actions/materials";
import type {
  LearningMaterial,
  MaterialDifficulty,
  SourceType,
} from "@/features/learning-module/types/materials";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for PDFs
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

interface MaterialFormProps {
  moduleId: string;
  material?: LearningMaterial | null;
  onClose?: () => void;
}

export function MaterialForm({
  moduleId,
  material,
  onClose,
}: MaterialFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState(material?.title || "");
  const [content, setContent] = useState(material?.content || "");
  const [summary, setSummary] = useState(material?.summary || "");
  const [sourceUrl, setSourceUrl] = useState(material?.source_url || "");
  const [fileUrl, setFileUrl] = useState(material?.file_url || "");
  const [fileName, setFileName] = useState("");
  const [sourceType, setSourceType] = useState<"" | SourceType>(
    material?.source_type || "",
  );
  const [language, setLanguage] = useState(material?.language || "id");
  const [readingTime, setReadingTime] = useState<number | "">(
    material?.reading_time_minutes || "",
  );
  const [difficulty, setDifficulty] = useState<MaterialDifficulty>(
    material?.difficulty || "beginner",
  );
  const [tags, setTags] = useState(material?.tags?.join(", ") || "");
  const [isPublished, setIsPublished] = useState(
    material?.is_published || false,
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf";
    const isImage = ALLOWED_TYPES.includes(file.type) && !isPdf;
    const maxSize = isPdf ? MAX_FILE_SIZE : MAX_IMAGE_SIZE;

    if (file.size > maxSize) {
      const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      toast.error(`Ukuran file maksimal ${sizeMB}MB untuk ${isPdf ? "PDF" : "gambar"}`);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Hanya PDF dan gambar (JPEG, PNG, WebP, GIF) yang didukung");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal mengupload file");
        return;
      }

      setFileUrl(data.url);
      setFileName(file.name);
      toast.success("File berhasil diupload");
    } catch {
      toast.error("Gagal mengupload file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeFile = () => {
    setFileUrl("");
    setFileName("");
  };

  const [videoUrlWarning, setVideoUrlWarning] = useState("");
  const [checkingVideo, setCheckingVideo] = useState(false);

  const checkYouTubeVideo = async (url: string) => {
    const ytMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );
    if (!ytMatch) return;

    setCheckingVideo(true);
    setVideoUrlWarning("");

    try {
      const videoId = ytMatch[1];
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      if (!res.ok) {
        setVideoUrlWarning(
          "Video tidak ditemukan atau tidak publik. Pastikan URL video YouTube dapat diakses secara publik."
        );
      }
    } catch {
      setVideoUrlWarning(
        "Gagal memeriksa video. Pastikan URL video YouTube benar dan dapat diakses."
      );
    } finally {
      setCheckingVideo(false);
    }
  };

  const handleSourceUrlChange = (url: string) => {
    setSourceUrl(url);

    if (sourceType === "video" && url) {
      const isYoutube = /(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url);
      if (isYoutube) {
        checkYouTubeVideo(url);
      } else {
        setVideoUrlWarning("");
      }
    } else {
      setVideoUrlWarning("");
    }
  };

  const isImage = fileUrl && /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(fileUrl);
  const isPdf = fileUrl && /\.(pdf)(\?.*)?$/i.test(fileUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul wajib diisi");
      return;
    }

    if (sourceType === "video" && !sourceUrl.trim()) {
      toast.error("URL video wajib diisi untuk tipe video");
      return;
    }

    if (videoUrlWarning && sourceType === "video") {
      toast.error("Perbaiki URL video sebelum menyimpan");
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
            fileUrl,
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
            fileUrl,
            language,
            readingTimeMinutes: readingTime,
            difficulty,
            tags,
            isPublished,
          });

      if (result.success) {
        toast.success(
          material ? "Materi berhasil diupdate" : "Materi berhasil dibuat",
        );
        router.refresh();
        onClose?.();
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
        <Label htmlFor="title" className="mb-2">
          Judul Materi *
        </Label>
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
        <Label htmlFor="summary" className="mb-2">
          Ringkasan
        </Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Ringkasan singkat dalam Bahasa Indonesia"
          rows={2}
        />
      </div>

      {/* File Upload */}
      <div>
        <Label className="mb-2">Upload File (PDF / Gambar)</Label>

        {/* Upload area */}
        {!fileUrl && (
          <label
            className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              uploading
                ? "border-primary/50 bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <div className="flex flex-col items-center justify-center py-2">
              {uploading ? (
                <>
                  <Loader2 className="h-6 w-6 text-muted-foreground animate-spin mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Mengupload...
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Klik untuk upload (PDF max 5MB, gambar max 10MB)
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    PDF, JPEG, PNG, WebP, GIF
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        )}

        {/* Uploaded file preview */}
        {fileUrl && (
          <div className="relative rounded-lg border bg-muted/30 overflow-hidden">
            {/* Image preview */}
            {isImage && (
              <div className="relative">
                <img
                  src={fileUrl}
                  alt={fileName}
                  className="w-full h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* PDF preview */}
            {isPdf && (
              <div className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fileName}</p>
                  <p className="text-xs text-muted-foreground">PDF Document</p>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1.5 rounded-md hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Generic file */}
            {!isImage && !isPdf && (
              <div className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fileName}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Uploaded
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1.5 rounded-md hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <Label htmlFor="content" className="mb-2">
          Konten (Markdown)
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="# Header\n\nIsi materi dalam format Markdown..."
          rows={6}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Opsional — gunakan jika file yang diupload perlu penjelasan tambahan
        </p>
      </div>

      {/* Source Type & URL */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sourceType" className="mb-2">
            Tipe Sumber
          </Label>
          <Select
            value={sourceType}
            onValueChange={(v) => setSourceType(v as "" | SourceType)}
          >
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
          <Label htmlFor="sourceUrl" className="mb-2">
            {sourceType === "video" ? "URL Video *" : "URL Sumber (opsional)"}
          </Label>
          <Input
            id="sourceUrl"
            value={sourceUrl}
            onChange={(e) => handleSourceUrlChange(e.target.value)}
            placeholder={
              sourceType === "video"
                ? "https://www.youtube.com/watch?v=..."
                : "https://..."
            }
            type="url"
            required={sourceType === "video"}
          />
          {checkingVideo && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Memeriksa video...
            </p>
          )}
          {videoUrlWarning && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {videoUrlWarning}
            </p>
          )}
        </div>
      </div>

      {/* Difficulty & Language */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="difficulty" className="mb-2">
            Tingkat Kesulitan
          </Label>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as MaterialDifficulty)}
          >
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
          <Label htmlFor="language" className="mb-2">
            Bahasa
          </Label>
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
          <Label htmlFor="readingTime" className="mb-2">
            Estimasi Waktu Baca (menit)
          </Label>
          <Input
            id="readingTime"
            type="number"
            min="0"
            value={readingTime}
            onChange={(e) =>
              setReadingTime(
                e.target.value === "" ? "" : parseInt(e.target.value),
              )
            }
            placeholder="10"
          />
        </div>
        <div>
          <Label htmlFor="tags" className="mb-2">
            Tags (pisahkan koma)
          </Label>
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
          onClick={() => onClose?.()}
          disabled={loading || uploading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading || uploading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {material ? "Update Materi" : "Simpan Materi"}
        </Button>
      </div>
    </form>
  );
}
