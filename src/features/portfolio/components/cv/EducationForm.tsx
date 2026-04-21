import { Plus, Trash2, GraduationCap } from "lucide-react";
import { CVData, CVEducation } from "../../types/cv";

interface EducationFormProps {
  data: CVData;
  onChange: (education: CVEducation[]) => void;
  errors?: Record<string, string>;
}

export function EducationForm({ data, onChange, errors }: EducationFormProps) {
  const handleEducationChange = (id: string, field: keyof CVEducation, value: string) => {
    const updatedEducation = data.education.map((edu) =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    onChange(updatedEducation);
  };

  const handleAddEducation = () => {
    const newId = Date.now().toString();
    const newEducation: CVEducation = {
      id: newId,
      degree: "",
      school: "",
      location: "",
      years: "",
      description: "",
    };
    onChange([...data.education, newEducation]);
  };

  const handleDeleteEducation = (id: string) => {
    onChange(data.education.filter((edu) => edu.id !== id));
  };

  return (
    <div className="p-6 border border-border rounded-xl bg-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-secondary text-primary flex items-center justify-center">
            <GraduationCap className="size-5" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Education
          </h2>
        </div>
        <button
          onClick={handleAddEducation}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="size-4" />
          Add Education
        </button>
      </div>

      {errors?.education && <p className="text-sm text-destructive mb-4">{errors.education}</p>}

      <div className="space-y-4">
        {data.education.map((edu, index) => {
          const prefix = `education.${index}`;
          return (
            <div key={edu.id} className="p-4 border border-border rounded-lg bg-muted/50 relative">
              <button
                onClick={() => handleDeleteEducation(edu.id)}
                className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive transition-colors"
                title="Remove this entry"
              >
                <Trash2 className="size-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Degree / Field of Study</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                    placeholder="B.Sc. in Computer Science"
                    className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      errors?.[`${prefix}.degree`] ? "border-destructive ring-destructive" : "border-input"
                    }`}
                  />
                  {errors?.[`${prefix}.degree`] && <p className="text-xs text-destructive">{errors[`${prefix}.degree`]}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">School / University</label>
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => handleEducationChange(edu.id, "school", e.target.value)}
                    placeholder="University of Indonesia"
                    className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      errors?.[`${prefix}.school`] ? "border-destructive ring-destructive" : "border-input"
                    }`}
                  />
                  {errors?.[`${prefix}.school`] && <p className="text-xs text-destructive">{errors[`${prefix}.school`]}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Location</label>
                  <input
                    type="text"
                    value={edu.location}
                    onChange={(e) => handleEducationChange(edu.id, "location", e.target.value)}
                    placeholder="Jakarta, Indonesia"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Years</label>
                  <input
                    type="text"
                    value={edu.years}
                    onChange={(e) => handleEducationChange(edu.id, "years", e.target.value)}
                    placeholder="e.g., 2016 - 2020"
                    className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      errors?.[`${prefix}.years`] ? "border-destructive ring-destructive" : "border-input"
                    }`}
                  />
                  {errors?.[`${prefix}.years`] && <p className="text-xs text-destructive">{errors[`${prefix}.years`]}</p>}
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <label className="text-sm font-medium">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={edu.description}
                  onChange={(e) => handleEducationChange(edu.id, "description", e.target.value)}
                  placeholder="Major GPA, relevant coursework, honors..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
            </div>
          );
        })}
        {data.education.length === 0 && (
          <p className="text-center py-4 text-muted-foreground text-sm italic">
            No education entries added yet.
          </p>
        )}
      </div>
    </div>
  );
}
