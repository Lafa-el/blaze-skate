# Blaze Skate Training V1.1 Step 4 Training Plan Templates

Date: 2026-06-24

## Summary

V1.1 Step 4 adds a safe Create Plan from Template workflow to the Training Plan tab.

This is an additive workflow that appends a new V1 training plan to `data.trainingPlansV1`. It does not change routes, Firestore paths, Firestore schema, Daily Task behavior, XP, streak, `completedDays`, Academy, Shop, Rewards, PB records, races, or Lindsay defaults behavior.

## Files Changed

- `src/features/trainingV1/planTemplates.js`
  - Added training plan template definitions.
  - Added `getTrainingPlanTemplates()`.
  - Added `createTrainingPlanFromTemplate(templateId, startDateString, options = {})`.
- `src/App.jsx`
  - Added Create from Template entry points in the Training Plan tab.
  - Added a template creation modal.
  - Added duplicate prevention for same title + start date.
  - Added English and Chinese UI copy.
- `docs/training-v1-1-plan-templates.md`
  - Documents this Step 4 implementation.

## Template List

Implemented templates:

1. `regular_week`
   - English: Regular Training Week
   - Chinese: 常规训练周
   - Focus: Balanced weekly training
2. `technique_focus_week`
   - English: Technique Focus Week
   - Chinese: 技术重点周
   - Focus: Corner technique, body position, and control
3. `speed_focus_week`
   - English: Speed Focus Week
   - Chinese: 速度重点周
   - Focus: Starts, acceleration, and high-speed laps
4. `competition_week`
   - English: Competition Week
   - Chinese: 比赛周
   - Focus: Taper, race preparation, and confidence
5. `recovery_week`
   - English: Recovery Week
   - Chinese: 恢复周
   - Focus: Recovery, mobility, and low-intensity work
6. `summer_camp_week`
   - English: Summer Camp Week
   - Chinese: 夏训周
   - Focus: High-volume training block

## Generated Plan Structure

`createTrainingPlanFromTemplate` generates the existing V1 training plan shape:

- `id`
- `title`
- `startDate`
- `endDate`
- `focus`
- `goalId`
- `status`
- `days`
- `createdAt`
- `updatedAt`

Each generated day includes:

- `date`
- `focus`
- `tasks`

Each generated task uses the existing plan task shape:

- `id`
- `text`
- `target`
- `desc`
- `category`
- `durationMinutes`
- `intensity`
- `completed: false`
- `completedAt: null`
- `source: "trainingPlanV1"`
- `createdAt`
- `updatedAt`

## Date Handling

Given `startDateString`, the helper generates:

- 7 consecutive local date strings
- `startDate = startDateString`
- `endDate = startDateString + 6 days`

The helper does not assume the start date is Monday.

## UI Behavior

The Training Plan tab now includes:

- English: `Create from Template`
- Chinese: `使用模板创建`

The template modal includes:

- template select
- start date
- optional title override
- optional linked goal when active goals exist
- draft / active status selection

On submit:

- a new plan is appended to `data.trainingPlansV1`
- existing plans are not overwritten
- existing plans are not auto-archived
- if there is no `activeTrainingPlanId`, the new plan becomes selected
- if the new plan status is `active`, the new plan becomes selected

## Duplicate Handling

Duplicate prevention is enabled by default.

If a non-archived plan already exists with the same final plan title and same `startDate`, the app does not create another plan and shows:

- English: `A plan with the same title and start date already exists.`
- Chinese: `同一标题和开始日期的计划已存在。`

## Data Safety Confirmation

No schema changes were made.

Unchanged:

- Firestore path:
  - `artifacts/blaze-skate-production/users/{uid}/profile/main`
- V1 plans:
  - `data.trainingPlansV1`
- Active plan:
  - `data.activeTrainingPlanId`

No Firestore subcollections were added.

No data migration was introduced.

No template metadata field was added to persisted plans.

## XP / Streak / completedDays Confirmation

This step does not change:

- Daily Task completion semantics
- XP / points logic
- old streak logic
- `completedDays`
- Academy import logic
- Shop / Rewards logic
- PB records logic
- races logic

Template creation does not:

- auto-import plan tasks into Daily Tasks
- complete plan tasks
- award points
- modify `completedDays`
- seed defaults

## Manual Verification Checklist

- [ ] Open the Training Plan tab.
- [ ] Click Create from Template / 使用模板创建.
- [ ] Select each template and confirm the modal shows the template focus.
- [ ] Choose a start date.
- [ ] Create a draft plan.
- [ ] Confirm a 7-day plan appears in the Training Plan tab.
- [ ] Confirm each day has 1-3 tasks.
- [ ] Confirm generated plan tasks are incomplete.
- [ ] Confirm generated plan tasks are not added to Daily Tasks automatically.
- [ ] Create an active plan from template.
- [ ] Confirm it becomes the selected plan.
- [ ] Attempt to create the same title + start date again.
- [ ] Confirm duplicate creation is prevented.
- [ ] Confirm existing plans are not overwritten or archived.
- [ ] Confirm XP / points do not change after template creation.
- [ ] Confirm old streak and `completedDays` do not change after template creation.

## Validation

Run:

```text
npm run lint
npm run build
```

There is no `npm run typecheck` script in the current package configuration.
