"use client";

import { Globe2 } from "lucide-react";
import { useTranslations } from "@/lib/translations";

// Social media SVG icons
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

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

        {/* Footer Bottom Bar */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Remonest. {t.footer.allRightsReserved}
          </p>
          <div className="flex gap-3">
            <a
              href="#"
              aria-label={t.footer.social.twitter}
              className="w-9 h-9 border border-border rounded-md flex items-center justify-center bg-background text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <TwitterIcon className="size-4" />
            </a>
            <a
              href="#"
              aria-label={t.footer.social.linkedin}
              className="w-9 h-9 border border-border rounded-md flex items-center justify-center bg-background text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <LinkedinIcon className="size-4" />
            </a>
            <a
              href="#"
              aria-label={t.footer.social.instagram}
              className="w-9 h-9 border border-border rounded-md flex items-center justify-center bg-background text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <InstagramIcon className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}