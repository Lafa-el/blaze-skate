# Blaze Skate Training V1.2 Final QA + Release Notes

Date: 2026-06-24

## Summary

Blaze Skate Training V1.2 was reviewed as an additive reporting release on top of the existing Training Platform.

V1.2 adds two read-only reporting enhancements:

- Goal Progress History / Target Gap Trend
- Weekly Plan Adherence Report

No application logic was changed during this final QA step. No Firestore schema changes, migrations, subcollections, dependencies, routes, or new product features were added.

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
| Daily task create/edit/delete | Pass | Existing `addTask`, `saveEditTask`, and `deleteTask` paths remain unchanged. |
| Daily task complete/uncomplete adjusts points correctly | Pass | Existing `toggleTask` still applies `pointsPerTask` and reversal logic. |
| Daily all-complete bonus still works | Pass | Existing all-complete branch still applies `dailyBonusPoints`. |
| Old streak still behaves as before | Pass | Existing streak continues to derive from `completedDays`. |
| Academy tab loads | Pass | Academy view remains mounted by activeTab and Academy data import logic was not changed. |
| Academy import behavior still works | Pass | Existing `importAcademyRoutine` and `importSingleTask` paths still append to `data.tasks`. |
| Data / PB records display | Pass | Existing record arrays and chart rendering remain unchanged. |
| PB add/delete still works | Pass | Existing selected-distance record write/delete behavior was not changed. |
| Shop / Rewards still work | Pass | Reward redemption and shop management logic were not changed. |
| Profile/settings still work | Pass | Existing settings, account, language, theme, training, points, and shop sections remain in place. |
| Races still work | Pass | Existing `data.races` and legacy `raceDate` handling remain unchanged. |
| Language toggle still works | Pass | V1.2 copy was added to existing translation tables only. |
| Theme behavior still works | Pass | V1.2 UI uses existing theme tokens. |
| Parent PIN behavior still works | Pass | Parent unlock and PIN management logic were not changed. |

Manual browser sign-off recommended:

- Click through Dashboard, Tasks, Academy, Data, Shop, Profile/settings, Goals, and Plan with a real user profile.
- Exercise one daily task completion/uncompletion and confirm points and `completedDays` behavior match the previous release.
- Add and delete one PB record in a non-production test account.

## V1.2 QA Checklist

### Goal Progress History

| Check | Status | Notes |
| --- | --- | --- |
| Goals tab shows Progress History for goals with PB records | Pass | Goals view reads `getGoalTargetGapHistory(goal, data)`. |
| Latest Gap is correct | Pass | `getGoalTrendSummary` uses the most recent record by date. |
| Best Gap is correct | Pass | `getGoalTrendSummary` selects the lowest gap value. |
| Improvement is correct | Pass | Improvement is first gap minus latest gap. |
| Latest Record is correct | Pass | Latest record date comes from the final chronological PB record. |
| Recent PB rows display correctly | Pass | Goal cards render recent rows from the PB history helper. |
| No PB history empty state works | Pass | Empty history branch renders the no-history message. |
| Dashboard target gap trend summary works | Pass | Dashboard target gap rows use the same trend helper. |
| `goal.currentTimeSeconds` is not overwritten | Pass | PB-first helper creates derived objects only and does not call `updateData`. |
| PB records are not modified | Pass | PB integration reads existing record arrays only. |

### Weekly Plan Adherence

| Check | Status | Notes |
| --- | --- | --- |
| Dashboard shows Weekly Plan Adherence | Pass | Dashboard renders `weeklyPlanAdherence` card. |
| Plan tab summary shows compact weekly adherence | Pass | Selected Plan summary renders compact weekly adherence. |
| `totalPlanTasks` is correct | Pass | Counts plan tasks in the selected 7-day range. |
| `completedPlanTasks` is correct | Pass | Counts weekly plan tasks where `completed === true`. |
| `addedToTodayTasks` is correct and deduped | Pass | Uses normalized text + target and de-duplicates weekly plan task keys. |
| `dailyTasksTotal` is correct | Pass | Uses current `data.tasks.length`. |
| `dailyTasksCompleted` is correct | Pass | Counts current daily tasks where `completed === true`. |
| Percentages handle zero denominators safely | Pass | Percent helpers return `0` for zero denominators. |
| No Firestore report fields are written | Pass | Summary is returned from pure helper logic only. |
| XP/streak/completedDays are unchanged | Pass | Weekly adherence does not call write helpers or task completion logic. |

Manual browser sign-off recommended:

- Use an account with an active plan that has tasks inside the current week.
- Complete one plan task and confirm Dashboard and Plan summary update.
- Add a plan task to Today and confirm `Added to Today` increments once.
- Add duplicate-matching daily tasks and confirm weekly added count does not overcount.
- Open a plan with zero tasks this week and confirm the empty state.

## Data Safety Confirmation

Confirmed:

- Firestore path remains:
  - `artifacts/blaze-skate-production/users/{uid}/profile/main`
- No Firestore subcollections were added.
- No migration was introduced.
- V1/V1.1/V1.2 data remains additive root fields.
- Existing legacy fields are preserved.
- Dashboard metrics are computed client-side only.
- Goal trend metrics are computed client-side only.
- Weekly adherence metrics are computed client-side only.
- PB integration is read-only.
- `goal.currentTimeSeconds` is not overwritten by PB-derived values.
- PB records are not mutated by Goals or Dashboard reporting.
- Template creation remains explicit user action only.
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
- No large chunk warning appeared.

Additional helper smoke checks:

- Pass
- Covered Goal Progress History / Target Gap Trend calculations.
- Covered Weekly Plan Adherence calculations, including de-duped `addedToTodayTasks`.

There is no `npm run typecheck` script in the current package configuration, so typecheck was not run.

## Release Notes

# Blaze Skate Training V1.2

## New: Goal Progress History

- Goals now show PB-based progress history for speed skating goals.
- Recent PB rows show record date, time, and target gap.
- Empty history state appears when no PB records are available.
- Goal manual current time remains available as fallback only.

## New: Target Gap Trend

- Dashboard target gap rows now include trend context.
- Latest gap, best gap, improvement, latest record, and best record date are computed from existing PB records.
- PB records are read-only in this reporting flow.
- `goal.currentTimeSeconds` is not overwritten.

## New: Weekly Plan Adherence Report

- Dashboard now shows Weekly Plan Adherence / 本周计划执行.
- The selected Training Plan summary now shows compact weekly adherence.
- Metrics include plan tasks, completed plan tasks, added-to-today tasks, completed daily tasks, and adherence percentage.
- Reports are computed client-side only and are not stored in Firestore.

## Improved: Dashboard Performance Visibility

- Dashboard now gives clearer visibility into:
  - current daily execution
  - plan adherence
  - PB-driven target gap trends
  - active goals and active/fallback training plans

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
- V1/V1.1/V1.2 data still stored in `profile/main`.
- Reports are read-only and client-computed.
- No Journal integration yet.
- No Analysis integration yet.

## V1.3 Backlog

### P1

- Better Training Plan archive management.
- Weekly report export / print view.
- Goal detail modal.

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
