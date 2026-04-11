import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "learning-files";

/**
 * Proxy route for learning files.
 * Streams files from Supabase Storage without exposing the bucket URL.
 * This prevents users from copying the direct Supabase URL to download files.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const { path } = await params;

    if (!path) {
      return NextResponse.json({ error: "No file path provided" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch file from storage
    const { data, error } = await supabase.storage.from(BUCKET).download(path);

    if (error || !data) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Determine content type
    const ext = path.split(".").pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };

    const contentType = contentTypeMap[ext || ""] || "application/octet-stream";

    // Convert blob to array buffer
    const arrayBuffer = await data.arrayBuffer();

    // Set headers for inline display (not download)
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Length", arrayBuffer.byteLength.toString());
    headers.set("Cache-Control", "public, max-age=3600");

    // Security headers to prevent download/extraction
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "no-referrer");
    headers.set(
      "Content-Security-Policy",
      "default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; frame-ancestors 'none';"
    );

    // For PDFs: inline only (legacy, now handled by canvas viewer)
    if (contentType === "application/pdf") {
      headers.set("Content-Disposition", `inline; filename="${path}"`);
    }

    // For images: inline display only
    if (contentType.startsWith("image/")) {
      headers.set("Content-Disposition", `inline; filename="${path}"`);
    }

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}
