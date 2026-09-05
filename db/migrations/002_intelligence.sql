BEGIN;

CREATE OR REPLACE FUNCTION gridpulse.intelligence_event(p_id uuid)
RETURNS TABLE(
  id uuid,
  region_name text,
  status text,
  observed_at timestamptz,
  nearby_reports integer,
  independent_reporters integer,
  corroboration_confidence numeric,
  report_rate double precision,
  spatial_density double precision,
  outage_restoration_ratio double precision,
  regional_spread_per_minute double precision,
  minutes_since_first_report double precision,
  historical_baseline_ratio double precision
)
LANGUAGE sql
SECURITY DEFINER
SET search_path=gridpulse,public
AS $fn$
WITH target AS (
  SELECT t.id,t.region_name,t.status,t.observed_at,COALESCE(v.nearby_reports,0) nearby_reports,COALESCE(v.independent_reporters,0) independent_reporters,COALESCE(v.confidence,0) corroboration_confidence
  FROM telemetry_reports t LEFT JOIN validation_metrics v ON v.report_id=t.id WHERE t.id=p_id
),
windowed AS (
  SELECT t.* FROM telemetry_reports t,target x WHERE t.region_name=x.region_name AND t.observed_at BETWEEN x.observed_at-interval '60 minutes' AND x.observed_at
),
validated_window AS (
  SELECT w.* FROM windowed w JOIN validation_metrics v ON v.report_id=w.id WHERE v.validation_status='validated'
),
recent AS (
  SELECT count(*)::double precision / 1.0 AS report_rate, count(DISTINCT floor(latitude)::text||':'||floor(longitude)::text)::double precision AS cells, count(*) FILTER (WHERE status='outage')::double precision AS outages, count(*) FILTER (WHERE status='restored')::double precision AS restored, EXTRACT(EPOCH FROM (max(observed_at)-min(observed_at)))/60.0 AS span_minutes, EXTRACT(EPOCH FROM (x.observed_at-min(observed_at)))/60.0 AS minutes_since_first
  FROM validated_window, target x
),
baseline AS (
  SELECT count(*)::double precision / 7.0 AS daily_rate FROM telemetry_reports t,target x WHERE t.region_name=x.region_name AND t.observed_at < x.observed_at-interval '60 minutes' AND t.observed_at >= x.observed_at-interval '8 days' AND t.status='outage'
),
selected AS (SELECT * FROM target),
features AS (
  SELECT s.*,r.report_rate,r.cells,r.outages,r.restored,r.span_minutes,r.minutes_since_first,b.daily_rate
  FROM selected s CROSS JOIN recent r CROSS JOIN baseline b
)
SELECT id,region_name,status,observed_at,nearby_reports,independent_reporters,corroboration_confidence,
       report_rate,
       cells / 1.0,
       outages / GREATEST(restored,1),
       CASE WHEN span_minutes IS NULL OR span_minutes<=0 THEN cells ELSE cells/span_minutes END,
       GREATEST(0,COALESCE(minutes_since_first,0)),
       report_rate / GREATEST(daily_rate/24.0,0.1)
FROM features;
$fn$;

GRANT EXECUTE ON FUNCTION gridpulse.intelligence_event(uuid) TO gridpulse_app;

COMMIT;
