# Blaze Skate Training V1.4 Step 1: Weekly Report Export / Print View

## Summary

This change adds a read-only Weekly Training Report modal that can be opened from the Dashboard V1 area and the Training Plan summary area.

The report is computed client-side only and uses the browser's native print flow through `window.print()`.

## Files Changed

- `src/features/trainingV1/weeklyReport.js`
- `src/App.jsx`
- `docs/training-v1-4-weekly-report-print.md`

## Report Sections

The Weekly Report modal includes:

- Report Header
- Training Plan Summary
- Weekly Plan Adherence
- Daily Execution Summary
- Goals / Target Gap Summary
- Recent PB Progress
- Footer

## Data Sources

The report reads existing data only:

- `data.tasks`
- `data.trainingPlansV1`
- `data.activeTrainingPlanId`
- `data.competitionGoalsV1`
- existing PB record arrays such as:
  - `records`
  - `records777`
  - `records1000`
  - `records1500`
  - `recordsStart`
  - `recordsLap`

Helpers used:

- existing PB-first helpers from `src/features/trainingV1/goals.js`
- existing report helpers from `src/features/trainingV1/dashboardMetrics.js`
- new pure report aggregator:
  - `getWeeklyTrainingReportData(data, weekStartDateString)`

## Print Behavior

- Weekly Report opens in a modal or overlay.
- Print action uses native `window.print()`.
- No PDF export dependency was added.
- No external print/export package was added.

Print styling is intentionally minimal:

- report content remains readable in print
- report action buttons are hidden in print
- the modal content is isolated for printing as the primary printable area

## Compatibility Confirmation

- No Firestore schema changes were made.
- No new Firestore fields were added.
- No report snapshots are stored.
- No Firestore subcollections were added.
- No migration was introduced.
- Report metrics remain client-side only.
- XP / points behavior was not changed.
- Streak behavior was not changed.
- `completedDays` behavior was not changed.
- Daily task completion semantics were not changed.
- PB record add/delete behavior was not changed.

## Known Limitations

- Print output depends on the browser's native print rendering.
- Report does not generate PDF directly.
- Daily Tasks in the report reflect the current today list, not a historical week snapshot.
- Print layout is intentionally minimal and does not hide every app surface through a global CSS refactor.

## Manual Verification Checklist

- Open Dashboard V1 and confirm the `Weekly Report / 本周报告` button appears.
- Open Training Plan summary and confirm the `Weekly Report / 本周报告` button appears.
- Open the report modal and confirm the header shows:
  - Blaze Skate Training
  - Weekly Training Report / 本周训练报告
  - week date range
  - generated date
  - athlete display name when available
- Confirm Training Plan Summary shows active or fallback plan information.
- Confirm the no-plan empty state appears correctly when no active or fallback plan exists.
- Confirm Weekly Plan Adherence values match the existing Dashboard metrics.
- Confirm Daily Execution Summary shows current Daily Tasks totals and the today-list note.
- Confirm Goals / Target Gap Summary shows up to 3 active goals.
- Confirm Recent PB Progress shows trend data when PB history exists.
- Confirm the no-PB-history empty state appears correctly when no history exists.
- Click Print Report and confirm the browser print dialog opens.
- Confirm closing the report does not write data.

## Validation

Run:

- `npm run lint`
- `npm run build`

There is no `npm run typecheck` script in this project, so typecheck was not run.
