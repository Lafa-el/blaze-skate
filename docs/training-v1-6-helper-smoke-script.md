# Blaze Skate Training V1.6 Helper Smoke Script

## Summary

V1.6 Step 1 adds a lightweight Node-based smoke test script for the Training V1 helper layer.

This is intentionally not a full test framework. It is a deterministic script that:

- imports pure helpers
- runs simple assertions
- prints clear pass/fail output
- exits non-zero on failure

## Files Changed

- `package.json`
- `scripts/smoke-training-v1.js`
- `docs/training-v1-6-helper-smoke-script.md`

## Script Purpose

The script provides fast regression coverage for the helper layer that was centralized during V1.5:

- `dateUtils`
- `taskMatchUtils`
- `recordUtils`
- `formatUtils`
- goal PB helpers
- weekly adherence helper
- weekly report helper

It is meant to catch low-level semantic drift before browser/manual QA.

## Covered Helper Areas

### dateUtils

- `toDateString`
- `addDaysToDateString`
- `getWeekDateRange`
- `isDateStringInRange`
- malformed-input defensive behavior

### taskMatchUtils

- normalized text matching
- null/undefined target normalization
- mismatch on different targets
- stable task match key
- duplicate de-dupe behavior

### recordUtils

- distance-to-record-key mapping
- best-record selection
- malformed record filtering

### formatUtils

- seconds formatting
- gap formatting
- signed gap formatting
- percent formatting
- date label formatting

### goals helpers

- PB-first current performance
- manual current fallback
- chronological PB history
- trend summary calculations

### weekly adherence / weekly report helpers

- weekly plan task counting
- completed plan task counting
- added-to-today de-dupe behavior
- daily task totals
- safe empty/no-plan/no-goal handling

## How To Run

```bash
npm run smoke:training
```

## What This Script Does Not Cover

- browser interactions
- React rendering behavior
- modal open/close interaction
- Firebase auth/network behavior
- Firestore subscriptions
- full end-to-end task flows

Manual QA is still required for browser-visible workflows.

## Behavior / Data Safety Confirmation

- no app behavior changed in this step
- no Firestore writes were added
- no Firestore schema changes were made
- no dependencies were added
- no product features were added

## Manual QA Reminder

This script complements, but does not replace:

- manual browser regression QA
- dashboard/task/profile interaction checks
- PB add/delete UI verification
- plan/goals modal interaction checks
