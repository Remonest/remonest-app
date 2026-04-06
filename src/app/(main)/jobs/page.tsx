import { Briefcase, MapPin, DollarSign, Clock, Search, Filter } from "lucide-react";

const jobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "RemoteFirst Inc.",
    location: "Worldwide",
    type: "Full-time",
    salary: "$80k - $120k",
    posted: "2 days ago",
    tags: ["React", "TypeScript", "Tailwind"],
    description:
      "We're looking for an experienced frontend developer to join our distributed team and build beautiful interfaces.",
  },
  {
    id: "2",
    title: "Product Designer",
    company: "DesignLab",
    location: "Asia Pacific",
    type: "Full-time",
    salary: "$60k - $90k",
    posted: "3 days ago",
    tags: ["Figma", "Design Systems", "UX"],
    description:
      "Join our design team to create intuitive experiences for our global SaaS platform.",
  },
  {
    id: "3",
    title: "Full Stack Engineer",
    company: "CloudNative Co.",
    location: "Worldwide",
    type: "Contract",
    salary: "$70k - $100k",
    posted: "5 days ago",
    tags: ["Next.js", "Node.js", "PostgreSQL"],
    description:
      "Build and maintain our cloud platform serving thousands of developers worldwide.",
  },
  {
    id: "4",
    title: "Digital Marketing Specialist",
    company: "GrowthHQ",
    location: "Southeast Asia",
    type: "Part-time",
    salary: "$30k - $50k",
    posted: "1 week ago",
    tags: ["SEO", "Content", "Analytics"],
    description:
      "Drive growth through data-driven marketing campaigns for our B2B audience.",
  },
  {
    id: "5",
    title: "DevOps Engineer",
    company: "InfraScale",
    location: "Worldwide",
    type: "Full-time",
    salary: "$90k - $130k",
    posted: "1 week ago",
    tags: ["AWS", "Docker", "Terraform"],
    description:
      "Scale our infrastructure to support millions of users across multiple regions.",
  },
  {
    id: "6",
    title: "Technical Writer",
    company: "DocuBase",
    location: "Worldwide",
    type: "Contract",
    salary: "$40k - $60k",
    posted: "2 weeks ago",
    tags: ["Documentation", "API", "Markdown"],
    description:
      "Create clear, comprehensive documentation for our developer tools and APIs.",
  },
];

export default function JobsPage() {
  return (
    <div className="py-8">
      <div className="w-full max-w-[1200px] mx-auto px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Remote Job Board
          </h1>
          <p className="mt-2 text-base text-muted-foreground max-w-[640px]">
            Verified remote opportunities from international teams open to
            hiring professionals based in Indonesia.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium whitespace-nowrap hover:bg-accent hover:text-accent-foreground transition-colors">
            <Filter className="size-4" />
            Filters
          </button>
        </div>

        {/* Job List */}
        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <a
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group flex flex-col p-5 border border-border rounded-xl bg-card hover:border-primary/50 transition-colors no-underline"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-md bg-secondary text-primary flex items-center justify-center shrink-0">
                      <Briefcase className="size-4" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {job.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {job.company}
                  </p>
                </div>
                <span className="text-sm font-medium text-primary whitespace-nowrap">
                  {job.salary}
                </span>
              </div>

              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                {job.description}
              </p>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border flex-wrap">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {job.type}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <DollarSign className="size-3.5" />
                  {job.posted}
                </span>
                <div className="flex gap-1.5 ml-auto flex-wrap">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
