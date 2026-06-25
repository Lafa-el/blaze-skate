# Blaze Skate Training V1.6 Final QA + Release Notes

## Summary

Blaze Skate Training V1.6 adds a helper smoke test script and performs a low-risk UI refactor by extracting `GoalCard` and `PlanCard` from `App.jsx`.

This QA pass confirms:

- helper smoke coverage is runnable and passing
- lint and production build are passing
- the V1.6 card extraction remains presentation-only
- existing Firestore path and write ownership remain unchanged
- no schema, routing, dependency, or platform-model changes were introduced

This document distinguishes between:

- command-backed validation
- source-inspection validation
- manual runtime checks still recommended because there is no automated browser test framework

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
- Interactive checklist items above remain candidates for manual post-build verification in a browser session.

## Feature Regression Checklist

### V1.6

- `npm run smoke:training` passes: verified by command
- Goals tab loads: source-inspection only
- `GoalCard` renders correctly: source-inspection only
- View Details opens Goal Detail Modal: source-inspection only
- Edit Goal still works: source-inspection only
- Archive Goal still works: source-inspection only
- PB-first current performance works: source-inspection plus smoke helper coverage
- Target gap works: source-inspection plus smoke helper coverage
- Progress history works: source-inspection plus smoke helper coverage
- Plans tab loads: source-inspection only
- `PlanCard` renders current plans correctly: source-inspection only
- `PlanCard` renders archived plans correctly: source-inspection only
- Current Plans / Archived Plans work: source-inspection only
- Archive confirmation works: source-inspection only
- Restore plan works: source-inspection only
- Add to Today works: source-inspection only
- Plan task added status works: source-inspection only
- Weekly Plan Adherence works: source-inspection plus smoke helper coverage
- Weekly Report opens/closes: source-inspection only
- Print Report still calls browser print: verified by source inspection (`onPrint={() => window.print()}`)
- Plan templates still work: source-inspection only
- Lindsay defaults initialization still works if present: source-inspection only

### V1 through V1.5 regression confidence

- Smoke helper coverage still validates shared utility semantics:
  - date utils
  - task matching
  - record mapping
  - format helpers
  - goals PB-first helpers
  - weekly adherence aggregation
  - weekly report aggregation
- No release-blocking regression was found in the V1.6 extraction itself.

## Refactor QA Checklist

- `GoalCard` receives props/callbacks only: confirmed
- `GoalCard` does not call Firebase: confirmed
- `GoalCard` does not call `updateData` directly: confirmed
- `GoalCard` does not mutate goal: confirmed
- `PlanCard` receives props/callbacks only: confirmed
- `PlanCard` does not call Firebase: confirmed
- `PlanCard` does not call `updateData` directly: confirmed
- `PlanCard` does not mutate plan: confirmed
- `App.jsx` still owns feature state and write callbacks: confirmed
- smoke script exits with code `0`: confirmed

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
  - Result: `54/54 checks passed`
- `npm run lint`: passed
- `npm run build`: passed

### Build output

- Vite build completed successfully
- Vendor chunk splitting remains in place
- Large chunk warning remains resolved

## Release Notes

## Blaze Skate Training V1.6

### New: Helper Smoke Test Script

- Added `scripts/smoke-training-v1.js`
- Added `npm run smoke:training`
- Covers utility and reporting helper semantics across Training V1 features

### Refactor: GoalCard

- Extracted compact goal card presentation from `App.jsx` into `src/features/goals/GoalCard.jsx`
- Keeps PB-first display and action callbacks unchanged

### Refactor: PlanCard

- Extracted compact plan list presentation from `App.jsx` into `src/features/plans/PlanCard.jsx`
- Keeps current-plan and archived-plan behavior unchanged

### Improved: safer future refactoring

- Reduces duplicated JSX in `App.jsx`
- Creates a cleaner boundary between presentation and orchestration
- Improves confidence for future extraction work by pairing refactor work with smoke coverage

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

## V1.7 Backlog

### P1

- Extract `GoalCard` / `PlanCard` follow-up polish if needed
- Add more smoke coverage for templates and defaults initialization
- Extract a small selected-plan task item component

### P2

- Extract `GoalsView` / `PlansView` only after more smoke coverage
- Formalize Firestore write guardrails
- React Router planning

### P3

- TypeScript migration
- Firestore subcollections
- SkatingX consolidation
