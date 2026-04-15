"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Eye, Edit3, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

// ─── Types ───────────────────────────────────────────────────

interface Experience {
  id: string;
  title: string;
  company: string;
  description: string;
}

interface CVData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Experience[];
  skills: string;
}

// ─── Component ───────────────────────────────────────────────

export default function CVBuilderPage() {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Form state
  const [cvData, setCvData] = useState<CVData>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    experience: [
      {
        id: "1",
        title: "",
        company: "",
        description: "",
      },
    ],
    skills: "",
  });

  // Load saved data on mount
  useEffect(() => {
    const savedCV = localStorage.getItem("remonest-cv-data");
    if (savedCV) {
      try {
        setCvData(JSON.parse(savedCV));
      } catch (error) {
        console.error("Failed to load saved CV data:", error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("remonest-cv-data", JSON.stringify(cvData));
  }, [cvData]);

  // ─── Handlers ─────────────────────────────────────────────

  const handleSave = () => {
    try {
      localStorage.setItem("remonest-cv-data", JSON.stringify(cvData));
      toast.success("CV saved successfully");
    } catch (error) {
      toast.error("Failed to save CV");
      console.error("Save error:", error);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Add content to PDF
      let yPosition = 20;

      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(cvData.fullName || "Your Name", 20, yPosition);
      yPosition += 10;

      // Contact info
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const contactInfo = [
        cvData.email || "",
        cvData.phone || "",
        cvData.location || "",
      ].filter(Boolean).join(" · ");
      if (contactInfo) {
        doc.text(contactInfo, 20, yPosition);
        yPosition += 10;
      }

      // Summary
      if (cvData.summary) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Professional Summary", 20, yPosition);
        yPosition += 7;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const summaryLines = doc.splitTextToSize(cvData.summary, 170);
        summaryLines.forEach((line: string) => {
          doc.text(line, 20, yPosition);
          yPosition += 5;
        });
        yPosition += 5;
      }

      // Experience
      if (cvData.experience.some((exp) => exp.title || exp.company || exp.description)) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Work Experience", 20, yPosition);
        yPosition += 7;

        cvData.experience.forEach((exp) => {
          if (exp.title || exp.company || exp.description) {
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            const expTitle = `${exp.title || "Position"}${exp.company ? ` at ${exp.company}` : ""}`;
            doc.text(expTitle, 20, yPosition);
            yPosition += 6;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            if (exp.description) {
              const descLines = doc.splitTextToSize(exp.description, 170);
              descLines.forEach((line: string) => {
                doc.text(line, 20, yPosition);
                yPosition += 5;
              });
            }
            yPosition += 5;
          }
        });
      }

      // Skills
      if (cvData.skills) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Skills", 20, yPosition);
        yPosition += 7;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const skillsLines = doc.splitTextToSize(cvData.skills, 170);
        skillsLines.forEach((line: string) => {
          doc.text(line, 20, yPosition);
          yPosition += 5;
        });
      }

      // Save PDF
      doc.save(`${cvData.fullName || "resume"}.pdf`);
      toast.success("PDF exported successfully");
    } catch (error) {
      toast.error("Failed to export PDF");
      console.error("Export error:", error);
    }
  };

  const handleInputChange = (field: keyof CVData, value: string) => {
    setCvData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExperienceChange = (id: string, field: keyof Experience, value: string) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const handleAddExperience = () => {
    const newId = Date.now().toString();
    setCvData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: newId,
          title: "",
          company: "",
          description: "",
        },
      ],
    }));
  };

  const handleDeleteExperience = (id: string) => {
    if (cvData.experience.length <= 1) {
      toast.error("You must have at least one experience entry");
      return;
    }
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[1200px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              CV Builder
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Create a structured, ATS-friendly resume that feels professional
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Save className="size-4" />
              Save
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
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
            <div className="p-6 border border-border rounded-xl bg-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-md bg-secondary text-primary flex items-center justify-center">
                  <FileText className="size-5" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Personal Information
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    value={cvData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="John Doe"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={cvData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john@example.com"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Phone</label>
                  <input
                    type="tel"
                    value={cvData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+62 812 3456 7890"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Location</label>
                  <input
                    type="text"
                    value={cvData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Jakarta, Indonesia"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <label className="text-sm font-medium">Professional Summary</label>
                <textarea
                  rows={4}
                  value={cvData.summary}
                  onChange={(e) => handleInputChange("summary", e.target.value)}
                  placeholder="Brief summary of your professional background and key strengths..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
            </div>

            {/* Experience */}
            <div className="p-6 border border-border rounded-xl bg-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Work Experience
                </h2>
                <button
                  onClick={handleAddExperience}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <Plus className="size-4" />
                  Add Position
                </button>
              </div>

              <div className="space-y-4">
                {cvData.experience.map((exp, index) => (
                  <div key={exp.id} className="p-4 border border-border rounded-lg bg-muted/50 relative">
                    {cvData.experience.length > 1 && (
                      <button
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive transition-colors"
                        title="Remove this position"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Job Title</label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => handleExperienceChange(exp.id, "title", e.target.value)}
                          placeholder="Frontend Developer"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)}
                          placeholder="Company Name"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        rows={3}
                        value={exp.description}
                        onChange={(e) => handleExperienceChange(exp.id, "description", e.target.value)}
                        placeholder="Describe your responsibilities and achievements..."
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Skills
              </h2>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Add your skills (comma separated)
                </label>
                <input
                  type="text"
                  value={cvData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
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
              <div className="p-6 border border-border rounded-xl bg-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Preview
                  </h2>
                  <button
                    onClick={handleExportPDF}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <Download className="size-4" />
                    Export PDF
                  </button>
                </div>

                <div className="aspect-[8.5/11] bg-white border border-border rounded-lg p-8 text-sm">
                  {/* Header */}
                  <div className="text-center border-b border-border pb-4 mb-4">
                    <h3 className="text-xl font-bold text-foreground">
                      {cvData.fullName || "Your Name"}
                    </h3>
                    <p className="text-muted-foreground text-xs mt-1">
                      {[
                        cvData.email,
                        cvData.phone,
                        cvData.location,
                      ].filter(Boolean).join(" · ") || "email@example.com · +62 812 3456 7890 · Jakarta, Indonesia"}
                    </p>
                  </div>

                  {/* Summary */}
                  {cvData.summary && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-2">
                        Professional Summary
                      </h4>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {cvData.summary}
                      </p>
                    </div>
                  )}

                  {/* Experience */}
                  {cvData.experience.some((exp) => exp.title || exp.company || exp.description) && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-2">
                        Experience
                      </h4>
                      <div className="space-y-3">
                        {cvData.experience.map((exp) => {
                          if (!exp.title && !exp.company && !exp.description) return null;

                          return (
                            <div key={exp.id} className="text-xs leading-relaxed">
                              <div className="font-semibold text-foreground">
                                {exp.title && <span>{exp.title}</span>}
                                {exp.title && exp.company && <span> · </span>}
                                {exp.company && <span className="font-normal text-muted-foreground">{exp.company}</span>}
                              </div>
                              {exp.description && (
                                <p className="text-muted-foreground mt-1">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {cvData.skills && (
                    <div>
                      <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-2">
                        Skills
                      </h4>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {cvData.skills}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
