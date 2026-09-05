# GRIDPULSE Deployment

## Required environment variables

`DATABASE_URL` — PostgreSQL connection string for the restricted application role.

`REPORTER_HASH_SALT` — long random secret used to pseudonymize reporter network fingerprints. Never commit it.

`AZURE_ML_SCORING_URI` — managed Azure Machine Learning online endpoint scoring URI.

`AZURE_ML_ENDPOINT_KEY` — server-side credential for the ML endpoint. For production, prefer Microsoft Entra identity-based authentication when the topology supports it.

`AZURE_ML_MODEL_VERSION` — immutable model identifier shown with predictions.

`AZURE_ML_HORIZON_MINUTES` — forecast horizon represented by the deployed model.

`AZURE_OPENAI_ENDPOINT` — Microsoft Foundry / Azure OpenAI resource endpoint.

`AZURE_OPENAI_API_KEY` — server-side Foundry credential. Never expose it to the browser.

`AZURE_OPENAI_MODEL` — deployed model name used by the Responses API.

## Local

1. Install Node.js 20+.
2. Run `npm install`.
3. Apply `db/schema.sql` to a PostgreSQL 16+ database.
4. Apply migrations in `db/migrations/` in numeric order.
5. Create `.env.local` with the required variables for the services you have configured.
6. Run `npm run dev`.
7. Check `/api/health`.
8. Open `/` for the control plane and `/report` for human telemetry input.

## Vercel

Import the GitHub repository, set the production environment variables, and deploy. Do not place secrets in source control. Azure credentials are server-only environment variables.

## Azure Machine Learning

Deploy the trained artifact from `ml/` as a managed online endpoint. The endpoint must accept the documented `input_data.features` contract and return `risk_score`, `confidence`, and `collapse_velocity`. Keep the model version stable and evaluate on held-out time windows before presenting performance claims.

## Microsoft Foundry

Deploy an Azure OpenAI model accessible through the Foundry Responses API. GRIDPULSE sends only structured event evidence and the ML prediction to the server-side explanation call. The application prompt establishes a hard evidence boundary: the model must not invent incidents, causes, measurements, affected customers, or convert predictions into confirmed outages.

## First production verification

- `/api/health` returns database reachable.
- A telemetry POST returns 201.
- The inserted report exists in PostgreSQL.
- Validation metrics are created by the database function.
- Dashboard counts change from database state.
- Rate limiting rejects excessive requests.
- `/api/dashboard` returns normalized JSON.
- AI analysis fails closed when Azure services are not configured.
- No secret appears in Git history.
- The model version and confidence are visible with every AI prediction.
