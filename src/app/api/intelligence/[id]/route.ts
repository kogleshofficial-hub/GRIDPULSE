import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { explainWithFoundry, scoreWithAzureML, type IntelligenceFeatures } from "@/lib/intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EventEvidence = {
  id: string;
  region_name: string;
  status: string;
  observed_at: string;
  nearby_reports: number;
  independent_reporters: number;
  corroboration_confidence: number;
  report_rate: number;
  spatial_density: number;
  outage_restoration_ratio: number;
  regional_spread_per_minute: number;
  minutes_since_first_report: number;
  historical_baseline_ratio: number;
};

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "invalid_event_id" }, { status: 400 });

  try {
    const result = await query<EventEvidence>("SELECT * FROM gridpulse.intelligence_event($1)", [id]);
    const event = result.rows[0];
    if (!event) return NextResponse.json({ error: "event_not_found" }, { status: 404 });

    const features: IntelligenceFeatures = {
      reportRate: Number(event.report_rate),
      independentReporters: Number(event.independent_reporters),
      spatialDensity: Number(event.spatial_density),
      outageRestorationRatio: Number(event.outage_restoration_ratio),
      regionalSpreadPerMinute: Number(event.regional_spread_per_minute),
      minutesSinceFirstReport: Number(event.minutes_since_first_report),
      corroborationConfidence: Number(event.corroboration_confidence),
      historicalBaselineRatio: Number(event.historical_baseline_ratio),
    };

    const prediction = await scoreWithAzureML(features);
    const explanation = await explainWithFoundry({ region: event.region_name, status: event.status, features, prediction });

    await query(
      "INSERT INTO gridpulse.ai_predictions(region_id,model_version,horizon_minutes,risk_score,collapse_velocity,confidence,explanation) SELECT region_id,$2,$3,$4,$5,$6,$7 FROM gridpulse.telemetry_reports WHERE id=$1",
      [id, prediction.modelVersion, prediction.horizonMinutes, prediction.riskScore, prediction.collapseVelocity, prediction.confidence, explanation],
    );

    return NextResponse.json({ ok: true, eventId: id, prediction, explanation, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("GRIDPULSE intelligence analysis failed", error);
    return NextResponse.json({ error: "intelligence_unavailable" }, { status: 503 });
  }
}
