# Blaze Skate Training V1.1 Dashboard Today Semantics

Date: 2026-06-24

## Problem Summary

The V1.1 Plan-to-Today workflow correctly lets users add any plan task into today's Daily Tasks list. However, the Dashboard section previously labeled `Today Plan Tasks` only showed plan tasks whose planned date was today.

That behavior was technically correct, but confusing:

- Daily Tasks could show three tasks for today.
- Dashboard task progress could count all three Daily Tasks.
- The plan-date Dashboard section could show only two tasks because the third task came from a different plan date.

## Updated Dashboard Semantics

The Dashboard now separates two concepts.

### Scheduled Plan Tasks Today

Labels:

- English: `Scheduled Plan Tasks Today`
- Chinese: `今日原定计划任务`

Meaning:

- Shows only V1 plan tasks whose plan date is today.
- Uses the active/fallback V1 plan.
- Remains read-only.
- Does not include plan tasks from past or future plan dates, even if they were manually added to Daily Tasks today.

### Today Execution

Labels:

- English: `Today Execution`
- Chinese: `今日执行`

Metrics:

- `Daily Tasks` / `今日任务`
  - `data.tasks.length`
- `Completed` / `已完成`
  - `data.tasks.filter(task => task.completed).length`
- `Added from Plan` / `来自计划`
  - current Daily Tasks that match any plan task in the active/fallback plan
- `Added from Other Dates` / `从其他日期加入`
  - current Daily Tasks that match plan tasks whose plan date is not today

The Today Execution card is read-only and does not add import or completion buttons.

## Helper Functions Added

Added in `src/features/trainingV1/dashboardMetrics.js`:

```js
getAllPlanTasksWithDates(plan)
getDailyTasksMatchedToPlanTasks(dailyTasks, plan)
getTodayExecutionSummary(data, todayString)
```

These helpers compute Dashboard-only semantics from existing client data.

## Matching Rule

Daily Tasks are matched to plan tasks by:

- normalized `text`
- normalized `target`

Normalization:

- trim whitespace
- ignore case
- treat `null` / `undefined` target as an empty string

The implementation reuses the existing `normalizeTaskText` helper from `src/features/trainingV1/plans.js`.

Match results are not stored in Firestore.

## Data Safety Confirmation

No schema changes were made.

Unchanged:

- Firestore path:
  - `artifacts/blaze-skate-production/users/{uid}/profile/main`
- Daily Tasks:
  - `data.tasks`
- V1 plans:
  - `data.trainingPlansV1`
- Active plan:
  - `data.activeTrainingPlanId`

No Firestore subcollections were added.

No data migration was introduced.

No persisted task-match status was added.

## XP / Streak / completedDays Confirmation

This change does not modify:

- Daily Task completion semantics
- XP / points logic
- old streak logic
- `completedDays`
- plan task completion behavior
- Academy import logic
- Shop / Rewards logic
- PB records logic
- races logic

Plan task completion still does not award points or modify `completedDays`.

Add to Today remains manual and still appends only to `data.tasks`.

## Manual Verification Checklist

- [ ] Create or use a V1 plan with a task scheduled for today.
- [ ] Add that task to Today from the Plan tab.
- [ ] Confirm Daily Tasks shows the imported task.
- [ ] Confirm Dashboard task progress includes the imported task.
- [ ] Confirm `Scheduled Plan Tasks Today` shows the task because its plan date is today.
- [ ] Add a plan task from a past or future plan date to Today.
- [ ] Confirm Daily Tasks shows the added task.
- [ ] Confirm Dashboard task progress includes the added task.
- [ ] Confirm `Scheduled Plan Tasks Today` does not show the other-date task.
- [ ] Confirm `Today Execution` increments `Added from Plan`.
- [ ] Confirm `Today Execution` increments `Added from Other Dates`.
- [ ] Confirm adding to Today does not complete the Daily Task.
- [ ] Confirm adding to Today does not award XP / points.
- [ ] Confirm adding to Today does not modify old streak or `completedDays`.
- [ ] Confirm English labels render correctly.
- [ ] Confirm Chinese labels render correctly.

## Validation

Run:

```text
npm run lint
npm run build
```

There is no `npm run typecheck` script in the current package configuration.
