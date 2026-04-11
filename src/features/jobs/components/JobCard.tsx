"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobTypeBadge } from "@/features/jobs/components/JobTypeBadge";
import { VerificationBadge } from "@/features/jobs/components/VerificationBadge";
import { StatusBadge } from "@/features/jobs/components/StatusBadge";
import { CalendarDays, MapPin, ExternalLink } from "lucide-react";
import {
  formatSalary,
  formatDeadline,
} from "@/features/jobs/utils/formatters";
import type { JobType, JobStatus } from "@/features/jobs/types/job";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  job_type: JobType | null | undefined;
  salary_min: number | null | undefined;
  salary_max: number | null | undefined;
  salary_currency: string | undefined;
  location: string;
  apply_url: string | null | undefined;
  apply_email: string | null | undefined;
  deadline: string | null | undefined;
  is_verified_by_admin: boolean;
  showStatus?: boolean;
  status?: JobStatus;
}

export function JobCard({
  title,
  company,
  job_type,
  salary_min,
  salary_max,
  salary_currency,
  location,
  apply_url,
  apply_email,
  deadline,
  is_verified_by_admin,
  showStatus = false,
  status,
}: JobCardProps) {
  const handleApply = () => {
    if (apply_url) {
      window.open(apply_url, "_blank", "noopener,noreferrer");
    } else if (apply_email) {
      window.location.href = `mailto:${apply_email}?subject=Lamaran untuk ${title}`;
    }
  };

  const formattedDeadline = formatDeadline(deadline ?? null);

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm truncate">{company}</p>
          </div>
          {is_verified_by_admin && <VerificationBadge />}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <JobTypeBadge type={job_type} />

        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-muted-foreground">Gaji:</span>
          <span className="text-foreground">
            {formatSalary(salary_min ?? null, salary_max ?? null, salary_currency ?? "IDR")}
            {job_type === "full-time" && salary_max && (
              <span className="text-muted-foreground text-xs ml-1">
                / bulan
              </span>
            )}
            {job_type === "part-time" && salary_max && (
              <span className="text-muted-foreground text-xs ml-1">
                / bulan
              </span>
            )}
            {job_type === "freelance" && salary_max && (
              <span className="text-muted-foreground text-xs ml-1">
                / proyek
              </span>
            )}
            {job_type === "project" && salary_max && (
              <span className="text-muted-foreground text-xs ml-1">
                / proyek
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{location}</span>
        </div>

        {formattedDeadline && (
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              Deadline: {formattedDeadline}
            </span>
          </div>
        )}

        {showStatus && status && (
          <div className="pt-2 border-t">
            <StatusBadge status={status} />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={handleApply}
          className="w-full group-hover:scale-[1.02] transition-transform p-5"
          disabled={!apply_url && !apply_email}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Lamar Sekarang
        </Button>
      </CardFooter>
    </Card>
  );
}
