import { useEffect, useState } from 'react';
import { History, Trash2, MapPin, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SavedTrip } from '../lib/types';
import { formatDuration } from '../lib/routeEngine';

interface TripHistoryProps {
  refreshKey: number;
  onReplay: (trip: SavedTrip) => void;
}

export function TripHistory({ refreshKey, onReplay }: TripHistoryProps) {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (active) {
        setTrips((data || []) as SavedTrip[]);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    await supabase.from('trips').delete().eq('id', id);
    setTrips(trips.filter(t => t.id !== id));
  };

  const typeColors: Record<string, string> = {
    closest: '#2563eb',
    scenic: '#059669',
    least_traffic: '#d97706',
    ai_best: '#7c3aed',
  };

  const typeLabels: Record<string, string> = {
    closest: 'Shortest',
    scenic: 'Scenic',
    least_traffic: 'Low Traffic',
    ai_best: 'AI Best',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <History className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-bold text-slate-800">Saved Trips</h3>
        <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{trips.length}</span>
      </div>

      <div className="max-h-[400px] overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-400" />
          </div>
        ) : trips.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
              <MapPin className="h-5 w-5 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-400">No saved trips yet</p>
            <p className="text-xs text-slate-300">Plan a trip and save it to see it here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {trips.map(trip => (
              <div
                key={trip.id}
                className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2.5 transition-all hover:border-slate-200 hover:shadow-sm"
              >
                <img
                  src={trip.route_summary.image}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <span className="truncate">{trip.origin}</span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-slate-400" />
                    <span className="truncate">{trip.destination}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
                      style={{ backgroundColor: typeColors[trip.selected_route_type] }}
                    >
                      {typeLabels[trip.selected_route_type]}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                      <MapPin className="h-2.5 w-2.5" />{trip.route_summary.totalDistance} mi
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                      <Clock className="h-2.5 w-2.5" />{formatDuration(trip.route_summary.totalDuration)}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    onClick={() => onReplay(trip)}
                    className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-blue-100 hover:text-blue-600"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="rounded-lg p-1 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
