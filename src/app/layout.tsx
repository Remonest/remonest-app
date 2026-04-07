import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { ThemeInit } from "@/components/landing/theme-init";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Remonest - Remote Career Platform for Indonesian Professionals",
    template: "%s | Remonest",
  },
  description:
    "Find global remote opportunities, sharpen remote-ready skills, and build an ATS-ready CV and portfolio. Built for Indonesian professionals.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  keywords: [
    "remote jobs",
    "remote work Indonesia",
    "work from home",
    "remote career",
    "CV builder",
    "portfolio builder",
    "remote skills",
    "Indonesian professionals",
  ],
  authors: [{ name: "Remonest" }],
  creator: "Remonest",
  publisher: "Remonest",
  metadataBase: new URL("https://remonest.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://remonest.com",
    title: "Remonest - Remote Career Platform for Indonesian Professionals",
    description:
      "Find global remote opportunities, sharpen remote-ready skills, and build an ATS-ready CV and portfolio.",
    siteName: "Remonest",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://remonest.com"}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Remonest - Remote Career Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Remonest - Remote Career Platform",
    description:
      "Find global remote opportunities and build your remote career.",
    images: [`${process.env.NEXT_PUBLIC_APP_URL || "https://remonest.com"}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeInit />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
