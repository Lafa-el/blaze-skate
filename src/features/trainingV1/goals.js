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

export const normalizeGoalDistance = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const compactLower = raw.replace(/\s+/g, '').toLowerCase();
  if (compactLower === 'start' || raw === '起跑') return 'Start';
  if (compactLower === 'lap' || raw === '单圈') return 'Lap';

  const knownDistanceMatch = raw.match(/(^|[^0-9])(500|777|1000|1500)\s*m?([^0-9]|$)/i);
  if (knownDistanceMatch) return `${knownDistanceMatch[2]}m`;

  return raw.replace(/\s+/g, ' ');
};

export const getRecordsKeyForDistance = (distance) => {
  const normalizedDistance = normalizeGoalDistance(distance);
  if (normalizedDistance === '500m') return 'records';
  if (normalizedDistance === '777m') return 'records777';
  if (normalizedDistance === '1000m') return 'records1000';
  if (normalizedDistance === '1500m') return 'records1500';
  if (normalizedDistance === 'Start') return 'recordsStart';
  if (normalizedDistance === 'Lap') return 'recordsLap';
  return normalizedDistance ? `records_${normalizedDistance}` : null;
};

const getRecordKeysForDistance = (distance) => {
  const raw = String(distance ?? '').trim();
  const normalizedKey = getRecordsKeyForDistance(raw);
  const rawKey = raw ? `records_${raw}` : null;
  return [...new Set([normalizedKey, rawKey].filter(Boolean))];
};

const getGoalDistanceCandidates = (goal) => (
  [goal?.targetDistance, goal?.eventName]
    .map(value => String(value ?? '').trim())
    .filter(Boolean)
);

const toTimestamp = (dateString) => {
  if (typeof dateString !== 'string' || !dateString.trim()) return null;
  const timestamp = new Date(dateString.replace(/-/g, '/')).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

export const getBestRecordForDistance = (data = {}, distance) => {
  const recordsWithKeys = getRecordKeysForDistance(distance)
    .flatMap((recordsKey) => (
      Array.isArray(data[recordsKey])
        ? data[recordsKey].map(record => ({ record, recordsKey }))
        : []
    ));

  const bestRecordWithKey = recordsWithKeys.reduce((best, current) => {
    const time = normalizeNullableNumber(current.record?.time);
    if (time === null) return best;
    if (!best || time < best.timeSeconds) {
      return {
        source: 'records',
        timeSeconds: time,
        date: typeof current.record?.date === 'string' ? current.record.date : null,
        record: current.record,
        recordsKey: current.recordsKey,
      };
    }
    return best;
  }, null);

  return bestRecordWithKey;
};

export const getRecordHistoryForDistance = (data = {}, distance) => {
  const recordsWithKeys = getRecordKeysForDistance(distance)
    .flatMap((recordsKey) => (
      Array.isArray(data[recordsKey])
        ? data[recordsKey].map(record => ({ record, recordsKey }))
        : []
    ))
    .map(({ record, recordsKey }) => ({
      date: typeof record?.date === 'string' ? record.date : null,
      timeSeconds: normalizeNullableNumber(record?.time),
      timestamp: toTimestamp(record?.date),
      recordsKey,
    }))
    .filter(record => record.date && record.timeSeconds !== null && record.timestamp !== null)
    .sort((a, b) => {
      return a.timestamp - b.timestamp;
    });

  return recordsWithKeys.map((record) => ({
    date: record.date,
    timeSeconds: record.timeSeconds,
    recordsKey: record.recordsKey,
  }));
};

const getManualCurrentDate = (goal) => (
  typeof goal?.currentTimeDate === 'string' ? goal.currentTimeDate
    : typeof goal?.currentDate === 'string' ? goal.currentDate
      : typeof goal?.currentPerformanceDate === 'string' ? goal.currentPerformanceDate
        : null
);

export const getGoalCurrentPerformance = (goal, data = {}) => {
  const bestRecord = getGoalDistanceCandidates(goal)
    .map(distance => getBestRecordForDistance(data, distance))
    .find(Boolean);

  if (bestRecord) {
    return {
      source: 'records',
      timeSeconds: bestRecord.timeSeconds,
      date: bestRecord.date,
    };
  }

  const manualCurrentTime = normalizeNullableNumber(goal?.currentTimeSeconds);
  if (manualCurrentTime !== null) {
    return {
      source: 'goal',
      timeSeconds: manualCurrentTime,
      date: getManualCurrentDate(goal),
    };
  }

  return {
    source: 'none',
    timeSeconds: null,
    date: null,
  };
};

export const getGoalTargetGapHistory = (goal, data = {}) => {
  const targetTimeSeconds = normalizeNullableNumber(goal?.targetTimeSeconds);
  if (targetTimeSeconds === null) return [];

  const recordHistory = getGoalDistanceCandidates(goal)
    .map(distance => getRecordHistoryForDistance(data, distance))
    .find(history => history.length > 0) || [];

  return recordHistory.map((record) => ({
    date: record.date,
    timeSeconds: record.timeSeconds,
    targetTimeSeconds,
    gapSeconds: record.timeSeconds - targetTimeSeconds,
    achieved: record.timeSeconds <= targetTimeSeconds,
  }));
};

export const getGoalTrendSummary = (goal, data = {}) => {
  const history = getGoalTargetGapHistory(goal, data);
  if (history.length === 0) {
    return {
      hasHistory: false,
      firstGapSeconds: null,
      latestGapSeconds: null,
      bestGapSeconds: null,
      improvementSeconds: null,
      latestRecordDate: null,
      bestRecordDate: null,
      achieved: false,
    };
  }

  const firstRecord = history[0];
  const latestRecord = history[history.length - 1];
  const bestRecord = history.reduce((best, current) => (
    current.gapSeconds < best.gapSeconds ? current : best
  ), history[0]);

  return {
    hasHistory: true,
    firstGapSeconds: firstRecord.gapSeconds,
    latestGapSeconds: latestRecord.gapSeconds,
    bestGapSeconds: bestRecord.gapSeconds,
    improvementSeconds: firstRecord.gapSeconds - latestRecord.gapSeconds,
    latestRecordDate: latestRecord.date,
    bestRecordDate: bestRecord.date,
    achieved: history.some(record => record.achieved),
  };
};

const createGoalWithCurrentPerformance = (goal, data = {}) => {
  const currentPerformance = getGoalCurrentPerformance(goal, data);
  return {
    ...goal,
    currentTimeSeconds: currentPerformance.timeSeconds,
  };
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
  const bestRecord = getGoalDistanceCandidates(goal)
    .map(distance => getBestRecordForDistance(data, distance))
    .find(Boolean);

  return bestRecord?.record || null;
};

export const getGoalProgressWithPB = (goal, data = {}) => (
  getGoalProgress(createGoalWithCurrentPerformance(goal, data))
);

export const getGoalGapWithPB = (goal, data = {}) => (
  getGoalGap(createGoalWithCurrentPerformance(goal, data))
);

export const sortGoalsByPriorityAndDate = (goals = []) => (
  [...goals].sort((a, b) => {
    const priorityDelta = (PRIORITY_ORDER[a?.priority] ?? 99) - (PRIORITY_ORDER[b?.priority] ?? 99);
    if (priorityDelta !== 0) return priorityDelta;

    const dateA = a?.competitionDate || '9999-12-31';
    const dateB = b?.competitionDate || '9999-12-31';
    return dateA.localeCompare(dateB);
  })
);
