import { Quote } from "lucide-react";

const testimonials = {
  main: {
    quote: "Remonest helped me restructure my portfolio and present my experience more clearly. Within weeks, I started getting interviews from companies outside Indonesia.",
    name: "Nadia S.",
    role: "Product Designer · Remote startup team",
    avatar:
      "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F1",
  },
  secondary: [
    {
      quote:
        "The modules were practical and easy to follow. I finally understood how to position my experience for global remote roles.",
      name: "Budi P.",
      role: "Frontend Developer",
      avatar:
        "https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FSoutheast%20Asian%2F2",
    },
    {
      quote:
        "I used the CV builder and job board together. It made the whole process feel organized instead of overwhelming.",
      name: "Maya A.",
      role: "Digital Marketer",
      avatar:
        "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F18-25%2FSoutheast%20Asian%2F3",
    },
  ],
};

export function TestimonialsSection() {
  return (
    <section id="testimonials-section" className="py-4 md:py-8">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="p-6 md:p-8 bg-muted border border-border rounded-xl">
          <div>
            <h2 className="m-0 text-[28px] md:text-[40px] leading-tight tracking-[-0.02em] font-semibold text-foreground">
              Success stories
            </h2>
            <p className="mt-3 mb-0 text-base leading-relaxed text-muted-foreground">
              Real progress from Indonesian professionals using Remonest to
              build better remote opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-4 md:gap-5 mt-6">
            {/* Main testimonial */}
            <div className="bg-card border border-border rounded-xl p-5 md:p-6">
              <div className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center">
                <Quote className="size-6 md:size-7 text-primary" />
              </div>
              <p className="my-4 md:my-[18px] mb-6 md:mb-7 text-[22px] md:text-[28px] leading-[1.4] md:leading-[1.45] font-medium tracking-[-0.01em] text-foreground">
                "{testimonials.main.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-secondary shrink-0">
                  <img
                    src={testimonials.main.avatar}
                    alt={testimonials.main.name}
                    className="w-full h-full object-cover block"
                  />
                </div>
                <div>
                  <p className="m-0 text-sm font-semibold leading-[1.3]">
                    {testimonials.main.name}
                  </p>
                  <p className="mt-0.5 mb-0 text-[13px] text-muted-foreground leading-[1.4]">
                    {testimonials.main.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Secondary testimonials */}
            <div className="flex flex-col gap-4 md:gap-5">
              {testimonials.secondary.map((t) => (
                <div
                  key={t.name}
                  className="bg-card border border-border rounded-xl p-5 md:p-6"
                >
                  <p className="m-0 mb-5 text-[15px] md:text-sm leading-relaxed text-foreground">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-secondary shrink-0">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-full h-full object-cover block"
                      />
                    </div>
                    <div>
                      <p className="m-0 text-sm font-semibold leading-[1.3]">
                        {t.name}
                      </p>
                      <p className="mt-0.5 mb-0 text-[13px] text-muted-foreground leading-[1.4]">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
