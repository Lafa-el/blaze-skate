export const formatGoalSeconds = (value) => (
  typeof value === 'number' && Number.isFinite(value)
    ? `${Number(value.toFixed(3))}s`
    : '--'
);

export const formatGapSeconds = (value) => (
  typeof value === 'number' && Number.isFinite(value)
    ? `${value > 0 ? '+' : ''}${Number(value.toFixed(3))}s`
    : '--'
);

export const formatSignedGoalSeconds = formatGapSeconds;

export const formatPercent = (value) => (
  typeof value === 'number' && Number.isFinite(value)
    ? `${value}%`
    : '--'
);

export const formatDateLabel = (value, fallback = '--') => (
  typeof value === 'string' && value ? value.replace(/-/g, '/') : fallback
);

export const formatTrendSummaryText = (trendSummary, t) => {
  if (trendSummary?.achieved) return t.targetAchieved;
  if (!trendSummary?.hasHistory) return t.noPbHistoryYet;
  if (typeof trendSummary.improvementSeconds === 'number' && trendSummary.improvementSeconds > 0) {
    return t.improvedBy.replace('{value}', Number(trendSummary.improvementSeconds.toFixed(3)));
  }
  return `${t.latestGap} ${formatGapSeconds(trendSummary.latestGapSeconds)}`;
};
