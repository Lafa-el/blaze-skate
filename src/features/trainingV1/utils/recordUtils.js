import { sortByDateAsc } from './dateUtils.js';

const normalizeNullableNumber = (value) => (
  typeof value === 'number' && Number.isFinite(value) ? value : null
);

const toTimestamp = (dateString) => {
  if (typeof dateString !== 'string' || !dateString.trim()) return null;
  const timestamp = new Date(dateString.replace(/-/g, '/')).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

export const normalizeRecordDistance = (distance) => {
  const raw = String(distance ?? '').trim();
  if (!raw) return '';

  const compactLower = raw.replace(/\s+/g, '').toLowerCase();
  if (compactLower === 'start' || raw === '起跑') return 'Start';
  if (compactLower === 'lap' || raw === '单圈') return 'Lap';

  const knownDistanceMatch = raw.match(/(^|[^0-9])(500|777|1000|1500)\s*m?([^0-9]|$)/i);
  if (knownDistanceMatch) return `${knownDistanceMatch[2]}m`;

  return raw.replace(/\s+/g, ' ');
};

export const getRecordCollectionKeyForDistance = (distance) => {
  const normalizedDistance = normalizeRecordDistance(distance);
  if (normalizedDistance === '500m') return 'records';
  if (normalizedDistance === '777m') return 'records777';
  if (normalizedDistance === '1000m') return 'records1000';
  if (normalizedDistance === '1500m') return 'records1500';
  if (normalizedDistance === 'Start') return 'recordsStart';
  if (normalizedDistance === 'Lap') return 'recordsLap';
  return normalizedDistance ? `records_${normalizedDistance}` : null;
};

const getCompatibleRecordKeysForDistance = (distance) => {
  const raw = String(distance ?? '').trim();
  const normalizedKey = getRecordCollectionKeyForDistance(raw);
  const rawKey = raw ? `records_${raw}` : null;
  return [...new Set([normalizedKey, rawKey].filter(Boolean))];
};

export const getRecordsForDistance = (data = {}, distance) => {
  const key = getRecordCollectionKeyForDistance(distance);
  return key && Array.isArray(data[key]) ? data[key] : [];
};

export const getValidTimedRecordsForDistance = (data = {}, distance) => (
  getCompatibleRecordKeysForDistance(distance)
    .flatMap((recordsKey) => (
      Array.isArray(data[recordsKey])
        ? data[recordsKey].map(record => ({ record, recordsKey }))
        : []
    ))
    .map(({ record, recordsKey }) => ({
      date: typeof record?.date === 'string' ? record.date : null,
      timeSeconds: normalizeNullableNumber(record?.time),
      timestamp: toTimestamp(record?.date),
      record,
      recordsKey,
    }))
    .filter(record => record.date && record.timeSeconds !== null && record.timestamp !== null)
);

export const sortRecordsByDateAsc = (records = []) => (
  sortByDateAsc(records, (record) => record?.date || '')
);

export const sortRecordsByDateDesc = (records = []) => (
  sortRecordsByDateAsc(records).reverse()
);

export const getBestRecordForDistance = (data = {}, distance) => {
  const validRecords = getValidTimedRecordsForDistance(data, distance);

  return validRecords.reduce((best, current) => {
    if (!best || current.timeSeconds < best.timeSeconds) {
      return {
        source: 'records',
        timeSeconds: current.timeSeconds,
        date: current.date,
        record: current.record,
        recordsKey: current.recordsKey,
      };
    }

    return best;
  }, null);
};
