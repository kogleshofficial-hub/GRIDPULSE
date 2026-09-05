"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const initialForm = { region: "", latitude: "", longitude: "", status: "outage" };

type ReportState = "idle" | "sending" | "success" | "error";

function messageForError(error: unknown) {
  const value = error instanceof Error ? error.message : "Unable to submit report.";
  const normalized = value.replaceAll("_", " ");
  if (normalized.includes("rate limit")) return "Too many reports were submitted recently. Please wait a moment and try again.";
  if (normalized.includes("validation failed")) return "Please check the region and coordinates, then try again.";
  if (normalized.includes("outside accepted window")) return "The observation timestamp is outside the accepted reporting window.";
  return normalized;
}

export default function ReportPage() {
  const [state, setState] = useState<ReportState>("idle");
  const [message, setMessage] = useState("");
  const [formValues, setFormValues] = useState(initialForm);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const region = String(form.get("region") ?? "").trim();
    const latitude = Number(form.get("latitude"));
    const longitude = Number(form.get("longitude"));
    const status = String(form.get("status"));

    if (!region || !Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setState("error");
      setMessage("Please enter a valid region, latitude, and longitude.");
      return;
    }

    const payload = {
      latitude,
      longitude,
      reportedAt: new Date().toISOString(),
      status,
      source: "crowd",
      region,
      externalId: `web-${crypto.randomUUID()}`,
    };

    try {
      const response = await fetch("/api/telemetry/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        accepted?: boolean;
        error?: string;
        report?: { validation_status?: string } | null;
      };

      if (!response.ok) throw new Error(result.error ?? "report_failed");

      setState("success");
      setMessage(`Observation accepted. Validation state: ${result.report?.validation_status ?? "pending"}.`);
      setFormValues(initialForm);
      event.currentTarget.reset();
    } catch (error) {
      setState("error");
      setMessage(messageForError(error));
    }
  }

  return (
    <main className="report-page">
      <div className="report-shell">
        <Link className="back-link" href="/">← BACK TO CONTROL</Link>
        <div className="eyebrow">GRIDPULSE / HUMAN TELEMETRY INPUT</div>
        <h1>Report a grid event.</h1>
        <p className="report-intro">
          A report is an observation, not a verdict. GRIDPULSE combines it with independent evidence before marking an event as validated.
        </p>

        <form className="report-form" onSubmit={submit} aria-describedby="report-help">
          <div id="report-help" className="form-hint">Use the location where the disruption was observed. Coordinates are checked before ingestion.</div>
          <label>
            REGION
            <input name="region" value={formValues.region} onChange={(event) => setFormValues((current) => ({ ...current, region: event.target.value }))} required maxLength={120} autoComplete="address-level2" placeholder="e.g. Kuching" />
          </label>
          <div className="two-fields">
            <label>
              LATITUDE
              <input name="latitude" value={formValues.latitude} onChange={(event) => setFormValues((current) => ({ ...current, latitude: event.target.value }))} type="number" inputMode="decimal" step="any" min="-90" max="90" required placeholder="1.5533" />
            </label>
            <label>
              LONGITUDE
              <input name="longitude" value={formValues.longitude} onChange={(event) => setFormValues((current) => ({ ...current, longitude: event.target.value }))} type="number" inputMode="decimal" step="any" min="-180" max="180" required placeholder="110.3592" />
            </label>
          </div>
          <label>
            OBSERVATION STATUS
            <select name="status" value={formValues.status} onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value }))}>
              <option value="outage">Outage</option>
              <option value="degraded">Degraded</option>
              <option value="restored">Restored</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
          <button className="submit-report" type="submit" disabled={state === "sending"} aria-busy={state === "sending"}>
            {state === "sending" ? "INGESTING…" : "SUBMIT OBSERVATION"}
          </button>
          {message && <div className={`form-message ${state}`} role={state === "error" ? "alert" : "status"} aria-live="polite">{message}</div>}
        </form>

        <div className="report-principles">
          <div><strong>01</strong><span>VALIDATE</span><small>Nearby and independent observations are scored by the database validation layer.</small></div>
          <div><strong>02</strong><span>SEPARATE</span><small>Observed facts stay distinct from future AI predictions.</small></div>
          <div><strong>03</strong><span>EXPLAIN</span><small>AI explains evidence-backed results rather than inventing incidents.</small></div>
        </div>
      </div>
    </main>
  );
}
