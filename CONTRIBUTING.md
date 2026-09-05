# Contributing to GRIDPULSE

Thanks for your interest in GRIDPULSE.

## Before you start

GRIDPULSE is an evidence-first prototype. Contributions should preserve the distinction between observed telemetry, validated evidence, machine-learning prediction, and AI-generated explanation.

## Development

1. Fork the repository.
2. Create a focused branch for your change.
3. Install dependencies with `npm install`.
4. Configure a local `.env.local` from `.env.example`.
5. Make a small, reviewable change.
6. Run `npm run lint` and `npm run build`.
7. Update documentation when behavior or configuration changes.
8. Open a pull request with a clear description and testing notes.

## Code principles

- Prefer typed, explicit boundaries.
- Validate untrusted input at API boundaries.
- Never expose secrets to client-side code.
- Keep AI output bounded by supplied evidence.
- Never convert a prediction into a confirmed outage.
- Preserve accessible keyboard and semantic behavior.
- Avoid fabricated metrics or unsupported claims in UI and documentation.

## AI-assisted contributions

AI tools may be used as development aids, but contributors remain responsible for reviewing generated code, testing it, checking dependencies, and understanding the resulting change. Do not submit generated content blindly.

## Pull requests

A good pull request explains:

- what changed;
- why it changed;
- how it was tested;
- any new environment variables or migrations;
- any known limitations.
