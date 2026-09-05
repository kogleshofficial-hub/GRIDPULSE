export default function Loading() {
  return (
    <div className="shell" aria-busy="true" aria-live="polite">
      <header className="top">
        <div className="brand-wrap">
          <div className="brand">GRIDPULSE</div>
          <div className="brand-sub">GLOBAL GRID INTELLIGENCE</div>
        </div>
        <div className="system-state">
          <span className="pulse-dot" aria-hidden="true" />
          INITIALIZING CONTROL PLANE
        </div>
      </header>
      <main className="main">
        <section className="hero-row">
          <div>
            <div className="eyebrow">INFRASTRUCTURE OBSERVABILITY / INITIALIZING</div>
            <h1>Loading the observation field.</h1>
            <p className="hero-copy">
              Connecting telemetry, validation, regional coverage, and intelligence services.
            </p>
          </div>
        </section>
        <section className="grid metrics" aria-label="Loading metrics">
          {["TELEMETRY REPORTS", "VALIDATED EVENTS", "PENDING SIGNALS", "ACTIVE REGIONS"].map(
            (label) => (
              <article className="panel metric-card" key={label}>
                <div className="label">{label}</div>
                <div className="value">—</div>
                <div className="metric-note">syncing live data…</div>
              </article>
            ),
          )}
        </section>
        <section className="panel map-panel" style={{ minHeight: 500 }}>
          <div className="panel-heading">
            <div>
              <div className="label">TELEMETRY SURFACE</div>
              <div className="panel-title">GLOBAL OBSERVATION FIELD</div>
            </div>
          </div>
          <div className="map-empty">
            <span>ESTABLISHING TELEMETRY LINK</span>
            <small>Preparing the evidence-first control plane.</small>
          </div>
        </section>
      </main>
    </div>
  );
}
