import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  ChevronLeft,
  Building2,
  Globe,
} from "lucide-react";

const jobs: Record<
  string,
  {
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    posted: string;
    tags: string[];
    description: string;
    requirements: string[];
    benefits: string[];
  }
> = {
  "1": {
    title: "Senior Frontend Developer",
    company: "RemoteFirst Inc.",
    location: "Worldwide",
    type: "Full-time",
    salary: "$80k - $120k",
    posted: "2 days ago",
    tags: ["React", "TypeScript", "Tailwind"],
    description:
      "We're looking for an experienced frontend developer to join our distributed team and build beautiful interfaces. You'll work closely with our design and backend teams to deliver high-quality products that delight our users.",
    requirements: [
      "5+ years of frontend development experience",
      "Strong proficiency in React and TypeScript",
      "Experience with modern CSS frameworks (Tailwind preferred)",
      "Excellent written communication skills",
      "Self-motivated with ability to work independently",
    ],
    benefits: [
      "Fully remote with flexible hours",
      "Annual learning budget of $2,000",
      "Home office setup allowance",
      "4 weeks paid time off",
      "Annual team retreat",
    ],
  },
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = jobs[id];

  if (!job) {
    notFound();
  }

  return (
    <div className="py-8">
      <div className="w-full max-w-[800px] mx-auto px-8">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 no-underline transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to jobs
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-secondary text-primary flex items-center justify-center shrink-0">
            <Briefcase className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {job.title}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Building2 className="size-4" />
              <span className="text-sm">{job.company}</span>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-card mb-6 flex-wrap">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {job.location}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {job.type}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <DollarSign className="size-4" />
            {job.salary}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Globe className="size-4" />
            Posted {job.posted}
          </span>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="text-sm px-3 py-1 rounded-full bg-secondary text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            About the Role
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* Requirements */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Requirements
          </h2>
          <ul className="space-y-2">
            {job.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Benefits */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Benefits
          </h2>
          <ul className="space-y-2">
            {job.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Apply CTA */}
        <div className="p-6 border border-border rounded-xl bg-card text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Interested in this role?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Submit your application and portfolio to be considered for this
            position.
          </p>
          <button className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}
