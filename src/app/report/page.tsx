"use client";

import { FormEvent, useState } from "react";

export default function ReportPage() {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = {
      latitude: Number(form.get("latitude")),
      longitude: Number(form.get("longitude")),
      reportedAt: new Date().toISOString(),
      status: String(form.get("status")),
      source: "crowd",
      region: String(form.get("region")),
      externalId: `web-${crypto.randomUUID()}`,
    };

    try {
      const response = await fetch("/api/telemetry/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { accepted?: boolean; error?: string; report?: { validation_status?: string } | null };
      if (!response.ok) throw new Error(result.error ?? "report_failed");
      setState("success");
      setMessage(`Report accepted. Validation state: ${result.report?.validation_status ?? "pending"}.`);
      event.currentTarget.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message.replaceAll("_", " ") : "Unable to submit report.");
    }
  }

  return (
    <main className="report-page">
      <div className="report-shell">
        <a className="back-link" href="/">← BACK TO CONTROL</a>
        <div className="eyebrow">GRIDPULSE / HUMAN TELEMETRY INPUT</div>
        <h1>Report a grid event.</h1>
        <p className="report-intro">A report is an observation, not a verdict. GRIDPULSE combines it with independent evidence before marking an event as validated.</p>

        <form className="report-form" onSubmit={submit}>
          <label>REGION<input name="region" required maxLength={120} placeholder="e.g. Kuching" /></label>
          <div className="two-fields">
            <label>LATITUDE<input name="latitude" type="number" step="any" min="-90" max="90" required placeholder="1.5533" /></label>
            <label>LONGITUDE<input name="longitude" type="number" step="any" min="-180" max="180" required placeholder="110.3592" /></label>
          </div>
          <label>OBSERVATION STATUS<select name="status" defaultValue="outage"><option value="outage">Outage</option><option value="degraded">Degraded</option><option value="restored">Restored</option><option value="unknown">Unknown</option></select></label>
          <button className="submit-report" type="submit" disabled={state === "sending"}>{state === "sending" ? "INGESTING…" : "SUBMIT OBSERVATION"}</button>
          {message && <div className={`form-message ${state}`}>{message}</div>}
        </form>

        <div className="report-principles"><div><strong>01</strong><span>VALIDATE</span><small>Nearby and independent observations are scored by the database validation layer.</small></div><div><strong>02</strong><span>SEPARATE</span><small>Observed facts stay distinct from future AI predictions.</small></div><div><strong>03</strong><span>EXPLAIN</span><small>AI will explain evidence-backed results rather than inventing incidents.</small></div></div>
      </div>
    </main>
  );
}
