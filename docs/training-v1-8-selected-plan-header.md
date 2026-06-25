# Blaze Skate Training V1.8 Step 1: SelectedPlanHeader Extraction

## Summary

This step extracts only the selected training plan header / summary presentation JSX from `src/App.jsx` into a focused component while preserving all existing behavior.

## Files Changed

- `src/App.jsx`
- `src/features/plans/SelectedPlanHeader.jsx`
- `docs/training-v1-8-selected-plan-header.md`

## Component Extracted

### `SelectedPlanHeader`

Location:

- `src/features/plans/SelectedPlanHeader.jsx`

Purpose:

- Renders the selected plan hero summary and the compact weekly adherence summary area.

Handled UI:

- selected plan title
- plan status display
- focus text
- start date / end date
- weekly completion summary
- linked goal title
- active plans count text
- edit button
- archive button
- weekly report button
- compact weekly adherence summary cards / empty states

## Props / Callback Boundary

The extracted component receives display data and callbacks only:

- `plan`
- `lang`
- `t`
- `tc`
- `linkedGoal`
- `completion`
- `weeklyAdherenceSummary`
- `activePlansCount`
- `onOpenWeeklyReport`
- `onEditPlan`
- `onArchivePlan`

The component does not:

- call `updateData`
- call `saveProfilePatch`
- call Firebase
- mutate `plan`
- change weekly adherence calculation
- change Weekly Report behavior
- modify Daily Tasks
- award XP

## What Remains In `App.jsx`

Intentionally left in `App.jsx`:

- selected plan state
- linked goal lookup
- weekly adherence computation
- weekly completion computation
- weekly report modal state
- archive / edit callback implementation
- selected plan task list
- `SelectedPlanTaskItem` usage
- all `updateData` / `saveProfilePatch` calls
- all Firebase orchestration

## Behavior Confirmation

- No behavior changed
- Firestore writes were unchanged
- XP / points behavior was unchanged
- streak behavior was unchanged
- `completedDays` behavior was unchanged
- Weekly Report behavior was unchanged
- archive / edit behavior was unchanged

## Smoke Coverage Confirmation

- Existing `npm run smoke:training` coverage remains part of validation for this refactor

## Manual Verification Checklist

- selected plan header still renders in the selected plan panel
- title / status / focus still display correctly
- start/end dates still display correctly
- linked goal still displays correctly
- weekly completion text still displays correctly
- weekly adherence summary still displays correctly
- Weekly Report button still opens the existing flow
- Edit button still opens the existing edit flow
- Archive button still triggers the existing archive flow
- no visible regression in summary spacing on mobile
