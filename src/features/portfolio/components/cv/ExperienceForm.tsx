import { Plus, Trash2, Briefcase } from "lucide-react";
import { CVData, CVExperience } from "../../types/cv";

interface ExperienceFormProps {
  data: CVData;
  onChange: (experience: CVExperience[]) => void;
  errors?: Record<string, string>;
}

export function ExperienceForm({ data, onChange, errors }: ExperienceFormProps) {
  const handleExperienceChange = (id: string, field: keyof CVExperience, value: string) => {
    const updatedExperience = data.experience.map((exp) =>
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    onChange(updatedExperience);
  };

  const handleAddExperience = () => {
    const newId = Date.now().toString();
    const newExperience: CVExperience = {
      id: newId,
      title: "",
      company: "",
      location: "",
      years: "",
      description: "",
    };
    onChange([...data.experience, newExperience]);
  };

  const handleDeleteExperience = (id: string) => {
    onChange(data.experience.filter((exp) => exp.id !== id));
  };

  return (
    <div className="p-6 border border-border rounded-xl bg-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-secondary text-primary flex items-center justify-center">
            <Briefcase className="size-5" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Work Experience
          </h2>
        </div>
        <button
          onClick={handleAddExperience}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="size-4" />
          Add Position
        </button>
      </div>

      {errors?.experience && <p className="text-sm text-destructive mb-4">{errors.experience}</p>}

      <div className="space-y-4">
        {data.experience.map((exp, index) => {
          const prefix = `experience.${index}`;
          return (
            <div key={exp.id} className="p-4 border border-border rounded-lg bg-muted/50 relative">
              <button
                onClick={() => handleDeleteExperience(exp.id)}
                className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive transition-colors"
                title="Remove this position"
              >
                <Trash2 className="size-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Job Title</label>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => handleExperienceChange(exp.id, "title", e.target.value)}
                    placeholder="Frontend Developer"
                    className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      errors?.[`${prefix}.title`] ? "border-destructive ring-destructive" : "border-input"
                    }`}
                  />
                  {errors?.[`${prefix}.title`] && <p className="text-xs text-destructive">{errors[`${prefix}.title`]}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)}
                    placeholder="Company Name"
                    className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      errors?.[`${prefix}.company`] ? "border-destructive ring-destructive" : "border-input"
                    }`}
                  />
                  {errors?.[`${prefix}.company`] && <p className="text-xs text-destructive">{errors[`${prefix}.company`]}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Location</label>
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => handleExperienceChange(exp.id, "location", e.target.value)}
                    placeholder="Remote / Jakarta"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Years</label>
                  <input
                    type="text"
                    value={exp.years}
                    onChange={(e) => handleExperienceChange(exp.id, "years", e.target.value)}
                    placeholder="e.g., 2020 - 2023"
                    className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      errors?.[`${prefix}.years`] ? "border-destructive ring-destructive" : "border-input"
                    }`}
                  />
                  {errors?.[`${prefix}.years`] && <p className="text-xs text-destructive">{errors[`${prefix}.years`]}</p>}
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  rows={3}
                  value={exp.description}
                  onChange={(e) => handleExperienceChange(exp.id, "description", e.target.value)}
                  placeholder="Describe your responsibilities and achievements..."
                  className={`flex w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none ${
                    errors?.[`${prefix}.description`] ? "border-destructive ring-destructive" : "border-input"
                  }`}
                />
                {errors?.[`${prefix}.description`] && <p className="text-xs text-destructive">{errors[`${prefix}.description`]}</p>}
              </div>
            </div>
          );
        })}
        {data.experience.length === 0 && (
          <p className="text-center py-4 text-muted-foreground text-sm italic">
            No experience entries added yet.
          </p>
        )}
      </div>
    </div>
  );
}
