import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  ChevronLeft,
  Building2,
  CalendarDays,
  ExternalLink,
  Mail,
} from "lucide-react";
import { getJobById } from "@/features/jobs/actions/fetch-jobs";
import { JobTypeBadge } from "@/features/jobs/components/JobTypeBadge";
import { VerificationBadge } from "@/features/jobs/components/VerificationBadge";
import {
  formatSalary,
  formatDeadline,
  getJobTypeLabel,
} from "@/features/jobs/utils/formatters";

function formatDate(date: string | null): string {
  if (!date) return "Baru saja";
  const posted = new Date(date);
  const now = new Date();
  const diffTime = now.getTime() - posted.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  if (diffDays <= 7) return `${diffDays} hari yang lalu`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} minggu yang lalu`;
  return posted.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job || job.status !== "published") {
    notFound();
  }

  const applyUrl = job.apply_method === "url" ? job.apply_url : null;
  const applyEmail = job.apply_method === "email" ? job.apply_email : null;

  return (
    <div className="py-8">
      <div className="w-full max-w-[1200px] mx-auto px-8">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 no-underline transition-colors"
        >
          <ChevronLeft className="size-4" />
          Kembali ke lowongan
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-secondary text-primary flex items-center justify-center shrink-0">
            <Briefcase className="size-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {job.title}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <Building2 className="size-4" />
                  <span className="text-sm">{job.company}</span>
                </div>
              </div>
              {job.is_verified_by_admin && <VerificationBadge size="md" />}
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-card mb-6 flex-wrap">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {job.location}
          </span>
          {job.job_type && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-4" />
              {getJobTypeLabel(job.job_type)}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <DollarSign className="size-4" />
            {formatSalary(job.salary_min ?? null, job.salary_max ?? null, job.salary_currency ?? "IDR")}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            Diposting {formatDate(job.published_at ?? job.created_at)}
          </span>
          {job.deadline && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="size-4" />
              Deadline: {formatDeadline(job.deadline)}
            </span>
          )}
          {job.duration_estimate && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-4" />
              Estimasi: {job.duration_estimate}
            </span>
          )}
        </div>

        {/* Job Type Badge */}
        {job.job_type && (
          <div className="mb-6">
            <JobTypeBadge type={job.job_type} />
          </div>
        )}

        {/* Description */}
        {job.description_html && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Deskripsi Pekerjaan
            </h2>
            <div
              className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-li:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: job.description_html }}
            />
          </div>
        )}

        {/* Apply CTA */}
        {(applyUrl || applyEmail) && (
          <div className="p-6 border border-border rounded-xl bg-card text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Tertarik dengan posisi ini?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Kirim lamaran dan portofolio Anda untuk dipertimbangkan dalam
              posisi ini.
            </p>
            {applyUrl ? (
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90 no-underline"
              >
                <ExternalLink className="size-4 mr-2" />
                Lamar Sekarang
              </a>
            ) : applyEmail ? (
              <a
                href={`mailto:${applyEmail}?subject=Lamaran untuk ${job.title}`}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90 no-underline"
              >
                <Mail className="size-4 mr-2" />
                Kirim Email Lamaran
              </a>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
