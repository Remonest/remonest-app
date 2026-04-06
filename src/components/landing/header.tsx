import Link from "next/link";
import { Globe2, Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="py-4 md:py-5">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-[18px] border border-border rounded-xl bg-card">
          <div className="flex items-center gap-2.5 text-[15px] font-semibold whitespace-nowrap">
            <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Globe2 className="size-4" />
            </div>
            <span>Remonest</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2 flex-1 justify-center">
            <a
              href="#features-section"
              className="h-9 px-3 inline-flex items-center rounded-md text-muted-foreground text-sm font-medium whitespace-nowrap no-underline transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#steps-section"
              className="h-9 px-3 inline-flex items-center rounded-md text-muted-foreground text-sm font-medium whitespace-nowrap no-underline transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#testimonials-section"
              className="h-9 px-3 inline-flex items-center rounded-md text-muted-foreground text-sm font-medium whitespace-nowrap no-underline transition-colors hover:text-foreground"
            >
              Success stories
            </a>
          </nav>

          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md text-sm font-medium whitespace-nowrap border border-transparent bg-transparent text-foreground no-underline hover:bg-muted transition-colors"
              >
                Log In
              </Link>
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md text-sm font-medium whitespace-nowrap border border-transparent bg-primary text-primary-foreground no-underline hover:bg-primary/90 transition-colors"
              >
                Get Started Free
              </Link>
            </div>
            {/* Mobile: theme toggle + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                className="w-10 h-10 flex items-center justify-center rounded-md text-foreground hover:bg-muted transition-colors"
                aria-label="Menu"
              >
                <Menu className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
