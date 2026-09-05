import Link from "next/link";
import styles from "./judge.module.css";

export const metadata = {
  title: "GRIDPULSE // Judge Brief",
  description: "Judge-facing overview of GRIDPULSE: evidence-first infrastructure intelligence powered by Microsoft AI.",
};

const architecture = [
  ["01", "Human telemetry", "Next.js + PostgreSQL", "Reports enter through a typed ingestion boundary with coordinate, time, status, source, and region validation."],
  ["02", "Evidence validation", "PostgreSQL validation engine", "Independent nearby observations are corroborated before a signal can become a validated event."],
  ["03", "AI risk scoring", "Azure Machine Learning", "Structured telemetry features are scored for operational risk, confidence, and change velocity."],
  ["04", "Grounded explanation", "Azure AI Foundry / Azure OpenAI", "The explanation layer receives structured evidence and prediction output, with an explicit instruction not to invent facts."],
  ["05", "Operator control plane", "GRIDPULSE dashboard", "Humans see the observation, validation state, model output, confidence, and provenance in one surface."],
];

const principles = [
  ["Observed ≠ predicted", "A model score never becomes an outage verdict. Validation remains an evidence-layer decision."],
  ["AI is consequential", "Microsoft AI services are part of the operating workflow, not decorative chatbot features."],
  ["Evidence before explanation", "The explanation model is constrained to supplied structured evidence."],
  ["Human-readable by design", "Confidence, validation, source, timestamps, and coordinates remain visible to the operator."],
  ["Built for iteration", "The architecture exposes measurable signals that can be tested, evaluated, and improved over time."],
  ["Accessible control", "Keyboard-focusable controls, semantic regions, readable status language, and responsive layouts are built into the interface."],
];

export default function JudgePage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <nav className={styles.nav} aria-label="Judge navigation">
          <Link href="/" className={styles.back}>← LIVE CONTROL</Link>
          <span className={styles.navmark}>GRIDPULSE / JUDGE BRIEF</span>
        </nav>

        <header className={styles.hero}>
          <div className={styles.eyebrow}>MICROSOFT AI · INFRASTRUCTURE · EVIDENCE-FIRST SYSTEMS</div>
          <h1>Turn fragmented grid signals into decisions people can trust.</h1>
          <p>GRIDPULSE is an evidence-first infrastructure intelligence platform designed to detect, corroborate, score, and explain power-grid disruption without confusing an AI prediction with a confirmed event.</p>
          <div className={styles.actions}>
            <Link href="/" className={styles.primary}>OPEN LIVE CONTROL</Link>
            <Link href="/report" className={styles.secondary}>SUBMIT A TELEMETRY OBSERVATION</Link>
          </div>
        </header>

        <section className={styles.callout} aria-label="Core proposition">
          <span className={styles.mark}>01</span>
          <div>
            <div className={styles.eyebrow}>THE CORE INSIGHT</div>
            <strong>Prediction is useful only when its boundary is visible.</strong>
            <p>GRIDPULSE separates what the system has observed, what the validation layer has corroborated, and what Microsoft AI predicts next.</p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.kicker}>01 / THE PROBLEM</div>
          <div className={styles.two}>
            <div><h2>Infrastructure disruption creates an information problem before it becomes a response problem.</h2></div>
            <div className={styles.copy}>
              <p>Power-grid incidents can surface through incomplete, delayed, or conflicting signals. A dashboard that simply displays reports can amplify noise; an AI system that confidently guesses can amplify risk.</p>
              <p>GRIDPULSE is built around a different contract: collect observations, corroborate them, expose uncertainty, then use AI to help operators reason about what may happen next.</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.kicker}>02 / THE SYSTEM</div>
          <h2>One evidence pipeline. Two Microsoft AI services. One human-controlled decision surface.</h2>
          <div className={styles.architecture}>
            {architecture.map(([step, name, tech, detail]) => (
              <article className={styles.arch} key={step}>
                <span className={styles.step}>{step}</span>
                <div><strong>{name}</strong><div className={styles.tech}>{tech}</div><p>{detail}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.kicker}>03 / MICROSOFT AI IMPLEMENTATION</div>
          <div className={styles.aiGrid}>
            <article className={styles.aiCard}><div className={styles.service}>AI / 01</div><h3>Azure Machine Learning</h3><p>Scores structured telemetry features for operational risk, model confidence, and collapse velocity over a defined prediction horizon.</p><span>REQUIRED FOR INTELLIGENCE SCORING</span></article>
            <article className={styles.aiCard}><div className={styles.service}>AI / 02</div><h3>Azure AI Foundry / Azure OpenAI</h3><p>Converts structured evidence and model results into a concise operational explanation while explicitly constraining the model to supplied evidence.</p><span>REQUIRED FOR GROUNDED EXPLANATION</span></article>
          </div>
          <div className={styles.proof}><span>WHY TWO AI SERVICES MATTER</span><p>Removing either service breaks a distinct part of the intelligence workflow: without Azure ML there is no model risk score; without the Foundry/Azure OpenAI explanation layer there is no grounded natural-language interpretation for the operator.</p></div>
        </section>

        <section className={styles.section}>
          <div className={styles.kicker}>04 / TRUST, INCLUSION &amp; ACCESSIBILITY</div>
          <div className={styles.principles}>{principles.map(([title, detail]) => <article key={title}><strong>{title}</strong><p>{detail}</p></article>)}</div>
        </section>

        <section className={styles.section}>
          <div className={styles.kicker}>05 / FOUNDER-LED VALIDATION</div>
          <div className={styles.validation}>
            <div><div className={styles.eyebrow}>WHAT WE MEASURE</div><h2>Build → observe → test → improve.</h2></div>
            <div className={styles.validationGrid}>
              <span><b>01</b>Report acceptance</span><span><b>02</b>Independent corroboration</span><span><b>03</b>Validation confidence</span><span><b>04</b>Prediction confidence</span><span><b>05</b>Regional coverage</span><span><b>06</b>Model output quality</span>
            </div>
          </div>
          <p className={styles.note}>GRIDPULSE deliberately does not manufacture customer numbers, impact claims, or validation results. Real-world interviews, pilots, and feedback should become part of the evidence record as they are conducted.</p>
        </section>

        <section className={styles.section}>
          <div className={styles.kicker}>06 / VIABILITY &amp; SCALE</div>
          <div className={styles.two}>
            <div><h2>Start with a control plane. Expand into an infrastructure intelligence platform.</h2></div>
            <div className={styles.copy}><p>The MVP establishes a repeatable ingestion, validation, and intelligence loop. The same architecture can support additional regions, data sources, operator workflows, and model versions without changing the evidence boundary.</p><p>The product is intentionally infrastructure-oriented: measurable inputs, explicit uncertainty, auditable outputs, and a separation between facts and predictions.</p></div>
          </div>
        </section>

        <section className={styles.final}>
          <div className={styles.eyebrow}>GRIDPULSE / THE DEMO PATH</div>
          <h2>See the signal. Inspect the evidence. Run intelligence. Challenge the result.</h2>
          <p>A judge can move from live telemetry to validation evidence to Microsoft AI analysis without leaving the control plane.</p>
          <Link href="/" className={styles.primary}>ENTER GRIDPULSE</Link>
        </section>

        <footer className={styles.footer}><span>GRIDPULSE // EVIDENCE-FIRST INFRASTRUCTURE INTELLIGENCE</span><span>BUILT BY KOGLESH R. MURUGAN</span></footer>
      </div>
    </main>
  );
}
