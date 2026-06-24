# Blaze Skate Training V1.3 Step 1: Goal Detail Modal

## Summary

This change simplifies active goal cards in the Goals tab and moves detailed PB-based goal analysis into a dedicated Goal Detail Modal.

The goal cards stay focused on quick scanning:

- title
- competition
- event or distance
- performance source
- current time
- target time
- gap
- progress
- achieved / status
- priority
- target date
- actions

Detailed analysis remains client-computed and read-only.

## Files Changed

- `src/App.jsx`
- `docs/training-v1-3-goal-detail-modal.md`

## Card Simplification Summary

Goal cards now keep only compact summary information.

Moved out of the card and into the detail modal:

- detailed Progress History metrics
- recent PB rows
- extended goal notes context

This makes the Goals tab easier to scan when multiple active goals exist.

## Modal Sections

The Goal Detail Modal includes:

1. Goal Overview
2. Current Performance
3. Target Gap
4. Progress History
5. Recent PB Records
6. Actions

Actions:

- Edit Goal
- Archive Goal
- Close

Edit reuses the existing goal edit modal flow.

Archive reuses the existing archive flow.

Close is read-only and does not write anything.

## Helper Usage

The modal uses existing PB-first helpers from `src/features/trainingV1/goals.js`:

- `getGoalCurrentPerformance`
- `getGoalProgressWithPB`
- `getGoalGapWithPB`
- `getGoalTargetGapHistory`
- `getGoalTrendSummary`

No new write helpers were added.

## Data Safety Confirmation

Confirmed:

- No Firestore schema changes were made.
- No new Firestore fields were added.
- No Firestore subcollections were added.
- No migration was introduced.
- Goal detail metrics remain client-side only.
- PB records remain read-only in this flow.
- `goal.currentTimeSeconds` is not overwritten.
- No goal detail snapshot is written to Firestore.

## Manual Verification Checklist

- Open Goals tab and confirm goal cards are shorter and easier to scan.
- Confirm each active goal card shows:
  - title
  - competition
  - event or distance
  - current performance source
  - current time
  - target time
  - gap
  - progress
  - achieved or status
  - priority
  - target date
  - View Details / Edit / Archive buttons
- Open View Details and confirm the modal appears with:
  - Goal Overview
  - Current Performance
  - Target Gap
  - Progress History
  - Recent PB Records
- Confirm PB source shows `PB` and manual fallback shows `Manual Current` / `手动当前成绩`.
- Confirm PB date appears only when the current performance source is records.
- Confirm goals with no PB history show the correct empty state.
- Confirm archived goals can still be viewed safely without writing data.
- Confirm Edit Goal from the detail modal opens the existing goal edit flow.
- Confirm Archive Goal from the detail modal reuses the existing archive behavior.
- Confirm Close only dismisses the modal.

## Validation

Run:

- `npm run lint`
- `npm run build`

There is no `npm run typecheck` script in this project, so typecheck was not run.
