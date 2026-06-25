# Blaze Skate Training V1.9 App.jsx Write Path Read-only Audit

Date: 2026-06-25

Scope: read-only write-path audit of `src/App.jsx` and its Firestore write boundary. Application logic was not modified. This report is the only intended source-of-truth artifact added in this step.

## Executive Summary

The current Blaze Skate Training write model is still centered on one App-level orchestrator:

- Firestore path remains `artifacts/blaze-skate-production/users/{uid}/profile/main`
- `src/App.jsx` owns the majority of user-triggered and automatic write paths
- `updateData(...)` is the main write fan-out point
- `src/services/profileRepository.js` persists writes through `saveProfilePatch(...)` with `setDoc(..., { merge: true })`

This architecture is still backward compatible, but the write surface is concentrated.

The main risk is not an incorrect Firestore path. The main risk is that many unrelated features still share the same full-profile merge write path, so small UI changes can accidentally affect:

- daily task semantics
- points / XP
- streak / `completedDays`
- plan activation rules
- PB record arrays
- cross-day rollover behavior

Top conclusion:

- The write model is still viable for additive work.
- Further extraction from `App.jsx` should treat write paths as a protected boundary.
- The highest-risk functions should be isolated behind dedicated write services before any larger view extraction or state refactor.

## Audit Method

Inspected files:

- [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx)
- [src/services/profileRepository.js](/Users/Lafa_el%201/Projects/blaze-skate-training/src/services/profileRepository.js)
- [src/features/trainingV1/dashboardMetrics.js](/Users/Lafa_el%201/Projects/blaze-skate-training/src/features/trainingV1/dashboardMetrics.js)
- [src/features/trainingV1/weeklyReport.js](/Users/Lafa_el%201/Projects/blaze-skate-training/src/features/trainingV1/weeklyReport.js)
- [src/features/trainingV1/utils/recordUtils.js](/Users/Lafa_el%201/Projects/blaze-skate-training/src/features/trainingV1/utils/recordUtils.js)
- [src/features/plans/PlanCard.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/features/plans/PlanCard.jsx)
- [src/features/plans/SelectedPlanHeader.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/features/plans/SelectedPlanHeader.jsx)
- [src/features/plans/SelectedPlanTaskItem.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/features/plans/SelectedPlanTaskItem.jsx)
- [src/features/goals/GoalCard.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/features/goals/GoalCard.jsx)
- [src/features/weeklyReport/WeeklyReportModal.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/features/weeklyReport/WeeklyReportModal.jsx)

What was audited:

- App-level write entrypoints
- fields touched by each write
- confirmation/guard behavior
- whether writes are explicit user actions or automatic side effects
- read-only feature surfaces that currently depend on these writes but should not write themselves

What was intentionally not changed:

- Firestore schema
- write semantics
- routes/navigation
- helper logic
- feature behavior

## Canonical Write Boundary

### Firestore document path

Canonical profile document path is defined in [src/services/profileRepository.js](/Users/Lafa_el%201/Projects/blaze-skate-training/src/services/profileRepository.js:8):

```js
doc(db, 'artifacts', SAFE_APP_ID, 'users', requireUid(uid), 'profile', 'main')
```

This confirms:

- no Firestore subcollections are used for Training V1-V1.9 state
- all feature data still lands in `profile/main`
- backward compatibility still depends on preserving this document shape

### Canonical write primitive

`saveProfilePatch(...)` in [src/services/profileRepository.js](/Users/Lafa_el%201/Projects/blaze-skate-training/src/services/profileRepository.js:20) is the canonical persistence primitive:

- reads existing doc only to determine metadata creation vs update
- writes with `setDoc(userRef, profilePatch, { merge: true })`
- does not use `updateDoc`
- does not delete fields
- does not write subcollections

### App-level write orchestrator

`updateData(...)` in [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:1484) is the main App write orchestrator:

```js
const updateData = useCallback(async (newData) => {
  if (!user || !db) return;
  const merged = { ...data, ...newData };
  setData(merged);
  const safeData = JSON.parse(JSON.stringify(merged));
  await saveProfilePatch(db, user.uid, safeData);
}, [data, user]);
```

Implications:

1. Local React state updates optimistically before Firestore persistence completes.
2. A small field patch still results in a merged full-profile payload being written.
3. Any future refactor that changes `data` shape, default values, or merge order can have broad write consequences.
4. Feature extractions are safe only if callbacks continue to terminate at `updateData(...)` or a stricter replacement with identical semantics.

## Default Root Data Shape

Default root profile fields are declared in [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:1167).

Current root fields:

- `lastLoginDate`
- `taskHistory`
- `points`
- `language`
- `theme`
- `avatar`
- `parentPin`
- `isPro`
- `username`
- `pointsPerTask`
- `dailyBonusPoints`
- `completedDays`
- `competitionGoalsV1`
- `trainingPlansV1`
- `activeTrainingPlanId`
- `customRewards`
- `customDistances`
- `rewardHistory`
- `races`
- `weeklyTemplate`
- `tasks`
- `records`
- `records777`
- `records1000`
- `records1500`
- `recordsStart`
- `recordsLap`

Audit consequence:

- almost all product state still lives at the root of one document
- any helper or component that assumes a stable root field name is part of the write compatibility surface

## Write Path Inventory

### 1. Goals writes

Functions:

- `saveCompetitionGoal(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:1534)
- `archiveGoal(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:1584)

Fields touched:

- `competitionGoalsV1`

Behavior:

- create/edit goal rewrites the full goals array
- archive rewrites the full goals array
- no direct PB record mutation
- no points/streak side effects

Risk:

- medium
- array replacement is straightforward, but backward compatibility depends on preserving goal object shape and archive status semantics

### 2. Training plan writes

Functions:

- `saveTrainingPlan(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:1656)
- `saveTrainingPlanFromTemplate(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:1716)
- `selectTrainingPlan(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:1763)
- `archivePlan(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:1768)
- `restoreArchivedPlan(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:1788)

Fields touched:

- `trainingPlansV1`
- `activeTrainingPlanId`

Behavior:

- create/edit rewrites plan array and may update active selection
- template creation appends a new plan and may update active selection
- archive/restore rewrites plan array and recalculates active plan safety
- archive is guarded by confirmation

Risk:

- high
- plan activation rules, archived visibility rules, and active plan fallback logic are tightly coupled

### 3. Training plan task writes

Functions:

- `updateTaskInPlan(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:1860)
- `savePlanTask(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:1877)
- `togglePlanTaskCompletion(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:1942)

Fields touched:

- `trainingPlansV1`

Behavior:

- plan-day tasks are updated by rebuilding nested `days[].tasks[]`
- plan task completion is stored inside the plan only
- no XP is awarded
- no `completedDays` changes
- no daily task mutation here

Risk:

- high
- nested immutable updates over arrays are easy to break during extraction
- this path is semantically separate from daily task completion and must stay separate

### 4. Manual Plan-to-Today import

Function:

- `addPlanTaskToToday(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:1946)

Fields touched:

- `tasks`

Behavior:

- explicit user action only
- duplicate prevention uses `isPlanTaskAddedToToday(...)`
- appends converted plan task into daily task list
- does not mark plan task complete
- does not award points
- does not modify `completedDays`

Risk:

- high
- this function sits on a critical semantic boundary between planning and execution
- duplicate prevention and no-side-effect guarantees must remain locked

### 5. Manual Lindsay defaults initialization

Function:

- `initializeLindsayTrainingV1Defaults(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:1960)

Fields touched conditionally:

- `competitionGoalsV1`
- `trainingPlansV1`
- `activeTrainingPlanId`

Behavior:

- explicit user action only
- confirmation required
- guarded by `shouldSeedTrainingV1Goals(...)` and `shouldSeedTrainingV1Plan(...)`
- additive, not destructive

Risk:

- medium
- safe today, but future default-seeding changes could accidentally make it non-idempotent

### 6. Automatic cross-day rollover

Effect:

- rollover effect at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:2071)

Fields touched:

- `tasks`
- `lastLoginDate`
- `taskHistory`

Behavior:

- automatic write, not user-triggered
- archives prior day tasks into `taskHistory[lastLoginDate]`
- clears current `tasks`
- initializes `lastLoginDate` on first use

Risk:

- highest
- this is the main automatic write path in the app
- any regression here can wipe today’s task list, duplicate history, or corrupt day rollover behavior

### 7. Daily task completion semantics

Function:

- `toggleTask(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:2161)

Fields touched:

- `tasks`
- `points`
- `completedDays`

Behavior:

- toggles task completion
- updates per-task points
- applies or removes all-complete bonus
- adds/removes today from `completedDays`
- clamps points to zero minimum

Risk:

- highest
- this function is the core behavioral contract for Daily Tasks, XP, bonus logic, and streak source data

### 8. Daily task CRUD and Academy imports

Functions:

- `addSpecificTask(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:2199)
- `addTask(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:2214)
- `importAcademyRoutine(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:2223)
- `importSingleTask(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:2304)
- `deleteTask(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:2320)
- `saveEditTask(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:2333)

Fields touched:

- `tasks`

Behavior:

- all manual daily task creation/edit/delete stays in the `tasks` array
- Academy imports append tasks directly into daily execution list
- no points changes on create/edit/delete

Risk:

- high
- task object shape and Academy import semantics are part of older app behavior and should not be normalized casually

### 9. PB record writes

Functions:

- `addRecord(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:2351)
- delete record handler at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:3550)

Fields touched:

- dynamic record key returned by `getRecordCollectionKeyForDistance(...)`

Current mapped arrays include:

- `records`
- `records777`
- `records1000`
- `records1500`
- `recordsStart`
- `recordsLap`
- custom `records_{distance}` style keys when applicable

Behavior:

- PB add/delete rewrites one record array at a time
- adding records no longer awards points
- delete is confirmation-guarded

Risk:

- high
- distance normalization and record-key mapping must stay consistent with read-only PB views

### 10. Rewards / Shop writes

Functions:

- `buyReward(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:2369)
- custom reward add at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:3693)
- custom reward delete at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:5161)

Fields touched:

- `points`
- `rewardHistory`
- `customRewards`

Behavior:

- reward purchase decrements points and prepends reward history
- reward catalog add/delete rewrites `customRewards`

Risk:

- medium
- rewards are less cross-coupled than tasks/plans, but points balance still shares state with Daily Tasks logic

### 11. Race writes

Functions:

- race add at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:3617)
- race delete at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:5004)

Fields touched:

- `races`

Behavior:

- race management is isolated to one root array
- delete is confirmation-guarded

Risk:

- low to medium

### 12. Settings / profile / preference writes

Functions:

- `handleSetPin(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:4652)
- `handleRemovePin(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:4673)
- `toggleLanguage(...)` at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:4678)
- theme change at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:4721)
- custom distance add/edit/delete at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:4925), [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:4948), [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:4957)
- reset points at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:5048)
- points per task blur save at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:5061)
- daily bonus blur save at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:5073)
- manual points add/deduct at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:5099), [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:5112)
- username blur save at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:5692)
- avatar upload at [src/App.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/App.jsx:2391)

Fields touched:

- `parentPin`
- `language`
- `theme`
- `customDistances`
- `points`
- `pointsPerTask`
- `dailyBonusPoints`
- `username`
- `avatar`

Risk:

- medium
- these writes are usually isolated, but they still share the full-profile merge path

## Risk Classification

### Highest risk

1. `toggleTask(...)`
2. cross-day rollover `useEffect(...)`
3. `addPlanTaskToToday(...)`
4. training plan archive/restore/active switching
5. PB record key-based add/delete behavior

Why these are highest risk:

- they affect shared user-visible semantics
- they are hard to verify only by type/lint/build
- they can silently break downstream read-only reporting
- they are most likely to regress during App.jsx extraction

### Medium risk

- goal create/archive
- plan create/edit/template creation
- custom rewards and races
- settings field writes
- Lindsay default initialization

### Lower risk

- isolated profile preference writes such as theme/language/username, as long as merge semantics stay unchanged

## Field Impact Matrix

| Write path | Root fields touched |
| --- | --- |
| Goal create/edit/archive | `competitionGoalsV1` |
| Plan create/edit/template/archive/restore/select | `trainingPlansV1`, `activeTrainingPlanId` |
| Plan task create/edit/complete | `trainingPlansV1` |
| Add plan task to today | `tasks` |
| Lindsay defaults init | `competitionGoalsV1`, `trainingPlansV1`, `activeTrainingPlanId` |
| Cross-day rollover | `tasks`, `lastLoginDate`, `taskHistory` |
| Daily task complete/uncomplete | `tasks`, `points`, `completedDays` |
| Daily task add/edit/delete/import | `tasks` |
| PB add/delete | dynamic `records*` field |
| Reward purchase | `points`, `rewardHistory` |
| Custom reward add/delete | `customRewards` |
| Race add/delete | `races` |
| Parent PIN set/remove | `parentPin` |
| Language toggle | `language` |
| Theme change | `theme` |
| Custom distance add/edit/delete | `customDistances` |
| Points reset/manual add/manual deduct | `points` |
| Points config blur save | `pointsPerTask`, `dailyBonusPoints` |
| Username blur save | `username` |
| Avatar upload | `avatar` |

## Read-only Areas That Should Stay Write-free

These surfaces currently depend on write-backed data but should remain read-only:

- [src/features/trainingV1/dashboardMetrics.js](/Users/Lafa_el%201/Projects/blaze-skate-training/src/features/trainingV1/dashboardMetrics.js)
- [src/features/trainingV1/weeklyReport.js](/Users/Lafa_el%201/Projects/blaze-skate-training/src/features/trainingV1/weeklyReport.js)
- [src/features/goals/GoalCard.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/features/goals/GoalCard.jsx)
- [src/features/plans/PlanCard.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/features/plans/PlanCard.jsx)
- [src/features/plans/SelectedPlanHeader.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/features/plans/SelectedPlanHeader.jsx)
- [src/features/plans/SelectedPlanTaskItem.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/features/plans/SelectedPlanTaskItem.jsx)
- [src/features/weeklyReport/WeeklyReportModal.jsx](/Users/Lafa_el%201/Projects/blaze-skate-training/src/features/weeklyReport/WeeklyReportModal.jsx)

Audit note:

- current component extractions are directionally correct
- write callbacks still terminate in `App.jsx`
- future extractions should preserve this pattern until write services are introduced

## Backward Compatibility Constraints

The following semantics should be treated as locked:

1. Daily task completion is independent from plan task completion.
2. `Add to Today` only appends to `data.tasks`.
3. `Add to Today` must not award points.
4. `Add to Today` must not modify `completedDays`.
5. `toggleTask(...)` remains the only path that changes task completion points semantics.
6. Cross-day rollover remains the only automatic task-history archiving path.
7. PB record arrays remain distance-keyed root fields under `profile/main`.
8. Read-only metrics in Dashboard, Goals, and Weekly Report remain client-computed only.
9. `activeTrainingPlanId` safety rules must stay intact when archive/restore logic changes.

## Recommended Additive Refactor Path

### Recommendation 1: do not replace `updateData(...)` globally yet

Reason:

- too many features currently depend on its merge semantics
- a broad change would have poor blast-radius isolation

### Recommendation 2: extract write services by domain, one domain at a time

Suggested candidates:

1. `taskWriteService`
   - daily task CRUD
   - task completion
   - cross-day rollover

2. `planWriteService`
   - plan create/edit/archive/restore/select
   - plan task create/edit/complete
   - add plan task to today

3. `recordWriteService`
   - add/delete PB record
   - record key resolution shared with record utilities

4. `rewardWriteService`
   - reward purchase
   - custom reward CRUD

5. `settingsWriteService`
   - language/theme/profile preferences
   - parent PIN
   - points settings

### Recommendation 3: stabilize the highest-risk paths before broader view extraction

Do first:

- daily task completion
- cross-day rollover
- plan-to-today import
- plan activation archive/restore
- PB add/delete mapping

Do later:

- race management
- reward catalog management
- profile preference writes

## Top 5 Highest-risk Write Paths

### 1. `toggleTask(...)`

Why:

- changes `tasks`
- changes `points`
- changes `completedDays`
- drives XP, daily bonus, and streak source data

### 2. Cross-day rollover effect

Why:

- automatic write path
- archives and clears daily tasks
- updates historical snapshot state

### 3. `addPlanTaskToToday(...)`

Why:

- bridges planning and daily execution
- duplicate-prevention semantics are easy to break
- must stay side-effect free for XP/streak

### 4. Plan archive/restore/select write group

Why:

- mutates both `trainingPlansV1` and `activeTrainingPlanId`
- active fallback rules are stateful and easy to regress

### 5. PB record add/delete with dynamic record keys

Why:

- depends on distance normalization and record-key mapping
- drives PB-first read-only summaries in Goals, Dashboard, and Weekly Report

## Future Audit / Refactor Guardrails

Any future code-changing PR touching write paths should verify:

- `npm run smoke:training`
- `npm run lint`
- `npm run build`

And should explicitly re-check:

- task completion points delta
- all-complete bonus add/remove
- cross-day rollover history write
- plan task Add to Today duplicate prevention
- archive active plan fallback
- restore archived plan active safety
- PB add/delete on 500m and one non-default distance

## Explicit Non-changes in This Step

- No source logic changes
- No Firestore schema changes
- No Firestore subcollections
- No migrations
- No new product features
- No route/navigation changes
- No dependency changes
- No write-path refactor yet

## Files Changed

- [docs/training-v1-9-app-write-path-audit.md](/Users/Lafa_el%201/Projects/blaze-skate-training/docs/training-v1-9-app-write-path-audit.md)
