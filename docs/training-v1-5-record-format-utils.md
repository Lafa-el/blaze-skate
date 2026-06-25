# Blaze Skate Training V1.5 Record/Format Utils

## Summary

V1.5 Step 7 centralizes only PB record mapping helpers and read-only formatting helpers.

This step intentionally does not revisit:

- task/date utilities from Step 6
- product behavior
- Firestore structure
- PB add/delete write semantics

The goal is to reduce duplicated PB mapping and display formatting logic before further view extraction.

## Files Changed

- `src/features/trainingV1/utils/recordUtils.js`
- `src/features/trainingV1/utils/formatUtils.js`
- `src/features/trainingV1/utils/index.js`
- `src/features/trainingV1/goals.js`
- `src/features/trainingV1/weeklyReport.js`
- `src/features/goals/GoalDetailModal.jsx`
- `src/features/weeklyReport/WeeklyReportModal.jsx`
- `src/App.jsx`

## Utilities Added

### `src/features/trainingV1/utils/recordUtils.js`

Added:

- `normalizeRecordDistance(distance)`
- `getRecordCollectionKeyForDistance(distance)`
- `getRecordsForDistance(data, distance)`
- `getValidTimedRecordsForDistance(data, distance)`
- `sortRecordsByDateAsc(records)`
- `sortRecordsByDateDesc(records)`
- `getBestRecordForDistance(data, distance)`

### `src/features/trainingV1/utils/formatUtils.js`

Added:

- `formatGoalSeconds(value)`
- `formatGapSeconds(value)`
- `formatSignedGoalSeconds(value)`
- `formatPercent(value)`
- `formatDateLabel(value, fallback)`
- `formatTrendSummaryText(trendSummary, t)`

## Where Duplicated Logic Was Replaced

### `src/features/trainingV1/goals.js`

Replaced duplicated PB helper logic with imports from `recordUtils`:

- goal distance normalization
- record collection key mapping
- best-record selection
- valid timed record filtering for history

Public helper API remains compatible:

- `normalizeGoalDistance`
- `getRecordsKeyForDistance`
- `getBestRecordForDistance`
- `getRecordHistoryForDistance`

### `src/App.jsx`

Minimal safe replacement only:

- local `getRecordsKey(...)` removed
- local `formatGoalSeconds(...)` removed
- local `formatSignedGoalSeconds(...)` removed
- local `formatTrendSummaryText(...)` removed

`App.jsx` now imports the shared record/format utilities instead of maintaining duplicate local implementations.

### `src/features/goals/GoalDetailModal.jsx`

Read-only goal detail rendering now consumes shared format helpers for:

- PB/current date labels
- seconds display
- signed gap display
- percent display

### `src/features/weeklyReport/WeeklyReportModal.jsx`

Read-only weekly report rendering now consumes shared format helpers for:

- week/date labels
- adherence / progress percentage display
- goal current/target/gap display
- recent PB trend labels

### `src/features/trainingV1/weeklyReport.js`

Formatting-related progress label generation is now routed through shared `formatPercent(...)`.

## Semantic Lock Confirmation

The following semantics were preserved:

- existing record array keys remain unchanged
- `500m -> records`
- `777m -> records777`
- `1000m -> records1000`
- `1500m -> records1500`
- `Start / 起跑 -> recordsStart`
- `Lap / 单圈 -> recordsLap`
- lower time remains better
- malformed non-numeric record times remain ignored in read-only helpers
- goal gap remains `timeSeconds - targetTimeSeconds`
- negative gap still means better than target
- positive gap still means remaining gap
- UI formatting remains visually equivalent

## What Was Intentionally Not Centralized

Not centralized in this step:

- task/date utilities from Step 6
- PB add/delete write logic
- Data tab business behavior
- XP / streak / completedDays logic
- Academy / Shop / Rewards / races logic
- plan template helpers

## Behavior Confirmation

- no product features added
- no return shapes changed for existing PB helper entry points
- no user-visible formatting intent changed beyond moving to shared helpers

## PB / Firestore Safety Confirmation

- PB add/delete behavior unchanged
- PB storage shape unchanged
- Firestore schema unchanged
- no subcollections added
- no migrations introduced
- no new Firestore writes added
- `updateData` semantics unchanged
- `saveProfilePatch` semantics unchanged

## XP / Streak / Completion Confirmation

- XP / points behavior unchanged
- streak behavior unchanged
- `completedDays` behavior unchanged
- Daily Task completion behavior unchanged

## Manual Verification Checklist

- [ ] Data tab still adds PB records to the same arrays as before
- [ ] Data tab still deletes PB records correctly
- [ ] 500m / 777m / 1000m / 1500m / Start / Lap views still read the correct arrays
- [ ] Goal cards and Goal Detail Modal still show PB/manual current correctly
- [ ] Weekly Report still shows goal current/target/gap/progress correctly
- [ ] Dashboard target gap sections still render identical values
- [ ] No console/runtime errors from utility imports

## Smoke Checks Run

Local Node smoke checks were run for:

- 500m distance mapping
- 777 / 1000 / 1500 / Start / Lap mapping
- lower-time-is-better best-record selection
- malformed record filtering
- seconds formatting
- positive / zero / negative gap formatting
- percent formatting null safety

Result:

- all smoke checks passed
