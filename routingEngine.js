import { distanceMeters, segmentDistance } from './geoMath.js';
import { MinHeap } from './minHeap.js';

export function buildRoadGraph(roads) {
  const nodes = new Map();
  const edges = new Map();
  for (const road of roads) {
    road.nodeIds.forEach((nodeId, index) => {
      nodes.set(nodeId, road.coords[index]);
      if (!edges.has(nodeId)) edges.set(nodeId, []);
    });
    for (let index = 1; index < road.nodeIds.length; index++) {
      const firstId = road.nodeIds[index - 1];
      const secondId = road.nodeIds[index];
      const length = distanceMeters(nodes.get(firstId), nodes.get(secondId));
      const edge = { length, roadId: road.id, bridge: road.bridge };
      if (road.oneway !== '-1') edges.get(firstId).push({ ...edge, to: secondId });
      if (!['yes', '1', 'true'].includes(road.oneway)) {
        edges.get(secondId).push({ ...edge, to: firstId });
      }
    }
  }
  return { nodes, edges };
}

export function nearestNode(graph, coordinates) {
  let nearestId = null;
  let minimumDistance = Infinity;
  for (const [nodeId, point] of graph.nodes) {
    const distance = distanceMeters(point, coordinates);
    if (distance < minimumDistance) {
      nearestId = nodeId;
      minimumDistance = distance;
    }
  }
  return { nodeId: nearestId, distance: minimumDistance };
}

export function shortestPath(graph, startId, endId, closure = null) {
  if (!graph.nodes.has(startId) || !graph.nodes.has(endId)) return null;
  const blockedRoadIds = new Set(closure?.roadIds ?? []);
  const frontier = new MinHeap();
  const costs = new Map([[startId, 0]]);
  const previous = new Map();
  frontier.push({ nodeId: startId, cost: 0 });
  while (frontier.size) {
    const current = frontier.pop();
    if (current.cost > costs.get(current.nodeId)) continue;
    if (current.nodeId === endId) break;
    for (const edge of graph.edges.get(current.nodeId) ?? []) {
      if (blockedRoadIds.has(edge.roadId)) continue;
      if (
        closure?.center &&
        segmentDistance(
          closure.center,
          graph.nodes.get(current.nodeId),
          graph.nodes.get(edge.to),
        ) <= closure.radiusMeters
      )
        continue;
      const nextCost = current.cost + edge.length;
      if (nextCost >= (costs.get(edge.to) ?? Infinity)) continue;
      costs.set(edge.to, nextCost);
      previous.set(edge.to, { nodeId: current.nodeId, edge });
      frontier.push({ nodeId: edge.to, cost: nextCost });
    }
  }
  if (!costs.has(endId)) return null;
  const coords = [];
  const pathEdges = [];
  let cursor = endId;
  while (cursor !== startId) {
    coords.unshift(graph.nodes.get(cursor));
    const step = previous.get(cursor);
    if (!step) return null;
    pathEdges.unshift({ ...step.edge, start: graph.nodes.get(step.nodeId) });
    cursor = step.nodeId;
  }
  coords.unshift(graph.nodes.get(startId));
  return { distanceMeters: costs.get(endId), coords, edges: pathEdges };
}

export function compareRoutes(graph, startCoordinates, endCoordinates, closure) {
  const start = nearestNode(graph, startCoordinates);
  const end = nearestNode(graph, endCoordinates);
  if (start.distance > 1000 || end.distance > 1000) {
    throw new Error('El punto está a más de 1 km de la red disponible.');
  }
  const baselineRoute = shortestPath(graph, start.nodeId, end.nodeId);
  const alternativeRoute = closure
    ? shortestPath(graph, start.nodeId, end.nodeId, closure)
    : baselineRoute;
  return {
    baselineRoute,
    alternativeRoute,
    startSnapMeters: start.distance,
    endSnapMeters: end.distance,
    detourMeters:
      baselineRoute && alternativeRoute
        ? alternativeRoute.distanceMeters - baselineRoute.distanceMeters
        : null,
  };
}
