import React, { useState, useEffect } from 'react';
import { COUNTRIES, getFlagUrl } from '../data/countries';
import { sound } from '../utils/audio';
import { Compass, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  onFinished: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinished }) => {
  const [progress, setProgress] = useState<number>(0);
  const [flagIndex, setFlagIndex] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Initializing 195 Sovereign Nations...');

  // Featured flags to cycle through rapidly during loading
  const featuredCountries = React.useMemo(() => {
    return [
      COUNTRIES.find(c => c.code === 'us') || COUNTRIES[0],
      COUNTRIES.find(c => c.code === 'jp') || COUNTRIES[1],
      COUNTRIES.find(c => c.code === 'br') || COUNTRIES[2],
      COUNTRIES.find(c => c.code === 'fr') || COUNTRIES[3],
      COUNTRIES.find(c => c.code === 'za') || COUNTRIES[4],
      COUNTRIES.find(c => c.code === 'in') || COUNTRIES[5],
      COUNTRIES.find(c => c.code === 'de') || COUNTRIES[6],
      COUNTRIES.find(c => c.code === 'au') || COUNTRIES[7],
      COUNTRIES.find(c => c.code === 'eg') || COUNTRIES[8],
      COUNTRIES.find(c => c.code === 'kr') || COUNTRIES[9],
      COUNTRIES.find(c => c.code === 'ca') || COUNTRIES[10],
      COUNTRIES.find(c => c.code === 'it') || COUNTRIES[11],
      COUNTRIES.find(c => c.code === 'mx') || COUNTRIES[12],
      COUNTRIES.find(c => c.code === 'gb') || COUNTRIES[13],
      COUNTRIES.find(c => c.code === 'es') || COUNTRIES[14],
    ];
  }, []);

  const currentCountry = featuredCountries[flagIndex % featuredCountries.length];

  // Flag cycling ticker
  useEffect(() => {
    const flagInterval = setInterval(() => {
      setFlagIndex(prev => (prev + 1) % featuredCountries.length);
    }, 110);
    return () => clearInterval(flagInterval);
  }, [featuredCountries.length]);

  // Loading progress ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + 2;
        if (next >= 15 && next < 50) {
          setStatusText('Projecting 1:1 Natural Earth Topography...');
        } else if (next >= 50 && next < 85) {
          setStatusText('Calibrating Continental Coordinate Grids...');
        } else if (next >= 85 && next < 100) {
          setStatusText('Syncing Global Speedrun Standings...');
        } else if (next >= 100) {
          setStatusText('World Atlas Ready!');
          clearInterval(timer);
          sound.playMilestone();
          setTimeout(() => {
            onFinished();
          }, 350);
          return 100;
        }
        return next;
      });
    }, 28);

    return () => clearInterval(timer);
  }, [onFinished]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-50 via-white to-slate-100 flex flex-col items-center justify-center p-6 select-none animate-fade-in">
      {/* Decorative ambient flag ring in the background */}
      <div className="relative flex flex-col items-center max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/50">
        {/* Brand Kicker */}
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 font-semibold uppercase tracking-wider">
          <Compass className="w-4 h-4 animate-spin text-emerald-500" style={{ animationDuration: '6s' }} />
          <span>GeoBlitz · 195 World Atlas</span>
        </div>

        {/* Dynamic Flag Cycler Card */}
        <div className="relative w-44 h-28 mx-auto flex items-center justify-center rounded-2xl bg-slate-50 border-2 border-slate-200/80 shadow-inner overflow-hidden p-2">
          {currentCountry && (
            <div className="flex flex-col items-center justify-center gap-1.5 animate-fade-in">
              <img
                src={getFlagUrl(currentCountry.code)}
                alt={currentCountry.name}
                className="w-24 h-16 object-cover rounded-lg shadow-md border border-slate-300"
              />
              <span className="text-xs font-bold text-slate-800 tracking-tight">
                {currentCountry.name}
              </span>
            </div>
          )}
        </div>

        {/* Headline */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Loading Geo-Universe
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            {statusText}
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-400">STATUS</span>
            <span className="text-emerald-600 font-mono-numbers text-sm">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-75 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Micro-flag row preview */}
        <div className="flex items-center justify-center gap-1.5 pt-1 overflow-hidden">
          {featuredCountries.slice(0, 9).map((c) => (
            <img
              key={c.code}
              src={getFlagUrl(c.code)}
              alt={c.name}
              className="w-6 h-4 object-cover rounded-sm shadow-xs border border-slate-200 opacity-80"
            />
          ))}
        </div>

        {/* Skip button */}
        <button
          onClick={onFinished}
          className="text-xs text-slate-400 hover:text-slate-700 transition-colors font-mono cursor-pointer underline underline-offset-4"
        >
          Skip Intro
        </button>
      </div>
    </div>
  );
};
