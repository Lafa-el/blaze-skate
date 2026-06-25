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
import { getWeeklyPlanAdherenceSummary } from '../src/features/trainingV1/dashboardMetrics.js';
import { getWeeklyTrainingReportData } from '../src/features/trainingV1/weeklyReport.js';

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

const failed = results.filter((result) => !result.ok);
console.log(`\nSummary: ${results.length - failed.length}/${results.length} checks passed`);

if (failed.length > 0) {
  process.exit(1);
}
