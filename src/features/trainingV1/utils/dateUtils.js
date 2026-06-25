export const toDateString = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const getTodayDateString = () => toDateString(new Date());

export const addDaysToDateString = (dateString, days) => {
  const [year, month, day] = String(dateString || '').split('-').map(Number);
  if (!year || !month || !day || !Number.isFinite(days)) return '';

  const date = new Date(year, month - 1, day + days);
  return toDateString(date);
};

export const getWeekStartDateString = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  return toDateString(startOfWeek);
};

export const getWeekDateRange = (startDateString) => ({
  startDate: String(startDateString || ''),
  endDate: addDaysToDateString(startDateString, 6),
});

export const isDateStringInRange = (dateString, startDateString, endDateString) => (
  typeof dateString === 'string'
  && typeof startDateString === 'string'
  && typeof endDateString === 'string'
  && dateString >= startDateString
  && dateString <= endDateString
);

export const sortByDateAsc = (items = [], getDate) => (
  [...items].sort((a, b) => {
    const dateA = String(getDate(a) || '');
    const dateB = String(getDate(b) || '');
    return dateA.localeCompare(dateB);
  })
);
