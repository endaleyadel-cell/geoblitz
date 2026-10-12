import React from 'react';
import { COUNTRIES, getFlagUrl } from '../data/countries';
import { Sparkles, Globe2, ArrowRight } from 'lucide-react';

interface FlagCelebrationProps {
  onSelectTab?: (tab: 'mania' | 'worldmap') => void;
}

export const FlagCelebration: React.FC<FlagCelebrationProps> = ({ onSelectTab }) => {
  const showcaseFlags = React.useMemo(() => {
    const codes = ['us', 'br', 'fr', 'jp', 'za', 'au', 'ca', 'de', 'eg', 'in', 'kr', 'mx', 'it', 'es', 'ar', 'gb'];
    return codes.map(code => COUNTRIES.find(c => c.code === code)).filter(Boolean);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/80 p-4 sm:p-5 shadow-sm">
        {/* Subtle decorative dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #059669 1px, transparent 0)`,
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>All 195 Sovereign Nations Loaded</span>
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Name every country on Europe, Africa, Asia, or Americas on interactive 1:1 maps.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSelectTab && (
              <button
                onClick={() => onSelectTab('mania')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Continent Map Rush</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Animated Flag Showcase Strip */}
            <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto py-1 max-w-xs">
              {showcaseFlags.slice(0, 8).map(country => country && (
                <div
                  key={country.code}
                  className="group relative flex flex-col items-center shrink-0 transition-transform hover:-translate-y-1 duration-200 cursor-pointer"
                  title={`${country.name} · ${country.continent}`}
                >
                  <div className="p-0.5 rounded-md bg-white border border-slate-200 shadow-xs">
                    <img
                      src={getFlagUrl(country.code)}
                      alt={country.name}
                      className="w-6 h-4 object-cover rounded-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
