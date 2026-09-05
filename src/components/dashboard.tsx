"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Summary = { reports: number; validated: number; pending: number; regions: number; last_report: string | null; active_regions: number };
type EventRow = { id: string; latitude: number; longitude: number; status: string; source: string; region_name: string; observed_at: string; confidence: number; validation_status: string };
type RegionRow = { id: string; name: string; center_lat: number; center_lon: number; reports: number; validated: number; latest_report: string | null };
type DashboardPayload = { ok: boolean; generatedAt: string; summary: Summary; events: EventRow[]; regions: RegionRow[] };
type IntelligenceResponse = { ok: boolean; eventId: string; explanation: string; generatedAt: string; prediction: { riskScore: number; confidence: number; collapseVelocity: number; modelVersion: string; horizonMinutes: number } };

const EMPTY: DashboardPayload = { ok: true, generatedAt: new Date(0).toISOString(), summary: { reports: 0, validated: 0, pending: 0, regions: 0, last_report: null, active_regions: 0 }, events: [], regions: [] };

function project(lat: number, lon: number) { return { x: Math.max(2, Math.min(98, ((lon + 180) / 360) * 100)), y: Math.max(5, Math.min(95, ((90 - lat) / 180) * 100)) }; }
function formatTime(value: string | null) { if (!value) return "—"; return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "medium", timeZone: "UTC" }).format(new Date(value)) + " UTC"; }
function statusLabel(value: string) { return value.replace(/^./, (c) => c.toUpperCase()); }

export default function Dashboard({ initial }: { initial: DashboardPayload }) {
  const [data, setData] = useState<DashboardPayload>(initial ?? EMPTY);
  const [selected, setSelected] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [intelligence, setIntelligence] = useState<IntelligenceResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiError, setAiError] = useState("");

  const selectEvent = (event: EventRow) => { setSelected(event); setIntelligence(null); setAiError(""); };
  const refresh = useCallback(async () => { setLoading(true); try { const response = await fetch("/api/dashboard", { cache: "no-store" }); if (!response.ok) throw new Error("dashboard unavailable"); const next = (await response.json()) as DashboardPayload; setData(next); setOffline(false); } catch { setOffline(true); } finally { setLoading(false); } }, []);
  const analyze = useCallback(async () => {
    if (!selected) return;
    setAnalyzing(true); setAiError("");
    try {
      const response = await fetch(`/api/intelligence/${selected.id}`, { method: "POST" });
      const body = await response.json() as IntelligenceResponse & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "intelligence_unavailable");
      setIntelligence(body);
    } catch (error) {
      setAiError(error instanceof Error ? error.message.replaceAll("_", " ") : "AI analysis unavailable");
    } finally { setAnalyzing(false); }
  }, [selected]);

  useEffect(() => { const timer = window.setInterval(refresh, 15000); return () => window.clearInterval(timer); }, [refresh]);

  const validatedRate = data.summary.reports ? Math.round((data.summary.validated / data.summary.reports) * 100) : 0;
  const outageCount = useMemo(() => data.events.filter((event) => event.status === "outage").length, [data.events]);

  return <div className="shell">
    <header className="top"><div className="brand-wrap"><div className="brand">GRIDPULSE</div><div className="brand-sub">GLOBAL GRID INTELLIGENCE</div></div><div className={offline ? "system-state warn" : "system-state"}><span className="pulse-dot" aria-hidden="true" /> {offline ? "DEGRADED CONNECTION" : "SYSTEM OPERATIONAL"}</div></header>
    <main className="main">
      <section className="hero-row"><div><div className="eyebrow">INFRASTRUCTURE OBSERVABILITY / LIVE CONTROL PLANE</div><h1>See disruption before it becomes a blind spot.</h1><p className="hero-copy">GRIDPULSE correlates distributed telemetry, validates independent observations, and prepares the evidence layer for AI-powered grid intelligence.</p></div><a className="report-button" href="/report">+ REPORT EVENT</a></section>
      <section className="grid metrics" aria-label="Gridpulse metrics"><article className="panel metric-card"><div className="label">TELEMETRY REPORTS</div><div className="value">{data.summary.reports.toLocaleString()}</div><div className="metric-note">all ingested observations</div></article><article className="panel metric-card"><div className="label">VALIDATED EVENTS</div><div className="value ok">{data.summary.validated.toLocaleString()}</div><div className="metric-note">{validatedRate}% of reports corroborated</div></article><article className="panel metric-card"><div className="label">PENDING SIGNALS</div><div className="value warn">{data.summary.pending.toLocaleString()}</div><div className="metric-note">awaiting corroboration</div></article><article className="panel metric-card"><div className="label">ACTIVE REGIONS</div><div className="value">{data.summary.active_regions.toLocaleString()}</div><div className="metric-note">regions reporting in 24h</div></article></section>
      <section className="control-grid"><article className="panel map-panel"><div className="panel-heading"><div><div className="label">TELEMETRY SURFACE</div><div className="panel-title">GLOBAL OBSERVATION FIELD</div></div><div className="live-chip"><span className="pulse-dot" /> AUTO-REFRESH 15S</div></div><div className="map" role="img" aria-label="Global telemetry map. Select a telemetry point to inspect its validation state."><div className="map-grid" aria-hidden="true" /><div className="equator" aria-hidden="true" />{data.events.map((event) => { const point = project(event.latitude, event.longitude); return <button key={event.id} className={`node node-${event.status} ${selected?.id === event.id ? "node-selected" : ""}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} onClick={() => selectEvent(event)} aria-label={`${statusLabel(event.status)} report in ${event.region_name}, ${Math.round(Number(event.confidence) * 100)} percent confidence`} />; })}{data.events.length === 0 && <div className="map-empty"><span>NO TELEMETRY IN CURRENT DATASET</span><small>Connect PostgreSQL and ingest a report to activate the surface.</small></div>}<div className="map-legend"><span><i className="legend-dot outage" /> OUTAGE</span><span><i className="legend-dot degraded" /> DEGRADED</span><span><i className="legend-dot restored" /> RESTORED</span></div></div></article>
        <aside className="panel incident-panel" aria-live="polite"><div className="label">SELECTED SIGNAL</div>{selected ? <><div className="incident-status"><span className={`status-badge ${selected.status}`}>{statusLabel(selected.status)}</span><span className="confidence">{Math.round(Number(selected.confidence) * 100)}% CONFIDENCE</span></div><h2>{selected.region_name}</h2><div className="coordinate">{selected.latitude.toFixed(4)}°, {selected.longitude.toFixed(4)}°</div><dl className="evidence-list"><div><dt>VALIDATION</dt><dd>{statusLabel(selected.validation_status)}</dd></div><div><dt>SOURCE</dt><dd>{statusLabel(selected.source)}</dd></div><div><dt>OBSERVED</dt><dd>{formatTime(selected.observed_at)}</dd></div></dl><div className="truth-box"><span className="label">TRUTH BOUNDARY</span><p>AI never converts a prediction into a confirmed outage. Confirmation comes from the telemetry validation layer.</p></div><button className="ai-button" onClick={analyze} disabled={analyzing}>{analyzing ? "RUNNING INTELLIGENCE…" : "RUN AI ANALYSIS"}</button>{aiError && <div className="form-message error">{aiError}</div>}{intelligence && <div className="ai-result"><div className="ai-result-head"><span className="ai-mark small">AI</span><div><div className="label">MODEL OUTPUT</div><strong>{Math.round(intelligence.prediction.riskScore * 100)}% RISK / {intelligence.prediction.horizonMinutes} MIN</strong></div></div><p>{intelligence.explanation}</p><small>{intelligence.prediction.modelVersion} · {Math.round(intelligence.prediction.confidence * 100)}% model confidence · generated {formatTime(intelligence.generatedAt)}</small></div>}</> : <div className="empty-detail"><div className="empty-icon">◎</div><strong>Select a telemetry point</strong><p>Inspect location, source, confidence, and validation evidence without leaving the control plane.</p></div>}</aside></section>
      <section className="lower-grid"><article className="panel"><div className="panel-heading"><div><div className="label">EVENT STREAM</div><div className="panel-title">LATEST OBSERVATIONS</div></div><button className="ghost-button" onClick={refresh} disabled={loading}>{loading ? "SYNCING…" : "SYNC NOW"}</button></div>{data.events.length ? <div className="event-list">{data.events.slice(0, 8).map((event) => <button className="event-row" key={event.id} onClick={() => selectEvent(event)}><span className={`event-marker ${event.status}`} aria-hidden="true" /><span className="event-main"><strong>{event.region_name}</strong><small>{statusLabel(event.source)} · {formatTime(event.observed_at)}</small></span><span className={`event-state ${event.validation_status}`}>{Math.round(Number(event.confidence) * 100)}%</span></button>)}</div> : <div className="table-empty">No observations have been ingested yet.</div>}</article><article className="panel"><div className="label">REGIONAL COVERAGE</div><div className="panel-title coverage-title">OBSERVATION CLUSTERS</div>{data.regions.length ? <div className="region-list">{data.regions.slice(0, 6).map((region) => <div className="region-row" key={region.id}><div><strong>{region.name}</strong><small>{region.reports.toLocaleString()} reports · {region.validated.toLocaleString()} validated</small></div><span>{region.reports ? Math.round((region.validated / region.reports) * 100) : 0}%</span></div>)}</div> : <div className="table-empty">No active region clusters configured.</div>}</article></section>
      <section className="intelligence-strip"><div><span className="ai-mark">AI</span><div><div className="label">INTELLIGENCE LAYER</div><strong>AZURE ML + MICROSOFT FOUNDRY</strong></div></div><p>Predictions remain separate from confirmed events. The ML endpoint scores structured telemetry features; Foundry explains the resulting evidence without inventing facts.</p></section>
      <section className="network-status panel"><div className="label">SYSTEM CONTRACT</div><div className="contract-grid"><div><span>INGESTION</span><strong>POST /api/telemetry/report</strong><b className="ok">READY</b></div><div><span>VALIDATION</span><strong>POSTGRESQL CORROBORATION</strong><b className="ok">READY</b></div><div><span>INTELLIGENCE</span><strong>AZURE ML + FOUNDRY</strong><b className="warn">CONFIGURED VIA ENV</b></div><div><span>LAST OBSERVED</span><strong>{formatTime(data.summary.last_report)}</strong><b className={data.summary.last_report ? "ok" : "warn"}>{data.summary.last_report ? "INGESTED" : "NO DATA"}</b></div></div></section>
    </main><footer className="footer"><span>GRIDPULSE // EVIDENCE-FIRST INFRASTRUCTURE INTELLIGENCE</span><span>CREATED &amp; BUILT BY KOGLESH R. MURUGAN</span><span>DATA STATUS: {outageCount ? `${outageCount} OUTAGE SIGNALS` : "NO ACTIVE OUTAGE SIGNALS"}</span></footer>
  </div>;
}
