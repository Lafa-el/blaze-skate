# Blaze Skate Training V1 Read-Only Audit

Date: 2026-06-23

Scope: read-only codebase audit before implementing Blaze Skate Training V1. Application logic was not modified. This report is the only intended file change.

## 1. Goal

Prepare the existing Blaze Skate Training Platform for an additive V1 upgrade that adds:

1. Competition Goals
2. Training Plan
3. Progress Dashboard

Existing features that must remain working:

- Daily Tasks
- XP / points
- Streak
- Academy / content
- Rewards / Shop
- Profile
- Existing Firebase data
- Existing navigation and tab behavior

## 2. Current App Architecture

### Framework and stack

| Area | Current implementation |
| --- | --- |
| UI framework | React 19, JSX |
| Build tool | Vite |
| Language | JavaScript, not TypeScript |
| Styling | Tailwind CSS utility classes plus inline theme class maps |
| Icons | `lucide-react` |
| Backend | Firebase App, Firebase Auth, Cloud Firestore |
| Routing | No React Router; in-memory tab state |
| State management | React hooks only: `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef` |
| Tests | No test runner configured |

### Entry points

| File | Responsibility |
| --- | --- |
| `src/main.jsx` | React root bootstrap; renders `<App />` inside `StrictMode` |
| `src/App.jsx` | Main monolithic application, page views, modals, domain logic, embedded content |
| `src/constants/app.js` | App namespace defaults and tab IDs |
| `src/constants/skatingx.js` | SkatingX compatibility metadata constants |
| `src/firebase/firebaseConfig.js` | Firebase web config |
| `src/firebase/firebaseApp.js` | Initializes Firebase App, Auth, and Firestore |
| `src/firebase/firestore.js` | Enables Firestore IndexedDB persistence |
| `src/services/profileRepository.js` | Firestore profile document reference, realtime subscription, merge writes |
| `src/utils/firestoreMetadata.js` | Creates/updates metadata fields and injects defaults for legacy profiles |
| `src/utils/validation.js` | Validates Firebase UID before writes |

### Main pages and components

All page components and modal components are currently inline functions inside `src/App.jsx`.

| Component | Role |
| --- | --- |
| `DashboardView` | Home overview: race countdown, task progress, weekly activity, PB carousel |
| `TasksView` | Daily task list, add/edit/delete/complete tasks |
| `AcademyView` | Embedded Academy content, age stages, modules, weekly plan import |
| `DataView` | Combines calendar/history and PB records/stats |
| `CalendarView` | Completed-day calendar and daily snapshot entry |
| `StatsView` | Record chart by distance |
| `ShopView` | Rewards catalog, point redemption |
| `SettingsView` | Account, parent PIN, preferences, training config, rewards config |
| `ProfileModal` | Full-screen profile/settings shell |
| `AuthModal` | Email/password account binding |
| `AccountManagementModal` | Username, email state, logout |
| `RecordManagementModal` | Add/delete PB records |
| `RaceManagementModal` | Add/delete race targets |
| `ShopItemManagementModal` | Add/delete custom shop rewards |
| `RewardHistoryModal` | Redemption history |
| `ProShowcaseModal` | PRO upsell/manual payment instructions |
| `HistoryDetailModal` | Historical task snapshot by date |

### State management approach

The app keeps one large `data` object in React state. Most user-owned state is merged locally and then persisted through `updateData(newData)`.

`updateData` behavior:

1. Merges `{ ...data, ...newData }`.
2. Updates local React state immediately with `setData(merged)`.
3. Serializes the merged object with `JSON.parse(JSON.stringify(merged))`.
4. Calls `saveProfilePatch(db, user.uid, safeData)`.
5. `saveProfilePatch` writes to Firestore with `setDoc(..., { merge: true })`.

This means most feature updates currently rewrite or merge the full profile-shaped payload, not isolated subdocuments.

### Firebase usage

Firebase is used for:

- Anonymous Auth on first load.
- Optional email/password account linking or login.
- Realtime Firestore profile subscription.
- Firestore merge writes.
- Firestore IndexedDB persistence.

Firebase Cloud Storage is not used. Profile avatar images are resized in the browser and stored as a base64 JPEG data URL in Firestore.

## 3. Existing Features

### Daily Tasks

Implemented in `TasksView` and task helper functions:

- Add custom task with optional target.
- Import single Academy item into tasks.
- Import Academy weekly routine into tasks.
- Edit incomplete tasks.
- Delete incomplete tasks.
- Toggle completion by clicking the task row.
- Completed tasks become visually muted and cannot be edited/deleted.
- Cross-day rollover archives the previous day task list to `taskHistory[lastLoginDate]` and clears `tasks`.

Task object shape:

```text
{
  id: number,
  text: string,
  target: string | null,
  desc: string | null,
  completed: boolean,
  isTemplate: boolean
}
```

### XP / Points

The app uses `points` as the XP balance.

- Completing a task adds `pointsPerTask`.
- Un-completing a task subtracts `pointsPerTask`.
- Completing all current tasks adds `dailyBonusPoints`.
- Breaking all-complete state subtracts `dailyBonusPoints`.
- Points never go below zero in task toggle and manual deduction paths.
- Rewards subtract their `cost` from `points`.
- Parent/settings mode can reset points, add points, or deduct points.

### Streak

The displayed streak is computed from `completedDays`.

Rules:

- If neither today nor yesterday is in `completedDays`, streak is `0`.
- Otherwise, count backward from today if today is completed, else from yesterday.
- Consecutive dates are found by repeatedly calling `getPrevDayStr`.

### Academy / Content

`BLAZE_ACADEMY` is embedded in `src/App.jsx` and includes:

- Chinese and English content.
- Three age stages: 4-6, 7-10, 11-16.
- Stage goals, duration, frequency, core/load style.
- Modules and training items.
- Reference weekly plans.

Academy import behavior:

- PRO is required for full import behavior.
- Weekly routine import maps plan task strings back to Academy item details using fuzzy matching.
- Imported tasks preserve official item name, target, and description when matched.
- Single item import creates one task with item name, target, and description.

### Rewards / Shop

Implemented in `ShopView`, `ShopItemManagementModal`, and `RewardHistoryModal`.

- Rewards are stored in `customRewards`.
- User redeems a reward when `points >= cost`.
- Redemption subtracts points and appends to `rewardHistory`.
- Custom reward creation/deletion is PRO-gated.
- Shop display sorts rewards by cost ascending.

Reward object shape:

```text
{ id, name, cost, icon }
```

Reward history object shape:

```text
{ id, name, icon, cost, date }
```

### Profile

Profile includes:

- Avatar upload, resized client-side and stored in `avatar`.
- Username edit on blur.
- Account state: anonymous guest or linked email account.
- Email/password link flow.
- Existing account login fallback when email is already registered.
- Logout flow using `signOut` followed by full page reload.
- PRO display and manual upgrade instructions.

### Other implemented features

- Race target list and dashboard race countdown.
- PB records and charts by distance.
- Dynamic custom distances.
- Calendar and historical daily task snapshot.
- Language toggle between Chinese and English.
- Theme selection with free and PRO themes.
- Parent/coach PIN gate for advanced settings.
- Firestore offline persistence.
- PWA-oriented static shell metadata in `index.html`.

## 4. Current Firebase / Firestore Structure

### Firebase project config

The committed Firebase web config points to:

```text
projectId: blaze-skate-training-platform
authDomain: blaze-skate-training-platform.firebaseapp.com
storageBucket: blaze-skate-training-platform.firebasestorage.app
```

The app namespace constant is:

```text
SAFE_APP_ID = blaze-skate-production
```

### Authentication method

Authentication flow:

1. `onAuthStateChanged(auth, callback)` runs on mount.
2. If a Firebase user exists, it becomes the active `user`.
3. If no user exists, the app calls `signInAnonymously(auth)`.
4. Users can link the anonymous account with email/password via `linkWithCredential`.
5. If the email is already used, the app can sign in with `signInWithEmailAndPassword`.
6. Logout calls `signOut(auth)` and reloads the page.

### Firestore path

The only application data path currently used by code is:

```text
artifacts/blaze-skate-production/users/{uid}/profile/main
```

This is built in `getProfileDocRef(db, uid)`:

```text
doc(db, 'artifacts', SAFE_APP_ID, 'users', requireUid(uid), 'profile', 'main')
```

No app code currently writes separate collections for tasks, goals, plans, rewards, records, athletes, settings, or dashboard data.

### Read functions

| Function | File | Behavior |
| --- | --- | --- |
| `subscribeToProfile(db, uid, onData, onError)` | `src/services/profileRepository.js` | Realtime `onSnapshot` of `profile/main`; injects metadata defaults for legacy docs |
| `getProfileDocRef(db, uid)` | `src/services/profileRepository.js` | Builds the exact existing document ref and validates UID |

### Write functions

| Function | File | Behavior |
| --- | --- | --- |
| `saveProfilePatch(db, uid, patch)` | `src/services/profileRepository.js` | Reads existing doc when needed, adds metadata, writes with `setDoc(..., { merge: true })` |
| `updateData(newData)` | `src/App.jsx` | Merges app state and calls `saveProfilePatch` |

### Profile fields

Fields currently implied by `defaultData`, repository metadata, and active code:

| Field | Type | Purpose |
| --- | --- | --- |
| `lastLoginDate` | string | Date marker for cross-day rollover |
| `taskHistory` | object keyed by date | Archived daily task snapshots |
| `tasks` | array | Current day tasks |
| `points` | number | XP / shop currency |
| `language` | string | `zh` or `en` |
| `theme` | string | Theme key |
| `avatar` | string | Base64 JPEG data URL |
| `parentPin` | string | 4-digit PIN, plaintext |
| `isPro` | boolean | PRO feature flag |
| `username` | string | Display name |
| `pointsPerTask` | number | Points per completed task |
| `dailyBonusPoints` | number | Bonus when all daily tasks complete |
| `completedDays` | string[] | Dates with all tasks completed |
| `customRewards` | array | Shop catalog |
| `customDistances` | string[] | PB distance labels |
| `rewardHistory` | array | Reward redemption history |
| `races` | array | Competition/race targets |
| `weeklyTemplate` | object keyed 0-6 | Day-of-week training labels |
| `records` | array | 500m records |
| `records777` | array | 777m records |
| `records1000` | array | 1000m records |
| `records1500` | array | 1500m records |
| `recordsStart` | array | Start records |
| `recordsLap` | array | Lap records |
| `records_{distance}` | array | Dynamic records for custom distances |
| `ownerUid` | string | SkatingX compatibility metadata |
| `sourceApp` | string | `blaze-skate-training` |
| `schemaVersion` | string | `skatingx-athlete-v1` for profile writes |
| `createdAt` | ISO string | Metadata creation timestamp |
| `updatedAt` | ISO string | Metadata update timestamp |

## 5. Current Route List

There are no URL routes. Every listed screen renders at the same browser URL and is selected by `activeTab`.

| Logical route / tab | URL | Rendered component | Trigger |
| --- | --- | --- | --- |
| `dashboard` | Same SPA URL | `DashboardView` | Default tab and bottom nav Home |
| `tasks` | Same SPA URL | `TasksView` | Bottom nav Tasks |
| `academy` | Same SPA URL | `AcademyView` | Bottom nav Academy |
| `data` | Same SPA URL | `DataView` | Bottom nav Data or header streak button |
| `shop` | Same SPA URL | `ShopView` | Bottom nav Shop or header points button |

Modal overlays:

| Overlay | Rendered component |
| --- | --- |
| Profile/settings | `ProfileModal` |
| Auth bind | `AuthModal` |
| Account management | `AccountManagementModal` |
| PRO | `ProShowcaseModal` |
| Record add/delete | `RecordManagementModal` |
| Race target add | `RaceManagementModal` |
| Shop item add/delete | `ShopItemManagementModal` |
| Reward history | `RewardHistoryModal` |
| Daily history detail | `HistoryDetailModal` |

## 6. Current Data Flow

### Profile load flow

1. App mounts and initializes Firebase persistence.
2. Auth listener resolves the current user or creates an anonymous user.
3. Once `user` exists, `subscribeToProfile` listens to `profile/main`.
4. If the document exists, React state becomes `{ ...defaultData, ...cloudData }`.
5. If the document does not exist, React state remains `defaultData`.
6. Missing metadata on legacy documents is injected in memory before state update.

### Task creation flow

Manual task:

1. User fills `newTaskText` and optional `newTaskTarget`.
2. `addTask()` calls `addSpecificTask(text, target, false)`.
3. `addSpecificTask` appends a task with `id`, `text`, `target`, `desc`, `completed: false`, `isTemplate`.
4. `updateData({ tasks: newTasks })` persists the merged profile.

Academy weekly import:

1. User chooses an Academy weekly plan.
2. `importAcademyRoutine(routine, idx)` verifies `data.isPro`.
3. Each routine task string is matched to the current age-stage Academy item.
4. Matched tasks preserve official item name, target, and description.
5. New tasks are appended to `data.tasks`.
6. `updateData({ tasks: [...] })` persists the merged profile.

Academy single import:

1. `importSingleTask(event, item, uniqueItemId)` verifies `data.isPro`.
2. Calls `addSpecificTask(item.name, item.target, true, item.desc)`.

### Task completion flow

1. User clicks a task row.
2. `toggleTask(id)` determines whether the clicked task is being completed or uncompleted.
3. It calculates `pointDelta`.
4. It creates `newTasks`.
5. It checks all-complete transition:
   - not all-complete -> all-complete: add daily bonus and today to `completedDays`.
   - all-complete -> not all-complete: subtract daily bonus and remove today from `completedDays`.
6. Calls `updateData({ tasks: newTasks, points, completedDays })`.

### XP / points calculation

Current formulas:

```text
taskPts = data.pointsPerTask ?? 20
bonusPts = data.dailyBonusPoints ?? 50
```

When completing one task:

```text
pointDelta += taskPts
```

When un-completing one task:

```text
pointDelta -= taskPts
```

When transitioning into all-complete:

```text
pointDelta += bonusPts
completedDays.push(today)
```

When transitioning out of all-complete:

```text
pointDelta -= bonusPts
completedDays = completedDays.filter(date != today)
```

Final points write:

```text
points: Math.max(0, data.points + pointDelta)
```

### Streak calculation

1. Read `data.completedDays`.
2. If empty, return `0`.
3. If neither today nor yesterday exists in `completedDays`, return `0`.
4. Start from today if today is completed, else yesterday.
5. Count backward while each previous date exists.

### Cross-day rollover flow

1. A 60-second timer updates `currentTime`.
2. `currentDateStr` is derived from local browser date.
3. If `data.lastLoginDate` exists and today is greater than it:
   - copy current `tasks` to `taskHistory[data.lastLoginDate]` if tasks exist.
   - clear `tasks`.
   - set `lastLoginDate` to today.
4. If `lastLoginDate` is missing:
   - initialize it to today.

### PB record flow

1. User selects a distance from `customDistances`.
2. `getRecordsKey(distance)` maps it to a Firestore field.
3. New record time input is formatted as `MM:SS.xxx`.
4. `parseTimeToSeconds` stores time as seconds.
5. `addRecord` appends `{ date, time }` to the mapped records array.
6. Stats and PB cards read the same records arrays.

## 7. Risk Areas

### Files that should not be changed without care

| File | Reason |
| --- | --- |
| `src/App.jsx` | Holds nearly all UI, domain logic, task/points/streak flow, Academy content, and modal behavior |
| `src/services/profileRepository.js` | Owns the production Firestore path and merge-write semantics |
| `src/constants/app.js` | Defines `SAFE_APP_ID` and tab IDs used by persistence and navigation |
| `src/utils/firestoreMetadata.js` | Keeps legacy documents compatible by injecting metadata defaults |
| `src/firebase/firebaseApp.js` | Initializes shared Firebase instances |
| `src/firebase/firebaseConfig.js` | Current production Firebase project config |
| `src/firebase/firestore.js` | Offline persistence setup |

### Central functions to preserve

| Function | Risk |
| --- | --- |
| `updateData` | Any change affects nearly every write path |
| `saveProfilePatch` | Any change can alter Firestore shape, metadata, or merge behavior |
| `subscribeToProfile` | Any change can break legacy profile load or realtime sync |
| `toggleTask` | Central to tasks, XP, daily bonus, and completed days |
| `addSpecificTask` / `addTask` | Central to manual task creation |
| `importAcademyRoutine` / `importSingleTask` | Central to Academy-to-task reuse |
| Cross-day rollover `useEffect` | Central to task history and daily reset |
| `computedStreak` | Central to streak display |
| `getRecordsKey` | Central to PB field compatibility |
| `handleImageUpload` | Can grow profile document because avatar is stored in Firestore |
| `handleLinkAccount` / `handleLogout` | Central to anonymous/email account continuity |

### Firebase data structures that must remain backward compatible

Must remain readable and writable:

```text
artifacts/blaze-skate-production/users/{uid}/profile/main
```

Must not be renamed or moved during V1:

- `tasks`
- `taskHistory`
- `completedDays`
- `points`
- `pointsPerTask`
- `dailyBonusPoints`
- `weeklyTemplate`
- `races`
- `customDistances`
- `records`
- `records777`
- `records1000`
- `records1500`
- `recordsStart`
- `recordsLap`
- dynamic `records_{distance}`
- `customRewards`
- `rewardHistory`
- `avatar`
- `parentPin`
- `isPro`
- `language`
- `theme`
- metadata fields: `ownerUid`, `sourceApp`, `schemaVersion`, `createdAt`, `updatedAt`

### Technical risks

| Risk | Impact on V1 |
| --- | --- |
| Monolithic `App.jsx` | Adding Goals/Plans/Dashboard inside the same file will increase coupling and regression risk |
| Single Firestore document | New V1 arrays can increase document size and write contention |
| Full-profile merge writes | Small V1 updates may write unrelated state if added through `updateData` only |
| No TypeScript models | Field shape drift is likely unless V1 introduces explicit contracts |
| No tests | Task/points/streak regressions are hard to catch |
| No URL router | New screens cannot have shareable URLs unless routing is introduced carefully |
| Avatar stored in Firestore | Document size risk grows with other V1 data |
| Plaintext parent PIN | Security risk remains; avoid expanding sensitive data in the same pattern |
| Client-generated IDs from `Date.now() + Math.random()` | Collision risk is low but not contract-grade for future multi-device plan items |
| Local date-based rollover | Timezone/device clock differences can affect streak and daily reset |

## 8. Recommended Additive V1 Upgrade Approach

### Overall recommendation

Do not rewrite the app for V1. Add V1 as a compatibility layer around the existing profile document, then extract modules incrementally.

Recommended order:

1. Extract pure domain helpers from `App.jsx` before adding new feature logic.
2. Add typed data contracts for new V1 objects, preferably in TypeScript files if the build allows incremental TS.
3. Keep existing `profile/main` reads working.
4. Store V1 data additively under new root fields on `profile/main` for the first V1 release.
5. Avoid changing existing field names or task completion semantics.
6. Add UI entry points without changing current five-tab navigation until behavior is stable.

### Where to add Competition Goals

Current related feature: `races`.

Recommended additive path:

- Preserve existing `races` as the current lightweight race target list.
- Add a new optional root field such as `competitionGoalsV1` or `goals`.
- Do not replace `races` during V1.
- If possible, read from both:
  - existing dashboard countdown can keep using `races`.
  - new Goals screen can display richer `competitionGoalsV1`.
  - future migration can map `races` into goals.

Suggested V1 goal shape:

```text
{
  id: string,
  title: string,
  competitionDate: string,
  targetDistance: string,
  targetTimeSeconds: number | null,
  priority: string,
  status: string,
  notes: string,
  createdAt: string,
  updatedAt: string
}
```

Reusable existing code:

- `RaceManagementModal` add/delete UX patterns.
- Dashboard countdown logic.
- Date parsing and display patterns.
- `customDistances` and `getRecordsKey` for target distances.
- PB record display for comparing target vs current best.

### Where to add Training Plans

Current related features:

- `weeklyTemplate`
- `tasks`
- Academy `weeklyPlan`
- Academy import functions

Recommended additive path:

- Keep `weeklyTemplate` as the current simple label map.
- Add a new root field such as `trainingPlansV1` or `plans`.
- Add a selected/active plan field such as `activeTrainingPlanId`.
- Generate daily tasks from plan items only through explicit user action, not automatic background mutation at first.
- Reuse Academy task shape when converting plan items into daily tasks: `text`, `target`, `desc`, `isTemplate`.

Suggested V1 plan shape:

```text
{
  id: string,
  title: string,
  startDate: string,
  endDate: string,
  goalId: string | null,
  weeks: [
    {
      weekIndex: number,
      days: [
        {
          date: string,
          focus: string,
          tasks: [
            {
              id: string,
              text: string,
              target: string | null,
              desc: string | null,
              source: string
            }
          ]
        }
      ]
    }
  ],
  createdAt: string,
  updatedAt: string
}
```

Reusable existing code:

- `BLAZE_ACADEMY[*].weeklyPlan` content model.
- `importAcademyRoutine` logic, after extracting matching/import helpers.
- `addSpecificTask`.
- `weeklyTemplate` UI concepts.
- `TasksView` rendering for daily checklist.

### Where to add Progress Dashboard

Current related feature: `DashboardView`, `StatsView`, `CalendarView`.

Recommended additive path:

- Do not replace `DashboardView` in V1.
- Add new dashboard sections below current cards or behind a new internal segment.
- Compute dashboard metrics from existing fields first:
  - completion rate from `tasks`, `taskHistory`, `completedDays`.
  - streak from existing computed streak.
  - PB trend from existing `records*`.
  - goal countdown from `races` and new goals.
  - plan adherence from new plans only when available.

Reusable existing code:

- `DashboardView` task progress card.
- weekly activity calculation from `completedDays`.
- PB cards using `currentDistNames` and `getRecordsKey`.
- `StatsView` record sorting and chart primitives.
- `CalendarView` historical completion data.

### Recommended code organization for V1

Before implementing V1, extract small modules without changing behavior:

```text
src/features/tasks/
  taskLogic.js or taskLogic.ts
  taskTypes.ts

src/features/records/
  recordUtils.js or recordUtils.ts

src/features/profile/
  profileTypes.ts

src/features/goals/
  goalTypes.ts
  goalLogic.ts

src/features/plans/
  planTypes.ts
  planLogic.ts

src/features/dashboard/
  dashboardMetrics.ts
```

If TypeScript is introduced incrementally, start with pure `.ts` helper/type files and avoid converting `App.jsx` immediately.

### Firestore cost guidance for V1

Short term:

- Keep additive root fields on `profile/main` to avoid migration risk.
- Avoid autosaving large plan objects on every keystroke.
- Prefer blur/explicit save for goals and plans.
- Avoid storing generated dashboard metrics; compute them client-side from existing profile data.
- Keep record/plan/history arrays bounded in UI where possible.

Medium term:

- Move large V1 structures to subcollections once migration is planned:

```text
artifacts/blaze-skate-production/users/{uid}/trainingGoals/{goalId}
artifacts/blaze-skate-production/users/{uid}/trainingPlans/{planId}
artifacts/blaze-skate-production/users/{uid}/trainingSessions/{sessionId}
```

Do not introduce these paths in V1 unless the project is ready to update rules, indexes, migration docs, and backward-compatible reads.

## 9. V1 Implementation Guardrails

Do:

- Preserve `profile/main`.
- Add new optional fields instead of renaming existing fields.
- Keep current tabs working.
- Keep `tasks` completion and XP semantics unchanged.
- Keep `races` working even if richer goals are added.
- Reuse `customDistances`, `records*`, `completedDays`, `taskHistory`.
- Add pure helper tests before changing task/points/streak logic.

Do not:

- Move Firestore collections during V1.
- Split `profile/main` during V1.
- Convert all app code to TypeScript in the same sprint.
- Replace `DashboardView`, `TasksView`, or `AcademyView` wholesale.
- Change `getRecordsKey` output.
- Change task object shape in a breaking way.
- Auto-generate or auto-complete tasks without explicit user action.
- Store large computed dashboard snapshots in Firestore.

## 10. Validation Notes

Package scripts currently available:

```text
npm run build
npm run lint
npm run preview
npm run dev
```

There is no `npm run typecheck` script in `package.json` at audit time, so typecheck was not run.

Build verification:

```text
npm run build
```

Result: passed.

Non-blocking warning:

```text
Some chunks are larger than 500 kB after minification.
```

## 11. Changed Files

Intended changed file:

```text
docs/training-v1-readonly-audit.md
```

No application logic files should be changed in this audit step.
