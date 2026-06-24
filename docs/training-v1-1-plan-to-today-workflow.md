# Blaze Skate Training V1.1 Step 1 Plan-to-Today Workflow

Date: 2026-06-24

## Summary

V1.1 Step 1 polishes the manual Plan-to-Today workflow so users can see when a plan task has already been added to today's Daily Tasks.

This step does not change Firestore schema, route structure, Daily Task completion semantics, XP / points logic, old streak logic, Academy import logic, Shop / Rewards logic, PB records logic, races logic, or Lindsay defaults behavior.

## Files Changed

- `src/features/trainingV1/plans.js`
  - Added pure client-side helpers for matching plan tasks to today's Daily Tasks.
- `src/App.jsx`
  - Uses the helpers for Add to Today duplicate prevention.
  - Shows Added status for incomplete plan tasks that already exist in Daily Tasks.
  - Adds a read-only Dashboard V1 Today Workflow card.
  - Adds English and Chinese copy for the new status and Dashboard labels.
- `docs/training-v1-1-plan-to-today-workflow.md`
  - Documents this V1.1 workflow polish.

## Helper Functions Added

Added in `src/features/trainingV1/plans.js`:

```js
normalizeTaskText(value)
isPlanTaskAddedToToday(planTask, dailyTasks)
getPlanTaskTodayStatus(planTask, dailyTasks)
```

Status values:

- `not_added`
- `added_to_today`

These status values are computed client-side only and are not stored in Firestore.

## Matching Rule for Added Status

Plan task matching is based on:

- normalized `text`
- normalized `target`

Normalization:

- `String(value ?? '')`
- trim whitespace
- convert to lowercase
- treat `null` / `undefined` target as an empty string

An incomplete plan task is considered already added to today when an existing Daily Task has the same normalized `text` and normalized `target`.

Empty plan task text is never treated as already added.

## Plan View Behavior

For each incomplete plan task:

- If no equivalent Daily Task exists:
  - show `Add to Today` / `加入今日任务`
- If an equivalent Daily Task exists:
  - show `Added` / `已加入`
  - disable the import action

Clicking Add to Today still:

- appends only to `data.tasks`
- does not award points
- does not modify `completedDays`
- does not change old streak
- does not mark the plan task completed

If the user triggers Add to Today and an equivalent task already exists, the app does not append a duplicate and shows the existing duplicate feedback message.

## Dashboard Today Workflow Metrics

Added a compact read-only Dashboard V1 card:

- `Today Workflow` / `今日执行流程`
- `Plan Tasks Today` / `今日计划任务`
- `Added to Today` / `已加入今日任务`
- `Daily Tasks Completed` / `已完成今日任务`

Metric sources:

- Plan Tasks Today:
  - count of V1 plan tasks scheduled for the current date from the active/fallback plan summary
- Added to Today:
  - count of today's plan tasks that match existing `data.tasks` by normalized `text` and `target`
- Daily Tasks Completed:
  - count of existing `data.tasks` where `completed === true`

The Dashboard card is read-only and does not write to Firestore.

## Empty States and Guidance Copy

When there are no plan tasks today:

- English: `No plan tasks scheduled for today.`
- Chinese: `今天没有安排计划任务。`

When there are plan tasks today but none have been added to Daily Tasks:

- English: `Add plan tasks to Today to execute them in the Daily Tasks list.`
- Chinese: `把计划任务加入今日任务后，就可以在今日任务列表中执行。`

## Data Safety Confirmation

No schema changes were made.

Unchanged:

- Firestore path:
  - `artifacts/blaze-skate-production/users/{uid}/profile/main`
- V1 plans:
  - `data.trainingPlansV1`
- Daily Tasks:
  - `data.tasks`
- Active plan:
  - `data.activeTrainingPlanId`

No Firestore subcollections were added.

No data migration was introduced.

No new persisted status field was added for `added_to_today`.

## XP / Streak / completedDays Confirmation

This step does not change:

- Daily Task completion semantics
- XP / points logic
- old streak logic
- `completedDays`
- plan task completion behavior

Plan task completion remains separate from Daily Task completion and does not award points.

## Manual Verification Checklist

- [ ] Open the Plan tab.
- [ ] Find an incomplete plan task that has not been added to Daily Tasks.
- [ ] Confirm the task shows `Add to Today`.
- [ ] Click `Add to Today`.
- [ ] Confirm the task appears in Daily Tasks.
- [ ] Confirm the plan task now shows `Added`.
- [ ] Confirm clicking again does not append a duplicate.
- [ ] Confirm the Daily Task is not completed automatically.
- [ ] Confirm XP / points do not change after Add to Today.
- [ ] Confirm old streak / `completedDays` do not change after Add to Today.
- [ ] Complete the Daily Task through the existing Daily Tasks flow.
- [ ] Confirm XP / streak behavior follows the existing Daily Task completion rules.
- [ ] Open Dashboard.
- [ ] Confirm Today Workflow shows Plan Tasks Today, Added to Today, and Daily Tasks Completed.
- [ ] Confirm Dashboard Today Workflow has no buttons and performs no writes.
- [ ] Confirm English and Chinese labels render correctly.

## Validation

Run:

```text
npm run lint
npm run build
```

There is no `npm run typecheck` script in the current package configuration.
