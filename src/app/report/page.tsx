"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const initialForm = { region: "", latitude: "", longitude: "", status: "outage" };

type ReportState = "idle" | "locating" | "sending" | "success" | "error";

function messageForError(error: unknown) {
  const value = error instanceof Error ? error.message : "Unable to submit report.";
  const normalized = value.replaceAll("_", " ");
  if (normalized.includes("rate limit")) return "Too many reports were submitted recently. Please wait a moment and try again.";
  if (normalized.includes("validation failed")) return "Please check the region and coordinates, then try again.";
  if (normalized.includes("outside accepted window")) return "The observation timestamp is outside the accepted reporting window.";
  if (normalized.includes("permission")) return "Location permission was blocked. Allow location access in your browser, then try again.";
  if (normalized.includes("unavailable")) return "Your device could not provide a location right now. You can enter coordinates manually.";
  if (normalized.includes("timeout")) return "Location lookup took too long. Try again or enter coordinates manually.";
  if (normalized.includes("not supported")) return "This browser does not support location lookup. You can enter coordinates manually.";
  return normalized;
}

export default function ReportPage() {
  const [state, setState] = useState<ReportState>("idle");
  const [message, setMessage] = useState("");
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [formValues, setFormValues] = useState(initialForm);

  function updateField(field: keyof typeof initialForm, value: string) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function useMyLocation() {
    if (state === "locating" || state === "sending") return;
    setMessage("");
    setState("locating");

    if (!("geolocation" in navigator)) {
      setState("error");
      setMessage("Location is not supported by this browser. You can enter coordinates manually.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setFormValues((current) => ({
          ...current,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          region: current.region || "Auto-detected",
        }));
        setLocationAccuracy(Math.round(accuracy));
        setState("idle");
        setMessage(`Location found. Accuracy about ${Math.round(accuracy)} m. Review it before submitting.`);
      },
      (error) => {
        setState("error");
        if (error.code === 1) setMessage("Location permission was blocked. Allow location access in your browser, then try again.");
        else if (error.code === 2) setMessage("Your device could not provide a location right now. You can enter coordinates manually.");
        else if (error.code === 3) setMessage("Location lookup took too long. Try again or enter coordinates manually.");
        else setMessage("Unable to retrieve your location. You can enter coordinates manually.");
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 },
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending" || state === "locating") return;
    setState("sending");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const region = String(formData.get("region") ?? "").trim() || "Auto-detected";
    const latitude = Number(formData.get("latitude"));
    const longitude = Number(formData.get("longitude"));
    const status = String(formData.get("status"));

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setState("error");
      setMessage("Please use your location button or enter a valid latitude and longitude.");
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
      setLocationAccuracy(null);
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
          <div id="report-help" className="form-hint">Use your current location to fill the coordinates automatically. You can review or edit them before submitting.</div>
          <button className="ghost-button" type="button" onClick={useMyLocation} disabled={state === "locating" || state === "sending"} aria-busy={state === "locating"}>
            {state === "locating" ? "LOCATING…" : "USE MY LOCATION"}
          </button>
          {locationAccuracy !== null && <div className="form-hint" role="status">DEVICE LOCATION READY · ±{locationAccuracy} M</div>}
          <label>
            REGION <span aria-hidden="true">OPTIONAL</span>
            <input name="region" value={formValues.region} onChange={(event) => updateField("region", event.target.value)} maxLength={120} autoComplete="address-level2" placeholder="e.g. Kuching · or leave blank" />
          </label>
          <div className="two-fields">
            <label>
              LATITUDE
              <input name="latitude" value={formValues.latitude} onChange={(event) => updateField("latitude", event.target.value)} type="number" inputMode="decimal" step="any" min="-90" max="90" required placeholder="Use my location" />
            </label>
            <label>
              LONGITUDE
              <input name="longitude" value={formValues.longitude} onChange={(event) => updateField("longitude", event.target.value)} type="number" inputMode="decimal" step="any" min="-180" max="180" required placeholder="Use my location" />
            </label>
          </div>
          <label>
            OBSERVATION STATUS
            <select name="status" value={formValues.status} onChange={(event) => updateField("status", event.target.value)}>
              <option value="outage">Outage</option>
              <option value="degraded">Degraded</option>
              <option value="restored">Restored</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
          <button className="submit-report" type="submit" disabled={state === "sending" || state === "locating"} aria-busy={state === "sending"}>
            {state === "sending" ? "INGESTING…" : "SUBMIT OBSERVATION"}
          </button>
          {message && <div className={`form-message ${state === "success" ? "success" : "error"}`} role={state === "error" ? "alert" : "status"} aria-live="polite">{message}</div>}
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
