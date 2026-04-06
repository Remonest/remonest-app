"use client";

import { useState } from "react";
import { ImagePlus, Plus, Trash2, Save, Eye } from "lucide-react";

export default function PortfolioPage() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "",
      description: "",
      image: "",
      url: "",
      tags: "",
    },
  ]);

  const addProject = () => {
    setProjects([
      ...projects,
      { id: Date.now(), title: "", description: "", image: "", url: "", tags: "" },
    ]);
  };

  const removeProject = (id: number) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  return (
    <div className="py-8">
      <div className="w-full max-w-[1200px] mx-auto px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              Portfolio Builder
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Showcase your best work with a polished, professional portfolio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium whitespace-nowrap hover:bg-accent hover:text-accent-foreground transition-colors">
              <Eye className="size-4" />
              Preview
            </button>
            <button className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90">
              <Save className="size-4" />
              Save
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="p-5 border border-border rounded-xl bg-card mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Profile
          </h2>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted shrink-0 cursor-pointer hover:border-primary/50 transition-colors">
              <ImagePlus className="size-6 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Role / Title</label>
                  <input
                    type="text"
                    placeholder="Frontend Developer"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  rows={3}
                  placeholder="Tell the world about yourself..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="p-5 border border-border rounded-xl bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Projects
            </h2>
            <button
              onClick={addProject}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-secondary px-3 text-sm font-medium text-secondary-foreground whitespace-nowrap hover:bg-secondary/80 transition-colors"
            >
              <Plus className="size-4" />
              Add Project
            </button>
          </div>

          <div className="space-y-6">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="p-4 border border-border rounded-lg bg-muted/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    Project {index + 1}
                  </span>
                  {projects.length > 1 && (
                    <button
                      onClick={() => removeProject(project.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Title</label>
                    <input
                      type="text"
                      placeholder="Project name"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    rows={2}
                    placeholder="What did you build? What problem did it solve?"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-sm font-medium">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Tailwind"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium mb-2 block">
                    Cover Image
                  </label>
                  <div className="w-full h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-background cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImagePlus className="size-6" />
                      <span className="text-xs">Upload image</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
