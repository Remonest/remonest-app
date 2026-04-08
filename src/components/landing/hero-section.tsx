"use client";

import { useEffect, useRef, useState } from "react";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "@/lib/translations";

export function HeroSection() {
  const { t } = useTranslations();

  const slides = [
    {
      image:
        "https://storage.googleapis.com/banani-generated-images/generated-images/d66b5ce4-f7d8-48d0-a98c-4a1bff463dbc.jpg",
      caption: t.hero.carousel.workFromAnywhere.caption,
      captionDesc: t.hero.carousel.workFromAnywhere.description,
    },
    {
      image:
        "https://storage.googleapis.com/banani-generated-images/generated-images/5676352a-bd3e-4f5e-9a20-f2e2fd666ded.jpg",
      caption: t.hero.carousel.buildStrongerProfile.caption,
      captionDesc: t.hero.carousel.buildStrongerProfile.description,
    },
    {
      image:
        "https://storage.googleapis.com/banani-generated-images/generated-images/1056ed0c-0a1a-4aa3-b2a2-32ab4c7bb073.jpg",
      caption: t.hero.carousel.showcaseBestWork.caption,
      captionDesc: t.hero.carousel.showcaseBestWork.description,
    },
    {
      image:
        "https://storage.googleapis.com/banani-generated-images/generated-images/4de1f13f-f292-4c94-b8a4-23704b2c1cb9.jpg",
      caption: t.hero.carousel.landGlobalOpportunities.caption,
      captionDesc: t.hero.carousel.landGlobalOpportunities.description,
    },
  ];
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAuto = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3500);
  };

  useEffect(() => {
    startAuto();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const goTo = (index: number) => {
    console.log("goTo called with index:", index);
    const next = (index + slides.length) % slides.length;
    setCurrent(next);
    startAuto();
  };

  return (
    <section id="hero-section" className="pb-8 md:py-3">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="p-8 md:p-14 grid grid-cols-1 md:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] gap-8 items-center bg-gradient-to-b from-background to-secondary rounded-xl border border-border">
          {/* Left content */}
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 h-8 px-3 border border-border rounded-full bg-secondary text-secondary-foreground text-[13px] font-medium whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              {t.hero.badge}
            </div>

            <h1 className="mt-4 md:mt-5 mb-3 md:mb-4 text-4xl md:text-[56px] leading-tight tracking-[-0.04em] font-semibold text-foreground">
              {t.hero.title}{" "}
              <span className="text-primary">{t.hero.titleHighlight}</span>
            </h1>

            <p className="m-0 text-base leading-relaxed text-muted-foreground">
              {t.hero.description}
            </p>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-6 md:mt-7 w-full md:w-auto">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 h-11 md:h-10 px-4 rounded-md text-[15px] md:text-sm font-semibold md:font-medium whitespace-nowrap border border-transparent bg-primary text-primary-foreground no-underline hover:bg-primary/90 transition-colors w-full md:w-auto"
              >
                {t.hero.getStartedFree}
              </a>
              <a
                href="#steps-section"
                className="inline-flex items-center justify-center gap-2 h-11 md:h-10 px-4 rounded-md text-[15px] md:text-sm font-semibold md:font-medium whitespace-nowrap border border-border bg-secondary text-secondary-foreground no-underline hover:bg-secondary/80 transition-colors w-full md:w-auto"
              >
                <span className="w-5 h-5 flex items-center justify-center shrink-0">
                  <Play className="size-4 text-secondary-foreground" />
                </span>
                {t.hero.seeHowItWorks}
              </a>
            </div>

            <div className="grid grid-cols-2 md:flex gap-3 mt-6 md:mt-7 w-full md:w-auto">
              <div className="p-4 md:p-3.5 border border-border rounded-xl bg-card">
                <strong className="block text-xl md:text-lg leading-tight font-semibold text-foreground">
                  500+
                </strong>
                <span className="block mt-1 text-[13px] text-muted-foreground">
                  {t.hero.stats.remoteRoles}
                </span>
              </div>
              <div className="p-4 md:p-3.5 border border-border rounded-xl bg-card">
                <strong className="block text-xl md:text-lg leading-tight font-semibold text-foreground">
                  30+
                </strong>
                <span className="block mt-1 text-[13px] text-muted-foreground">
                  {t.hero.stats.learningModules}
                </span>
              </div>
              <div className="col-span-2 md:col-span-1 p-4 md:p-3.5 border border-border rounded-xl bg-card">
                <strong className="block text-xl md:text-lg leading-tight font-semibold text-foreground">
                  ATS-ready
                </strong>
                <span className="block mt-1 text-[13px] text-muted-foreground">
                  {t.hero.stats.atsReady}
                </span>
              </div>
            </div>
          </div>

          {/* Right visual - Carousel */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full md:max-w-[520px] p-3 md:p-3.5 bg-card border border-border rounded-[calc(var(--radius-xl)+4px)]">
              <div className="flex items-center justify-between gap-3 px-1 pb-3">
                <span className="text-[12px] md:text-[13px] text-muted-foreground font-medium truncate">
                  {t.carousel.dashboard}
                </span>
                <span className="h-6 md:h-7 px-2 md:px-2.5 rounded-full bg-accent text-accent-foreground inline-flex items-center text-[11px] md:text-xs font-medium whitespace-nowrap shrink-0">
                  {t.carousel.globalReady}
                </span>
              </div>

              {/* Slides */}
              <div className="relative overflow-hidden rounded-lg bg-secondary">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${current * 100}%)` }}
                >
                  {slides.map((slide, i) => (
                    <div
                      key={i}
                      className="w-full flex-shrink-0 relative select-none"
                    >
                      <img
                        src={slide.image}
                        alt={slide.caption}
                        className="w-full block rounded-lg aspect-[4/5] object-cover pointer-events-none"
                        loading={i === 0 ? "eager" : "lazy"}
                        draggable={false}
                      />
                      <div className="absolute left-3 md:left-4 bottom-3 md:bottom-4 right-3 md:right-4 p-2.5 rounded-md md:rounded-lg bg-[rgba(15,23,42,0.85)] text-white backdrop-blur-sm pointer-events-none">
                        <strong className="block text-[13px] leading-[1.3] font-semibold">
                          {slide.caption}
                        </strong>
                        <span className="block mt-1 text-xs leading-[1.5] text-white/80">
                          {slide.captionDesc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dots + nav */}
              <div className="flex items-center justify-between gap-3 pt-3 md:pt-3.5 px-1 pb-0.5">
                <div className="flex items-center gap-1.5 md:gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goTo(i)}
                      className={`h-1.5 rounded-full shrink-0 transition-all duration-300 ${
                        i === current ? "w-6 bg-primary" : "w-1.5 bg-border"
                      }`}
                      aria-label={t.carousel.goToSlide(i + 1)}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-md border border-border bg-background text-foreground hover:bg-muted transition-colors"
                    onClick={() => goTo(current - 1)}
                    aria-label={t.carousel.previousSlide}
                  >
                    <ChevronLeft className="size-3.5 md:size-4" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-md border border-border bg-background text-foreground hover:bg-muted transition-colors"
                    onClick={() => goTo(current + 1)}
                    aria-label={t.carousel.nextSlide}
                  >
                    <ChevronRight className="size-3.5 md:size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
