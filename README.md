# GRIDPULSE

**Evidence-first infrastructure intelligence for observing, validating, and explaining grid disruption signals.**

[Live control plane](https://gridpulse-three.vercel.app) · [Judge brief](https://gridpulse-three.vercel.app/judge) · [Source code](https://github.com/kogleshofficial-hub/GRIDPULSE)

## Why GRIDPULSE exists

Infrastructure disruption is difficult to understand when reports are fragmented, noisy, delayed, or impossible to verify. GRIDPULSE is an experimental, evidence-first control plane that turns human telemetry into a structured decision path:

**OBSERVED → VALIDATED → PREDICTED → EXPLAINED**

The system keeps these states deliberately separate. A machine-learning prediction is never presented as proof that an outage happened; confirmation comes from the telemetry validation layer.

## What it does

- Accepts structured telemetry reports with server-side validation.
- Normalizes reports into a PostgreSQL-backed evidence layer.
- Correlates nearby and recent reports to produce validation confidence.
- Displays live operational signals in a responsive dashboard.
- Sends structured features to an Azure Machine Learning scoring endpoint when configured.
- Sends bounded evidence and prediction data to Microsoft Foundry / Azure OpenAI for a concise operational explanation when configured.
- Fails closed when required AI services are unavailable instead of pretending an AI result exists.
- Keeps model version, confidence, generation time, validation state, and evidence distinguishable.
- Provides a judge-focused architecture and verification path.

## Architecture

```text
Human telemetry
      │
      ▼
Next.js API + Zod validation
      │
      ▼
PostgreSQL evidence + validation engine
      │
      ├──────────────► Operator dashboard
      │
      ▼
Azure Machine Learning
      │  risk / confidence / horizon
      ▼
Microsoft Foundry / Azure OpenAI
      │  bounded explanation
      ▼
Operator decision surface
```

### Microsoft AI roles

GRIDPULSE is designed to use two distinct Microsoft AI services:

1. **Azure Machine Learning** — produces the bounded risk/confidence prediction from structured features.
2. **Microsoft Foundry / Azure OpenAI** — turns the supplied evidence and prediction into a grounded operational explanation.

Neither service is allowed to turn an uncertain prediction into a confirmed outage.

## Technology

- Next.js App Router
- React
- TypeScript
- PostgreSQL
- Zod
- Azure Machine Learning
- Microsoft Foundry / Azure OpenAI
- Vercel deployment
- GitHub Actions CI

## Project structure

```text
src/
  app/
    api/
      dashboard/              dashboard data endpoint
      demo/                   demo endpoint
      health/                 service health endpoint
      intelligence/           AI readiness + intelligence routes
      telemetry/report/       telemetry ingestion endpoint
    judge/                    judge-facing architecture brief
    report/                   telemetry submission UI
    robots.ts                 crawler rules
    sitemap.ts                sitemap
    manifest.ts               web app manifest
  components/
    dashboard.tsx             operator control plane
  lib/
    db.ts                     PostgreSQL access
    demo.ts                   deterministic demo data helpers
    intelligence.ts           Azure ML + Foundry integration

db/
  schema.sql                  complete database schema
  migrations/                 incremental database changes

ml/
  train.py                    model-training scaffold
  score.py                    Azure ML scoring contract
  README.md                   ML deployment notes

docs/
  AI_INTEGRATION.md            AI service contract
  API.md                       API reference
  JUDGE_DEMO.md                judge demo path
  STARDANCE.md                 Stardance project notes
  VALIDATION_PLAYBOOK.md       evidence/validation methodology
  DEPLOYMENT.md                deployment notes
```

## Local development

### Requirements

- Node.js 20+
- PostgreSQL
- A GitHub account for source control
- Optional Azure resources for the AI path

### Install

```bash
npm install
```

### Configure

Copy `.env.example` to `.env.local` and fill in the values for your own environment. Never commit real secrets.

Required for the core application:

```text
DATABASE_URL=...
REPORTER_HASH_SALT=...
```

Optional AI configuration:

```text
AZURE_ML_SCORING_URI=...
AZURE_ML_ENDPOINT_KEY=...
AZURE_ML_MODEL_VERSION=gridpulse-anomaly-v1
AZURE_ML_HORIZON_MINUTES=30
AZURE_OPENAI_ENDPOINT=...
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_MODEL=...
```

The intelligence route intentionally refuses to fabricate a successful result when either required Microsoft AI service is missing or returns an invalid response.

### Database

Apply `db/schema.sql` to a PostgreSQL database, then apply migrations in order.

### Run

```bash
npm run dev
```

Open `http://localhost:3000`.

### Quality checks

```bash
npm run lint
npm run build
```

GitHub Actions runs the same lint/build checks on pushes and pull requests.

## Demo path

For a quick technical walkthrough:

1. Open the deployed control plane.
2. Inspect an observed telemetry signal.
3. Confirm whether the evidence is validated by the database layer.
4. If both AI services are configured, run the intelligence action.
5. Inspect the Azure ML prediction and its confidence/horizon.
6. Inspect the grounded Foundry explanation.
7. Verify that prediction and confirmation remain separate.

If the AI services are not configured, the UI reports the unavailable state rather than simulating a successful AI response.

## Data and safety boundaries

GRIDPULSE is a prototype and decision-support system, not a utility control system. It does not directly operate electrical infrastructure.

The application treats human reports as signals, not unquestionable truth. Validation is based on corroboration and structured evidence. AI explanations are constrained to the evidence supplied to them and explicitly instructed not to invent outages, causes, measurements, affected customers, or certainty.

Do not use GRIDPULSE as the sole basis for emergency, safety-critical, medical, financial, or infrastructure-control decisions.

## Privacy

Telemetry ingestion hashes the source IP before storing reporter identity material. The repository does not intentionally store raw IP addresses as application data. Deployers are responsible for configuring infrastructure, retention, access controls, and privacy notices appropriate to their jurisdiction and use case.

## Open source

GRIDPULSE is published as open source under the MIT License. See `LICENSE`.

## AI-assisted development disclosure

GRIDPULSE has been developed with AI assistance as part of the development workflow. AI tools may assist with brainstorming, implementation, debugging, documentation, and review, while the project owner remains responsible for the product direction, repository changes, testing, deployment decisions, and final acceptance of the code.

This disclosure is intentional: the project is not presented as a one-click AI-generated website.

## Stardance

GRIDPULSE is intended to be developed and published as an open-source technical project for Hack Club Stardance. See [`docs/STARDANCE.md`](docs/STARDANCE.md) for the project-specific checklist and the distinction between existing work and newly tracked Stardance work.

## Author

**Koglesh R. Murugan** — student developer from Malaysia.

GRIDPULSE is an independent project. Microsoft, Azure, Hack Club, NASA, AMD, GitHub, and other third parties are not implied to endorse or sponsor this project unless explicitly stated by them.

## License

MIT — see [`LICENSE`](LICENSE).
