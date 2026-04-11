"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  X,
  ExternalLink,
  Mail,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle,
} from "lucide-react";
import { publishDraftJobAction } from "@/features/jobs/actions/approve-job";
import { deleteJobAction } from "@/features/jobs/actions/manage-job";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface JobDetailModalProps {
  job: any;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function JobDetailModal({
  job,
  open,
  onClose,
  onRefresh,
}: JobDetailModalProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePublishDraft = async () => {
    if (!job?.id) {
      return;
    }
    setIsPublishing(true);
    try {
      const result = await publishDraftJobAction(job.id);

      if (result.success) {
        toast.success("Draft berhasil diterbitkan", {
          description: `Lowongan "${job.title}" sekarang terlihat oleh pengguna.`,
        });
        onRefresh();
        onClose();
      } else {
        toast.error("Gagal menerbitkan draft", {
          description:
            result.error || "Terjadi kesalahan saat menerbitkan lowongan.",
        });
      }
    } catch (error) {
      toast.error("Gagal menerbitkan draft", {
        description: "Terjadi kesalahan yang tidak terduga.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteDraft = async () => {
    // Safety check: Ensure job object and ID exist
    if (!job?.id) {
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus draft "${job.title}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteJobAction(job.id);

      if (result.success) {
        toast.success("Draft berhasil dihapus", {
          description: `Lowongan "${job.title}" telah dihapus secara permanen.`,
        });
        onRefresh();
        onClose();
      } else {
        toast.error("Gagal menghapus draft", {
          description:
            result.error || "Terjadi kesalahan saat menghapus draft.",
        });
      }
    } catch (error) {
      toast.error("Gagal menghapus draft", {
        description: "Terjadi kesalahan yang tidak terduga.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getJobTypeLabel = (type: string) => {
    // Safety check: Handle undefined or null job types
    if (!type) return "Jenis Tidak Diketahui";

    const labels: Record<string, string> = {
      "full-time": "Penuh Waktu",
      "part-time": "Paruh Waktu",
      project: "Proyek",
      freelance: "Freelance",
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      pending:
        "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      published:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    
    // Safety check: Handle undefined or null status
    if (!status) return colors.draft;
    
    return colors[status] || colors.draft;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {!job ? null : (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-xl font-semibold">
                    {job.title || "Lowongan Kerja"}
                  </DialogTitle>
                  <DialogDescription className="mt-1 flex items-center gap-2">
                    <Badge className={getStatusColor(job.status || "draft")}>
                      {job.status
                        ? job.status.charAt(0).toUpperCase() +
                          job.status.slice(1)
                        : "DRAFT"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Dibuat{" "}
                      {job.created_at
                        ? formatDistanceToNow(new Date(job.created_at), {
                            addSuffix: true,
                          })
                        : "baru saja"}
                    </span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Company Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <FileText className="h-5 w-5 text-primary" />
                  {job.company || "Perusahaan"}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                  )}
                  {job.job_type && (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">
                        {getJobTypeLabel(job.job_type)}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Salary & Duration */}
              <div className="grid grid-cols-2 gap-4">
                {job.salary_min && job.salary_max && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Gaji</span>
                    </div>
                    <div className="text-lg font-semibold">
                      Rp {(job.salary_min / 1000000).toFixed(0)} –{" "}
                      {(job.salary_max / 1000000).toFixed(0)}jt
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        / bulan
                      </span>
                    </div>
                  </div>
                )}
                {job.duration_estimate && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Durasi Estimasi</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {job.duration_estimate}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Apply Method */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Metode Lamar</div>
                <div className="flex items-center gap-2">
                  {job.apply_method === "url" && job.apply_url && (
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {job.apply_url}
                    </a>
                  )}
                  {job.apply_method === "email" && job.apply_email && (
                    <a
                      href={`mailto:${job.apply_email}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {job.apply_email}
                    </a>
                  )}
                </div>
              </div>

              {/* Deadline */}
              {job.deadline && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Batas Lamar</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {new Date(job.deadline).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Description */}
              {job.description_html && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Deskripsi</div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: job.description_html ?? "",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Rejection Reason (only for rejected jobs) */}
              {job.status === "rejected" && job.rejection_reason && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-destructive">
                      Alasan Penolakan
                    </div>
                    <div className="text-sm text-muted-foreground bg-destructive/10 p-3 rounded-md">
                      {job.rejection_reason}
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="gap-2">
              {job.status === "draft" && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleDeleteDraft}
                    disabled={isPublishing || isDeleting}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 p-5"
                  >
                    {isDeleting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Menghapus...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Hapus Draft
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handlePublishDraft}
                    disabled={isPublishing || isDeleting}
                    className="p-5"
                  >
                    {isPublishing ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Menerbitkan...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Terbitkan Draft
                      </>
                    )}
                  </Button>
                </>
              )}
              {job.status !== "draft" && (
                <Button onClick={onClose} variant="outline">
                  Tutup
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
