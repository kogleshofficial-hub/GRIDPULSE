import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Summary = {
  reports: number;
  validated: number;
  pending: number;
  regions: number;
  last_report: string | null;
  active_regions: number;
};

type EventRow = {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
  source: string;
  region_name: string;
  observed_at: string;
  confidence: number;
  validation_status: string;
};

type RegionRow = {
  id: string;
  name: string;
  center_lat: number;
  center_lon: number;
  reports: number;
  validated: number;
  latest_report: string | null;
};

export async function GET() {
  try {
    const [summaryResult, eventsResult, regionsResult] = await Promise.all([
      query<Summary>("SELECT * FROM gridpulse.dashboard_summary()"),
      query<EventRow>("SELECT * FROM gridpulse.dashboard_events($1)", [150]),
      query<RegionRow>("SELECT * FROM gridpulse.dashboard_regions()"),
    ]);

    const summary = summaryResult.rows[0] ?? {
      reports: 0,
      validated: 0,
      pending: 0,
      regions: 0,
      last_report: null,
      active_regions: 0,
    };

    return NextResponse.json(
      {
        ok: true,
        generatedAt: new Date().toISOString(),
        summary,
        events: eventsResult.rows,
        regions: regionsResult.rows,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("GRIDPULSE dashboard query failed", error);
    return NextResponse.json(
      { ok: false, error: "dashboard_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
