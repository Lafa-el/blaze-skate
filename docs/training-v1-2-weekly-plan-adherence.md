# Blaze Skate Training V1.2 Step 2: Weekly Plan Adherence

## Summary

This change adds a read-only Weekly Plan Adherence report to the Dashboard V1 area and a compact weekly adherence summary to the selected Training Plan view.

All metrics are computed client-side from existing `trainingPlansV1` and `data.tasks`. No Firestore schema changes were made, and no existing task, XP, streak, or `completedDays` behavior was changed.

## Files Changed

- `src/features/trainingV1/dashboardMetrics.js`
- `src/App.jsx`
- `docs/training-v1-2-weekly-plan-adherence.md`

## Helper Functions Added

In `src/features/trainingV1/dashboardMetrics.js`:

- `getWeekDateRange(startDateString)`
- `getPlanTasksForDateRange(plan, startDateString, endDateString)`
- `getWeeklyPlanAdherenceSummary(data, weekStartDateString, planOverride = null)`

## Metric Definitions

Weekly adherence uses a selected 7-day window.

- `totalPlanTasks`
  - Total plan tasks scheduled inside the selected week.
- `completedPlanTasks`
  - Plan tasks in that week where `completed === true`.
- `addedToTodayTasks`
  - Weekly plan tasks that match current `data.tasks` by normalized task text + normalized target.
- `dailyTasksTotal`
  - `data.tasks.length`
- `dailyTasksCompleted`
  - `data.tasks.filter(task => task.completed).length`
- `planCompletionPercent`
  - `completedPlanTasks / totalPlanTasks`
- `dailyCompletionPercent`
  - `dailyTasksCompleted / dailyTasksTotal`
- `adherencePercent`
  - Currently the same as `planCompletionPercent`

`adherencePercent` is intentionally simple in V1.2 Step 2 and is documented as:

- `completedPlanTasks / totalPlanTasks`

## Matching Rule

Plan-to-daily matching remains read-only and client-side only.

Match key:

- normalized task text
- normalized task target

Normalization rules:

- trim whitespace
- lowercase
- `null` / `undefined` target becomes empty string

Duplicate daily task matches are de-duplicated when counting `addedToTodayTasks`, so repeated daily tasks do not overcount the weekly adherence summary.

## Dashboard Behavior

The Dashboard V1 area now includes a compact read-only card:

- Weekly Plan Adherence
- Plan Tasks
- Completed Plan Tasks
- Added to Today
- Daily Tasks Completed
- Adherence

Fallback states:

- No active/fallback plan:
  - `No active training plan for this week.`
  - `本周没有可用的训练计划。`
- Plan exists but no tasks scheduled in the selected week:
  - `No plan tasks scheduled this week.`
  - `本周没有安排计划任务。`

The Dashboard remains read-only.

## Plan Tab Behavior

The selected Training Plan summary area now includes a compact Weekly Adherence section showing:

- total plan tasks
- completed plan tasks
- completion percentage

This section is also read-only and does not add any new actions.

For the selected Plan view, the summary can use the currently selected plan directly so the numbers remain aligned with the plan the user is viewing.

## Edge Cases Handled

- no active plan
- archived active plan fallback behavior
- empty `trainingPlansV1`
- missing `days`
- missing `tasks`
- malformed or missing dates
- zero denominator percentage cases
- duplicate daily task matches

## Compatibility Confirmation

- No Firestore schema changes were made.
- No new Firestore fields were added.
- No adherence report data is written to Firestore.
- No plan task data is modified by the report.
- No daily task data is modified by the report.
- XP / points behavior was not changed.
- Streak behavior was not changed.
- `completedDays` behavior was not changed.

## Manual Verification Checklist

- Open Dashboard with an active training plan and confirm the Weekly Plan Adherence card appears.
- Confirm the card shows:
  - plan task total
  - completed plan task total
  - added-to-today total
  - completed daily tasks total
  - adherence percentage
- Confirm the empty state appears when there is no active/fallback plan.
- Confirm the empty state appears when a plan exists but the selected week has zero scheduled tasks.
- Open the Training Plan tab and confirm the selected plan summary shows the compact Weekly Adherence section.
- Confirm the Plan summary numbers match the selected plan being viewed.
- Confirm no buttons or write actions were added to the adherence UI.
- Confirm adding tasks to Today still behaves exactly as before.
- Confirm completing daily tasks still behaves exactly as before.
- Confirm XP, streak, and `completedDays` behavior remain unchanged.

## Validation

Run:

- `npm run lint`
- `npm run build`

There is no `npm run typecheck` script in this step, so no typecheck was run.
