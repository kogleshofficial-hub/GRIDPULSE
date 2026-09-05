# GRIDPULSE API

## POST /api/telemetry/report

Accepts a JSON telemetry report:

```json
{
  "latitude": 1.5533,
  "longitude": 110.3592,
  "reportedAt": "2026-09-05T01:30:00Z",
  "status": "outage",
  "source": "crowd",
  "region": "Kuching",
  "externalId": "optional-client-event-id"
}
```

The endpoint validates coordinate bounds, timestamp freshness, payload size and enum values; pseudonymizes the request IP with a server-side salt; then delegates rate limiting, insertion and validation to PostgreSQL.

## Responses

- `201` accepted
- `400` malformed JSON or validation failure
- `413` payload too large
- `415` unsupported content type
- `422` timestamp outside the accepted window
- `429` database-backed rate limit exceeded
- `500` unexpected server/database failure

Never send secrets, reporter identity, passwords or API keys in the telemetry payload.
