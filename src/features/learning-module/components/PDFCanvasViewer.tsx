"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, FileText, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface PDFCanvasViewerProps {
  fileUrl: string;
  title: string;
}

// Legal paper width: 8.5" × 72 DPI = 612px
const LEGAL_PAGE_WIDTH = 612;

// Zoom limits
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

export default function PDFCanvasViewer({
  fileUrl,
  title,
}: PDFCanvasViewerProps) {
  const pagesContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  /**
   * Render all pages into the container at the given zoom level.
   * Reuses the PDF document stored in pdfRef.
   */
  const renderPages = useCallback(async (currentZoom: number) => {
    const pdf = pdfRef.current;
    const container = pagesContainerRef.current;
    if (!pdf || !container) return;

    container.innerHTML = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const baseScale = LEGAL_PAGE_WIDTH / viewport.width;
      const renderScale = baseScale * currentZoom;
      const scaledViewport = page.getViewport({ scale: renderScale });

      // Page wrapper — styled like legal paper
      const pageDiv = document.createElement("div");
      pageDiv.className =
        "relative bg-white rounded-sm shadow-md overflow-hidden mx-auto";
      pageDiv.style.width = `${scaledViewport.width}px`;
      pageDiv.style.minHeight = `${scaledViewport.height}px`;

      // Canvas
      const canvas = document.createElement("canvas");
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      canvas.className = "block";
      canvas.style.pointerEvents = "none";
      canvas.style.userSelect = "none";

      await page.render({ canvas, viewport: scaledViewport }).promise;
      pageDiv.appendChild(canvas);

      // Per-page overlay to block right-click / drag
      const overlay = document.createElement("div");
      overlay.className = "absolute inset-0 cursor-default";
      overlay.style.userSelect = "none";
      (
        overlay.style as CSSStyleDeclaration & Record<string, string>
      ).webkitUserSelect = "none";
      overlay.addEventListener("contextmenu", (e) => e.preventDefault());
      overlay.addEventListener("dragstart", (e) => e.preventDefault());
      pageDiv.appendChild(overlay);

      container.appendChild(pageDiv);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPDF() {
      try {
        setLoading(true);
        setError(null);

        const pdfjs = await import("pdfjs-dist");
        const { getDocument, GlobalWorkerOptions } = pdfjs;

        GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const response = await fetch(fileUrl);
        if (!response.ok)
          throw new Error(
            `Failed to fetch PDF: ${response.status} ${response.statusText}`,
          );
        const arrayBuffer = await response.arrayBuffer();

        if (cancelled) return;

        const loadingTask = getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        // Store PDF doc for re-rendering on zoom change
        pdfRef.current = pdf;

        // Stop loading so the container div mounts
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error("[PDFCanvasViewer] PDF load error:", err);
          setError(err instanceof Error ? err.message : "Gagal memuat PDF");
          setLoading(false);
        }
      }
    }

    loadPDF();

    return () => {
      cancelled = true;
    };
  }, [fileUrl, renderPages]);

  // Re-render pages when zoom changes
  useEffect(() => {
    if (pdfRef.current && !loading) {
      renderPages(zoom);
    }
  }, [zoom, loading, renderPages]);

  const handleZoomReset = () => setZoom(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] text-muted-foreground">
        <Loader2 className="size-6 animate-spin mr-2" />
        Memuat PDF...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] text-muted-foreground">
        <div className="text-center">
          <FileText className="size-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="relative">
      {/* Floating zoom toolbar — centered at top */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 px-2 py-1 rounded-full bg-background/95 backdrop-blur border border-border shadow-lg">
        <button
          onClick={() =>
            setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM))
          }
          disabled={zoom <= MIN_ZOOM}
          className="inline-flex items-center justify-center size-8 rounded-full hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title={`Zoom Out (${Math.round(Math.max(zoom - ZOOM_STEP, MIN_ZOOM) * 100)}%)`}
        >
          <ZoomOut className="size-4" />
        </button>

        {/* Reset button — only visible when zoom ≠ 100% */}
        {zoom !== 1 && (
          <button
            onClick={handleZoomReset}
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full hover:bg-accent transition-colors text-xs font-mono font-medium"
            title="Reset Zoom (100%)"
          >
            <RotateCcw className="size-3" />
            {zoomPercent}%
          </button>
        )}

        <button
          onClick={() =>
            setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM))
          }
          disabled={zoom >= MAX_ZOOM}
          className="inline-flex items-center justify-center size-8 rounded-full hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title={`Zoom In (${Math.round(Math.min(zoom + ZOOM_STEP, MAX_ZOOM) * 100)}%)`}
        >
          <ZoomIn className="size-4" />
        </button>
      </div>

      {/* Scrollable page container */}
      <div
        ref={pagesContainerRef}
        className="space-y-6 overflow-y-auto px-4 pt-14 pb-2"
        style={{ maxHeight: "75vh" }}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Sticky watermark bar */}
      <div className="sticky bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-md bg-muted/90 backdrop-blur text-xs text-muted-foreground pointer-events-none w-fit">
        <FileText className="size-3" />
        Baca saja — unduh tidak tersedia
      </div>
    </div>
  );
}
