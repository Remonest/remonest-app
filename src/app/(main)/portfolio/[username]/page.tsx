import { notFound } from "next/navigation";
import { Globe, Mail, MapPin, Link as LinkIcon } from "lucide-react";

// TODO: Replace with actual data fetching / SSG
const portfolios: Record<
  string,
  {
    name: string;
    role: string;
    bio: string;
    location: string;
    email: string;
    website: string;
    projects: {
      title: string;
      description: string;
      image: string;
      url: string;
      tags: string[];
    }[];
  }
> = {
  johndoe: {
    name: "John Doe",
    role: "Frontend Developer",
    bio: "Passionate about building beautiful, accessible web experiences. Based in Jakarta, working with teams worldwide.",
    location: "Jakarta, Indonesia",
    email: "john@example.com",
    website: "https://johndoe.dev",
    projects: [
      {
        title: "E-Commerce Dashboard",
        description:
          "A full-featured admin dashboard with analytics, inventory management, and order tracking.",
        image: "",
        url: "#",
        tags: ["React", "TypeScript", "Tailwind"],
      },
      {
        title: "Portfolio Template",
        description:
          "A clean, minimal portfolio template designed for creative professionals.",
        image: "",
        url: "#",
        tags: ["Next.js", "Framer Motion"],
      },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(portfolios).map((username) => ({ username }));
}

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const portfolio = portfolios[username];

  if (!portfolio) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="border-b border-border">
        <div className="w-full max-w-[900px] mx-auto px-8 py-12">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {portfolio.name}
          </h1>
          <p className="text-lg text-muted-foreground mt-1">{portfolio.role}</p>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-[640px]">
            {portfolio.bio}
          </p>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {portfolio.location}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-4" />
              {portfolio.email}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Globe className="size-4" />
              {portfolio.website}
            </span>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="w-full max-w-[900px] mx-auto px-8 py-12">
        <h2 className="text-2xl font-semibold text-foreground mb-6">
          Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolio.projects.map((project) => (
            <a
              key={project.title}
              href={project.url}
              className="group flex flex-col border border-border rounded-xl overflow-hidden bg-card hover:border-primary/50 transition-colors no-underline"
            >
              <div className="aspect-video bg-muted flex items-center justify-center">
                <LinkIcon className="size-8 text-muted-foreground" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {project.tags.map((tag) => (
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
