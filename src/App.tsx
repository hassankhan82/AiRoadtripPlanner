import { useState, useCallback } from 'react';
import { Route as RouteIcon, Sparkles, Compass, Github, AlertCircle } from 'lucide-react';
import { SearchPanel } from './components/SearchPanel';
import { RouteMap } from './components/RouteMap';
import { RouteCard } from './components/RouteCard';
import { RouteDetails } from './components/RouteDetails';
import { TripHistory } from './components/TripHistory';
import { computeRoutes } from './lib/routeEngine';
import { supabase } from './lib/supabase';
import type { RouteResult, RouteType, SavedTrip } from './lib/types';

function App() {
  const [originId, setOriginId] = useState<string | null>(null);
  const [destId, setDestId] = useState<string | null>(null);
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [hasPlanned, setHasPlanned] = useState(false);
  const [noRoute, setNoRoute] = useState(false);

  const handlePlan = useCallback(() => {
    if (!originId || !destId || originId === destId) return;
    setLoading(true);
    setSaved(false);
    setHasPlanned(false);
    setNoRoute(false);
    // Simulate AI analysis delay for UX
    setTimeout(() => {
      const computed = computeRoutes(originId, destId);
      if (computed.length === 0) {
        setNoRoute(true);
      } else {
        setRoutes(computed);
        setSelectedRoute(computed[0]);
      }
      setLoading(false);
      setHasPlanned(true);
    }, 1200);
  }, [originId, destId]);

  const handleSave = async () => {
    if (!selectedRoute || !originId || !destId) return;
    const originName = routes[0]?.cities[0]?.name || '';
    const destName = routes[0]?.cities[routes[0].cities.length - 1]?.name || '';

    await supabase.from('trips').insert({
      origin: originName,
      destination: destName,
      selected_route_type: selectedRoute.type as RouteType,
      route_summary: selectedRoute as any,
    });

    setSaved(true);
    setHistoryRefresh(r => r + 1);
  };

  const handleReplay = (trip: SavedTrip) => {
    setRoutes([trip.route_summary]);
    setSelectedRoute(trip.route_summary);
    setHasPlanned(true);
    setSaved(true);
    // Try to restore origin/dest
    const originCity = trip.route_summary.cities[0];
    const destCity = trip.route_summary.cities[trip.route_summary.cities.length - 1];
    if (originCity) setOriginId(originCity.id);
    if (destCity) setDestId(destCity.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-500/30">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-800">RouteWise</h1>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">AI Road Trip Planner</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-violet-600" />
              <span className="text-xs font-semibold text-violet-700">AI-Powered Routing</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Hero section */}
        {!hasPlanned && !loading && (
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              Plan the perfect road trip
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Get multiple route options — shortest, most scenic, least traffic, and AI-optimized.
              Compare with real images and choose your adventure.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left column: Search + Route cards */}
          <div className="space-y-4 lg:col-span-4">
            <SearchPanel
              originId={originId}
              destId={destId}
              onOriginChange={setOriginId}
              onDestChange={setDestId}
              onPlan={handlePlan}
              loading={loading}
            />

            {loading && (
              <div className="space-y-3">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 h-28 rounded-xl bg-slate-100" />
                    <div className="space-y-2">
                      <div className="h-4 w-2/3 rounded bg-slate-100" />
                      <div className="h-3 w-full rounded bg-slate-100" />
                      <div className="h-3 w-3/4 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && routes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <RouteIcon className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-700">{routes.length} Routes Found</h3>
                </div>
                {routes.map(route => (
                  <RouteCard
                    key={route.type}
                    route={route}
                    isSelected={selectedRoute?.type === route.type}
                    onSelect={() => { setSelectedRoute(route); setSaved(false); }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Center column: Map + Details */}
          <div className="space-y-4 lg:col-span-5">
            {noRoute ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50/50 p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
                  <AlertCircle className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">No road route found</h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  These cities are on different continents with no road connection between them. Try selecting cities within the same continent or connected landmass.
                </p>
              </div>
            ) : routes.length > 0 ? (
              <>
                <RouteMap
                  routes={routes}
                  selectedRoute={selectedRoute}
                  onSelectRoute={(r) => { setSelectedRoute(r); setSaved(false); }}
                  originId={originId}
                  destId={destId}
                />
                {selectedRoute && (
                  <RouteDetails route={selectedRoute} onSave={handleSave} saved={saved} />
                )}
              </>
            ) : (
              <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                  <Compass className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-600">Ready to explore?</h3>
                <p className="mt-1 max-w-sm text-sm text-slate-400">
                  Select your starting point and destination to see multiple route options with images, traffic data, and AI recommendations.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {['Shortest Path', 'Scenic Route', 'Low Traffic', 'AI Optimal'].map((tag, i) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column: Trip history */}
          <div className="lg:col-span-3">
            <TripHistory refreshKey={historyRefresh} onReplay={handleReplay} />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200/60 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 text-xs text-slate-400">
          <Github className="h-3.5 w-3.5" />
          <span>RouteWise — AI Road Trip Planner</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
