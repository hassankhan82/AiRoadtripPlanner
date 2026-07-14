import { Clock, MapPin, Gauge, Camera, Sparkles, Check } from 'lucide-react';
import type { RouteResult } from '../lib/types';
import { formatDuration } from '../lib/routeEngine';

interface RouteCardProps {
  route: RouteResult;
  isSelected: boolean;
  onSelect: () => void;
}

export function RouteCard({ route, isSelected, onSelect }: RouteCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`group relative w-full overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
        isSelected
          ? 'border-transparent shadow-xl ring-2'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg'
      }`}
      style={isSelected ? { boxShadow: `0 10px 30px -5px ${route.color}40` } : undefined}
    >
      {/* Image header */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={route.image}
          alt={route.label}
          className={`h-full w-full object-cover transition-transform duration-500 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md"
            style={{ backgroundColor: route.color }}
          >
            {route.badge}
          </span>
        </div>
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="text-lg font-bold text-white drop-shadow">{route.label}</h3>
        </div>
        {isSelected && (
          <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md">
            <Check className="h-4 w-4" style={{ color: route.color }} />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className={`p-3.5 ${isSelected ? 'bg-white' : 'bg-white'}`}>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
              <MapPin className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Distance</div>
              <div className="text-sm font-bold text-slate-800">{route.totalDistance} mi</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Duration</div>
              <div className="text-sm font-bold text-slate-800">{formatDuration(route.totalDuration)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
              <Gauge className="h-3.5 w-3.5 text-rose-500" />
            </div>
            <div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Traffic</div>
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <div
                      key={i}
                      className="h-1.5 w-1 rounded-full"
                      style={{ backgroundColor: i <= Math.round(route.avgTraffic) ? '#f43f5e' : '#e2e8f0' }}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-600">{route.avgTraffic.toFixed(1)}x</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
              <Camera className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Scenery</div>
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <div
                      key={i}
                      className="h-1.5 w-1 rounded-full"
                      style={{ backgroundColor: i <= Math.round(route.scenicScore) ? '#10b981' : '#e2e8f0' }}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-600">{route.scenicScore.toFixed(1)}/5</span>
              </div>
            </div>
          </div>
        </div>

        {route.type === 'ai_best' && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-2">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-600" />
            <p className="text-xs font-medium text-violet-700">AI-optimized for the best overall experience</p>
          </div>
        )}
      </div>
    </button>
  );
}
