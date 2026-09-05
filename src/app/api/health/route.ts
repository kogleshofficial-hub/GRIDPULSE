import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    console.error("[GRIDPULSE] Database health check failed: DATABASE_URL is not configured");
    return NextResponse.json(
      {
        ok: false,
        service: "gridpulse-api",
        database: "unavailable",
        reason: "DATABASE_URL_MISSING",
      },
      { status: 503 },
    );
  }

  try {
    const result = await query<{ ok: number }>("SELECT 1 AS ok");

    return NextResponse.json({
      ok: true,
      service: "gridpulse-api",
      database: "reachable",
      check: result.rows[0]?.ok === 1 ? "passed" : "unexpected-result",
    });
  } catch (error) {
    console.error("[GRIDPULSE] Database health check failed", error);

    return NextResponse.json(
      {
        ok: false,
        service: "gridpulse-api",
        database: "unavailable",
        reason: "DATABASE_CONNECTION_FAILED",
      },
      { status: 503 },
    );
  }
}
