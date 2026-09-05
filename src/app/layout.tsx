import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GRIDPULSE // Global Grid Telemetry",
  description: "Crowd-sourced power-grid outage telemetry and validation."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}