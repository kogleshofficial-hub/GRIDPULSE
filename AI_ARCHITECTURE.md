# GRIDPULSE AI Architecture

## Production pipeline

1. PostgreSQL stores normalized reports and validation metrics.
2. A change-data/event pipeline publishes validated telemetry into Azure Data Explorer.
3. KQL performs time-series aggregation, decomposition, anomaly detection and regional velocity features.
4. Azure Machine Learning or Microsoft Fabric trains and serves regional forecasting models.
5. Microsoft Foundry provides the explanation/orchestration layer; generated explanations reference model outputs and source metrics rather than inventing events.
6. Predictions are stored in `gridpulse.ai_predictions` with model version, horizon, risk score and confidence.

## Critical truth boundary

A confirmed outage is never inferred from an LLM response. A prediction is never displayed as a confirmed outage. Every AI result must include model version, generated timestamp, forecast horizon and confidence.

## Anomaly features

Use validated report rate, unique reporter count, spatial density, outage/restoration ratio, regional spread per minute, time since first report, corroboration confidence and recent historical baseline.

## Forecast target

Define collapse velocity as the rate of increase in validated outage footprint or affected-grid telemetry over a fixed interval. Keep the exact target definition stable across training and evaluation. Evaluate against held-out time windows and report precision/recall for event detection plus MAE/RMSE for forecasting.

## Service lifecycle note

Do not build new production dependencies on Azure AI Anomaly Detector; Microsoft has announced its retirement for October 1, 2026. Prefer Azure Data Explorer/KQL and current Azure ML/Fabric forecasting capabilities.
