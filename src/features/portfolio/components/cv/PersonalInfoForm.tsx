import { FileText } from "lucide-react";
import { CVData } from "../../types/cv";

interface PersonalInfoFormProps {
  data: CVData;
  onChange: (field: keyof CVData, value: string) => void;
  errors?: Record<string, string>;
}

export function PersonalInfoForm({ data, onChange, errors }: PersonalInfoFormProps) {
  return (
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
            value={data.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="John Doe"
            className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              errors?.fullName ? "border-destructive ring-destructive" : "border-input"
            }`}
          />
          {errors?.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="john@example.com"
            className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              errors?.email ? "border-destructive ring-destructive" : "border-input"
            }`}
          />
          {errors?.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Phone</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="+62 812 3456 7890"
            className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              errors?.phone ? "border-destructive ring-destructive" : "border-input"
            }`}
          />
          {errors?.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Location</label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => onChange("location", e.target.value)}
            placeholder="Jakarta, Indonesia"
            className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              errors?.location ? "border-destructive ring-destructive" : "border-input"
            }`}
          />
          {errors?.location && <p className="text-xs text-destructive">{errors.location}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <label className="text-sm font-medium">Professional Summary</label>
        <textarea
          rows={4}
          value={data.summary}
          onChange={(e) => onChange("summary", e.target.value)}
          placeholder="Brief summary of your professional background and key strengths..."
          className={`flex w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none ${
            errors?.summary ? "border-destructive ring-destructive" : "border-input"
          }`}
        />
        {errors?.summary && <p className="text-xs text-destructive">{errors.summary}</p>}
      </div>
    </div>
  );
}
