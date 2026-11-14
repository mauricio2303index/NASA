export function validateGeoJson(payload) {
  if (!payload || payload.type !== 'FeatureCollection' || !Array.isArray(payload.features)) {
    throw new Error('Se necesita un GeoJSON de tipo FeatureCollection.');
  }
  if (!payload.features.length || payload.features.length > 1000) {
    throw new Error('Incluye entre 1 y 1000 elementos.');
  }
  let coordinateCount = 0;
  function position(coords) {
    if (
      !Array.isArray(coords) ||
      coords.length < 2 ||
      coords.length > 3 ||
      !coords.every(Number.isFinite) ||
      Math.abs(coords[0]) > 180 ||
      Math.abs(coords[1]) > 90
    ) {
      throw new Error('Posición inválida: usa [longitud, latitud] WGS84.');
    }
    if (++coordinateCount > 200000) throw new Error('La capa supera las 200000 posiciones.');
  }
  function list(coords, minimum, validator) {
    if (!Array.isArray(coords) || coords.length < minimum) {
      throw new Error(`La geometría necesita al menos ${minimum} posiciones o elementos.`);
    }
    coords.forEach(validator);
  }
  function ring(coords) {
    list(coords, 4, position);
    if (
      coords[0].length !== coords.at(-1).length ||
      coords[0].some((value, index) => value !== coords.at(-1)[index])
    ) {
      throw new Error('El anillo del polígono debe estar cerrado.');
    }
    if (new Set(coords.map((point) => point.slice(0, 2).join(','))).size < 3) {
      throw new Error('El anillo necesita tres vértices distintos.');
    }
  }
  const line = (coords) => list(coords, 2, position);
  const polygon = (coords) => list(coords, 1, ring);
  const validators = {
    Point: position,
    MultiPoint: (coords) => list(coords, 1, position),
    LineString: line,
    MultiLineString: (coords) => list(coords, 1, line),
    Polygon: polygon,
    MultiPolygon: (coords) => list(coords, 1, polygon),
  };
  for (const feature of payload.features) {
    const type = feature?.geometry?.type;
    const validate = Object.hasOwn(validators, type) ? validators[type] : null;
    if (feature?.type !== 'Feature' || !validate) throw new Error('Geometría no soportada.');
    validate(feature.geometry.coordinates);
  }
  if (coordinateCount > 200000) throw new Error('La capa supera las 200000 posiciones.');
  return payload;
}
