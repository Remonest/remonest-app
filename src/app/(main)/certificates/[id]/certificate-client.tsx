"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Link as LinkIcon,
  Printer,
  ExternalLink,
  Copy,
  FileText,
  User,
  Calendar,
  Target,
  Hash,
  Globe,
  Check,
  X,
  ZoomIn,
} from "lucide-react";
import type { CertificateData } from "@/features/learning-module/types/certificate";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { CertificateTemplate } from "@/features/learning-module/components/CertificateTemplate";
import { addCertificateToPortfolio } from "@/features/portfolio/actions/portfolio";

interface CertificateClientProps {
  certificateData: CertificateData;
}

export function CertificateClient({ certificateData }: CertificateClientProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [mainScale, setMainScale] = useState(1);
  const [isAddingToPortfolio, setIsAddingToPortfolio] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  // Calculate responsive scale for the main certificate canvas
  // Template is 900px wide, scale it down to fit the container
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const updateMainScale = () => {
      const w = container.offsetWidth;
      if (w > 0) {
        setMainScale(Math.min(w / 900, 1));
      }
    };

    updateMainScale();
    const observer = new ResizeObserver(updateMainScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Calculate responsive scale for the zoom overlay
  // Certificate base: 900×636px (297/210 ratio)
  useEffect(() => {
    if (!isZoomed) return;

    const updateZoomScale = () => {
      const availW = window.innerWidth * 0.95;
      const availH = window.innerHeight * 0.85;
      const certW = 900;
      const certH = 636; // 900 * 210/297

      const scaleW = availW / certW;
      const scaleH = availH / certH;
      const newScale = Math.min(scaleW, scaleH, 2.0); // Cap at 2x zoom
      setZoomScale(Math.max(0.3, newScale)); // Min 0.3x for tiny screens
    };

    updateZoomScale();
    window.addEventListener("resize", updateZoomScale);
    return () => window.removeEventListener("resize", updateZoomScale);
  }, [isZoomed]);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "certificate-print-styles";
    style.media = "print";
    style.textContent = `
      @page { size: landscape; margin: 10mm; }
      body { background: white !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      header { display: none !important; }
      .print-hide { display: none !important; }
      main { padding: 0 !important; margin: 0 !important; max-width: none !important; }
      #certificate-canvas { margin: 0 !important; }
      #certificate-canvas > div { box-shadow: none !important; border: none !important; border-radius: 0 !important; transform: none !important; overflow: visible !important; max-width: none !important; width: 100% !important; }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById("certificate-print-styles");
      if (el) el.remove();
    };
  }, []);

  // Close zoom on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZoomed) {
        setIsZoomed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomed]);

  const toggleZoom = () => {
    setIsZoomed((prev) => !prev);
  };

  const handleDownload = async () => {
    if (!downloadRef.current) {
      toast.error("Template not ready");
      return;
    }
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(downloadRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 900,
        onclone: (clonedDoc) => {
          // html2canvas crashes on oklch()/lab() colors.
          // Walk every element in the clone and force explicit hex values.
          const all = clonedDoc.querySelectorAll("*");
          all.forEach((el) => {
            const s = (el as HTMLElement).style;
            const cs = clonedDoc.defaultView!.getComputedStyle(el);

            if (
              cs.color?.includes("oklch") ||
              cs.color?.includes("lab(") ||
              cs.color?.includes("color(")
            ) {
              s.color = "#252525";
            }
            if (
              cs.borderColor?.includes("oklch") ||
              cs.borderColor?.includes("lab(") ||
              cs.borderColor?.includes("color(")
            ) {
              s.borderColor = "#eaeaea";
            }
            if (
              cs.backgroundColor?.includes("oklch") ||
              cs.backgroundColor?.includes("lab(") ||
              cs.backgroundColor?.includes("color(")
            ) {
              s.backgroundColor = "#ffffff";
            }
          });
        },
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to generate image");
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `certificate-${certificateData.certificateId}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Certificate image downloaded");
      }, "image/png");
    } catch (err) {
      console.error("[Client] Download error:", err);
      toast.error(
        `Download failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const publicLink = `/verify/${certificateData.certificateId}`;

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 h-14 sm:h-16 border-b bg-card flex items-center justify-between px-3 sm:px-4 md:px-8">
        <div className="flex-1 flex items-center max-w-300 mx-auto w-full">
          <Link
            href="/dashboard/certificates"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">Back to My Certificates</span>
          </Link>
          <span className="absolute left-1/2 -translate-x-1/2 text-xs sm:text-sm font-semibold text-foreground truncate px-2">
            Certificate Detail
          </span>
          <div className="ml-auto flex items-center">
            {certificateData.userAvatar ? (
              <img
                src={certificateData.userAvatar}
                alt="User Avatar"
                className="h-9 w-9 rounded-full border"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-secondary border flex items-center justify-center">
                <User className="h-5 w-5 text-secondary-foreground" />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="w-full max-w-300 mx-auto px-3 sm:px-4 md:px-8 py-6 sm:py-8 md:py-12 print:py-0 print:px-0 print:max-w-none">
        {/* Certificate Canvas */}
        <div className="mb-6 sm:mb-8 perspective-[1000px] print:hidden" id="certificate-canvas" ref={canvasRef}>
          <div
            onClick={toggleZoom}
            className="relative w-full max-w-[900px] mx-auto bg-white rounded-lg border shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 cursor-zoom-in group print:overflow-visible print:shadow-none print:border-0 print:rounded-none print:scale-100 print:translate-y-0 print:hover:shadow-lg print:hover:translate-y-0 print:cursor-default"
            style={{ aspectRatio: "297 / 210" }}
          >
            {/* Zoom hint overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                <ZoomIn className="h-3 w-3" />
                Click to zoom
              </div>
            </div>

            {/* Responsive scale wrapper */}
            <div
              style={{
                width: "900px",
                transformOrigin: "top left",
                transform: `scale(${mainScale})`,
              }}
            >
              <CertificateTemplate
                certificateData={certificateData}
                formatDate={formatDate}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="print-hide mb-8 sm:mb-12 flex flex-wrap gap-2 sm:gap-3 justify-center items-center max-w-[900px] mx-auto px-0">
          <Button
            onClick={handleDownload}
            className="h-10 text-sm sm:text-base"
            disabled={isGenerating}
          >
            <Download className="mr-1.5 sm:mr-2 h-4.5 w-4.5" />
            {isGenerating ? "Generating…" : "Download"}
          </Button>
          <Button
            onClick={() => window.print()}
            variant="ghost"
            className="h-10"
            aria-label="Print certificate"
          >
            <Printer className="h-4.5 w-4.5" />
            <span className="hidden sm:inline ml-2">Print</span>
          </Button>
          <Button
            onClick={() => {
              const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/certificates/${certificateData.certificateId}`;
              window.open(
                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
                "_blank",
              );
            }}
            variant="secondary"
            className="h-10 bg-[#0a66c2] text-white border-[#0a66c2] hover:bg-[#0a66c2]/90 text-sm"
          >
            <LinkIcon className="mr-1.5 sm:mr-2 h-4.5 w-4.5" />
            <span className="hidden sm:inline">Share to LinkedIn</span>
          </Button>
          <Button
            onClick={async () => {
              setIsAddingToPortfolio(true);
              try {
                const result = await addCertificateToPortfolio(
                  certificateData.certificateId,
                  certificateData.moduleTitle,
                  certificateData.difficulty
                );
                if (result.success) {
                  if (result.alreadyExists) {
                    toast.info("Certificate already in your portfolio");
                  } else {
                    toast.success("Certificate added to your portfolio");
                  }
                } else {
                  toast.error(result.error || "Failed to add to portfolio");
                }
              } catch {
                toast.error("Failed to add to portfolio");
              } finally {
                setIsAddingToPortfolio(false);
              }
            }}
            variant="outline"
            className="h-10 text-sm"
            disabled={isAddingToPortfolio}
          >
            <LinkIcon className="mr-1.5 sm:mr-2 h-4.5 w-4.5" />
            <span className="hidden sm:inline">
              {isAddingToPortfolio ? "Adding…" : "Add to Portfolio"}
            </span>
          </Button>
        </div>

        {/* Metadata & Verification */}
        <div className="print-hide grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-300 mx-auto mb-6 sm:mb-8">
          {/* Metadata Card */}
          <div className="bg-card border rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-base font-bold mb-6 flex items-center gap-2.5 text-foreground">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Certificate Details
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Issued To
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {certificateData.userName}
                </div>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Module
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {certificateData.moduleTitle}
                </div>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Issue Date
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {formatDate(certificateData.completedAt)}
                </div>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  Score
                </div>
                <div className="text-sm font-semibold text-foreground">
                  100/100
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  Certificate ID
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground font-mono">
                  {certificateData.certificateId}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-1.5 h-6.5 text-muted-foreground"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        certificateData.certificateId,
                      );
                      setCopied(true);
                      toast.success("Copied to clipboard");
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Card */}
          <div className="bg-card border rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-base font-bold mb-6 flex items-center gap-2.5 text-foreground">
              <Check className="h-4 w-4 text-muted-foreground" />
              Verification Status
            </h3>

            <div className="flex items-center gap-4 p-4 bg-[#ecfdf5] border border-[#34d399] rounded-lg mb-5">
              <div className="h-11 w-11 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h4 className="m-0 mb-1 text-base font-bold text-[#065f46]">
                  Verified & Valid
                </h4>
                <p className="m-0 text-sm text-[#047857] leading-7">
                  This certificate was issued by Remonest.
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-7 mb-6">
              Anyone with the public link can verify the authenticity of this
              certificate directly on the Remonest platform.
            </p>

            <div className="flex items-center gap-3 bg-background p-3 border rounded-lg">
              <Globe className="h-[18px] w-[18px] text-muted-foreground" />
              <div className="flex-1 font-mono text-sm text-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                {publicLink}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="px-2 h-7 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${typeof window !== "undefined" ? window.location.origin : ""}${publicLink}`,
                  );
                  setCopied(true);
                  toast.success("Copied to clipboard");
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>

            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href={publicLink}>
                <ExternalLink className="mr-1 h-4 w-4" />
                View Public Page
              </Link>
            </Button>
          </div>
        </div>

        {/* Zoom Overlay */}
        {isZoomed && (
          <div
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 cursor-zoom-out"
            onClick={() => setIsZoomed(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Zoomed certificate view"
          >
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(false);
              }}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-[10000] h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Close zoom"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Zoomed certificate — fits to viewport with scroll overflow */}
            <div
              className="overflow-auto rounded-lg shadow-2xl bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Scale computed dynamically from viewport — fits the 900px template */}
              <div
                style={{
                  width: `${Math.round(900 * zoomScale)}px`,
                  height: `${Math.round(636 * zoomScale)}px`,
                }}
              >
                <div
                  style={{
                    transform: `scale(${zoomScale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <CertificateTemplate
                    certificateData={certificateData}
                    formatDate={formatDate}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hidden template for download/image generation */}
        {/* Template uses explicit hex colors — no CSS variables, so html2canvas works cleanly */}
        <div
          ref={downloadRef}
          style={{
            position: "absolute",
            left: "-9999px",
            top: "0",
            background: "#ffffff",
          }}
          aria-hidden="true"
        >
          <CertificateTemplate
            certificateData={certificateData}
            formatDate={formatDate}
          />
        </div>
      </main>
    </div>
  );
}
