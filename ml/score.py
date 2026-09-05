import json
import os
from pathlib import Path
import joblib
import numpy as np

MODEL_PATH = Path(os.environ.get("MODEL_PATH", Path(__file__).with_name("model.joblib")))
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


def init():
    global artifact
    artifact = joblib.load(MODEL_PATH)


def _extract(raw):
    if isinstance(raw, dict) and "input_data" in raw:
        raw = raw["input_data"]
    if isinstance(raw, dict) and "features" in raw:
        raw = raw["features"]
    if not isinstance(raw, dict):
        raise ValueError("features object required")
    values = [float(raw[name]) for name in FEATURES]
    if not np.isfinite(values).all():
        raise ValueError("features must be finite")
    return np.asarray(values, dtype=float).reshape(1, -1), raw


def run(raw):
    values, original = _extract(raw)
    model = artifact["pipeline"]
    anomaly = float(model.decision_function(values)[0])
    risk = float(np.clip(0.5 - anomaly, 0.0, 1.0))
    corroboration = float(np.clip(original["corroboration_confidence"], 0.0, 1.0))
    reporter_signal = float(np.clip(original["independent_reporters"] / 10.0, 0.0, 1.0))
    confidence = float(np.clip(0.55 * corroboration + 0.45 * reporter_signal, 0.0, 1.0))
    velocity = float(original["regional_spread_per_minute"])
    return {"risk_score": risk, "confidence": confidence, "collapse_velocity": velocity}


if __name__ == "__main__":
    init()
    import sys
    print(json.dumps(run(json.loads(sys.stdin.read()))))
