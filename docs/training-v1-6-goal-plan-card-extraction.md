# Blaze Skate Training V1.6 Step 2: GoalCard and PlanCard Extraction

## Summary

This step extracts repeated read-only card presentation JSX from `src/App.jsx` into focused feature components while keeping all business logic, state, callbacks, Firebase usage, and Firestore writes in `App.jsx`.

## Files Changed

- `src/App.jsx`
- `src/features/goals/GoalCard.jsx`
- `src/features/plans/PlanCard.jsx`

## Components Extracted

### `GoalCard`

Location:

- `src/features/goals/GoalCard.jsx`

Purpose:

- Renders the compact goal card used in the Goals tab for active and archived goals.

Inputs:

- `goal`
- `data`
- `t`
- `tc`
- `isArchived`
- `onViewDetails`
- `onEdit`
- `onArchive`

Behavior boundary:

- Reads PB/current performance using existing goal helpers.
- Displays goal metadata, current performance, target time, gap, progress, and action buttons.
- Does not call `updateData`.
- Does not call Firebase.
- Does not mutate goal data.
- Does not overwrite `goal.currentTimeSeconds`.

### `PlanCard`

Location:

- `src/features/plans/PlanCard.jsx`

Purpose:

- Renders the compact plan list cards used in the Training Plan tab for current and archived plans.

Inputs:

- `plan`
- `t`
- `tc`
- `isActive`
- `isArchived`
- `isSelected`
- `isRecentlyRestored`
- `onSelect`
- `onSetActive`
- `onRestore`

Behavior boundary:

- Displays title, status, start date, focus, active/restored badges, and list-level actions.
- Does not call `updateData`.
- Does not call Firebase.
- Does not mutate plan data.

## Props / Callback Boundary

Business actions remain in `App.jsx`:

- Goal detail open
- Goal edit open
- Goal archive
- Plan selection
- Archived plan restore
- Active plan switching logic
- All `updateData` / `saveProfilePatch` calls
- All Firebase orchestration

Extracted components only render UI and invoke callbacks passed down from `App.jsx`.

## What Remains In `App.jsx`

Intentionally left in `App.jsx` for this step:

- Goals tab filtering, sorting, and modal state
- Training Plan tab selection logic
- Selected plan hero/summary card
- Weekly adherence summary logic
- Plan task list rendering
- Add to Today workflow
- Archive / restore implementation
- `activeTrainingPlanId` safety rules
- Firestore reads/writes and app orchestration

## Behavior Confirmation

- No product behavior changed.
- No Firestore write paths changed.
- No Firestore schema changes were made.
- No new Firestore writes were added.
- XP / points behavior was unchanged.
- Streak behavior was unchanged.
- `completedDays` behavior was unchanged.
- PB records remain read-only in extracted goal cards.

## Manual Verification Checklist

- Goals tab still renders active goal cards.
- Archived goals still expand/collapse and render correctly.
- Goal card View Details still opens Goal Detail Modal.
- Goal card Edit still opens goal edit flow.
- Goal card Archive still triggers existing archive flow.
- Training Plan tab still renders current plan list.
- Current plan View Plan still switches selected plan.
- Active/restored badges still display correctly.
- Archived plans still render in archived section.
- Restore still triggers existing restore flow.
- Selected plan summary, tasks list, and Add to Today flow still behave the same.
- No visible regression in spacing, card appearance, or mobile wrapping.
