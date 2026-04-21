import { Wrench } from "lucide-react";
import { CVData } from "../../types/cv";

interface SkillsFormProps {
  data: CVData;
  onChange: (field: keyof CVData, value: string) => void;
  errors?: Record<string, string>;
}

export function SkillsForm({ data, onChange, errors }: SkillsFormProps) {
  return (
    <div className="p-6 border border-border rounded-xl bg-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-md bg-secondary text-primary flex items-center justify-center">
          <Wrench className="size-5" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Skills & Languages
        </h2>
      </div>
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Professional Skills (comma separated)
          </label>
          <input
            type="text"
            value={data.skills}
            onChange={(e) => onChange("skills", e.target.value)}
            placeholder="React, TypeScript, Node.js, Figma, Project Management..."
            className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              errors?.skills ? "border-destructive ring-destructive" : "border-input"
            }`}
          />
          {errors?.skills && <p className="text-xs text-destructive">{errors.skills}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Languages (comma separated)
          </label>
          <input
            type="text"
            value={data.languages || ""}
            onChange={(e) => onChange("languages", e.target.value)}
            placeholder="Indonesian (Native), English (Professional Working)..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
    </div>
  );
}
