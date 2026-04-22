import { notFound } from "next/navigation";
import { getPublicCV } from "@/features/portfolio/actions/cv";
import { getUserProfilePublic } from "@/features/portfolio/actions/portfolio";
import { Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, Award } from "lucide-react";

interface PublicCVPageProps {
  params: Promise<{ userId: string }>;
}

export default async function PublicCVPage({ params }: PublicCVPageProps) {
  const { userId } = await params;

  const cv = await getPublicCV(userId);
  if (!cv) return notFound();

  const profile = await getUserProfilePublic(userId);
  const data = cv.data;

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-[850px] mx-auto bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-8 sm:p-12 border-b border-border bg-primary/5">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                {data.fullName || profile?.full_name}
              </h1>
              <p className="text-xl text-primary font-medium mt-1">
                {profile?.headline || "Professional"}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="size-4" />
                <span>{data.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4" />
                <span>{data.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                <span>{data.location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12 space-y-12">
          {/* Summary */}
          {data.summary && (
            <section>
              <h2 className="text-lg font-semibold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                Professional Summary
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {data.summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold uppercase tracking-wider text-primary mb-6 flex items-center gap-2">
                <Briefcase className="size-5" />
                Work Experience
              </h2>
              <div className="space-y-8">
                {data.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-border">
                    <div className="absolute left-[-4px] top-2 size-2 rounded-full bg-primary" />
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{exp.title}</h3>
                        <p className="text-muted-foreground font-medium">{exp.company}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1 sm:mt-0">
                        <Calendar className="size-3.5" />
                        {exp.years}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold uppercase tracking-wider text-primary mb-6 flex items-center gap-2">
                <GraduationCap className="size-5" />
                Education
              </h2>
              <div className="space-y-6">
                {data.education.map((edu) => (
                  <div key={edu.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{edu.degree}</h3>
                      <p className="text-muted-foreground font-medium">{edu.school}</p>
                      {edu.description && (
                        <p className="text-sm text-muted-foreground mt-1">{edu.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1 sm:mt-0 whitespace-nowrap">
                      <Calendar className="size-3.5" />
                      {edu.years}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills & Languages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {data.skills && (
              <section>
                <h2 className="text-lg font-semibold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                  <Award className="size-5" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.skills.split(",").map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {data.languages && (
              <section>
                <h2 className="text-lg font-semibold uppercase tracking-wider text-primary mb-4">
                  Languages
                </h2>
                <div className="text-muted-foreground">
                  {data.languages}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
      
      {/* Back link */}
      <div className="mt-12 text-center">
        <a 
          href={`/portfolio/${userId}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Portfolio
        </a>
      </div>
    </div>
  );
}
