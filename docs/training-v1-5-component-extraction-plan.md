# Blaze Skate Training V1.5 Component Extraction Plan

Date: 2026-06-24

## Executive Summary

`src/App.jsx` must be split gradually because it is already acting as the application shell, navigation controller, state container, Firestore write coordinator, and primary renderer for nearly every shipped feature. That concentration is now the main maintenance risk in the Training app.

This should be a stabilization phase, not a feature phase.

Reason:

- V1 through V1.4 delivered broad product coverage already.
- New feature work inside the current monolith will raise regression risk faster than product value.
- The current Firestore and navigation constraints require a low-risk extraction path that preserves behavior.

Recommended rule for V1.5:

- no new product features
- extract only in small, behavior-preserving phases
- keep `App.jsx` as source of truth until the component tree is stable

## Current Responsibility Map

Current `src/App.jsx` responsibilities:

### App bootstrap

- app initialization
- Firestore persistence initialization
- default data initialization
- translation and theme configuration

### Auth / profile loading

- Firebase Auth anonymous sign-in
- linked account sign-in/linking
- auth modal state
- profile subscription lifecycle

### Firestore write coordination

- `updateData(...)` orchestration
- `saveProfilePatch(...)` coordination
- merged local state writes
- local optimistic `setData(...)` before save

### Navigation

- `activeTab` state
- tab rendering
- main mobile navigation shell

### Daily Tasks

- task create/edit/delete
- task complete/uncomplete
- daily bonus logic
- streak and `completedDays` interaction
- task history and calendar views

### Academy

- Academy content rendering
- weekly import flow
- single-item import flow
- Academy selection state

### Data / PB

- distance switching
- PB record add/delete
- record modal
- stats/data rendering

### Shop / Rewards

- reward redemption
- custom reward CRUD
- reward history modal

### Goals

- goal create/edit/archive
- goal list rendering
- PB-first progress display
- target gap trend display

### Goal Detail Modal

- read-only goal detail rendering
- trend summary
- recent PB rows
- modal state and modal actions

### Plans

- training plan create/edit/select
- plan task create/edit/complete
- Add to Today workflow
- plan active-state coordination

### Plan Templates

- template creation modal
- duplicate prevention
- template-to-plan flow

### Plan Archive

- archive / restore flow
- current vs archived plan presentation
- active plan safety handling

### Dashboard

- V1 dashboard sections
- goals summary
- plan summary
- weekly adherence
- today execution summary

### Weekly Report

- weekly report modal
- report section rendering
- browser-native print

### Profile / settings

- language and theme
- parent PIN
- points settings
- distances and races settings
- account/profile modals

### Modal orchestration

Current modal and modal-like render blocks include:

- HistoryDetailModal
- RecordManagementModal
- RaceManagementModal
- ShopItemManagementModal
- GoalManagementModal
- GoalDetailModal
- WeeklyReportModal
- PlanManagementModal
- TemplatePlanManagementModal
- PlanTaskManagementModal
- ProfileModal
- RewardHistoryModal
- AuthModal
- AccountManagementModal
- ProShowcaseModal

## Proposed Component Structure

Recommended target structure should follow the current repo style and remain incremental.

Suggested structure:

```text
src/
  components/
    layout/
    shared/
    modals/

  features/
    dashboard/
    goals/
    plans/
    weeklyReport/
    dailyTasks/
    academy/
    records/
    rewards/
    profile/

  features/trainingV1/
    goals.js
    plans.js
    dashboardMetrics.js
    planTemplates.js
    weeklyReport.js
    trainingV1Defaults.js
```

Guidance:

- keep pure business helpers in `src/features/trainingV1/` initially
- move UI pieces out first, not data semantics
- introduce `src/components/shared/` only for reusable display primitives
- introduce feature folders only when a view or modal becomes meaningfully separated

Recommended early extraction targets:

- `src/components/shared/StatCard.jsx`
- `src/components/shared/EmptyState.jsx`
- `src/components/shared/SectionHeader.jsx`
- `src/components/modals/ModalShell.jsx`

Then feature-level UI:

- `src/features/goals/components/GoalCard.jsx`
- `src/features/goals/components/GoalDetailModal.jsx`
- `src/features/plans/components/PlanCard.jsx`
- `src/features/weeklyReport/components/WeeklyReportModal.jsx`
- `src/features/dashboard/components/*`

## Extraction Order

The safest extraction sequence is staged by behavior risk.

### Phase 1: Pure presentational components only

Scope:

- `StatCard`
- `EmptyState`
- `SectionHeader`
- `ModalShell`
- `ConfirmDialog` only if it remains a UI wrapper around existing callbacks

Rules:

- no feature logic movement
- no new write paths
- no state ownership changes
- only prop-based rendering extraction

Why first:

- highest reuse
- lowest regression risk
- reduces JSX duplication quickly

### Phase 2: Low-risk feature views

Scope:

- `GoalDetailModal`
- `WeeklyReportModal`
- display-only report subsections
- `GoalCard`
- `PlanCard`

Rules:

- extracted components remain controlled by `App.jsx`
- callbacks stay defined in `App.jsx`
- helper calls may remain in parent first if needed for safety

Why second:

- these are read-heavy
- they are visually distinct
- they have lower write risk than tasks/settings flows

### Phase 3: Feature views with callbacks

Scope:

- `GoalsView`
- `PlansView`
- Dashboard V1 sections

Suggested decomposition:

- dashboard summary cards
- today execution section
- weekly adherence section
- goals list area
- plans list and summary area

Rules:

- keep state source in `App.jsx`
- move render trees and UI event plumbing only
- preserve existing callback contracts

### Phase 4: High-risk legacy views

Scope:

- Daily Tasks
- Academy
- Data / PB records
- Shop / Rewards
- Profile / settings

Why last:

- these contain more write paths
- they affect XP, streak, PB records, imports, and settings persistence
- regression cost is higher

## Risk Classification

### Low risk

- read-only modal components
- display-only cards
- static report sections
- shared layout wrappers
- empty-state components

Examples:

- GoalDetailModal shell
- WeeklyReportModal shell
- section headers
- stat cards

### Medium risk

- Goals view
- Plans view
- Dashboard V1 sections

Why:

- they orchestrate callbacks and derived helper data
- they are not purely static, but they are less write-heavy than legacy flows

### High risk

- Daily Tasks
- XP / streak logic
- Academy import
- PB add/delete
- Shop redemption
- Profile/settings writes

Why:

- these areas mutate core data directly
- they affect reward loops and record data
- they have more UI state plus more write surfaces

## State Management Rules

Strict extraction rules:

1. `App.jsx` remains source of truth initially.
2. Extracted components receive props and callbacks from `App.jsx`.
3. No new duplicate local state unless it is strictly UI-only.
4. No extracted component calls Firebase directly.
5. No extracted component writes Firestore directly.
6. All writes remain routed through existing `updateData(...)` / `saveProfilePatch(...)` flow.
7. Do not change data shape.
8. Do not move business rules into new UI components unless they are already pure helpers.
9. Prefer derived props over re-deriving state in child components.
10. If a child needs helper data, prefer parent-computed props first unless the helper is already stable and pure.

Acceptable local state in extracted components:

- modal open/close animation flags if purely visual
- temporary UI-only toggles
- local hover, collapse, or disclosure state

Not acceptable initially:

- duplicate copies of `data`
- local task arrays
- local goal arrays
- local plan arrays
- direct save logic

## Firestore Write Guardrails

Extraction must preserve all existing write behavior.

Guardrails:

- no new write paths
- no new root fields
- no subcollections
- no batch migrations
- no rewrite of `profile/main` ownership
- preserve existing `updateData(...)` semantics
- preserve existing `saveProfilePatch(...)` usage

Planning note:

- any future write wrapper or repository expansion should be scoped as a separate stabilization task
- it should not be mixed into component extraction unless a blocker is discovered

## Testing Strategy

Tests should start with pure helpers before or alongside component extraction.

Priority helper test targets:

- `src/features/trainingV1/goals.js`
  - PB lookup
  - current performance selection
  - target gap history
  - trend summary

- `src/features/trainingV1/dashboardMetrics.js`
  - today execution summary
  - weekly adherence summary
  - dashboard training plan selection

- `src/features/trainingV1/weeklyReport.js`
  - weekly report aggregation
  - empty-state-safe output

- `src/features/trainingV1/plans.js`
  - active plan selection
  - archive / restore behavior
  - Add to Today match logic
  - weekly completion helpers

Future shared utility test targets once centralized:

- task matching utility
- date utility
- PB record-key utility

Do not implement tests in this step.

## Manual QA Checklist for Each Extraction PR

Every extraction PR should re-check:

- Dashboard loads
- Tasks tab loads
- task complete / uncomplete works
- XP / points behavior unchanged
- streak / `completedDays` behavior unchanged
- Goals render correctly
- Goal Detail Modal opens and closes correctly
- Plans render correctly
- Add to Today still works
- Plan Archive / Restore still works
- Weekly Report opens, closes, and prints correctly
- PB add / delete still works
- Academy import still works
- Shop / Rewards behavior unchanged
- Profile / settings changes still persist
- language toggle still works
- theme switching still works
- no new browser console errors

Recommended discipline:

- extraction PRs should stay small
- one PR should move one cluster only
- do not combine extraction with behavior fixes unless release-blocking

## Recommended First Actual Refactor

Recommended first code-changing step after this plan:

- Blaze Skate Training V1.5 Step 3: Extract shared UI components only

Suggested first extraction PR:

- `ModalShell`
- `EmptyState`
- `StatCard`
- `SectionHeader`

Why this first:

- highest reuse across Dashboard, Goals, Plans, Weekly Report, and settings surfaces
- minimal business-logic movement
- creates the foundation needed for later modal/view extraction
- should not change feature behavior

## Explicit Non-Changes

This planning step does not:

- add React Router
- add TypeScript
- migrate Firestore
- add subcollections
- add product features
- add dependencies
- modify source code
- change UI
- change app behavior

Only the planning document is created.

## Validation

After creating this document, run:

- `npm run lint`
- `npm run build`

There is no `npm run typecheck` script in this project, so typecheck should not be claimed.
