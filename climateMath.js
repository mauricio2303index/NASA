import { regionConfig, variableConfig } from './appConfig.js';

export function validMeasurement(value, fillValue = -999) {
  return typeof value === 'number' && Number.isFinite(value) && value !== fillValue;
}

export function physicalMeasurement(variableKey, value, fillValue = -999) {
  if (!validMeasurement(value, fillValue)) return null;
  if (variableKey === 'temperature') return value >= -100 && value <= 70 ? value : null;
  if (variableKey === 'humidity') return value >= 0 && value <= 100 ? value : null;
  if (variableKey === 'soilWetness') return value >= 0 && value <= 1 ? value : null;
  return value >= 0 ? value : null;
}

export function daysInMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function normalizeMonthly(rawData) {
  const sourceParams = rawData?.properties?.parameter;
  if (!sourceParams || !rawData.header) throw new Error('Respuesta mensual NASA inválida.');
  const fillValue = rawData.header.fill_value ?? -999;
  const variables = {};
  for (const [variableKey, config] of Object.entries(variableConfig)) {
    const parameterData = sourceParams[config.parameter] ?? {};
    const yearSeries = {};
    for (const [dateKey, value] of Object.entries(parameterData)) {
      const year = Number(dateKey.slice(0, 4));
      const monthIndex = Number(dateKey.slice(4, 6)) - 1;
      if (monthIndex < 0 || monthIndex > 11) continue;
      yearSeries[year] ??= Array(12).fill(null);
      if (physicalMeasurement(variableKey, value, fillValue) === null) continue;
      const sourceUnit = rawData.parameters?.[config.parameter]?.units;
      if (variableKey === 'rainfall' && sourceUnit !== 'mm/day') {
        throw new Error('Unidad de precipitación inesperada; no se convierte automáticamente.');
      }
      yearSeries[year][monthIndex] =
        variableKey === 'rainfall' ? value * daysInMonth(year, monthIndex) : value;
    }
    variables[variableKey] = yearSeries;
  }
  return {
    variables,
    source: 'NASA POWER',
    sourceVersion: rawData.header.api?.version,
    sourceProducts: rawData.header.sources,
    sourceCoordinates: rawData.geometry?.coordinates,
    sourceUnits: rawData.parameters,
    period: [rawData.header.start, rawData.header.end],
    spatialResolution: 'Meteorología: 0,5° × 0,625°; radiación solar: 1° × 1°.',
    location: regionConfig,
  };
}

export function normalizeDaily(rawData) {
  const params = rawData?.properties?.parameter;
  if (!params?.PRECTOTCORR) throw new Error('Respuesta diaria NASA inválida.');
  const expectedUnits = {
    PRECTOTCORR: 'mm/day',
    T2M: 'C',
    RH2M: '%',
    GWETROOT: '1',
    WS2M: 'm/s',
    ALLSKY_SFC_SW_DWN: 'MJ/m^2/day',
  };
  for (const [parameter, expected] of Object.entries(expectedUnits)) {
    if (!params[parameter] || rawData.parameters?.[parameter]?.units !== expected) {
      throw new Error(
        `Variable o unidad diaria incompatible: ${parameter}; se espera ${expected}.`,
      );
    }
  }
  const fillValue = rawData.header?.fill_value ?? -999;
  return Object.keys(params.PRECTOTCORR)
    .sort()
    .map((dateKey) => {
      const row = {
        date: `${dateKey.slice(0, 4)}-${dateKey.slice(4, 6)}-${dateKey.slice(6, 8)}`,
      };
      for (const [variableKey, config] of Object.entries(variableConfig)) {
        const value = params[config.parameter]?.[dateKey];
        row[variableKey] = physicalMeasurement(variableKey, value, fillValue);
      }
      return row;
    });
}

export function baselineForMonth(yearSeries, monthIndex, startYear = 2001, endYear = 2020) {
  const values = [];
  for (let year = startYear; year <= endYear; year++) {
    const value = yearSeries[year]?.[monthIndex];
    if (validMeasurement(value)) values.push(value);
  }
  if (values.length < 10) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  return { mean, standardDeviation: Math.sqrt(variance), count: values.length };
}

export function annualSeries(yearSeries, aggregation) {
  return Object.entries(yearSeries).flatMap(([year, values]) => {
    if (values.some((value) => !validMeasurement(value))) return [];
    const total = values.reduce((sum, value) => sum + value, 0);
    return [{ year: Number(year), value: aggregation === 'sum' ? total : total / 12 }];
  });
}

export function linearTrend(points) {
  if (points.length < 3) return null;
  const meanYear = points.reduce((sum, row) => sum + row.year, 0) / points.length;
  const meanValue = points.reduce((sum, row) => sum + row.value, 0) / points.length;
  const covariance = points.reduce(
    (sum, row) => sum + (row.year - meanYear) * (row.value - meanValue),
    0,
  );
  const variance = points.reduce((sum, row) => sum + (row.year - meanYear) ** 2, 0);
  return variance ? (covariance / variance) * 10 : null;
}

export function recentAccumulation(rows, dayCount) {
  const validRows = rows.filter((row) => validMeasurement(row.rainfall));
  const latest = validRows.at(-1);
  if (!latest) return null;
  const endDate = new Date(latest.date + 'T00:00:00Z');
  const selected = [];
  for (let index = 0; index < dayCount; index++) {
    const date = new Date(endDate);
    date.setUTCDate(date.getUTCDate() - index);
    const key = date.toISOString().slice(0, 10);
    const row = rows.find((item) => item.date === key);
    if (!row || !validMeasurement(row.rainfall)) return null;
    selected.push(row.rainfall);
  }
  return { value: selected.reduce((sum, value) => sum + value, 0), endDate: latest.date };
}
