export type RouteType = 'closest' | 'scenic' | 'least_traffic' | 'ai_best';

export interface CityNode {
  id: string;
  name: string;
  state: string;
  x: number;
  y: number;
  image: string;
  description: string;
}

export interface HighwaySegment {
  from: string;
  to: string;
  distance: number;
  baseTime: number;
  scenicScore: number;
  trafficFactor: number;
  highway: string;
  image: string;
  description: string;
}

export interface RouteResult {
  type: RouteType;
  label: string;
  path: string[];
  cities: CityNode[];
  totalDistance: number;
  totalDuration: number;
  avgTraffic: number;
  scenicScore: number;
  segments: HighwaySegment[];
  highlights: string[];
  recommendation: string;
  image: string;
  color: string;
  badge: string;
}

export interface SavedTrip {
  id: string;
  origin: string;
  destination: string;
  selected_route_type: RouteType;
  route_summary: RouteResult;
  created_at: string;
}
