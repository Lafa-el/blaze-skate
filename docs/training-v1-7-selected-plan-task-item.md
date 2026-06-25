# Blaze Skate Training V1.7 Step 2: SelectedPlanTaskItem Extraction

## Summary

This step extracts only the selected training plan task item presentation JSX from `src/App.jsx` into a focused component while preserving all existing behavior.

## Files Changed

- `src/App.jsx`
- `src/features/plans/SelectedPlanTaskItem.jsx`
- `docs/training-v1-7-selected-plan-task-item.md`

## Component Extracted

### `SelectedPlanTaskItem`

Location:

- `src/features/plans/SelectedPlanTaskItem.jsx`

Purpose:

- Renders a single task row inside the selected Training Plan detail panel.

Handled UI:

- task text
- task target
- task description
- category / duration / intensity badges
- completed state icon and styling
- Scheduled Today / Added / Added from Other Date / Not Added status display
- completed timestamp display
- edit button
- Add to Today button / Added disabled state

## Props / Callback Boundary

The extracted component receives display data and callbacks only:

- `task`
- `lang`
- `t`
- `tc`
- `taskDailyStatus`
- `onToggleComplete`
- `onAddToToday`
- `onEdit`

The component does not:

- call `updateData`
- call `saveProfilePatch`
- call Firebase
- mutate `task`
- mutate `plan`

## What Remains In `App.jsx`

Intentionally left in `App.jsx`:

- selected plan state
- day grouping and selected plan panel layout
- `getPlanTaskDailyStatus(...)` call site
- plan task completion callback
- Add to Today logic
- duplicate prevention logic
- edit task modal opening
- all `updateData` / `saveProfilePatch` calls
- all Firebase orchestration

## Behavior Confirmation

- No behavior changed
- Firestore writes were unchanged
- XP / points behavior was unchanged
- streak behavior was unchanged
- `completedDays` behavior was unchanged
- Add to Today semantics were unchanged
- duplicate prevention semantics were unchanged
- plan task completion semantics were unchanged

## Smoke Coverage Confirmation

- Existing `npm run smoke:training` coverage remains part of validation for this refactor

## Manual Verification Checklist

- Selected plan task items still render inside the selected plan panel
- complete / uncomplete still toggles correctly
- edit task still opens the existing edit flow
- Add to Today still uses the existing callback
- already-added tasks still show the disabled Added state
- status badges still show the same labels and colors
- completed timestamp still renders in the correct locale
- no visual regression in task row spacing on mobile
