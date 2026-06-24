# Blaze Skate Training V1.1 Step 2 Plan Task Added Status

Date: 2026-06-24

## Summary

V1.1 Step 2 improves the Plan tab so each plan task clearly shows whether it has already been added to today's Daily Tasks.

This step does not change Firestore schema, route structure, Daily Task completion semantics, XP / points logic, old streak logic, `completedDays`, Academy import logic, Shop / Rewards logic, PB records logic, races logic, or Lindsay defaults behavior.

## Files Changed

- `src/features/trainingV1/plans.js`
  - Added `getPlanTaskDailyStatus(planTask, dayDateString, dailyTasks, todayString)`.
- `src/App.jsx`
  - Added compact Plan task badges for scheduled/added status.
  - Updated already-added feedback copy.
  - Keeps Add to Today disabled when an equivalent Daily Task already exists.
- `docs/training-v1-1-plan-task-added-status.md`
  - Documents this Step 2 polish.

## Added Status Definitions

`getPlanTaskDailyStatus` returns:

```js
{
  isAddedToToday: boolean,
  isScheduledToday: boolean,
  isAddedFromOtherDate: boolean
}
```

Definitions:

- `isAddedToToday`
  - An equivalent task exists in `data.tasks`.
- `isScheduledToday`
  - The plan task's day date equals the current date string.
- `isAddedFromOtherDate`
  - The task is added to today's Daily Tasks and the plan task's day date is not today.

These values are computed client-side only and are not stored in Firestore.

## Matching Rule

Matching uses the existing normalized text + normalized target rule:

- trim whitespace
- ignore case
- treat `null` / `undefined` target as an empty string
- do not require new IDs
- do not add schema fields

The helper reuses `isPlanTaskAddedToToday`, which uses `normalizeTaskText`.

## UI Behavior

Plan task cards now show compact badges:

- English:
  - `Scheduled Today`
  - `Added`
  - `Added from Other Date`
  - `Not Added`
- Chinese:
  - `今日原定`
  - `已加入`
  - `从其他日期加入`
  - `未加入`

Display rules:

- If `dayDateString === todayString`, show `Scheduled Today` / `今日原定`.
- If an equivalent Daily Task exists, show `Added` / `已加入`.
- If an equivalent Daily Task exists and `dayDateString !== todayString`, show `Added from Other Date` / `从其他日期加入`.
- If no equivalent Daily Task exists, show `Not Added` / `未加入`.

Add to Today behavior:

- Not added:
  - button remains enabled.
- Already added:
  - button is disabled and shows `Added` / `已加入`.
- If an already-added task is somehow submitted again:
  - no duplicate is appended.
  - the app shows:
    - English: `This task is already in today's task list.`
    - Chinese: `这个任务已经在今日任务中。`

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

No persisted Added status field was added.

## XP / Streak / completedDays Confirmation

This step does not change:

- Daily Task completion semantics
- XP / points logic
- old streak logic
- `completedDays`
- plan task completion behavior

Add to Today still:

- appends only to `data.tasks`
- does not complete the Daily Task
- does not mark the plan task completed
- does not award points
- does not modify `completedDays`

## Manual Verification Checklist

- [ ] Open the Plan tab.
- [ ] Find a plan task scheduled for today and not added to Daily Tasks.
- [ ] Confirm it shows `Scheduled Today` / `今日原定`.
- [ ] Confirm it shows `Not Added` / `未加入`.
- [ ] Click Add to Today.
- [ ] Confirm the task appears in Daily Tasks.
- [ ] Confirm the plan task now shows `Added` / `已加入`.
- [ ] Confirm the Add to Today button is disabled and less prominent.
- [ ] Find a plan task from a past or future date.
- [ ] Confirm it shows `Not Added` / `未加入` before import.
- [ ] Add it to Today.
- [ ] Confirm it shows `Added from Other Date` / `从其他日期加入`.
- [ ] Confirm no duplicate is appended if Add to Today is triggered again.
- [ ] Confirm XP / points do not change after Add to Today.
- [ ] Confirm old streak and `completedDays` do not change after Add to Today.
- [ ] Confirm plan task completion remains separate from Daily Task completion.
- [ ] Confirm completed plan task status remains visually clear.

## Validation

Run:

```text
npm run lint
npm run build
```

There is no `npm run typecheck` script in the current package configuration.
