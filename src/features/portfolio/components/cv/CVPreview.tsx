import { Download } from "lucide-react";
import { CVData } from "../../types/cv";

interface CVPreviewProps {
  data: CVData;
  onExport: () => void;
}

export function CVPreview({ data, onExport }: CVPreviewProps) {
  return (
    <div className="sticky top-8">
      <div className="p-6 border border-border rounded-xl bg-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Preview
          </h2>
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Download className="size-4" />
            Download PDF
          </button>
        </div>

        <div className="aspect-[8.5/11] bg-white border border-border shadow-sm rounded-lg p-8 text-slate-800 overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-6 mb-6">
            <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">
              {data.fullName || "Your Full Name"}
            </h3>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2 text-[11px] text-slate-600">
              {data.email && <span>{data.email}</span>}
              {data.email && data.phone && <span className="text-slate-300">|</span>}
              {data.phone && <span>{data.phone}</span>}
              {(data.email || data.phone) && data.location && <span className="text-slate-300">|</span>}
              {data.location && <span>{data.location}</span>}
            </div>
          </div>

          {/* Summary */}
          {data.summary && (
            <div className="mb-6">
              <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-[0.1em] border-b border-slate-100 pb-1 mb-2">
                Professional Summary
              </h4>
              <p className="text-slate-700 text-[11px] leading-[1.6]">
                {data.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {data.experience.some((exp) => exp.title || exp.company) && (
            <div className="mb-6">
              <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-[0.1em] border-b border-slate-100 pb-1 mb-2">
                Work Experience
              </h4>
              <div className="space-y-4">
                {data.experience.map((exp) => {
                  if (!exp.title && !exp.company) return null;

                  return (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <div className="text-[11px] font-bold text-slate-900">
                          {exp.title || "Position Title"}
                        </div>
                        <div className="text-[10px] font-medium text-slate-500">
                          {exp.years || "Dates"}
                        </div>
                      </div>
                      <div className="flex justify-between items-baseline mb-1.5">
                        <div className="text-[10px] font-semibold text-slate-700">
                          {exp.company || "Company Name"}
                          {exp.location && <span className="font-normal text-slate-500">, {exp.location}</span>}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-slate-600 text-[10px] leading-[1.5] whitespace-pre-wrap">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education.some((edu) => edu.degree || edu.school) && (
            <div className="mb-6">
              <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-[0.1em] border-b border-slate-100 pb-1 mb-2">
                Education
              </h4>
              <div className="space-y-4">
                {data.education.map((edu) => {
                  if (!edu.degree && !edu.school) return null;

                  return (
                    <div key={edu.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <div className="text-[11px] font-bold text-slate-900">
                          {edu.degree || "Degree Name"}
                        </div>
                        <div className="text-[10px] font-medium text-slate-500">
                          {edu.years || "Dates"}
                        </div>
                      </div>
                      <div className="text-[10px] font-semibold text-slate-700">
                        {edu.school || "University Name"}
                        {edu.location && <span className="font-normal text-slate-500">, {edu.location}</span>}
                      </div>
                      {edu.description && (
                        <p className="text-slate-600 text-[10px] leading-[1.5] mt-1 italic">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skills & Languages */}
          {(data.skills || data.languages) && (
            <div className="grid grid-cols-2 gap-8">
              {data.skills && (
                <div>
                  <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-[0.1em] border-b border-slate-100 pb-1 mb-2">
                    Technical Skills
                  </h4>
                  <p className="text-slate-700 text-[10px] leading-[1.6]">
                    {data.skills}
                  </p>
                </div>
              )}
              {data.languages && (
                <div>
                  <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-[0.1em] border-b border-slate-100 pb-1 mb-2">
                    Languages
                  </h4>
                  <p className="text-slate-700 text-[10px] leading-[1.6]">
                    {data.languages}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
