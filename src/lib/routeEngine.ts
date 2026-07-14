import type { CityNode, HighwaySegment, RouteResult, RouteType } from './types';
import { HIGHWAYS, cityMap } from './cityData';

interface Edge {
  to: string;
  segment: HighwaySegment;
}

const adjacency: Record<string, Edge[]> = {};
for (const seg of HIGHWAYS) {
  if (!adjacency[seg.from]) adjacency[seg.from] = [];
  if (!adjacency[seg.to]) adjacency[seg.to] = [];
  adjacency[seg.from].push({ to: seg.to, segment: seg });
  adjacency[seg.to].push({ to: seg.from, segment: seg });
}

interface DijkstraResult {
  path: string[];
  segments: HighwaySegment[];
  distance: number;
  duration: number;
  trafficSum: number;
  scenicSum: number;
}

function dijkstra(start: string, end: string, weightFn: (seg: HighwaySegment) => number): DijkstraResult | null {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const prevSeg: Record<string, HighwaySegment | null> = {};
  const visited = new Set<string>();
  const queue: { id: string; d: number }[] = [];

  for (const city of Object.keys(adjacency)) {
    dist[city] = Infinity;
    prev[city] = null;
    prevSeg[city] = null;
  }
  dist[start] = 0;
  queue.push({ id: start, d: 0 });

  while (queue.length > 0) {
    queue.sort((a, b) => a.d - b.d);
    const { id: u } = queue.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === end) break;

    for (const edge of adjacency[u] || []) {
      if (visited.has(edge.to)) continue;
      const w = weightFn(edge.segment);
      const nd = dist[u] + w;
      if (nd < dist[edge.to]) {
        dist[edge.to] = nd;
        prev[edge.to] = u;
        prevSeg[edge.to] = edge.segment;
        queue.push({ id: edge.to, d: nd });
      }
    }
  }

  if (dist[end] === Infinity) return null;

  const path: string[] = [];
  const segments: HighwaySegment[] = [];
  let cur: string | null = end;
  while (cur) {
    path.unshift(cur);
    const seg = prevSeg[cur];
    if (seg) segments.unshift(seg);
    cur = prev[cur]!;
  }

  let distance = 0;
  let duration = 0;
  let trafficSum = 0;
  let scenicSum = 0;
  for (const seg of segments) {
    distance += seg.distance;
    duration += seg.baseTime * seg.trafficFactor;
    trafficSum += seg.trafficFactor;
    scenicSum += seg.scenicScore;
  }

  return { path, segments, distance, duration, trafficSum, scenicSum };
}

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function buildHighlights(segments: HighwaySegment[], cities: CityNode[]): string[] {
  const highlights: string[] = [];
  for (const city of cities) {
    if (city.id !== cities[0]?.id && city.id !== cities[cities.length - 1]?.id) {
      highlights.push(`Stop in ${city.name}, ${city.state} — ${city.description}`);
    }
  }
  const topScenic = [...segments].sort((a, b) => b.scenicScore - a.scenicScore).slice(0, 2);
  for (const seg of topScenic) {
    if (seg.scenicScore >= 4) highlights.push(`${seg.highway}: ${seg.description}`);
  }
  return highlights.slice(0, 5);
}

function buildRoute(
  type: RouteType,
  result: DijkstraResult,
  label: string,
  color: string,
  badge: string,
  recommendation: string
): RouteResult {
  const cities = result.path.map(id => cityMap[id]).filter(Boolean);
  const avgTraffic = result.trafficSum / result.segments.length;
  const scenicScore = result.scenicSum / result.segments.length;
  const image = result.segments.sort((a, b) => b.scenicScore - a.scenicScore)[0]?.image || cities[0]?.image;

  return {
    type,
    label,
    path: result.path,
    cities,
    totalDistance: result.distance,
    totalDuration: result.duration,
    avgTraffic,
    scenicScore,
    segments: result.segments,
    highlights: buildHighlights(result.segments, cities),
    recommendation,
    image,
    color,
    badge,
  };
}

export function computeRoutes(originId: string, destId: string): RouteResult[] {
  const routes: RouteResult[] = [];

  const closest = dijkstra(originId, destId, s => s.distance);
  if (closest) {
    routes.push(buildRoute(
      'closest', closest, 'Shortest Path', '#2563eb', 'Fastest Distance',
      `At ${closest.distance} miles, this is the most direct route to your destination. Expect about ${formatDuration(closest.duration)} of driving.`
    ));
  }

  const scenic = dijkstra(originId, destId, s => s.distance * (1 + (5 - s.scenicScore) * 0.15));
  if (scenic) {
    const isDifferent = JSON.stringify(scenic.path) !== JSON.stringify(closest?.path);
    routes.push(buildRoute(
      'scenic', scenic, isDifferent ? 'Scenic Route' : 'Scenic Variant', '#059669', 'Most Scenic',
      `This route prioritizes beautiful landscapes with a scenic score of ${(scenic.scenicSum / scenic.segments.length).toFixed(1)}/5. Enjoy ${formatDuration(scenic.duration)} of breathtaking views.`
    ));
  }

  const traffic = dijkstra(originId, destId, s => s.baseTime * s.trafficFactor);
  if (traffic) {
    const isDifferent = JSON.stringify(traffic.path) !== JSON.stringify(closest?.path) && JSON.stringify(traffic.path) !== JSON.stringify(scenic?.path);
    routes.push(buildRoute(
      'least_traffic', traffic, isDifferent ? 'Low Traffic Route' : 'Low Traffic Variant', '#d97706', 'Least Traffic',
      `Optimized for current traffic conditions with an average traffic factor of ${(traffic.trafficSum / traffic.segments.length).toFixed(2)}. Estimated drive time: ${formatDuration(traffic.duration)}.`
    ));
  }

  const aiWeight = (s: HighwaySegment) =>
    s.baseTime * s.trafficFactor * 0.5 + s.distance * 0.3 + (5 - s.scenicScore) * 20;
  const aiBest = dijkstra(originId, destId, aiWeight);
  if (aiBest) {
    const existingPaths = routes.map(r => JSON.stringify(r.path));
    const isUnique = !existingPaths.includes(JSON.stringify(aiBest.path));
    if (isUnique) {
      routes.push(buildRoute(
        'ai_best', aiBest, 'AI Optimal Route', '#7c3aed', 'AI Recommended',
        `Our AI balanced distance, traffic, and scenery to find the optimal route. ${aiBest.distance} miles in ${formatDuration(aiBest.duration)} with a scenic score of ${(aiBest.scenicSum / aiBest.segments.length).toFixed(1)}/5.`
      ));
    } else {
      const best = [...routes].sort((a, b) =>
        (b.scenicScore - a.scenicScore) + (a.totalDuration - b.totalDuration) / 100
      )[0];
      routes.push({
        ...best,
        type: 'ai_best',
        label: 'AI Optimal Route',
        color: '#7c3aed',
        badge: 'AI Recommended',
        recommendation: `Our AI analyzed all factors and determined this route offers the best overall balance of efficiency, scenery, and traffic. ${best.totalDistance} miles in ${formatDuration(best.totalDuration)}.`,
      });
    }
  }

  return routes;
}

export { formatDuration };
