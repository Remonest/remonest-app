"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Globe2, Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mobileMenuOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY >= 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('[aria-label="Menu"]')
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={`py-4 transition-all duration-300 ${
        isSticky ? "fixed top-0 left-0 right-0 z-40 py-2" : ""
      }`}
    >
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">
        <div
          className={`h-14 md:h-16 flex items-center justify-between px-4 md:px-[18px] border border-border rounded-xl bg-card transition-all duration-300 ${
            isSticky ? "rounded-none shadow-md" : ""
          }`}
        >
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
                href="/login"
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md text-sm font-medium whitespace-nowrap border border-transparent bg-transparent text-foreground no-underline hover:bg-muted transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
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
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu - floating bottom with transition */}
        {isVisible && (
          <div
            ref={menuRef}
            className={`md:hidden fixed mt-1.5 left-4 right-4 z-50 transition-all duration-300 ease-out ${
              mobileMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <nav className="flex flex-col gap-2 p-4 border border-border rounded-xl bg-card shadow-lg">
              <a
                href="#features-section"
                className="h-10 px-3 flex items-center rounded-md text-muted-foreground text-sm font-medium no-underline transition-colors hover:text-foreground hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#steps-section"
                className="h-10 px-3 flex items-center rounded-md text-muted-foreground text-sm font-medium no-underline transition-colors hover:text-foreground hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it works
              </a>
              <a
                href="#testimonials-section"
                className="h-10 px-3 flex items-center rounded-md text-muted-foreground text-sm font-medium no-underline transition-colors hover:text-foreground hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Success stories
              </a>
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <Link
                  href="/login"
                  className="h-10 px-3 flex items-center justify-center rounded-md text-sm font-medium border border-transparent bg-transparent text-foreground no-underline hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="h-10 px-3 flex items-center justify-center rounded-md text-sm font-medium border border-transparent bg-primary text-primary-foreground no-underline hover:bg-primary/90 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started Free
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
