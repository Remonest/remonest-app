import { Globe2, XIcon, LinkIcon, Camera } from "lucide-react";
import Link from "next/link";

export function DashboardFooter() {
  return (
    <footer className="py-6 sm:py-8">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <div className="p-8 sm:p-12 lg:p-14 border border-border rounded-2xl bg-card">
          <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="max-w-[360px] flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                  <Globe2 className="h-4.5 w-4.5" />
                </div>
                <span className="text-base font-semibold">Remonest</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Empowering Indonesian professionals to build sustainable remote
                careers with practical tools and global-ready guidance.
              </p>
            </div>

            {/* Links Grid */}
            <div className="flex gap-16 sm:gap-20 overflow-x-auto">
              <div className="flex flex-col gap-4 min-w-[140px]">
                <p className="text-sm font-semibold text-foreground">
                  Platform
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Job Board
                  </Link>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Learning Modules
                  </Link>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Portfolio Builder
                  </Link>
                </div>
              </div>
              <div className="flex flex-col gap-4 min-w-[140px]">
                <p className="text-sm font-semibold text-foreground">Company</p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About
                  </Link>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Success Stories
                  </Link>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </div>
              </div>
              <div className="flex flex-col gap-4 min-w-[140px]">
                <p className="text-sm font-semibold text-foreground">Legal</p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms & Conditions
                  </Link>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cookie Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 mt-8 border-t border-border gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Remonest. All rights reserved.
            </p>
            <div className="flex gap-3">
              <Link
                href="#"
                className="w-10 h-10 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <XIcon className="h-4.5 w-4.5" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <LinkIcon className="h-4.5 w-4.5" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <Camera className="h-4.5 w-4.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
