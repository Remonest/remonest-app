"use client";

import { useTranslations } from "@/lib/translations";

export function CTASection() {
  const { t } = useTranslations();

  return (
    <section id="cta-section" className="py-4 md:py-8 pb-6 md:pb-6">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="p-8 md:p-10 text-center bg-foreground text-background rounded-xl border border-border">
          <h2 className="m-0 text-[32px] md:text-[42px] leading-tight tracking-[-0.03em] font-semibold text-background">
            {t.cta.title}
          </h2>
          <p className="mx-auto mt-4 mb-6 max-w-[640px] text-[15px] md:text-base leading-relaxed text-muted-foreground">
            {t.cta.subtitle}
          </p>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 h-11 md:h-10 px-4 rounded-md text-[15px] md:text-sm font-semibold md:font-medium whitespace-nowrap border border-transparent bg-primary text-primary-foreground no-underline hover:bg-primary/90 transition-colors w-full md:w-auto"
          >
            {t.cta.getStartedFree}
          </a>
        </div>
      </div>
    </section>
  );
}