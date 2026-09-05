import Dashboard from "@/components/dashboard";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Summary = { reports: number; validated: number; pending: number; regions: number; last_report: string | null; active_regions: number };
type EventRow = { id: string; latitude: number; longitude: number; status: string; source: string; region_name: string; observed_at: string; confidence: number; validation_status: string };
type RegionRow = { id: string; name: string; center_lat: number; center_lon: number; reports: number; validated: number; latest_report: string | null };

const emptySummary: Summary = { reports: 0, validated: 0, pending: 0, regions: 0, last_report: null, active_regions: 0 };

async function getInitialData() {
  try {
    const [summaryResult, eventsResult, regionsResult] = await Promise.all([
      query<Summary>("SELECT * FROM gridpulse.dashboard_summary()"),
      query<EventRow>("SELECT * FROM gridpulse.dashboard_events($1)", [150]),
      query<RegionRow>("SELECT * FROM gridpulse.dashboard_regions()"),
    ]);
    return { ok: true, generatedAt: new Date().toISOString(), summary: summaryResult.rows[0] ?? emptySummary, events: eventsResult.rows, regions: regionsResult.rows };
  } catch (error) {
    console.error("GRIDPULSE initial dashboard load failed", error);
    return { ok: false, generatedAt: new Date().toISOString(), summary: emptySummary, events: [], regions: [] };
  }
}

export default async function Home() {
  const initial = await getInitialData();
  return <Dashboard initial={initial} />;
}
