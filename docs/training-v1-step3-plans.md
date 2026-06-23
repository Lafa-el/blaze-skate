# Blaze Skate Training V1 Step 3: Training Plan View

## Files Changed

- `src/constants/app.js`
  - Added the `TABS.PLANS` in-app tab id.
- `src/App.jsx`
  - Added the Training Plan tab navigation entry.
  - Added `TrainingPlanView`.
  - Added plan create/edit/archive modal support.
  - Added plan task add/edit/complete support.
  - Added explicit plan task import to existing Daily Tasks.

## New activeTab Value

Step 3 adds one in-app tab value:

```js
plans
```

The app still does not use React Router. The Training Plan view renders from the existing `activeTab` state, the same way the existing Dashboard, Tasks, Academy, Goals, Data, and Shop views render.

## How trainingPlansV1 Is Stored

Training plans are stored as an array on the existing profile document:

```txt
artifacts/blaze-skate-production/users/{uid}/profile/main
```

Field:

```js
trainingPlansV1: []
```

No Firestore subcollections were added. No migration was added. Plan writes continue to flow through `updateData(...)`, which preserves the existing single-document profile model.

Each plan keeps its own `days` array. Each day keeps its own plan task list. These plan tasks are separate from the existing `data.tasks` Daily Tasks list until the user explicitly imports one.

## How activeTrainingPlanId Works

The selected/current Training Plan is stored on the same profile document:

```js
activeTrainingPlanId: string | null
```

Display behavior:

- If `activeTrainingPlanId` points to a non-archived plan, that plan is displayed.
- If no active id is set, the UI falls back to the first non-archived active or draft plan.
- If multiple non-archived plans exist, the user can select the current plan.
- Selecting a plan only updates `activeTrainingPlanId`; it does not archive or modify other plans.

## Add, Edit, and Archive Plan

Plan creation uses `createTrainingPlan(input)` from `src/features/trainingV1/plans.js`.

Plan editing uses `updateTrainingPlan(plan, patch)`.

Plan archiving uses `archiveTrainingPlan(plan)`.

Validation:

- `title` is required.
- `startDate` is required.
- `endDate` is required.
- `endDate` must not be before `startDate`.
- `status` must be `draft` or `active`.

On create:

- The new plan is appended to `trainingPlansV1`.
- If no `activeTrainingPlanId` exists, the new plan becomes active.

On archive:

- The plan is marked archived, not deleted.
- If the archived plan was active, `activeTrainingPlanId` moves to the next non-archived plan id or `null`.

## Add, Edit, and Complete Plan Task

Plan task creation uses `createPlanTask(input)`.

Plan task editing uses `updatePlanTask(task, patch)`.

Plan task completion uses `completePlanTask(task, completed)`.

Validation:

- `date` is required.
- `text` is required.
- `category` must be one of `ice`, `dryland`, `strength`, `running`, `mobility`, `recovery`, `video`, `mental`, `competition`, or `other`.
- `durationMinutes` must be a positive number when provided.
- `intensity` must be blank, `low`, `medium`, or `high`.

Plan task completion is V1-plan-only state. It does not change existing XP, Daily Tasks completion, completed days, or streak behavior.

## Manual Add to Today

Each incomplete plan task has an explicit Add to Today action.

Behavior:

- Uses `convertPlanTaskToDailyTask(planTask)`.
- Appends the converted task to existing `data.tasks`.
- Persists through `updateData({ tasks: updatedTasks })`.
- Does not mark the plan task completed.
- Does not award points.
- Does not affect streak.
- Does not auto-import any plan task.

The UI checks for a simple duplicate by matching `text` and `target` before appending to `data.tasks`.

## Existing Features Protected

Step 3 intentionally does not change:

- Existing Daily Tasks completion logic.
- Existing XP and points logic.
- Existing streak logic.
- Existing Academy import logic.
- Existing Rewards and Shop logic.
- Existing PB records logic.
- Existing races logic.
- Existing Goals behavior from Step 2, except plans can optionally link to active goals by `goalId`.
- Existing Firestore path or document shape.
- Existing navigation model.

Step 3 does not implement Dashboard V1 enhancement, auto-seeding, React Router, URL routes, subcollections, or historical data migration.

## Manual Verification Checklist

- Open the app and confirm the Plan tab is visible in the bottom navigation.
- With no plans, confirm the empty state shows and no default plan is auto-created.
- Create a plan with title, focus, start date, end date, and draft or active status.
- Confirm the first created plan becomes selected when no active plan existed.
- Create a second plan and confirm the plan selector changes `activeTrainingPlanId`.
- Edit a plan and confirm the updated fields persist.
- Archive the selected plan and confirm another non-archived plan is selected, or the active id becomes empty when none remain.
- Add a plan task with date, text, category, duration, and intensity.
- Edit a plan task and confirm it can move to another date.
- Complete and uncomplete a plan task and confirm XP, points, Daily Tasks, and streak do not change.
- Use Add to Today on an incomplete plan task and confirm it appears in Daily Tasks.
- Try Add to Today again for the same text and target and confirm duplicate import is prevented.
- Confirm Dashboard, Tasks, Academy, Goals, Data, Shop, Profile, records, races, rewards, and existing Firebase data still load.
