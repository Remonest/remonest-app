import { NextRequest, NextResponse } from "next/server";
import { updateJobAction } from "@/features/jobs/actions/manage-job";
import { requireAuth } from "@/features/auth/actions/guards";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAuth();

    const formData = new FormData();
    formData.append("action", "publish");

    const result = await updateJobAction(id, formData);

    if (result.success) {
      return NextResponse.redirect(new URL("/dashboard/jobs", request.url));
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to publish job" },
      { status: 500 }
    );
  }
}