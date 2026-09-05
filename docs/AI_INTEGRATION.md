# GRIDPULSE AI integration

GRIDPULSE uses two distinct Microsoft AI capabilities in one operational workflow:

1. **Azure Machine Learning** scores structured telemetry features for risk, confidence, and change velocity.
2. **Microsoft Foundry / Azure OpenAI** produces a grounded operator explanation from the validated evidence and the model output.

The application intentionally fails closed when either service is not configured. The dashboard exposes the configuration state through `/api/intelligence/health`, and the AI action remains disabled until both services are configured.

## Environment contract

Required server-side variables:

```text
AZURE_ML_SCORING_URI=https://<online-endpoint>/score
AZURE_ML_ENDPOINT_KEY=<endpoint-key>
AZURE_ML_MODEL_VERSION=gridpulse-anomaly-v1
AZURE_ML_HORIZON_MINUTES=30

AZURE_OPENAI_ENDPOINT=https://<foundry-or-azure-openai-endpoint>
AZURE_OPENAI_API_KEY=<server-side-key>
AZURE_OPENAI_MODEL=<model-deployment-name>
```

Never expose these values to browser code or commit real keys.

## Runtime contract

The intelligence route loads one event from PostgreSQL, derives bounded structured features, calls Azure ML, then passes only the supplied event evidence and prediction into Foundry. The explanation prompt explicitly prohibits invented causes, measurements, affected customers, or outage claims.

Both external calls have a 12-second timeout. Invalid model output is rejected rather than rendered as trustworthy data.

## Demo sequence

1. Open the live control plane.
2. Select a telemetry signal.
3. Confirm its source, timestamp, confidence, and validation state.
4. Run AI analysis.
5. Inspect the risk score and model confidence.
6. Read the grounded explanation.
7. Compare the AI output with the evidence boundary.

A prediction is never presented as confirmation. Confirmation remains the responsibility of the PostgreSQL validation layer.
