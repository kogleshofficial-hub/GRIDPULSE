BEGIN;
CREATE SCHEMA IF NOT EXISTS gridpulse;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS gridpulse.region_clusters(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),name text NOT NULL UNIQUE,center_lat double precision NOT NULL CHECK(center_lat BETWEEN -90 AND 90),center_lon double precision NOT NULL CHECK(center_lon BETWEEN -180 AND 180),active boolean NOT NULL DEFAULT true,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS gridpulse.telemetry_reports(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),region_id uuid REFERENCES gridpulse.region_clusters(id),latitude double precision NOT NULL CHECK(latitude BETWEEN -90 AND 90),longitude double precision NOT NULL CHECK(longitude BETWEEN -180 AND 180),geo_cell text GENERATED ALWAYS AS (floor(latitude)::text||':'||floor(longitude)::text) STORED,observed_at timestamptz NOT NULL,received_at timestamptz NOT NULL DEFAULT now(),status text NOT NULL CHECK(status IN ('outage','restored','degraded','unknown')),source text NOT NULL CHECK(source IN ('crowd','operator','sensor')),region_name text NOT NULL CHECK(length(region_name) BETWEEN 1 AND 120),external_id text,reporter_hash text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(source,external_id));
CREATE TABLE IF NOT EXISTS gridpulse.validation_metrics(report_id uuid PRIMARY KEY REFERENCES gridpulse.telemetry_reports(id) ON DELETE CASCADE,nearby_reports integer NOT NULL DEFAULT 0,independent_reporters integer NOT NULL DEFAULT 0,temporal_corroboration integer NOT NULL DEFAULT 0,confidence numeric(6,5) NOT NULL DEFAULT 0 CHECK(confidence BETWEEN 0 AND 1),validation_status text NOT NULL DEFAULT 'pending' CHECK(validation_status IN ('pending','validated','rejected')),validated_at timestamptz,validation_version text NOT NULL DEFAULT 'v1');
CREATE TABLE IF NOT EXISTS gridpulse.rate_limits(bucket_key text PRIMARY KEY,window_started timestamptz NOT NULL DEFAULT now(),count integer NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS gridpulse.ai_predictions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),region_id uuid REFERENCES gridpulse.region_clusters(id),model_version text NOT NULL,generated_at timestamptz NOT NULL DEFAULT now(),horizon_minutes integer NOT NULL CHECK(horizon_minutes>0),risk_score numeric(6,5) NOT NULL CHECK(risk_score BETWEEN 0 AND 1),collapse_velocity double precision,confidence numeric(6,5) CHECK(confidence BETWEEN 0 AND 1),explanation text);
CREATE INDEX IF NOT EXISTS telemetry_observed_idx ON gridpulse.telemetry_reports(observed_at DESC);
CREATE INDEX IF NOT EXISTS telemetry_geo_idx ON gridpulse.telemetry_reports(geo_cell);
CREATE INDEX IF NOT EXISTS telemetry_region_idx ON gridpulse.telemetry_reports(region_id,observed_at DESC);
CREATE INDEX IF NOT EXISTS validation_status_idx ON gridpulse.validation_metrics(validation_status,confidence DESC);

CREATE OR REPLACE FUNCTION gridpulse.refresh_validation(p_report uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=gridpulse,public AS $fn$
DECLARE r telemetry_reports; nearby integer; independent integer; temporal integer; score numeric;
BEGIN
SELECT * INTO r FROM telemetry_reports WHERE id=p_report;
IF NOT FOUND THEN RETURN; END IF;
SELECT count(*) INTO nearby FROM telemetry_reports t WHERE t.id<>r.id AND t.geo_cell IN ((floor(r.latitude)::text||':'||floor(r.longitude)::text),((floor(r.latitude)-1)::text||':'||floor(r.longitude)::text),((floor(r.latitude)+1)::text||':'||floor(r.longitude)::text),(floor(r.latitude)::text||':'||(floor(r.longitude)-1)::text),(floor(r.latitude)::text||':'||(floor(r.longitude)+1)::text)) AND t.observed_at BETWEEN r.observed_at-interval '30 minutes' AND r.observed_at+interval '30 minutes' AND t.status='outage';
SELECT count(DISTINCT reporter_hash) INTO independent FROM telemetry_reports t WHERE t.id<>r.id AND t.geo_cell=floor(r.latitude)::text||':'||floor(r.longitude)::text AND t.observed_at BETWEEN r.observed_at-interval '30 minutes' AND r.observed_at+interval '30 minutes' AND t.status='outage';
temporal:=LEAST(nearby,20); score:=LEAST(1,(nearby*0.025)+(independent*0.10)+(CASE WHEN r.source='sensor' THEN 0.20 ELSE 0 END));
INSERT INTO validation_metrics(report_id,nearby_reports,independent_reporters,temporal_corroboration,confidence,validation_status,validated_at) VALUES(r.id,nearby,independent,temporal,score,CASE WHEN score>=0.60 THEN 'validated' ELSE 'pending' END,CASE WHEN score>=0.60 THEN now() ELSE NULL END)
ON CONFLICT(report_id) DO UPDATE SET nearby_reports=EXCLUDED.nearby_reports,independent_reporters=EXCLUDED.independent_reporters,temporal_corroboration=EXCLUDED.temporal_corroboration,confidence=EXCLUDED.confidence,validation_status=EXCLUDED.validation_status,validated_at=EXCLUDED.validated_at;
END; $fn$;

CREATE OR REPLACE FUNCTION gridpulse.ingest_report(p_lat double precision,p_lon double precision,p_observed timestamptz,p_status text,p_source text,p_region text,p_external text,p_hash text) RETURNS TABLE(report_id uuid,validation_status text) LANGUAGE plpgsql SECURITY DEFINER SET search_path=gridpulse,public AS $fn$
DECLARE rid uuid; cluster_id uuid; bucket text:=p_hash||':'||to_char(date_trunc('minute',now()),'YYYYMMDDHH24MI'); c integer;
BEGIN
INSERT INTO rate_limits(bucket_key,count) VALUES(bucket,1) ON CONFLICT(bucket_key) DO UPDATE SET count=rate_limits.count+1 RETURNING count INTO c;
IF c>30 THEN RAISE EXCEPTION 'rate limit exceeded' USING ERRCODE='P0001'; END IF;
SELECT id INTO cluster_id FROM region_clusters WHERE lower(name)=lower(p_region) AND active=true LIMIT 1;
INSERT INTO telemetry_reports(region_id,latitude,longitude,observed_at,status,source,region_name,external_id,reporter_hash) VALUES(cluster_id,p_lat,p_lon,p_observed,p_status,p_source,p_region,p_external,p_hash)
ON CONFLICT(source,external_id) DO UPDATE SET received_at=now(),region_id=EXCLUDED.region_id,latitude=EXCLUDED.latitude,longitude=EXCLUDED.longitude,observed_at=EXCLUDED.observed_at,status=EXCLUDED.status,region_name=EXCLUDED.region_name RETURNING id INTO rid;
PERFORM refresh_validation(rid); RETURN QUERY SELECT v.report_id,v.validation_status FROM validation_metrics v WHERE v.report_id=rid;
END; $fn$;

CREATE OR REPLACE FUNCTION gridpulse.dashboard_summary() RETURNS TABLE(reports bigint,validated bigint,pending bigint,regions bigint,last_report timestamptz,active_regions bigint) LANGUAGE sql SECURITY DEFINER SET search_path=gridpulse,public AS $fn$
SELECT (SELECT count(*) FROM telemetry_reports WHERE observed_at>now()-interval '24 hours'),(SELECT count(*) FROM validation_metrics v JOIN telemetry_reports t ON t.id=v.report_id WHERE v.validation_status='validated' AND t.observed_at>now()-interval '24 hours'),(SELECT count(*) FROM validation_metrics v JOIN telemetry_reports t ON t.id=v.report_id WHERE v.validation_status='pending' AND t.observed_at>now()-interval '24 hours'),(SELECT count(*) FROM region_clusters WHERE active),(SELECT max(observed_at) FROM telemetry_reports WHERE observed_at>now()-interval '24 hours'),(SELECT count(DISTINCT region_name) FROM telemetry_reports WHERE observed_at>now()-interval '24 hours'); $fn$;

CREATE OR REPLACE FUNCTION gridpulse.dashboard_events(p_limit integer DEFAULT 100) RETURNS TABLE(id uuid,latitude double precision,longitude double precision,status text,source text,region_name text,observed_at timestamptz,confidence numeric,validation_status text) LANGUAGE sql SECURITY DEFINER SET search_path=gridpulse,public AS $fn$
SELECT t.id,t.latitude,t.longitude,t.status,t.source,t.region_name,t.observed_at,COALESCE(v.confidence,0),COALESCE(v.validation_status,'pending') FROM telemetry_reports t LEFT JOIN validation_metrics v ON v.report_id=t.id WHERE t.observed_at>now()-interval '24 hours' ORDER BY t.observed_at DESC LIMIT LEAST(GREATEST(COALESCE(p_limit,100),1),250); $fn$;

CREATE OR REPLACE FUNCTION gridpulse.dashboard_regions() RETURNS TABLE(id uuid,name text,center_lat double precision,center_lon double precision,reports bigint,validated bigint,latest_report timestamptz) LANGUAGE sql SECURITY DEFINER SET search_path=gridpulse,public AS $fn$
SELECT r.id,r.name,r.center_lat,r.center_lon,count(t.id),count(t.id) FILTER (WHERE v.validation_status='validated'),max(t.observed_at) FROM region_clusters r LEFT JOIN telemetry_reports t ON t.region_id=r.id AND t.observed_at>now()-interval '24 hours' LEFT JOIN validation_metrics v ON v.report_id=t.id WHERE r.active GROUP BY r.id,r.name,r.center_lat,r.center_lon ORDER BY count(t.id) DESC,r.name; $fn$;

DO $fn$ BEGIN IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='gridpulse_app') THEN CREATE ROLE gridpulse_app NOLOGIN; END IF; END $fn$;
REVOKE ALL ON SCHEMA gridpulse FROM PUBLIC;
GRANT USAGE ON SCHEMA gridpulse TO gridpulse_app;
GRANT EXECUTE ON FUNCTION gridpulse.ingest_report(double precision,double precision,timestamptz,text,text,text,text,text) TO gridpulse_app;
GRANT EXECUTE ON FUNCTION gridpulse.dashboard_summary() TO gridpulse_app;
GRANT EXECUTE ON FUNCTION gridpulse.dashboard_events(integer) TO gridpulse_app;
GRANT EXECUTE ON FUNCTION gridpulse.dashboard_regions() TO gridpulse_app;
GRANT SELECT ON gridpulse.region_clusters,gridpulse.ai_predictions TO gridpulse_app;
ALTER TABLE gridpulse.telemetry_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE gridpulse.validation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE gridpulse.region_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE gridpulse.ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gridpulse.rate_limits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS telemetry_insert ON gridpulse.telemetry_reports;
CREATE POLICY telemetry_insert ON gridpulse.telemetry_reports FOR INSERT TO gridpulse_app WITH CHECK(true);
DROP POLICY IF EXISTS region_read ON gridpulse.region_clusters;
CREATE POLICY region_read ON gridpulse.region_clusters FOR SELECT TO gridpulse_app USING(true);
DROP POLICY IF EXISTS ai_read ON gridpulse.ai_predictions;
CREATE POLICY ai_read ON gridpulse.ai_predictions FOR SELECT TO gridpulse_app USING(true);
COMMIT;
