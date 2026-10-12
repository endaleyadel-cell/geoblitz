import React, { useState } from 'react';
import { Header, NavTab } from './components/Header';
import { BlitzGame, BlitzDuration } from './components/BlitzGame';
import { WorldMapQuiz } from './components/WorldMapQuiz';
import { ContinentMania } from './components/ContinentMania';
import { LeaderboardView } from './components/LeaderboardView';
import { StatsView } from './components/StatsView';
import { FlagRibbon } from './components/FlagRibbon';
import { LoadingScreen } from './components/LoadingScreen';
import { FlagCelebration } from './components/FlagCelebration';
import { sound } from './utils/audio';
import { getStoredUserStats } from './utils/leaderboard';

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTab>('blitz');
  const [blitzDuration, setBlitzDuration] = useState<BlitzDuration>(20);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted);
  const [bestStreak, setBestStreak] = useState<number>(() => getStoredUserStats().bestStreak);
  const [statsVersion, setStatsVersion] = useState<number>(0);

  const handleStatsUpdate = () => {
    setBestStreak(getStoredUserStats().bestStreak);
    setStatsVersion(prev => prev + 1);
  };

  const handleStartBlitzWithDuration = (duration: BlitzDuration) => {
    setBlitzDuration(duration);
    setActiveTab('blitz');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* Initial Loading Screen with Cycling World Flags */}
      {isLoading && (
        <LoadingScreen onFinished={() => setIsLoading(false)} />
      )}

      {/* Top Interactive Flag Ribbon */}
      <FlagRibbon />

      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        bestStreak={bestStreak}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(sound.isMuted)}
        onReplayLoading={() => setIsLoading(true)}
      />

      {/* Homepage Flag Animation & Celebration Banner */}
      {!isLoading && activeTab === 'blitz' && (
        <FlagCelebration onSelectTab={setActiveTab} />
      )}

      {/* Main Game Arena */}
      <main className="flex-1 flex flex-col justify-center py-3">
        {activeTab === 'blitz' && (
          <BlitzGame
            key="blitz"
            initialDuration={blitzDuration}
            initialType="flags"
            onOpenLeaderboard={() => setActiveTab('leaderboard')}
            onUpdateStats={handleStatsUpdate}
          />
        )}

        {activeTab === 'worldmap' && (
          <WorldMapQuiz
            key="worldmap"
            onOpenLeaderboard={() => setActiveTab('leaderboard')}
            onUpdateStats={handleStatsUpdate}
          />
        )}

        {activeTab === 'shapes' && (
          <BlitzGame
            key="shapes"
            initialDuration={blitzDuration}
            initialType="shapes"
            onOpenLeaderboard={() => setActiveTab('leaderboard')}
            onUpdateStats={handleStatsUpdate}
          />
        )}

        {activeTab === 'mania' && (
          <ContinentMania
            key="mania"
            onOpenLeaderboard={() => setActiveTab('leaderboard')}
            onUpdateStats={handleStatsUpdate}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            key={`leaderboard-${statsVersion}`}
            onStartBlitz={handleStartBlitzWithDuration}
            onUpdateStats={handleStatsUpdate}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            key={`stats-${statsVersion}`}
            onStartPlay={() => setActiveTab('blitz')}
          />
        )}
      </main>

      {/* Bottom Continuous World Flag Marquee Ribbon */}
      <FlagRibbon className="mt-auto" />

      {/* Minimal clean footer */}
      <footer className="py-3 px-6 bg-white border-t border-slate-200/80 text-center text-xs text-slate-500 font-mono flex flex-wrap items-center justify-center gap-3">
        <span>GeoBlitz · 195 Sovereign Nations</span>
        <span>·</span>
        <span>1:1 Natural Earth Projections</span>
        <span>·</span>
        <span>Instant Auto-Detection Engine</span>
      </footer>
    </div>
  );
}
