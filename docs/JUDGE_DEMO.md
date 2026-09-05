# GRIDPULSE judge demo

## 90-second path

1. Open the live control plane.
2. Point to a telemetry signal and identify its source, timestamp, region, and validation state.
3. Explain that PostgreSQL corroboration is the confirmation boundary.
4. Open the intelligence action for a signal.
5. Run the AI workflow when both Microsoft AI services are configured.
6. Show the Azure Machine Learning risk score, confidence, and prediction horizon.
7. Show the Microsoft Foundry explanation and explain that it is grounded only in supplied evidence and model output.
8. Explicitly distinguish **observed**, **validated**, and **predicted** states.

## What to say

> GRIDPULSE does not ask AI to decide whether an outage is real. It first builds an evidence record from telemetry, corroborates independent observations in PostgreSQL, and only then uses Microsoft AI to help reason about risk and explain the available evidence.

> Azure Machine Learning and Microsoft Foundry perform different jobs. Removing either service breaks a distinct part of the intelligence workflow.

## Proof points

- The telemetry ingestion boundary is typed and rate-limited.
- Validation is calculated from independent nearby observations and time proximity rather than from the AI model.
- AI configuration is checked server-side and fails closed when required services are unavailable.
- External AI calls have bounded timeouts and invalid model output is rejected.
- Secrets remain server-side and are never rendered into the browser.
- The UI keeps prediction separate from confirmation.

## If AI is not configured

Do not fake a successful inference. Show the readiness state and explain that the production workflow is intentionally fail-closed until the required Microsoft AI resources are configured.

## Evidence to capture before submission

Record real founder-led validation as it happens:

- who was interviewed or tested with, where appropriate and with consent;
- what workflow or problem was tested;
- what evidence was collected;
- what failed or surprised you;
- what changed because of the feedback;
- measurable before/after results when they genuinely exist.

Never manufacture users, customers, outage counts, accuracy, impact, or model performance claims.
