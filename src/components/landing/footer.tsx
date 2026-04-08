"use client";

import { Globe2, X, Link, Camera } from "lucide-react";
import { useTranslations } from "@/lib/translations";

export function Footer() {
  const { t } = useTranslations();

  return (
    <footer id="site-footer" className="py-0 md:py-6 pb-8 md:pb-10">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-y-8 gap-x-4 md:gap-6 p-6 md:p-6 border border-border rounded-xl bg-card">
          {/* Brand - spans full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 text-[15px] font-semibold whitespace-nowrap">
              <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Globe2 className="size-4" />
              </div>
              <span>Remonest</span>
            </div>
            <p className="mt-3 mb-0 text-sm leading-relaxed text-muted-foreground">
              {t.footer.description}
            </p>
          </div>

          {/* Platform */}
          <div>
            <p className="m-0 mb-3 text-sm leading-[1.4] font-semibold">
              {t.footer.product}
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="#"
                className="text-sm text-muted-foreground no-underline whitespace-nowrap hover:text-foreground transition-colors"
              >
                {t.footer.links.jobBoard}
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground no-underline whitespace-nowrap hover:text-foreground transition-colors"
              >
                {t.footer.links.learningModules}
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground no-underline whitespace-nowrap hover:text-foreground transition-colors"
              >
                {t.footer.links.portfolioBuilder}
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="m-0 mb-3 text-sm leading-[1.4] font-semibold">
              {t.footer.company}
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="#"
                className="text-sm text-muted-foreground no-underline whitespace-nowrap hover:text-foreground transition-colors"
              >
                {t.footer.links.about}
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground no-underline whitespace-nowrap hover:text-foreground transition-colors"
              >
                {t.footer.links.successStories}
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground no-underline whitespace-nowrap hover:text-foreground transition-colors"
              >
                {t.footer.links.contact}
              </a>
            </div>
          </div>

          {/* Legal */}
          <div className="col-span-2 md:col-span-1">
            <p className="m-0 mb-3 text-sm leading-[1.4] font-semibold">
              {t.footer.legal}
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="#"
                className="text-sm text-muted-foreground no-underline whitespace-nowrap hover:text-foreground transition-colors"
              >
                {t.footer.links.termsConditions}
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground no-underline whitespace-nowrap hover:text-foreground transition-colors"
              >
                {t.footer.links.privacyPolicy}
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground no-underline whitespace-nowrap hover:text-foreground transition-colors"
              >
                {t.footer.links.cookieSettings}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 mt-6 px-1">
          <div className="text-[13px] text-muted-foreground">
            © {new Date().getFullYear()} Remonest. {t.footer.allRightsReserved}
          </div>
          <div className="flex gap-2 items-center">
            <a
              href="#"
              aria-label={t.footer.social.twitter}
              className="w-10 h-10 md:w-9 md:h-9 border border-border rounded-md flex items-center justify-center bg-card text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </a>
            <a
              href="#"
              aria-label={t.footer.social.linkedin}
              className="w-10 h-10 md:w-9 md:h-9 border border-border rounded-md flex items-center justify-center bg-card text-muted-foreground hover:text-foreground transition-colors"
            >
              <Link className="size-4" />
            </a>
            <a
              href="#"
              aria-label={t.footer.social.instagram}
              className="w-10 h-10 md:w-9 md:h-9 border border-border rounded-md flex items-center justify-center bg-card text-muted-foreground hover:text-foreground transition-colors"
            >
              <Camera className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}