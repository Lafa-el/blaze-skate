# Blaze Skate Training V1.7 Step 1: Templates / Defaults Smoke Coverage

## Summary

This step extends the existing `npm run smoke:training` script to cover:

- `src/features/trainingV1/planTemplates.js`
- `src/features/trainingV1/trainingV1Defaults.js`

The goal is broader helper confidence without changing app behavior, Firestore semantics, or UI logic.

## Files Changed

- `scripts/smoke-training-v1.js`
- `docs/training-v1-7-templates-defaults-smoke-coverage.md`

## New Smoke Coverage Added

### `planTemplates.js`

Added deterministic checks for:

- `getTrainingPlanTemplates()` returns a non-empty array
- stable template IDs exist
- template localized title structure exists
- template data is cloned on read
- `createTrainingPlanFromTemplate()` returns:
  - plan `id`
  - `title`
  - `status`
  - `startDate`
  - `endDate`
  - `days`
- generated plan spans 7 consecutive dates
- generated tasks contain the fields used by the UI
- explicit `goalId` is preserved
- explicit `titleOverride` is preserved
- explicit `status` is preserved
- options object is not mutated
- localized fallback title behavior remains intact

### `trainingV1Defaults.js`

Added deterministic checks for:

- `createDefaultLindsayGoals()` returns the expected core default goals
- `createDefaultLindsayWeeklyPlan()` returns the expected weekly plan shape
- `shouldSeedTrainingV1Goals()` returns true for empty V1 data
- `shouldSeedTrainingV1Plan()` returns true when the default weekly plan is missing
- `getMissingDefaultLindsayGoalInputs()` reports expected missing defaults
- `createMissingDefaultLindsayGoals()` creates only missing goals
- default goal creation is idempotent after defaults are present
- default weekly plan detection is idempotent after the matching plan is present
- existing user-created goals are preserved
- existing user-created plans are preserved
- existing matching default goals are not duplicated
- `activeTrainingPlanId` semantics remain untouched by default helpers

## Helper Behavior Assumptions Confirmed

- Training plan templates currently generate 7-day plans
- Template task generation depends on the existing `createTrainingPlan()` and `createPlanTask()` helpers
- Lindsay default goals currently contain three active goals
- Lindsay default weekly plan currently uses title:
  - `Lindsay Weekly Training Plan`
- Default helper behavior is detection-oriented:
  - it reports missing defaults
  - it creates missing defaults
  - it does not perform Firebase writes
  - it does not directly change `activeTrainingPlanId`

## Behavior Confirmation

- No app behavior changed
- No helper semantics were intentionally changed
- No Firestore writes were added
- No Firestore schema changes were made
- No subcollections or migrations were introduced

## How To Run

```bash
npm run smoke:training
```

## Validation

This step should still be validated with:

- `npm run smoke:training`
- `npm run lint`
- `npm run build`

## Manual QA Note

Browser interactions still require manual QA.

This smoke coverage only validates helper behavior in a plain Node script and does not replace runtime UI verification.
