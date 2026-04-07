import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { type JobStatus, statusLabels } from "@/lib/admin/mock-data";

interface StatusBadgeProps {
  status: JobStatus;
}

const statusConfig: Record<JobStatus, { icon: React.ComponentType<{ className?: string }>; variant: "default" | "destructive" | "secondary" }> = {
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
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1.5 px-2.5 py-1">
      <Icon className="h-3.5 w-3.5" />
      {statusLabels[status]}
    </Badge>
  );
}
