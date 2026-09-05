# GRIDPULSE AI Architecture

## Production pipeline

1. PostgreSQL stores normalized observations and validation metrics.
2. A telemetry feature layer extracts corroboration, spatial density, regional velocity, and historical-baseline features.
3. Azure Machine Learning serves the anomaly model through a managed online endpoint. The endpoint returns a risk score, model confidence, and collapse velocity.
4. Microsoft Foundry / Azure OpenAI uses the structured evidence and prediction as its only source material for an operational explanation.
5. Predictions are persisted in `gridpulse.ai_predictions` with model version, generated timestamp, forecast horizon, risk score, confidence, and explanation.
6. The control plane displays observed facts, validation evidence, and AI predictions as separate layers.

## Microsoft AI services

### Azure Machine Learning

Purpose: anomaly scoring and regional disruption-risk inference. The application invokes the scoring URI server-side using a deployment secret. Production should use Microsoft Entra identity-based authentication where the deployment topology supports it; key-based authentication is acceptable for controlled development/testing.

### Microsoft Foundry / Azure OpenAI

Purpose: evidence-grounded explanation. The current implementation uses the Azure OpenAI Responses API at the Foundry `/openai/v1/responses` endpoint. The system prompt explicitly prohibits inventing events, causes, affected customers, measurements, or converting predictions into confirmed outages.

## Critical truth boundary

A confirmed outage is never inferred from an LLM response. A prediction is never displayed as a confirmed outage. Database validation owns confirmation. Every AI result must include model version, generated timestamp, forecast horizon, risk score, and confidence.

## Feature contract

Use the same eight features during training and inference:

- validated report rate
- independent reporter count
- spatial density
- outage/restoration ratio
- regional spread per minute
- time since first report
- corroboration confidence
- historical baseline ratio

Keep the exact definitions stable across training and evaluation. Evaluate on held-out time windows and report anomaly-detection quality honestly. Synthetic data may be used to exercise the demo pipeline but must not be presented as real-world model performance.

## Service lifecycle note

Do not build new production dependencies on Azure AI Anomaly Detector; Microsoft has announced its retirement for October 1, 2026. GRIDPULSE therefore uses Azure Machine Learning plus current Microsoft Foundry/Azure OpenAI capabilities.
