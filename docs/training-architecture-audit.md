# Blaze Skate Training Architecture Audit

Date: 2026-06-19

## Current Model

Blaze Skate Training is currently a Vite + React single-page app. Most product logic still lives in `src/App.jsx`, with Firebase access now isolated behind small setup and repository modules.

The app intentionally remains on the existing single-document Firestore model:

```text
artifacts/blaze-skate-production/users/{uid}/profile/main
```

All user-owned Training data is stored as fields on `profile/main`. This includes active tasks, task history, completed days, PB records, points, reward history, custom rewards, races, settings, parent PIN, PRO state, avatar, and username.

## Firebase Path

The repository layer keeps the current path unchanged:

```text
artifacts / blaze-skate-production / users / {uid} / profile / main
```

There are no separate Firestore collections yet for athletes, tasks, PB records, rewards, settings, shop data, or PRO entitlements.

## Known Risks

- `profile/main` can grow toward Firestore's 1 MiB document limit, especially because avatar data is stored as a base64 string.
- The single-document model makes multi-athlete, coach, family, and SkatingX Platform integration difficult.
- Dynamic PB fields such as `records_${distance}` make schema validation and migration harder.
- `parentPin` is stored directly in the profile document.
- Anonymous Auth users still write durable Firestore data under their generated Firebase uid.
- The app has no automated test suite yet; current verification relies on lint and production build.
- Large embedded Training Academy data and inline UI components keep `App.jsx` difficult to maintain.

## Why Core Integration Is Deferred

SkatingX Core integration should not start until the current app has a stable boundary around Firebase access and profile persistence. Directly migrating from `profile/main` to a Core schema would risk breaking daily tasks, PB charts, completed-day streaks, rewards, PRO state, and existing anonymous-user data.

Sprint 0 therefore only stabilizes the current app and extracts low-risk infrastructure. It does not add `athleteId`, `sourceApp`, `schemaVersion`, new collections, or any data migration.

## Recommended Next Sprints

1. Add a small test harness for pure Training logic: time parsing, record key mapping, task completion, points, and rollover behavior.
2. Extract Training domain helpers from `App.jsx` without changing UI or Firestore shape.
3. Add backward-compatible metadata in a later sprint only after tests exist.
4. Design the SkatingX Core schema separately, including user, athlete, training, records, gamification, and settings ownership.
5. Build a migration plan with legacy read fallback before switching production reads away from `profile/main`.
