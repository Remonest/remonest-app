import { Globe2, Download, ExternalLink, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CertificatePreviewProps {
  userName: string;
  moduleTitle: string;
  certificateId?: string;
  issuedDate?: string;
  isCompleted?: boolean;
  className?: string;
}

export function CertificatePreview({
  userName,
  moduleTitle,
  certificateId = "RMN-2026-0001",
  issuedDate,
  isCompleted = false,
  className,
}: CertificatePreviewProps) {
  const formattedDate = issuedDate
    ? new Date(issuedDate).toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      })
    : "Apr 2026";

  return (
    <div className={cn("rounded-xl border bg-card p-6", className)}>
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
          <Award className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Sertifikat Terverifikasi</h3>
          <p className="text-sm text-muted-foreground">
            {isCompleted 
              ? "Selamat! Anda telah menyelesaikan modul ini dan berhak mendapatkan sertifikat."
              : "Setelah menyelesaikan, Anda akan menerima sertifikat yang dapat ditambahkan langsung ke profil LinkedIn Anda."
            }
          </p>
        </div>
      </div>

      {/* Certificate Preview Card */}
      <div className={cn(
        "overflow-hidden rounded-lg border p-8 text-center relative",
        isCompleted 
          ? "bg-linear-to-br from-emerald-50 to-emerald-100/30 border-emerald-200" 
          : "bg-linear-to-br from-card to-secondary"
      )}>
        {/* Success Badge Overlay */}
        {isCompleted && (
          <div className="absolute top-4 right-4">
            <div className="bg-emerald-500 text-white rounded-full p-1 shadow-lg">
              <Globe2 className="size-4" />
            </div>
          </div>
        )}

        {/* Logo */}
        <div className={cn(
          "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded shadow-sm",
          isCompleted ? "bg-emerald-600 text-white" : "bg-primary text-primary-foreground"
        )}>
          <Globe2 className="h-6 w-6" />
        </div>

        {/* Title */}
        <div className="mb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Sertifikat Penyelesaian
        </div>

        {/* "is hereby granted to" */}
        <div className="mb-2 text-[10px] text-muted-foreground">
          diberikan kepada
        </div>

        {/* User Name */}
        <div className={cn(
          "mb-3 text-xl font-bold truncate",
          isCompleted ? "text-emerald-700" : "text-primary"
        )}>
          {userName}
        </div>

        {/* Module Title */}
        <div className="mb-4 text-xs font-medium line-clamp-1">{moduleTitle}</div>

        {/* Certificate ID and Date */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <span>ID: {certificateId}</span>
          <span>•</span>
          <span>Diterbitkan: {formattedDate}</span>
        </div>
      </div>

      {/* CTA Button */}
      {isCompleted && (
        <div className="mt-6 flex flex-col gap-2">
          <Link href={`/certificates/${certificateId}`} className="block">
            <Button className="w-full gap-2 font-bold h-11 bg-emerald-600 hover:bg-emerald-700">
              <Download className="size-4" />
              Unduh Sertifikat
            </Button>
          </Link>
          <Link href={`/certificates/${certificateId}`} className="block">
            <Button variant="outline" className="w-full gap-2 font-bold h-11">
              <ExternalLink className="size-4" />
              Lihat Versi Publik
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
