const earthRadius = 6371000;
const radians = (degrees) => (degrees * Math.PI) / 180;

export function distanceMeters(firstPoint, secondPoint) {
  const latitudeDifference = radians(secondPoint[0] - firstPoint[0]);
  const longitudeDifference = radians(secondPoint[1] - firstPoint[1]);
  const term =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(radians(firstPoint[0])) *
      Math.cos(radians(secondPoint[0])) *
      Math.sin(longitudeDifference / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(term), Math.sqrt(1 - term));
}

export function segmentDistance(center, firstPoint, secondPoint) {
  const longitudeScale = (Math.cos(radians(center[0])) * Math.PI * earthRadius) / 180;
  const latitudeScale = (Math.PI * earthRadius) / 180;
  const firstX = (firstPoint[1] - center[1]) * longitudeScale;
  const firstY = (firstPoint[0] - center[0]) * latitudeScale;
  const secondX = (secondPoint[1] - center[1]) * longitudeScale;
  const secondY = (secondPoint[0] - center[0]) * latitudeScale;
  const deltaX = secondX - firstX;
  const deltaY = secondY - firstY;
  const lengthSquared = deltaX ** 2 + deltaY ** 2;
  const ratio = lengthSquared
    ? Math.max(0, Math.min(1, -(firstX * deltaX + firstY * deltaY) / lengthSquared))
    : 0;
  return Math.hypot(firstX + ratio * deltaX, firstY + ratio * deltaY);
}

export function lineIntersectsCircle(coords, center, radiusMeters) {
  return coords
    .slice(1)
    .some((point, index) => segmentDistance(center, coords[index], point) <= radiusMeters);
}

export function infrastructureExposure(infrastructure, center, radiusMeters) {
  const affectedRoads = infrastructure.roads.filter((road) =>
    lineIntersectsCircle(road.coords, center, radiusMeters),
  );
  return {
    roadCount: affectedRoads.length,
    bridgeCount: affectedRoads.filter((road) => road.bridge).length,
    hospitals: infrastructure.hospitals.filter(
      (hospital) => distanceMeters(hospital.coords, center) <= radiusMeters,
    ),
  };
}
