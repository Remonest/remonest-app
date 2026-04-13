"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Archive,
  Trash2,
  FileText,
  Loader2,
  Pencil,
  Layers,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  updateLearningModuleStatus,
  deleteLearningModule,
} from "@/lib/learning/actions";
import { useRouter } from "next/navigation";

interface LearningActionsProps {
  moduleId: string;
  moduleTitle: string;
  currentStatus: "draft" | "published" | "archived";
}

export function LearningActions({
  moduleId,
  moduleTitle,
  currentStatus,
}: LearningActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handlePublish = () => {
    startTransition(async () => {
      const result = await updateLearningModuleStatus(moduleId, "published");
      if (result.success) {
        toast.success(`"${moduleTitle}" berhasil dipublikasi`, {
          description: "Modul sekarang terlihat oleh pengguna.",
        });
        router.refresh();
      } else {
        toast.error("Gagal mempublikasi modul", {
          description: result.error,
        });
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      const result = await updateLearningModuleStatus(moduleId, "archived");
      if (result.success) {
        toast.success(`"${moduleTitle}" berhasil diarsipkan`, {
          description: "Modul tidak lagi terlihat oleh pengguna.",
        });
        router.refresh();
      } else {
        toast.error("Gagal mengarsipkan modul", {
          description: result.error,
        });
      }
    });
  };

  const handleDraft = () => {
    startTransition(async () => {
      const result = await updateLearningModuleStatus(moduleId, "draft");
      if (result.success) {
        toast.success(`"${moduleTitle}" dikembalikan ke draft`, {
          description: "Modul dalam status draft.",
        });
        router.refresh();
      } else {
        toast.error("Gagal mengubah status modul", {
          description: result.error,
        });
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteLearningModule(moduleId);
      if (result.success) {
        toast.success(`"${moduleTitle}" berhasil dihapus`, {
          description: "Modul telah dihapus secara permanen.",
        });
        setDeleteOpen(false);
        router.refresh();
      } else {
        toast.error("Gagal menghapus modul", {
          description: result.error,
        });
      }
    });
  };

  return (
    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/admin/learning/${moduleId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/learning/${moduleId}/materials`}>
              <Layers className="mr-2 h-4 w-4" />
              <span>Kelola Materi</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/learning/${moduleId}/quiz`}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Kelola Kuis</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/learning/${moduleId}/lessons`}>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Kelola Pelajaran</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {currentStatus !== "published" && (
            <DropdownMenuItem onClick={handlePublish}>
              <Eye className="mr-2 h-4 w-4 text-green-600" />
              <span>Publikasi</span>
            </DropdownMenuItem>
          )}
          {currentStatus !== "draft" && (
            <DropdownMenuItem onClick={handleDraft}>
              <FileText className="mr-2 h-4 w-4 text-blue-600" />
              <span>Kembalikan ke Draft</span>
            </DropdownMenuItem>
          )}
          {currentStatus !== "archived" && (
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="mr-2 h-4 w-4 text-amber-600" />
              <span>Arsipkan</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Hapus</span>
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Modul Learning</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus modul &quot;{moduleTitle}&quot;?
            Tindakan ini tidak dapat dibatalkan dan semua data terkait akan
            hilang.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteOpen(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghapus…
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Modul
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
