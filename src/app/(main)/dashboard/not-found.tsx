"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  LayoutDashboard,
  ArrowLeft,
  ShieldCheck,
  Mail,
  BriefcaseBusiness,
  FileUser,
  LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/translations";

export default function DashboardNotFoundPage() {
  const router = useRouter();
  const { t } = useTranslations();

  return (
    <>
      <section className="py-8 pb-16">
        <div className="w-full max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr] gap-6 p-6 border border-border rounded-xl bg-gradient-to-b from-card to-secondary max-w-[1160px] mx-auto">
            {/* Left Content Panel */}
            <div className="min-w-0 rounded-xl bg-card p-10 flex flex-col justify-between">
              <div>
                {/* Top Line */}
                <div className="flex items-center gap-3 flex-wrap mb-7">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                    <Compass className="w-8 h-8 text-primary" />
                  </div>
                  <div className="h-8 px-3 rounded-full bg-secondary text-secondary-foreground inline-flex items-center text-xs font-semibold whitespace-nowrap">
                    {t.notFound.badge}
                  </div>
                </div>

                {/* Heading Section */}
                <div className="mb-9">
                  <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase mb-3.5">
                    {t.notFound.kicker}
                  </p>
                  <h1 className="text-[88px] leading-[0.94] font-extrabold tracking-[-0.05em] text-foreground mb-3">
                    {t.notFound.code}
                  </h1>
                  <h2 className="text-4xl leading-[1.12] font-bold tracking-[-0.03em] text-foreground mb-4 max-w-[640px]">
                    {t.notFound.title}
                  </h2>
                  <p className="text-base leading-[1.65] text-muted-foreground max-w-[620px]">
                    {t.notFound.description}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 flex-wrap mb-5">
                <Link href="/dashboard" className="no-underline">
                  <Button
                    size="default"
                    className="min-w-[190px] h-11 px-6 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <span className="w-5 h-5 flex items-center justify-center">
                      <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
                    </span>
                    {t.notFound.returnDashboard}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="default"
                  className="min-w-[190px] h-11 px-6 gap-2 border-border text-foreground hover:bg-secondary"
                  onClick={() => router.back()}
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 text-secondary-foreground" />
                  </span>
                  {t.notFound.goBack}
                </Button>
              </div>

              {/* Help Info */}
              <div className="flex items-center gap-5 flex-wrap">
                <div className="inline-flex items-center gap-2 text-sm leading-[1.5] text-muted-foreground whitespace-nowrap">
                  <span className="w-5 h-5 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                  </span>
                  {t.notFound.progressSafe}
                </div>
                <div className="inline-flex items-center gap-2 text-sm leading-[1.5] text-muted-foreground whitespace-nowrap">
                  <span className="w-5 h-5 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </span>
                  {t.notFound.contactSupport}
                </div>
              </div>
            </div>

            {/* Right Detail Panel */}
            <div className="min-w-0 rounded-xl bg-gradient-to-b from-accent to-card p-7">
              {/* Panel Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs leading-[1.4] text-muted-foreground mb-2">
                    Recommended next steps
                  </p>
                  <h3 className="text-2xl leading-[1.2] font-bold text-foreground">
                    {t.notFound.recommendedTitle}
                  </h3>
                </div>
                <div className="h-8 px-3 rounded-full bg-card text-accent-foreground inline-flex items-center text-xs font-semibold whitespace-nowrap shrink-0">
                  {t.notFound.recommendedChip}
                </div>
              </div>

              {/* Recommended Links */}
              <div className="grid grid-cols-1 gap-3">
                <Link
                  href="/dashboard"
                  className="min-w-0 p-4 rounded-lg bg-card flex items-start gap-3 hover:bg-secondary/50 transition-colors no-underline group"
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {t.notFound.links.dashboard.title}
                    </div>
                    <div className="text-xs leading-[1.55] text-muted-foreground mt-1">
                      {t.notFound.links.dashboard.description}
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/jobs"
                  className="min-w-0 p-4 rounded-lg bg-card flex items-start gap-3 hover:bg-secondary/50 transition-colors no-underline group"
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                    <BriefcaseBusiness className="w-4 h-4 text-primary" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {t.notFound.links.jobs.title}
                    </div>
                    <div className="text-xs leading-[1.55] text-muted-foreground mt-1">
                      {t.notFound.links.jobs.description}
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/applications"
                  className="min-w-0 p-4 rounded-lg bg-card flex items-start gap-3 hover:bg-secondary/50 transition-colors no-underline group"
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                    <FileUser className="w-4 h-4 text-primary" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {t.notFound.links.portfolio.title}
                    </div>
                    <div className="text-xs leading-[1.55] text-muted-foreground mt-1">
                      {t.notFound.links.portfolio.description}
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/settings"
                  className="min-w-0 p-4 rounded-lg bg-card flex items-start gap-3 hover:bg-secondary/50 transition-colors no-underline group"
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                    <LifeBuoy className="w-4 h-4 text-primary" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {t.notFound.links.support.title}
                    </div>
                    <div className="text-xs leading-[1.55] text-muted-foreground mt-1">
                      {t.notFound.links.support.description}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
