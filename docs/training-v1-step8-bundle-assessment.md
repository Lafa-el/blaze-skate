# Blaze Skate Training V1 Step 8 Bundle Assessment

Date: 2026-06-23

## Summary

Blaze Skate Training V1 Step 8 assessed the existing Vite large chunk warning and applied one low-risk build-only optimization.

Current result:

- `npm run build` passes.
- The previous Vite large chunk warning is removed after vendor code splitting.
- No application logic, navigation model, Firestore path, data shape, task logic, XP logic, streak logic, Academy import behavior, Rewards/Shop behavior, PB logic, races logic, Goals behavior, Plans behavior, Dashboard behavior, or Lindsay defaults behavior was changed.

## Baseline Build

Before the Step 8 optimization, `npm run build` produced:

```text
dist/index.html                   5.37 kB │ gzip:   2.19 kB
dist/assets/index-Cmr2X_6u.css   53.65 kB │ gzip:   8.85 kB
dist/assets/index-Dj0uXdHd.js   820.37 kB │ gzip: 240.10 kB
```

Baseline warning:

```text
(!) Some chunks are larger than 500 kB after minification.
```

CSS size was normal. The warning was limited to the single JavaScript entry chunk.

## Bundle Contributors

Likely contributors identified during inspection:

- `src/App.jsx`
  - About 5,594 lines and 292 KB before build.
  - Holds most UI, state, business logic, modal rendering, V1 views, Dashboard, Academy, Data, Shop, Profile, and auth UI.
- Embedded `BLAZE_ACADEMY`
  - Large static Academy content remains inline in `App.jsx`.
  - This affects maintainability and app chunk size.
- Firebase SDK
  - `firebase/auth`, `firebase/firestore`, persistence helpers, and app initialization are required by the current app shell.
- `lucide-react`
  - Icons are imported as named imports. No broad namespace import was found.
- Inline modal-heavy code paths
  - `HistoryDetailModal`, `RecordManagementModal`, `ShopItemManagementModal`, `RewardHistoryModal`, `ProShowcaseModal`, V1 Goal modal, V1 Plan modal, and V1 Plan Task modal are all inside the app bundle.
- Chart logic
  - No third-party chart library was found. Existing chart rendering is inline SVG logic.
- V1 additions
  - V1 helper files are small compared with the monolithic app shell.

## Change Applied

Changed:

- `vite.config.js`

Added `build.rolldownOptions.output.codeSplitting.groups` to split vendor code into stable chunks:

- `react-vendor`
- `firebase-vendor`
- `icons-vendor`
- `vendor`

Why this is low risk:

- It changes only production bundle output.
- It does not change source imports, React state ownership, activeTab navigation, Firebase reads/writes, or UI behavior.
- It uses Vite 8 / Rolldown-supported `codeSplitting.groups` instead of adding a new dependency or visualizer.
- It avoids lazy-loading core tabs or modals in this step.

## Final Build

After the optimization, `npm run build` produced:

```text
dist/index.html                             5.71 kB │ gzip:   2.28 kB
dist/assets/index-Cmr2X_6u.css             53.65 kB │ gzip:   8.85 kB
dist/assets/rolldown-runtime-pRHcBP7x.js    0.08 kB │ gzip:   0.08 kB
dist/assets/icons-vendor-DCcFhGfF.js       10.35 kB │ gzip:   3.88 kB
dist/assets/react-vendor-B0NJamC8.js      189.63 kB │ gzip:  59.65 kB
dist/assets/index-B9x3VV5O.js             215.38 kB │ gzip:  54.87 kB
dist/assets/firebase-vendor-CX2xGnkN.js   405.04 kB │ gzip: 122.39 kB
```

Final warning status:

- The large chunk warning no longer appears.
- CSS remains normal.
- The app chunk is now below 500 kB.
- `firebase-vendor` is the largest chunk at 405.04 kB, still below the current warning threshold.

## Deferred Optimizations

Recommended future work, not done in Step 8:

- Extract `App.jsx` views into feature files:
  - Dashboard
  - Tasks
  - Goals
  - Plans
  - Academy
  - Data
  - Shop
  - Profile
- Move `BLAZE_ACADEMY` to `src/data/blazeAcademy.js` for maintainability first, then consider lazy-loading only after Academy behavior has a focused regression pass.
- Lazy-load Academy when the active tab changes to Academy.
- Lazy-load modal groups after modal state boundaries are extracted from `App.jsx`.
- Lazy-load chart/Data view code if Data grows or if a chart library is later introduced.
- Introduce route-based splitting only if React Router is approved in a future architecture step.
- Consider Firestore subcollections later for data scalability, but not as a bundle-size optimization.

## Manual Smoke-Test Checklist

After this build-only optimization, manually verify:

- App loads from a clean browser session.
- Firebase auth initializes and profile data loads.
- Daily Tasks can still be completed.
- XP/points and old streak still update.
- Dashboard V1 cards render.
- Goals tab opens, creates, edits, and archives goals.
- Plans tab opens, creates, edits, completes plan tasks, and adds a plan task to Today.
- Academy tab opens and imports routines to Today.
- Data/PB records still render.
- Rewards/Shop still opens and redeems/edit flows still render.
- Profile still loads and saves existing settings.

## Validation

Validation commands run:

- `npm run build` before optimization: passed, warning present.
- `npm run build` after optimization: passed, warning removed.
- `npm run lint`: passed.
- `npm run build`: passed, warning removed.

There is no `npm run typecheck` script in the current `package.json`, so typecheck was not run.
