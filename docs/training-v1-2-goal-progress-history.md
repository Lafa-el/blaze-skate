# Blaze Skate Training V1.2 Step 1 Goal Progress History

Date: 2026-06-24

## Summary

V1.2 Step 1 adds read-only Goal Progress History and Target Gap Trend using existing PB records.

This step does not change Firestore schema, route structure, PB record storage, PB record add/delete behavior, Daily Task behavior, XP, streak, `completedDays`, Academy, Shop, Rewards, races, or Lindsay defaults behavior.

## Files Changed

- `src/features/trainingV1/goals.js`
  - Added record history and goal trend helpers.
- `src/App.jsx`
  - Added compact Goal Progress History UI in goal cards.
  - Added compact trend summary text in Dashboard Target Gap rows.
- `docs/training-v1-2-goal-progress-history.md`
  - Documents this V1.2 Step 1 implementation.

## Helper Functions Added

Added in `src/features/trainingV1/goals.js`:

- `getRecordHistoryForDistance(data, distance)`
- `getGoalTargetGapHistory(goal, data)`
- `getGoalTrendSummary(goal, data)`

These helpers:

- reuse existing distance normalization
- read existing PB record arrays only
- sort valid records by date ascending
- ignore malformed time values
- ignore invalid dates
- keep all trend metrics client-side only

## Target Gap Calculation

For each valid PB record:

```js
{
  date: string,
  timeSeconds: number,
  targetTimeSeconds: number,
  gapSeconds: number,
  achieved: boolean
}
```

Rules:

- lower time is better
- `gapSeconds = timeSeconds - targetTimeSeconds`
- `achieved = timeSeconds <= targetTimeSeconds`

Manual current time fallback is not treated as history.

Only PB record arrays are used for trend history.

## Trend Summary Definitions

`getGoalTrendSummary(goal, data)` returns:

```js
{
  hasHistory: boolean,
  firstGapSeconds: number | null,
  latestGapSeconds: number | null,
  bestGapSeconds: number | null,
  improvementSeconds: number | null,
  latestRecordDate: string | null,
  bestRecordDate: string | null,
  achieved: boolean
}
```

Definitions:

- `firstGapSeconds`
  - earliest valid record gap
- `latestGapSeconds`
  - latest valid record gap by date
- `bestGapSeconds`
  - smallest `gapSeconds`
- `improvementSeconds`
  - `firstGapSeconds - latestGapSeconds`
  - positive means the gap has improved
- `latestRecordDate`
  - latest valid record date
- `bestRecordDate`
  - record date with the smallest gap
- `achieved`
  - any record time reached or beat the target

If there is no `targetTimeSeconds` or no valid record history, the helper returns `hasHistory: false` and `null` values.

## UI Behavior

### Goals View

Each active goal card now includes a compact Progress History section.

It shows:

- Latest Gap
- Best Gap
- Improvement
- Latest Record
- Target Achieved when applicable
- Last 3 Records as compact rows

If no PB history exists:

- English: `No PB history for this goal yet.`
- Chinese: `这个目标还没有 PB 历史记录。`

### Dashboard V1

Dashboard Target Gap rows now include a compact text summary:

- English examples:
  - `Improved by 0.8s`
  - `No PB history yet`
  - `Target achieved`
- Chinese examples:
  - `进步 0.8 秒`
  - `还没有 PB 历史`
  - `目标已达成`

Dashboard remains read-only.

## Data Safety Confirmation

No schema changes were made.

Unchanged:

- Firestore path:
  - `artifacts/blaze-skate-production/users/{uid}/profile/main`
- Goals:
  - `data.competitionGoalsV1`
- PB records:
  - `data.records`
  - `data.records777`
  - `data.records1000`
  - `data.records1500`
  - `data.recordsStart`
  - `data.recordsLap`
  - `data.records_{distance}`

No Firestore subcollections were added.

No data migration was introduced.

No goal trend snapshot was written to Firestore.

## Read-Only Confirmation

PB records are read-only in this step.

Unchanged:

- PB record add behavior
- PB record delete behavior
- PB record field shape
- PB record arrays

No goal values are overwritten.

Unchanged:

- `goal.currentTimeSeconds`
- `goal.targetTimeSeconds`

## Manual Verification Checklist

- [ ] Open Goals tab with a goal that has a target time and PB records.
- [ ] Confirm Progress History appears on the goal card.
- [ ] Confirm Latest Gap matches the latest valid record against the target.
- [ ] Confirm Best Gap matches the smallest gap in history.
- [ ] Confirm Improvement is positive when the gap has narrowed.
- [ ] Confirm Latest Record shows the most recent valid record date.
- [ ] Confirm Target Achieved appears if any PB reached the target.
- [ ] Confirm the last 3 records list shows date, time, and gap.
- [ ] Open a goal with no PB history.
- [ ] Confirm it shows the empty history message.
- [ ] Open Dashboard Target Gap section.
- [ ] Confirm each goal row shows a compact trend summary.
- [ ] Confirm PB records are unchanged after viewing Goals and Dashboard.
- [ ] Confirm `goal.currentTimeSeconds` is unchanged after viewing Goals and Dashboard.
- [ ] Confirm XP, streak, and `completedDays` behavior is unchanged.

## Validation

Run:

```text
npm run lint
npm run build
```

There is no `npm run typecheck` script in the current package configuration.
