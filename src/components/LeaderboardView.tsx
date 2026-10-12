import React, { useState } from 'react';
import { getLeaderboard, getStoredUserStats, saveUserStats } from '../utils/leaderboard';
import { getFlagUrl, COUNTRIES } from '../data/countries';
import { Trophy, Edit3, Check } from 'lucide-react';

interface LeaderboardViewProps {
  onStartBlitz: (duration: 10 | 20 | 30 | 60) => void;
  onUpdateStats: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  onStartBlitz,
  onUpdateStats,
}) => {
  const [activeMode, setActiveMode] = useState<'10s' | '20s' | '30s' | 'mania' | 'shapes' | 'flags'>('20s');
  const [stats, setStats] = useState(getStoredUserStats());
  const [isEditingUser, setIsEditingUser] = useState<boolean>(false);
  const [editUsername, setEditUsername] = useState<string>(stats.username);
  const [editCountryCode, setEditCountryCode] = useState<string>(stats.userCountryCode);

  const entries = getLeaderboard();

  // Filter entries for selected mode
  const filteredEntries = entries
    .filter(e => e.mode === activeMode)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...stats,
      username: editUsername.trim() || 'GeoChallenger',
      userCountryCode: editCountryCode,
    };
    saveUserStats(updated);
    setStats(updated);
    setIsEditingUser(false);
    onUpdateStats();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 space-y-5">
      {/* Header & Wordmark */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>Global Leaderboard</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Real-time standings across all competitive speedrun categories
          </p>
        </div>

        {/* Current Player Tag / Edit Profile */}
        <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
          <img
            src={getFlagUrl(stats.userCountryCode)}
            alt={stats.userCountryCode}
            className="w-5 h-3.5 object-cover rounded shadow-xs border border-slate-200"
          />
          <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
            {stats.username}
          </div>
          <button
            onClick={() => setIsEditingUser(!isEditingUser)}
            className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            title="Edit player handle & nationality"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Edit Profile Panel */}
      {isEditingUser && (
        <form onSubmit={handleSaveProfile} className="bg-white p-4 rounded-2xl border border-emerald-300 shadow-sm flex flex-wrap items-center gap-3 animate-fade-in">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] text-slate-500 font-mono font-bold mb-1">Player Handle</label>
            <input
              type="text"
              value={editUsername}
              onChange={e => setEditUsername(e.target.value)}
              maxLength={20}
              className="w-full px-3 py-1.5 bg-slate-50 text-slate-900 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-500"
              placeholder="Your username..."
            />
          </div>
          <div className="w-44">
            <label className="block text-[11px] text-slate-500 font-mono font-bold mb-1">Your Country Flag</label>
            <select
              value={editCountryCode}
              onChange={e => setEditCountryCode(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 text-slate-900 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {COUNTRIES.map(c => (
                <option key={c.id} value={c.code}>
                  {c.name} ({c.code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
          <div className="self-end pt-5">
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </form>
      )}

      {/* Mode Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveMode('10s')}
          className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeMode === '10s' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          10s Blitz
        </button>
        <button
          onClick={() => setActiveMode('20s')}
          className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeMode === '20s' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          20s Speedrun
        </button>
        <button
          onClick={() => setActiveMode('30s')}
          className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeMode === '30s' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          30s Rush
        </button>
        <button
          onClick={() => setActiveMode('shapes')}
          className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeMode === 'shapes' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          1:1 Shapes
        </button>
        <button
          onClick={() => setActiveMode('flags')}
          className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeMode === 'flags' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Flags Only
        </button>
        <button
          onClick={() => setActiveMode('mania')}
          className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeMode === 'mania' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Continent Mania
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-3 border-b border-slate-200 bg-slate-50 text-xs font-mono text-slate-500 uppercase font-bold tracking-wider">
          <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
          <div className="col-span-5 sm:col-span-4">Player</div>
          <div className="hidden sm:block sm:col-span-3 text-center">Region</div>
          <div className="col-span-2 sm:col-span-2 text-center">Accuracy</div>
          <div className="col-span-3 sm:col-span-2 text-right">Score</div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredEntries.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-mono">
              No entries recorded in this category yet. Be the first to claim #1!
            </div>
          ) : (
            filteredEntries.map((entry, index) => {
              const rank = index + 1;
              const isUser = entry.isUser || entry.username === stats.username;

              return (
                <div
                  key={entry.id || index}
                  className={`grid grid-cols-12 items-center px-4 py-3 transition-colors ${
                    isUser
                      ? 'bg-emerald-50/80 hover:bg-emerald-50'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  {/* Rank Column */}
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-center font-mono-numbers">
                    {rank === 1 ? (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs border border-amber-200">
                        1
                      </span>
                    ) : rank === 2 ? (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs">
                        2
                      </span>
                    ) : rank === 3 ? (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
                        3
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-xs font-semibold">{rank}</span>
                    )}
                  </div>

                  {/* Player Details */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5 overflow-hidden">
                    <img
                      src={getFlagUrl(entry.userCountryCode)}
                      alt={entry.userCountryCode}
                      className="w-5 h-3.5 object-cover rounded shadow-xs border border-slate-200 shrink-0"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-semibold truncate ${isUser ? 'text-emerald-800 font-bold' : 'text-slate-900'}`}>
                          {entry.username}
                        </span>
                        {isUser && (
                          <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100 px-1 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        {entry.timeAgo}
                      </div>
                    </div>
                  </div>

                  {/* Region */}
                  <div className="hidden sm:flex sm:col-span-3 items-center justify-center text-xs text-slate-500 font-mono">
                    {entry.continent}
                  </div>

                  {/* Accuracy */}
                  <div className="col-span-2 sm:col-span-2 text-center text-xs font-mono-numbers text-slate-600 font-medium">
                    {entry.accuracy}%
                  </div>

                  {/* Score */}
                  <div className="col-span-3 sm:col-span-2 text-right">
                    <span className="text-sm font-bold font-mono-numbers tracking-tight text-slate-900">
                      {entry.score}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      {entry.guesses} guessed
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Quick Play Strip */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="text-sm font-bold text-slate-900">Ready to beat the record?</div>
          <div className="text-xs text-slate-500">Launch directly into a speedrun attempt.</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartBlitz(10)}
            className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            10s
          </button>
          <button
            onClick={() => onStartBlitz(20)}
            className="px-3 py-1.5 text-xs font-mono rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer shadow-xs"
          >
            20s
          </button>
          <button
            onClick={() => onStartBlitz(30)}
            className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            30s
          </button>
        </div>
      </div>
    </div>
  );
};
