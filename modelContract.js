export const modelSchemaVersion = '1.1';

export function validateModelResponse(result, input) {
  const text = (value) => typeof value === 'string' && Boolean(value.trim());
  if (
    result?.schemaVersion !== modelSchemaVersion ||
    !text(result.modelVersion) ||
    !text(result.summary) ||
    !Array.isArray(result.limitations) ||
    !result.limitations.length ||
    !result.limitations.every(text) ||
    result.observedThrough !== input.observedThrough ||
    !/^\d{4}-\d{2}-\d{2}T.+Z$/.test(result.generatedAt) ||
    !Number.isFinite(Date.parse(result.generatedAt)) ||
    !['notProvided', 'reported'].includes(result.uncertainty?.status) ||
    !text(result.uncertainty?.description)
  ) {
    throw new Error('Respuesta del modelo incompatible con el contrato 1.1.');
  }
  return result;
}
