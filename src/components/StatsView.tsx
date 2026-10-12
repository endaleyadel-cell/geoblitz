import React from 'react';
import { getStoredUserStats, getLevelInfo } from '../utils/leaderboard';
import { getFlagUrl } from '../data/countries';
import { Trophy, Flame, Zap, Shield, Target } from 'lucide-react';

interface StatsViewProps {
  onStartPlay: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ onStartPlay }) => {
  const stats = getStoredUserStats();
  const levelInfo = getLevelInfo(stats.xp);

  // Check achievements
  const achievements = [
    {
      id: 'first_run',
      title: 'First Flight',
      desc: 'Completed your first speedrun attempt',
      unlocked: stats.totalGames >= 1,
      icon: Zap,
    },
    {
      id: 'streak_5',
      title: 'Hot Hands',
      desc: 'Achieved a 5x combo streak without a miss',
      unlocked: stats.bestStreak >= 5,
      icon: Flame,
    },
    {
      id: 'streak_10',
      title: 'Dopamine Surge',
      desc: 'Blazed through a 10x combo streak',
      unlocked: stats.bestStreak >= 10,
      icon: Trophy,
    },
    {
      id: 'century',
      title: 'Global Scholar',
      desc: 'Accumulated 50+ total country identifications',
      unlocked: stats.totalGuesses >= 50,
      icon: Target,
    },
    {
      id: 'speed_demon',
      title: 'Speed Demon',
      desc: 'Scored over 1,500 points in any speedrun',
      unlocked: stats.highScore20s >= 1500 || stats.highScore30s >= 1500,
      icon: Shield,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 space-y-5">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)`,
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shadow-xs">
              <img
                src={getFlagUrl(stats.userCountryCode)}
                alt={stats.userCountryCode}
                className="w-10 h-7 object-cover rounded shadow-xs"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {stats.username}
                </h1>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                  Lv. {levelInfo.level}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5 font-medium">
                {levelInfo.title}
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="sm:w-64 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-medium">
              <span>Level Progress</span>
              <span className="text-slate-900 font-bold font-mono-numbers">{levelInfo.progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 font-mono text-right">
              {stats.xp} Total XP
            </div>
          </div>
        </div>
      </div>

      {/* Career Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 font-mono font-bold">Total Runs</div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900 mt-1">
            {stats.totalGames}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 font-mono font-bold">Countries Named</div>
          <div className="text-2xl font-bold font-mono-numbers text-emerald-600 mt-1">
            {stats.totalGuesses}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 font-mono font-bold">Best Combo Streak</div>
          <div className="text-2xl font-bold font-mono-numbers text-amber-500 mt-1">
            {stats.bestStreak}x
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 font-mono font-bold">High Score (30s)</div>
          <div className="text-2xl font-bold font-mono-numbers text-cyan-600 mt-1">
            {stats.highScore30s}
          </div>
        </div>
      </div>

      {/* Personal Records By Mode */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="text-xs text-slate-500 font-mono font-bold">Personal Records (PR)</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-400 font-mono font-medium">10s Blitz</div>
            <div className="text-lg font-bold font-mono-numbers text-slate-900 mt-0.5">
              {stats.highScore10s} pts
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-400 font-mono font-medium">20s Speedrun</div>
            <div className="text-lg font-bold font-mono-numbers text-slate-900 mt-0.5">
              {stats.highScore20s} pts
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-400 font-mono font-medium">30s Rush</div>
            <div className="text-lg font-bold font-mono-numbers text-slate-900 mt-0.5">
              {stats.highScore30s} pts
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-400 font-mono font-medium">Mania Mode</div>
            <div className="text-lg font-bold font-mono-numbers text-slate-900 mt-0.5">
              {stats.highScoreMania} pts
            </div>
          </div>
        </div>
      </div>

      {/* Achievements / Badges */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold">
          <span>Mastery Badges</span>
          <span>{achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {achievements.map(ach => {
            const Icon = ach.icon;
            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border flex items-center gap-3.5 transition-colors ${
                  ach.unlocked
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    ach.unlocked ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <div className={`text-xs font-bold truncate ${ach.unlocked ? 'text-slate-900' : 'text-slate-500'}`}>
                    {ach.title}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {ach.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Play CTA */}
      <div className="text-center pt-2">
        <button
          onClick={onStartPlay}
          className="py-3 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all cursor-pointer shadow-md shadow-emerald-600/20"
        >
          Jump Into Speedrun
        </button>
      </div>
    </div>
  );
};
