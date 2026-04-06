import { BookOpen, Clock, BarChart3, Filter } from "lucide-react";

const modules = [
  {
    title: "Async Communication Basics",
    description:
      "Learn how to communicate effectively across time zones with clear, concise written updates.",
    duration: "15 min",
    level: "Beginner",
    category: "Communication",
  },
  {
    title: "Building a Remote-Ready Mindset",
    description:
      "Develop the self-discipline and habits that successful remote professionals rely on.",
    duration: "20 min",
    level: "Beginner",
    category: "Mindset",
  },
  {
    title: "Global Hiring Expectations",
    description:
      "Understand what international teams look for when hiring remote talent from Indonesia.",
    duration: "25 min",
    level: "Intermediate",
    category: "Career",
  },
  {
    title: "Writing Effective Standups",
    description:
      "Master the art of daily standup updates that keep your team aligned and informed.",
    duration: "10 min",
    level: "Beginner",
    category: "Communication",
  },
  {
    title: "Collaborating with Design Systems",
    description:
      "Learn how to work with shared component libraries in distributed design teams.",
    duration: "30 min",
    level: "Advanced",
    category: "Design",
  },
  {
    title: "Time Management for Remote Workers",
    description:
      "Practical strategies for staying productive and avoiding burnout while working from home.",
    duration: "15 min",
    level: "Beginner",
    category: "Productivity",
  },
];

const categories = [
  "All",
  "Communication",
  "Mindset",
  "Career",
  "Design",
  "Productivity",
];

export default function LearningPage() {
  return (
    <div className="py-8">
      <div className="w-full max-w-[1200px] mx-auto px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Learning Modules
          </h1>
          <p className="mt-2 text-base text-muted-foreground max-w-[640px]">
            Build remote-ready skills with focused, practical lessons designed
            for Indonesian professionals.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Filter className="size-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`h-8 px-3 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                cat === "All"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => (
            <a
              key={mod.title}
              href={`/learning/${mod.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="group flex flex-col p-5 border border-border rounded-xl bg-card hover:border-primary/50 transition-colors no-underline"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-md bg-secondary text-primary flex items-center justify-center">
                  <BookOpen className="size-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                  {mod.category}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {mod.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">
                {mod.description}
              </p>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {mod.duration}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BarChart3 className="size-3.5" />
                  {mod.level}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
