import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "GRIDPULSE // Global Grid Telemetry",
  description:
    "Evidence-first infrastructure intelligence: crowd telemetry, validation, and explainable grid risk signals.",
  authors: [{ name: "Koglesh R. Murugan" }],
  creator: "Koglesh R. Murugan",
  applicationName: "GRIDPULSE",
  keywords: [
    "GRIDPULSE",
    "grid telemetry",
    "infrastructure intelligence",
    "outage validation",
    "power grid monitoring",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: "GRIDPULSE // Global Grid Telemetry",
    description:
      "Evidence-first infrastructure intelligence for observing, validating, and explaining grid disruption signals.",
    type: "website",
    siteName: "GRIDPULSE",
  },
  twitter: {
    card: "summary_large_image",
    title: "GRIDPULSE // Global Grid Telemetry",
    description:
      "Evidence-first infrastructure intelligence for observing, validating, and explaining grid disruption signals.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Link
          href="/judge"
          aria-label="Open the GRIDPULSE judge brief"
          style={{
            position: "fixed",
            right: "14px",
            bottom: "14px",
            zIndex: 50,
            border: "1px solid rgba(104,167,255,.45)",
            background: "rgba(8,9,11,.92)",
            color: "#68a7ff",
            padding: "8px 10px",
            textDecoration: "none",
            fontSize: "9px",
            fontWeight: 900,
            letterSpacing: ".08em",
            backdropFilter: "blur(12px)",
          }}
        >
          JUDGE BRIEF ↗
        </Link>
      </body>
    </html>
  );
}
