import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { explainWithFoundry, scoreWithAzureML, type IntelligenceFeatures } from "@/lib/intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EVENT_ID = /^[0-9a-f-]{36}$/i;
const MAX_EXPLANATION_LENGTH = 4000;

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

function bounded(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!EVENT_ID.test(id)) return NextResponse.json({ error: "invalid_event_id" }, { status: 400 });

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

    if (Object.values(features).some((value) => !Number.isFinite(value))) {
      return NextResponse.json({ error: "invalid_event_features" }, { status: 422 });
    }

    const prediction = await scoreWithAzureML(features);
    const safePrediction = {
      ...prediction,
      riskScore: bounded(Number(prediction.riskScore)),
      confidence: bounded(Number(prediction.confidence)),
      collapseVelocity: Number.isFinite(Number(prediction.collapseVelocity)) ? Number(prediction.collapseVelocity) : 0,
      horizonMinutes: Number.isFinite(Number(prediction.horizonMinutes)) ? Math.max(1, Math.round(Number(prediction.horizonMinutes))) : 30,
    };

    const explanation = (await explainWithFoundry({ region: event.region_name, status: event.status, features, prediction: safePrediction })).trim();
    if (!explanation) return NextResponse.json({ error: "intelligence_explanation_empty" }, { status: 503 });
    const safeExplanation = explanation.slice(0, MAX_EXPLANATION_LENGTH);

    const stored = await query<{ store_prediction: string }>(
      "SELECT gridpulse.store_prediction($1,$2,$3,$4,$5,$6,$7) AS store_prediction",
      [id, safePrediction.modelVersion, safePrediction.horizonMinutes, safePrediction.riskScore, safePrediction.collapseVelocity, safePrediction.confidence, safeExplanation],
    );

    return NextResponse.json({
      ok: true,
      eventId: id,
      prediction: safePrediction,
      explanation: safeExplanation,
      predictionId: stored.rows[0]?.store_prediction ?? null,
      generatedAt: new Date().toISOString(),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GRIDPULSE intelligence analysis failed", error);
    return NextResponse.json({ error: "intelligence_unavailable" }, { status: 503 });
  }
}
