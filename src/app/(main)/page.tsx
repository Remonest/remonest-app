"use client";

import {
  Header,
  HeroSection,
  FeaturesSection,
  StepsSection,
  TestimonialsSection,
  CTASection,
  Footer,
  LanguageHandler,
} from "@/components/landing";
import { TranslationProvider } from "@/lib/translations";
import { useEffect } from "react";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Remonest",
  url: "https://remonest.com",
  description:
    "Remote career platform for Indonesian professionals. Find global opportunities, build ATS-ready CVs, and learn remote-ready skills.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://remonest.com/jobs?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "Remonest",
    url: "https://remonest.com",
    logo: {
      "@type": "ImageObject",
      url: "https://remonest.com/logo.png",
    },
  },
};

export default function LandingPage() {
  // Handle hash-based scrolling when navigating from other pages
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Wait for content to render
      requestAnimationFrame(() => {
        const element = document.getElementById(hash.slice(1));
        if (element) {
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      });
    }
  }, []);

  return (
    <div className="flex flex-col flex-1 bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TranslationProvider>
        <LanguageHandler />
        <Header />
        <main>
          <HeroSection />
          <FeaturesSection />
          <StepsSection />
          <TestimonialsSection />
          <CTASection />
        </main>
        <Footer />
      </TranslationProvider>
    </div>
  );
}
