import {
  addDaysToDateString,
} from './utils/dateUtils.js';
import {
  doTasksMatchByTextAndTarget,
  normalizeTaskText,
} from './utils/taskMatchUtils.js';

const PLAN_STATUSES = ['draft', 'active', 'completed', 'archived'];
const TASK_CATEGORIES = [
  'ice',
  'dryland',
  'strength',
  'running',
  'mobility',
  'recovery',
  'video',
  'mental',
  'competition',
  'other',
];
const TASK_INTENSITIES = ['low', 'medium', 'high'];

const createId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const createTimestamp = () => new Date().toISOString();

const normalizeStatus = (status) => (
  PLAN_STATUSES.includes(status) ? status : 'draft'
);

const normalizeCategory = (category) => (
  TASK_CATEGORIES.includes(category) ? category : 'other'
);

const normalizeIntensity = (intensity) => (
  TASK_INTENSITIES.includes(intensity) ? intensity : null
);

const normalizeNullableNumber = (value) => (
  typeof value === 'number' && Number.isFinite(value) ? value : null
);

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const getPlanTasks = (plan) => (
  (plan?.days || []).flatMap((day) => day?.tasks || [])
);

export const isValidPlanStatus = (status) => PLAN_STATUSES.includes(status);

export const isValidPlanTaskCategory = (category) => TASK_CATEGORIES.includes(category);

export const isValidPlanTaskIntensity = (intensity) => (
  intensity === null || TASK_INTENSITIES.includes(intensity)
);

export const createPlanTask = (input = {}) => {
  const timestamp = input.createdAt || createTimestamp();

  return {
    id: input.id || createId('plan_task'),
    text: input.text || '',
    target: input.target || null,
    desc: input.desc || null,
    category: normalizeCategory(input.category),
    durationMinutes: normalizeNullableNumber(input.durationMinutes),
    intensity: normalizeIntensity(input.intensity),
    completed: Boolean(input.completed),
    completedAt: input.completedAt || null,
    source: 'trainingPlanV1',
    createdAt: timestamp,
    updatedAt: input.updatedAt || timestamp,
  };
};

export const updatePlanTask = (task, patch = {}) => ({
  ...task,
  ...patch,
  category: hasOwn(patch, 'category') ? normalizeCategory(patch.category) : task.category,
  durationMinutes: hasOwn(patch, 'durationMinutes')
    ? normalizeNullableNumber(patch.durationMinutes)
    : task.durationMinutes,
  intensity: hasOwn(patch, 'intensity') ? normalizeIntensity(patch.intensity) : task.intensity,
  source: 'trainingPlanV1',
  createdAt: task.createdAt,
  updatedAt: createTimestamp(),
});

export const completePlanTask = (task, completed = true) => updatePlanTask(task, {
  completed,
  completedAt: completed ? createTimestamp() : null,
});

export const createTrainingPlan = (input = {}) => {
  const timestamp = input.createdAt || createTimestamp();

  return {
    id: input.id || createId('plan'),
    title: input.title || '',
    startDate: input.startDate || '',
    endDate: input.endDate || '',
    focus: input.focus || '',
    goalId: input.goalId || null,
    status: normalizeStatus(input.status),
    days: input.days || [],
    createdAt: timestamp,
    updatedAt: input.updatedAt || timestamp,
  };
};

export const updateTrainingPlan = (plan, patch = {}) => ({
  ...plan,
  ...patch,
  status: patch.status ? normalizeStatus(patch.status) : plan.status,
  createdAt: plan.createdAt,
  updatedAt: createTimestamp(),
});

export const archiveTrainingPlan = (plan) => updateTrainingPlan(plan, {
  status: 'archived',
});

export const isPlanArchived = (plan) => plan?.status === 'archived';

export const getArchivedTrainingPlans = (plans = []) => (
  plans.filter((plan) => isPlanArchived(plan))
);

export const getNonArchivedTrainingPlans = (plans = []) => (
  plans.filter((plan) => !isPlanArchived(plan))
);

export const restoreTrainingPlan = (plan) => updateTrainingPlan(plan, {
  status: 'draft',
});

export const getActiveTrainingPlans = (plans = []) => (
  plans.filter((plan) => plan?.status === 'active')
);

export const getActiveTrainingPlan = (plans = [], activeTrainingPlanId = null) => {
  if (activeTrainingPlanId) {
    return plans.find((plan) => plan?.id === activeTrainingPlanId && plan?.status === 'active') || null;
  }

  return getActiveTrainingPlans(plans)[0] || null;
};

export const getPlanTasksByDate = (plan, dateString) => {
  const day = (plan?.days || []).find((planDay) => planDay?.date === dateString);
  return day?.tasks || [];
};

export const getPlanTasksForWeek = (plan, weekStartDateString) => {
  const weekDates = new Set(Array.from(
    { length: 7 },
    (_, index) => addDaysToDateString(weekStartDateString, index),
  ));

  return (plan?.days || [])
    .filter((day) => weekDates.has(day?.date))
    .flatMap((day) => day?.tasks || []);
};

export const getWeeklyPlanCompletion = (plan) => {
  const tasks = getPlanTasks(plan);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task?.completed).length;

  return {
    totalTasks,
    completedTasks,
    completionPercent: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
  };
};

export const isPlanTaskAddedToToday = (planTask, dailyTasks = []) => {
  if (!normalizeTaskText(planTask?.text)) return false;
  return dailyTasks.some((dailyTask) => doTasksMatchByTextAndTarget(planTask, dailyTask));
};

export const getPlanTaskTodayStatus = (planTask, dailyTasks = []) => (
  isPlanTaskAddedToToday(planTask, dailyTasks) ? 'added_to_today' : 'not_added'
);

export const getPlanTaskDailyStatus = (planTask, dayDateString, dailyTasks = [], todayString) => {
  const isAddedToToday = isPlanTaskAddedToToday(planTask, dailyTasks);
  const isScheduledToday = Boolean(dayDateString && todayString && dayDateString === todayString);

  return {
    isAddedToToday,
    isScheduledToday,
    isAddedFromOtherDate: isAddedToToday && !isScheduledToday,
  };
};

export const convertPlanTaskToDailyTask = (planTask) => ({
  id: Date.now() + Math.random(),
  text: planTask?.text || '',
  target: planTask?.target || null,
  desc: planTask?.desc || null,
  completed: false,
  isTemplate: true,
});
