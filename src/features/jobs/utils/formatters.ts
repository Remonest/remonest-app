import type { JobType, JobStatus } from "@/features/jobs/types/job";

// ============================================================
// Salary Formatting
// ============================================================

export function formatSalary(
  min: number | null,
  max: number | null,
  currency: string = "IDR",
): string {
  if (!min && !max) return "Dirahasikan";

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(0)}jt`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(0)}rb`;
    }
    return num.toString();
  };

  if (min && max && min !== max) {
    return `${currency} ${formatNumber(min)} - ${formatNumber(max)}`;
  } else if (min) {
    return `${currency} ${formatNumber(min)}`;
  } else if (max) {
    return `${currency} ${formatNumber(max)}`;
  }

  return "Dirahasikan";
}

// ============================================================
// Deadline Formatting
// ============================================================

export function formatDeadline(date: Date | string | null): string | null {
  if (!date) return null;

  const deadline = new Date(date);
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "Sudah berakhir";
  } else if (diffDays === 1) {
    return "Besok";
  } else if (diffDays <= 7) {
    return `${diffDays} hari lagi`;
  } else if (diffDays <= 30) {
    return `${Math.ceil(diffDays / 7)} minggu lagi`;
  } else if (diffDays <= 365) {
    return `${Math.ceil(diffDays / 30)} bulan lagi`;
  } else {
    return deadline.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

// ============================================================
// Label Helpers
// ============================================================

export function getJobTypeLabel(type: JobType): string {
  const labels: Record<JobType, string> = {
    "full-time": "Full-Time",
    "part-time": "Part-Time",
    project: "Project",
    freelance: "Freelance",
  };
  return labels[type] || type;
}

export function getStatusLabel(status: JobStatus): string {
  const labels: Record<JobStatus, string> = {
    draft: "Draft",
    pending: "Menunggu Persetujuan",
    approved: "Disetujui",
    rejected: "Ditolak",
    published: "Terbit",
    expired: "Kedaluwarsa",
  };
  return labels[status] || status;
}
