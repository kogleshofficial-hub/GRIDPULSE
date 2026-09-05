BEGIN;

CREATE OR REPLACE FUNCTION gridpulse.store_prediction(
  p_event_id uuid,
  p_model_version text,
  p_horizon_minutes integer,
  p_risk_score numeric,
  p_collapse_velocity double precision,
  p_confidence numeric,
  p_explanation text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=gridpulse,public
AS $fn$
DECLARE prediction_id uuid;
BEGIN
  INSERT INTO ai_predictions(region_id,model_version,horizon_minutes,risk_score,collapse_velocity,confidence,explanation)
  SELECT region_id,p_model_version,p_horizon_minutes,p_risk_score,p_collapse_velocity,p_confidence,p_explanation
  FROM telemetry_reports WHERE id=p_event_id
  RETURNING id INTO prediction_id;
  IF prediction_id IS NULL THEN RAISE EXCEPTION 'event not found'; END IF;
  RETURN prediction_id;
END;
$fn$;

GRANT EXECUTE ON FUNCTION gridpulse.store_prediction(uuid,text,integer,numeric,double precision,numeric,text) TO gridpulse_app;

COMMIT;
