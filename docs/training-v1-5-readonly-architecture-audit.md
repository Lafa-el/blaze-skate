# Blaze Skate Training V1.5 Read-only Architecture Audit

Date: 2026-06-24

## Executive Summary

Blaze Skate Training has reached a functionally mature single-app state for short-term athlete and parent use. Core capability coverage is broad: Daily Tasks, XP, streak, Academy import, PB records, races, goals, plans, dashboard reporting, and weekly reporting are all present in the same application shell.

The main architecture risk is not missing product capability. It is concentration of responsibility.

Current state:

- `src/App.jsx` is still the router, state container, Firestore write coordinator, translation host, modal manager, and primary renderer.
- `profile/main` remains a single growing Firestore document with many root fields and array-heavy writes.
- The helper layer under `src/features/trainingV1/` is mostly pure and reusable, but date utilities and task matching logic are duplicated across files.
- Validation relies on lint, build, and manual smoke checks. There are no formal tests and no typecheck pipeline.
- Vendor chunk splitting has reduced bundle risk for now, but growth pressure remains because most product code still lives in one eagerly imported file.

Recommendation:

- V1.5 should not add new product features.
- V1.5 should focus on extraction and stabilization:
  - component extraction from `App.jsx`
  - shared date/task-match utilities
  - formal helper tests
  - Firestore write guardrails
  - a documented manual QA checklist
- V1.6+ can then tackle React Router, TypeScript, and Firestore document decomposition or subcollections as part of a planned migration rather than ad hoc feature work.

## Current Architecture Snapshot

Current application shape:

- Framework: React 19 + Vite 8 + JavaScript
- Navigation: `activeTab` state, no React Router
- Data store: Firestore single-document profile model
  - `artifacts/blaze-skate-production/users/{uid}/profile/main`
- Auth: Firebase Auth with anonymous sign-in plus account linking/sign-in
- UI style: one large `App.jsx` with inline view/modal render functions
- Feature helper layer: `src/features/trainingV1/*.js`
- Validation scripts:
  - `npm run lint`
  - `npm run build`
- Missing validation layers:
  - no `npm run typecheck`
  - no unit tests
  - no browser/integration tests

Key file sizes:

- `src/App.jsx`: 6788 lines
- `src/features/trainingV1/goals.js`: 302 lines
- `src/features/trainingV1/plans.js`: 214 lines
- `src/features/trainingV1/dashboardMetrics.js`: 273 lines
- `src/features/trainingV1/planTemplates.js`: 408 lines
- `src/features/trainingV1/weeklyReport.js`: 81 lines
- `src/features/trainingV1/trainingV1Defaults.js`: 171 lines
- `src/services/profileRepository.js`: 33 lines
- `vite.config.js`: 33 lines

## App.jsx Complexity Assessment

### Findings

`src/App.jsx` is the dominant architecture hotspot.

Measured complexity:

- Approximate line count: 6788
- `useState` count: 71
- `useEffect` count: 7
- modal-like state count (`show*`): 16
- `updateData(...)` call sites: 39

Major responsibilities currently inside `App.jsx`:

- app bootstrap
- Firebase auth state handling
- Firestore subscription lifecycle
- Firestore write orchestration
- default data model definition
- language strings and theme maps
- date/time formatting helpers
- Daily Tasks CRUD and scoring behavior
- PB record CRUD
- races CRUD
- reward/shop CRUD
- Academy import workflow
- goal CRUD and goal detail modal
- training plan CRUD
- plan template creation flow
- plan task CRUD and completion
- weekly report modal and print action
- settings/profile/account modals
- activeTab navigation and tab rendering

View and modal concentration:

- inline views: Dashboard, Calendar, Tasks, Stats, Goals, Training Plan, Data, Shop, Settings, Academy
- inline modals/components: HistoryDetail, RecordManagement, RaceManagement, ShopItemManagement, GoalManagement, GoalDetail, WeeklyReport, PlanManagement, TemplatePlanManagement, PlanTaskManagement, Profile, RewardHistory, Auth, AccountManagement, ProShowcase

### Assessment

`App.jsx` is acting as all of the following at once:

- router
- state container
- data layer coordinator
- modal controller
- feature orchestrator
- UI renderer

This was acceptable for V1 and early additive iterations. It is now a high-risk bottleneck.

### Risks

- every new feature increases merge conflict probability
- unrelated bugs become easier to introduce during local changes
- view-level regressions are harder to isolate
- manual QA surface expands because state and rendering are tightly coupled
- code-splitting by route or feature is blocked because everything is eagerly imported

### Recommendation

Continuing feature development primarily inside `App.jsx` is a P1 architecture risk.

Short-term:

- keep behavior unchanged
- extract presentational sections and modal shells first
- preserve current `updateData` behavior while reducing local complexity

## Feature Helper Assessment

Inspected files:

- `src/features/trainingV1/goals.js`
- `src/features/trainingV1/plans.js`
- `src/features/trainingV1/dashboardMetrics.js`
- `src/features/trainingV1/planTemplates.js`
- `src/features/trainingV1/weeklyReport.js`
- `src/features/trainingV1/trainingV1Defaults.js`

### What is working well

Most training V1 helpers are clean pure functions.

Strong areas:

- goals PB-first logic is mostly isolated in `goals.js`
- plan object creation/update helpers are isolated in `plans.js`
- dashboard summarization is separated from rendering in `dashboardMetrics.js`
- weekly report aggregation is kept read-only in `weeklyReport.js`
- template generation is deterministic and side-effect free in `planTemplates.js`

This helper layer is currently the best foundation for formal testing and future extraction.

### Duplication and boundary issues

#### 1. Date handling duplication

`toDateString` and `addDays` are duplicated across:

- `plans.js`
- `dashboardMetrics.js`
- `planTemplates.js`
- `weeklyReport.js`
- `trainingV1Defaults.js`
- `App.jsx`

Impact:

- local fixes to date parsing/formatting must be repeated
- timezone or malformed-date behavior can drift by file
- future migration to a shared date utility becomes harder the longer duplication persists

#### 2. Task matching logic is partially split

Task matching by normalized text + target is centered on `normalizeTaskText` in `plans.js`, but related match-key behavior is reassembled inside `dashboardMetrics.js`.

Impact:

- matching semantics are mostly consistent now, but not fully centralized
- future changes to equivalence rules could diverge between plan status UI and dashboard/report metrics

#### 3. Record-key logic still exists in multiple places

Distance-to-record-key mapping exists in helper form inside `goals.js`, but a separate `getRecordsKey` still exists in `App.jsx`.

Impact:

- PB lookup logic and record CRUD logic are not fully sourced from one shared utility
- future distance expansion increases drift risk

#### 4. Helper boundaries are good but not fully normalized

`weeklyReport.js` is intentionally thin and good in shape, but it still owns date helpers locally rather than importing a shared utility.

`trainingV1Defaults.js` is useful, but it mixes:

- default field declarations
- Lindsay seed heuristics
- default goal generation
- default plan generation

This is still manageable, but it is already acting like more than one module.

### Recommendation

The helper layer is in decent shape and should be preserved. V1.5 should standardize shared utilities rather than redesign helper APIs.

Priority helper cleanups:

- shared date utility
- shared task match key utility
- shared record-distance key utility

## Firestore Data Model Assessment

### Current model

Firestore path remains:

- `artifacts/blaze-skate-production/users/{uid}/profile/main`

Write path:

- `App.jsx` merges local state with patch in `updateData(...)`
- `saveProfilePatch(...)` writes with `setDoc(..., { merge: true })`
- profile subscription is handled by `subscribeToProfile(...)`

Current root model observations:

- `defaultData` contains 34 root fields before considering nested structures
- several root fields are arrays that can grow over time:
  - `tasks`
  - `completedDays`
  - `customRewards`
  - `rewardHistory`
  - `races`
  - `competitionGoalsV1`
  - `trainingPlansV1`
  - record arrays such as `records`, `records777`, `records1000`, `records1500`, `recordsStart`, `recordsLap`
- nested structures also grow:
  - `taskHistory`
  - `weeklyTemplate`
  - `trainingPlansV1[].days[].tasks[]`

### Risks

#### Root field growth

Single-document growth is now a meaningful medium-term risk.

Risks include:

- Firestore document size pressure
- larger snapshot payloads on every subscription update
- larger write payloads because full merged objects are written back
- slower mobile experience on weak networks

#### Concurrent write risk

`updateData(...)` reads current React state, merges a patch, then saves the merged full object.

That pattern is simple and has worked, but it creates last-write-wins risk when:

- multiple UI actions happen close together
- multiple tabs/devices are open
- snapshot timing races with local writes

This is especially sensitive for array fields such as:

- tasks
- records
- training plans
- rewards
- races

#### Single-document coupling

Because all major product data sits in one document:

- unrelated features share the same write surface
- auditability is limited
- migration cost grows with every new additive root field

### Assessment

Short-term recommendation:

- keep `profile/main` for V1.5

Reason:

- the user explicitly wants non-destructive work in this step
- a migration now would create more risk than value
- the app is still using a single-shell architecture, so splitting persistence before UI/module extraction would be premature

Medium-term recommendation:

- start migration design work in V1.6+
- do not migrate yet, but prepare target subcollection/entity boundaries and field ownership rules

## Navigation Assessment

### Current model

Navigation is entirely `activeTab` based.

Rendered tabs include:

- dashboard
- tasks
- academy
- goals
- plans
- data
- shop

### Benefits

- simple
- low runtime complexity
- no route configuration overhead
- adequate for a parent/athlete single-session mobile app

### Limitations

- no deep link to Goals, Plans, or Weekly Report
- no shareable URLs
- no browser history semantics per feature
- no route-based code splitting
- no isolated page ownership
- harder future SkatingX integration because app state is tied to one root component

### Risk assessment

Current risk level: P2 for short-term use, P1 for medium-term scaling.

For the current standalone Training app:

- acceptable for now

For future platform consolidation:

- limiting

## Testing / QA Assessment

### Current state

Package scripts:

- `dev`
- `build`
- `lint`
- `preview`

Missing:

- no test script
- no typecheck script
- no test files found

Current QA mode is effectively:

- source inspection
- helper smoke checks
- lint
- build
- manual browser QA

### Highest-risk helpers that should get tests first

P1 helper test candidates:

- `getGoalCurrentPerformance`
- `getBestRecordForDistance`
- `getGoalTargetGapHistory`
- `getGoalTrendSummary`
- `getDailyTasksMatchedToPlanTasks`
- `getWeeklyPlanAdherenceSummary`
- `getWeeklyTrainingReportData`
- plan archive/restore/active selection helpers

P2 test candidates:

- template generation shape
- Lindsay default-seeding heuristics
- plan-task daily status helpers

### Assessment

The current smoke-check style proved useful during V1.1-V1.4, but it should now be formalized into real tests.

The absence of TypeScript is less urgent than the absence of helper tests.

## Build / Bundle Assessment

### Current state

`vite.config.js` already applies vendor chunk grouping:

- `react-vendor`
- `firebase-vendor`
- `icons-vendor`
- `vendor`

This is the mechanism that previously resolved the large chunk warning.

### Assessment

Conceptually, the bundle situation is controlled but fragile.

Why controlled:

- vendor chunk splitting is present
- current build passes
- previous large chunk warning mitigation is still in place

Why fragile:

- application code is still heavily concentrated in `App.jsx`
- route-level or feature-level lazy loading is not available
- future dashboard/reporting additions will continue landing in the main application chunk unless extraction happens first

### Recommendation

V1.5 should not change Vite config in this step, but should reduce main-chunk pressure indirectly by:

- extracting feature components
- extracting shared view logic
- preparing future lazy boundaries

## Product Architecture Assessment

### Functional maturity

For short-term use, the Training app is now mature enough.

It covers:

- daily execution
- motivation/reward loop
- PB tracking
- goals
- planning
- weekly summaries

### What should happen next

New feature work should pause after V1.4 unless there is a specific release need.

The system is now at the point where additional feature work inside the current architecture will likely increase maintenance cost faster than product value.

Recommended focus order:

1. extraction
2. helper tests
3. Firestore guardrails
4. manual QA formalization
5. platform integration planning

## SkatingX Migration Readiness

### Concepts that map well to SkatingX

Likely migration entities:

- athlete profile
- goals
- training plans
- daily tasks
- PB records
- rewards
- weekly reports

These concepts are already structurally identifiable, even if they still live in one document.

### What is ready now

Ready for conceptual mapping:

- goals data
- plan data
- plan tasks
- PB record families by distance
- daily tasks
- profile metadata alignment

### What should remain in standalone Training for now

Keep local to Training for now:

- activeTab shell
- standalone reward/shop UX
- Academy-specific training import behavior
- Weekly Report modal and print UX
- current parent-oriented settings flow

### What should be prepared for consolidation

Prepare for future SkatingX consolidation:

- entity ownership documentation
- field inventory for `profile/main`
- migration target model draft
- compatibility strategy for PB arrays and plan/task structures
- UI boundaries that can later map to routed platform screens

## Risk Matrix

| Priority | Issue | Why it matters | Recommendation |
| --- | --- | --- | --- |
| P0 | None found | No release blocker was identified in this read-only audit. | Keep current shipped app stable. |
| P1 | `App.jsx` monolith | 6788-line file owns routing, state, data, and rendering, making change risk high. | Freeze product expansion and start component extraction. |
| P1 | Single `profile/main` doc growth | Root-field sprawl, array-heavy writes, and snapshot size will keep growing. | Keep current model for V1.5, prepare migration design for V1.6+. |
| P1 | No formal helper tests | PB logic, adherence metrics, and report aggregation are now important enough to deserve real regression coverage. | Add helper unit tests first. |
| P2 | Duplicated date and match utilities | Shared semantics can drift between plan, dashboard, and weekly report logic. | Centralize date and task-match utilities. |
| P2 | activeTab-only navigation | No deep links, no shareable URLs, no route-level ownership. | Defer to V1.6+ after extraction. |
| P2 | Full-object merge writes | Concurrent edits can overwrite sibling changes across devices/tabs. | Add write guardrails and patch ownership discipline. |
| P3 | No TypeScript | Reduces static guarantees, but current higher risk is test coverage and module boundaries. | Plan incremental TypeScript after extraction. |

## Recommended V1.5 Plan

Recommended V1.5 theme:

- no new product features

Recommended workstreams:

### 1. Component extraction plan

- extract Dashboard V1 area
- extract Goals area and related modals
- extract Training Plan area and related modals
- extract Data/PB management area
- extract Settings/Profile/Auth modal cluster

Goal:

- reduce `App.jsx` responsibility without changing behavior

### 2. Helper unit test plan

Start with pure helpers only.

First targets:

- PB lookup and trend helpers
- plan matching and adherence helpers
- weekly report aggregation
- plan archive/restore selection behavior
- template generation shape

### 3. Data model guardrails

- document root field ownership
- document which flows rewrite large arrays
- define patch discipline for future work
- identify candidate entities for future split

### 4. Manual QA checklist formalization

- convert current repeated smoke checks into a stable release checklist
- keep it repo-local in docs until automated tests exist

## Recommended V1.6+ Plan

Potential V1.6+ themes:

- React Router adoption
- TypeScript migration
- Firestore subcollection migration
- SkatingX consolidation preparation
- automated browser tests

Recommended order:

1. shared component boundaries in place
2. helper tests in place
3. route boundaries
4. persistence decomposition
5. platform-level consolidation

## Explicit Non-Changes

This audit did not:

- modify source code
- change UI
- change application behavior
- change Firestore schema
- create Firestore subcollections
- migrate data
- add dependencies
- introduce React Router
- split `App.jsx`
- add tests
- change Vite config

Only the audit report file was added.

## Validation Results

Validation required after report creation:

- `npm run lint`
- `npm run build`

There is no `npm run typecheck` script in this project, so typecheck should not be claimed.
