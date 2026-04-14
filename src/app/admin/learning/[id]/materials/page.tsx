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

  // Fetch module info
  const { data: module } = await supabase
    .from("learning_modules")
    .select("id, title, slug, status")
    .eq("id", id)
    .single();

  if (!module) {
    redirect("/admin/learning");
  }

  // Fetch materials
  const { data: materials } = await supabase
    .from("learning_materials")
    .select("*")
    .eq("module_id", id)
    .order("created_at", { ascending: true });

  // Fetch resources
  const { data: resources } = await supabase
    .from("learning_resources")
    .select("*")
    .eq("module_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
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
