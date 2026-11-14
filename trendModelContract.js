export const trendModelSchemaVersion = '2.0';

export function validateTrendModelResult(result, input) {
  const text = (value) => typeof value === 'string' && value.trim();
  if (
    result?.schemaVersion !== trendModelSchemaVersion ||
    !text(result.modelVersion) ||
    !text(result.summary) ||
    result.observedThrough !== input.observedThrough ||
    result.variableKey !== input.variableKey ||
    result.unit !== input.unit ||
    !/^\d{4}-\d{2}-\d{2}T.+Z$/.test(result.generatedAt) ||
    !Number.isFinite(Date.parse(result.generatedAt)) ||
    !Array.isArray(result.limitations) ||
    !result.limitations.length ||
    !result.limitations.every(text) ||
    !text(result.uncertainty?.description) ||
    !['notProvided', 'reported'].includes(result.uncertainty?.status)
  ) {
    throw new Error('Respuesta incompatible con el contrato de series 2.0.');
  }
  if (result.forecast !== undefined) {
    if (!Array.isArray(result.forecast) || result.forecast.length > 100) {
      throw new Error('Serie de proyección incompatible.');
    }
    const years = new Set();
    const lastYear = input.series.at(-1).year;
    for (const point of result.forecast) {
      if (
        !Number.isInteger(point.year) ||
        point.year <= lastYear ||
        point.year > lastYear + 100 ||
        !Number.isFinite(point.value) ||
        years.has(point.year)
      ) {
        throw new Error('Año o valor proyectado inválido.');
      }
      const hasInterval = point.lower != null || point.upper != null;
      if (
        hasInterval &&
        (![point.lower, point.upper].every(Number.isFinite) ||
          point.lower > point.value ||
          point.upper < point.value)
      ) {
        throw new Error('Intervalo de incertidumbre incompatible.');
      }
      years.add(point.year);
    }
  }
  return result;
}
