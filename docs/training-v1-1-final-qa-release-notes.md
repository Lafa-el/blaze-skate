# Blaze Skate Training V1.1 Final QA + Release Notes

Date: 2026-06-24

## Summary

Blaze Skate Training V1.1 was reviewed as an additive release on top of the existing Training Platform. The QA pass focused on regressions, V1.1 feature behavior, data safety, and release readiness.

No release-blocking bugs were found during this static QA and validation pass.

No application logic was changed in this final QA step.

## Regression Checklist

Status legend:

- Pass: verified by source inspection, helper smoke check, lint, and production build.
- Manual follow-up: should still be checked in browser with production data before deployment sign-off.

| Area | Status | Notes |
| --- | --- | --- |
| Dashboard loads | Pass | Dashboard still renders from `activeTab === 'dashboard'`. |
| Tasks tab loads | Pass | Tasks view remains under existing activeTab navigation. |
| Daily task create/edit/delete | Pass | Existing `addTask`, edit, and delete paths remain unchanged. |
| Daily task complete/uncomplete points | Pass | Existing `toggleTask` still updates task points and all-complete bonus. |
| Daily all-complete bonus | Pass | Existing bonus branch remains tied to all daily tasks completed. |
| Old streak | Pass | Existing `completedDays` behavior remains tied to daily task completion. |
| Academy tab loads | Pass | Academy route remains activeTab-based; import path unchanged. |
| Academy import behavior | Pass | Existing import helpers remain unchanged by V1.1. |
| Data / PB records display | Pass | Existing records arrays and chart flow remain unchanged. |
| PB add/delete | Pass | Existing record add/delete code still writes the selected records array only. |
| Shop / Rewards | Pass | Reward redemption still updates `points` and `rewardHistory`. |
| Profile / settings | Pass | Profile/settings state and profile save path remain unchanged. |
| Races | Pass | Race management logic was not modified by V1.1. |
| Language toggle | Pass | V1.1 copy was added to existing `translations` object. |
| Theme behavior | Pass | V1.1 UI uses existing theme tokens. |
| Parent PIN behavior | Pass | Parent mode/PIN logic was not modified by V1.1. |

## V1.1 QA Checklist

### Dashboard Today Semantics

| Check | Status | Notes |
| --- | --- | --- |
| Scheduled Plan Tasks Today shows only tasks scheduled for today | Pass | Uses `getTodayPlanSummary(data, currentDateStr)`. |
| Today Execution shows Daily Tasks | Pass | Uses `getTodayExecutionSummary(...).totalDailyTasks`. |
| Today Execution shows Completed | Pass | Uses `completedDailyTasks` from existing `data.tasks`. |
| Today Execution shows Added from Plan | Pass | Uses normalized text + target matches against active/fallback plan tasks. |
| Today Execution shows Added from Other Dates | Pass | Counts matched plan tasks with plan date not equal to today. |
| Dashboard remains read-only | Pass | Dashboard reads summaries only and does not call write helpers. |
| No XP/streak/completedDays changes from Dashboard | Pass | Dashboard metrics are client-side computed only. |

### Plan Task Added Status

| Check | Status | Notes |
| --- | --- | --- |
| Today plan task shows Scheduled Today | Pass | `getPlanTaskDailyStatus` exposes `isScheduledToday`. |
| Added plan task shows Added | Pass | Uses normalized text + target match against `data.tasks`. |
| Past/future plan task added to today shows Added from Other Date | Pass | Smoke check covered other-date match behavior. |
| Duplicate Add to Today is prevented | Pass | `addPlanTaskToToday` checks `isPlanTaskAddedToToday` before append. |
| Add to Today does not award points | Pass | Add to Today appends to `data.tasks` only. |
| Add to Today does not alter `completedDays` | Pass | No `completedDays` write in Add to Today path. |
| Add to Today does not complete the plan task | Pass | Converted daily task is created incomplete and plan task is untouched. |

### Goal-PB Integration

| Check | Status | Notes |
| --- | --- | --- |
| Goals prefer PB records over manual current time | Pass | `getGoalCurrentPerformance` checks records before goal current time. |
| PB date appears when record source exists | Pass | Goals and Dashboard display PB date when present. |
| Manual Current fallback works when no PB exists | Pass | Helper returns `source: 'goal'` when no PB exists. |
| Dashboard target gap uses same PB-first logic | Pass | Dashboard uses `getGoalGapWithPB` and `getGoalProgressWithPB`. |
| PB records are not modified | Pass | PB integration reads existing record arrays only. |
| `goal.currentTimeSeconds` is not overwritten | Pass | PB value is never written back to the goal. |

### Training Plan Templates

| Check | Status | Notes |
| --- | --- | --- |
| Create from Template button appears | Pass | Added in Training Plan tab header and empty state. |
| Six templates can be selected | Pass | `getTrainingPlanTemplates()` returns six templates. |
| Template creates 7 consecutive days | Pass | Smoke check verified 7 days and end date. |
| Each day has 1-3 tasks | Pass | Smoke check verified task count constraints. |
| Optional title override works | Pass | Smoke check verified custom title. |
| Optional goal link works | Pass | Template modal passes `goalId` to plan creation. |
| Status draft/active works | Pass | Template modal passes status and selects active plan when status is active. |
| Duplicate template + startDate is prevented | Pass | UI prevents same final title + same start date for non-archived plans. |
| Created plan works with Add to Today | Pass | Generated tasks use existing plan task shape and source. |
| Created plan works with Dashboard Today Execution | Pass | Generated plan uses existing `days[].date` and `tasks` shape. |

## Data Safety Confirmation

Confirmed:

- Firestore path remains:
  - `artifacts/blaze-skate-production/users/{uid}/profile/main`
- No Firestore subcollections were added.
- No migration was introduced.
- V1/V1.1 data remains additive root fields.
- Existing legacy fields are preserved.
- Dashboard metrics are computed client-side only.
- Goal-PB integration is read-only.
- Template creation writes only a new `trainingPlansV1` entry by explicit user action.
- Existing daily task completion semantics were not changed.
- XP / points logic was not changed.
- Old streak / `completedDays` behavior was not changed.
- Academy import logic was not changed.
- Shop / Rewards logic was not changed.
- PB record add/delete behavior was not changed.
- Races logic was not changed.

## Validation Results

Commands run:

```text
npm run lint
```

Result:

- Pass
- ESLint completed with exit code 0.

```text
npm run build
```

Result:

- Pass
- Vite production build completed with exit code 0.
- Output chunks:
  - `react-vendor-B0NJamC8.js` 189.63 kB
  - `index-BeedpIDM.js` 237.86 kB
  - `firebase-vendor-CX2xGnkN.js` 405.04 kB
- No large chunk warning appeared.

Additional helper smoke check:

- Pass
- Covered Today Execution matching, plan task other-date Added status, PB-first goal performance, and training plan template generation.

There is no `npm run typecheck` script in the current package configuration.

## Release Notes

# Blaze Skate Training V1.1

## Improved: Plan-to-Today Workflow

- Plan tasks can be manually added to Today.
- Duplicate Add to Today actions are prevented.
- Add to Today remains separate from plan task completion.
- Add to Today does not award XP, points, streak credit, or `completedDays`.

## Improved: Dashboard Today Execution

- Dashboard now separates Scheduled Plan Tasks Today from Today Execution.
- Today Execution shows:
  - Daily Tasks
  - Completed
  - Added from Plan
  - Added from Other Dates
- Dashboard remains read-only.

## Improved: Plan Task Added Status

- Plan task cards now show:
  - Scheduled Today
  - Added
  - Added from Other Date
  - Not Added
- Status is computed client-side from normalized task text + target.

## New: Goal-PB Integration

- Goals and Dashboard now prefer existing PB records as current performance.
- PB date displays when available.
- Manual Current remains available as fallback when no PB record exists.
- PB records are not modified.
- `goal.currentTimeSeconds` is not overwritten.

## New: Training Plan Templates

- Added Create from Template workflow.
- Included templates:
  - Regular Training Week
  - Technique Focus Week
  - Speed Focus Week
  - Competition Week
  - Recovery Week
  - Summer Camp Week
- Template creation generates a 7-day V1 training plan.
- Existing plans are not overwritten or auto-archived.

## Preserved

- Daily Tasks
- XP / points
- Streak
- Academy
- Shop / Rewards
- PB records
- Races
- Existing Firebase profile/main data model

## Known Limitations

- Navigation is still activeTab-based.
- There are no shareable URLs.
- V1/V1.1 data still lives in `profile/main`.
- `App.jsx` remains monolithic.
- There are no automated test files in the repo.
- The app is still JavaScript, not TypeScript.
- Journal integration is not implemented.
- Analysis integration is not implemented.
- Coach/team permissions are not implemented.

## V1.2 Backlog

### P1

- Goal progress history / target gap trend
- Plan adherence weekly report
- Better Training Plan archive management

### P2

- Journal integration
- Analysis integration
- Coach notes
- Export weekly plan

### P3

- React Router / shareable URLs
- Firestore subcollections
- Automated tests
- TypeScript migration

## Bugs Found

No release-blocking bugs were found during this QA pass.

## Bugs Fixed

No bugs were fixed in this final QA step because no release-blocking bugs were found.
