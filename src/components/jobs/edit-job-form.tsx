"use client";

import { useState, useTransition } from "react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Send,
  Rocket,
  Trash2,
  FileText,
  Briefcase,
  MapPin,
  Banknote,
  Calendar,
  Tag,
  Settings,
  LogOut,
  LayoutDashboard,
  Users,
  Building2,
  ChevronDown,
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RichTextToolbar } from "@/components/jobs/rich-text-toolbar";
import { TagInput } from "@/components/jobs/tag-input";
import { updateJob, deleteJob } from "@/lib/jobs/actions";
import type { JobType } from "@/lib/jobs/utils";
import { toast } from "sonner";

interface JobData {
  id: string;
  title: string;
  company: string;
  description_html: string;
  job_type: JobType;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  location: string;
  deadline: string | null;
  duration_estimate: string | null;
  apply_method: "url" | "email";
  apply_url: string | null;
  apply_email: string | null;
  status: "draft" | "pending" | "published" | "rejected";
  skills: string[];
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

const statusStyles: Record<string, string> = {
  draft: "bg-amber-100 text-amber-700 border-amber-200",
  pending: "bg-blue-100 text-blue-700 border-blue-200",
  published: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  pending: "In Review",
  published: "Published",
  rejected: "Rejected",
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
      form.set("job_type", formData.job_type);
      form.set("salary_min", formData.salary_min);
      form.set("salary_max", formData.salary_max);
      form.set("location", formData.location);
      form.set("deadline", formData.deadline);
      form.set("duration_estimate", formData.duration_estimate);
      form.set("apply_method", formData.apply_method);
      form.set("apply_url", formData.apply_url);
      form.set("apply_email", formData.apply_email);
      form.set("action", action === "publish" ? "publish" : "update");

      const result = await updateJob(job.id, form);

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
      const result = await deleteJob(job.id);

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
    <div className="py-4 sm:py-6">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/jobs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Edit Job Listing
            </h1>
            <Badge
              variant="outline"
              className={`${statusStyles[job.status]} text-sm font-medium`}
            >
              {statusLabels[job.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Update your job posting and manage settings
          </p>
        </div>
        <Button
          onClick={() => handleSave("draft")}
          disabled={isPending}
          className="h-10 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Main Form */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="border border-border rounded-xl bg-card shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-border">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Basic Information
                  </h2>
                </div>

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
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card className="border border-border rounded-xl bg-card shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-border">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Job Description
                  </h2>
                </div>

                {/* Role Overview */}
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
              </CardContent>
            </Card>

            {/* Skills & Requirements */}
            <Card className="border border-border rounded-xl bg-card shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-border">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Skills & Requirements
                  </h2>
                </div>

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
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Details */}
            <Card className="border border-border rounded-xl bg-card shadow-sm sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-border">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Job Details
                  </h2>
                </div>

                {/* Employment Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Employment Type
                  </Label>
                  <Select
                    value={formData.job_type}
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
                    value="remote"
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

                {/* Action Buttons */}
                <div className="pt-4 border-t border-border space-y-3">
                  <Button
                    onClick={() => handleSave("publish")}
                    disabled={isPending}
                    className="w-full h-11 gap-2 bg-primary hover:bg-primary/90"
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}
