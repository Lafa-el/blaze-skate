# Blaze Skate Training Firestore Write Guardrails

## 1. Purpose

This document exists to protect existing user data and prevent accidental write-path or schema changes during future refactors.

Its goals are:

- preserve the current Firestore write model
- make protected data semantics explicit
- reduce accidental regressions during UI/component extraction work
- make schema and migration changes require a separate architecture decision

## 2. Current Firestore Model

Current canonical Firestore path:

- `artifacts/blaze-skate-production/users/{uid}/profile/main`

Current model characteristics:

- data is currently stored as a single `profile/main` document
- V1+ data remains additive root fields
- there are no Firestore subcollections
- there are no migrations

Current repository entrypoint:

- `src/services/profileRepository.js`
- `getProfileDocRef(db, uid)` resolves:
  - `artifacts / SAFE_APP_ID / users / {uid} / profile / main`
- `saveProfilePatch(...)` writes with:
  - `setDoc(userRef, profilePatch, { merge: true })`

Implication:

- current writes are merge-based patch writes into one compatibility document
- future refactors must preserve this until a separate architecture plan explicitly changes it

## 3. Known Root Field Categories

Current root fields are defined primarily by:

- `src/App.jsx` `defaultData`
- V1 helper defaults in `src/features/trainingV1/trainingV1Defaults.js`
- record key mapping in `src/features/trainingV1/utils/recordUtils.js`

Known categories:

### Profile / settings fields

- `language`
- `theme`
- `avatar`
- `username`
- `parentPin`
- `isPro`
- `lastLoginDate`

### Daily Tasks / task history

- `tasks`
- `taskHistory`

### Streak-related fields

- `completedDays`

### Points / rewards / shop fields

- `points`
- `pointsPerTask`
- `dailyBonusPoints`
- `customRewards`
- `rewardHistory`

### Academy / imported task related fields

- `weeklyTemplate`
- imported tasks currently still flow into `tasks`

### PB / records fields

- `records`
- `records777`
- `records1000`
- `records1500`
- `recordsStart`
- `recordsLap`
- `records_{distance}` for custom distances via record utility mapping

### Race fields

- `races`

### Training V1+ fields

- `competitionGoalsV1`
- `trainingPlansV1`
- `activeTrainingPlanId`

### Distance / configuration fields

- `customDistances`

### Metadata / compatibility fields

These are applied through `saveProfilePatch(...)` metadata helpers:

- created/updated metadata fields from:
  - `createMetadata(...)`
  - `updateMetadata(...)`
  - `withProfileMetadataDefaults(...)`

## 4. Authorized Write Entrypoints

## Current canonical write path

### High-level entrypoints

- `updateData(...)` in `src/App.jsx`
- `saveProfilePatch(...)` in `src/services/profileRepository.js`

Current flow:

1. UI/action handlers in `App.jsx` prepare a patch object
2. `updateData(...)` merges it into local state
3. `updateData(...)` calls `saveProfilePatch(db, user.uid, safeData)`
4. `saveProfilePatch(...)` writes merged data through `setDoc(..., { merge: true })`

### Direct Firestore usage

Current direct write usage observed:

- `setDoc(...)` inside `saveProfilePatch(...)`

No separate `updateDoc(...)` / `addDoc(...)` / subcollection write model is currently part of the Training app architecture.

## Current write categories by risk

### High-risk writes

These can affect core user progress or broad document integrity:

- `updateData(...)` itself
- `saveProfilePatch(...)`
- daily task complete / uncomplete handlers
- points / bonus award handlers
- streak / `completedDays` updates
- PB add / delete handlers
- bulk import handlers that append tasks
- defaults initialization handler
- any handler that writes multiple root fields in one action

### Medium-risk writes

These affect user planning / goal data but should not affect XP or streak:

- goals create / edit / archive handlers
- plans create / edit / archive / restore handlers
- plan task create / edit / delete / complete handlers
- `activeTrainingPlanId` updates
- template-based plan creation
- custom distance management
- race CRUD handlers
- reward catalog / custom rewards management

### Low-risk writes

These are still real writes, but usually settings/profile scoped:

- language
- theme
- username
- avatar
- parent PIN
- account/profile settings patches

## Handler families currently writing through `updateData(...)`

Observed write families in `App.jsx` include:

- task complete / uncomplete
- task create / edit / delete
- plan add / edit / archive / restore / select
- plan task add / edit / delete / complete
- Add to Today task import
- goal add / edit / archive
- Lindsay defaults initialization
- PB record add / delete
- academy/task import
- shop / rewards redemption and management
- race add / delete
- settings/profile updates

## 5. Protected Semantics

The following invariants are protected and should not change during ordinary refactors.

### Daily Tasks

- Daily task completion controls XP / points.
- Daily all-complete bonus behavior must remain unchanged.
- `completedDays` / streak behavior must remain unchanged.

### Plan Tasks

- Plan task completion does not award XP.
- Plan task completion must remain separate from Daily Tasks.
- Add to Today is explicit user action only.
- Add to Today duplicate prevention must remain intact.

### Goals / PB

- PB records remain the source of truth for PB-first goal progress.
- Goal reports read PB records but do not mutate them.
- `goal.currentTimeSeconds` remains manual fallback and must not be overwritten by PB-derived values.

### Reports

- Dashboard metrics are client-computed.
- Weekly Plan Adherence is client-computed.
- Weekly Report is client-computed.
- No report snapshots are stored unless separately designed in a future schema change.

### Defaults / Templates

- Lindsay defaults are explicit user action only.
- Default initialization must remain idempotent.
- Templates create plans only when the user explicitly creates one.

## 6. Forbidden Changes Without Separate Architecture Plan

The following are forbidden unless a separate architecture plan is written and approved first:

- creating Firestore subcollections
- moving tasks / goals / plans / records into subcollections
- changing existing root field names
- changing PB record array keys
- changing Daily Task completion XP behavior
- making Plan Task completion award XP
- automatically importing plan tasks into Daily Tasks
- saving weekly reports as snapshots
- running migrations on app load
- rewriting `profile/main` wholesale without preserving legacy fields

## 7. Safe Refactor Rules

- extracted components must not call Firebase directly
- extracted components must not call `updateData(...)` directly unless explicitly approved
- `App.jsx` remains write orchestration owner until a separate write-service refactor
- pure helpers must remain read-only
- modals/cards should receive callbacks from `App.jsx`
- UI refactors should preserve data shape

Recommended practical rule:

- presentation components may render data and emit callbacks
- write semantics stay centralized in orchestration code

## 8. Future Write Service Proposal

This is a future design direction only. Do not implement it as part of ordinary refactors.

Possible future service:

- `src/services/trainingProfileWrites.js`

Goals:

- centralize write functions
- preserve `updateData(...)` / `saveProfilePatch(...)` semantics
- add smoke tests before migration
- document each write function
- introduce one write service at a time

Suggested incremental path:

1. wrap one write family at a time
2. keep return shape and patch semantics stable
3. smoke-test behavior before expanding scope
4. keep `App.jsx` callbacks delegating to the service until confidence is established

## 9. Future Firestore Migration Proposal

This is a long-term proposal only. Do not implement it now.

Compatibility principle:

- `profile/main` remains the legacy compatibility root

Possible future subcollections:

- `tasks`
- `goals`
- `trainingPlans`
- `records`
- `rewards`
- `weeklyReports`

Migration requirements:

- migration must be opt-in
- migration must be versioned
- migration must be tested
- no automatic destructive migration
- rollback strategy is required

## 10. PR Review Checklist

Future PRs touching data flow should answer:

- Does this PR add a write path?
- Does this PR modify `updateData(...)` or `saveProfilePatch(...)`?
- Does this PR change root field names?
- Does this PR affect XP / streak / `completedDays`?
- Does this PR affect PB add / delete?
- Does this PR affect Add to Today?
- Does this PR write reports / defaults / templates automatically?
- Does `npm run smoke:training` pass?
- Do lint and build pass?
- Was manual browser QA needed?

## 11. Validation

Run:

```bash
npm run smoke:training
npm run lint
npm run build
```

Clarification:

- `npm run typecheck` is not available in this project
