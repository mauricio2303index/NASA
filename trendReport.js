import { variableConfig } from './appConfig.js';
import { completeAnnualPoints, mannKendall, holmAdjusted } from './trendMath.js';

export function createTrendReport(monthly, startYear, endYear) {
  if (!Number.isInteger(startYear) || !Number.isInteger(endYear) || startYear > endYear) {
    throw new Error('Selecciona un periodo válido.');
  }
  const reports = Object.entries(variableConfig).map(([variableKey, config]) => {
    const points = completeAnnualPoints(
      monthly.variables[variableKey] ?? {},
      config.aggregation,
      startYear,
      endYear,
    );
    const statistics = mannKendall(points);
    return {
      variableKey,
      label: config.label,
      unit: variableKey === 'rainfall' ? 'mm/año' : config.unit,
      points,
      statistics,
      excludedYears: endYear - startYear + 1 - points.length,
    };
  });
  const adjusted = holmAdjusted(reports.map((report) => report.statistics?.pValue));
  return reports.map((report, index) => ({
    ...report,
    adjustedPValue: adjusted[index],
    assessment: !report.statistics
      ? 'insufficient'
      : report.statistics.independenceWarning
        ? 'reviewDependence'
        : adjusted[index] < 0.05
          ? 'evidence'
          : 'notDetected',
  }));
}
