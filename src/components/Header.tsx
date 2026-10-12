import React from 'react';
import { Volume2, VolumeX, Flame, Globe2, Compass } from 'lucide-react';
import { sound } from '../utils/audio';

export type NavTab = 'blitz' | 'worldmap' | 'shapes' | 'mania' | 'leaderboard' | 'stats';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  bestStreak: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onReplayLoading: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  bestStreak,
  isMuted,
  onToggleMute,
  onReplayLoading,
}) => {
  return (
    <header className="flex items-center justify-between gap-6 px-6 py-3.5 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      {/* Zone 1: Single text element wordmark */}
      <button
        onClick={() => onSelectTab('blitz')}
        className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 hover:text-emerald-600 transition-colors whitespace-nowrap shrink-0 group text-left cursor-pointer"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
        <span>GeoBlitz</span>
        <span className="text-xs font-mono text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 ml-1">
          195 Nations
        </span>
      </button>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
        <button
          onClick={() => onSelectTab('blitz')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'blitz' ? 'text-emerald-600 font-bold border-b-2 border-emerald-500 pb-0.5' : ''
          }`}
        >
          Speed Blitz
        </button>
        <button
          onClick={() => onSelectTab('worldmap')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'worldmap' ? 'text-emerald-600 font-bold border-b-2 border-emerald-500 pb-0.5' : ''
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>1:1 World Map</span>
        </button>
        <button
          onClick={() => onSelectTab('shapes')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'shapes' ? 'text-emerald-600 font-bold border-b-2 border-emerald-500 pb-0.5' : ''
          }`}
        >
          Silhouette Shapes
        </button>
        <button
          onClick={() => onSelectTab('mania')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'mania' ? 'text-emerald-600 font-bold border-b-2 border-emerald-500 pb-0.5' : ''
          }`}
        >
          <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Continent Map Rush</span>
        </button>
        <button
          onClick={() => onSelectTab('leaderboard')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'leaderboard' ? 'text-emerald-600 font-bold border-b-2 border-emerald-500 pb-0.5' : ''
          }`}
        >
          Leaderboard
        </button>
        <button
          onClick={() => onSelectTab('stats')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'stats' ? 'text-emerald-600 font-bold border-b-2 border-emerald-500 pb-0.5' : ''
          }`}
        >
          Profile
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2.5 shrink-0">
        {bestStreak > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-700 font-mono-numbers px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-bold">Best: {bestStreak}</span>
          </div>
        )}

        <button
          onClick={onReplayLoading}
          title="Replay intro flags animation"
          className="p-2 text-slate-500 hover:text-slate-800 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
        >
          <Globe2 className="w-4 h-4 text-emerald-600" />
        </button>

        <button
          onClick={() => {
            sound.toggleMute();
            onToggleMute();
          }}
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
        </button>
      </div>
    </header>
  );
};
