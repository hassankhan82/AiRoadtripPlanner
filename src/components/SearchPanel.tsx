import { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, ArrowRight, ArrowLeftRight, Search } from 'lucide-react';
import { CITIES } from '../lib/cityData';

interface SearchPanelProps {
  originId: string | null;
  destId: string | null;
  onOriginChange: (id: string | null) => void;
  onDestChange: (id: string | null) => void;
  onPlan: () => void;
  loading: boolean;
}

const REGIONS: Record<string, string> = {
  USA: 'North America', Canada: 'North America', Mexico: 'North America',
  Brazil: 'South America', Argentina: 'South America', Peru: 'South America', Colombia: 'South America',
  UK: 'Europe', France: 'Europe', Italy: 'Europe', Spain: 'Europe', Germany: 'Europe',
  Netherlands: 'Europe', Portugal: 'Europe', Austria: 'Europe', 'Czech Republic': 'Europe',
  Türkiye: 'Europe', Greece: 'Europe', Russia: 'Europe', Sweden: 'Europe', Norway: 'Europe',
  Japan: 'Asia', 'South Korea': 'Asia', China: 'Asia', Thailand: 'Asia',
  Singapore: 'Asia', India: 'Asia', UAE: 'Asia', Iran: 'Asia', Malaysia: 'Asia', Indonesia: 'Asia',
  Egypt: 'Africa', Morocco: 'Africa', 'South Africa': 'Africa', Kenya: 'Africa',
  Nigeria: 'Africa', Ethiopia: 'Africa',
  Australia: 'Oceania', 'New Zealand': 'Oceania',
};

export function SearchPanel({ originId, destId, onOriginChange, onDestChange, onPlan, loading }: SearchPanelProps) {
  const [originQuery, setOriginQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [originOpen, setOriginOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(e.target as Node)) setOriginOpen(false);
      if (destRef.current && !destRef.current.contains(e.target as Node)) setDestOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const groupedResults = useMemo(() => {
    return (query: string) => {
      const filtered = CITIES.filter(c =>
        `${c.name} ${c.state}`.toLowerCase().includes(query.toLowerCase())
      );
      const groups: Record<string, typeof CITIES> = {};
      for (const city of filtered) {
        const region = REGIONS[city.state] || 'Other';
        if (!groups[region]) groups[region] = [];
        groups[region].push(city);
      }
      return groups;
    };
  }, []);

  const swap = () => {
    onOriginChange(destId);
    onDestChange(originId);
  };

  const renderDropdown = (
    query: string,
    setQuery: (v: string) => void,
    selected: string | null,
    onSelect: (id: string) => void,
    open: boolean,
    setOpen: (v: boolean) => void,
    ref: React.RefObject<HTMLDivElement>,
    placeholder: string,
    icon: 'origin' | 'dest'
  ) => {
    const groups = groupedResults(query);
    const totalResults = Object.values(groups).reduce((sum, g) => sum + g.length, 0);
    const selectedCity = CITIES.find(c => c.id === selected);

    return (
      <div ref={ref} className="relative flex-1">
        <div className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 transition-all ${open ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
          <MapPin className={`h-4 w-4 shrink-0 ${icon === 'origin' ? 'text-blue-500' : 'text-rose-500'}`} />
          <input
            type="text"
            value={selected ? `${selectedCity?.name}, ${selectedCity?.state}` : query}
            onChange={e => {
              setQuery(e.target.value);
              onSelect('' as any);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
        {open && totalResults > 0 && (
          <div className="absolute z-50 mt-2 max-h-[320px] w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            {Object.entries(groups).map(([region, cities]) => (
              <div key={region}>
                <div className="sticky top-0 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  {region}
                </div>
                {cities.map(city => (
                  <button
                    key={city.id}
                    onClick={() => { onSelect(city.id); setQuery(''); setOpen(false); }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                  >
                    <img src={city.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-800">{city.name}, {city.state}</div>
                      <div className="truncate text-xs text-slate-400">{city.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-lg shadow-slate-200/40 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          <Search className="h-4 w-4 text-blue-600" />
        </div>
        <h2 className="text-sm font-bold text-slate-800">Plan Your Road Trip</h2>
      </div>
      <div className="flex items-end gap-2">
        {renderDropdown(originQuery, setOriginQuery, originId, onOriginChange, originOpen, setOriginOpen, originRef, 'Starting from...', 'origin')}
        <button
          onClick={swap}
          className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:rotate-180 hover:border-blue-300 hover:text-blue-600"
          title="Swap origin and destination"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>
        {renderDropdown(destQuery, setDestQuery, destId, onDestChange, destOpen, setDestOpen, destRef, 'Going to...', 'dest')}
      </div>
      <button
        onClick={onPlan}
        disabled={!originId || !destId || originId === destId || loading}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        {loading ? (
          <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Planning routes...</>
        ) : (
          <>Plan My Trip <ArrowRight className="h-4 w-4" /></>
        )}
      </button>
      {originId && destId && originId === destId && (
        <p className="mt-2 text-center text-xs font-medium text-rose-500">Choose different cities for origin and destination.</p>
      )}
      {originId && destId && originId !== destId && (
        <p className="mt-2 text-center text-xs text-slate-400">
          {CITIES.find(c => c.id === originId)?.name} → {CITIES.find(c => c.id === destId)?.name}
        </p>
      )}
    </div>
  );
}
