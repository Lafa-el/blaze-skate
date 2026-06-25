# Blaze Skate Training V1.8 Final QA + Release Notes

## Summary

Blaze Skate Training V1.8 delivers two internal-quality improvements:

- extraction of `SelectedPlanHeader` from `App.jsx`
- a reusable manual browser QA checklist for release and refactor validation

This QA pass confirms:

- smoke coverage still passes at `94/94`
- lint and production build are passing
- `SelectedPlanHeader` remains a presentation-only component
- Firestore path, write ownership, and legacy behavior boundaries remain unchanged

This document separates:

- command-backed validation
- source-inspection validation
- manual runtime checks still recommended because no automated browser test framework exists

## Regression Checklist

### Existing platform regression

- App loads: source-inspection only, no automated browser run in this QA step
- Dashboard loads: source-inspection only
- Tasks tab loads: source-inspection only
- Daily task create/edit/delete works: source-inspection only
- Daily task complete/uncomplete adjusts points correctly: source-inspection only
- Daily all-complete bonus still works: source-inspection only
- old streak still derives from `completedDays`: source-inspection only
- Academy tab loads: source-inspection only
- Academy import behavior still works: source-inspection only
- Data/PB records display: source-inspection only
- PB add/delete still works: source-inspection only
- Shop/Rewards still work: source-inspection only
- Profile/settings still work: source-inspection only
- Races still work: source-inspection only
- Language toggle still works: source-inspection only
- Theme behavior still works: source-inspection only
- Parent PIN behavior still works: source-inspection only

### Notes

- No automated browser test framework exists in this repo.
- This QA step did not introduce runtime behavior changes.
- The checklist above remains appropriate for manual in-browser verification after deployment or before release signoff.

## Feature / Refactor Regression Checklist

### V1.8 validation

- `npm run smoke:training` passes with `94/94` checks: verified by command
- Plans tab loads: source-inspection only
- selected plan panel loads: source-inspection only
- `SelectedPlanHeader` displays title / status / date / focus: source-inspection only
- linked goal display remains correct: source-inspection only
- active plans count text remains correct: source-inspection only
- weekly completion summary remains correct: source-inspection only
- compact weekly adherence summary remains correct: source-inspection only
- Weekly Report button still opens report modal: source-inspection only
- edit/archive buttons still call `App.jsx` callbacks: confirmed by source inspection
- selected plan task list still renders: source-inspection only
- `SelectedPlanTaskItem` still works: source-inspection only
- Add to Today still works: source-inspection only
- plan task complete/uncomplete still works: source-inspection only
- duplicate prevention remains in `App.jsx`: confirmed by source inspection
- XP / streak / `completedDays` remain unaffected: confirmed by source inspection

## Manual QA Checklist Validation

- `docs/training-manual-browser-qa-checklist.md` exists: confirmed
- includes command checks: confirmed
- includes browser environment recommendations: confirmed
- includes Dashboard QA: confirmed
- includes Tasks / XP / Streak QA: confirmed
- includes Goals QA: confirmed
- includes Plans QA: confirmed
- includes Templates / Defaults QA: confirmed
- includes PB / Data QA: confirmed
- includes Academy QA: confirmed
- includes Shop / Rewards QA: confirmed
- includes Races QA: confirmed
- includes mobile layout QA: confirmed
- includes post-QA sign-off template: confirmed
- clearly states non-coverage: confirmed

## Component Boundary QA

- `SelectedPlanHeader` receives props/callbacks only: confirmed
- `SelectedPlanHeader` does not call Firebase: confirmed
- `SelectedPlanHeader` does not call `updateData` directly: confirmed
- `SelectedPlanHeader` does not mutate `plan`: confirmed
- `App.jsx` still owns write callbacks and state: confirmed

## Data Safety Confirmation

- Firestore path unchanged:
  - `artifacts/blaze-skate-production/users/{uid}/profile/main`
- No subcollections added
- No migration introduced
- No new Firestore fields added
- Existing legacy fields preserved
- `updateData` semantics unchanged
- `saveProfilePatch` semantics unchanged
- Daily task completion semantics unchanged
- XP / points unchanged
- streak / `completedDays` unchanged
- PB add/delete unchanged
- Academy import unchanged
- Shop / Rewards unchanged
- Races unchanged

## Validation Results

### Command validation

- `npm run smoke:training`: passed
  - Result: `94/94 checks passed`
- `npm run lint`: passed
- `npm run build`: passed

### Build output

- Vite build completed successfully
- Large chunk warning remains resolved
- Vendor chunk splitting remains in place

## Release Notes

## Blaze Skate Training V1.8

### Refactor: SelectedPlanHeader

- Extracted the selected plan hero summary and weekly adherence summary from `App.jsx`
- Keeps selected plan state, callbacks, task list, and write ownership unchanged

### Docs: Manual Browser QA Checklist

- Added `docs/training-manual-browser-qa-checklist.md`
- Covers browser-only validation not exercised by smoke, lint, or build
- Provides a reusable release/refactor sign-off checklist

### Improved: safer release and refactor validation

- Makes release QA expectations explicit
- Improves confidence around UI-only refactors in `App.jsx`
- Pairs code-level validation with a manual browser checklist

### Preserved

- Daily Tasks
- XP / points
- streak
- Academy
- Shop / Rewards
- PB records
- races
- Firestore `profile/main` model

## Known Limitations

- `App.jsx` remains large
- No automated browser test framework
- No TypeScript
- activeTab navigation only
- no shareable URLs
- `profile/main` single-document model remains
- no Journal/Analysis integration yet

## V1.9 Backlog

### P1

- Add smoke coverage for plan archive / restore helpers if feasible
- Extract selected-plan task list group component
- Add Firestore write guardrails document

### P2

- Extract `PlansView` only after more plan smoke coverage
- Extract `GoalsView` only after more goal smoke coverage
- React Router planning

### P3

- TypeScript migration
- Firestore subcollections
- SkatingX consolidation
