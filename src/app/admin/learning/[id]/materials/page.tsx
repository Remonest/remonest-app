import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { MaterialListClient } from "./material-list-client";
import { LearningBreadcrumb } from "@/components/admin/learning-breadcrumb";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MaterialsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { data: module } = await supabase
    .from("learning_modules")
    .select("id, title, slug, status")
    .eq("id", id)
    .single();

  if (!module) {
    redirect("/admin/learning");
  }

  // Get material IDs already linked to lessons (managed by Flow Builder)
  const { data: lessonLinks } = await supabase
    .from("module_lessons")
    .select("material_id")
    .eq("module_id", id)
    .not("material_id", "is", null);

  const lessonMaterialIds = (lessonLinks ?? []).map((l: any) => l.material_id as string);

  // Fetch materials excluding those managed by Flow Builder
  const materialsQuery = supabase
    .from("learning_materials")
    .select("*")
    .eq("module_id", id)
    .order("created_at", { ascending: true });

  const { data: materials } = lessonMaterialIds.length > 0
    ? await materialsQuery.not("id", "in", `(${lessonMaterialIds.join(",")})`)
    : await materialsQuery;

  const { data: resources } = await supabase
    .from("learning_resources")
    .select("*")
    .eq("module_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <LearningBreadcrumb
        moduleId={id}
        moduleTitle={module.title}
        currentPage="Materials & Resources"
      />
      <MaterialListClient
        module={module}
        materials={materials || []}
        resources={resources || []}
      />
    </div>
  );
}
