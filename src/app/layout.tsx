import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
