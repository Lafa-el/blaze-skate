# Blaze Skate Training V1 Step 7 UX Polish

Date: 2026-06-23

## Goal

Polish the Blaze Skate Training V1 user experience for product readiness without adding major features or changing application logic.

## Scope

Step 7 was limited to:

- Dashboard V1 visual hierarchy and mobile wrapping.
- Goals view empty state, card polish, button hierarchy, and form hints.
- Training Plan view empty state, card polish, plan-task hierarchy, and form hints.
- English and Chinese copy consistency for V1 terms.
- Placeholder examples for goal, plan, and plan-task forms.

## Explicitly Out of Scope

This step did not:

- Add React Router or URL routes.
- Add Firestore subcollections.
- Migrate data.
- Add dependencies.
- Rewrite or split `App.jsx`.
- Change task completion logic.
- Change XP, points, or old streak logic.
- Change Academy import behavior.
- Change Rewards or Shop behavior.
- Change PB records or race logic.
- Auto-seed Lindsay defaults.
- Change V1 helper semantics.

## Files Changed

- `src/App.jsx`
  - Refined V1 bilingual copy.
  - Added explicit placeholder and label translation keys.
  - Improved V1 Dashboard card wrapping and empty-state readability.
  - Improved Goals view layout, archive button hierarchy, and form labels.
  - Improved Training Plan layout, plan-task status display, secondary Add to Today action, and modal labels.

- `docs/training-v1-step7-ux-polish.md`
  - Added this implementation report.

## UX Changes

### Dashboard V1

- Lindsay defaults card now wraps button and text more safely on narrow screens.
- Empty states use clearer product guidance:
  - Goals: connect training with race outcomes.
  - Plans: create a weekly plan to organize daily work.
  - Today Plan Tasks: clearly states there are no tasks for today.
- Target Gap and goal metric cards retain existing calculations but improve label consistency.

### Goals

- Header and primary action wrap better on mobile.
- Empty state now separates the section title from the guidance copy.
- Goal card badges wrap safely.
- Archive action is visually more cautious with a red border treatment.
- Goal form now includes explicit labels and requested example placeholders:
  - `AGN 2027 500m`
  - `Age Group Nationals 2027`
  - `500m`
  - `49.8`
  - `48.0`

### Training Plan

- Header and primary action wrap better on mobile.
- Empty state now uses the requested weekly-plan guidance.
- Plan hero title and focus can wrap instead of truncating aggressively.
- Plan Tasks heading uses a translation key.
- Completed plan tasks show a clear completed state.
- Add to Today is now a secondary inline action instead of a full-width primary-looking button.
- Plan and plan-task modals now include explicit labels and requested placeholders:
  - `Summer Training Week`
  - `Corner technique and starts`
  - `Ice Training`
  - `Corner entry and exit power`
  - `90`

## Data and Compatibility

No Firestore schema changes were made.

Existing V1 data remains compatible:

- `competitionGoalsV1`
- `trainingPlansV1`
- `trainingPlansV1.days`
- `trainingPlansV1.days.tasks`

No task, XP, streak, Academy, Shop, PB, race, auth, or Firebase write behavior was intentionally changed.

## Risk Notes

- `src/App.jsx` remains a large mixed UI and business-logic file. Future V1 work should continue to be additive and narrow until an approved extraction plan exists.
- V1 Dashboard depends on existing helper outputs. UI-only changes should keep using current helper functions instead of recalculating metrics in render blocks.
- The Lindsay defaults control remains manual and disabled once defaults exist; this step did not change seeding behavior.

## Verification Plan

Run:

- `npm run lint`
- `npm run build`

There is no `npm run typecheck` script in the current package configuration.
