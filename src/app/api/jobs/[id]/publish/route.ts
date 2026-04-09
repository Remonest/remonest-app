import { NextRequest, NextResponse } from "next/server";
import { updateJob } from "@/lib/jobs/actions";
import { requireAuth } from "@/lib/auth/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAuth();

    const formData = new FormData();
    formData.append("action", "publish");

    const result = await updateJob(id, formData);

    if (result.success) {
      return NextResponse.redirect(new URL("/dashboard/jobs", request.url));
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json(
      { error: "Failed to publish job" },
      { status: 500 }
    );
  }
}