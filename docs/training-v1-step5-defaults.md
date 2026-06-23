# Blaze Skate Training V1 Step 5: Safe Lindsay Defaults Initialization

## Files Changed

- `src/features/trainingV1/trainingV1Defaults.js`
  - Added deterministic default goal matching.
  - Added missing-default goal helpers so repeated initialization does not duplicate existing Lindsay defaults.
  - Tightened weekly plan seeding to detect the Lindsay default plan by title and current week date range.
- `src/App.jsx`
  - Added a manual Lindsay V1 Defaults initializer.
  - Added bilingual confirmation, success, and already-exists copy.
  - Added a compact Dashboard V1 entry point.
- `docs/training-v1-step5-defaults.md`
  - Documents the manual initialization behavior, default data, idempotency strategy, and verification checklist.

## UI Location

The initialization UI was added to the Dashboard V1 area, above the V1 summary cards.

The UI is always visible:

- If goals or the current-week default plan are missing, the button is enabled.
- If all Lindsay V1 defaults already exist, the button is disabled and shows the already-exists state.

## Exact Default Goals Added

The initializer can add these missing goals to `competitionGoalsV1`:

| Title | Competition | Date | Event | Distance | Current | Target | Priority | Status |
| --- | --- | --- | --- | --- | ---: | ---: | --- | --- |
| AGN 2027 500m | Age Group Nationals 2027 | 2027-03-20 | 500m | 500m | 49.8 | 48.0 | A | active |
| AGN 2027 777m | Age Group Nationals 2027 | 2027-03-20 | 777m | 777m | 82.0 | 77.0 | A | active |
| AGN 2027 1000m | Age Group Nationals 2027 | 2027-03-20 | 1000m | 1000m | 104.0 | 103.0 | A | active |

Existing user-created goals are not removed, overwritten, or cleared.

## Exact Weekly Plan Template Added

The initializer can add one current-week plan to `trainingPlansV1`:

- Title: `Lindsay Weekly Training Plan`
- Focus: `AGN 2027 preparation`
- Status: `draft`
- Start date: current week start date
- End date: current week start date + 6 days

Plan days:

| Day Offset | Focus | Tasks |
| ---: | --- | --- |
| 0 | Ice Training | Ice Training; Dryland Activation |
| 1 | Corner Technique Focus | Ice Training; Corner Technique Focus |
| 2 | Running Intervals | Running Intervals; Mobility |
| 3 | Video Review | Ice Training; Video Review |
| 4 | Strength | Strength; Recovery Mobility |
| 5 | Starts and Race Simulation | Ice Training; Starts and Race Simulation |
| 6 | Recovery / Rest | Recovery / Rest |

Task categories and intensities:

- Ice Training: `ice`, `medium`
- Dryland Activation: `dryland`, `low`
- Corner Technique Focus: `ice`, `medium`
- Running Intervals: `running`, `high`
- Mobility: `mobility`, `low`
- Video Review: `video`, `low`
- Strength: `strength`, `high`
- Recovery Mobility: `recovery`, `low`
- Starts and Race Simulation: `competition`, `high`
- Recovery / Rest: `recovery`, `low`

Existing user-created plans are not removed, overwritten, archived, or cleared.

## Idempotency Strategy

Goals are treated as already existing when a non-archived goal matches the Lindsay default by:

- title
- competition name
- competition date
- event name
- target distance

The weekly plan is treated as already existing when a non-archived plan matches:

- title: `Lindsay Weekly Training Plan`
- start date: current week start date
- end date: current week start date + 6 days

Repeated clicks cannot duplicate equivalent Lindsay default goals or the current-week Lindsay default plan.

If only goals are missing, only missing goals are appended.

If only the weekly plan is missing, only the weekly plan is appended.

If both are already present, no Firestore write is made.

## Manual-Only Confirmation

Initialization is manual only.

The app does not seed defaults on load, mount, auth state changes, Dashboard render, or any `useEffect`.

Before writing, the app asks for confirmation:

```txt
Initialize Lindsay V1 default goals and weekly plan? This will only add missing defaults and will not overwrite existing data.
```

Chinese:

```txt
要初始化 Lindsay V1 默认目标和周计划吗？这只会添加缺失的默认数据，不会覆盖已有数据。
```

## Firestore Confirmation

No Firestore subcollections were added.

No existing data is overwritten.

The initializer writes only changed root fields on the existing profile document:

```txt
artifacts/blaze-skate-production/users/{uid}/profile/main
```

Possible fields written:

- `competitionGoalsV1`
- `trainingPlansV1`
- `activeTrainingPlanId`

`activeTrainingPlanId` is only set when a weekly plan is added and no active plan id already exists.

## Existing Features Protected

Step 5 intentionally does not change:

- Existing Daily Tasks completion logic.
- Existing XP and points logic.
- Existing streak logic.
- Existing Academy import logic.
- Existing Rewards and Shop logic.
- Existing PB records logic.
- Existing races logic.
- Existing Goals behavior.
- Existing Plans behavior.
- Existing Dashboard metrics, except adding the manual initializer UI.
- Existing activeTab navigation model.
- Existing Firestore path and single-document profile shape.

Step 5 does not implement React Router, URL routes, Firestore subcollections, automatic seeding, or data migration.

## Manual Verification Checklist

- Open the Dashboard and confirm the Lindsay V1 Defaults card is visible.
- With no Lindsay defaults, click Initialize Defaults and cancel the confirmation; confirm no data is added.
- Click Initialize Defaults again and confirm; verify the three AGN 2027 goals are appended.
- Verify the current-week `Lindsay Weekly Training Plan` is appended.
- Verify `activeTrainingPlanId` is set to the new plan only when it was previously empty.
- Click Initialize Defaults again and confirm no duplicate default goals or duplicate current-week default plan are added.
- Remove or archive only one default goal in test data, then click Initialize Defaults and confirm only the missing goal is appended.
- Create a user plan and confirm initialization does not remove or overwrite it.
- Confirm existing Daily Tasks, XP, streak, Academy imports, Rewards, PB records, races, Goals, Plans, and Dashboard remain usable.
- Run `npm run lint`.
- Run `npm run build`.
