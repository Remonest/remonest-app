"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  FileText,
  Link as LinkIcon,
  Trash2,
  Edit,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MaterialForm } from "./material-form";
import { ResourceForm } from "./resource-form";
import {
  deleteLearningMaterial,
  deleteLearningResource,
  updateLearningMaterial,
} from "@/features/learning-module/actions/materials";
import { toast } from "sonner";
import type {
  LearningMaterial,
  LearningResource,
} from "@/features/learning-module/types/materials";

interface MaterialListClientProps {
  module: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
  materials: LearningMaterial[];
  resources: LearningResource[];
}

export function MaterialListClient({
  module,
  materials,
  resources,
}: MaterialListClientProps) {
  const [localMaterials, setLocalMaterials] =
    useState<LearningMaterial[]>(materials);
  const [localResources, setLocalResources] =
    useState<LearningResource[]>(resources);
  const [editingMaterial, setEditingMaterial] =
    useState<LearningMaterial | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("Hapus materi ini?")) return;
    const result = await deleteLearningMaterial(id);
    if (result.success) {
      setLocalMaterials((prev) => prev.filter((m) => m.id !== id));
      toast.success("Materi berhasil dihapus");
    } else {
      toast.error(result.error || "Gagal menghapus materi");
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Hapus resource ini?")) return;
    const result = await deleteLearningResource(id);
    if (result.success) {
      setLocalResources((prev) => prev.filter((r) => r.id !== id));
      toast.success("Resource berhasil dihapus");
    } else {
      toast.error(result.error || "Gagal menghapus resource");
    }
  };

  const handleTogglePublish = async (material: LearningMaterial) => {
    const result = await updateLearningMaterial(material.id, {
      isPublished: !material.is_published,
    });
    if (result.success) {
      setLocalMaterials((prev) =>
        prev.map((m) =>
          m.id === material.id ? { ...m, is_published: !m.is_published } : m,
        ),
      );
      toast.success(
        material.is_published ? "Materi diarsipkan" : "Materi dipublikasikan",
      );
    } else {
      toast.error(result.error || "Gagal mengubah status");
    }
  };

  const sourceTypeLabels: Record<string, string> = {
    article: "Artikel",
    video: "Video",
    documentation: "Dokumentasi",
    tutorial: "Tutorial",
  };

  const resourceTypeLabels: Record<string, string> = {
    tool: "Tools",
    template: "Template",
    ebook: "E-book",
    checklist: "Checklist",
    cheatsheet: "Cheatsheet",
    pdf: "PDF",
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/learning">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{module.title}</h1>
            <p className="text-muted-foreground">
              Kelola materi dan resource pembelajaran
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Materi</CardDescription>
            <CardTitle>{localMaterials.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Terpublikasi</CardDescription>
            <CardTitle>
              {localMaterials.filter((m) => m.is_published).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Resource</CardDescription>
            <CardTitle>{localResources.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Gratis</CardDescription>
            <CardTitle>
              {localResources.filter((r) => r.is_free).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Materials Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5" />
                Materi Pembelajaran
              </CardTitle>
              <CardDescription>
                Artikel, video, dokumentasi, dan tutorial
              </CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Materi
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tambah Materi Baru</DialogTitle>
                  <DialogDescription>
                    Tambahkan artikel, video, atau materi pembelajaran lainnya
                  </DialogDescription>
                </DialogHeader>
                <MaterialForm
                  moduleId={module.id}
                  onClose={() => {
                    setCreateDialogOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {localMaterials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada materi pembelajaran</p>
              <p className="text-sm">
                Klik &ldquo;Tambah Materi&ldquo; untuk memulai
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {localMaterials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{material.title}</h3>
                      {material.is_published ? (
                        <Badge variant="default" className="text-xs">
                          Terbit
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Draft
                        </Badge>
                      )}
                      {material.source_type && (
                        <Badge variant="outline" className="text-xs">
                          {sourceTypeLabels[material.source_type] ||
                            material.source_type}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {material.difficulty}
                      </Badge>
                    </div>
                    {material.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {material.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {material.reading_time_minutes && (
                        <span>{material.reading_time_minutes} menit</span>
                      )}
                      <span>
                        {material.language === "id" ? "🇮🇩" : "🇬🇧"}{" "}
                        {material.language}
                      </span>
                      {material.tags && material.tags.length > 0 && (
                        <span>#{material.tags.slice(0, 3).join(" #")}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublish(material)}
                    >
                      {material.is_published ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingMaterial(material);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMaterial(material.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resources Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 mb-2">
                <LinkIcon className="h-5 w-5" />
                Resource Tambahan
              </CardTitle>
              <CardDescription>
                Tools, template, ebook, checklist, dan cheatsheet
              </CardDescription>
            </div>
            <Dialog
              open={resourceDialogOpen}
              onOpenChange={setResourceDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Tambah Resource Baru</DialogTitle>
                  <DialogDescription>
                    Tambahkan link, tools, template, atau resource lainnya
                  </DialogDescription>
                </DialogHeader>
                <ResourceForm
                  moduleId={module.id}
                  onClose={() => {
                    setResourceDialogOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {localResources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <LinkIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada resource tambahan</p>
              <p className="text-sm">
                Klik &ldquo;Tambah Resource&ldquo; untuk memulai
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {localResources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{resource.title}</h3>
                      {resource.resource_type && (
                        <Badge variant="outline" className="text-xs">
                          {resourceTypeLabels[resource.resource_type] ||
                            resource.resource_type}
                        </Badge>
                      )}
                      {resource.is_free ? (
                        <Badge variant="secondary" className="text-xs">
                          Gratis
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs">
                          Berbayar
                        </Badge>
                      )}
                    </div>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {resource.description}
                      </p>
                    )}
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline truncate block mt-1"
                      >
                        {resource.url}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteResource(resource.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Material Dialog - Outside the loop */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Materi</DialogTitle>
            <DialogDescription>
              Ubah detail materi pembelajaran
            </DialogDescription>
          </DialogHeader>
          <MaterialForm
            moduleId={module.id}
            material={editingMaterial}
            onClose={() => {
              setEditDialogOpen(false);
              setEditingMaterial(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
