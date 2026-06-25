# Blaze Skate Training V1.7 Final QA + Release Notes

## Summary

Blaze Skate Training V1.7 delivers two internal-quality improvements:

- expanded helper smoke coverage for templates and Lindsay defaults
- a low-risk extraction of `SelectedPlanTaskItem` from `App.jsx`

This QA pass confirms:

- smoke coverage passes at `94/94` checks
- lint and production build are passing
- the selected-plan task item extraction remains presentation-only
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

### V1.7 validation

- `npm run smoke:training` passes with `94/94` checks: verified by command
- `planTemplates` smoke coverage passes: verified by command
- `trainingV1Defaults` smoke coverage passes: verified by command
- Plans tab loads: source-inspection only
- Selected plan panel loads: source-inspection only
- `SelectedPlanTaskItem` renders task text / target / desc: source-inspection only
- category / duration / intensity badges render: source-inspection only
- completed state renders: source-inspection only
- Scheduled Today / Added / Added from Other Date / Not Added status renders: source-inspection only
- completedAt display works: source-inspection only
- Edit button still opens edit modal: source-inspection only
- Add to Today still works: source-inspection only
- Added disabled state still works: source-inspection only
- plan task complete / uncomplete still works: source-inspection only
- duplicate prevention remains in `App.jsx`: confirmed by source inspection
- XP / streak / `completedDays` remain unaffected: confirmed by source inspection

### Regression confidence from smoke coverage

- helper smoke coverage still validates:
  - date utilities
  - task matching semantics
  - record key mapping
  - formatting helpers
  - goals PB-first helpers
  - weekly adherence aggregation
  - weekly report aggregation
  - plan template generation
  - Lindsay default detection and generation

## Component Boundary QA

- `SelectedPlanTaskItem` receives props/callbacks only: confirmed
- `SelectedPlanTaskItem` does not call Firebase: confirmed
- `SelectedPlanTaskItem` does not call `updateData` directly: confirmed
- `SelectedPlanTaskItem` does not mutate `task` or `plan`: confirmed
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
- Current build showed a plugin timing warning only, not a chunk size regression

## Release Notes

## Blaze Skate Training V1.7

### Improved: Smoke coverage for templates/defaults

- Expanded `npm run smoke:training` from `54/54` to `94/94` checks
- Added helper coverage for:
  - `planTemplates.js`
  - `trainingV1Defaults.js`
- No helper behavior was changed

### Refactor: SelectedPlanTaskItem

- Extracted the single selected-plan task item presentation JSX from `App.jsx`
- Keeps selected plan panel behavior, callbacks, and write ownership unchanged

### Improved: safer future plan view refactoring

- Creates a cleaner boundary around selected-plan task item presentation
- Reduces JSX duplication inside `App.jsx`
- Improves confidence for future plan-view extraction work

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

## V1.8 Backlog

### P1

- Extract selected-plan header / summary component
- Add smoke coverage for plan archive / restore helpers if feasible
- Add browser manual QA checklist document

### P2

- Extract `PlansView` only after more plan smoke coverage
- Extract `GoalsView` only after more goal smoke coverage
- Formalize Firestore write guardrails

### P3

- React Router planning
- TypeScript migration
- Firestore subcollections
- SkatingX consolidation
