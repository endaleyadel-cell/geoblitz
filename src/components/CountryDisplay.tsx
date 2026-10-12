import React from 'react';
import { Country, getFlagUrl } from '../data/countries';
import { Compass, Globe } from 'lucide-react';

interface CountryDisplayProps {
  country: Country;
  mode: 'flags' | 'shapes' | 'hybrid';
  hybridShowShape?: boolean;
  revealState?: 'guessing' | 'correct' | 'skipped';
}

export const CountryDisplay: React.FC<CountryDisplayProps> = ({
  country,
  mode,
  hybridShowShape = false,
  revealState = 'guessing',
}) => {
  const isShape = mode === 'shapes' || (mode === 'hybrid' && hybridShowShape);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[16/10] sm:aspect-[16/10] rounded-2xl bg-white border border-slate-200 shadow-xl flex flex-col items-center justify-center p-6 overflow-hidden transition-all duration-200">
      {/* Background subtle geometric coordinate grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Mode Indicator & Continent unboxed text metadata */}
      <div className="absolute top-4 left-5 right-5 flex items-center justify-between text-xs text-slate-500 font-mono select-none">
        <div className="flex items-center gap-2">
          {isShape ? <Compass className="w-3.5 h-3.5 text-cyan-600" /> : <Globe className="w-3.5 h-3.5 text-emerald-600" />}
          <span className="text-slate-800 font-bold">
            {isShape ? '1:1 Accurate Silhouette' : 'National Flag'}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{country.continent}</span>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          <span>{country.code.toUpperCase()}</span>
        </div>
      </div>

      {/* Main Visual Display */}
      <div className="relative flex items-center justify-center w-full h-full max-h-[190px] mt-4">
        {isShape ? (
          // 1:1 Silhouette View
          <div className="relative w-full h-full flex items-center justify-center group">
            <div className="absolute w-44 h-44 rounded-full border border-slate-200/60 pointer-events-none" />
            <div className="absolute w-28 h-28 rounded-full border border-slate-200/80 pointer-events-none" />

            <svg
              viewBox="0 0 100 100"
              className={`w-40 h-40 max-w-[85%] max-h-[85%] transition-transform duration-300 ${
                revealState === 'correct'
                  ? 'text-emerald-500 scale-105 filter drop-shadow-[0_4px_12px_rgba(16,185,129,0.3)]'
                  : revealState === 'skipped'
                  ? 'text-slate-400 scale-95'
                  : 'text-slate-800 hover:scale-102 drop-shadow-sm'
              }`}
            >
              <path
                d={country.shapeSvgPath}
                fill="currentColor"
                stroke="#334155"
                strokeWidth="0.6"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ) : (
          // Flag View
          <div className="relative max-w-[260px] max-h-[160px] w-full h-full flex items-center justify-center">
            <div className="relative rounded-xl overflow-hidden border border-slate-300/80 shadow-md transition-all duration-300 group bg-slate-50">
              <img
                src={getFlagUrl(country.code)}
                alt={`National flag of ${revealState === 'guessing' ? 'a country' : country.name}`}
                referrerPolicy="no-referrer"
                className={`max-h-[140px] max-w-[240px] w-auto h-auto object-contain transition-transform duration-300 ${
                  revealState === 'correct' ? 'scale-105' : ''
                }`}
                loading="eager"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.classList.add('p-8', 'bg-slate-100', 'flex', 'items-center', 'justify-center');
                    parent.innerHTML = `<span class="text-xl font-bold font-mono tracking-wider text-slate-800">${country.code.toUpperCase()}</span>`;
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Reveal Overlay upon Correct or Skipped */}
      {revealState !== 'guessing' && (
        <div className={`absolute bottom-3 inset-x-5 py-1 px-3 rounded-lg text-center backdrop-blur-md border text-xs font-semibold tracking-wide transition-all ${
          revealState === 'correct'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
            : 'bg-slate-100 border-slate-300 text-slate-700'
        }`}>
          {country.name} · Capital: {country.capital}
        </div>
      )}
    </div>
  );
};
