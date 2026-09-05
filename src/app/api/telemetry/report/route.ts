import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  reportedAt: z.string().datetime({ offset: true }),
  status: z.enum(["outage", "restored", "degraded", "unknown"]),
  source: z.enum(["crowd", "operator", "sensor"]),
  region: z.string().trim().max(120).optional(),
  externalId: z.string().trim().min(1).max(200).optional(),
});

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
    "unknown"
  )
    .trim()
    .slice(0, 128);
}

async function fingerprint(ip: string) {
  const salt = process.env.REPORTER_HASH_SALT;
  if (!salt) throw new Error("REPORTER_HASH_SALT is required");

  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${salt}:${ip}`),
  );

  return Array.from(new Uint8Array(bytes))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

function databaseErrorResponse(error: unknown) {
  const code = (error as { code?: string }).code;

  if (code === "P0001") {
    return NextResponse.json(
      { error: "rate_limit_exceeded" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  if (error instanceof Error && error.message === "DATABASE_URL is required") {
    return NextResponse.json(
      { error: "database_not_configured" },
      { status: 503 },
    );
  }

  if (error instanceof Error && error.message === "REPORTER_HASH_SALT is required") {
    return NextResponse.json(
      { error: "telemetry_security_not_configured" },
      { status: 503 },
    );
  }

  if (code === "42P01" || code === "42883") {
    return NextResponse.json(
      { error: "telemetry_database_schema_missing" },
      { status: 503 },
    );
  }

  if (code === "42501") {
    return NextResponse.json(
      { error: "telemetry_database_permission_denied" },
      { status: 503 },
    );
  }

  if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT") {
    return NextResponse.json(
      { error: "telemetry_database_unavailable" },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { error: "telemetry_ingest_failed" },
    { status: 500 },
  );
}

export async function POST(req: NextRequest) {
  if (
    req.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  ) {
    return NextResponse.json(
      { error: "application/json required" },
      { status: 415 },
    );
  }

  const raw = await req.text();
  if (raw.length > 16384) {
    return NextResponse.json({ error: "payload too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const t = new Date(d.reportedAt).getTime();
  if (t > Date.now() + 300000 || t < Date.now() - 604800000) {
    return NextResponse.json(
      { error: "reportedAt outside accepted window" },
      { status: 422 },
    );
  }

  try {
    const hash = await fingerprint(clientIp(req));
    const region = d.region?.trim() || "Auto-detected";

    const result = await query<{
      report_id: string;
      validation_status: string;
    }>(
      "SELECT * FROM gridpulse.ingest_report($1,$2,$3,$4,$5,$6,$7,$8)",
      [
        d.latitude,
        d.longitude,
        new Date(d.reportedAt),
        d.status,
        d.source,
        region,
        d.externalId ?? null,
        hash,
      ],
    );

    const report = result.rows[0];
    if (!report) {
      console.error("GRIDPULSE telemetry ingest returned no report row");
      return NextResponse.json(
        { error: "telemetry_ingest_empty" },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { accepted: true, report },
      { status: 201 },
    );
  } catch (error) {
    console.error("GRIDPULSE telemetry ingest failed", {
      error,
      code: (error as { code?: string }).code,
    });
    return databaseErrorResponse(error);
  }
}
