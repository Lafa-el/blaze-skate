# Blaze Skate Training V1.1 Step 3 Goal-PB Integration

Date: 2026-06-24

## Summary

V1.1 Step 3 makes Competition Goals and Dashboard target-gap metrics prefer existing PB records as the current performance source for speed skating distance goals.

This is a read-only integration with existing PB data. It does not change Firestore schema, route structure, PB record storage, PB record add/delete behavior, Daily Task behavior, XP, streak, `completedDays`, Academy, Shop, Rewards, PB records, races, or Lindsay defaults behavior.

## Files Changed

- `src/features/trainingV1/goals.js`
  - Added PB-first helper logic for distance normalization, PB lookup, current performance, PB-based progress, and PB-based gap.
- `src/features/trainingV1/dashboardMetrics.js`
  - Reused PB lookup helper logic for legacy dashboard metric exports.
- `src/App.jsx`
  - Updated Goals view and Dashboard V1 goal summaries to use PB-first current performance.
  - Added PB / Manual Current source labels.
  - Added PB Date display when a PB record has a date.
  - Added helper text for manual current time in the goal form.
- `docs/training-v1-1-goal-pb-integration.md`
  - Documents this Step 3 implementation.

## PB Lookup Rules

PB lookup uses `getBestRecordForDistance(data, distance)`.

Rules:

- Search existing record arrays only.
- Treat the lowest finite numeric `record.time` as the PB.
- Ignore missing records arrays.
- Ignore empty records arrays.
- Ignore malformed record times.
- Preserve record dates as display-only metadata.
- Do not write PB values into goals.
- Do not modify PB records.

Existing record arrays:

- `500m` -> `data.records`
- `777m` -> `data.records777`
- `1000m` -> `data.records1000`
- `1500m` -> `data.records1500`
- `Start` / `起跑` -> `data.recordsStart`
- `Lap` / `单圈` -> `data.recordsLap`
- custom distances -> `data.records_{distance}` when present

## Distance Normalization Rules

Distance can come from:

- `goal.targetDistance`
- `goal.eventName`

Normalization handles common labels:

- `500m`, `500`, `500 M` -> `500m`
- `777m`, `777` -> `777m`
- `1000m`, `1000` -> `1000m`
- `1500m`, `1500` -> `1500m`
- `Start`, `起跑` -> `Start`
- `Lap`, `单圈` -> `Lap`

If `targetDistance` has no matching PB, the helper also checks `eventName`.

## Fallback Behavior

`getGoalCurrentPerformance(goal, data)` returns:

```js
{
  source: 'records' | 'goal' | 'none',
  timeSeconds: number | null,
  date: string | null
}
```

Fallback order:

1. Use the best PB record for the goal distance.
2. If no PB record exists, use `goal.currentTimeSeconds`.
3. If neither exists, return `source: 'none'`.

When source is `goal`, the UI labels the value as Manual Current.

When source is `records`, the UI labels the value as PB and shows PB Date when available.

## Dashboard Metrics

Dashboard V1 target-gap rows now use the same PB-first logic as Goals.

Metrics affected:

- Current Best
- Target Gap
- Progress percentage
- Achieved status

Dashboard remains read-only.

No dashboard metric is written to Firestore.

Archived goals are not included in active dashboard summaries because the existing active-goal filtering remains unchanged.

## Data Safety Confirmation

No schema changes were made.

Unchanged:

- Firestore path:
  - `artifacts/blaze-skate-production/users/{uid}/profile/main`
- Goals:
  - `data.competitionGoalsV1`
- PB records:
  - `records`
  - `records777`
  - `records1000`
  - `records1500`
  - `recordsStart`
  - `recordsLap`
  - `records_{distance}`

No Firestore subcollections were added.

No data migration was introduced.

## PB Records Confirmation

PB records are not modified.

Unchanged:

- PB record add behavior
- PB record delete behavior
- PB record field shape
- PB record arrays

The integration only reads existing record arrays.

## Goal Current Time Confirmation

`goal.currentTimeSeconds` is not overwritten.

The goal edit form still keeps `currentTimeSeconds` as a manual fallback value.

Helper text was added:

- English: `Used only when no PB record is available.`
- Chinese: `仅在没有 PB 记录时使用。`

## XP / Streak / completedDays Confirmation

This step does not change:

- Daily Task completion semantics
- XP / points logic
- old streak logic
- `completedDays`
- Academy import logic
- Shop / Rewards logic
- PB record add/delete logic
- races logic

## Manual Verification Checklist

- [ ] Add a PB record for `500m` in Data.
- [ ] Create or edit a goal with `targetDistance` set to `500`, `500m`, or `500 M`.
- [ ] Confirm the Goals tab shows source `PB`.
- [ ] Confirm the Goals tab shows PB Date when the record has a date.
- [ ] Confirm current performance uses the lowest numeric PB time.
- [ ] Confirm progress and gap are calculated from the PB time.
- [ ] Remove or use a distance with no PB record.
- [ ] Confirm the Goals tab falls back to Manual Current.
- [ ] Confirm the Dashboard Target Gap section uses the same PB-first value.
- [ ] Confirm archived goals do not appear in active Dashboard summaries.
- [ ] Confirm no PB record is created, updated, or deleted by viewing goals.
- [ ] Confirm `goal.currentTimeSeconds` is not overwritten after viewing Dashboard or Goals.
- [ ] Confirm Daily Tasks, XP, streak, and `completedDays` behavior is unchanged.

## Validation

Run:

```text
npm run lint
npm run build
```

There is no `npm run typecheck` script in the current package configuration.
