import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and PDF files are allowed" },
        { status: 400 }
      );
    }

    // TODO: Initialize Supabase client with service role key
    // const supabase = createClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.SUPABASE_SERVICE_ROLE_KEY!
    // );

    // TODO: Upload to Supabase Storage
    // const { data, error } = await supabase.storage
    //   .from("uploads")
    //   .upload(`${Date.now()}-${file.name}`, file);

    // if (error) {
    //   return NextResponse.json(
    //     { error: "Failed to upload file" },
    //     { status: 500 }
    //   );
    // }

    // Placeholder response
    return NextResponse.json({
      success: true,
      url: `/uploads/${file.name}`,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
