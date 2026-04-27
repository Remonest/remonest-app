"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  File,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LearningBreadcrumb } from "@/components/admin/learning-breadcrumb";
import { pathURL } from "@/lib/learning/schemas";

// ─── Types ───────────────────────────────────────────────────

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  path: string;
  type: string;
  size: number;
  uploadedAt: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

// ─── Constants ───────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ─── Component ───────────────────────────────────────────────

export default function AdminUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [filter, setFilter] = useState<"all" | "images" | "files">("all");

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setIsUploading(true);

    // Initialize progress tracking
    const progressList: UploadProgress[] = fileArray.map((file) => ({
      fileName: file.name,
      progress: 0,
      status: "uploading",
    }));
    setUploadProgress(progressList);

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      // Validate file
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setUploadProgress((prev) =>
          prev.map((p, idx) =>
            idx === i
              ? {
                  ...p,
                  status: "error",
                  error: "Tipe file tidak didukung",
                }
              : p,
          ),
        );
        toast.error(`"${file.name}" - Tipe file tidak didukung`);
        continue;
      }

      const isImage = file.type.startsWith("image/");
      const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

      if (file.size > maxSize) {
        setUploadProgress((prev) =>
          prev.map((p, idx) =>
            idx === i
              ? {
                  ...p,
                  status: "error",
                  error: `Ukuran file melebihi ${maxSize / 1024 / 1024}MB`,
                }
              : p,
          ),
        );
        toast.error(`"${file.name}" - Ukuran file terlalu besar`);
        continue;
      }

      try {
        // Upload file
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          setUploadProgress((prev) =>
            prev.map((p, idx) =>
              idx === i ? { ...p, progress: 100, status: "success" } : p,
            ),
          );

          const newFile: UploadedFile = {
            id: `${Date.now()}-${i}`,
            name: file.name,
            url: `${pathURL}${data.url}`,
            path: data.path,
            type: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          };

          newFiles.push(newFile);
          toast.success(`"${file.name}" berhasil diupload`);
        } else {
          setUploadProgress((prev) =>
            prev.map((p, idx) =>
              idx === i
                ? {
                    ...p,
                    status: "error",
                    error: data.error || "Upload gagal",
                  }
                : p,
            ),
          );
          toast.error(`"${file.name}" - ${data.error || "Upload gagal"}`);
        }
      } catch (error) {
        setUploadProgress((prev) =>
          prev.map((p, idx) =>
            idx === i
              ? {
                  ...p,
                  status: "error",
                  error: "Upload gagal",
                }
              : p,
          ),
        );
        toast.error(`"${file.name}" - Upload gagal`);
      }
    }

    if (newFiles.length > 0) {
      setUploadedFiles((prev) => [...newFiles, ...prev]);
    }

    setIsUploading(false);

    // Clear progress after 3 seconds
    setTimeout(() => {
      setUploadProgress([]);
    }, 3000);
  }, []);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL berhasil disalin ke clipboard");
    } catch {
      toast.error("Gagal menyalin URL");
    }
  };

  // Delete file
  const deleteFile = async (fileId: string, fileName: string) => {
    if (!confirm(`Hapus "${fileName}"?`)) return;

    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    toast.success(`"${fileName}" dihapus dari daftar`);
  };

  // Filter files
  const filteredFiles = uploadedFiles.filter((file) => {
    if (filter === "images") return file.type.startsWith("image/");
    if (filter === "files") return !file.type.startsWith("image/");
    return true;
  });

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file icon
  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon;
    if (type === "application/pdf") return FileText;
    return File;
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <LearningBreadcrumb currentPage="File Manager" />

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">File Manager</h1>
        <p className="text-sm text-muted-foreground">
          Upload and manage images and files for your learning modules.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative rounded-xl border-2 border-dashed p-12 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center text-center">
          <div
            className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
              isDragging ? "bg-primary/10" : "bg-muted"
            }`}
          >
            <Upload
              className={`h-8 w-8 ${
                isDragging ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </div>

          <h3 className="mb-1 text-lg font-semibold">
            {isDragging ? "Drop files here" : "Drag & drop files here"}
          </h3>

          <p className="mb-4 text-sm text-muted-foreground">
            or click to browse from your computer
          </p>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Choose Files"}
          </Button>

          <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
            <span>Images: JPEG, PNG, WebP, GIF (max 10MB)</span>
            <span>•</span>
            <span>Documents: PDF, DOC, XLS (max 10MB)</span>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Upload Progress</h3>
          <div className="space-y-2">
            {uploadProgress.map((progress, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                {progress.status === "uploading" && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {progress.status === "success" && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {progress.status === "error" && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">
                    {progress.fileName}
                  </p>
                  {progress.error && (
                    <p className="text-xs text-destructive">{progress.error}</p>
                  )}
                </div>

                {progress.status === "uploading" && (
                  <span className="text-xs text-muted-foreground">
                    Uploading...
                  </span>
                )}
                {progress.status === "success" && (
                  <Badge
                    variant="default"
                    className="bg-green-500 text-white text-xs"
                  >
                    Success
                  </Badge>
                )}
                {progress.status === "error" && (
                  <Badge variant="destructive" className="text-xs">
                    Failed
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          {/* Header with filters */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Uploaded Files ({filteredFiles.length})
            </h3>

            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "images" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("images")}
              >
                Images
              </Button>
              <Button
                variant={filter === "files" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("files")}
              >
                Files
              </Button>
            </div>
          </div>

          {/* Files grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
              const isImage = file.type.startsWith("image/");

              return (
                <div
                  key={file.id}
                  className="group relative overflow-hidden rounded-lg border bg-card"
                >
                  {/* File preview */}
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    {isImage ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FileIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* File info */}
                  <div className="p-3">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {isImage ? "Image" : "File"}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs"
                        onClick={() => copyToClipboard(file.url)}
                      >
                        <Copy className="h-3 w-3" />
                        Copy URL
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteFile(file.id, file.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {uploadedFiles.length === 0 && uploadProgress.length === 0 && (
        <div className="rounded-xl border bg-card p-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-1 text-sm font-medium">No files uploaded yet</h3>
          <p className="text-sm text-muted-foreground">
            Upload your first file using the area above.
          </p>
        </div>
      )}
    </div>
  );
}
