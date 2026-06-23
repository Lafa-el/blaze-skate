# Blaze Skate Training V1 Step 4: Progress Dashboard Enhancement

## Files Changed

- `src/App.jsx`
  - Added compact V1 read-only dashboard sections inside the existing `DashboardView`.
  - Added bilingual labels for the new V1 dashboard cards.
  - Added tab shortcut buttons to Goals and Plan without changing global navigation.
- `src/features/trainingV1/dashboardMetrics.js`
  - Added a read-only dashboard plan fallback helper.
  - Updated today and weekly plan summaries to use the same fallback behavior required by the UI.
  - Added read-only V1 plan consistency summary.
  - Updated PB lookup to prefer existing records when available, then fall back to V1 goal current time.
- `docs/training-v1-step4-dashboard.md`
  - Documents Step 4 scope, data sources, protected behavior, and manual verification.

## Dashboard Sections Added

Step 4 adds these sections to the existing Dashboard view:

- V1 Competition Goals summary
- V1 Training Plan summary
- Today Plan Tasks
- PB / Target Gap
- Plan Consistency

The existing Dashboard cards remain in place. Step 4 does not replace or rewrite `DashboardView`.

## Data Sources

### Competition Goals Summary

Reads:

- `data.competitionGoalsV1`
- `getGoalsSummary(data)`
- `getGoalProgress(goal)`
- `getGoalGap(goal)`

Behavior:

- Shows the top 3 active goals sorted by priority and competition date.
- Shows title, event or distance, current time, target time, gap, progress, and achieved state.
- Shows an empty state and a shortcut to the Goals tab when no active goals exist.

### Training Plan Summary

Reads:

- `data.trainingPlansV1`
- `data.activeTrainingPlanId`
- `getWeeklyPlanSummary(data, weekStartDate)`

Behavior:

- Uses `activeTrainingPlanId` when it resolves to a usable plan.
- Falls back to the first non-archived active or draft plan.
- Shows plan title, focus, start date, end date, completed tasks, total tasks, and completion percentage.
- Shows an empty state and a shortcut to the Plan tab when no plan exists.

### Today Plan Tasks

Reads:

- `data.trainingPlansV1`
- `data.activeTrainingPlanId`
- `getTodayPlanSummary(data, todayDate)`

Behavior:

- Shows today's V1 plan tasks from the selected dashboard plan.
- Shows task text, category, target, and completed state.
- This section is read-only. It does not complete tasks and does not import tasks to Daily Tasks.

### PB / Target Gap

Reads:

- Top active goals from `data.competitionGoalsV1`
- Existing PB record arrays such as `records`, `records777`, `records1000`, `records1500`, `recordsStart`, and `recordsLap`
- `getV1PBFromGoalOrRecords(data, distance)`
- `getGoalGap(goal)`
- `getGoalProgress(goal)`

Behavior:

- Prefers existing PB records for the target distance when available.
- Falls back to `goal.currentTimeSeconds` when PB records are unavailable.
- Shows target distance, current best, target time, gap, progress, and achieved state.
- Does not modify records logic.

### Plan Consistency

Reads:

- `data.trainingPlansV1`
- `data.activeTrainingPlanId`
- `getPlanConsistencySummary(data, weekStartDate)`

Behavior:

- Shows days this week with at least one completed V1 plan task.
- Shows total completed V1 plan tasks this week.
- This is labeled as plan consistency and does not replace the existing streak.

## Read-Only Dashboard Confirmation

All V1 Dashboard metrics are computed client-side from existing `data`.

Step 4 does not call `updateData(...)` from the new dashboard sections.

Step 4 does not persist dashboard metrics to Firestore.

## Firestore Confirmation

No new Firestore collections, subcollections, or documents were added.

The existing profile document remains the only V1 data location:

```txt
artifacts/blaze-skate-production/users/{uid}/profile/main
```

The dashboard reads existing root fields on that document, including:

- `competitionGoalsV1`
- `trainingPlansV1`
- `activeTrainingPlanId`
- existing PB record arrays

## Existing Features Protected

Step 4 intentionally does not change:

- Existing Daily Tasks completion logic.
- Existing XP and points logic.
- Existing streak logic.
- Existing Academy import logic.
- Existing Rewards and Shop logic.
- Existing PB records logic.
- Existing races logic.
- Existing Goals behavior from Step 2.
- Existing Plans behavior from Step 3.
- Existing activeTab navigation model.
- Existing Firestore path and single-document profile shape.

Step 4 does not implement auto-seeding, React Router, URL routes, Firestore subcollections, or data migration.

## Manual Verification Checklist

- Open the Dashboard and confirm existing Dashboard cards still render.
- Confirm V1 Training Progress appears without replacing old Dashboard content.
- With no goals, confirm the goals card shows the empty state and Add Goal shortcut.
- With active goals, confirm the top 3 active goals appear sorted by priority and competition date.
- Confirm goal progress, gap, and achieved state display correctly when current and target times exist.
- With no plan, confirm the plan card shows the empty state and Create Plan shortcut.
- With a plan, confirm title, focus, date range, completed tasks, total tasks, and percentage display.
- Confirm today's plan tasks appear read-only and do not have completion or import actions.
- Confirm PB / Target Gap prefers existing PB records when available.
- Confirm Plan Consistency shows completed V1 plan task days and task count for the current week.
- Complete a V1 plan task from the Plan tab and confirm Dashboard consistency updates after data refresh/state update.
- Confirm Dashboard interactions do not change XP, points, old streak, Daily Tasks completion, Academy imports, Rewards, PB records, or races.
- Run `npm run lint`.
- Run `npm run build`.
