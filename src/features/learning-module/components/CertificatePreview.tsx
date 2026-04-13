import { Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CertificatePreviewProps {
  userName: string;
  moduleTitle: string;
  certificateId?: string;
  issuedDate?: string;
  className?: string;
}

export function CertificatePreview({
  userName,
  moduleTitle,
  certificateId = "RMN-2026-0001",
  issuedDate,
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
        <div className="flex h-7.5 w-[20%] items-center justify-center rounded-full bg-secondary">
          <Globe2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Sertifikat Terverifikasi</h3>
          <p className="text-sm text-muted-foreground">
            Setelah menyelesaikan, Anda akan menerima sertifikat yang dapat
            ditambahkan langsung ke profil LinkedIn Anda.
          </p>
        </div>
      </div>

      {/* Certificate Preview */}
      <div className="overflow-hidden rounded-lg border bg-linear-to-br from-card to-secondary p-8 text-center">
        {/* Logo */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded bg-primary text-primary-foreground">
          <Globe2 className="h-6 w-6" />
        </div>

        {/* Title */}
        <div className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Sertifikat Penyelesaian
        </div>

        {/* "is hereby granted to" */}
        <div className="mb-2 text-xs text-muted-foreground">
          diberikan kepada
        </div>

        {/* User Name */}
        <div className="mb-3 text-2xl font-bold text-primary">{userName}</div>

        {/* Module Title */}
        <div className="mb-4 text-sm font-medium">{moduleTitle}</div>

        {/* Certificate ID and Date */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>ID: {certificateId}</span>
          <span>•</span>
          <span>Diterbitkan: {formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
