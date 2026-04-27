import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { optimizeImageBuffer } from "@/lib/server-image-optimization";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB for PDFs
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB for documents
const BUCKET = "learning-files";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (different limits per type)
    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    const maxSize = isPdf ? MAX_PDF_SIZE : isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE;

    if (file.size > maxSize) {
      const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      return NextResponse.json(
        { error: `Ukuran file maksimal ${sizeMB}MB untuk ${isPdf ? "PDF" : "gambar/dokumen"}` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung. Hanya PDF, gambar (JPEG/PNG/WebP/GIF), dan dokumen Word/Excel." },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
    let finalMimeType = file.type;

    // Optimize image if necessary
    if (isImage) {
      const optimized = await optimizeImageBuffer(buffer, file.type);
      buffer = optimized.buffer;
      finalMimeType = optimized.mimeType;
    }

    // Generate unique filename: timestamp-random-originalname
    const ext = finalMimeType === 'image/webp' ? 'webp' : file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: finalMimeType,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return NextResponse.json(
        { error: "Gagal mengupload file: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      path: fileName,
      url: `/api/learning/file/${fileName}`,
      size: buffer.length, // use optimized buffer size
      type: finalMimeType,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Gagal mengupload file: " + err.message },
      { status: 500 }
    );
  }
}
