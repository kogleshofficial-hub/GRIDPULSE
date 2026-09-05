# GRIDPULSE Founder-Led Validation Playbook

This document is the evidence protocol for testing GRIDPULSE with real users. It deliberately contains no fabricated traction, customer counts, impact numbers, or interview results.

## 1. Validation loop

**Build → observe → test → measure → improve → repeat.**

Every validation cycle should record:

1. What changed in the product.
2. Who tested it and what role they represented.
3. The task they were asked to complete.
4. What they expected to happen.
5. What actually happened.
6. Where they hesitated, failed, or requested clarification.
7. What metric changed.
8. What product change follows from the evidence.

## 2. Interview protocol

Use short, structured conversations with potential users or informed reviewers. Do not collect unnecessary personal information.

Suggested prompts:

- What would you need to know before acting on a grid-disruption signal?
- Which parts of this screen are unclear or overloaded?
- What would make you distrust the prediction?
- Is the difference between observed, validated, and predicted clear?
- What evidence would you want to inspect before escalating an event?
- Which accessibility or workflow limitation would prevent you from using this interface?

Record themes and product implications rather than publishing identifying details.

## 3. Product metrics

Track real measurements over time. Recommended baseline metrics:

| Metric | Definition | Baseline | Current | Target | Evidence |
| --- | --- | ---: | ---: | ---: | --- |
| Signal selection success | Testers successfully select a telemetry signal | TBD | TBD | TBD | Test record |
| Evidence comprehension | Testers correctly distinguish observation vs validation | TBD | TBD | TBD | Test record |
| Prediction comprehension | Testers correctly identify AI output as a prediction | TBD | TBD | TBD | Test record |
| Task completion time | Time to inspect evidence and reach the intended screen | TBD | TBD | TBD | Test record |
| AI explanation usefulness | Testers rate whether the explanation helps interpret supplied evidence | TBD | TBD | TBD | Test record |
| Accessibility task success | Keyboard/screen-reader-oriented tasks completed successfully | TBD | TBD | TBD | Accessibility test |

**Never replace TBD with an estimate.** Populate values only after the corresponding test has actually been run.

## 4. AI evaluation

For each AI test, capture:

- Input event identifier.
- Model version.
- Prediction horizon.
- Risk score.
- Model confidence.
- Whether the output was valid and bounded.
- Whether the explanation stayed within supplied evidence.
- Whether the explanation incorrectly stated that a prediction was a confirmed outage.
- Latency.
- Failure mode, if any.

A failed AI call must remain a visible failure. Do not substitute a fabricated result.

## 5. Improvement record

Use one record per product iteration:

```text
Iteration:
Date:
Problem observed:
Evidence source:
Baseline measurement:
Change made:
Post-change measurement:
Decision:
Next test:
```

## 6. Evidence standard

A claim is competition-ready only when it can be traced to a real observation, test, interview, experiment, or product record. Screenshots and recordings should show the actual system state at the time of testing.
