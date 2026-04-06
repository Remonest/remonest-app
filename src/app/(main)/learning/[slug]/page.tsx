import { notFound } from "next/navigation";
import { BookOpen, Clock, BarChart3, ChevronLeft } from "lucide-react";
import Link from "next/link";

// TODO: Replace with actual MDX/content source
const modules: Record<
  string,
  {
    title: string;
    description: string;
    duration: string;
    level: string;
    category: string;
    content: string;
  }
> = {
  "async-communication-basics": {
    title: "Async Communication Basics",
    description:
      "Learn how to communicate effectively across time zones with clear, concise written updates.",
    duration: "15 min",
    level: "Beginner",
    category: "Communication",
    content: `
# Async Communication Basics

Remote work means your teammates might be on the other side of the world. Here's how to make it work.

## Why Async Matters

When your team spans multiple time zones, waiting for a real-time response isn't always practical. Async communication lets everyone stay informed without being online at the same time.

## Key Principles

### 1. Write Clearly and Completely

Include all the context someone needs to understand and respond. Avoid "Hey, got a minute?" — instead, state your full question upfront.

### 2. Use the Right Channel

- **Documentation** for decisions and processes
- **Threaded messages** for discussions
- **Email** for formal updates
- **Video** for complex explanations

### 3. Set Expectations

Let your team know your working hours and typical response times. Use status indicators in your tools.

## Practical Tips

- Start messages with context, not questions
- Use bullet points and formatting for readability
- Summarize decisions in writing after calls
- Record short Loom videos for complex topics

## Next Steps

Practice writing a clear async update for your team. Include context, what you need, and any deadlines.
    `.trim(),
  },
};

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = modules[slug];

  if (!mod) {
    notFound();
  }

  return (
    <div className="py-8">
      <div className="w-full max-w-[800px] mx-auto px-8">
        <Link
          href="/learning"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 no-underline transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to modules
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-md bg-secondary text-primary flex items-center justify-center">
            <BookOpen className="size-4" />
          </div>
          <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
            {mod.category}
          </span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {mod.title}
        </h1>

        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {mod.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart3 className="size-3.5" />
            {mod.level}
          </span>
        </div>

        <div className="mt-8 prose prose-neutral dark:prose-invert max-w-none">
          {mod.content.split("\n").map((line, i) => {
            if (line.startsWith("# ")) {
              return null; // Skip the h1, already rendered
            }
            if (line.startsWith("## ")) {
              return (
                <h2
                  key={i}
                  className="text-xl font-semibold mt-8 mb-4 text-foreground"
                >
                  {line.replace("## ", "")}
                </h2>
              );
            }
            if (line.startsWith("### ")) {
              return (
                <h3
                  key={i}
                  className="text-lg font-medium mt-6 mb-2 text-foreground"
                >
                  {line.replace("### ", "")}
                </h3>
              );
            }
            if (line.startsWith("- **")) {
              const match = line.match(/^- \*\*(.+?)\*\*\s*(.*)$/);
              if (match) {
                return (
                  <li key={i} className="text-muted-foreground">
                    <strong className="text-foreground">{match[1]}</strong>
                    {match[2] && ` — ${match[2]}`}
                  </li>
                );
              }
            }
            if (line.startsWith("- ")) {
              return (
                <li key={i} className="text-muted-foreground">
                  {line.replace("- ", "")}
                </li>
              );
            }
            if (line.trim() === "") {
              return <br key={i} />;
            }
            return (
              <p key={i} className="text-muted-foreground leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
