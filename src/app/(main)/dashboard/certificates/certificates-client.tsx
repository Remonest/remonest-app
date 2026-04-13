"use client";

import { Award, Calendar, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CertificateData } from "@/features/learning-module/types/certificate";

interface CertificatesClientProps {
  certificates: CertificateData[];
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  communication: {
    label: "Communication",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  mindset: {
    label: "Mindset",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  career: {
    label: "Career",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  design: {
    label: "Design",
    color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  },
  productivity: {
    label: "Productivity",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
};

const difficultyConfig: Record<string, { label: string; color: string }> = {
  beginner: {
    label: "Beginner",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  intermediate: {
    label: "Intermediate",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  advanced: {
    label: "Advanced",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function CertificatesClient({ certificates }: CertificatesClientProps) {
  if (certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Award className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          No Certificates Yet
        </h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          Complete a learning module to earn your first certificate.
          Certificates can be shared on your LinkedIn profile.
        </p>
        <Link href="/learning">
          <Button>Browse Learning Modules</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Your Certificates
        </h2>
        <p className="text-sm text-muted-foreground">
          {certificates.length} certificate
          {certificates.length !== 1 ? "s" : ""} earned
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {certificates.map((cert) => {
          const category = categoryConfig[cert.category] ?? {
            label: cert.category,
            color:
              "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
          };
          const difficulty = difficultyConfig[cert.difficulty] ?? {
            label: cert.difficulty,
            color:
              "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
          };
          const completedDate = new Date(cert.completedAt).toLocaleDateString(
            "id-ID",
            { year: "numeric", month: "long", day: "numeric" },
          );

          return (
            <div
              key={cert.certificateId}
              className="rounded-xl border bg-card p-6 transition-colors hover:border-primary/50"
            >
              {/* Certificate Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {cert.certificateId}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {completedDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Info */}
              <h3 className="mb-2 text-base font-semibold text-foreground">
                {cert.moduleTitle}
              </h3>

              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className={category.color}>
                  {category.label}
                </Badge>
                <Badge variant="outline" className={difficulty.color}>
                  {difficulty.label}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link href={`/certificates/${cert.certificateId}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Award className="h-4 w-4" />
                    View Certificate
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${cert.certificateId}`;
                    window.open(
                      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
                      "_blank",
                    );
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
