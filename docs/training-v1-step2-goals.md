# Blaze Skate Training V1 Step 2 Goals

Date: 2026-06-23

## Goal

Implement the Blaze Skate Training V1 Competition Goals view as an additive in-app tab powered by `competitionGoalsV1`.

This step does not implement Training Plan UI, Progress Dashboard V1, auto-seeding, React Router routes, Firestore subcollections, or data migration.

## Files Changed

```text
src/App.jsx
src/constants/app.js
docs/training-v1-step2-goals.md
```

This step also depends on the Step 1 helper module:

```text
src/features/trainingV1/goals.js
```

## New activeTab Value

The centralized tab map now includes:

```text
TABS.GOALS = "goals"
```

The bottom navigation includes a new Goals entry:

```text
English: Goals
Chinese: 目标
Icon: Target
```

No URL route was added. The app still uses in-memory `activeTab` navigation.

## How Goals Are Stored

Goals are stored as an optional root field on the existing profile document:

```text
artifacts/blaze-skate-production/users/{uid}/profile/main
  competitionGoalsV1: []
```

No Firestore subcollections were introduced. No existing fields were renamed, moved, or migrated.

## Add Goal

The Goals tab opens a form modal for creating a goal.

The form writes:

```text
title
competitionName
competitionDate
eventName
targetDistance
currentTimeSeconds
targetTimeSeconds
priority
notes
status: active
```

Creation uses:

```text
createCompetitionGoal(input)
updateData({ competitionGoalsV1: updatedGoals })
```

Validation:

- `title` is required.
- `eventName` or `targetDistance` is required.
- `currentTimeSeconds` and `targetTimeSeconds` must be valid non-negative numbers if provided.
- `priority` must be `A`, `B`, or `C`.
- `NaN` is not stored.

## Edit Goal

Editing an active goal opens the same form modal.

Saving uses:

```text
updateCompetitionGoal(existingGoal, patch)
updateData({ competitionGoalsV1: updatedGoals })
```

The existing goal is replaced by ID inside `competitionGoalsV1`.

## Archive Goal

Goals are archived instead of permanently deleted.

Archiving uses:

```text
archiveCompetitionGoal(goal)
updateData({ competitionGoalsV1: updatedGoals })
```

Archived goals are hidden from the active list by default and shown in a secondary collapsible section when present.

## Existing Features Protected

This step did not change:

- `tasks`
- task completion
- XP / points logic
- streak logic
- Academy import logic
- Rewards / Shop logic
- PB records logic
- existing `races` logic
- profile/settings behavior
- Firestore path
- existing tabs and views
- DashboardView behavior

The new Goals view only reads and writes `competitionGoalsV1`.

## Manual Verification Checklist

Commands run:

```text
npm run lint
npm run build
```

Both commands passed.

`npm run build` still reports the existing non-blocking Vite warning:

```text
Some chunks are larger than 500 kB after minification.
```

Manual UI checks:

- Bottom nav shows Goals / 目标.
- Opening Goals tab does not affect existing tabs.
- Empty state appears when there are no active goals.
- Add Goal validates required fields.
- Add Goal stores numbers as numbers or `null`, not `NaN`.
- Active goal card shows title, competition, date, event, distance, current time, target time, gap, progress, priority, notes, and status.
- Edit Goal updates the existing item instead of creating a duplicate.
- Archive Goal moves the goal out of the active list into the archived section.
- Daily Tasks, XP, streak, Academy, shop, records, races, and profile still load.

There is no `npm run typecheck` script in this project, so typecheck is not run in this step.
