# Security Policy

## Scope

GRIDPULSE is an open-source prototype and should not be treated as a safety-critical infrastructure control system.

## Reporting a vulnerability

Please do not publish credentials, API keys, private data, or exploitable security details in a public issue.

If you discover a security problem, use the private security reporting mechanism provided by GitHub for this repository when available. If private reporting is unavailable, open a minimal issue without sensitive details and request a private contact channel.

## Secrets

Never commit:

- database credentials;
- Azure API keys or endpoint keys;
- deployment tokens;
- reporter hash salts;
- private certificates;
- personal access tokens.

Use environment variables and the deployment platform's secret manager instead.

## Security expectations

Contributors should preserve input validation, server-side secret handling, rate limiting, safe error responses, and the application's evidence/prediction boundary.
