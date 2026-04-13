import type { CertificateData } from "@/features/learning-module/types/certificate";

interface CertificateTemplateProps {
  certificateData: CertificateData;
  /** Date formatter function */
  formatDate: (dateString: string) => string;
}

// Explicit hex colors — no CSS variables, no currentColor, no oklch
// html2canvas cannot parse oklch() color syntax
const C = {
  primary: "#2563eb",
  white: "#ffffff",
  foreground: "#252525",
  muted: "#8e8e8e",
  border: "#eaeaea",
  bgLight: "#f4f4f5",
  bgLightStroke: "#e4e4e7",
  sealFill: "#2563eb",
  sealStroke: "#2563eb",
} as const;

/**
 * Reusable certificate template — used for the visible canvas,
 * the zoom overlay, and html2canvas-based image download.
 *
 * Renders at exactly 900px width with FIXED pixel typography.
 * No `clamp()`, no `vw` units — all sizes are absolute so the
 * template looks identical on mobile, desktop, and in the
 * downloaded PNG.
 *
 * All colors are explicit hex values — no Tailwind CSS variable usage.
 */
export function CertificateTemplate({
  certificateData,
  formatDate,
}: CertificateTemplateProps) {
  return (
    <div
      className="relative"
      style={{
        width: "900px",
        aspectRatio: "297 / 210",
        backgroundColor: C.white,
        color: C.foreground,
      }}
    >
      {/* Corner decorations */}
      <div
        className="absolute"
        style={{
          top: "4%",
          left: "3%",
          width: "6%",
          aspectRatio: "1",
          borderTopWidth: "3px",
          borderLeftWidth: "3px",
          borderRightWidth: "0",
          borderBottomWidth: "0",
          borderStyle: "solid",
          borderColor: C.border,
          zIndex: 10,
        }}
      />
      <div
        className="absolute"
        style={{
          top: "4%",
          right: "3%",
          width: "6%",
          aspectRatio: "1",
          borderTopWidth: "3px",
          borderRightWidth: "3px",
          borderLeftWidth: "0",
          borderBottomWidth: "0",
          borderStyle: "solid",
          borderColor: C.border,
          zIndex: 10,
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: "4%",
          left: "3%",
          width: "6%",
          aspectRatio: "1",
          borderBottomWidth: "3px",
          borderLeftWidth: "3px",
          borderRightWidth: "0",
          borderTopWidth: "0",
          borderStyle: "solid",
          borderColor: C.border,
          zIndex: 10,
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: "4%",
          right: "3%",
          width: "6%",
          aspectRatio: "1",
          borderBottomWidth: "3px",
          borderRightWidth: "3px",
          borderLeftWidth: "0",
          borderTopWidth: "0",
          borderStyle: "solid",
          borderColor: C.border,
          zIndex: 10,
        }}
      />

      {/* Watermark — inline SVG with explicit fill/stroke (no currentColor) */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.03,
          zIndex: 0,
          width: "300px",
          height: "300px",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "100%" }}
        >
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke={C.primary}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Certificate Content */}
      <div
        className="absolute inset-0 flex flex-col text-center"
        style={{ padding: "5%" }}
      >
        {/* Top section */}
        <div className="flex flex-col items-center flex-shrink-0">
          {/* Logo — inline SVG with explicit colors (no currentColor) */}
          <div className="flex items-center gap-3 mb-2">
            <div
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: C.primary,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: "20px", height: "20px" }}
              >
                <path
                  d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
                  stroke={C.white}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
                  stroke={C.white}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              Remonest
            </span>
          </div>

          <h1
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "30px",
              fontWeight: 700,
              color: C.foreground,
              marginBottom: "4px",
              textTransform: "uppercase",
              letterSpacing: "3px",
            }}
          >
            Certificate of Completion
          </h1>

          <p
            style={{
              fontSize: "12px",
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: 0,
            }}
          >
            This certifies that
          </p>

          <h2
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "42px",
              fontWeight: 700,
              color: C.foreground,
              margin: "8px 0",
              fontStyle: "italic",
              lineHeight: 1.2,
              maxWidth: "75%",
            }}
          >
            {certificateData.userName}
          </h2>

          <p
            style={{
              fontSize: "12px",
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "2px",
            }}
          >
            has successfully completed
          </p>

          <h3
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: C.foreground,
              marginBottom: "16px",
              lineHeight: 1.4,
              maxWidth: "75%",
            }}
          >
            {certificateData.moduleTitle}
          </h3>
        </div>

        {/* Details */}
        <div
          className="flex justify-center flex-shrink-0"
          style={{ gap: "8%", marginBottom: "16px" }}
        >
          <div
            className="flex flex-col items-center"
            style={{ gap: "2px", minWidth: "120px" }}
          >
            <span
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: C.muted,
              }}
            >
              Issue Date
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: C.foreground,
                whiteSpace: "nowrap",
              }}
            >
              {formatDate(certificateData.completedAt)}
            </span>
          </div>
          <div
            className="flex flex-col items-center"
            style={{ gap: "2px", minWidth: "120px" }}
          >
            <span
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: C.muted,
              }}
            >
              Level
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: C.foreground,
                textTransform: "capitalize",
              }}
            >
              {certificateData.difficulty}
            </span>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-auto flex-shrink-0">
          <div
            className="flex justify-between items-end w-full mx-auto"
            style={{ maxWidth: "75%", padding: "0 8px" }}
          >
            <div className="flex flex-col items-center" style={{ gap: "2px" }}>
              <div
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: "italic",
                  fontSize: "16px",
                  color: C.foreground,
                }}
              >
                Alex Morgan
              </div>
              <div
                style={{
                  width: "90px",
                  height: "1px",
                  backgroundColor: C.border,
                }}
              />
              <div
                style={{
                  fontSize: "8px",
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Program Director
              </div>
            </div>

            {/* Seal — inline SVG with explicit colors */}
            <div
              className="relative shrink-0"
              style={{
                width: "48px",
                height: "48px",
              }}
            >
              <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                <circle cx="50" cy="50" r="45" fill={C.bgLight} stroke={C.bgLightStroke} strokeWidth="2" />
                <path d="M50 20 L60 40 L80 40 L65 55 L70 75 L50 65 L30 75 L35 55 L20 40 L40 40 Z" fill={C.sealFill} opacity="0.1" />
                <circle cx="50" cy="50" r="30" fill="none" stroke={C.sealStroke} strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="50" y="54" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" fill={C.sealFill} textAnchor="middle" letterSpacing="0.5">
                  VERIFIED
                </text>
              </svg>
            </div>

            <div className="flex flex-col items-center" style={{ gap: "2px" }}>
              <div
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: "italic",
                  fontSize: "16px",
                  color: C.foreground,
                }}
              >
                Jordan Lee
              </div>
              <div
                style={{
                  width: "90px",
                  height: "1px",
                  backgroundColor: C.border,
                }}
              />
              <div
                style={{
                  fontSize: "8px",
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Lead Instructor
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate ID */}
      <div
        className="absolute"
        style={{
          bottom: "4%",
          right: "3%",
          fontFamily: "monospace",
          fontSize: "10px",
          color: C.muted,
          zIndex: 10,
        }}
      >
        ID: {certificateData.certificateId}
      </div>
    </div>
  );
}
