import { NextResponse } from "next/server";
import { demoTelemetry } from "@/lib/demo";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    mode: "deterministic-demo",
    generatedAt: new Date().toISOString(),
    telemetry: demoTelemetry(),
  });
}
