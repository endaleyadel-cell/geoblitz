export interface LeaderboardEntry {
  id: string;
  rank?: number;
  username: string;
  userCountryCode: string; // 2-letter ISO flag
  score: number;
  guesses: number;
  accuracy: number; // percentage
  mode: '10s' | '20s' | '30s' | 'mania' | 'shapes' | 'flags';
  continent: string;
  timeAgo: string;
  isUser?: boolean;
  date: number;
}

export interface UserStats {
  username: string;
  userCountryCode: string;
  totalGames: number;
  totalGuesses: number;
  bestStreak: number;
  highScore10s: number;
  highScore20s: number;
  highScore30s: number;
  highScoreMania: number;
  xp: number;
}

const DEFAULT_GLOBAL_LEADERBOARD: LeaderboardEntry[] = [
  // 10s Blitz Top Players
  { id: 'gb-1', username: 'GeoSniper_JP', userCountryCode: 'jp', score: 980, guesses: 8, accuracy: 100, mode: '10s', continent: 'All World', timeAgo: '4m ago', date: Date.now() - 240000 },
  { id: 'gb-2', username: 'AtlasDrift', userCountryCode: 'us', score: 860, guesses: 7, accuracy: 100, mode: '10s', continent: 'All World', timeAgo: '18m ago', date: Date.now() - 1080000 },
  { id: 'gb-3', username: 'SpeedMap_FR', userCountryCode: 'fr', score: 790, guesses: 7, accuracy: 88, mode: '10s', continent: 'Europe', timeAgo: '1h ago', date: Date.now() - 3600000 },
  { id: 'gb-4', username: 'NordicRunner', userCountryCode: 'no', score: 720, guesses: 6, accuracy: 100, mode: '10s', continent: 'All World', timeAgo: '2h ago', date: Date.now() - 7200000 },
  { id: 'gb-5', username: 'Sovereign_DE', userCountryCode: 'de', score: 650, guesses: 5, accuracy: 100, mode: '10s', continent: 'Europe', timeAgo: '5h ago', date: Date.now() - 18000000 },

  // 20s Speedrun
  { id: 'gb-6', username: 'QuickCarto', userCountryCode: 'ca', score: 2150, guesses: 16, accuracy: 94, mode: '20s', continent: 'All World', timeAgo: '12m ago', date: Date.now() - 720000 },
  { id: 'gb-7', username: 'AeroFlag_BR', userCountryCode: 'br', score: 1980, guesses: 15, accuracy: 100, mode: '20s', continent: 'South America', timeAgo: '35m ago', date: Date.now() - 2100000 },
  { id: 'gb-8', username: 'BorderFlick', userCountryCode: 'kr', score: 1840, guesses: 14, accuracy: 93, mode: '20s', continent: 'Asia', timeAgo: '3h ago', date: Date.now() - 10800000 },
  { id: 'gb-9', username: 'HyperGeo_AU', userCountryCode: 'au', score: 1710, guesses: 13, accuracy: 100, mode: '20s', continent: 'All World', timeAgo: '7h ago', date: Date.now() - 25200000 },

  // 30s Rush
  { id: 'gb-10', username: 'Vortex_World', userCountryCode: 'us', score: 3840, guesses: 27, accuracy: 96, mode: '30s', continent: 'All World', timeAgo: '2m ago', date: Date.now() - 120000 },
  { id: 'gb-11', username: 'FlagSensei', userCountryCode: 'jp', score: 3620, guesses: 25, accuracy: 100, mode: '30s', continent: 'All World', timeAgo: '42m ago', date: Date.now() - 2520000 },
  { id: 'gb-12', username: 'EuroSpeed_ES', userCountryCode: 'es', score: 3310, guesses: 23, accuracy: 96, mode: '30s', continent: 'Europe', timeAgo: '1h ago', date: Date.now() - 3600000 },
  { id: 'gb-13', username: 'SaharaSprint', userCountryCode: 'eg', score: 2980, guesses: 21, accuracy: 95, mode: '30s', continent: 'Africa', timeAgo: '4h ago', date: Date.now() - 14400000 },
  { id: 'gb-14', username: 'ZenithGeog', userCountryCode: 'gb', score: 2850, guesses: 20, accuracy: 100, mode: '30s', continent: 'All World', timeAgo: '8h ago', date: Date.now() - 28800000 },

  // Continent / World Mania
  { id: 'gb-15', username: 'OmniAtlas', userCountryCode: 'de', score: 4800, guesses: 42, accuracy: 100, mode: 'mania', continent: 'Europe', timeAgo: '20m ago', date: Date.now() - 1200000 },
  { id: 'gb-16', username: 'GlobeMaster_US', userCountryCode: 'us', score: 4500, guesses: 38, accuracy: 97, mode: 'mania', continent: 'All World', timeAgo: '1h ago', date: Date.now() - 3600000 },
  { id: 'gb-17', username: 'BalkanAce', userCountryCode: 'hr', score: 3900, guesses: 34, accuracy: 100, mode: 'mania', continent: 'Europe', timeAgo: '6h ago', date: Date.now() - 21600000 },

  // Shapes Only
  { id: 'gb-18', username: 'SilhouetteGod', userCountryCode: 'se', score: 2420, guesses: 18, accuracy: 100, mode: 'shapes', continent: 'All World', timeAgo: '15m ago', date: Date.now() - 900000 },
  { id: 'gb-19', username: 'OutlineHunter', userCountryCode: 'it', score: 2190, guesses: 16, accuracy: 94, mode: 'shapes', continent: 'Europe', timeAgo: '2h ago', date: Date.now() - 7200000 },

  // Flags Only
  { id: 'gb-20', username: 'VexillologyHero', userCountryCode: 'ch', score: 3120, guesses: 24, accuracy: 100, mode: 'flags', continent: 'All World', timeAgo: '8m ago', date: Date.now() - 480000 },
];

const STORAGE_KEY_LEADERBOARD = 'geoblitz_global_leaderboard';
const STORAGE_KEY_STATS = 'geoblitz_user_stats';

export function getStoredUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }

  return {
    username: 'GeoChallenger',
    userCountryCode: 'us',
    totalGames: 0,
    totalGuesses: 0,
    bestStreak: 0,
    highScore10s: 0,
    highScore20s: 0,
    highScore30s: 0,
    highScoreMania: 0,
    xp: 0,
  };
}

export function saveUserStats(stats: UserStats) {
  try {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  // Seed initial
  localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(DEFAULT_GLOBAL_LEADERBOARD));
  return DEFAULT_GLOBAL_LEADERBOARD;
}

export function recordScore(
  username: string,
  userCountryCode: string,
  score: number,
  guesses: number,
  accuracy: number,
  mode: '10s' | '20s' | '30s' | 'mania' | 'shapes' | 'flags',
  continent: string,
  streak: number
): { rank: number; isHighScore: boolean } {
  const current = getLeaderboard();
  const stats = getStoredUserStats();

  const newEntry: LeaderboardEntry = {
    id: 'user-' + Date.now(),
    username: username || stats.username,
    userCountryCode: userCountryCode || stats.userCountryCode,
    score,
    guesses,
    accuracy,
    mode,
    continent,
    timeAgo: 'Just now',
    isUser: true,
    date: Date.now(),
  };

  const updated = [newEntry, ...current];
  localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(updated));

  // Update stats
  let isHighScore = false;
  stats.totalGames += 1;
  stats.totalGuesses += guesses;
  stats.bestStreak = Math.max(stats.bestStreak, streak);
  stats.xp += Math.round(score * 0.2) + guesses * 10;

  if (mode === '10s' && score > stats.highScore10s) {
    stats.highScore10s = score;
    isHighScore = true;
  } else if (mode === '20s' && score > stats.highScore20s) {
    stats.highScore20s = score;
    isHighScore = true;
  } else if (mode === '30s' && score > stats.highScore30s) {
    stats.highScore30s = score;
    isHighScore = true;
  } else if (mode === 'mania' && score > stats.highScoreMania) {
    stats.highScoreMania = score;
    isHighScore = true;
  }

  saveUserStats(stats);

  // Compute rank in this mode
  const modeEntries = updated
    .filter(e => e.mode === mode)
    .sort((a, b) => b.score - a.score);

  const rank = modeEntries.findIndex(e => e.id === newEntry.id) + 1;

  return { rank: rank > 0 ? rank : 1, isHighScore };
}

// User XP Level Calculator
export function getLevelInfo(xp: number): { level: number; title: string; progress: number; xpForNext: number } {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const currentLevelBaseXp = Math.pow(level - 1, 2) * 100;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const range = nextLevelXp - currentLevelBaseXp;
  const progress = Math.min(100, Math.max(0, Math.round(((xp - currentLevelBaseXp) / range) * 100)));

  let title = 'Map Explorer';
  if (level >= 50) title = 'Apex Geo-Grandmaster';
  else if (level >= 35) title = 'Sovereignty Legend';
  else if (level >= 25) title = 'Continental Conqueror';
  else if (level >= 15) title = 'Border Speedster';
  else if (level >= 8) title = 'Senior Cartographer';
  else if (level >= 4) title = 'Flag Prodigy';

  return {
    level,
    title,
    progress,
    xpForNext: nextLevelXp - xp,
  };
}
