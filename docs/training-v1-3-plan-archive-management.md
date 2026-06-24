# Blaze Skate Training V1.3 Step 2: Training Plan Archive Management

## Summary

This change improves Training Plan management by separating current plans from archived plans, adding archive confirmation, and allowing archived plans to be restored safely.

All behavior remains additive on top of the existing `trainingPlansV1` array and `activeTrainingPlanId` field.

## Files Changed

- `src/features/trainingV1/plans.js`
- `src/App.jsx`
- `docs/training-v1-3-plan-archive-management.md`

## Helper Functions Added

In `src/features/trainingV1/plans.js`:

- `isPlanArchived(plan)`
- `getArchivedTrainingPlans(plans)`
- `getNonArchivedTrainingPlans(plans)`
- `restoreTrainingPlan(plan)`

Behavior:

- archived means `status === 'archived'`
- restore returns a new plan object
- restore sets `status: 'draft'`
- restore updates `updatedAt`
- original objects are not mutated

## Current vs Archived Plan Behavior

Training Plan tab now separates plan management into two sections:

- `Current Plans`
- `Archived Plans`

Current Plans:

- includes `draft`, `active`, and `completed`
- excludes archived plans
- still supports selecting the current display plan

Archived Plans:

- shown in a secondary collapsible section
- archived plans are visually muted
- each archived plan shows a Restore action

Empty state:

- `No archived plans.`
- `没有已归档计划。`

## Archive Confirmation Behavior

Before archiving a plan, the app now asks for confirmation.

English:

- `Archive this training plan? You can restore it later.`

Chinese:

- `要归档这个训练计划吗？之后可以恢复。`

If the user cancels, no write occurs.

## Restore Behavior

Archived plans can now be restored with:

- `Restore`
- `恢复`

Restore behavior:

- uses `restoreTrainingPlan(plan)`
- persists back into `trainingPlansV1`
- restored plans return as `draft`
- restore does not automatically overwrite a valid non-archived current active plan

Feedback:

- recently restored plans can show a `Restored` / `已恢复` badge in the Current Plans section

## activeTrainingPlanId Safety Rules

When archiving the active plan:

- the plan is archived
- the next available non-archived plan becomes `activeTrainingPlanId`
- if no non-archived plan exists, `activeTrainingPlanId` becomes `null`

When restoring a plan:

- keep the current active plan if it still exists and is non-archived
- otherwise set the restored plan as `activeTrainingPlanId`

This keeps the current plan pointer valid and prevents it from staying on an archived plan when no active non-archived plan remains.

## Compatibility Confirmation

- No Firestore schema changes were made.
- No new Firestore fields were added.
- No subcollections were introduced.
- No migrations were introduced.
- Existing `trainingPlansV1` and `activeTrainingPlanId` fields remain the source of truth.
- XP / points behavior was not changed.
- Streak behavior was not changed.
- `completedDays` behavior was not changed.
- Daily task completion semantics were not changed.
- Academy import logic was not changed.
- Shop / Rewards logic was not changed.
- PB records logic was not changed.
- Races logic was not changed.

## Manual Verification Checklist

- Open Training Plan tab with multiple current plans and confirm the Current Plans section lists only non-archived plans.
- Confirm the Archived Plans section lists only archived plans.
- Confirm the Archived Plans empty state appears when no archived plans exist.
- Archive a non-active plan and confirm it moves into Archived Plans.
- Archive the active plan and confirm another non-archived plan becomes current if one exists.
- Archive the only remaining non-archived plan and confirm `activeTrainingPlanId` falls back to `null`.
- Cancel the archive confirmation and confirm no data changes are written.
- Restore an archived plan and confirm it returns with `status: draft`.
- Restore a plan while a valid non-archived active plan exists and confirm the current active plan stays unchanged.
- Restore a plan when no valid non-archived active plan exists and confirm the restored plan becomes active.
- Confirm archived plan cards remain visually muted and Restore uses a secondary action style.

## Validation

Run:

- `npm run lint`
- `npm run build`

There is no `npm run typecheck` script in this project, so typecheck was not run.
