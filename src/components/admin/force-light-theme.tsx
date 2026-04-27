"use client";

import { useEffect } from "react";

export function ForceLightTheme() {
  useEffect(() => {
    // Check if root has dark class
    const html = document.documentElement;
    const hasDark = html.classList.contains("dark");
    
    // Remove dark class if present
    if (hasDark) {
      html.classList.remove("dark");
    }
    
    // Cleanup: Restore dark class if it was there before (optional)
    // Actually, for "light mode only" dashboard, we just want it light.
    // If the user navigates away, the RootLayout's ThemeInit or navigation might re-apply it.
    
    return () => {
      // Re-apply dark mode if it was stored in localStorage
      const stored = localStorage.getItem("remonest-theme");
      if (stored === "dark") {
        html.classList.add("dark");
      }
    };
  }, []);

  return null;
}
