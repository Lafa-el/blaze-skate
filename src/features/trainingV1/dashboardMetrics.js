import {
  getBestRecordForDistance,
  getActiveCompetitionGoals,
  getGoalCurrentPerformance,
  sortGoalsByPriorityAndDate,
} from './goals.js';
import {
  getActiveTrainingPlan,
  getPlanTasksByDate,
  getPlanTasksForWeek,
  normalizeTaskText,
} from './plans.js';

const toDateString = (date) => (
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
);

const addDays = (dateString, daysToAdd) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day + daysToAdd);
  return toDateString(date);
};

const summarizeTasks = (tasks = []) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task?.completed).length;

  return {
    totalTasks,
    completedTasks,
    completionPercent: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
  };
};

const isPlanDateComplete = (plan, dateString) => {
  const tasks = getPlanTasksByDate(plan, dateString);
  return tasks.length > 0 && tasks.every((task) => task?.completed);
};

export const getDashboardTrainingPlan = (data = {}) => {
  const plans = data.trainingPlansV1 || [];
  const activePlan = getActiveTrainingPlan(plans, data.activeTrainingPlanId);
  if (activePlan) return activePlan;

  const selectedPlan = plans.find((plan) => (
    plan?.id === data.activeTrainingPlanId && plan?.status !== 'archived'
  ));
  if (selectedPlan) return selectedPlan;

  return plans.find((plan) => plan?.status === 'active' || plan?.status === 'draft') || null;
};

export const getTodayPlanSummary = (data = {}, todayString) => {
  const activePlan = getDashboardTrainingPlan(data);
  const tasks = activePlan ? getPlanTasksByDate(activePlan, todayString) : [];

  return {
    plan: activePlan,
    date: todayString,
    tasks,
    ...summarizeTasks(tasks),
  };
};

export const getAllPlanTasksWithDates = (plan) => (
  (plan?.days || []).flatMap((day) => (
    (day?.tasks || []).map((task) => ({
      task,
      date: day?.date || '',
    }))
  ))
);

const getTaskMatchKey = (task) => (
  `${normalizeTaskText(task?.text)}::${normalizeTaskText(task?.target)}`
);

export const getDailyTasksMatchedToPlanTasks = (dailyTasks = [], plan) => {
  const planTaskMatchesByKey = getAllPlanTasksWithDates(plan).reduce((matches, planTaskWithDate) => {
    const key = getTaskMatchKey(planTaskWithDate.task);
    if (!normalizeTaskText(planTaskWithDate.task?.text)) return matches;

    return {
      ...matches,
      [key]: [...(matches[key] || []), planTaskWithDate],
    };
  }, {});

  return dailyTasks
    .map((dailyTask) => ({
      dailyTask,
      matches: planTaskMatchesByKey[getTaskMatchKey(dailyTask)] || [],
    }))
    .filter(({ matches }) => matches.length > 0);
};

export const getTodayExecutionSummary = (data = {}, todayString) => {
  const dailyTasks = data.tasks || [];
  const activePlan = getDashboardTrainingPlan(data);
  const matchedDailyTasks = getDailyTasksMatchedToPlanTasks(dailyTasks, activePlan);

  return {
    plan: activePlan,
    date: todayString,
    totalDailyTasks: dailyTasks.length,
    completedDailyTasks: dailyTasks.filter((task) => task?.completed).length,
    planTasksAddedToToday: matchedDailyTasks.length,
    planTasksAddedFromOtherDates: matchedDailyTasks.filter(({ matches }) => (
      matches.some((match) => match.date !== todayString)
    )).length,
  };
};

export const getWeeklyPlanSummary = (data = {}, weekStartDateString) => {
  const activePlan = getDashboardTrainingPlan(data);
  const tasks = activePlan ? getPlanTasksForWeek(activePlan, weekStartDateString) : [];

  return {
    plan: activePlan,
    weekStartDate: weekStartDateString,
    weekEndDate: addDays(weekStartDateString, 6),
    tasks,
    ...summarizeTasks(tasks),
  };
};

export const getGoalsSummary = (data = {}) => {
  const goals = data.competitionGoalsV1 || [];
  const activeGoals = sortGoalsByPriorityAndDate(getActiveCompetitionGoals(goals));

  return {
    totalGoals: goals.length,
    activeGoals,
    activeCount: activeGoals.length,
    completedCount: goals.filter((goal) => goal?.status === 'completed').length,
    archivedCount: goals.filter((goal) => goal?.status === 'archived').length,
    topGoal: activeGoals[0] || null,
  };
};

export const getV1PBFromGoalOrRecords = (data = {}, distance) => {
  const bestRecord = getBestRecordForDistance(data, distance);

  if (bestRecord) {
    return {
      distance,
      timeSeconds: bestRecord.timeSeconds,
      source: 'records',
      goal: null,
      record: bestRecord.record,
      date: bestRecord.date,
    };
  }

  const matchingGoals = getActiveCompetitionGoals(data.competitionGoalsV1 || [])
    .filter((goal) => goal?.targetDistance === distance && typeof goal?.currentTimeSeconds === 'number');

  if (matchingGoals.length > 0) {
    const goal = matchingGoals.reduce((best, current) => (
      current.currentTimeSeconds < best.currentTimeSeconds ? current : best
    ), matchingGoals[0]);

    return {
      distance,
      timeSeconds: goal.currentTimeSeconds,
      source: 'goal',
      goal,
      record: null,
      date: null,
    };
  }

  return null;
};

export const getSimplePlanStreak = (data = {}, todayString) => {
  const activePlan = getDashboardTrainingPlan(data);
  if (!activePlan) return 0;

  const yesterdayString = addDays(todayString, -1);
  let dateString = isPlanDateComplete(activePlan, todayString) ? todayString : yesterdayString;
  let streak = 0;

  while (isPlanDateComplete(activePlan, dateString)) {
    streak += 1;
    dateString = addDays(dateString, -1);
  }

  return streak;
};

export const getPlanConsistencySummary = (data = {}, weekStartDateString) => {
  const activePlan = getDashboardTrainingPlan(data);
  const weekDates = Array.from({ length: 7 }, (_, index) => addDays(weekStartDateString, index));

  if (!activePlan) {
    return {
      plan: null,
      weekStartDate: weekStartDateString,
      weekEndDate: addDays(weekStartDateString, 6),
      daysWithCompletedTasks: 0,
      completedTasks: 0,
    };
  }

  return weekDates.reduce((summary, dateString) => {
    const completedTasksForDay = getPlanTasksByDate(activePlan, dateString)
      .filter((task) => task?.completed).length;

    return {
      ...summary,
      daysWithCompletedTasks: summary.daysWithCompletedTasks + (completedTasksForDay > 0 ? 1 : 0),
      completedTasks: summary.completedTasks + completedTasksForDay,
    };
  }, {
    plan: activePlan,
    weekStartDate: weekStartDateString,
    weekEndDate: addDays(weekStartDateString, 6),
    daysWithCompletedTasks: 0,
    completedTasks: 0,
  });
};

export const getGoalCurrentBest = (goal, data = {}) => getGoalCurrentPerformance(goal, data);
