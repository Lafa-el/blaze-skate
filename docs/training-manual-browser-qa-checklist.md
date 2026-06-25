# Blaze Skate Training Manual Browser QA Checklist

## 1. Purpose

This checklist covers real browser interactions that `npm run smoke:training`, `npm run lint`, and `npm run build` cannot verify.

Use it to validate:

- real UI rendering
- modal open/close behavior
- browser-only interaction flows
- mobile usability
- production and preview environment regressions

This is intended for Training app releases and refactor PRs where command checks alone are not enough.

## 2. When To Run

Run this checklist:

- before production deployment
- after any `App.jsx` refactor
- after any Goals / Plans / Dashboard / Tasks change
- after Vercel Preview deployment
- before version tags

## 3. Required Command Checks First

Run these before manual browser QA:

```bash
npm run smoke:training
npm run lint
npm run build
```

Clarification:

- `npm run typecheck` is not available in this project

## 4. Browser Environments

Recommended environments:

- Chrome desktop
- iPhone Safari or mobile responsive mode
- production domain after deployment
- Vercel Preview URL before merge when available

## 5. Authentication / Profile Smoke

- app loads
- existing user profile loads
- language toggle works
- theme works
- profile/settings opens
- no console red errors

## 6. Dashboard QA

- Dashboard loads
- Today Execution displays
- Weekly Plan Adherence displays
- Target Gap Trend displays
- Weekly Report opens
- Print Report opens browser print dialog or preview

## 7. Daily Tasks / XP / Streak QA

- create task
- edit task
- delete task
- complete task
- uncomplete task
- points increase correctly
- points decrease correctly
- daily all-complete bonus behavior still works
- streak / `completedDays` behavior appears unchanged

## 8. Goals QA

- Goals tab loads
- `GoalCard` displays
- View Details opens modal
- modal closes
- Edit Goal works
- Archive Goal works
- PB-first current performance displays
- Target Gap displays
- Progress History displays
- no PB history empty state displays

## 9. Plans QA

- Plans tab loads
- Current Plans display
- Archived Plans display
- `PlanCard` select works
- `SelectedPlanHeader` displays
- `SelectedPlanTaskItem` list displays
- Add to Today works
- duplicate Added state works
- Scheduled Today / Added / Added from Other Date / Not Added statuses display
- plan task complete / uncomplete works
- edit plan task works
- archive plan confirmation works
- restore archived plan works
- `activeTrainingPlanId` behavior appears correct
- Weekly Report opens from plan summary

## 10. Templates / Defaults QA

- Create from Template works
- generated plan has expected week shape
- Lindsay defaults initialization button works only when clicked
- clicking defaults twice does not create obvious duplicates

## 11. PB / Data QA

- Data tab loads
- add PB record works
- delete PB record works
- records display correctly
- Goals / Dashboard reflect PB changes
- malformed inputs show safe validation if applicable

## 12. Academy QA

- Academy tab loads
- import routine works
- imported tasks appear in Daily Tasks
- single task import works

## 13. Shop / Rewards QA

- Shop / Rewards loads
- redeem reward works
- points update correctly
- management/settings still work if applicable

## 14. Races QA

- races display
- add / edit / delete race if available
- legacy race date display remains safe

## 15. Mobile Layout QA

- Dashboard mobile usable
- Goals cards usable
- Goal Detail Modal scrolls
- Plans selected panel usable
- Weekly Report modal scrolls
- buttons remain tappable

## 16. Post-QA Sign-Off Template

```text
Date:
Environment:
Commit:
Tester:
Commands:
Browser:
Result:
Notes:
Blockers:
```

## 17. Explicit Non-Coverage

This checklist does not replace:

- automated e2e tests
- unit tests
- Firestore rules tests
- performance audits
- accessibility audits
