import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SummaryRow = {
  reports: number | string;
  validated: number | string;
  pending: number | string;
  regions: number | string;
  last_report: string | Date | null;
  active_regions: number | string;
};
type EventRow = {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
  source: string;
  region_name: string;
  observed_at: string | Date;
  confidence: number | string;
  validation_status: string;
};
type RegionRow = {
  id: string;
  name: string;
  center_lat: number;
  center_lon: number;
  reports: number | string;
  validated: number | string;
  latest_report: string | Date | null;
};

const integer = (value: number | string) => Number(value ?? 0);
const iso = (value: string | Date | null) =>
  value ? new Date(value).toISOString() : null;

export async function GET() {
  try {
    const [summaryResult, eventsResult, regionsResult] = await Promise.all([
      query<SummaryRow>("SELECT * FROM gridpulse.dashboard_summary()"),
      query<EventRow>("SELECT * FROM gridpulse.dashboard_events($1)", [150]),
      query<RegionRow>("SELECT * FROM gridpulse.dashboard_regions()"),
    ]);

    const row = summaryResult.rows[0];
    const summary = row
      ? {
          reports: integer(row.reports),
          validated: integer(row.validated),
          pending: integer(row.pending),
          regions: integer(row.regions),
          last_report: iso(row.last_report),
          active_regions: integer(row.active_regions),
        }
      : {
          reports: 0,
          validated: 0,
          pending: 0,
          regions: 0,
          last_report: null,
          active_regions: 0,
        };

    const events: EventRow[] = eventsResult.rows;
    const normalizedEvents = events.map((event: EventRow) => ({
      ...event,
      observed_at: iso(event.observed_at)!,
      confidence: Number(event.confidence),
    }));

    const regions = regionsResult.rows.map((region) => ({
      ...region,
      reports: integer(region.reports),
      validated: integer(region.validated),
      latest_report: iso(region.latest_report),
    }));

    return NextResponse.json(
      {
        ok: true,
        generatedAt: new Date().toISOString(),
        summary,
        events: normalizedEvents,
        regions,
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
