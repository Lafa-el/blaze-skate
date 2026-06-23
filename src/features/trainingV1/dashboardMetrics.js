import {
  getActiveCompetitionGoals,
  getGoalCurrentBestFromRecords,
  sortGoalsByPriorityAndDate,
} from './goals.js';
import {
  getActiveTrainingPlan,
  getPlanTasksByDate,
  getPlanTasksForWeek,
} from './plans.js';

const getRecordsKey = (distance) => {
  if (distance === '500m') return 'records';
  if (distance === '777m') return 'records777';
  if (distance === '1000m') return 'records1000';
  if (distance === '1500m') return 'records1500';
  if (distance === '起跑' || distance === 'Start') return 'recordsStart';
  if (distance === '单圈' || distance === 'Lap') return 'recordsLap';
  return `records_${distance}`;
};

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

export const getTodayPlanSummary = (data = {}, todayString) => {
  const activePlan = getActiveTrainingPlan(data.trainingPlansV1 || [], data.activeTrainingPlanId);
  const tasks = activePlan ? getPlanTasksByDate(activePlan, todayString) : [];

  return {
    plan: activePlan,
    date: todayString,
    tasks,
    ...summarizeTasks(tasks),
  };
};

export const getWeeklyPlanSummary = (data = {}, weekStartDateString) => {
  const activePlan = getActiveTrainingPlan(data.trainingPlansV1 || [], data.activeTrainingPlanId);
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
  const matchingGoals = getActiveCompetitionGoals(data.competitionGoalsV1 || [])
    .filter((goal) => goal?.targetDistance === distance && typeof goal?.currentTimeSeconds === 'number');

  if (matchingGoals.length > 0) {
    const goal = matchingGoals.reduce((best, current) => (
      current.currentTimeSeconds < best.currentTimeSeconds ? current : best
    ), matchingGoals[0]);

    return {
      distance,
      timeSeconds: goal.currentTimeSeconds,
      source: 'competitionGoalsV1',
      goal,
      record: null,
    };
  }

  const records = data[getRecordsKey(distance)] || [];
  const record = records.reduce((best, current) => {
    if (typeof current?.time !== 'number') return best;
    if (!best || current.time < best.time) return current;
    return best;
  }, null);

  return record
    ? {
      distance,
      timeSeconds: record.time,
      source: 'records',
      goal: null,
      record,
    }
    : null;
};

export const getSimplePlanStreak = (data = {}, todayString) => {
  const activePlan = getActiveTrainingPlan(data.trainingPlansV1 || [], data.activeTrainingPlanId);
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

export const getGoalCurrentBest = getGoalCurrentBestFromRecords;
