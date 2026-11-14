import { daysInMonth, validMeasurement } from './climateMath.js';

export function completeAnnualPoints(yearSeries, aggregation, startYear, endYear) {
  return Object.entries(yearSeries)
    .flatMap(([yearKey, values]) => {
      const year = Number(yearKey);
      if (
        year < startYear ||
        year > endYear ||
        values.length !== 12 ||
        !values.every((value) => validMeasurement(value))
      )
        return [];
      const weights = values.map((_, month) => daysInMonth(year, month));
      const value =
        aggregation === 'sum'
          ? values.reduce((sum, item) => sum + item, 0)
          : values.reduce((sum, item, month) => sum + item * weights[month], 0) /
            weights.reduce((sum, days) => sum + days, 0);
      return [{ year, value }];
    })
    .sort((first, second) => first.year - second.year);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

// Two-sided standard-normal tail, Abramowitz-Stegun approximation (error < 1.5e-7).
function normalTail(z) {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  return Math.min(
    1,
    Math.exp(-x * x) *
      t *
      (0.254829592 +
        t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))),
  );
}

export function mannKendall(points) {
  if (points.length < 10) return null;
  if (
    points.some(
      (point, index) =>
        !Number.isFinite(point.value) ||
        !Number.isInteger(point.year) ||
        (index && point.year <= points[index - 1].year),
    )
  ) {
    throw new Error('Años únicos ordenados y valores finitos requeridos.');
  }
  let score = 0;
  const slopes = [];
  for (let first = 0; first < points.length; first++) {
    for (let second = first + 1; second < points.length; second++) {
      const difference = points[second].value - points[first].value;
      score += Math.sign(difference);
      slopes.push(difference / (points[second].year - points[first].year));
    }
  }
  const n = points.length;
  const counts = new Map();
  points.forEach(({ value }) => counts.set(value, (counts.get(value) ?? 0) + 1));
  const ties = [...counts.values()].reduce(
    (sum, count) => sum + count * (count - 1) * (2 * count + 5),
    0,
  );
  const variance = (n * (n - 1) * (2 * n + 5) - ties) / 18;
  const z =
    score === 0 || variance === 0 ? 0 : (score - Math.sign(score)) / Math.sqrt(variance);
  const slopePerYear = median(slopes);
  const intercept = median(points.map((point) => point.value - slopePerYear * point.year));
  const residuals = points.map((point) => point.value - slopePerYear * point.year - intercept);
  const mean = residuals.reduce((sum, item) => sum + item, 0) / n;
  const denominator = residuals.reduce((sum, item) => sum + (item - mean) ** 2, 0);
  const lagOne =
    denominator > 1e-20
      ? residuals
          .slice(1)
          .reduce((sum, item, index) => sum + (item - mean) * (residuals[index] - mean), 0) /
        denominator
      : 0;
  const gaps = points.some(
    (point, index) => index && point.year !== points[index - 1].year + 1,
  );
  return {
    n,
    score,
    variance,
    z,
    pValue: z === 0 ? 1 : normalTail(z),
    slopePerYear,
    slopePerDecade: slopePerYear * 10,
    intercept,
    lagOne,
    independenceWarning: gaps || Math.abs(lagOne) > 1.96 / Math.sqrt(n),
    fittedChange: slopePerYear * (points.at(-1).year - points[0].year),
  };
}

// Holm controls family-wise error without assuming independent variables.
export function holmAdjusted(pValues) {
  const ordered = pValues
    .map((p, index) => ({ p, index }))
    .filter(({ p }) => Number.isFinite(p) && p >= 0 && p <= 1)
    .sort((a, b) => a.p - b.p);
  const adjusted = pValues.map(() => null);
  let previous = 0;
  ordered.forEach(({ p, index }, rank) => {
    previous = Math.max(previous, Math.min(1, p * (ordered.length - rank)));
    adjusted[index] = previous;
  });
  return adjusted;
}
