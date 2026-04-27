"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("remonest-theme");
    const dark = stored === "dark";
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

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

  if (!mounted) {
    return (
      <div className="w-9 h-9 md:w-[100px] md:h-10 rounded-full border border-border bg-secondary" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="inline-flex items-center h-9 md:h-10 px-1 md:px-2.5 gap-1.5 border border-border rounded-full bg-secondary text-foreground text-sm font-medium whitespace-nowrap transition-colors"
    >
      <div className="w-11 h-6 md:w-12 md:h-7 rounded-full bg-accent p-0.5 relative overflow-hidden">
        <div
          className="w-[22px] md:w-6 h-[22px] md:h-6 rounded-full bg-card flex items-center justify-center relative transition-transform duration-200"
          style={{ transform: isDark ? "translateX(18px)" : "translateX(0)" }}
        >
          <span className="absolute inset-0 flex items-center justify-center transition-opacity">
            <Sun
              className="size-3 md:size-3.5 text-warning-foreground"
              style={{ opacity: isDark ? 0 : 1 }}
            />
          </span>
          <span className="absolute inset-0 flex items-center justify-center transition-opacity">
            <Moon
              className="size-3 md:size-3.5 text-primary-foreground"
              style={{ opacity: isDark ? 1 : 0 }}
            />
          </span>
        </div>
      </div>
      <span className="hidden md:inline">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
