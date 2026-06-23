const GOAL_PRIORITIES = ['A', 'B', 'C'];
const GOAL_STATUSES = ['active', 'completed', 'archived'];
const PRIORITY_ORDER = { A: 0, B: 1, C: 2 };

const createId = () => `goal_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const createTimestamp = () => new Date().toISOString();

const normalizePriority = (priority) => (
  GOAL_PRIORITIES.includes(priority) ? priority : 'C'
);

const normalizeStatus = (status) => (
  GOAL_STATUSES.includes(status) ? status : 'active'
);

const normalizeNullableNumber = (value) => (
  typeof value === 'number' && Number.isFinite(value) ? value : null
);

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const getRecordsKey = (distance) => {
  if (distance === '500m') return 'records';
  if (distance === '777m') return 'records777';
  if (distance === '1000m') return 'records1000';
  if (distance === '1500m') return 'records1500';
  if (distance === '起跑' || distance === 'Start') return 'recordsStart';
  if (distance === '单圈' || distance === 'Lap') return 'recordsLap';
  return `records_${distance}`;
};

export const isValidGoalPriority = (priority) => GOAL_PRIORITIES.includes(priority);

export const isValidGoalStatus = (status) => GOAL_STATUSES.includes(status);

export const createCompetitionGoal = (input = {}) => {
  const timestamp = input.createdAt || createTimestamp();

  return {
    id: input.id || createId(),
    title: input.title || '',
    competitionName: input.competitionName || '',
    competitionDate: input.competitionDate || '',
    eventName: input.eventName || '',
    targetDistance: input.targetDistance || '',
    targetTimeSeconds: normalizeNullableNumber(input.targetTimeSeconds),
    currentTimeSeconds: normalizeNullableNumber(input.currentTimeSeconds),
    priority: normalizePriority(input.priority),
    status: normalizeStatus(input.status),
    notes: input.notes || '',
    createdAt: timestamp,
    updatedAt: input.updatedAt || timestamp,
  };
};

export const updateCompetitionGoal = (goal, patch = {}) => ({
  ...goal,
  ...patch,
  priority: patch.priority ? normalizePriority(patch.priority) : goal.priority,
  status: patch.status ? normalizeStatus(patch.status) : goal.status,
  targetTimeSeconds: hasOwn(patch, 'targetTimeSeconds')
    ? normalizeNullableNumber(patch.targetTimeSeconds)
    : goal.targetTimeSeconds,
  currentTimeSeconds: hasOwn(patch, 'currentTimeSeconds')
    ? normalizeNullableNumber(patch.currentTimeSeconds)
    : goal.currentTimeSeconds,
  createdAt: goal.createdAt,
  updatedAt: createTimestamp(),
});

export const archiveCompetitionGoal = (goal) => updateCompetitionGoal(goal, {
  status: 'archived',
});

export const getActiveCompetitionGoals = (goals = []) => (
  goals.filter((goal) => goal?.status === 'active')
);

export const getGoalProgress = (goal) => {
  const currentTimeSeconds = normalizeNullableNumber(goal?.currentTimeSeconds);
  const targetTimeSeconds = normalizeNullableNumber(goal?.targetTimeSeconds);

  if (!currentTimeSeconds || !targetTimeSeconds) return null;
  if (currentTimeSeconds <= targetTimeSeconds) return 100;

  return Math.min(100, Math.round((targetTimeSeconds / currentTimeSeconds) * 100));
};

export const getGoalGap = (goal) => {
  const currentTimeSeconds = normalizeNullableNumber(goal?.currentTimeSeconds);
  const targetTimeSeconds = normalizeNullableNumber(goal?.targetTimeSeconds);

  if (!currentTimeSeconds || !targetTimeSeconds) return null;

  return currentTimeSeconds - targetTimeSeconds;
};

export const getGoalCurrentBestFromRecords = (goal, data = {}) => {
  const distance = goal?.targetDistance;
  if (!distance) return null;

  const records = data[getRecordsKey(distance)] || [];
  if (records.length === 0) return null;

  return records.reduce((best, record) => {
    if (typeof record?.time !== 'number') return best;
    if (!best || record.time < best.time) return record;
    return best;
  }, null);
};

export const sortGoalsByPriorityAndDate = (goals = []) => (
  [...goals].sort((a, b) => {
    const priorityDelta = (PRIORITY_ORDER[a?.priority] ?? 99) - (PRIORITY_ORDER[b?.priority] ?? 99);
    if (priorityDelta !== 0) return priorityDelta;

    const dateA = a?.competitionDate || '9999-12-31';
    const dateB = b?.competitionDate || '9999-12-31';
    return dateA.localeCompare(dateB);
  })
);
