import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Country, COUNTRIES, Continent, isMatchCountry, getFlagUrl } from '../data/countries';
import { CountryDisplay } from './CountryDisplay';
import { sound } from '../utils/audio';
import { recordScore, getStoredUserStats } from '../utils/leaderboard';
import { Flame, RotateCcw, Trophy, Zap, Clock, Share2, Check, ArrowRight } from 'lucide-react';

export type BlitzDuration = 10 | 20 | 30 | 60;
export type BlitzType = 'flags' | 'shapes' | 'hybrid';

interface BlitzGameProps {
  initialDuration?: BlitzDuration;
  initialType?: BlitzType;
  onOpenLeaderboard: () => void;
  onUpdateStats: () => void;
}

export const BlitzGame: React.FC<BlitzGameProps> = ({
  initialDuration = 20,
  initialType = 'flags',
  onOpenLeaderboard,
  onUpdateStats,
}) => {
  // Game Setup State
  const [duration, setDuration] = useState<BlitzDuration>(initialDuration);
  const [blitzType, setBlitzType] = useState<BlitzType>(initialType);
  const [selectedContinent, setSelectedContinent] = useState<Continent>('All World');

  // Game Engine State
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>('IDLE');
  const [timeLeft, setTimeLeft] = useState<number>(initialDuration);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [skippedCount, setSkippedCount] = useState<number>(0);

  // Active Country & Pool
  const [countryPool, setCountryPool] = useState<Country[]>([]);
  const [currentCountryIndex, setCurrentCountryIndex] = useState<number>(0);
  const [hybridShapeToggle, setHybridShapeToggle] = useState<boolean>(false);
  const [revealState, setRevealState] = useState<'guessing' | 'correct' | 'skipped'>('guessing');

  // Input & Visual Feedback
  const [inputValue, setInputValue] = useState<string>('');
  const [scorePopup, setScorePopup] = useState<{ id: number; text: string; multiplier: number } | null>(null);
  const [isInputShaking, setIsInputShaking] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [lastRank, setLastRank] = useState<number | null>(null);
  const [roundHistory, setRoundHistory] = useState<Array<{ country: Country; status: 'correct' | 'skipped' }>>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentCountry = countryPool[currentCountryIndex] || null;

  // Filter country pool based on continent
  const getFilteredCountries = useCallback(() => {
    let pool = COUNTRIES;
    if (selectedContinent !== 'All World') {
      pool = COUNTRIES.filter(c => c.continent === selectedContinent);
    }
    // Shuffle pool with Fisher-Yates
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [selectedContinent]);

  // Start new round
  const startGame = useCallback(() => {
    const pool = getFilteredCountries();
    if (pool.length === 0) return;

    setCountryPool(pool);
    setCurrentCountryIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setSkippedCount(0);
    setTimeLeft(duration);
    setInputValue('');
    setRevealState('guessing');
    setRoundHistory([]);
    setLastRank(null);
    setCopiedShare(false);
    setHybridShapeToggle(Math.random() > 0.5);

    setGameState('PLAYING');

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [duration, getFilteredCountries]);

  // End Game
  const endGame = useCallback(() => {
    setGameState('FINISHED');
    sound.playGameOver();

    // Trigger confetti if high score or good performance
    if (score > 600 || correctCount >= 8) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#f59e0b', '#ec4899'],
      });
    }

    // Auto submit to leaderboard
    const userStats = getStoredUserStats();
    const modeKey = duration === 10 ? '10s' : duration === 20 ? '20s' : duration === 30 ? '30s' : blitzType === 'shapes' ? 'shapes' : 'flags';
    const accuracy = correctCount + skippedCount > 0 ? Math.round((correctCount / (correctCount + skippedCount)) * 100) : 100;
    
    const result = recordScore(
      userStats.username,
      userStats.userCountryCode,
      score,
      correctCount,
      accuracy,
      modeKey,
      selectedContinent,
      maxStreak
    );

    setLastRank(result.rank);
    onUpdateStats();
  }, [score, correctCount, skippedCount, duration, blitzType, selectedContinent, maxStreak, onUpdateStats]);

  // Timer loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        // Low time ticking sound
        if (prev <= 5) {
          sound.playTick(prev <= 3);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Trigger endGame when timer hits 0
  useEffect(() => {
    if (gameState === 'PLAYING' && timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      endGame();
    }
  }, [gameState, timeLeft, endGame]);

  // Handle Correct Guess
  const handleCorrect = useCallback(() => {
    if (!currentCountry) return;

    const newStreak = streak + 1;
    setStreak(newStreak);
    setMaxStreak(prev => Math.max(prev, newStreak));
    setCorrectCount(prev => prev + 1);

    // Calculate score with combo multiplier
    const multiplier = 1 + Math.min(newStreak * 0.15, 2.5);
    const addedScore = Math.round(100 * multiplier);
    setScore(prev => prev + addedScore);

    // Audio & dopamine feedback
    sound.playCorrect(newStreak);

    // Milestone sound + mini confetti on 5x, 10x, 15x
    if (newStreak % 5 === 0) {
      sound.playMilestone();
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#10b981', '#f59e0b'],
      });
    }

    // Popup indicator
    setScorePopup({
      id: Date.now(),
      text: `+${addedScore}`,
      multiplier: Number(multiplier.toFixed(1)),
    });
    setTimeout(() => setScorePopup(null), 700);

    // Visual reveal briefly then next
    setRevealState('correct');
    setRoundHistory(prev => [{ country: currentCountry, status: 'correct' }, ...prev]);
    setInputValue('');

    // Advance to next country instantly with tiny delay for fluid dopamine cue
    setTimeout(() => {
      setRevealState('guessing');
      setCurrentCountryIndex(prev => (prev + 1) % countryPool.length);
      setHybridShapeToggle(Math.random() > 0.5);
      inputRef.current?.focus();
    }, 180);
  }, [currentCountry, streak, countryPool.length]);

  // Handle Skip
  const handleSkip = useCallback(() => {
    if (!currentCountry) return;

    sound.playSkip();
    setStreak(0);
    setSkippedCount(prev => prev + 1);
    setRevealState('skipped');
    setRoundHistory(prev => [{ country: currentCountry, status: 'skipped' }, ...prev]);
    setInputValue('');

    setTimeout(() => {
      setRevealState('guessing');
      setCurrentCountryIndex(prev => (prev + 1) % countryPool.length);
      setHybridShapeToggle(Math.random() > 0.5);
      inputRef.current?.focus();
    }, 280);
  }, [currentCountry, countryPool.length]);

  // Live input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    sound.playKeypress();

    if (currentCountry && isMatchCountry(val, currentCountry)) {
      handleCorrect();
    }
  };

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'PLAYING') {
        if (e.key === 'Tab') {
          e.preventDefault();
          handleSkip();
        }
      } else if (gameState === 'FINISHED') {
        if (e.key === ' ' || e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          startGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleSkip, startGame]);

  // Copy share card
  const handleShare = () => {
    const text = `🌍 GeoBlitz Speedrun:\n⚡ ${score} pts in ${duration}s (${selectedContinent})\n🎯 ${correctCount} countries guessed\n🔥 Max Streak: ${maxStreak}\nCan you beat my score?`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Calculate Guesses per Minute
  const gpm = duration > 0 ? Math.round((correctCount / duration) * 60) : 0;
  const accuracyPercent = correctCount + skippedCount > 0 ? Math.round((correctCount / (correctCount + skippedCount)) * 100) : 100;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* ===================== IDLE / CONFIG VIEW ===================== */}
      {gameState === 'IDLE' && (
        <div className="w-full max-w-xl flex flex-col items-center gap-5">
          {/* Hero Kicker & Title */}
          <div className="text-center space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Speedrun Geography
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Test your instinct across all 195 nations. Type country names before the clock expires.
            </p>
          </div>

          {/* Time Limit Selector (10s, 20s, 30s, 60s) */}
          <div className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Time Limit (Seconds)
              </span>
              <span className="text-emerald-700 font-bold">{duration}s Blitz</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {([10, 20, 30, 60] as BlitzDuration[]).map(t => (
                <button
                  key={t}
                  onClick={() => setDuration(t)}
                  className={`py-2 text-xs font-mono font-medium rounded-xl transition-all cursor-pointer ${
                    duration === t
                      ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/30'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>

          {/* Mode Type Selector (Flags, Shapes, Hybrid) */}
          <div className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <Zap className="w-3.5 h-3.5 text-cyan-600" />
                Visual Challenge Type
              </span>
              <span className="capitalize text-cyan-700 font-bold">{blitzType}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setBlitzType('flags')}
                className={`py-2 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                  blitzType === 'flags'
                    ? 'bg-cyan-600 text-white font-bold shadow-sm shadow-cyan-600/30'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                National Flags
              </button>
              <button
                onClick={() => setBlitzType('shapes')}
                className={`py-2 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                  blitzType === 'shapes'
                    ? 'bg-cyan-600 text-white font-bold shadow-sm shadow-cyan-600/30'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                1:1 Silhouettes
              </button>
              <button
                onClick={() => setBlitzType('hybrid')}
                className={`py-2 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                  blitzType === 'hybrid'
                    ? 'bg-cyan-600 text-white font-bold shadow-sm shadow-cyan-600/30'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Hybrid (Both)
              </button>
            </div>
          </div>

          {/* Continent Filter Selector */}
          <div className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="text-xs text-slate-600 font-mono font-bold">Select Region</div>
            <div className="flex flex-wrap gap-1.5">
              {(['All World', 'Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania'] as Continent[]).map(cont => (
                <button
                  key={cont}
                  onClick={() => setSelectedContinent(cont)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    selectedContinent === cont
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cont}
                </button>
              ))}
            </div>
          </div>

          {/* Big Start Button */}
          <button
            onClick={startGame}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <span>Start {duration}s Speedrun</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ===================== ACTIVE PLAY VIEW ===================== */}
      {gameState === 'PLAYING' && currentCountry && (
        <div className="w-full max-w-xl flex flex-col items-center gap-4">
          {/* Top Realtime HUD Header */}
          <div className="w-full flex items-center justify-between px-2 text-sm font-mono-numbers">
            {/* Score & Multiplier */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">Score:</span>
              <span className="text-xl font-bold text-slate-900 tracking-tight">{score}</span>
              {streak >= 2 && (
                <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 streak-glow font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{streak}x Combo</span>
                </div>
              )}
            </div>

            {/* Countdown Timer with color shifting */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono font-bold text-sm transition-colors ${
                  timeLeft <= 4
                    ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                    : timeLeft <= 8
                    ? 'bg-amber-50 border-amber-300 text-amber-600'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>
            </div>
          </div>

          {/* Time Bar Indicator */}
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${(timeLeft / duration) * 100}%` }}
            />
          </div>

          {/* Main Visual Display */}
          <div className="relative w-full">
            <CountryDisplay
              country={currentCountry}
              mode={blitzType}
              hybridShowShape={hybridShapeToggle}
              revealState={revealState}
            />

            {/* Floating Score Dopamine Popup */}
            {scorePopup && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center animate-bounce z-20">
                <span className="text-4xl font-extrabold text-emerald-600 drop-shadow-[0_2px_10px_rgba(16,185,129,0.5)] font-mono-numbers">
                  {scorePopup.text}
                </span>
                {scorePopup.multiplier > 1 && (
                  <span className="text-xs font-bold text-amber-600 font-mono tracking-wider bg-white px-2 py-0.5 rounded shadow-sm border border-amber-200">
                    {scorePopup.multiplier}x COMBO
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Live Input Field (Auto-matches immediately) */}
          <div className="w-full space-y-2">
            <div className="relative w-full">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!isMatchCountry(inputValue, currentCountry)) {
                      setIsInputShaking(true);
                      sound.playSkip();
                      setTimeout(() => setIsInputShaking(false), 280);
                    }
                  }
                }}
                placeholder="Type country name..."
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                className={`w-full py-3.5 px-4 bg-white text-slate-900 text-center text-lg sm:text-xl font-bold placeholder:text-slate-400 rounded-2xl border shadow-md focus:outline-none transition-all duration-150 ${
                  isInputShaking ? 'animate-shake border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                }`}
              />

              {/* Instant Clear / Skip trigger */}
              <button
                type="button"
                onClick={handleSkip}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-mono text-slate-500 hover:text-slate-800 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
              >
                Skip (Tab)
              </button>
            </div>

            {/* Instructions */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
              <span>Auto-detects as you type</span>
              <span>{correctCount} Guessed</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== GAME OVER SUMMARY VIEW ===================== */}
      {gameState === 'FINISHED' && (
        <div className="w-full max-w-lg flex flex-col items-center gap-5 animate-fade-in">
          {/* Header & Score Banner */}
          <div className="text-center space-y-1">
            <span className="text-xs font-mono text-emerald-600 font-bold tracking-wider uppercase">RUN COMPLETE</span>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono-numbers">
              {score} PTS
            </h2>
            {lastRank !== null && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-700 font-mono bg-amber-50 px-3 py-1 rounded-full border border-amber-200 font-bold">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Rank #{lastRank} on Global Leaderboard</span>
              </div>
            )}
          </div>

          {/* Metric Grid */}
          <div className="w-full grid grid-cols-4 gap-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center font-mono-numbers">
            <div>
              <div className="text-[11px] text-slate-400 font-mono">Correct</div>
              <div className="text-xl font-bold text-emerald-600">{correctCount}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-mono">Max Streak</div>
              <div className="text-xl font-bold text-amber-600">{maxStreak}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-mono">Accuracy</div>
              <div className="text-xl font-bold text-cyan-600">{accuracyPercent}%</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-mono">Speed</div>
              <div className="text-xl font-bold text-slate-900">{gpm} <span className="text-[10px] text-slate-400">cpm</span></div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="w-full flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={startGame}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again (Space)</span>
            </button>
            <button
              onClick={onOpenLeaderboard}
              className="py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Leaderboard</span>
            </button>
            <button
              onClick={handleShare}
              className="py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedShare ? 'Copied!' : 'Share'}</span>
            </button>
          </div>

          {/* Countries Encountered in This Run with Real Flags */}
          {roundHistory.length > 0 && (
            <div className="w-full space-y-2 pt-1">
              <div className="text-xs text-slate-500 font-mono font-bold">Run Breakdown</div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {roundHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={getFlagUrl(item.country.code)}
                        alt={item.country.name}
                        className="w-5 h-3.5 object-cover rounded shadow-xs border border-slate-200"
                      />
                      <span className="text-slate-900 font-semibold">{item.country.name}</span>
                      <span className="text-slate-400">· {item.country.capital}</span>
                    </div>
                    <div>
                      {item.status === 'correct' ? (
                        <span className="text-emerald-600 font-bold">Guessed</span>
                      ) : (
                        <span className="text-slate-400">Skipped</span>
                      )}
                    </div>
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
