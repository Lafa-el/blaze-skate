import process from 'node:process';

import {
  addDaysToDateString,
  getWeekDateRange,
  isDateStringInRange,
  toDateString,
} from '../src/features/trainingV1/utils/dateUtils.js';
import {
  dedupeTasksByMatchKey,
  doTasksMatchByTextAndTarget,
  getTaskMatchKey,
  normalizeTaskTarget,
  normalizeTaskText,
} from '../src/features/trainingV1/utils/taskMatchUtils.js';
import {
  getBestRecordForDistance,
  getRecordCollectionKeyForDistance,
  getValidTimedRecordsForDistance,
} from '../src/features/trainingV1/utils/recordUtils.js';
import {
  formatDateLabel,
  formatGapSeconds,
  formatGoalSeconds,
  formatPercent,
  formatSignedGoalSeconds,
} from '../src/features/trainingV1/utils/formatUtils.js';
import {
  getGoalCurrentPerformance,
  getGoalTargetGapHistory,
  getGoalTrendSummary,
} from '../src/features/trainingV1/goals.js';
import {
  createTrainingPlanFromTemplate,
  getTrainingPlanTemplates,
} from '../src/features/trainingV1/planTemplates.js';
import { getWeeklyPlanAdherenceSummary } from '../src/features/trainingV1/dashboardMetrics.js';
import {
  createDefaultLindsayGoals,
  createDefaultLindsayWeeklyPlan,
  createMissingDefaultLindsayGoals,
  getMissingDefaultLindsayGoalInputs,
  shouldSeedTrainingV1Goals,
  shouldSeedTrainingV1Plan,
} from '../src/features/trainingV1/trainingV1Defaults.js';
import { getWeeklyTrainingReportData } from '../src/features/trainingV1/weeklyReport.js';
import {
  buildAvatarPatch,
  buildLanguagePreferencePatch,
  buildParentPinPatch,
  buildProfileSettingsPatch,
  buildThemePreferencePatch,
  buildUsernamePatch,
  buildUserPreferencesPatch,
} from '../src/services/trainingProfileWrites.js';

const results = [];

function pass(label) {
  results.push({ ok: true, label });
  console.log(`PASS ${label}`);
}

function fail(label, details) {
  results.push({ ok: false, label, details });
  console.error(`FAIL ${label}${details ? `: ${details}` : ''}`);
}

function assert(condition, label, details = '') {
  if (condition) {
    pass(label);
    return;
  }

  fail(label, details);
}

function assertEqual(actual, expected, label) {
  const ok = Object.is(actual, expected);
  assert(ok, label, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function assertDeepEqual(actual, expected, label) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  assert(actualJson === expectedJson, label, `expected ${expectedJson}, got ${actualJson}`);
}

function assertApproxEqual(actual, expected, label, epsilon = 1e-9) {
  const ok = typeof actual === 'number'
    && typeof expected === 'number'
    && Math.abs(actual - expected) <= epsilon;

  assert(ok, label, `expected approximately ${expected}, got ${actual}`);
}

function section(title) {
  console.log(`\n[${title}]`);
}

section('dateUtils');
assertEqual(toDateString(new Date('2026-06-25T12:00:00Z')), '2026-06-25', 'toDateString formats valid Date');
assertEqual(addDaysToDateString('2026-06-25', 2), '2026-06-27', 'addDaysToDateString adds days');
assertDeepEqual(getWeekDateRange('2026-06-21'), { startDate: '2026-06-21', endDate: '2026-06-27' }, 'getWeekDateRange returns 7-day range');
assert(isDateStringInRange('2026-06-21', '2026-06-21', '2026-06-27'), 'isDateStringInRange includes start');
assert(isDateStringInRange('2026-06-27', '2026-06-21', '2026-06-27'), 'isDateStringInRange includes end');
assert(!isDateStringInRange('2026-06-28', '2026-06-21', '2026-06-27'), 'isDateStringInRange excludes outside date');
assertEqual(addDaysToDateString('bad-input', 1), '', 'addDaysToDateString handles malformed input defensively');

section('taskMatchUtils');
assertEqual(normalizeTaskText(' Ice Training '), 'ice training', 'normalizeTaskText trims and lowercases');
assertEqual(normalizeTaskTarget(null), '', 'normalizeTaskTarget turns null into empty string');
assertEqual(normalizeTaskTarget(undefined), '', 'normalizeTaskTarget turns undefined into empty string');
assert(doTasksMatchByTextAndTarget(
  { text: ' Ice Training ', target: null },
  { text: 'ice training', target: '' },
), 'doTasksMatchByTextAndTarget matches normalized text and empty target');
assert(!doTasksMatchByTextAndTarget(
  { text: 'Ice Training', target: '4 laps' },
  { text: 'ice training', target: '5 laps' },
), 'doTasksMatchByTextAndTarget rejects different targets');
assertEqual(getTaskMatchKey({ text: ' Ice Training ', target: undefined }), 'ice training::', 'getTaskMatchKey is stable');
assertEqual(
  dedupeTasksByMatchKey([
    { text: ' Ice Training ', target: null },
    { text: 'ice training', target: '' },
    { text: 'Ice Training', target: '4 laps' },
  ]).length,
  2,
  'dedupeTasksByMatchKey de-dupes duplicate text+target',
);

section('recordUtils');
const mockData = {
  records: [
    { date: '2026-06-20', time: 49.8 },
    { date: '2026-06-21', time: 48.9 },
    { date: '2026-06-22', time: 'bad' },
  ],
  records777: [{ date: '2026-06-20', time: 80.1 }],
  records1000: [{ date: '2026-06-20', time: 101.5 }],
  records1500: [{ date: '2026-06-20', time: 150.2 }],
  recordsStart: [{ date: '2026-06-20', time: 5.2 }],
  recordsLap: [{ date: '2026-06-20', time: 9.9 }],
};
assertEqual(getRecordCollectionKeyForDistance('500m'), 'records', '500m maps to records');
assertEqual(getRecordCollectionKeyForDistance('777'), 'records777', '777 maps correctly');
assertEqual(getRecordCollectionKeyForDistance('1000 M'), 'records1000', '1000 maps correctly');
assertEqual(getRecordCollectionKeyForDistance('1500m'), 'records1500', '1500 maps correctly');
assertEqual(getRecordCollectionKeyForDistance('起跑'), 'recordsStart', 'Start maps correctly');
assertEqual(getRecordCollectionKeyForDistance('Lap'), 'recordsLap', 'Lap maps correctly');
assertEqual(getBestRecordForDistance(mockData, '500m')?.timeSeconds, 48.9, 'getBestRecordForDistance selects lower time');
assertEqual(getValidTimedRecordsForDistance(mockData, '500m').length, 2, 'getValidTimedRecordsForDistance ignores malformed record time');

section('formatUtils');
assertEqual(formatGoalSeconds(48.9), '48.9s', 'formatGoalSeconds formats numeric seconds');
assertEqual(formatGapSeconds(1.234), '+1.234s', 'formatGapSeconds formats positive gap');
assertEqual(formatGapSeconds(0), '0s', 'formatGapSeconds formats zero gap');
assertEqual(formatGapSeconds(-0.25), '-0.25s', 'formatGapSeconds formats negative gap');
assertEqual(formatSignedGoalSeconds(0.125), '+0.125s', 'formatSignedGoalSeconds formats positive gap');
assertEqual(formatSignedGoalSeconds(0), '0s', 'formatSignedGoalSeconds formats zero gap');
assertEqual(formatSignedGoalSeconds(-0.125), '-0.125s', 'formatSignedGoalSeconds formats negative gap');
assertEqual(formatPercent(75), '75%', 'formatPercent formats normal value');
assertEqual(formatPercent(null), '--', 'formatPercent handles null safely');
assertEqual(formatDateLabel('2026-06-25'), '2026/06/25', 'formatDateLabel formats date');
assertEqual(formatDateLabel(''), '--', 'formatDateLabel handles empty value');

section('goals helpers');
const goal = {
  id: 'goal_500',
  title: '500m goal',
  eventName: '500m',
  targetDistance: '500m',
  currentTimeSeconds: 50.5,
  targetTimeSeconds: 48.5,
  status: 'active',
};
const currentPerformance = getGoalCurrentPerformance(goal, mockData);
assertDeepEqual(
  currentPerformance,
  { source: 'records', timeSeconds: 48.9, date: '2026-06-21' },
  'getGoalCurrentPerformance uses PB-first behavior',
);
const noPbGoal = {
  ...goal,
  targetDistance: '3000m',
  eventName: '3000m',
};
assertDeepEqual(
  getGoalCurrentPerformance(noPbGoal, mockData),
  { source: 'goal', timeSeconds: 50.5, date: null },
  'getGoalCurrentPerformance falls back to manual current time',
);
const gapHistory = getGoalTargetGapHistory(goal, mockData);
assertEqual(gapHistory.length, 2, 'getGoalTargetGapHistory filters malformed PB records');
assertEqual(gapHistory[0]?.date, '2026-06-20', 'getGoalTargetGapHistory returns chronological history');
assertEqual(gapHistory[1]?.date, '2026-06-21', 'getGoalTargetGapHistory preserves ascending order');
const trendSummary = getGoalTrendSummary(goal, mockData);
assertApproxEqual(trendSummary.latestGapSeconds, 0.4, 'getGoalTrendSummary latest gap matches current semantics');
assertApproxEqual(trendSummary.bestGapSeconds, 0.4, 'getGoalTrendSummary best gap matches current semantics');
assertApproxEqual(trendSummary.improvementSeconds, 0.9, 'getGoalTrendSummary improvement matches current semantics');
assertEqual(trendSummary.achieved, false, 'getGoalTrendSummary achieved remains false for slower-than-target history');

section('weekly adherence helper');
const weekData = {
  tasks: [
    { text: 'Ice Training', target: null, completed: true },
    { text: 'ice training', target: '', completed: false },
    { text: 'Mobility', target: '20 min', completed: false },
  ],
  activeTrainingPlanId: 'plan_1',
  trainingPlansV1: [
    {
      id: 'plan_1',
      status: 'active',
      title: 'Weekly Plan',
      days: [
        {
          date: '2026-06-21',
          tasks: [
            { text: 'Ice Training', target: null, completed: true },
            { text: 'Mobility', target: '20 min', completed: false },
          ],
        },
        {
          date: '2026-06-23',
          tasks: [
            { text: 'Starts', target: '6 reps', completed: false },
          ],
        },
      ],
    },
  ],
};
const adherence = getWeeklyPlanAdherenceSummary(weekData, '2026-06-21');
assertEqual(adherence.totalPlanTasks, 3, 'weekly adherence counts scheduled plan tasks in week');
assertEqual(adherence.completedPlanTasks, 1, 'weekly adherence counts completed plan tasks');
assertEqual(adherence.addedToTodayTasks, 2, 'weekly adherence de-dupes matching daily tasks');
assertEqual(adherence.dailyTasksTotal, 3, 'weekly adherence counts current data.tasks');
assertEqual(adherence.dailyTasksCompleted, 1, 'weekly adherence counts completed daily tasks');
assertEqual(getWeeklyPlanAdherenceSummary({ tasks: [], trainingPlansV1: [] }, '2026-06-21').planCompletionPercent, 0, 'weekly adherence zero denominator does not crash');

section('weekly report helper');
const report = getWeeklyTrainingReportData({
  ...weekData,
  competitionGoalsV1: [goal],
}, '2026-06-21');
assertEqual(report.weekRange.startDate, '2026-06-21', 'weekly report returns weekRange');
assert(Boolean(report.adherenceSummary), 'weekly report returns adherenceSummary');
assert(Boolean(report.dailyExecutionSummary), 'weekly report returns dailyExecutionSummary');
assertEqual(report.goalSummaries.length, 1, 'weekly report returns goal summaries');
const emptyReport = getWeeklyTrainingReportData({ tasks: [], trainingPlansV1: [], competitionGoalsV1: [] }, '2026-06-21');
assertEqual(emptyReport.goalSummaries.length, 0, 'weekly report handles no goals safely');
assertEqual(emptyReport.planSummary.id, null, 'weekly report handles no plan safely');

section('plan templates');
const templates = getTrainingPlanTemplates();
assert(Array.isArray(templates) && templates.length > 0, 'getTrainingPlanTemplates returns a non-empty array');
assert(templates.some((template) => template.id === 'regular_week'), 'getTrainingPlanTemplates includes regular_week');
assert(templates.some((template) => template.id === 'summer_camp_week'), 'getTrainingPlanTemplates includes summer_camp_week');
const firstTemplate = templates.find((template) => template.id === 'regular_week');
assert(Boolean(firstTemplate?.title?.en), 'template includes localized title shape');
const clonedTemplates = getTrainingPlanTemplates();
clonedTemplates[0].title.en = 'Mutated Title';
assertEqual(getTrainingPlanTemplates()[0].title.en !== 'Mutated Title', true, 'getTrainingPlanTemplates returns cloned data');

const templateOptions = {
  titleOverride: 'Custom Sprint Week',
  goalId: 'goal_link_1',
  status: 'active',
  language: 'zh',
};
const templateOptionsSnapshot = JSON.stringify(templateOptions);
const templatedPlan = createTrainingPlanFromTemplate('regular_week', '2026-07-01', templateOptions);
assert(typeof templatedPlan.id === 'string' && templatedPlan.id.length > 0, 'createTrainingPlanFromTemplate creates plan id');
assertEqual(templatedPlan.title, 'Custom Sprint Week', 'createTrainingPlanFromTemplate respects title override');
assertEqual(templatedPlan.status, 'active', 'createTrainingPlanFromTemplate preserves explicit status');
assertEqual(templatedPlan.goalId, 'goal_link_1', 'createTrainingPlanFromTemplate preserves linked goal id');
assertEqual(templatedPlan.startDate, '2026-07-01', 'createTrainingPlanFromTemplate preserves startDate');
assertEqual(templatedPlan.endDate, '2026-07-07', 'createTrainingPlanFromTemplate generates 7-day endDate');
assertEqual(Array.isArray(templatedPlan.days), true, 'createTrainingPlanFromTemplate returns days array');
assertEqual(templatedPlan.days.length, 7, 'createTrainingPlanFromTemplate creates 7 days');
assertDeepEqual(
  templatedPlan.days.map((day) => day.date),
  ['2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04', '2026-07-05', '2026-07-06', '2026-07-07'],
  'createTrainingPlanFromTemplate generates consecutive day dates',
);
assert(
  templatedPlan.days.every((day) => Array.isArray(day.tasks) && day.tasks.length >= 1),
  'createTrainingPlanFromTemplate keeps day task arrays populated',
);
assert(
  templatedPlan.days.flatMap((day) => day.tasks).every((task) => (
    typeof task.id === 'string'
    && Object.prototype.hasOwnProperty.call(task, 'text')
    && Object.prototype.hasOwnProperty.call(task, 'target')
    && Object.prototype.hasOwnProperty.call(task, 'desc')
    && Object.prototype.hasOwnProperty.call(task, 'category')
    && Object.prototype.hasOwnProperty.call(task, 'durationMinutes')
    && Object.prototype.hasOwnProperty.call(task, 'intensity')
    && Object.prototype.hasOwnProperty.call(task, 'completed')
    && Object.prototype.hasOwnProperty.call(task, 'completedAt')
    && task.source === 'trainingPlanV1'
  )),
  'createTrainingPlanFromTemplate creates UI-ready plan task shape',
);
assertEqual(JSON.stringify(templateOptions), templateOptionsSnapshot, 'createTrainingPlanFromTemplate does not mutate options');
const localizedPlan = createTrainingPlanFromTemplate('regular_week', '2026-07-01', { language: 'zh' });
assertEqual(localizedPlan.title, '常规训练周', 'createTrainingPlanFromTemplate uses localized title when no override is provided');

section('training V1 defaults');
const defaultGoals = createDefaultLindsayGoals();
assertEqual(defaultGoals.length, 3, 'createDefaultLindsayGoals returns expected core goal count');
assert(defaultGoals.every((defaultGoal) => defaultGoal.status === 'active'), 'createDefaultLindsayGoals returns active default goals');
assert(defaultGoals.some((defaultGoal) => defaultGoal.title === 'AGN 2027 500m'), 'createDefaultLindsayGoals includes 500m default goal');
const defaultPlan = createDefaultLindsayWeeklyPlan('2026-08-03');
assertEqual(defaultPlan.title, 'Lindsay Weekly Training Plan', 'createDefaultLindsayWeeklyPlan uses stable default title');
assertEqual(defaultPlan.startDate, '2026-08-03', 'createDefaultLindsayWeeklyPlan preserves start date');
assertEqual(defaultPlan.endDate, '2026-08-09', 'createDefaultLindsayWeeklyPlan generates 7-day end date');
assertEqual(defaultPlan.status, 'draft', 'createDefaultLindsayWeeklyPlan keeps draft status');
assertEqual(defaultPlan.days.length, 7, 'createDefaultLindsayWeeklyPlan creates 7 days');
assert(defaultPlan.days.every((day) => Array.isArray(day.tasks) && day.tasks.length >= 1), 'createDefaultLindsayWeeklyPlan populates weekly tasks');

const emptyV1Data = {
  competitionGoalsV1: [],
  trainingPlansV1: [],
  activeTrainingPlanId: null,
};
assertEqual(shouldSeedTrainingV1Goals(emptyV1Data), true, 'shouldSeedTrainingV1Goals is true for empty V1 data');
assertEqual(shouldSeedTrainingV1Plan(emptyV1Data, '2026-08-03'), true, 'shouldSeedTrainingV1Plan is true when weekly default plan is missing');
assertEqual(getMissingDefaultLindsayGoalInputs(emptyV1Data).length, 3, 'getMissingDefaultLindsayGoalInputs returns all defaults for empty V1 data');
assertEqual(createMissingDefaultLindsayGoals(emptyV1Data).length, 3, 'createMissingDefaultLindsayGoals creates all missing defaults for empty V1 data');

const seededV1Data = {
  competitionGoalsV1: createMissingDefaultLindsayGoals(emptyV1Data),
  trainingPlansV1: [createDefaultLindsayWeeklyPlan('2026-08-03')],
  activeTrainingPlanId: null,
};
assertEqual(shouldSeedTrainingV1Goals(seededV1Data), false, 'shouldSeedTrainingV1Goals is false after defaults are present');
assertEqual(shouldSeedTrainingV1Plan(seededV1Data, '2026-08-03'), false, 'shouldSeedTrainingV1Plan is false after weekly default plan exists');
assertEqual(getMissingDefaultLindsayGoalInputs(seededV1Data).length, 0, 'getMissingDefaultLindsayGoalInputs is empty after defaults are present');
assertEqual(createMissingDefaultLindsayGoals(seededV1Data).length, 0, 'createMissingDefaultLindsayGoals is idempotent once defaults exist');

const customGoal = {
  id: 'user_goal_1',
  title: 'Custom User Goal',
  competitionName: 'Club Meet',
  competitionDate: '2026-11-01',
  eventName: '1500m',
  targetDistance: '1500m',
  status: 'active',
};
const customPlan = {
  id: 'user_plan_1',
  title: 'Custom Athlete Plan',
  startDate: '2026-08-10',
  endDate: '2026-08-16',
  status: 'active',
  days: [],
};
const mixedV1Data = {
  competitionGoalsV1: [customGoal, defaultGoals[0]],
  trainingPlansV1: [customPlan],
  activeTrainingPlanId: 'user_plan_1',
};
const mixedMissingInputs = getMissingDefaultLindsayGoalInputs(mixedV1Data);
assertEqual(mixedMissingInputs.length, 2, 'existing matching default goals are not duplicated while other defaults remain missing');
assertEqual(mixedV1Data.competitionGoalsV1[0].title, 'Custom User Goal', 'existing user-created goals are preserved');
assertEqual(mixedV1Data.trainingPlansV1[0].title, 'Custom Athlete Plan', 'existing user-created plans are preserved');
assertEqual(shouldSeedTrainingV1Plan(mixedV1Data, '2026-08-03'), true, 'weekly default plan is still considered missing when only custom plans exist');
assertEqual(mixedV1Data.activeTrainingPlanId, 'user_plan_1', 'activeTrainingPlanId semantics remain untouched by default helpers');

section('training profile write patches');
assertDeepEqual(
  buildLanguagePreferencePatch('en'),
  { language: 'en' },
  'buildLanguagePreferencePatch returns expected patch shape',
);
assertDeepEqual(
  buildThemePreferencePatch('black'),
  { theme: 'black' },
  'buildThemePreferencePatch returns expected patch shape',
);
assertDeepEqual(
  buildParentPinPatch('1234'),
  { parentPin: '1234' },
  'buildParentPinPatch returns expected patch shape',
);
assertDeepEqual(
  buildUsernamePatch('Lindsay'),
  { username: 'Lindsay' },
  'buildUsernamePatch returns expected patch shape',
);
assertDeepEqual(
  buildAvatarPatch('data:image/jpeg;base64,abc'),
  { avatar: 'data:image/jpeg;base64,abc' },
  'buildAvatarPatch returns expected patch shape',
);

const preferencesInput = { language: 'zh', theme: undefined, ignored: 'x' };
const preferencesSnapshot = JSON.stringify(preferencesInput);
assertDeepEqual(
  buildUserPreferencesPatch(preferencesInput),
  { language: 'zh' },
  'buildUserPreferencesPatch omits undefined values and preserves field names',
);
assertEqual(
  JSON.stringify(preferencesInput),
  preferencesSnapshot,
  'buildUserPreferencesPatch does not mutate input',
);

const profileSettingsInput = { username: 'Skater', parentPin: '', avatar: undefined, extra: 'ignored' };
const profileSettingsSnapshot = JSON.stringify(profileSettingsInput);
assertDeepEqual(
  buildProfileSettingsPatch(profileSettingsInput),
  { parentPin: '', username: 'Skater' },
  'buildProfileSettingsPatch omits undefined values and preserves allowed field names',
);
assertEqual(
  JSON.stringify(profileSettingsInput),
  profileSettingsSnapshot,
  'buildProfileSettingsPatch does not mutate input',
);

const failed = results.filter((result) => !result.ok);
console.log(`\nSummary: ${results.length - failed.length}/${results.length} checks passed`);

if (failed.length > 0) {
  process.exit(1);
}
