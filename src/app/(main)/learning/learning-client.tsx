"use client";

import { useState } from "react";
import { BookOpen, Clock, Filter } from "lucide-react";
import {
  LEARNING_CATEGORY_LABELS,
  LEARNING_CATEGORY_COLORS,
  type LearningModule,
} from "@/features/learning-module/types/learning";

interface LearningClientProps {
  initialModules: LearningModule[];
}

export default function LearningClient({ initialModules }: LearningClientProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Object.keys(LEARNING_CATEGORY_LABELS)];

  const filteredModules =
    activeCategory === "All"
      ? initialModules
      : initialModules.filter(
          (mod) => mod.category === activeCategory
        );

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
              onClick={() => setActiveCategory(cat)}
              className={`h-8 px-3 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                cat === activeCategory
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat === "All" ? "All" : LEARNING_CATEGORY_LABELS[cat as keyof typeof LEARNING_CATEGORY_LABELS]}
            </button>
          ))}
        </div>

        {/* Module Grid */}
        {filteredModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No modules found
            </h3>
            <p className="text-sm text-muted-foreground">
              {activeCategory !== "All"
                ? `No modules in the "${LEARNING_CATEGORY_LABELS[activeCategory as keyof typeof LEARNING_CATEGORY_LABELS]}" category yet.`
                : "No learning modules available at the moment."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredModules.map((mod) => (
              <a
                key={mod.id}
                href={`/learning/${mod.slug}`}
                className="group flex flex-col p-5 border border-border rounded-xl bg-card hover:border-primary/50 transition-colors no-underline"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-md bg-secondary text-primary flex items-center justify-center">
                    <BookOpen className="size-4" />
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      LEARNING_CATEGORY_COLORS[mod.category]
                    }`}
                  >
                    {LEARNING_CATEGORY_LABELS[mod.category]}
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
                    {mod.durationMin} min
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
