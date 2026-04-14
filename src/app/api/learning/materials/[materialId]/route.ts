import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ materialId: string }> }
) {
  try {
    const { materialId } = await params;
    const supabase = getSupabaseServiceClient();

    const { data, error } = await supabase
      .from("learning_materials")
      .select("id, title, content, source_type")
      .eq("id", materialId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/learning/materials/[id]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
