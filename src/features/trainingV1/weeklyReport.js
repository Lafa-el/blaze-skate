import {
  getGoalCurrentPerformance,
  getGoalGapWithPB,
  getGoalProgressWithPB,
  getGoalTargetGapHistory,
  getGoalTrendSummary,
} from './goals.js';
import {
  getGoalsSummary,
  getTodayExecutionSummary,
  getWeeklyPlanAdherenceSummary,
} from './dashboardMetrics.js';

const toDateString = (date) => (
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
);

const addDays = (dateString, daysToAdd) => {
  const [year, month, day] = String(dateString || '').split('-').map(Number);
  if (!year || !month || !day) return '';
  const date = new Date(year, month - 1, day + daysToAdd);
  return toDateString(date);
};

export const getWeeklyTrainingReportData = (data = {}, weekStartDateString) => {
  const safeWeekStartDate = typeof weekStartDateString === 'string' && weekStartDateString
    ? weekStartDateString
    : toDateString(new Date());
  const weekEndDate = addDays(safeWeekStartDate, 6);
  const adherenceSummary = getWeeklyPlanAdherenceSummary(data, safeWeekStartDate);
  const dailyExecutionSummary = getTodayExecutionSummary(data, toDateString(new Date()));
  const goalsSummary = getGoalsSummary(data);
  const topGoals = goalsSummary.activeGoals.slice(0, 3);

  return {
    weekRange: {
      startDate: safeWeekStartDate,
      endDate: weekEndDate,
    },
    generatedDate: toDateString(new Date()),
    planSummary: {
      id: adherenceSummary.plan?.id || null,
      title: adherenceSummary.plan?.title || '',
      focus: adherenceSummary.plan?.focus || '',
      startDate: adherenceSummary.plan?.startDate || '',
      endDate: adherenceSummary.plan?.endDate || '',
      status: adherenceSummary.plan?.status || null,
      goalId: adherenceSummary.plan?.goalId || null,
      linkedGoalTitle: adherenceSummary.plan?.goalId
        ? (data.competitionGoalsV1 || []).find((goal) => goal?.id === adherenceSummary.plan.goalId)?.title || ''
        : '',
    },
    adherenceSummary,
    dailyExecutionSummary: {
      totalDailyTasks: dailyExecutionSummary.totalDailyTasks,
      completedDailyTasks: dailyExecutionSummary.completedDailyTasks,
      completionPercent: dailyExecutionSummary.totalDailyTasks === 0
        ? 0
        : Math.round((dailyExecutionSummary.completedDailyTasks / dailyExecutionSummary.totalDailyTasks) * 100),
    },
    goalSummaries: topGoals.map((goal) => {
      const currentPerformance = getGoalCurrentPerformance(goal, data);
      const gapHistory = getGoalTargetGapHistory(goal, data);
      const trendSummary = getGoalTrendSummary(goal, data);

      return {
        id: goal.id,
        title: goal.title || '',
        eventName: goal.eventName || '',
        targetDistance: goal.targetDistance || '',
        targetTimeSeconds: goal.targetTimeSeconds ?? null,
        currentPerformance,
        latestGap: getGoalGapWithPB(goal, data),
        progressPercent: getGoalProgressWithPB(goal, data),
        achieved: trendSummary.achieved || getGoalProgressWithPB(goal, data) === 100,
        trendSummary,
        recentPbRecords: gapHistory.slice(-5).reverse(),
      };
    }),
  };
};
