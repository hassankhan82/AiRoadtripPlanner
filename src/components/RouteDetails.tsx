import { Clock, MapPin, Camera, Navigation, Sparkles, Save, Check } from 'lucide-react';
import type { RouteResult } from '../lib/types';
import { formatDuration } from '../lib/routeEngine';

interface RouteDetailsProps {
  route: RouteResult;
  onSave: () => void;
  saved: boolean;
}

export function RouteDetails({ route, onSave, saved }: RouteDetailsProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
      {/* Hero image */}
      <div className="relative h-48 overflow-hidden">
        <img src={route.image} alt={route.label} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5">
          <div className="mb-2 flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md"
              style={{ backgroundColor: route.color }}
            >
              {route.badge}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">{route.label}</h2>
          <p className="mt-1 text-sm text-white/80">
            {route.cities[0]?.name} → {route.cities[route.cities.length - 1]?.name}
          </p>
        </div>
      </div>

      <div className="p-5">
        {/* AI Recommendation */}
        <div className="mb-4 rounded-xl bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            {route.type === 'ai_best' ? (
              <Sparkles className="h-4 w-4 text-violet-600" />
            ) : (
              <Navigation className="h-4 w-4" style={{ color: route.color }} />
            )}
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {route.type === 'ai_best' ? 'AI Analysis' : 'Route Summary'}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-700">{route.recommendation}</p>
        </div>

        {/* Key stats */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-100 bg-white p-3 text-center">
            <MapPin className="mx-auto mb-1 h-4 w-4 text-blue-500" />
            <div className="text-lg font-bold text-slate-800">{route.totalDistance}</div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Miles</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-3 text-center">
            <Clock className="mx-auto mb-1 h-4 w-4 text-amber-500" />
            <div className="text-lg font-bold text-slate-800">{formatDuration(route.totalDuration)}</div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Drive Time</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-3 text-center">
            <Camera className="mx-auto mb-1 h-4 w-4 text-emerald-500" />
            <div className="text-lg font-bold text-slate-800">{route.scenicScore.toFixed(1)}</div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Scenic /5</div>
          </div>
        </div>

        {/* Highlights */}
        {route.highlights.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Route Highlights</h4>
            <div className="space-y-2">
              {route.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: route.color }} />
                  <p className="text-sm text-slate-600">{h}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Segment gallery */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Along the Way</h4>
          <div className="grid grid-cols-2 gap-2">
            {route.segments.map((seg, i) => (
              <div key={i} className="group relative overflow-hidden rounded-lg">
                <img src={seg.image} alt={seg.highway} className="h-24 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-1.5 left-2 right-2">
                  <div className="text-[10px] font-bold text-white">{seg.highway}</div>
                  <div className="text-[9px] text-white/70">{seg.distance} mi</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* City stops */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Cities on Route</h4>
          <div className="flex flex-wrap gap-2">
            {route.cities.map((city, i) => (
              <div key={city.id} className="flex items-center gap-1.5">
                {i > 0 && <div className="h-px w-3 bg-slate-300" />}
                <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1">
                  <img src={city.image} alt="" className="h-5 w-5 rounded object-cover" />
                  <span className="text-xs font-semibold text-slate-700">{city.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={onSave}
          disabled={saved}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
            saved
              ? 'cursor-default bg-emerald-50 text-emerald-600'
              : 'bg-slate-800 text-white hover:bg-slate-900 shadow-lg shadow-slate-300'
          }`}
        >
          {saved ? <><Check className="h-4 w-4" /> Trip Saved</> : <><Save className="h-4 w-4" /> Save This Trip</>}
        </button>
      </div>
    </div>
  );
}
