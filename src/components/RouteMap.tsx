import { useMemo } from 'react';
import { CITIES, HIGHWAYS } from '../lib/cityData';
import { cityMap } from '../lib/cityData';
import type { RouteResult } from '../lib/types';

interface RouteMapProps {
  routes: RouteResult[];
  selectedRoute: RouteResult | null;
  onSelectRoute: (route: RouteResult) => void;
  originId: string | null;
  destId: string | null;
}

const MAP_W = 1000;
const MAP_H = 520;

// Simplified continent outlines as polygon points (equirectangular-ish)
const CONTINENTS: { name: string; points: string }[] = [
  // North America
  { name: 'NA', points: '120,110 310,110 310,180 280,180 280,210 260,260 220,275 190,260 160,230 140,200 120,170' },
  // South America
  { name: 'SA', points: '285,300 360,300 370,340 360,400 335,440 310,430 295,380 285,340' },
  // Europe
  { name: 'EU', points: '470,120 590,120 590,180 570,210 500,210 470,190 465,150' },
  // Africa
  { name: 'AF', points: '470,210 590,210 600,280 575,340 545,400 515,395 500,350 480,290 470,240' },
  // Asia
  { name: 'AS', points: '590,120 880,120 880,200 860,250 820,290 780,300 720,280 660,250 620,220 590,180' },
  // Oceania / Australia
  { name: 'OC', points: '830,310 930,310 930,380 880,390 840,380 825,340' },
  // New Zealand
  { name: 'NZ', points: '950,350 975,350 975,375 950,375' },
];

export function RouteMap({ routes, selectedRoute, onSelectRoute, originId, destId }: RouteMapProps) {
  const activeRoute = selectedRoute || routes[0] || null;

  const routePaths = useMemo(() => {
    return routes.map(route => {
      const pts = route.path.map(id => cityMap[id]).filter(Boolean);
      if (pts.length < 2) return null;
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Curve offset proportional to distance, capped
        const offset = Math.min(dist * 0.15, 20);
        const mx = (prev.x + curr.x) / 2;
        const my = (prev.y + curr.y) / 2 - offset;
        d += ` Q ${mx} ${my} ${curr.x} ${curr.y}`;
      }
      return { route, d };
    }).filter(Boolean);
  }, [routes]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg shadow-slate-200/40">
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="h-full w-full" style={{ maxHeight: '520px' }}>
        <defs>
          <radialGradient id="oceanGrad" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#eff6ff" />
            <stop offset="100%" stopColor="#dbeafe" />
          </radialGradient>
          <linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ocean background */}
        <rect width={MAP_W} height={MAP_H} fill="url(#oceanGrad)" />

        {/* Continent shapes */}
        {CONTINENTS.map(c => (
          <polygon
            key={c.name}
            points={c.points}
            fill="url(#landGrad)"
            stroke="#94a3b8"
            strokeWidth="0.5"
            strokeOpacity="0.5"
          />
        ))}

        {/* All highways as faint background */}
        {HIGHWAYS.map((seg, i) => {
          const from = cityMap[seg.from];
          const to = cityMap[seg.to];
          if (!from || !to) return null;
          return (
            <line
              key={i}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke="#94a3b8" strokeWidth="1" strokeOpacity="0.25"
              strokeDasharray="3 3"
            />
          );
        })}

        {/* Route paths */}
        {routePaths.map((item) => {
          if (!item) return null;
          const { route, d } = item;
          const isActive = activeRoute?.type === route.type;
          return (
            <g key={route.type}>
              <path
                d={d!}
                fill="none"
                stroke={route.color}
                strokeWidth={isActive ? 4 : 2.5}
                strokeOpacity={isActive ? 1 : 0.3}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={isActive ? 'url(#glow)' : undefined}
                className="cursor-pointer transition-all duration-300"
                onClick={() => onSelectRoute(route)}
              />
              {isActive && (
                <path
                  d={d!}
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                  strokeDasharray="5 7"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              )}
            </g>
          );
        })}

        {/* City nodes */}
        {CITIES.map(city => {
          const isOrigin = city.id === originId;
          const isDest = city.id === destId;
          const isOnRoute = activeRoute?.path.includes(city.id);
          const isHighlighted = isOrigin || isDest || isOnRoute;

          return (
            <g key={city.id}>
              {(isOrigin || isDest) && (
                <circle cx={city.x} cy={city.y} r="12" fill={isOrigin ? '#2563eb' : '#e11d48'} fillOpacity="0.15">
                  <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={city.x} cy={city.y}
                r={isOrigin || isDest ? 6 : isOnRoute ? 4.5 : 3}
                fill={isOrigin ? '#2563eb' : isDest ? '#e11d48' : isOnRoute ? activeRoute?.color || '#64748b' : '#94a3b8'}
                stroke="white"
                strokeWidth="1.5"
                className="transition-all duration-300"
              />
              {isHighlighted && (
                <text
                  x={city.x} y={city.y - 10}
                  textAnchor="middle"
                  className="fill-slate-700 text-[10px] font-bold"
                  style={{ pointerEvents: 'none' }}
                >
                  {city.name}
                </text>
              )}
            </g>
          );
        })}

        {/* Origin/dest labels */}
        {originId && cityMap[originId] && (
          <text x={cityMap[originId].x} y={cityMap[originId].y + 20} textAnchor="middle" className="fill-blue-600 text-[8px] font-bold uppercase tracking-wide" style={{ pointerEvents: 'none' }}>
            Start
          </text>
        )}
        {destId && cityMap[destId] && (
          <text x={cityMap[destId].x} y={cityMap[destId].y + 20} textAnchor="middle" className="fill-rose-600 text-[8px] font-bold uppercase tracking-wide" style={{ pointerEvents: 'none' }}>
            Destination
          </text>
        )}
      </svg>

      {/* Route legend */}
      {routes.length > 0 && (
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 rounded-xl bg-white/90 p-2 shadow-md backdrop-blur-sm">
          {routes.map(r => (
            <button
              key={r.type}
              onClick={() => onSelectRoute(r)}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
                activeRoute?.type === r.type ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
