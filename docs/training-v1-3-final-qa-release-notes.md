# Blaze Skate Training V1.3 Final QA + Release Notes

Date: 2026-06-24

## Summary

Blaze Skate Training V1.3 was reviewed as an additive UI and plan-management release on top of the existing Training Platform.

V1.3 adds:

- Goal Detail Modal
- Compact Goal Cards
- Training Plan Archive Management

No application logic was changed during this final QA step. No Firestore schema changes, migrations, subcollections, dependencies, or routes were added.

No release-blocking bugs were found during this static QA, helper smoke verification, lint, and production build pass.

## QA Method

Status legend:

- Pass: verified by source inspection, helper smoke checks, lint, and production build.
- Manual browser sign-off: should still be checked with real production data before deployment sign-off because this repo does not have automated browser tests.

## Regression Checklist

| Area | Status | Notes |
| --- | --- | --- |
| Dashboard loads | Pass | Dashboard still renders through existing `activeTab === 'dashboard'`. |
| Tasks tab loads | Pass | Tasks view remains on activeTab navigation with no route changes. |
| Daily task create/edit/delete works | Pass | Existing `addTask`, `saveEditTask`, and `deleteTask` paths remain unchanged. |
| Daily task complete/uncomplete adjusts points correctly | Pass | Existing `toggleTask` still applies `pointsPerTask`, reversal logic, and daily bonus logic. |
| Daily all-complete bonus still works | Pass | Existing all-complete branch still applies `dailyBonusPoints`. |
| Old streak still behaves as before | Pass | Existing streak continues to derive from `completedDays`. |
| Academy tab loads | Pass | Academy remains activeTab-based and was not altered by V1.3 work. |
| Academy import behavior still works | Pass | Existing Academy import paths still append to `data.tasks` only. |
| Data / PB records display | Pass | Existing record arrays and chart flow remain unchanged. |
| PB add/delete still works | Pass | Existing selected-distance record add/delete behavior was not changed. |
| Shop / Rewards still work | Pass | Reward redemption and management logic were not changed. |
| Profile/settings still work | Pass | Existing settings, account, language, theme, training, points, and shop sections remain in place. |
| Races still work | Pass | Existing `data.races` and legacy `raceDate` handling remain unchanged. |
| Language toggle still works | Pass | V1.3 copy was added to existing translation tables only. |
| Theme behavior still works | Pass | V1.3 UI uses existing theme tokens. |
| Parent PIN behavior still works | Pass | Parent unlock and PIN management logic were not changed. |

Manual browser sign-off recommended:

- Click through Dashboard, Tasks, Academy, Data, Shop, Profile/settings, Goals, and Plan with a real user profile.
- Exercise one daily task completion/uncompletion and confirm points and `completedDays` behavior match the previous release.
- Add and delete one PB record in a non-production test account.

## V1.3 QA Checklist

### Goal Detail Modal

| Check | Status | Notes |
| --- | --- | --- |
| Goal cards are compact and readable | Pass | Detailed trend and PB rows were moved out of the card into a modal. |
| View Details opens modal | Pass | Goals view mounts `GoalDetailModal()` and tracks `selectedGoalForDetails`. |
| Modal shows Goal Overview | Pass | Modal renders title, competition, event, distance, priority, status, and notes. |
| Modal shows Current Performance | Pass | Uses `getGoalCurrentPerformance(goal, data)`. |
| Modal shows Target Gap | Pass | Uses PB-first gap and trend summary values. |
| Modal shows Progress History | Pass | Uses `getGoalTrendSummary(goal, data)`. |
| Modal shows Recent PB Records | Pass | Uses `getGoalTargetGapHistory(goal, data)` and shows recent rows. |
| No PB history empty state works | Pass | Empty history branch renders the no-history message. |
| Edit Goal from modal reuses existing edit flow | Pass | Modal closes then calls existing `openEditGoalModal(goal)`. |
| Archive Goal from modal reuses existing archive flow | Pass | Modal reuses existing `archiveGoal(goal)` behavior. |
| Closing modal does not write Firestore | Pass | Close path only clears local modal state. |
| PB records are not modified | Pass | Goal detail flow reads existing record arrays only. |
| `goal.currentTimeSeconds` is not overwritten | Pass | PB-first helpers derive values without writing them back. |
| Dashboard target gap still works | Pass | Dashboard still uses the same PB-first helpers. |

### Plan Archive Management

| Check | Status | Notes |
| --- | --- | --- |
| Current Plans section excludes archived plans | Pass | Uses `getNonArchivedTrainingPlans(...)`. |
| Archived Plans section shows archived plans | Pass | Uses `getArchivedTrainingPlans(...)`. |
| No archived plans empty state works | Pass | Dedicated empty state copy is rendered. |
| Archive confirmation appears | Pass | `archivePlan` now guards on `window.confirm(...)`. |
| Cancel archive does not write | Pass | Function returns early before `updateData(...)`. |
| Archiving active plan switches `activeTrainingPlanId` safely | Pass | Falls forward to next available non-archived plan. |
| Archiving last active plan sets `activeTrainingPlanId` to null | Pass | Fallback becomes `null` when no non-archived plans remain. |
| Restore archived plan works | Pass | Restore uses pure `restoreTrainingPlan(plan)` helper. |
| Restored plan returns to draft | Pass | Restore helper sets `status: 'draft'`. |
| Restore does not override existing valid active plan | Pass | Restore keeps current active plan when a non-archived one still exists. |
| Restore sets `activeTrainingPlanId` only if there is no valid active plan | Pass | Restore promotes restored plan only when no valid non-archived active plan remains. |
| Add to Today still works after restore | Pass | Restore only changes plan status and current-plan selection; task conversion path is unchanged. |
| Weekly Adherence still works after restore | Pass | Weekly adherence still reads current selected/non-archived plans with no schema changes. |
| XP/streak/completedDays remain unchanged | Pass | Archive/restore logic does not touch daily completion or points flows. |

Manual browser sign-off recommended:

- Open Goal Detail Modal on a goal with PB history and one without PB history.
- Archive an active plan and confirm the visible selected plan falls forward correctly.
- Archive the last non-archived plan and confirm no invalid current plan remains selected.
- Restore an archived plan with and without an existing valid active plan.
- After restore, add a plan task to Today and confirm Daily Tasks behavior is unchanged.

## Data Safety Confirmation

Confirmed:

- Firestore path remains:
  - `artifacts/blaze-skate-production/users/{uid}/profile/main`
- No Firestore subcollections were added.
- No migration was introduced.
- No new Firestore fields were added for V1.3.
- Existing legacy fields are preserved.
- Goal Detail Modal metrics are computed client-side only.
- Plan archive management uses the existing `status` field.
- Existing daily task completion semantics were not changed.
- XP / points logic was not changed.
- Old streak / `completedDays` behavior was not changed.
- PB records remain read-only in goal details.
- Template creation remains explicit user action only.
- V1/V1.1/V1.2/V1.3 data remains additive root fields.

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
- No large chunk warning appeared.

Additional helper smoke checks:

- Pass
- Covered V1.3 UI token presence for Goal Detail Modal and Plan Archive Management.
- Covered archive/restore helper behavior in `src/features/trainingV1/plans.js`.

There is no `npm run typecheck` script in the current package configuration, so typecheck was not run.

## Release Notes

# Blaze Skate Training V1.3

## New: Goal Detail Modal

- Goals now support a dedicated Goal Detail Modal.
- The modal shows Goal Overview, Current Performance, Target Gap, Progress History, Recent PB Records, and existing goal actions.
- Goal details remain client-computed and read-only except for existing Edit and Archive actions.

## Improved: Compact Goal Cards

- Goal cards are now easier to scan.
- PB history details and recent PB rows were moved out of the card and into the detail modal.
- Cards keep summary fields such as title, competition, distance, performance source, gap, and progress.

## Improved: Training Plan Archive Management

- Training Plan tab now separates Current Plans and Archived Plans.
- Archiving a plan requires confirmation.
- Archived plans remain visible and can be restored.
- Restored plans return to `draft`.

## Improved: Active Plan Safety

- Archiving the active plan now switches `activeTrainingPlanId` safely.
- Restoring a plan does not override an existing valid active plan.
- Restoring can promote the restored plan only when no valid current active plan exists.

## Preserved

- Daily Tasks
- XP / points
- Streak
- Academy
- Shop / Rewards
- PB records
- Races
- Existing Firebase `profile/main` data model

## Known Limitations

- No automated test framework.
- No TypeScript.
- activeTab navigation only.
- No shareable URLs.
- `App.jsx` remains monolithic.
- V1 data still stored in `profile/main`.
- Reports are read-only and client-computed.
- No Journal/Analysis integration yet.

## V1.4 Backlog

### P1

- Weekly report export / print view.
- Goal detail mobile polish.
- Plan archive filters/search.

### P2

- Journal integration.
- Analysis integration.
- Coach notes.

### P3

- React Router / shareable URLs.
- Firestore subcollections.
- Automated tests.
- TypeScript migration.

## Bugs Found

No release-blocking bugs were found during this QA pass.

## Bugs Fixed

No bugs were fixed in this final QA step because no release-blocking bugs were found.
