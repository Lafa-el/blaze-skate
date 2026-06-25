# Blaze Skate Training V1.5 Task/Date Utils

## Summary

V1.5 Step 6 centralizes only duplicated date and task-matching semantics. The scope is intentionally narrow:

- add `dateUtils`
- add `taskMatchUtils`
- update the existing V1 helper modules to consume them
- keep business behavior unchanged

This step does not centralize record helpers or formatting helpers.

## Files Changed

- `src/features/trainingV1/utils/dateUtils.js`
- `src/features/trainingV1/utils/taskMatchUtils.js`
- `src/features/trainingV1/utils/index.js`
- `src/features/trainingV1/plans.js`
- `src/features/trainingV1/dashboardMetrics.js`
- `src/features/trainingV1/weeklyReport.js`
- `src/App.jsx`

## Utilities Added

### `src/features/trainingV1/utils/dateUtils.js`

Added:

- `toDateString(value)`
- `getTodayDateString()`
- `addDaysToDateString(dateString, days)`
- `getWeekStartDateString(value)`
- `getWeekDateRange(startDateString)`
- `isDateStringInRange(dateString, startDateString, endDateString)`
- `sortByDateAsc(items, getDate)`

### `src/features/trainingV1/utils/taskMatchUtils.js`

Added:

- `normalizeTaskText(value)`
- `normalizeTaskTarget(value)`
- `getTaskMatchKey(task)`
- `doTasksMatchByTextAndTarget(taskA, taskB)`
- `dedupeTasksByMatchKey(tasks)`

### `src/features/trainingV1/utils/index.js`

Added as a shared export surface for future utility adoption.

## Where Duplicated Logic Was Replaced

### `src/features/trainingV1/plans.js`

Replaced local duplicated logic with imports from utils:

- week task range generation now uses `addDaysToDateString(...)`
- plan-to-daily matching now uses `doTasksMatchByTextAndTarget(...)`
- shared text normalization now comes from `normalizeTaskText(...)`

Public helper API was preserved:

- `normalizeTaskText`
- `isPlanTaskAddedToToday`
- `getPlanTaskTodayStatus`
- `getPlanTaskDailyStatus`

### `src/features/trainingV1/dashboardMetrics.js`

Replaced local duplicated logic with imports from utils:

- local `getWeekDateRange(...)` implementation removed in favor of shared `dateUtils`
- local date stepping moved to `addDaysToDateString(...)`
- local date range checks moved to `isDateStringInRange(...)`
- local task match key generation moved to `getTaskMatchKey(...)`
- shared text normalization now comes from `normalizeTaskText(...)`

Return shapes were not changed.

### `src/features/trainingV1/weeklyReport.js`

Replaced local duplicated logic with imports from utils:

- local `toDateString(...)` removed
- local `addDays(...)` removed
- “today” string generation now uses `getTodayDateString(...)`
- week end calculation now uses `addDaysToDateString(...)`

### `src/App.jsx`

Minimal safe replacement only:

- local `getWeekStartDateString(...)` removed in favor of shared `dateUtils`
- local previous-day stepping removed in favor of `addDaysToDateString(..., -1)`

No business logic was moved out of `App.jsx`.

## Semantic Lock Confirmation

The following semantics were preserved:

- task matching remains `normalized text + normalized target`
- whitespace is trimmed
- text remains lowercase-normalized
- `null` / `undefined` target still behaves like empty string
- different targets still do not match
- date strings remain `YYYY-MM-DD`
- week range still covers 7 consecutive days
- local date semantics remain unchanged

## What Was Intentionally Not Centralized

Not centralized in this step:

- record key mapping helpers
- PB distance normalization helpers
- seconds / gap / percent formatting helpers
- plan template date helpers
- training defaults date helpers
- any write-path helpers

These were intentionally left for later steps to keep this PR low risk.

## Behavior Confirmation

- no product features added
- no app behavior changes intended
- no return shapes changed for existing V1 helper APIs
- no Daily Tasks semantics changed
- no Plan Tasks semantics changed

## Firestore / Write Safety Confirmation

- no Firestore schema changes
- no subcollections added
- no migrations introduced
- no new Firestore writes added
- `updateData` semantics unchanged
- `saveProfilePatch` semantics unchanged

## XP / Streak / Completion Confirmation

- XP / points behavior unchanged
- streak behavior unchanged
- `completedDays` behavior unchanged
- Daily Task completion remains independent from plan task completion

## Manual Verification Checklist

- [ ] Daily Tasks still add/complete/uncomplete normally
- [ ] Plan tab Add to Today still prevents equivalent duplicates
- [ ] Plan task Added / Not Added / Scheduled Today / Added from Other Date badges still render correctly
- [ ] Dashboard Today Execution numbers still render correctly
- [ ] Weekly Plan Adherence still renders correctly
- [ ] Weekly Report still shows the expected week range and daily execution summary
- [ ] No console/runtime errors from missing helper imports

## Smoke Checks Run

Local smoke checks were run manually with Node for:

- normalize text trim/case behavior
- null target equals empty target
- different target mismatch
- duplicate task dedupe by match key
- stable task match key generation
- 7-day week range
- date range inclusion true/false cases

Result:

- all smoke checks passed
