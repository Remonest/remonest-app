"use client";

import { useState } from "react";
import { FileText, Download, Eye, Edit3, Save } from "lucide-react";

export default function CVBuilderPage() {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  return (
    <div className="py-8">
      <div className="w-full max-w-[1200px] mx-auto px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              CV Builder
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Create a structured, ATS-friendly resume that feels professional
              from the first draft.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium whitespace-nowrap hover:bg-accent hover:text-accent-foreground transition-colors">
              <Save className="size-4" />
              Save
            </button>
            <button className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90">
              <Download className="size-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Mobile tab toggle */}
        <div className="flex lg:hidden items-center gap-1 p-1 bg-muted rounded-lg mb-6">
          <button
            onClick={() => setActiveTab("edit")}
            className={`flex-1 h-9 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "edit"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <Edit3 className="size-4" />
            Edit
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex-1 h-9 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "preview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <Eye className="size-4" />
            Preview
          </button>
        </div>

        {/* Split view */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div
            className={`space-y-6 ${activeTab === "preview" ? "hidden lg:block" : ""}`}
          >
            {/* Personal Info */}
            <div className="p-5 border border-border rounded-xl bg-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-md bg-secondary text-primary flex items-center justify-center">
                  <FileText className="size-4" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Personal Information
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Phone</label>
                  <input
                    type="tel"
                    placeholder="+62 812 3456 7890"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Location</label>
                  <input
                    type="text"
                    placeholder="Jakarta, Indonesia"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <label className="text-sm font-medium">Professional Summary</label>
                <textarea
                  rows={4}
                  placeholder="Brief summary of your professional background and key strengths..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
            </div>

            {/* Experience */}
            <div className="p-5 border border-border rounded-xl bg-card">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Work Experience
              </h2>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Job Title</label>
                      <input
                        type="text"
                        placeholder="Frontend Developer"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Company</label>
                      <input
                        type="text"
                        placeholder="Company Name"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Describe your responsibilities and achievements..."
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                </div>
                <button className="text-sm text-primary font-medium hover:underline">
                  + Add another position
                </button>
              </div>
            </div>

            {/* Skills */}
            <div className="p-5 border border-border rounded-xl bg-card">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Skills
              </h2>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Add your skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Node.js, Figma..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div
            className={`hidden lg:block ${activeTab === "preview" ? "lg:block" : ""}`}
          >
            <div className="sticky top-8">
              <div className="p-5 border border-border rounded-xl bg-card">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Preview
                </h2>
                <div className="aspect-[8.5/11] bg-background border border-border rounded-lg p-8 text-sm">
                  <div className="text-center border-b border-border pb-4 mb-4">
                    <h3 className="text-xl font-bold text-foreground">
                      Your Name
                    </h3>
                    <p className="text-muted-foreground text-xs mt-1">
                      email@example.com · +62 812 3456 7890 · Jakarta, Indonesia
                    </p>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-2">
                      Professional Summary
                    </h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Your professional summary will appear here once you start
                      editing...
                    </p>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-2">
                      Experience
                    </h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Your work experience entries will be displayed here...
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-2">
                      Skills
                    </h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Your skills will be listed here...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
