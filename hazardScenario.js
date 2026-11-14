import booleanIntersects from '@turf/boolean-intersects';
import { validateGeoJson } from './geoJsonValidation.js';
import { compareRoutes } from './routingEngine.js';

export function validateHazard(hazard) {
  if (
    hazard?.schemaVersion !== '1.0' ||
    hazard.crs !== 'EPSG:4326' ||
    !['hypothetical', 'externalUnvalidated'].includes(hazard.status) ||
    typeof hazard.source !== 'string' ||
    !hazard.source.trim() ||
    !Number.isFinite(Date.parse(hazard.observedAt)) ||
    !Number.isFinite(hazard.resolutionMeters) ||
    hazard.resolutionMeters <= 0
  ) {
    throw new Error('Amenaza sin contrato, procedencia, fecha o resolución válida.');
  }
  validateGeoJson(hazard.geometry);
  for (const feature of hazard.geometry.features) {
    const { type, coordinates } = feature.geometry;
    if (!['Polygon', 'MultiPolygon'].includes(type)) throw new Error('Se requieren polígonos.');
    const polygons = type === 'Polygon' ? [coordinates] : coordinates;
    for (const polygon of polygons) {
      for (const ring of polygon) {
        if (
          ring.length < 4 ||
          ring[0].length !== 2 ||
          ring.some((position) => position.length !== 2) ||
          ring[0][0] !== ring.at(-1)[0] ||
          ring[0][1] !== ring.at(-1)[1]
        ) {
          throw new Error('Anillos WGS84 cerrados con al menos cuatro posiciones requeridos.');
        }
      }
    }
  }
  return hazard;
}

function asFeature(type, coordinates) {
  return { type: 'Feature', properties: {}, geometry: { type, coordinates } };
}

export function exposureForHazard(infrastructure, hazard) {
  validateHazard(hazard);
  const intersects = (feature) =>
    hazard.geometry.features.some((polygon) => booleanIntersects(feature, polygon));
  const roadIds = infrastructure.roads
    .filter((road) =>
      intersects(
        asFeature(
          'LineString',
          road.coords.map(([latitude, longitude]) => [longitude, latitude]),
        ),
      ),
    )
    .map((road) => road.id);
  const exposedIds = new Set(roadIds);
  return {
    roadIds,
    bridgeSegmentCount: infrastructure.roads.filter(
      (road) => exposedIds.has(road.id) && road.bridge,
    ).length,
    hospitals: infrastructure.hospitals.filter((hospital) =>
      intersects(asFeature('Point', [hospital.coords[1], hospital.coords[0]])),
    ),
  };
}

export function simulateHazard(graph, infrastructure, hazard, origin, destination, policy) {
  if (policy !== 'hypotheticalCloseIntersectingRoads') {
    throw new Error('Selecciona explícitamente la regla hipotética de cierres.');
  }
  const exposure = exposureForHazard(infrastructure, hazard);
  return {
    schemaVersion: '1.0',
    city: 'Arequipa',
    hazard,
    policy,
    exposure,
    infrastructureSource: infrastructure.source,
    infrastructureRetrievedAt: infrastructure.retrievedAt,
    routes: compareRoutes(graph, origin, destination, { roadIds: exposure.roadIds }),
    status: 'hypothetical',
    limitations: [
      'Exposición no equivale a daño.',
      'La regla cierra registros OSM completos.',
      'Sin tráfico, restricciones de giro ni validación de emergencia.',
      'No certifica topología ni validez científica de la geometría externa.',
    ],
  };
}
