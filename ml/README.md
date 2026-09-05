# GRIDPULSE anomaly model

GRIDPULSE uses an anomaly-detection model as the forecasting layer. The model does not confirm outages; the PostgreSQL validation layer owns event confirmation.

## Feature contract

The scoring payload contains:

- `report_rate`
- `independent_reporters`
- `spatial_density`
- `outage_restoration_ratio`
- `regional_spread_per_minute`
- `minutes_since_first_report`
- `corroboration_confidence`
- `historical_baseline_ratio`

Keep this definition stable between training and inference. Training data should be time-ordered telemetry features exported from GRIDPULSE. Do not report model quality from synthetic demo data as real-world performance.

## Local training

Install `pandas`, `numpy`, `scikit-learn`, and `joblib`, then run:

`python train.py --input telemetry_features.csv --output model.joblib`

The trainer requires at least 50 complete rows and stores the model version and training-row count in the artifact.

## Azure Machine Learning

Package `score.py` and the generated `model.joblib` into an Azure Machine Learning managed online endpoint. The web application calls the endpoint's scoring URI from the server only. Keep endpoint credentials in deployment secrets, never in browser code or Git.

The endpoint contract is:

`POST /score`

with a JSON body containing `input_data.features`. It returns `risk_score`, `confidence`, and `collapse_velocity`.
