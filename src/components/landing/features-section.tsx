import { BookOpen, BriefcaseBusiness, FileText } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Learning Modules",
    copy: "Follow focused lessons on async communication, global hiring expectations, and practical remote work habits for Indonesian talent.",
    image:
      "https://storage.googleapis.com/banani-generated-images/generated-images/150cf130-c36f-413e-bd35-099c364e108a.jpg",
    alt: "Learning modules preview",
  },
  {
    icon: BriefcaseBusiness,
    title: "Job Board",
    copy: "Explore verified remote opportunities from international teams open to hiring professionals based in Indonesia.",
    image:
      "https://storage.googleapis.com/banani-generated-images/generated-images/038ea8c1-35bb-47b5-8ff6-d61d25116b89.jpg",
    alt: "Job board preview",
  },
  {
    icon: FileText,
    title: "CV & Portfolio Builder",
    copy: "Create structured, ATS-friendly career assets with a polished format that feels professional from the first draft.",
    image:
      "https://storage.googleapis.com/banani-generated-images/generated-images/9b1e5cc7-c1d2-49a8-937a-a7e70d13c236.jpg",
    alt: "CV and portfolio builder preview",
  },
];

export function FeaturesSection() {
  return (
    <section id="features-section" className="py-4 md:py-8">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-6 items-start md:items-end mb-6">
          <div>
            <h2 className="m-0 text-[28px] md:text-[40px] leading-tight tracking-[-0.02em] font-semibold text-foreground">
              Everything you need to grow
            </h2>
            <p className="mt-3 mb-0 text-base leading-relaxed text-muted-foreground">
              A clear, usable set of sections styled like a modern component
              system: practical, readable, and easy to extend.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 h-8 px-3 border border-border rounded-full bg-secondary text-secondary-foreground text-[13px] font-medium whitespace-nowrap">
            Simple sections, shadcn-inspired
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-5 md:p-6 flex flex-col bg-muted border border-border rounded-xl"
            >
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-secondary text-primary flex items-center justify-center mb-4 md:mb-[18px]">
                <feature.icon className="size-5 md:size-[22px] text-primary" />
              </div>
              <h3 className="m-0 text-xl md:text-[20px] leading-[1.3] font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 md:mt-2.5 mb-5 text-[15px] md:text-base leading-relaxed text-muted-foreground flex-1">
                {feature.copy}
              </p>
              <div className="p-2.5 border border-border rounded-lg bg-card">
                <img
                  src={feature.image}
                  alt={feature.alt}
                  className="w-full block rounded-md"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
