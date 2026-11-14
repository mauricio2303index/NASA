export function decodeMeasurements(rawValues, { scale, offset, noData }, kind) {
  if (![scale, offset].every(Number.isFinite) || scale <= 0) {
    throw new Error('Escala y offset explícitos requeridos.');
  }
  return Array.from(rawValues, (raw) => {
    if (!Number.isFinite(raw) || raw === noData) return null;
    const value = raw * scale + offset;
    return kind === 'imerg' && value < 0 ? null : value;
  });
}

export function accumulatePrecipitation(grids) {
  if (!grids.length) throw new Error('No hay intervalos.');
  const ordered = [...grids].sort((first, second) => first.start.localeCompare(second.start));
  const reference = ordered[0];
  for (const [index, grid] of ordered.entries()) {
    if (
      grid.productVersion !== reference.productVersion ||
      grid.variable !== reference.variable
    ) {
      throw new Error('No mezcles versiones ni variables en un acumulado.');
    }
    if (!['mm', 'mm/hr'].includes(grid.unit)) throw new Error('Unidad IMERG no admitida.');
    if (
      !/^\d{4}-\d{2}-\d{2}T/.test(grid.start) ||
      !grid.start.endsWith('Z') ||
      !grid.end?.endsWith('Z') ||
      !(Date.parse(grid.end) > Date.parse(grid.start))
    ) {
      throw new Error('Intervalo UTC inválido.');
    }
    if (index && ordered[index - 1].end !== grid.start) {
      throw new Error('Intervalos con huecos o solapamientos.');
    }
    if (grid.values.length !== reference.values.length || grid.gridKey !== reference.gridKey) {
      throw new Error('Las grillas no están alineadas; se requiere procesamiento previo.');
    }
  }
  return reference.values.map((_, index) => {
    if (ordered.some((grid) => grid.values[index] === null)) return null;
    return ordered.reduce(
      (total, grid) =>
        total +
        grid.values[index] *
          (grid.unit === 'mm/hr'
            ? (Date.parse(grid.end) - Date.parse(grid.start)) / 3600000
            : 1),
      0,
    );
  });
}

export function terrainSlope(values, width, height, cellSizeMeters) {
  if (
    values.length !== width * height ||
    width < 3 ||
    height < 3 ||
    cellSizeMeters.some((size) => !Number.isFinite(size) || size <= 0)
  ) {
    throw new Error('Grilla de terreno inválida.');
  }
  const slopes = Array(values.length).fill(null);
  for (let row = 1; row < height - 1; row++) {
    for (let column = 1; column < width - 1; column++) {
      const index = row * width + column;
      const neighborhood = [
        -width - 1,
        -width,
        -width + 1,
        -1,
        0,
        1,
        width - 1,
        width,
        width + 1,
      ].map((offset) => values[index + offset]);
      if (neighborhood.some((value) => value === null)) continue;
      const [a, b, c, d, , f, g, h, i] = neighborhood;
      const dx = (c + 2 * f + i - a - 2 * d - g) / (8 * cellSizeMeters[0]);
      const dy = (g + 2 * h + i - a - 2 * b - c) / (8 * cellSizeMeters[1]);
      slopes[index] = (Math.atan(Math.hypot(dx, dy)) * 180) / Math.PI;
    }
  }
  return slopes;
}
