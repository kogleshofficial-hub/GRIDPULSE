"""Train the GRIDPULSE regional anomaly model.

Input: CSV with the eight feature columns documented in ml/README.md.
Output: model.joblib containing an IsolationForest plus feature metadata.
Use real, time-ordered telemetry features for competition evaluation; synthetic data
should only be used for UI demonstrations and must be labelled as synthetic.
"""

from pathlib import Path
import argparse
import json
import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

FEATURES = [
    "report_rate",
    "independent_reporters",
    "spatial_density",
    "outage_restoration_ratio",
    "regional_spread_per_minute",
    "minutes_since_first_report",
    "corroboration_confidence",
    "historical_baseline_ratio",
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="CSV containing GRIDPULSE feature rows")
    parser.add_argument("--output", default="model.joblib")
    args = parser.parse_args()

    frame = pd.read_csv(args.input)
    missing = [name for name in FEATURES if name not in frame.columns]
    if missing:
        raise SystemExit(f"Missing feature columns: {', '.join(missing)}")
    data = frame[FEATURES].apply(pd.to_numeric, errors="coerce").dropna()
    if len(data) < 50:
        raise SystemExit("At least 50 complete feature rows are required for a useful baseline model")

    pipeline = Pipeline([
        ("scale", StandardScaler()),
        ("model", IsolationForest(n_estimators=250, contamination="auto", random_state=42)),
    ])
    pipeline.fit(data)

    artifact = {
        "pipeline": pipeline,
        "features": FEATURES,
        "model_version": "gridpulse-anomaly-v1",
        "training_rows": int(len(data)),
    }
    joblib.dump(artifact, args.output)
    print(json.dumps({"output": str(Path(args.output).resolve()), "training_rows": len(data), "model_version": artifact["model_version"]}))


if __name__ == "__main__":
    main()
