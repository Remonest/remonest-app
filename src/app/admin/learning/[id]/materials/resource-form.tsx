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
import { createLearningResource } from "@/features/learning-module/actions/materials";
import type { ResourceFileType } from "@/features/learning-module/types/materials";

interface ResourceFormProps {
  moduleId: string;
}

export function ResourceForm({ moduleId }: ResourceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [resourceType, setResourceType] = useState<ResourceFileType | "">("");
  const [isFree, setIsFree] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul wajib diisi");
      return;
    }
    if (!url.trim()) {
      toast.error("URL wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const result = await createLearningResource(moduleId, {
        title,
        description,
        url,
        resourceType,
        isFree,
      });

      if (result.success) {
        toast.success("Resource berhasil dibuat");
        router.refresh();
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
        <Label htmlFor="title">Judul Resource *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Template CV ATS-Friendly"
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi singkat tentang resource ini"
          rows={3}
        />
      </div>

      {/* URL */}
      <div>
        <Label htmlFor="url">URL *</Label>
        <Input
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          type="url"
          required
        />
      </div>

      {/* Resource Type */}
      <div>
        <Label htmlFor="resourceType">Tipe Resource</Label>
        <Select value={resourceType} onValueChange={(v) => setResourceType(v as ResourceFileType)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tool">Tools</SelectItem>
            <SelectItem value="template">Template</SelectItem>
            <SelectItem value="ebook">E-book</SelectItem>
            <SelectItem value="checklist">Checklist</SelectItem>
            <SelectItem value="cheatsheet">Cheatsheet</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Is Free Toggle */}
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div>
          <Label htmlFor="isFree">Gratis</Label>
          <p className="text-xs text-muted-foreground">
            Resource ini dapat diakses secara gratis
          </p>
        </div>
        <Switch
          id="isFree"
          checked={isFree}
          onCheckedChange={setIsFree}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Simpan Resource
        </Button>
      </div>
    </form>
  );
}
