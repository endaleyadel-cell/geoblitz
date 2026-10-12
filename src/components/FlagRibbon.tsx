import React from 'react';
import { COUNTRIES, getFlagUrl } from '../data/countries';

interface FlagRibbonProps {
  speed?: 'normal' | 'fast';
  className?: string;
}

export const FlagRibbon: React.FC<FlagRibbonProps> = ({ className = '' }) => {
  // Use a diverse curated cross-continental sample for the infinite loop
  const sampleFlags = React.useMemo(() => {
    return COUNTRIES.slice(0, 50);
  }, []);

  return (
    <div className={`w-full overflow-hidden border-y border-slate-200/80 bg-white/70 backdrop-blur-sm select-none py-1.5 ${className}`}>
      <div className="animate-flag-scroll flex items-center gap-6">
        {/* Render twice for seamless infinite marquee scroll */}
        {[...sampleFlags, ...sampleFlags].map((country, idx) => (
          <div
            key={`${country.code}-${idx}`}
            className="flex items-center gap-2 shrink-0 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-all cursor-default"
          >
            <img
              src={getFlagUrl(country.code)}
              alt={country.name}
              className="w-5 h-3.5 object-cover rounded shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-slate-200"
              loading="lazy"
            />
            <span className="text-[11px] font-semibold text-slate-700 whitespace-nowrap">
              {country.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {country.code.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
