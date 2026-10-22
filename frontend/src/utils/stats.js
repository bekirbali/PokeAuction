// Centralized Rank, Streak, and Type Effectiveness Utility

export const RANKS = [
  { id: 'novice', name: 'Acemi Eğitmen', minRp: 0, maxRp: 100, color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-950/30' },
  { id: 'gym', name: 'Salon Meydan Okuyucusu', minRp: 101, maxRp: 250, color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-950/30' },
  { id: 'badge_master', name: 'Rozet Ustası', minRp: 251, maxRp: 500, color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-950/30' },
  { id: 'elite_four', name: 'Elit Dörtlü Adayı', minRp: 501, maxRp: 850, color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-950/30' },
  { id: 'champion', name: 'Kanto Şampiyonu', minRp: 851, maxRp: Infinity, color: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-950/30' }
];

export function getRankDetails(rp) {
  const currentRp = Math.max(0, rp || 0);
  const currentRank = RANKS.find(r => currentRp >= r.minRp && currentRp <= r.maxRp) || RANKS[0];
  const nextRank = RANKS[RANKS.indexOf(currentRank) + 1] || null;
  
  let progress = 100;
  if (nextRank) {
    const range = nextRank.minRp - currentRank.minRp;
    const gained = currentRp - currentRank.minRp;
    progress = Math.min(100, Math.max(0, Math.round((gained / range) * 100)));
  }

  return {
    ...currentRank,
    rp: currentRp,
    nextRank,
    progress
  };
}

export function getUserStats() {
  // Tek seferlik veri düzeltme (Migration):
  // Daha önce RoomManager broadcastRoom içinde isBotGame bayrağı istemciye iletilmediği için,
  // kullanıcının bot maçlarından kazandığı puanlar yanlışlıkla poke_pvp_* anahtarlarına yazılmıştı.
  // Eğer botRp 0 ve pvpRp > 0 ise, kullanıcının bot maçlarından kazandığı bu puanları bot ligine taşıyoruz.
  if (typeof window !== 'undefined' && localStorage.getItem('poke_bot_rp_migrated_v1') !== 'true') {
    const rawPvpRp = parseInt(localStorage.getItem('poke_pvp_rp') || '0', 10);
    const rawPvpStreak = parseInt(localStorage.getItem('poke_pvp_streak') || '0', 10);
    const rawPvpBest = parseInt(localStorage.getItem('poke_pvp_best_streak') || '0', 10);
    const rawBotRp = parseInt(localStorage.getItem('poke_bot_rp') || '0', 10);

    if (rawBotRp === 0 && rawPvpRp > 0) {
      localStorage.setItem('poke_bot_rp', rawPvpRp.toString());
      localStorage.setItem('poke_bot_streak', rawPvpStreak.toString());
      localStorage.setItem('poke_bot_best_streak', rawPvpBest.toString());
      localStorage.setItem('poke_pvp_rp', '0');
      localStorage.setItem('poke_pvp_streak', '0');
      localStorage.setItem('poke_pvp_best_streak', '0');
    }
    localStorage.setItem('poke_bot_rp_migrated_v1', 'true');
  }

  return {
    pvpRp: parseInt(localStorage.getItem('poke_pvp_rp') || '0', 10),
    pvpStreak: parseInt(localStorage.getItem('poke_pvp_streak') || '0', 10),
    pvpBestStreak: parseInt(localStorage.getItem('poke_pvp_best_streak') || '0', 10),
    botRp: parseInt(localStorage.getItem('poke_bot_rp') || '0', 10),
    botStreak: parseInt(localStorage.getItem('poke_bot_streak') || '0', 10),
    botBestStreak: parseInt(localStorage.getItem('poke_bot_best_streak') || '0', 10)
  };
}

export function updateStatsOnMatchEnd({ isWinner, isBot, botDifficulty }) {
  const stats = getUserStats();

  let rpChange = 0;
  let streakKey = isBot ? 'poke_bot_streak' : 'poke_pvp_streak';
  let bestStreakKey = isBot ? 'poke_bot_best_streak' : 'poke_pvp_best_streak';
  let rpKey = isBot ? 'poke_bot_rp' : 'poke_pvp_rp';

  let currentStreak = isBot ? stats.botStreak : stats.pvpStreak;
  let currentRp = isBot ? stats.botRp : stats.pvpRp;

  if (isWinner) {
    currentStreak += 1;
    const streakBonus = currentStreak >= 3 ? 1 : 0;

    if (isBot) {
      if (botDifficulty === 'hard') {
        rpChange = 5 + streakBonus;
      } else {
        // easy & medium bot give 0 rp
        rpChange = 0;
      }
    } else {
      // PvP win: +10 rp + streak bonus
      rpChange = 10 + streakBonus;
    }
  } else {
    // Loss resets streak
    currentStreak = 0;
    if (isBot) {
      if (botDifficulty === 'hard') {
        rpChange = -10;
      } else {
        rpChange = 0; // easy & medium losses don't penalize
      }
    } else {
      // PvP loss: -10 rp
      rpChange = -10;
    }
  }

  const bestStreak = Math.max(isBot ? stats.botBestStreak : stats.pvpBestStreak, currentStreak);
  const newRp = Math.max(0, currentRp + rpChange);

  localStorage.setItem(streakKey, currentStreak.toString());
  localStorage.setItem(bestStreakKey, bestStreak.toString());
  localStorage.setItem(rpKey, newRp.toString());

  return {
    isWinner,
    isBot,
    botDifficulty,
    currentStreak,
    bestStreak,
    rpChange,
    oldRp: currentRp,
    newRp,
    rank: getRankDetails(newRp)
  };
}

// 15 Kanto Elemental Matchups Chart
export const TYPE_CHART = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Steel: 2 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0 },
  Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Steel: 0.5 },
  Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Steel: 0.5 },
  Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2 },
  Dragon: { Dragon: 2, Steel: 0.5 }
};

export const ALL_TYPES = Object.keys(TYPE_CHART);
