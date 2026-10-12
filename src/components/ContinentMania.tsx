import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Country, COUNTRIES, Continent, isMatchCountry, getFlagUrl } from '../data/countries';
import { sound } from '../utils/audio';
import { recordScore, getStoredUserStats } from '../utils/leaderboard';
import { Clock, Check, Trophy, RotateCcw, Share2, Search, ArrowRight, Flame, MapPin, Eye, EyeOff } from 'lucide-react';

interface ContinentManiaProps {
  onOpenLeaderboard: () => void;
  onUpdateStats: () => void;
}

// Bounding boxes tuned to frame each continent on the 1000x520 Natural Earth map
const CONTINENT_MAP_VIEWBOXES: Record<Continent, string> = {
  'Europe': '420 30 300 220',
  'Africa': '410 115 280 320',
  'Asia': '515 50 460 330',
  'North America': '70 15 370 280',
  'South America': '180 190 250 280',
  'Oceania': '685 235 310 260',
  'All World': '0 0 1000 520',
};

export const ContinentMania: React.FC<ContinentManiaProps> = ({
  onOpenLeaderboard,
  onUpdateStats,
}) => {
  const [selectedContinent, setSelectedContinent] = useState<Continent>('Europe');
  const [timeMode, setTimeMode] = useState<number>(60); // 10, 20, 30, 60, 120, or 0 (zen)
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>('IDLE');

  const [countriesToGuess, setCountriesToGuess] = useState<Country[]>([]);
  const [guessedIds, setGuessedIds] = useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [lastGuessed, setLastGuessed] = useState<Country | null>(null);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [lastRank, setLastRank] = useState<number | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize pool for continent
  const startContinentRush = useCallback((continent: Continent = selectedContinent, duration: number = timeMode) => {
    let pool = COUNTRIES;
    if (continent !== 'All World') {
      pool = COUNTRIES.filter(c => c.continent === continent);
    }

    setCountriesToGuess(pool);
    setGuessedIds(new Set());
    setInputValue('');
    setStreak(0);
    setMaxStreak(0);
    setLastGuessed(null);
    setTimeLeft(duration);
    setCopiedShare(false);
    setLastRank(null);
    setGameState('PLAYING');

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [selectedContinent, timeMode]);

  // Finish Mania
  const endContinentRush = useCallback(() => {
    setGameState('FINISHED');
    sound.playGameOver();

    const score = guessedIds.size * 120 + maxStreak * 25;
    if (guessedIds.size > 0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    const userStats = getStoredUserStats();
    const result = recordScore(
      userStats.username,
      userStats.userCountryCode,
      score,
      guessedIds.size,
      100,
      'mania',
      selectedContinent,
      maxStreak
    );

    setLastRank(result.rank);
    onUpdateStats();
  }, [guessedIds.size, maxStreak, selectedContinent, onUpdateStats]);

  // Timer loop
  useEffect(() => {
    if (gameState !== 'PLAYING' || timeMode === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        if (prev <= 5) {
          sound.playTick(prev <= 3);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timeMode]);

  // Trigger end when timer hits 0
  useEffect(() => {
    if (gameState === 'PLAYING' && timeMode > 0 && timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      endContinentRush();
    }
  }, [gameState, timeMode, timeLeft, endContinentRush]);

  // Check complete victory (all countries in continent named)
  useEffect(() => {
    if (gameState === 'PLAYING' && countriesToGuess.length > 0 && guessedIds.size === countriesToGuess.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      endContinentRush();
      confetti({
        particleCount: 180,
        spread: 110,
        origin: { y: 0.5 },
      });
    }
  }, [guessedIds.size, countriesToGuess.length, gameState, endContinentRush]);

  // Live input detector across all target countries
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    sound.playKeypress();

    for (const country of countriesToGuess) {
      if (!guessedIds.has(country.id) && isMatchCountry(val, country)) {
        // Matched!
        const nextSet = new Set(guessedIds);
        nextSet.add(country.id);
        setGuessedIds(nextSet);

        const newStreak = streak + 1;
        setStreak(newStreak);
        setMaxStreak(prev => Math.max(prev, newStreak));

        sound.playCorrect(newStreak);
        if (newStreak % 5 === 0) {
          sound.playMilestone();
        }

        setLastGuessed(country);
        setTimeout(() => setLastGuessed(null), 2000);

        setInputValue('');
        break;
      }
    }
  };

  // Keyboard shortcut to restart all over
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'FINISHED') {
        if (e.key === ' ' || e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          startContinentRush();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, startContinentRush]);

  const handleShare = () => {
    const text = `🗺️ GeoBlitz Continent Map Rush:\n📍 Named ${guessedIds.size}/${countriesToGuess.length} countries in ${selectedContinent}!\n🔥 Max Streak: ${maxStreak}\nCan you name every country on the continent?`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const percentComplete = countriesToGuess.length > 0 ? Math.round((guessedIds.size / countriesToGuess.length) * 100) : 0;
  const currentViewBox = CONTINENT_MAP_VIEWBOXES[selectedContinent] || '0 0 1000 520';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-3 space-y-4">
      {/* ===================== CONFIG / SELECTOR VIEW ===================== */}
      {gameState === 'IDLE' && (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-5">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono text-emerald-600 font-bold uppercase tracking-wider">
              Continuous Continent Speedrun
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Name Every Country On The Continent
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Pick a continent. Type country names as fast as you can. Watch the continent map light up in green as you conquer every nation.
            </p>
          </div>

          {/* Continent Choice Cards */}
          <div className="w-full bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="text-xs text-slate-600 font-mono font-bold">Select Continent To Conquer</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(['Europe', 'Africa', 'Asia', 'North America', 'South America', 'Oceania', 'All World'] as Continent[]).map(cont => {
                const count = cont === 'All World' ? COUNTRIES.length : COUNTRIES.filter(c => c.continent === cont).length;
                const isSelected = selectedContinent === cont;
                return (
                  <button
                    key={cont}
                    onClick={() => setSelectedContinent(cont)}
                    className={`p-3.5 text-left rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-bold">{cont}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">{count} Nations</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timer Pacing (10s, 20s, 30s, 60s, 120s, Zen) */}
          <div className="w-full bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="text-xs text-slate-600 font-mono font-bold">Pacing Duration</div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { label: '10s Blitz', val: 10 },
                { label: '20s Speed', val: 20 },
                { label: '30s Rush', val: 30 },
                { label: '60s Sprint', val: 60 },
                { label: '120s Endurance', val: 120 },
                { label: 'Zen (No Timer)', val: 0 },
              ].map(item => (
                <button
                  key={item.val}
                  onClick={() => setTimeMode(item.val)}
                  className={`py-2 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                    timeMode === item.val
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => startContinentRush()}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer hover:scale-[1.01]"
          >
            <span>Conquer {selectedContinent}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ===================== ACTIVE PLAY (MAP FRONT & CENTER) ===================== */}
      {gameState === 'PLAYING' && (
        <div className="w-full flex flex-col items-center gap-3 animate-fade-in">
          {/* Top Realtime Header HUD */}
          <div className="w-full flex items-center justify-between text-sm font-mono-numbers px-2">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                {selectedContinent} Map
              </span>
              <span className="text-xs text-slate-500 font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                {guessedIds.size} / {countriesToGuess.length} ({percentComplete}%)
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {streak >= 2 && (
                <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 streak-glow font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{streak}x Combo</span>
                </div>
              )}

              {timeMode > 0 && (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono font-bold text-xs ${
                  timeLeft <= 10 ? 'bg-red-50 border-red-300 text-red-600 animate-pulse' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeLeft}s</span>
                </div>
              )}

              <button
                onClick={endContinentRush}
                className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900 rounded-lg bg-white border border-slate-200 shadow-xs transition-colors cursor-pointer font-medium"
              >
                Finish / Give Up
              </button>
            </div>
          </div>

          {/* Continuous Typing Bar (Centered & Auto-focused) */}
          <div className="w-full max-w-xl relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={`Type country in ${selectedContinent} (auto-lights map)...`}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              className="w-full py-3.5 pl-11 pr-4 bg-white text-slate-900 text-center text-lg sm:text-xl font-bold placeholder:text-slate-400 rounded-2xl border-2 border-slate-300 shadow-lg focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />

            {/* Last guessed toast alert */}
            {lastGuessed && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white px-3 py-0.5 rounded-full shadow-md border border-emerald-300 animate-bounce font-mono z-20">
                <img
                  src={getFlagUrl(lastGuessed.code)}
                  alt={lastGuessed.name}
                  className="w-4 h-3 object-cover rounded-xs"
                />
                <span>{lastGuessed.name}!</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 ease-out"
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          {/* THE 1:1 MAP OF THE CONTINENT (ILLUMINATING IN REAL TIME) */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden flex items-center justify-center">
            {/* Subtle ocean grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)',
                backgroundSize: '20px 20px',
              }}
            />

            <svg
              viewBox={currentViewBox}
              className="w-full h-full select-none cursor-crosshair transition-all duration-300"
            >
              {/* Render background reference continents softly */}
              {COUNTRIES.filter(c => c.continent !== selectedContinent && c.mapPath).map(c => (
                <path
                  key={`bg-${c.id}`}
                  d={c.mapPath}
                  className="fill-slate-100 stroke-slate-200/50"
                  strokeWidth="0.3"
                />
              ))}

              {/* Render target continent countries with reactive highlight */}
              {countriesToGuess.map(country => {
                if (!country.mapPath) return null;
                const isGuessed = guessedIds.has(country.id);

                return (
                  <path
                    key={`target-${country.id}`}
                    d={country.mapPath}
                    className={`transition-all duration-200 ${
                      isGuessed
                        ? 'fill-emerald-500 stroke-emerald-600 filter drop-shadow-[0_1px_4px_rgba(16,185,129,0.4)]'
                        : 'fill-slate-100 hover:fill-slate-200/90 stroke-slate-300'
                    }`}
                    strokeWidth="0.5"
                    strokeLinejoin="round"
                    onMouseEnter={() => setHoveredCountry(country)}
                    onMouseLeave={() => setHoveredCountry(null)}
                  />
                );
              })}

              {/* Render pins/flags for guessed countries */}
              {countriesToGuess
                .filter(c => guessedIds.has(c.id) && c.cx && c.cy)
                .map(c => (
                  <g key={`pin-${c.id}`} transform={`translate(${c.cx}, ${c.cy})`} className="pointer-events-none animate-fade-in">
                    <circle r="2.5" fill="#047857" stroke="#ffffff" strokeWidth="0.6" />
                  </g>
                ))}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredCountry && (
              <div className="absolute bottom-3 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 pointer-events-none z-10">
                <img
                  src={getFlagUrl(hoveredCountry.code)}
                  alt={hoveredCountry.name}
                  className="w-5 h-3.5 object-cover rounded shadow-xs"
                />
                <span className="text-xs font-bold text-slate-800">
                  {guessedIds.has(hoveredCountry.id) ? hoveredCountry.name : '???'}
                </span>
              </div>
            )}
          </div>

          {/* Discovered Checklist Row */}
          <div className="w-full bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
            {countriesToGuess.map(c => {
              const isFound = guessedIds.has(c.id);
              return (
                <div
                  key={`shelf-${c.id}`}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium border transition-colors ${
                    isFound
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  {isFound ? (
                    <>
                      <img src={getFlagUrl(c.code)} alt={c.name} className="w-3.5 h-2.5 object-cover rounded-xs" />
                      <span>{c.name}</span>
                    </>
                  ) : (
                    <span>???</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== FINISHED / REVIEW VIEW (START ALL OVER) ===================== */}
      {gameState === 'FINISHED' && (
        <div className="w-full flex flex-col items-center gap-4 animate-fade-in">
          {/* Summary Banner */}
          <div className="text-center space-y-1">
            <span className="text-xs font-mono text-emerald-600 font-bold uppercase tracking-wider">
              {selectedContinent} Run Finished
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {guessedIds.size} / {countriesToGuess.length} Countries Named
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              {percentComplete}% of {selectedContinent} Mapped
            </p>
          </div>

          {/* Key Metrics */}
          <div className="w-full max-w-lg grid grid-cols-3 gap-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center font-mono-numbers">
            <div>
              <div className="text-[11px] text-slate-400 font-mono">Mapped</div>
              <div className="text-xl font-bold text-emerald-600">{guessedIds.size}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-mono">Max Streak</div>
              <div className="text-xl font-bold text-amber-500">{maxStreak}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-mono">Rank</div>
              <div className="text-xl font-bold text-cyan-600">#{lastRank || 1}</div>
            </div>
          </div>

          {/* THE REVIEW MAP (Green for Guessed, Rose/Amber for Missed) */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden flex items-center justify-center">
            <svg viewBox={currentViewBox} className="w-full h-full select-none">
              {/* Background other continents */}
              {COUNTRIES.filter(c => c.continent !== selectedContinent && c.mapPath).map(c => (
                <path key={`bg-fin-${c.id}`} d={c.mapPath} className="fill-slate-100 stroke-slate-200/50" strokeWidth="0.3" />
              ))}

              {/* Target countries with full review colors */}
              {countriesToGuess.map(c => {
                if (!c.mapPath) return null;
                const isFound = guessedIds.has(c.id);

                return (
                  <path
                    key={`review-${c.id}`}
                    d={c.mapPath}
                    className={isFound ? 'fill-emerald-500 stroke-emerald-600' : 'fill-rose-200 hover:fill-rose-300 stroke-rose-300'}
                    strokeWidth="0.5"
                    strokeLinejoin="round"
                    onMouseEnter={() => setHoveredCountry(c)}
                    onMouseLeave={() => setHoveredCountry(null)}
                  />
                );
              })}
            </svg>

            {/* Hover Tooltip in review */}
            {hoveredCountry && (
              <div className="absolute bottom-3 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-md flex items-center gap-2.5 pointer-events-none z-10">
                <img
                  src={getFlagUrl(hoveredCountry.code)}
                  alt={hoveredCountry.name}
                  className="w-6 h-4 object-cover rounded shadow-xs"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">{hoveredCountry.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {guessedIds.has(hoveredCountry.id) ? 'Discovered' : 'Missed'} · Cap: {hoveredCountry.capital}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* START ALL OVER PROMINENT ACTION */}
          <div className="w-full max-w-lg flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              onClick={() => startContinentRush()}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer hover:scale-[1.01]"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Start All Over Again (Space / R)</span>
            </button>
            <button
              onClick={() => setGameState('IDLE')}
              className="py-3 px-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              Change Continent
            </button>
            <button
              onClick={handleShare}
              className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-medium text-sm border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Missed countries review list */}
          {countriesToGuess.filter(c => !guessedIds.has(c.id)).length > 0 && (
            <div className="w-full max-w-2xl space-y-2 pt-2">
              <div className="text-xs text-rose-700 font-mono font-bold">
                Missed Nations in {selectedContinent} ({countriesToGuess.filter(c => !guessedIds.has(c.id)).length})
              </div>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                {countriesToGuess
                  .filter(c => !guessedIds.has(c.id))
                  .map(c => (
                    <div
                      key={`missed-${c.id}`}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-900 shadow-xs"
                    >
                      <img src={getFlagUrl(c.code)} alt={c.name} className="w-4 h-3 object-cover rounded-xs" />
                      <span>{c.name}</span>
                      <span className="text-[10px] text-rose-500 font-mono">({c.capital})</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
