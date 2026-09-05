import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const siteUrl = "https://gridpulse-three.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GRIDPULSE — Evidence-First Grid Intelligence",
    template: "%s · GRIDPULSE",
  },
  description:
    "GRIDPULSE is an evidence-first infrastructure intelligence control plane for observing, validating, predicting, and explaining grid disruption signals.",
  applicationName: "GRIDPULSE",
  authors: [{ name: "Koglesh R. Murugan" }],
  creator: "Koglesh R. Murugan",
  publisher: "Koglesh R. Murugan",
  keywords: [
    "GRIDPULSE",
    "grid intelligence",
    "grid telemetry",
    "infrastructure intelligence",
    "outage validation",
    "power grid monitoring",
    "anomaly detection",
    "Azure Machine Learning",
    "Microsoft Foundry",
    "infrastructure resilience",
  ],
  category: "technology",
  alternates: { canonical: "/" },
  verification: {
    google: "LI6z3Avdq6RsVP2faZ6nlhcbRwvnMIdjJkrSBygvnZM",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "GRIDPULSE — Evidence-First Grid Intelligence",
    description:
      "Observe. Validate. Predict. Explain. An evidence-first control plane for grid disruption signals.",
    url: siteUrl,
    siteName: "GRIDPULSE",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GRIDPULSE — Evidence-First Grid Intelligence",
    description:
      "An evidence-first control plane for observing, validating, predicting, and explaining grid disruption signals.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "GRIDPULSE",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: siteUrl,
      description:
        "Evidence-first infrastructure intelligence for observing, validating, predicting, and explaining grid disruption signals.",
      author: { "@type": "Person", name: "Koglesh R. Murugan" },
      isAccessibleForFree: true,
    },
    {
      "@type": "WebSite",
      name: "GRIDPULSE",
      url: siteUrl,
      description: "Evidence-first grid intelligence control plane.",
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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
