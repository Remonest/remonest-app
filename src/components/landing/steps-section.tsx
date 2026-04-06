const steps = [
  {
    number: "01",
    title: "Build your profile",
    copy: "Set up your CV, portfolio, and strengths in a format that matches what remote teams want to review quickly.",
    image:
      "https://storage.googleapis.com/banani-generated-images/generated-images/d3e84734-8589-4be3-8f1d-54a90fa3074a.jpg",
    alt: "Build profile preview",
  },
  {
    number: "02",
    title: "Learn remote-ready skills",
    copy: "Use short modules to improve communication, collaboration, and confidence before applying to global companies.",
    image:
      "https://storage.googleapis.com/banani-generated-images/generated-images/43a1203f-ab37-48f7-bd60-b3e2017d363c.jpg",
    alt: "Learning remote skills preview",
  },
  {
    number: "03",
    title: "Apply to verified jobs",
    copy: "Browse curated listings, prepare with confidence, and submit applications to companies already open to remote hiring.",
    image:
      "https://storage.googleapis.com/banani-generated-images/generated-images/07b05fd9-74d4-49c5-abb0-157771215a81.jpg",
    alt: "Apply to jobs preview",
  },
];

export function StepsSection() {
  return (
    <section id="steps-section" className="py-4 md:py-8">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="p-6 md:p-8 border border-border rounded-xl bg-card">
          <div className="mb-6 md:mb-7">
            <h2 className="m-0 text-[28px] md:text-[40px] leading-tight tracking-[-0.02em] font-semibold text-foreground">
              How it works
            </h2>
            <p className="mt-3 mb-0 text-base leading-relaxed text-muted-foreground">
              Three clear steps to help professionals move from local experience
              to a stronger global remote profile.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col md:grid md:grid-cols-[80px_minmax(0,1fr)_minmax(260px,320px)] gap-4 md:gap-6 items-start md:items-center p-5 border border-border rounded-xl bg-background"
              >
                <div className="flex items-center gap-3 md:block w-full">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-secondary text-primary flex items-center justify-center text-base md:text-[18px] font-bold shrink-0">
                    {step.number}
                  </div>
                </div>
                <div className="md:pl-0">
                  <h3 className="m-0 text-xl md:text-[24px] leading-[1.2] font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="m-0 text-[15px] md:text-base leading-relaxed text-muted-foreground">
                    {step.copy}
                  </p>
                </div>
                <div className="p-2.5 border border-border rounded-lg bg-card">
                  <img
                    src={step.image}
                    alt={step.alt}
                    className="w-full block rounded-md"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
