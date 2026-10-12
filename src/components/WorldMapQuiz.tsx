import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Country, COUNTRIES, Continent, isMatchCountry, getFlagUrl } from '../data/countries';
import { sound } from '../utils/audio';
import { recordScore, getStoredUserStats } from '../utils/leaderboard';
import { Search, ZoomIn, ZoomOut, RotateCcw, Check, Flame, Trophy, Eye, EyeOff, MapPin } from 'lucide-react';

interface ContinentBounds {
  viewBox: string;
}

const CONTINENT_VIEWBOXES: Record<Continent, ContinentBounds> = {
  'All World': { viewBox: '0 0 1000 520' },
  'Europe': { viewBox: '430 40 260 190' },
  'Asia': { viewBox: '530 70 420 300' },
  'Africa': { viewBox: '430 170 260 290' },
  'North America': { viewBox: '70 30 360 270' },
  'South America': { viewBox: '230 240 220 250' },
  'Oceania': { viewBox: '690 260 270 230' },
};

interface WorldMapQuizProps {
  onOpenLeaderboard: () => void;
  onUpdateStats: () => void;
}

export const WorldMapQuiz: React.FC<WorldMapQuizProps> = ({
  onOpenLeaderboard,
  onUpdateStats,
}) => {
  const [selectedContinent, setSelectedContinent] = useState<Continent>('All World');
  const [inputValue, setInputValue] = useState<string>('');
  const [discoveredIds, setDiscoveredIds] = useState<Set<string>>(new Set());
  const [lastDiscovered, setLastDiscovered] = useState<Country | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Filter countries by continent
  const targetCountries = useMemo(() => {
    if (selectedContinent === 'All World') {
      return COUNTRIES;
    }
    return COUNTRIES.filter(c => c.continent === selectedContinent);
  }, [selectedContinent]);

  // Reset or switch continent
  const handleSelectContinent = (cont: Continent) => {
    setSelectedContinent(cont);
    setDiscoveredIds(new Set());
    setStreak(0);
    setMaxStreak(0);
    setLastDiscovered(null);
    setInputValue('');
    setIsRevealed(false);
    setZoomLevel(1);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Check victory
  useEffect(() => {
    if (targetCountries.length > 0 && discoveredIds.size === targetCountries.length) {
      sound.playMilestone();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });

      const userStats = getStoredUserStats();
      const score = discoveredIds.size * 100 + maxStreak * 25;
      recordScore(
        userStats.username,
        userStats.userCountryCode,
        score,
        discoveredIds.size,
        100,
        'mania',
        selectedContinent,
        maxStreak
      );
      onUpdateStats();
    }
  }, [discoveredIds.size, targetCountries.length, selectedContinent, maxStreak, onUpdateStats]);

  // Input change with instant match
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    sound.playKeypress();

    // Check all undiscovered countries in this pool
    for (const country of targetCountries) {
      if (!discoveredIds.has(country.id) && isMatchCountry(val, country)) {
        // Matched!
        const nextSet = new Set(discoveredIds);
        nextSet.add(country.id);
        setDiscoveredIds(nextSet);

        const newStreak = streak + 1;
        setStreak(newStreak);
        setMaxStreak(prev => Math.max(prev, newStreak));

        sound.playCorrect(newStreak);
        if (newStreak % 5 === 0) {
          sound.playMilestone();
        }

        setLastDiscovered(country);
        setTimeout(() => setLastDiscovered(null), 2500);

        setInputValue('');
        break;
      }
    }
  };

  const currentViewBox = useMemo(() => {
    const base = CONTINENT_VIEWBOXES[selectedContinent].viewBox;
    const [x, y, w, h] = base.split(' ').map(Number);
    const newW = w / zoomLevel;
    const newH = h / zoomLevel;
    const newX = x + (w - newW) / 2;
    const newY = y + (h - newH) / 2;
    return `${newX} ${newY} ${newW} ${newH}`;
  }, [selectedContinent, zoomLevel]);

  const percentComplete = targetCountries.length > 0 ? Math.round((discoveredIds.size / targetCountries.length) * 100) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 space-y-4">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Interactive 1:1 World Map
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Type country names to illuminate accurate real-world topography across all 195 nations
          </p>
        </div>

        {/* HUD Counters */}
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase">Mapped</div>
            <div className="text-base font-bold font-mono-numbers text-emerald-600">
              {discoveredIds.size} / {targetCountries.length} <span className="text-xs text-slate-500">({percentComplete}%)</span>
            </div>
          </div>
          {streak >= 2 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 font-mono text-xs font-bold streak-glow">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{streak} Streak</span>
            </div>
          )}
        </div>
      </div>

      {/* Region / Continent Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-xs">
        {(['All World', 'Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania'] as Continent[]).map(cont => {
          const count = cont === 'All World' ? COUNTRIES.length : COUNTRIES.filter(c => c.continent === cont).length;
          const isSelected = selectedContinent === cont;
          return (
            <button
              key={cont}
              onClick={() => handleSelectContinent(cont)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{cont}</span>
              <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Map Box & Live Typing Toolbar */}
      <div className="relative w-full rounded-2xl bg-white border border-slate-200 shadow-lg overflow-hidden flex flex-col">
        {/* Top Control Bar with Input & Zoom */}
        <div className="p-3 sm:p-4 border-b border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row items-center gap-3 justify-between">
          {/* Continuous Typing Bar */}
          <div className="relative w-full sm:max-w-md">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={`Type any country in ${selectedContinent}...`}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              className="w-full py-2.5 pl-10 pr-4 bg-white text-slate-900 text-sm font-semibold rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Map Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.3, 3))}
              className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer shadow-xs"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.3, 0.8))}
              className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer shadow-xs"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer shadow-xs"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsRevealed(!isRevealed)}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer text-xs font-mono flex items-center gap-1 shadow-xs"
              title="Toggle reveal all countries"
            >
              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isRevealed ? 'Hide' : 'Reveal'}</span>
            </button>
          </div>
        </div>

        {/* Progress Strip */}
        <div className="w-full h-1 bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        {/* The 1:1 SVG World Map Arena */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] bg-[#f0f4f8] flex items-center justify-center overflow-hidden">
          {/* Subtle ocean latitude/longitude grid */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          <svg
            viewBox={currentViewBox}
            className="w-full h-full transition-all duration-500 ease-out cursor-crosshair select-none"
          >
            {/* Draw every country with accurate 1:1 Natural Earth path */}
            {COUNTRIES.map(country => {
              if (!country.mapPath) return null;
              const isFound = discoveredIds.has(country.id);
              const showFill = isFound || isRevealed;

              return (
                <path
                  key={country.id}
                  d={country.mapPath}
                  className={`transition-colors duration-200 ${
                    showFill
                      ? isFound
                        ? 'fill-emerald-500 hover:fill-emerald-400 stroke-emerald-700/60'
                        : 'fill-slate-300 hover:fill-slate-400 stroke-slate-400'
                      : 'fill-slate-200 hover:fill-slate-300/80 stroke-slate-300/70'
                  }`}
                  strokeWidth="0.5"
                  strokeLinejoin="round"
                  onMouseEnter={() => setHoveredCountry(country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                />
              );
            })}
          </svg>

          {/* Last Discovered Toast Alert */}
          {lastDiscovered && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-emerald-500/40 shadow-xl flex items-center gap-2.5 animate-bounce z-20">
              <img
                src={getFlagUrl(lastDiscovered.code)}
                alt={lastDiscovered.name}
                className="w-7 h-5 object-cover rounded shadow-xs border border-slate-200"
              />
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {lastDiscovered.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Cap: {lastDiscovered.capital} · {lastDiscovered.continent}
                </div>
              </div>
            </div>
          )}

          {/* Hover Tooltip Card */}
          {hoveredCountry && (
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-md flex items-center gap-2.5 pointer-events-none z-10">
              <img
                src={getFlagUrl(hoveredCountry.code)}
                alt={hoveredCountry.name}
                className="w-6 h-4 object-cover rounded shadow-xs border border-slate-200"
              />
              <div>
                <div className="text-xs font-semibold text-slate-800">
                  {discoveredIds.has(hoveredCountry.id) || isRevealed ? hoveredCountry.name : '???'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {hoveredCountry.continent}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Discovered Flags Shelf */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Discovered Nations ({discoveredIds.size})</span>
            <span>{targetCountries.length - discoveredIds.size} Remaining</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
            {targetCountries
              .filter(c => discoveredIds.has(c.id))
              .map(c => (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                >
                  <img
                    src={getFlagUrl(c.code)}
                    alt={c.name}
                    className="w-4 h-3 object-cover rounded-xs"
                  />
                  <span>{c.name}</span>
                </div>
              ))}
            {discoveredIds.size === 0 && (
              <div className="text-xs text-slate-400 font-mono py-2">
                Start typing above to reveal countries on the map.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
