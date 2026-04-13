import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildCertificateHtml(data: {
  userName: string;
  moduleTitle: string;
  completedAt: string;
  difficulty: string;
  certificateId: string;
}): string {
  const completedDate = new Date(data.completedAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // A4 landscape: 297mm × 210mm = 1123px × 794px at 96dpi
  const WIDTH = 2700;
  const HEIGHT = 1909;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=${WIDTH},height=${HEIGHT}" />
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: #ffffff;
  color: #09090b;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.cert {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 94px 189px;
  display: flex;
  flex-direction: column;
}
/* Corner decorations */
.corner {
  position: absolute;
  width: 50px;
  height: 50px;
  border: 3px solid #e4e4e7;
}
.corner-tl { top: 65px; left: 86px; border-right: 0; border-bottom: 0; }
.corner-tr { top: 65px; right: 86px; border-left: 0; border-bottom: 0; }
.corner-bl { bottom: 65px; left: 86px; border-right: 0; border-top: 0; }
.corner-br { bottom: 65px; right: 86px; border-left: 0; border-top: 0; }

/* Top section */
.cert-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 0 0 auto;
  padding-top: 54px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 27px;
  margin-bottom: 38px;
}
.logo-icon {
  width: 120px;
  height: 120px;
  background: #2563eb;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 65px;
  font-weight: 800;
}
.logo-text { font-size: 72px; font-weight: 800; color: #09090b; }
.cert-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 102px;
  font-weight: 700;
  color: #09090b;
  text-transform: uppercase;
  letter-spacing: 12px;
  margin-bottom: 16px;
}
.cert-subtitle {
  font-size: 39px;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 6px;
  margin-bottom: 0;
}
.cert-name {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 138px;
  font-weight: 700;
  color: #09090b;
  font-style: italic;
  margin: 32px 0 22px 0;
  max-width: 75%;
  text-align: center;
  line-height: 1.2;
  word-break: break-word;
}
.cert-subtitle-2 {
  font-size: 39px;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 6px;
  margin-bottom: 5px;
}
.cert-module {
  font-size: 60px;
  font-weight: 600;
  color: #09090b;
  margin-bottom: 59px;
  max-width: 75%;
  text-align: center;
  line-height: 1.3;
  word-break: break-word;
}

/* Details */
.cert-details {
  display: flex;
  justify-content: center;
  gap: 216px;
  width: 100%;
  flex: 0 0 auto;
}
.cert-detail { text-align: center; min-width: 324px; }
.cert-detail-label {
  font-size: 33px;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 11px;
}
.cert-detail-value {
  font-size: 45px;
  font-weight: 600;
  color: #09090b;
}

/* Bottom section */
.cert-bottom {
  margin-top: auto;
  width: 100%;
  flex: 0 0 auto;
  padding-bottom: 27px;
}
.cert-signatures {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  max-width: 1890px;
  margin: 0 auto 38px auto;
}
.cert-signature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.cert-signature-name {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-size: 54px;
  color: #09090b;
}
.cert-signature-line {
  width: 270px;
  height: 3px;
  background: #e4e4e7;
}
.cert-signature-role {
  font-size: 27px;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 3px;
}
.cert-seal {
  width: 135px;
  height: 135px;
  flex-shrink: 0;
}
.cert-id {
  text-align: right;
  font-family: monospace;
  font-size: 33px;
  color: #71717a;
  padding-right: 189px;
}

/* Watermark */
.watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40%;
  height: 40%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.03;
}
</style>
</head>
<body>
<div class="cert">
  <div class="corner corner-tl"></div>
  <div class="corner corner-tr"></div>
  <div class="corner corner-bl"></div>
  <div class="corner corner-br"></div>

  <!-- Watermark -->
  <svg class="watermark" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4" fill="none" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

  <div class="cert-top">
    <div class="logo">
      <div class="logo-icon">R</div>
      <span class="logo-text">Remonest</span>
    </div>
    <h1 class="cert-title">Certificate of Completion</h1>
    <p class="cert-subtitle">This certifies that</p>
    <h2 class="cert-name">${escapeHtml(data.userName)}</h2>
    <p class="cert-subtitle-2">has successfully completed</p>
    <h3 class="cert-module">${escapeHtml(data.moduleTitle)}</h3>
  </div>

  <div class="cert-details">
    <div class="cert-detail">
      <div class="cert-detail-label">Issue Date</div>
      <div class="cert-detail-value">${completedDate}</div>
    </div>
    <div class="cert-detail">
      <div class="cert-detail-label">Level</div>
      <div class="cert-detail-value" style="text-transform: capitalize">${escapeHtml(data.difficulty)}</div>
    </div>
  </div>

  <div class="cert-bottom">
    <div class="cert-signatures">
      <div class="cert-signature">
        <div class="cert-signature-name">Alex Morgan</div>
        <div class="cert-signature-line"></div>
        <div class="cert-signature-role">Program Director</div>
      </div>
      <svg class="cert-seal" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#f4f4f5" stroke="#e4e4e7" stroke-width="2"/>
        <path d="M50 20 L60 40 L80 40 L65 55 L70 75 L50 65 L30 75 L35 55 L20 40 L40 40 Z" fill="#2563eb" opacity="0.1"/>
        <circle cx="50" cy="50" r="30" fill="none" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="4 4"/>
        <text x="50" y="54" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#2563eb" text-anchor="middle" letter-spacing="0.5">VERIFIED</text>
      </svg>
      <div class="cert-signature">
        <div class="cert-signature-name">Jordan Lee</div>
        <div class="cert-signature-line"></div>
        <div class="cert-signature-role">Lead Instructor</div>
      </div>
    </div>
    <div class="cert-id">ID: ${escapeHtml(data.certificateId)}</div>
  </div>
</div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    console.log("[PDF API] Request received");
    const body = await request.json();
    const { userName, moduleTitle, completedAt, difficulty, certificateId } =
      body;

    if (!userName || !moduleTitle || !completedAt || !certificateId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const html = buildCertificateHtml({
      userName,
      moduleTitle,
      completedAt,
      difficulty: difficulty || "beginner",
      certificateId,
    });

    console.log("[PDF API] Launching Puppeteer...");
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--force-device-scale-factor=1",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 2700, height: 1909, deviceScaleFactor: 1 });

    console.log("[PDF API] Setting page content...");
    await page.setContent(html, { waitUntil: "networkidle0" });

    console.log("[PDF API] Taking screenshot...");
    const screenshotBuffer = await page.screenshot({
      fullPage: false,
      omitBackground: false,
      type: "png",
    });
    console.log(`[PDF API] Screenshot size: ${screenshotBuffer.length} bytes`);

    await browser.close();

    console.log("[PDF API] Sending PNG response");
    return new NextResponse(Buffer.from(screenshotBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="certificate-${certificateId}.png"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err) {
    console.error("[PDF API] Certificate PDF generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
