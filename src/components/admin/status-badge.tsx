import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

const statusLabels: Record<string, string> = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
  published: "Terbit",
  draft: "Draft",
  expired: "Kedaluwarsa",
};

const statusConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; variant: "default" | "destructive" | "secondary" | "outline" }> = {
  pending: {
    icon: Clock,
    variant: "secondary",
  },
  approved: {
    icon: CheckCircle,
    variant: "default",
  },
  rejected: {
    icon: XCircle,
    variant: "destructive",
  },
  published: {
    icon: CheckCircle2,
    variant: "default",
  },
  draft: {
    icon: FileText,
    variant: "outline",
  },
  expired: {
    icon: AlertCircle,
    variant: "secondary",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    icon: FileText,
    variant: "outline",
  };
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1.5 px-2.5 py-1">
      <Icon className="h-3.5 w-3.5" />
      {statusLabels[status] || status}
    </Badge>
  );
}
