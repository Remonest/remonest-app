"use client";

import { useState, useEffect, useCallback } from "react";
import { Edit3, Eye, Save, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { CVData } from "@/features/portfolio/types/cv";
import { updateCVAction, saveCVDraftAction } from "@/features/portfolio/actions/cv";
import { PersonalInfoForm } from "@/features/portfolio/components/cv/PersonalInfoForm";
import { ExperienceForm } from "@/features/portfolio/components/cv/ExperienceForm";
import { EducationForm } from "@/features/portfolio/components/cv/EducationForm";
import { SkillsForm } from "@/features/portfolio/components/cv/SkillsForm";
import { CVPreview } from "@/features/portfolio/components/cv/CVPreview";
import { StandardTemplate } from "@/features/portfolio/components/cv/templates/StandardTemplate";

interface CVBuilderClientProps {
  initialData: CVData;
}

export function CVBuilderClient({ initialData }: CVBuilderClientProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [cvData, setCvData] = useState<CVData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Only save if data has changed from initial
      if (JSON.stringify(cvData) !== JSON.stringify(initialData)) {
        await saveCVDraftAction(cvData);
        setLastSaved(new Date());
      }
    }, 3000); // 3 seconds debounce

    return () => clearTimeout(timer);
  }, [cvData, initialData]);

  // Handle manual save
  const handleSave = async () => {
    setIsSaving(true);
    setValidationErrors({});
    
    try {
      const result = await updateCVAction(cvData);
      if (result.success) {
        toast.success("CV saved successfully");
        setLastSaved(new Date());
      } else {
        if (result.validationErrors) {
          setValidationErrors(result.validationErrors);
          // Scroll to the first error if possible
          const firstErrorKey = Object.keys(result.validationErrors)[0];
          const element = document.querySelector(`[name="${firstErrorKey}"]`) || 
                          document.querySelector(`input, textarea, select`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        toast.error(result.error || "Failed to save CV");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle PDF Export
  const handleExportPDF = async () => {
    try {
      if (!cvData.fullName.trim()) {
        toast.error("Please enter your full name before exporting");
        return;
      }

      toast.loading("Generating professional PDF...", { id: "pdf-gen" });
      
      const blob = await pdf(<StandardTemplate data={cvData} />).toBlob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `${cvData.fullName.replace(/\s+/g, "_").toLowerCase()}_cv.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("PDF exported successfully", { id: "pdf-gen" });
    } catch (error) {
      toast.error("Failed to generate PDF", { id: "pdf-gen" });
      console.error(error);
    }
  };

  const handleInputChange = (field: keyof CVData, value: any) => {
    setCvData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (validationErrors[field as string]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[1200px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              CV Builder
            </h1>
            <p className="mt-2 text-base text-muted-foreground flex items-center gap-2">
              Create a structured, ATS-friendly resume
              {lastSaved && (
                <span className="text-xs font-normal">
                  · Last saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
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
          <div className={`space-y-6 ${activeTab === "preview" ? "hidden lg:block" : ""}`}>
            <PersonalInfoForm 
              data={cvData} 
              onChange={handleInputChange}
              errors={validationErrors}
            />
            
            <ExperienceForm 
              data={cvData} 
              onChange={(experience) => handleInputChange("experience", experience)}
              errors={validationErrors}
            />

            <EducationForm 
              data={cvData} 
              onChange={(education) => handleInputChange("education", education)}
              errors={validationErrors}
            />

            <SkillsForm 
              data={cvData} 
              onChange={handleInputChange}
              errors={validationErrors}
            />
          </div>

          {/* Preview */}
          <div className={`${activeTab === "preview" ? "block" : "hidden"} lg:block`}>
            <CVPreview 
              data={cvData} 
              onExport={handleExportPDF} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
