# Blaze Skate Training V1 Step 1 Notes

Date: 2026-06-23

## Goal

Implement the additive Blaze Skate Training V1 helper and data-contract layer for:

- `competitionGoalsV1`
- `trainingPlansV1`
- `activeTrainingPlanId`

This step does not implement V1 UI, routing, automatic seeding, data migration, or Firestore subcollections.

## Files Added

```text
src/features/trainingV1/goals.js
src/features/trainingV1/plans.js
src/features/trainingV1/dashboardMetrics.js
src/features/trainingV1/trainingV1Defaults.js
docs/training-v1-step1-notes.md
```

## Files Changed

```text
src/App.jsx
```

`src/App.jsx` only received three additive defaults in `defaultData`:

```text
competitionGoalsV1: []
trainingPlansV1: []
activeTrainingPlanId: null
```

No existing default fields were removed or renamed.

## V1 Fields Introduced

### `competitionGoalsV1`

Optional root array on the existing `profile/main` document.

Intended to store richer competition goal objects without replacing the current lightweight `races` field.

### `trainingPlansV1`

Optional root array on the existing `profile/main` document.

Intended to store draft or active weekly/dated plan objects without changing existing `tasks` or `weeklyTemplate`.

### `activeTrainingPlanId`

Optional root field on the existing `profile/main` document.

Intended to identify the active plan for future UI/dashboard reads.

## Why Firestore Subcollections Were Not Introduced Yet

The production app currently stores all user-owned Training data at:

```text
artifacts/blaze-skate-production/users/{uid}/profile/main
```

Step 1 keeps V1 fields as optional root fields on that existing document because:

- It avoids changing Firestore rules, indexes, or security assumptions in this step.
- It avoids migrating existing user data.
- It preserves current reads through `subscribeToProfile`.
- It preserves current writes through `updateData` and `saveProfilePatch`.
- It keeps V1 additions backward-compatible for legacy documents that do not have these fields.

Future migration to subcollections should be handled in a dedicated migration sprint.

## How Existing Features Were Protected

This step did not change:

- `updateData`
- `saveProfilePatch`
- `subscribeToProfile`
- `toggleTask`
- `addTask`
- `addSpecificTask`
- Academy import behavior
- XP / points calculation
- streak calculation
- PB record storage
- race storage
- shop / reward behavior
- profile / settings behavior
- tab navigation

V1 helper modules are pure read/transform helpers. They do not write Firestore data and are not wired into the app UI yet.

## Manual Checks Run

The following checks were run after implementation:

```text
npm run build
npm run lint
```

Both commands passed.

`npm run build` reported the existing non-blocking Vite warning:

```text
Some chunks are larger than 500 kB after minification.
```

A lightweight Node smoke check was also run against the new pure helper modules:

```text
trainingV1 helper smoke checks passed
```

There is no `npm run typecheck` script in the current project, and no test framework is configured. Per Step 1 scope, no new test framework was introduced.
