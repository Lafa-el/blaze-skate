export const normalizeTaskText = (value) => (
  String(value ?? '').trim().toLowerCase()
);

export const normalizeTaskTarget = (value) => normalizeTaskText(value);

export const getTaskMatchKey = (task) => (
  `${normalizeTaskText(task?.text)}::${normalizeTaskTarget(task?.target)}`
);

export const doTasksMatchByTextAndTarget = (taskA, taskB) => {
  const taskAText = normalizeTaskText(taskA?.text);
  if (!taskAText) return false;

  return taskAText === normalizeTaskText(taskB?.text)
    && normalizeTaskTarget(taskA?.target) === normalizeTaskTarget(taskB?.target);
};

export const dedupeTasksByMatchKey = (tasks = []) => {
  const seenKeys = new Set();

  return tasks.filter((task) => {
    const key = getTaskMatchKey(task);
    if (!normalizeTaskText(task?.text) || seenKeys.has(key)) return false;

    seenKeys.add(key);
    return true;
  });
};
