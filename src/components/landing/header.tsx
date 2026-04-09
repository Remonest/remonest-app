"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Globe2, Menu, X, Sun, Moon, LogIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/lib/translations";

interface NavItem {
  id: string;
  label: string;
  href: string;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage, t } = useTranslations();
  const menuRef = useRef<HTMLDivElement>(null);

  // Navigation items
  const navItems: NavItem[] = [
    {
      id: "features-section",
      label: t.header.features,
      href: "#features-section",
    },
    {
      id: "steps-section",
      label: t.header.howItWorks,
      href: "#steps-section",
    },
    {
      id: "testimonials-section",
      label: t.header.successStories,
      href: "#testimonials-section",
    },
  ];

  // Mobile menu visibility
  useEffect(() => {
    if (mobileMenuOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [mobileMenuOpen]);

  // Sticky header on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY >= 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track active section for nav indicator
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    navItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Theme initialization
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("remonest-theme");
    const dark = stored === "dark" || 
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("remonest-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("remonest-theme", "light");
    }
  };

  // Close mobile menu on outside click
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

  // Smooth scroll handler
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = isSticky ? 80 : 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <header
      className={`py-4 transition-all duration-300 ${
        isSticky
          ? "fixed top-0 left-0 right-0 z-50 py-3 bg-background/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo Section (Left) */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Remonest - Home"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <Globe2 className="size-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              Remonest
            </span>
          </Link>

          {/* Navigation Links (Center) - Desktop */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center" aria-label="Main navigation">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.id)}
                className={`relative h-10 px-4 inline-flex items-center rounded-md text-sm font-medium whitespace-nowrap no-underline transition-all duration-300 ${
                  activeSection === item.id
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                aria-current={activeSection === item.id ? "page" : undefined}
              >
                {item.label}
                {activeSection === item.id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </a>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Desktop Controls */}
            <div className="hidden md:flex items-center gap-2">
              {/* Language Toggle */}
              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                <Button
                  variant={language === "en" ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 px-3 text-xs font-medium rounded-md transition-all duration-300 ${
                    language === "en"
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      : "bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-muted-foreground"
                  }`}
                  onClick={() => setLanguage("en")}
                  aria-label="Switch to English"
                  aria-pressed={language === "en"}
                >
                  EN
                </Button>
                <Button
                  variant={language === "id" ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 px-3 text-xs font-medium rounded-md transition-all duration-300 ${
                    language === "id"
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      : "bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-muted-foreground"
                  }`}
                  onClick={() => setLanguage("id")}
                  aria-label="Beralih ke Bahasa Indonesia"
                  aria-pressed={language === "id"}
                >
                  ID
                </Button>
              </div>

              {/* Theme Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                  onClick={toggleTheme}
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  <div className="relative w-4 h-4">
                    <Sun
                      className={`size-4 absolute inset-0 transition-all duration-300 ${
                        isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
                      }`}
                    />
                    <Moon
                      className={`size-4 absolute inset-0 transition-all duration-300 ${
                        isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {isDark ? "Dark" : "Light"}
                  </span>
                </Button>
              )}
            </div>

            {/* Auth Buttons (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" className="no-underline">
                <Button
                  variant="outline"
                  size="default"
                  className="h-10 px-5 gap-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                >
                  <LogIn className="size-4" />
                  {t.header.logIn}
                </Button>
              </Link>
              <Link href="/register" className="no-underline">
                <Button
                  size="default"
                  className="h-10 px-5 gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Sparkles className="size-4" />
                  {t.header.getStartedFree}
                </Button>
              </Link>
            </div>

            {/* Mobile: Theme Toggle + Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={toggleTheme}
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  <div className="relative w-5 h-5">
                    <Sun
                      className={`size-5 absolute inset-0 transition-all duration-300 ${
                        isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
                      }`}
                    />
                    <Moon
                      className={`size-5 absolute inset-0 transition-all duration-300 ${
                        isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
                      }`}
                    />
                  </div>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                aria-label={t.header.menu}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="size-5 transition-transform duration-300 rotate-90" />
                ) : (
                  <Menu className="size-5 transition-transform duration-300" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Floating Card */}
        {isVisible && (
          <div
            ref={menuRef}
            className={`md:hidden fixed mt-3 left-4 right-4 z-50 transition-all duration-300 ease-out ${
              mobileMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <nav className="flex flex-col gap-2 p-4 border border-border rounded-xl bg-card shadow-lg backdrop-blur-sm">
              {/* Nav Links */}
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    handleSmoothScroll(e, item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`h-12 px-4 flex items-center rounded-lg text-sm font-medium no-underline transition-all duration-300 ${
                    activeSection === item.id
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  aria-current={activeSection === item.id ? "page" : undefined}
                >
                  {item.label}
                </a>
              ))}

              {/* Language Switcher */}
              <div className="flex items-center justify-center gap-2 pt-3 border-t border-border">
                <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <Button
                    variant={language === "en" ? "default" : "ghost"}
                    size="sm"
                    className={`h-8 px-4 text-xs font-medium rounded-md transition-all duration-300 ${
                      language === "en"
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        : "bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-muted-foreground"
                    }`}
                    onClick={() => setLanguage("en")}
                  >
                    EN
                  </Button>
                  <Button
                    variant={language === "id" ? "default" : "ghost"}
                    size="sm"
                    className={`h-8 px-4 text-xs font-medium rounded-md transition-all duration-300 ${
                      language === "id"
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        : "bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-muted-foreground"
                    }`}
                    onClick={() => setLanguage("id")}
                  >
                    ID
                  </Button>
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="flex flex-col gap-2 pt-3 border-t border-border">
                <Link href="/login" className="no-underline" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full h-12 gap-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                  >
                    <LogIn className="size-4" />
                    {t.header.logIn}
                  </Button>
                </Link>
                <Link href="/register" className="no-underline" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    className="w-full h-12 gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Sparkles className="size-4" />
                    {t.header.getStartedFree}
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
