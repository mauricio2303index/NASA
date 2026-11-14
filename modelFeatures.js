import { validMeasurement } from './climateMath.js';

export const featureNames = [
  'precipitation1DayMm',
  'precipitationPreviousDayMm',
  'precipitation3DayMm',
  'precipitation7DayMm',
  'airTemperatureC',
  'relativeHumidityPercent',
  'rootZoneWetnessIndex',
  'windSpeedMps',
  'seasonSin',
  'seasonCos',
];

export function createModelFeatures(rows, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const dates = rows.map((row) => row.date);
  if (new Set(dates).size !== dates.length) return null;
  if (
    dates.some(
      (date) =>
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date,
    )
  ) {
    return null;
  }
  rows = rows
    .filter((row) => row.date < today)
    .sort((first, second) => first.date.localeCompare(second.date));
  const usableRows = rows.filter((row) => validMeasurement(row.rainfall));
  const latestRow = usableRows.at(-1);
  if (!latestRow) return null;
  const endDate = new Date(latestRow.date + 'T00:00:00Z');
  const weekRows = [];
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const date = new Date(endDate);
    date.setUTCDate(date.getUTCDate() - dayIndex);
    const row = rows.find((item) => item.date === date.toISOString().slice(0, 10));
    if (!row || !validMeasurement(row.rainfall)) return null;
    weekRows.push(row);
  }
  const requiredKeys = ['temperature', 'humidity', 'soilWetness', 'windSpeed'];
  if (requiredKeys.some((key) => !validMeasurement(latestRow[key]))) return null;
  const yearStart = Date.UTC(endDate.getUTCFullYear(), 0, 1);
  const dayOfYear = (endDate.getTime() - yearStart) / 86400000 + 1;
  const phase = (2 * Math.PI * dayOfYear) / 365.25;
  const values = [
    latestRow.rainfall,
    weekRows[1].rainfall,
    weekRows.slice(0, 3).reduce((sum, row) => sum + row.rainfall, 0),
    weekRows.reduce((sum, row) => sum + row.rainfall, 0),
    ...requiredKeys.map((key) => latestRow[key]),
    Math.sin(phase),
    Math.cos(phase),
  ];
  return { values, featureNames, observedThrough: latestRow.date };
}
