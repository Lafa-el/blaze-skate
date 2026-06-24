# Blaze Skate Training V1 Post-Release Monitoring

Date: 2026-06-24

## Summary

Blaze Skate Training V1 has been released as an additive upgrade.

This document defines the production monitoring checklist and the recommended V1.1 planning direction. It does not introduce application logic changes, Firestore changes, routing changes, or product features.

V1 included:

- Competition Goals
- Training Plan
- Progress Dashboard enhancements
- Manual Lindsay V1 Defaults initialization
- UX polish
- Vendor chunk splitting

Preserved from the existing platform:

- Daily Tasks
- XP / points
- Streak
- Academy
- Shop / Rewards
- PB records
- Races
- Existing Firestore `profile/main` data model

## 1. Production Monitoring Checklist

Use this checklist after every production deploy and during the first post-release monitoring window.

| Area | What to verify | Status |
| --- | --- | --- |
| App load | Production URL loads on first visit and refresh. | Pending manual check |
| Anonymous auth | Anonymous Firebase auth session initializes for guest users. | Pending manual check |
| Firebase read/write | Existing `profile/main` document reads and writes successfully. | Pending manual check |
| Dashboard | Existing Dashboard renders and V1 summary cards appear. | Pending manual check |
| Tasks | Daily Tasks render, add, delete, and complete as before. | Pending manual check |
| XP / streak | Points and streak update only through existing task completion behavior. | Pending manual check |
| Academy | Academy opens and existing import-to-today flow still works. | Pending manual check |
| Data / PB | PB records render and new records can be saved. | Pending manual check |
| Shop | Rewards and Shop render and existing redeem/manage flows still work. | Pending manual check |
| Goals | Goals tab opens; add/edit/archive flow works. | Pending manual check |
| Plan | Plan tab opens; create/select/archive and plan task flows work. | Pending manual check |
| Defaults initialization | Lindsay V1 Defaults is manual, idempotent, and does not auto-seed. | Pending manual check |
| Mobile layout | Dashboard, Tasks, Goals, Plans, Academy, Shop, and Profile fit mobile viewport. | Pending manual check |
| Browser console | No runtime errors or Firebase permission errors in console. | Pending manual check |

## 2. V1 Known Limitations

- Navigation is still activeTab-based only.
- There are no shareable URLs for Goals, Plans, or Dashboard V1 sections.
- V1 data still lives in the existing `profile/main` document.
- `App.jsx` remains monolithic.
- There is no automated test framework.
- There is no TypeScript migration yet.
- Journal integration is not implemented yet.
- Analysis integration is not implemented yet.
- Coach/team permissions are not implemented yet.

## 3. V1.1 Recommended Backlog

### P0

Release stability only:

- Fix production bugs only.
- Prioritize regressions affecting:
  - App load
  - Auth
  - Firestore read/write
  - Daily Tasks
  - XP / streak
  - Existing Academy / Shop / PB / races flows
  - Goals / Plan data integrity

### P1

Plan-to-Today workflow polish:

- Improve the Plan-to-Today workflow so imported plan tasks have clearer state.
- Prevent duplicate Add to Today beyond the current simple duplicate guard.
- Show Added status on plan tasks after successful import to Today.
- Improve the Dashboard relationship between plan tasks and daily tasks.
- Clarify whether a plan task imported to Today should visually link back to its source plan task.

### P2

Goal-PB integration:

- Auto-read PB from records for goal current time.
- Show PB date on goal cards and Dashboard target gap rows.
- Show target gap trend over time.
- Make the source of current time explicit:
  - manual goal input
  - PB record
  - latest relevant record

### P3

Training plan templates:

- Regular Week
- Competition Week
- Recovery Week
- Summer Camp Week
- Speed Focus Week
- Technique Focus Week

Template work should stay additive and should not migrate existing `trainingPlansV1` data.

## 4. Recommended Next Sprint

Recommended next sprint:

```text
Blaze Skate Training V1.1 — Plan-to-Today Workflow Polish
```

Reason:

- It builds directly on the highest-friction V1 workflow.
- It does not require React Router.
- It does not require Firestore schema changes.
- It can improve clarity without changing XP, streak, or Daily Task completion semantics.
- It creates a stronger bridge between Training Plan and the existing Daily Tasks feature.

Suggested V1.1 boundaries:

- Keep writes inside the existing `profile/main` model.
- Preserve `data.tasks` behavior.
- Preserve XP / points and streak calculations.
- Do not auto-complete Daily Tasks when importing plan tasks.
- Do not create subcollections.
- Do not add route-level navigation.

## 5. Validation

Validation commands for this documentation-only step:

```text
npm run lint
npm run build
```

Results are recorded in the final task response.
