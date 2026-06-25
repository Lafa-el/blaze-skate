# Blaze Skate Training V1.10 Write Service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a safe staged plan for introducing a Training profile write service without changing current write behavior, Firestore schema, or `App.jsx` orchestration semantics.

**Architecture:** Blaze Skate Training currently writes through `App.jsx -> updateData(...) -> saveProfilePatch(...) -> profile/main`. The write service should be introduced as a stabilization layer, not a behavior rewrite. Early phases should centralize patch construction only, keep `App.jsx` as the caller, and preserve the current single-document `profile/main` model.

**Tech Stack:** React, Vite, JavaScript, Firebase Auth, Cloud Firestore, ESLint, existing `npm run smoke:training` helper smoke suite

---

## 1. Executive Summary

Write service extraction is higher risk than UI extraction because it touches behavioral semantics instead of presentation boundaries.

UI extraction work so far has been relatively safe because:

- extracted components are callback-only
- `App.jsx` still owns write orchestration
- Firebase calls still terminate in the same place
- existing data shape remains unchanged

Write service extraction is riskier because even a small mistake can change:

- Daily Tasks completion semantics
- XP / points behavior
- `completedDays` / streak behavior
- cross-day rollover behavior
- Add to Today duplicate prevention
- plan activation / archive / restore rules
- PB record key routing

That is why write service work must be staged.

The correct goal is not "move writes out of `App.jsx` quickly." The correct goal is:

- preserve current semantics exactly
- introduce clearer patch-construction boundaries
- improve auditability one write family at a time
- delay the highest-risk write families until coverage and manual QA are stronger

## 2. Current Write Architecture

Current write architecture summary:

- `src/App.jsx` owns write orchestration
- `updateData(...)` is the current App-level write entrypoint
- `saveProfilePatch(...)` is the current repository-level write entrypoint
- Firestore canonical document remains:
  - `artifacts/blaze-skate-production/users/{uid}/profile/main`
- extracted feature components are intentionally callback-only

Current flow:

1. UI/action handlers in `App.jsx` compute the next state patch
2. `updateData(...)` merges `newData` into current `data`
3. `updateData(...)` updates local React state optimistically
4. `updateData(...)` calls `saveProfilePatch(db, user.uid, safeData)`
5. `saveProfilePatch(...)` persists the merged profile with `setDoc(..., { merge: true })`

Current implications:

- most root-field writes still originate in `App.jsx`
- write semantics are tightly coupled to local state shape
- callback-only component extraction has reduced JSX risk but not write risk
- the write service must fit this architecture first before trying to replace it

## 3. Proposed Future Service Location

Recommended future file:

- `src/services/trainingProfileWrites.js`

Why this location is preferred:

- current repository conventions already use `src/services/` for Firestore-adjacent boundaries
- `profileRepository.js` already owns persistence-level concerns
- a write service beside it is a natural separation:
  - `profileRepository.js`: persistence boundary
  - `trainingProfileWrites.js`: patch-construction and write-family semantics

Why not place it under `src/features/` first:

- feature folders currently work well for pure read-only helpers and UI-focused logic
- the write service is cross-feature by design
- task, plan, PB, rewards, settings, and race writes all converge into the same profile document

Recommended long-term split:

- `src/services/profileRepository.js`
  - Firestore path resolution
  - metadata handling
  - merge persistence
- `src/services/trainingProfileWrites.js`
  - write-family patch builders
  - next-state construction helpers
  - protected semantics wrappers

## 4. Write Service Design Principles

The future write service should follow these design principles:

1. Service functions should be pure around patch construction where possible.
2. Service functions must not change data shape.
3. Service functions must preserve `updateData(...)` / `saveProfilePatch(...)` semantics.
4. The service must not call Firebase directly in early phases unless separately planned.
5. Early service functions should return patch objects or `nextData` objects, not perform writes themselves.
6. `App.jsx` should remain caller/orchestrator at first.
7. Only one write family should be moved per PR.
8. `npm run smoke:training`, `npm run lint`, and `npm run build` are required after each PR.
9. Manual browser QA is required for high-risk write paths.

Practical design rule for the first implementation phases:

- the service is a patch-builder layer, not a persistence layer
- `App.jsx` continues to own:
  - current state
  - callback wiring
  - Firebase context
  - `updateData(...)`
  - all final write invocation

This means the early service should look conceptually like:

- input: current `data`, action inputs
- output: patch object or `nextData` fragment

It should not yet become:

- a second hidden orchestration layer
- a direct Firestore writer
- a new schema adapter

## 5. Candidate Write Families

### Low-risk candidates

These are suitable for the first write service PRs because they are usually isolated settings/profile writes.

- `saveProfileSettingsPatch`
- `setLanguagePreference`
- `setThemePreference`
- `setUsernamePatch`
- `setParentPinPatch`
- `setAvatarPatch`
- similar low-risk UI preference writes if still present and isolated

Why low-risk:

- usually touch one root field
- do not alter XP, streak, rollover, or PB semantics
- easier to validate by source inspection plus spot browser QA

### Medium-risk candidates

- `saveGoal`
- `archiveGoal`
- `savePlan`
- `archivePlan`
- `restorePlan`
- `setActivePlan`
- `createPlanFromTemplate`
- `initializeLindsayDefaults`
- `importAcademyTask`
- `importAcademyRoutine`
- race add/edit/delete patch builders

Why medium-risk:

- they affect planning and content flows
- they often rewrite full arrays
- they must preserve goal shape, plan shape, archive status, and `activeTrainingPlanId` rules
- they still should not affect XP or streak directly

### High-risk candidates

- `completeDailyTask`
- `uncompleteDailyTask`
- `crossDayRollover`
- `addPlanTaskToToday`
- PB add/delete patch builders
- reward redemption / points spending

Why high-risk:

- they affect or depend on shared progress semantics
- downstream UI and reporting assume exact current behavior
- small changes can silently corrupt user-visible progress state

## 6. Recommended Extraction Order

### Phase 0

- Add more smoke coverage for write-adjacent helpers if needed.
- Keep `App.jsx` as the write owner.
- Do not move Firebase calls.
- Do not change `updateData(...)`.
- Do not change `saveProfilePatch(...)`.

Phase 0 goal:

- improve confidence before code-moving write work begins

### Phase 1

- Extract low-risk patch builders only.
- Keep service functions pure.
- Return patch objects only.
- `App.jsx` still calls `updateData(...)`.

Examples:

- language
- theme
- username
- parent PIN
- avatar

Phase 1 goal:

- prove the write service pattern without touching protected semantics

### Phase 2

- Extract Goals write patch builders.
- Extract Plans write patch builders except Add to Today.
- Preserve `activeTrainingPlanId` semantics exactly.

Examples:

- save goal
- archive goal
- save plan
- archive plan
- restore plan
- set active plan
- create plan from template

Phase 2 goal:

- centralize medium-risk planning writes while keeping daily execution untouched

### Phase 3

- Extract Academy and races patch builders.
- Keep import semantics unchanged.
- Keep imported Academy tasks flowing into `data.tasks` exactly as they do now.

Phase 3 goal:

- reduce more `App.jsx` write noise without touching the highest-risk semantics

### Phase 4

- Only after manual QA and smoke expansion, consider:
  - Add to Today
  - PB add/delete

Phase 4 goal:

- isolate bridge and PB write families only when matching and key-routing behavior are better protected

### Phase 5

- Only after strong coverage and repeated manual QA, consider:
  - Daily Tasks completion/uncompletion
  - XP / points update semantics
  - `completedDays` writes
  - cross-day rollover

Phase 5 goal:

- treat the most dangerous behavioral write paths as the final extraction stage, not the first

## 7. Explicit No-Go Areas for the First Implementation PR

The first write service code PR must not touch:

- `toggleTask`
- `completedDays`
- `points`
- cross-day rollover
- Add to Today
- PB add/delete
- reward redemption
- `taskHistory`

Reason:

- these paths are the core user-progress contract
- moving them too early would create a high chance of silent regression

## 8. First Recommended Code-Changing PR

Recommended future PR:

- **V1.10 Step 2: Create write service skeleton + low-risk profile/settings patch builders only**

Expected files in that future PR:

- `src/services/trainingProfileWrites.js`
- `docs/training-v1-10-write-service-skeleton.md`

What that PR should do:

- introduce the write service file
- add a small low-risk exported patch-builder surface
- keep `App.jsx` as the write caller
- keep `updateData(...)` unchanged
- keep `saveProfilePatch(...)` unchanged

What that PR must not do:

- no Firebase direct calls from the new service
- no XP / streak changes
- no Daily Task completion changes
- no PB changes
- no schema changes

## 9. Validation Requirements by Risk Level

### Low-risk PR

Required:

- `npm run smoke:training`
- `npm run lint`
- `npm run build`
- spot browser QA

Focus:

- settings/profile UI still works
- no console errors
- no unexpected data resets

### Medium-risk PR

Required:

- all low-risk checks
- manual browser QA checklist
- focused data before/after notes

Focus:

- plan/goal/archive behavior unchanged
- `activeTrainingPlanId` behavior unchanged
- template/default behavior unchanged

### High-risk PR

Required:

- all medium-risk checks
- test account required
- document expected data mutations before testing
- backup/export `profile/main` before testing if feasible
- no production release without manual sign-off

Focus:

- Daily Tasks / XP / streak semantics
- rollover behavior
- Add to Today behavior
- PB write safety

## 10. Manual QA Requirements

Reference:

- [docs/training-manual-browser-qa-checklist.md](/Users/Lafa_el%201/Projects/blaze-skate-training/docs/training-manual-browser-qa-checklist.md)

Mandatory checklist sections for write service work:

- Tasks / XP / Streak
- Plans
- PB / Data
- Academy
- Shop / Rewards
- Profile / settings

Why these sections are mandatory:

- the write service will eventually cross these boundaries even when a PR touches only one family
- regression risk in one root-field write can surface in another tab because the app still writes one merged `profile/main` document

## 11. Rollback Strategy

Rollback guidance for future write service PRs:

1. Use `git revert` for code rollback.
2. Use Vercel rollback if a bad write-service deployment reaches preview or production.
3. Avoid data migrations until a separate architecture plan exists.
4. If a write bug affects data:
   - stop using the affected feature immediately
   - inspect `profile/main` before further writes
   - document what fields were expected to change vs what changed

The key principle:

- code rollback is fast
- data rollback is not

That is why schema-preserving staged extraction is required.

## 12. Relationship to SkatingX Platform

This write service is a stabilization step for the standalone Training app.

It does not:

- replace SkatingX consolidation
- introduce a shared cross-app write model
- perform any data migration now

What it can do later:

- create clearer service boundaries
- make future Training-to-SkatingX migration reasoning easier
- reduce ambiguity about what the Training app writes today

So the relationship is:

- short-term: stabilize Blaze Skate Training
- long-term: inform, but not replace, SkatingX consolidation planning

## 13. Explicit Non-Changes

This planning step makes the following explicit:

- no source changes
- no schema changes
- no write changes
- no helper changes
- no UI changes
- no dependencies

Only the planning document is added in this step.

## 14. File Structure for Future Work

Planned future write-service file structure:

- `src/services/profileRepository.js`
  - Firestore path
  - metadata handling
  - persistence boundary
- `src/services/trainingProfileWrites.js`
  - write-family patch builders
  - service-level semantics wrappers
- `docs/training-v1-10-write-service-skeleton.md`
  - documents first implementation PR scope and QA boundary

## 15. Recommended Future Tasks

### Task 1: V1.10 Step 2

**Files:**
- Create: `src/services/trainingProfileWrites.js`
- Create: `docs/training-v1-10-write-service-skeleton.md`
- Modify: `src/App.jsx`

- [ ] Add a new service file with low-risk patch-builder exports only.
- [ ] Keep `App.jsx` as the caller and continue routing writes through `updateData(...)`.
- [ ] Move only low-risk profile/settings patch construction into the new service.
- [ ] Verify that no Firebase calls are added to the new service.
- [ ] Run `npm run smoke:training`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run spot browser QA for settings/profile flows.

### Task 2: V1.10 Step 3

**Files:**
- Modify: `src/services/trainingProfileWrites.js`
- Modify: `src/App.jsx`
- Create: `docs/training-v1-10-goals-plans-write-patches.md`

- [ ] Add medium-risk goal patch builders.
- [ ] Add medium-risk plan patch builders except Add to Today.
- [ ] Preserve `activeTrainingPlanId` semantics exactly.
- [ ] Record before/after behavior notes for goal and plan writes.
- [ ] Run `npm run smoke:training`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run manual browser QA for Goals and Plans.

### Task 3: V1.10 Later

**Files:**
- Modify: `src/services/trainingProfileWrites.js`
- Modify: `src/App.jsx`
- Create: `docs/training-v1-10-high-risk-write-migration-notes.md`

- [ ] Expand smoke coverage before touching high-risk write families.
- [ ] Plan Add to Today and PB writes separately from Daily Tasks completion.
- [ ] Treat Daily Tasks completion and rollover as the last write-service stage.
- [ ] Require manual sign-off before any production release that touches high-risk write families.

## 16. Validation

Required commands for this planning step:

```bash
npm run smoke:training
npm run lint
npm run build
```

Clarification:

- `npm run typecheck` is not available in this project

## 17. Self-Review

Spec coverage check:

- executive summary included
- current write architecture summarized
- future service location recommended
- design principles included
- candidate write families grouped by risk
- extraction order staged
- explicit no-go areas documented
- first future code-changing PR recommended
- validation by risk level included
- manual QA requirements tied to existing checklist
- rollback strategy documented
- SkatingX relationship documented
- explicit non-changes documented

Placeholder scan:

- no `TODO`
- no `TBD`
- no deferred unnamed implementation steps

Type/semantic consistency:

- canonical Firestore path kept as `artifacts/blaze-skate-production/users/{uid}/profile/main`
- `updateData(...)` / `saveProfilePatch(...)` remain the preserved current write entrypoints
- write service remains patch-builder-first in early phases
