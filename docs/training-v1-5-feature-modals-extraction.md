# Blaze Skate Training V1.5 Feature Modals Extraction

Date: 2026-06-24

## Summary

This change extracts the two read-only feature modals from `src/App.jsx` into feature-specific component files:

- Goal Detail Modal
- Weekly Report Modal

The refactor preserves existing modal state ownership, business callbacks, helper usage, and Firestore write behavior in `App.jsx`.

## Files Changed

- `src/App.jsx`
- `src/features/goals/GoalDetailModal.jsx`
- `src/features/weeklyReport/WeeklyReportModal.jsx`
- `docs/training-v1-5-feature-modals-extraction.md`

## Components Extracted

### GoalDetailModal

New file:

- `src/features/goals/GoalDetailModal.jsx`

Responsibilities:

- render goal overview
- render current performance
- render target gap section
- render progress history
- render recent PB rows
- render close / edit / archive buttons through callbacks

### WeeklyReportModal

New file:

- `src/features/weeklyReport/WeeklyReportModal.jsx`

Responsibilities:

- render report header
- render training plan summary
- render weekly adherence section
- render daily execution summary
- render goals / target gap summary
- render recent PB progress
- render print and close actions through callbacks

## Props / Callback Boundary

### GoalDetailModal props

- `isOpen`
- `goal`
- `data`
- `t`
- `tc`
- `onClose`
- `onEditGoal`
- `onArchiveGoal`
- `formatGoalSeconds`
- `formatSignedGoalSeconds`

Notes:

- helper reads remain pure
- no Firebase calls
- no Firestore writes
- edit and archive are still initiated by `App.jsx` callbacks

### WeeklyReportModal props

- `isOpen`
- `reportData`
- `athleteDisplayName`
- `t`
- `tc`
- `onClose`
- `onPrint`
- `formatGoalSeconds`
- `formatSignedGoalSeconds`

Notes:

- report remains read-only
- print is still triggered through the parent callback
- no report snapshots are stored
- no Firebase calls
- no Firestore writes

## What Was Intentionally Left In App.jsx

Kept in `App.jsx`:

- modal open/close state
- selected goal id state
- weekly report open state
- weekly report data computation
- selected goal lookup from current data
- edit goal callback
- archive goal callback
- `window.print()` callback wiring
- all existing `updateData(...)` and `saveProfilePatch(...)` logic

Reason:

- this step is limited to modal extraction only
- parent ownership of state and side effects keeps the refactor low risk

## Behavior Confirmation

Confirmed intent of this refactor:

- no product features added
- no app behavior changed
- no UI redesign introduced
- modal rendering moved, but behavior remains parent-controlled

## Firestore / Data Safety Confirmation

Confirmed:

- Firestore path unchanged
- no new write paths
- no new Firestore writes
- no schema changes
- no subcollections
- no migrations
- `updateData(...)` semantics unchanged
- `saveProfilePatch(...)` semantics unchanged

## XP / Streak / Completion Confirmation

Confirmed unchanged:

- Daily Tasks logic
- XP / points logic
- streak logic
- `completedDays` behavior
- Academy import behavior
- PB record add/delete behavior
- Shop / Rewards logic
- races logic

## Manual Verification Checklist

- Goal Detail Modal opens from Goals view
- Goal Detail Modal closes normally
- Goal Detail Modal edit button still opens goal edit flow
- Goal Detail Modal archive button still triggers archive flow
- Goal Detail Modal remains read-only for PB data
- Weekly Report button still opens report from Dashboard
- Weekly Report button still opens report from Plan summary
- Weekly Report closes normally
- Weekly Report print button still opens browser print dialog
- Weekly Report empty states still render correctly
- no new console errors appear

## Validation

Run:

- `npm run lint`
- `npm run build`

There is no `npm run typecheck` script in this project, so typecheck was not run.
