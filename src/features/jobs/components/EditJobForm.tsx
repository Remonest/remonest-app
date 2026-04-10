"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Briefcase,
  Calendar,
  Tag,
  Trash2,
  Clock,
  Rocket,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextToolbar } from "@/features/jobs/components/RichTextToolbar";
import { TagInput } from "@/features/jobs/components/TagInput";
import { updateJobAction, deleteJobAction } from "@/features/jobs/actions/manage-job";
import type { JobType } from "@/features/jobs/types/job";
import { toast } from "sonner";

interface JobData {
  id: string;
  title: string;
  company: string;
  description_html: string;
  job_type: JobType | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  location: string;
  deadline: string | null;
  duration_estimate: string | null;
  apply_method: "url" | "email" | null;
  apply_url: string | null;
  apply_email: string | null;
  status: "draft" | "pending" | "approved" | "published" | "rejected" | "expired";
  skills: string[];
  created_at?: string;
  rejection_reason?: string;
}

interface EditJobPageProps {
  job: JobData;
}

const jobTypeLabels: Record<string, string> = {
  "full-time": "Penuh Waktu",
  "part-time": "Paruh Waktu",
  project: "Proyek",
  freelance: "Freelance",
};

const workModelLabels: Record<string, string> = {
  remote: "WFH (Remote)",
  hybrid: "Hybrid",
  onsite: "WFO (On-site)",
};

export function EditJobForm({ job }: EditJobPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    title: job.title,
    company: job.company,
    description_html: job.description_html,
    job_type: job.job_type,
    salary_min: job.salary_min?.toString() || "",
    salary_max: job.salary_max?.toString() || "",
    location: job.location,
    deadline: job.deadline || "",
    duration_estimate: job.duration_estimate || "",
    apply_method: job.apply_method,
    apply_url: job.apply_url || "",
    apply_email: job.apply_email || "",
    skills: job.skills || [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    }
    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
    }
    if (!formData.description_html.trim()) {
      newErrors.description_html = "Job description is required";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (action: "draft" | "publish") => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    startTransition(async () => {
      const form = new FormData();
      form.set("title", formData.title);
      form.set("company", formData.company);
      form.set("description_html", formData.description_html);
      form.set("job_type", formData.job_type ?? "");
      form.set("salary_min", formData.salary_min?.toString() ?? "");
      form.set("salary_max", formData.salary_max?.toString() ?? "");
      form.set("location", formData.location);
      form.set("deadline", formData.deadline ?? "");
      form.set("duration_estimate", formData.duration_estimate ?? "");
      form.set("apply_method", formData.apply_method ?? "");
      form.set("apply_url", formData.apply_url ?? "");
      form.set("apply_email", formData.apply_email ?? "");
      form.set("action", action === "publish" ? "publish" : "update");

      const result = await updateJobAction(job.id, form);

      if (result.success) {
        toast.success(
          action === "publish"
            ? "Job published successfully!"
            : "Draft saved successfully!"
        );
        router.push("/dashboard/jobs");
      } else {
        toast.error(result.error || "Failed to save job");
      }
    });
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this job listing? This action cannot be undone."
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteJobAction(job.id);

      if (result.success) {
        toast.success("Job deleted successfully");
        router.push("/dashboard/jobs");
      } else {
        toast.error(result.error || "Failed to delete job");
      }
    });
  };

  const insertHtml = (html: string) => {
    const textarea = document.getElementById(
      "description"
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.description_html;
      const newText =
        text.substring(0, start) + html + text.substring(end);
      setFormData({ ...formData, description_html: newText });
    }
  };

  const formatCurrency = (value: string) => {
    if (!value) return "";
    const num = parseInt(value.replace(/\D/g, ""));
    if (isNaN(num)) return "";
    return num.toLocaleString("id-ID");
  };

  return (
    <div>
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left Column: Main Form */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="panel p-6 sm:p-8 border border-border rounded-2xl bg-card">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 pb-4 border-b border-border mb-6">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Basic Information
              </h2>

              <div className="space-y-6">
                {/* Job Title */}
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-foreground"
                  >
                    Job Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Senior Product Designer"
                    className={`h-11 ${errors.title ? "border-destructive" : ""}`}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label
                    htmlFor="company"
                    className="text-sm font-medium text-foreground"
                  >
                    Company Name *
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    placeholder="e.g., TechCorp Indonesia"
                    className={`h-11 ${errors.company ? "border-destructive" : ""}`}
                  />
                  {errors.company && (
                    <p className="text-sm text-destructive">{errors.company}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="panel p-6 sm:p-8 border border-border rounded-2xl bg-card">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 pb-4 border-b border-border mb-6">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                Job Description
              </h2>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-foreground"
                >
                  Role Overview *
                </Label>
                <RichTextToolbar onInsert={insertHtml} />
                <Textarea
                  id="description"
                  value={formData.description_html}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description_html: e.target.value,
                    })
                  }
                  placeholder="Describe the role, responsibilities, and requirements..."
                  rows={10}
                  className={`min-h-[200px] rounded-t-none ${
                    errors.description_html ? "border-destructive" : ""
                  }`}
                />
                {errors.description_html && (
                  <p className="text-sm text-destructive">
                    {errors.description_html}
                  </p>
                )}
              </div>
            </div>

            {/* Skills & Requirements */}
            <div className="panel p-6 sm:p-8 border border-border rounded-2xl bg-card">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 pb-4 border-b border-border mb-6">
                <Tag className="h-5 w-5 text-muted-foreground" />
                Skills & Requirements
              </h2>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Required Skills{" "}
                  <span className="text-muted-foreground font-normal">
                    (Press Enter to add)
                  </span>
                </Label>
                <TagInput
                  tags={formData.skills}
                  onChange={(tags) =>
                    setFormData({ ...formData, skills: tags })
                  }
                  placeholder="Add a skill..."
                />
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Job Details Panel */}
            <div className="panel p-6 border border-border rounded-2xl bg-card">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Job Settings
              </h3>

              <div className="space-y-6">
                {/* Employment Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Employment Type
                  </Label>
                  <Select
                    value={formData.job_type ?? undefined}
                    onValueChange={(value) =>
                      setFormData({ ...formData, job_type: value as JobType })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(jobTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Work Model */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Work Model
                  </Label>
                  <Select
                    value={formData.location || "remote"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, location: value })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select work model" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(workModelLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Salary Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Salary Range (Monthly)
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        Min
                      </p>
                      <Input
                        value={formatCurrency(formData.salary_min)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          setFormData({ ...formData, salary_min: raw });
                        }}
                        placeholder="Min"
                        className="h-11"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        Max
                      </p>
                      <Input
                        value={formatCurrency(formData.salary_max)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          setFormData({ ...formData, salary_max: raw });
                        }}
                        placeholder="Max"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                {/* Application Deadline */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Application Deadline
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                      className="h-11 pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Posting Details */}
            <div className="panel p-6 border border-border rounded-2xl bg-card">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Posting Details
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Date Posted
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(job.created_at || job.id).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {job.deadline && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Application Deadline
                    </p>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(job.deadline).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {job.duration_estimate && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Duration Estimate
                    </p>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {job.duration_estimate}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Visibility
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {job.status === "published"
                      ? "Public Job Board"
                      : job.status === "draft"
                        ? "Private Draft"
                        : "Pending Review"}
                  </p>
                </div>

                {job.status === "rejected" && job.rejection_reason && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {job.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="panel p-6 border border-border rounded-2xl bg-card space-y-3">
              <Button
                onClick={() => handleSave("publish")}
                disabled={isPending}
                className="w-full h-11 gap-2"
              >
                <Rocket className="h-4 w-4" />
                Publish Now
              </Button>
              <Button
                onClick={() => handleSave("draft")}
                disabled={isPending}
                variant="outline"
                className="w-full h-11 gap-2"
              >
                <Save className="h-4 w-4" />
                Save as Draft
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isPending}
                variant="ghost"
                className="w-full h-11 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete Listing
              </Button>
            </div>
          </div>
        </div>
      </div>
  );
}
