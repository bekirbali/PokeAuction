// Gen 1 (151 Pokemon) Evolution Families Mapping
// Maps each Pokemon ID to its evolution family, stage (1 = base, 2 = 1st evo, 3 = 2nd evo), and whether it's final
export const EVOLUTION_FAMILIES = {
  // 1-3 Bulbasaur line
  1: { family: 'bulbasaur', stage: 1, isFinal: false },
  2: { family: 'bulbasaur', stage: 2, isFinal: false },
  3: { family: 'bulbasaur', stage: 3, isFinal: true },
  // 4-6 Charmander line
  4: { family: 'charmander', stage: 1, isFinal: false },
  5: { family: 'charmander', stage: 2, isFinal: false },
  6: { family: 'charmander', stage: 3, isFinal: true },
  // 7-9 Squirtle line
  7: { family: 'squirtle', stage: 1, isFinal: false },
  8: { family: 'squirtle', stage: 2, isFinal: false },
  9: { family: 'squirtle', stage: 3, isFinal: true },
  // 10-12 Caterpie line
  10: { family: 'caterpie', stage: 1, isFinal: false },
  11: { family: 'caterpie', stage: 2, isFinal: false },
  12: { family: 'caterpie', stage: 3, isFinal: true },
  // 13-15 Weedle line
  13: { family: 'weedle', stage: 1, isFinal: false },
  14: { family: 'weedle', stage: 2, isFinal: false },
  15: { family: 'weedle', stage: 3, isFinal: true },
  // 16-18 Pidgey line
  16: { family: 'pidgey', stage: 1, isFinal: false },
  17: { family: 'pidgey', stage: 2, isFinal: false },
  18: { family: 'pidgey', stage: 3, isFinal: true },
  // 19-20 Rattata line
  19: { family: 'rattata', stage: 1, isFinal: false },
  20: { family: 'rattata', stage: 2, isFinal: true },
  // 21-22 Spearow line
  21: { family: 'spearow', stage: 1, isFinal: false },
  22: { family: 'spearow', stage: 2, isFinal: true },
  // 23-24 Ekans line
  23: { family: 'ekans', stage: 1, isFinal: false },
  24: { family: 'ekans', stage: 2, isFinal: true },
  // 25-26 Pikachu line
  25: { family: 'pikachu', stage: 1, isFinal: false },
  26: { family: 'pikachu', stage: 2, isFinal: true },
  // 27-28 Sandshrew line
  27: { family: 'sandshrew', stage: 1, isFinal: false },
  28: { family: 'sandshrew', stage: 2, isFinal: true },
  // 29-31 Nidoran F line
  29: { family: 'nidoran_f', stage: 1, isFinal: false },
  30: { family: 'nidoran_f', stage: 2, isFinal: false },
  31: { family: 'nidoran_f', stage: 3, isFinal: true },
  // 32-34 Nidoran M line
  32: { family: 'nidoran_m', stage: 1, isFinal: false },
  33: { family: 'nidoran_m', stage: 2, isFinal: false },
  34: { family: 'nidoran_m', stage: 3, isFinal: true },
  // 35-36 Clefairy line
  35: { family: 'clefairy', stage: 1, isFinal: false },
  36: { family: 'clefairy', stage: 2, isFinal: true },
  // 37-38 Vulpix line
  37: { family: 'vulpix', stage: 1, isFinal: false },
  38: { family: 'vulpix', stage: 2, isFinal: true },
  // 39-40 Jigglypuff line
  39: { family: 'jigglypuff', stage: 1, isFinal: false },
  40: { family: 'jigglypuff', stage: 2, isFinal: true },
  // 41-42 Zubat line
  41: { family: 'zubat', stage: 1, isFinal: false },
  42: { family: 'zubat', stage: 2, isFinal: true },
  // 43-45 Oddish line
  43: { family: 'oddish', stage: 1, isFinal: false },
  44: { family: 'oddish', stage: 2, isFinal: false },
  45: { family: 'oddish', stage: 3, isFinal: true },
  // 46-47 Paras line
  46: { family: 'paras', stage: 1, isFinal: false },
  47: { family: 'paras', stage: 2, isFinal: true },
  // 48-49 Venonat line
  48: { family: 'venonat', stage: 1, isFinal: false },
  49: { family: 'venonat', stage: 2, isFinal: true },
  // 50-51 Diglett line
  50: { family: 'diglett', stage: 1, isFinal: false },
  51: { family: 'diglett', stage: 2, isFinal: true },
  // 52-53 Meowth line
  52: { family: 'meowth', stage: 1, isFinal: false },
  53: { family: 'meowth', stage: 2, isFinal: true },
  // 54-55 Psyduck line
  54: { family: 'psyduck', stage: 1, isFinal: false },
  55: { family: 'psyduck', stage: 2, isFinal: true },
  // 56-57 Mankey line
  56: { family: 'mankey', stage: 1, isFinal: false },
  57: { family: 'mankey', stage: 2, isFinal: true },
  // 58-59 Growlithe line
  58: { family: 'growlithe', stage: 1, isFinal: false },
  59: { family: 'growlithe', stage: 2, isFinal: true },
  // 60-62 Poliwag line
  60: { family: 'poliwag', stage: 1, isFinal: false },
  61: { family: 'poliwag', stage: 2, isFinal: false },
  62: { family: 'poliwag', stage: 3, isFinal: true },
  // 63-65 Abra line
  63: { family: 'abra', stage: 1, isFinal: false },
  64: { family: 'abra', stage: 2, isFinal: false },
  65: { family: 'abra', stage: 3, isFinal: true },
  // 66-68 Machop line
  66: { family: 'machop', stage: 1, isFinal: false },
  67: { family: 'machop', stage: 2, isFinal: false },
  68: { family: 'machop', stage: 3, isFinal: true },
  // 69-71 Bellsprout line
  69: { family: 'bellsprout', stage: 1, isFinal: false },
  70: { family: 'bellsprout', stage: 2, isFinal: false },
  71: { family: 'bellsprout', stage: 3, isFinal: true },
  // 72-73 Tentacool line
  72: { family: 'tentacool', stage: 1, isFinal: false },
  73: { family: 'tentacool', stage: 2, isFinal: true },
  // 74-76 Geodude line
  74: { family: 'geodude', stage: 1, isFinal: false },
  75: { family: 'geodude', stage: 2, isFinal: false },
  76: { family: 'geodude', stage: 3, isFinal: true },
  // 77-78 Ponyta line
  77: { family: 'ponyta', stage: 1, isFinal: false },
  78: { family: 'ponyta', stage: 2, isFinal: true },
  // 79-80 Slowpoke line
  79: { family: 'slowpoke', stage: 1, isFinal: false },
  80: { family: 'slowpoke', stage: 2, isFinal: true },
  // 81-82 Magnemite line
  81: { family: 'magnemite', stage: 1, isFinal: false },
  82: { family: 'magnemite', stage: 2, isFinal: true },
  // 83 Farfetch'd
  83: { family: 'farfetchd', stage: 1, isFinal: true },
  // 84-85 Doduo line
  84: { family: 'doduo', stage: 1, isFinal: false },
  85: { family: 'doduo', stage: 2, isFinal: true },
  // 86-87 Seel line
  86: { family: 'seel', stage: 1, isFinal: false },
  87: { family: 'seel', stage: 2, isFinal: true },
  // 88-89 Grimer line
  88: { family: 'grimer', stage: 1, isFinal: false },
  89: { family: 'grimer', stage: 2, isFinal: true },
  // 90-91 Shellder line
  90: { family: 'shellder', stage: 1, isFinal: false },
  91: { family: 'shellder', stage: 2, isFinal: true },
  // 92-94 Gastly line
  92: { family: 'gastly', stage: 1, isFinal: false },
  93: { family: 'gastly', stage: 2, isFinal: false },
  94: { family: 'gastly', stage: 3, isFinal: true },
  // 95 Onix
  95: { family: 'onix', stage: 1, isFinal: true },
  // 96-97 Drowzee line
  96: { family: 'drowzee', stage: 1, isFinal: false },
  97: { family: 'drowzee', stage: 2, isFinal: true },
  // 98-99 Krabby line
  98: { family: 'krabby', stage: 1, isFinal: false },
  99: { family: 'krabby', stage: 2, isFinal: true },
  // 100-101 Voltorb line
  100: { family: 'voltorb', stage: 1, isFinal: false },
  101: { family: 'voltorb', stage: 2, isFinal: true },
  // 102-103 Exeggcute line
  102: { family: 'exeggcute', stage: 1, isFinal: false },
  103: { family: 'exeggcute', stage: 2, isFinal: true },
  // 104-105 Cubone line
  104: { family: 'cubone', stage: 1, isFinal: false },
  105: { family: 'cubone', stage: 2, isFinal: true },
  // 106-107 Hitmons
  106: { family: 'hitmonlee', stage: 1, isFinal: true },
  107: { family: 'hitmonchan', stage: 1, isFinal: true },
  // 108 Lickitung
  108: { family: 'lickitung', stage: 1, isFinal: true },
  // 109-110 Koffing line
  109: { family: 'koffing', stage: 1, isFinal: false },
  110: { family: 'koffing', stage: 2, isFinal: true },
  // 111-112 Rhyhorn line
  111: { family: 'rhyhorn', stage: 1, isFinal: false },
  112: { family: 'rhyhorn', stage: 2, isFinal: true },
  // 113 Chansey
  113: { family: 'chansey', stage: 1, isFinal: true },
  // 114 Tangela
  114: { family: 'tangela', stage: 1, isFinal: true },
  // 115 Kangaskhan
  115: { family: 'kangaskhan', stage: 1, isFinal: true },
  // 116-117 Horsea line
  116: { family: 'horsea', stage: 1, isFinal: false },
  117: { family: 'horsea', stage: 2, isFinal: true },
  // 118-119 Goldeen line
  118: { family: 'goldeen', stage: 1, isFinal: false },
  119: { family: 'goldeen', stage: 2, isFinal: true },
  // 120-121 Staryu line
  120: { family: 'staryu', stage: 1, isFinal: false },
  121: { family: 'staryu', stage: 2, isFinal: true },
  // 122 Mr. Mime
  122: { family: 'mrmime', stage: 1, isFinal: true },
  // 123 Scyther
  123: { family: 'scyther', stage: 1, isFinal: true },
  // 124 Jynx
  124: { family: 'jynx', stage: 1, isFinal: true },
  // 125 Electabuzz
  125: { family: 'electabuzz', stage: 1, isFinal: true },
  // 126 Magmar
  126: { family: 'magmar', stage: 1, isFinal: true },
  // 127 Pinsir
  127: { family: 'pinsir', stage: 1, isFinal: true },
  // 128 Tauros
  128: { family: 'tauros', stage: 1, isFinal: true },
  // 129-130 Magikarp line
  129: { family: 'magikarp', stage: 1, isFinal: false },
  130: { family: 'magikarp', stage: 2, isFinal: true },
  // 131 Lapras
  131: { family: 'lapras', stage: 1, isFinal: true },
  // 132 Ditto
  132: { family: 'ditto', stage: 1, isFinal: true },
  // 133-136 Eevee family
  133: { family: 'eevee', stage: 1, isFinal: false },
  134: { family: 'eevee', stage: 2, isFinal: true }, // Vaporeon
  135: { family: 'eevee', stage: 2, isFinal: true }, // Jolteon
  136: { family: 'eevee', stage: 2, isFinal: true }, // Flareon
  // 137 Porygon
  137: { family: 'porygon', stage: 1, isFinal: true },
  // 138-139 Omanyte line
  138: { family: 'omanyte', stage: 1, isFinal: false },
  139: { family: 'omanyte', stage: 2, isFinal: true },
  // 140-141 Kabuto line
  140: { family: 'kabuto', stage: 1, isFinal: false },
  141: { family: 'kabuto', stage: 2, isFinal: true },
  // 142 Aerodactyl
  142: { family: 'aerodactyl', stage: 1, isFinal: true },
  // 143 Snorlax
  143: { family: 'snorlax', stage: 1, isFinal: true },
  // 144 Articuno
  144: { family: 'articuno', stage: 1, isFinal: true },
  // 145 Zapdos
  145: { family: 'zapdos', stage: 1, isFinal: true },
  // 146 Moltres
  146: { family: 'moltres', stage: 1, isFinal: true },
  // 147-149 Dratini line
  147: { family: 'dratini', stage: 1, isFinal: false },
  148: { family: 'dratini', stage: 2, isFinal: false },
  149: { family: 'dratini', stage: 3, isFinal: true },
  // 150 Mewtwo
  150: { family: 'mewtwo', stage: 1, isFinal: true },
  // 151 Mew
  151: { family: 'mew', stage: 1, isFinal: true }
};

export class BotAI {
  static getDifficultyConfig(difficulty = 'medium') {
    switch (difficulty) {
      case 'easy':
        return {
          name: 'Brock (Çaylak)',
          valMult: 0.85,
          bluffChance: 0.05,
          minDelay: 1500,
          maxDelay: 2400
        };
      case 'hard':
        return {
          name: 'Red (Şampiyon)',
          valMult: 1.25,
          bluffChance: 0.30,
          minDelay: 800,
          maxDelay: 1500
        };
      case 'medium':
      default:
        return {
          name: 'Gary (Kurnaz)',
          valMult: 1.0,
          bluffChance: 0.20,
          minDelay: 1200,
          maxDelay: 2000
        };
    }
  }

  static getRandomDelay(difficulty = 'medium') {
    const config = this.getDifficultyConfig(difficulty);
    return Math.floor(Math.random() * (config.maxDelay - config.minDelay + 1)) + config.minDelay;
  }

  /**
   * Deep valuation of a Pokemon taking into account:
   * 1. Redundant evolutions (e.g. if bot already has Charizard, Charmander/Charmeleon has 0 value)
   * 2. Exact duplicate prevention
   * 3. Monotype stacking penalties vs diverse type bonuses
   * 4. BST (Base Stat Total) and Competitive Tier
   * 5. Budget per remaining slot
   */
  static calculatePerceivedValue(pokemon, botPlayer = null, difficulty = 'medium', room = null) {
    if (!pokemon) return 1;
    const config = this.getDifficultyConfig(difficulty);

    // --- 1. DUPLICATE & EVOLUTION FAMILY REDUNDANCY CHECK ---
    if (botPlayer && Array.isArray(botPlayer.team) && botPlayer.team.length > 0) {
      const currentFam = EVOLUTION_FAMILIES[pokemon.id];
      const currentStage = currentFam?.stage || 1;
      const currentFamily = currentFam?.family || pokemon.slug;

      for (const member of botPlayer.team) {
        // Exact duplicate: strictly 0 value
        if (member.id === pokemon.id) {
          return 0;
        }

        const memberFam = EVOLUTION_FAMILIES[member.id];
        const memberFamily = memberFam?.family || member.slug;
        const memberStage = memberFam?.stage || 1;

        if (currentFamily && memberFamily === currentFamily) {
          // If bot already has a higher or equal evolution stage:
          // E.g. bot has Charizard (stage 3) and Charmander (stage 1) appears:
          // Perceived value is strictly 0!
          if (memberStage >= currentStage) {
            return 0;
          }

          // If bot has lower stage (e.g. Charmander) and higher appears (Charizard):
          // Charizard is an upgrade, but having two members of the same family consumes 2/5 of team slots
          if (difficulty === 'hard') {
            if (pokemon.tier !== 'Legendary' && pokemon.tier !== 'Epic') {
              return 0;
            }
          }
        }
      }
    }

    // --- 2. HARD REJECTION OF MEME TIER / TROLL POKEMON ---
    if (pokemon.tier === 'Meme' || pokemon.id === 129 || (difficulty === 'hard' && (pokemon.totalStats || 400) < 280)) {
      return 0;
    }

    // --- 2.5 SPECIAL JOKER CARD: DITTO (#132) ---
    if (pokemon.id === 132 || pokemon.slug === 'ditto') {
      // Ditto is a wildcard shapeshifter that clones the opponent's strongest Pokemon!
      return difficulty === 'hard' ? 4 : difficulty === 'medium' ? 3 : 2;
    }

    // --- 3. BASE VALUE BY TIER ---
    let baseVal = 2;
    switch (pokemon.tier) {
      case 'Meme':
        baseVal = 0;
        break;
      case 'Common':
        baseVal = 2;
        break;
      case 'Rare':
        baseVal = 3;
        break;
      case 'Epic':
        baseVal = 5;
        break;
      case 'Legendary':
        baseVal = 8;
        break;
      default:
        baseVal = 2;
    }

    // --- 3. STAT BONUS (BST) ---
    const bst = pokemon.totalStats || 400;
    const statBonus = Math.round((bst - 320) / 75);
    baseVal += statBonus;

    // --- 4. TEAM SYNERGY & TYPE BALANCE ---
    if (botPlayer && Array.isArray(botPlayer.team) && botPlayer.team.length > 0) {
      const teamTypes = {};
      botPlayer.team.forEach(m => {
        (m.types || []).forEach(t => {
          teamTypes[t] = (teamTypes[t] || 0) + 1;
        });
      });

      let overlapPenalty = 0;
      let diversityBonus = 0;

      (pokemon.types || []).forEach(t => {
        const count = teamTypes[t] || 0;
        if (count >= 2) {
          overlapPenalty += (difficulty === 'hard' ? 3 : 2); // 3rd Pokemon of same type is heavily penalized
        } else if (count === 1) {
          overlapPenalty += (difficulty === 'hard' ? 1.5 : 1);
        } else {
          // Team doesn't have this type yet! Reward diversity
          diversityBonus += (difficulty === 'hard' ? 1 : 0.5);
        }
      });

      baseVal = baseVal - overlapPenalty + diversityBonus;
    }

    // --- 5. BUDGET & REMAINING SLOTS SENSITIVITY ---
    if (botPlayer && difficulty === 'hard') {
      const slotsNeeded = 5 - botPlayer.team.length;
      const reserve = Math.max(0, slotsNeeded - 1);
      const spendable = Math.max(0, botPlayer.gold - reserve);
      const avgGoldPerSlot = slotsNeeded > 0 ? spendable / slotsNeeded : 0;

      // If Red is rich and has plenty of gold per slot, it avoids settling for Common/low-BST Pokemon
      if (avgGoldPerSlot >= 4 && (pokemon.tier === 'Common' || bst < 380)) {
        baseVal = Math.min(baseVal, 1);
      }

      // If Red is on its last slot (slot 5), it can spend everything on a powerhouse
      if (slotsNeeded === 1 && (pokemon.tier === 'Legendary' || pokemon.tier === 'Epic')) {
        baseVal += 2;
      }
    }

    // If baseVal dropped to <= 0 due to duplicates or heavy type penalties, return 0
    if (baseVal <= 0) return 0;

    const val = Math.round(baseVal * config.valMult);
    return Math.max(0, val);
  }

  static decideBid(room, botPlayer, difficulty = 'medium') {
    const slotsNeeded = 5 - botPlayer.team.length;
    if (slotsNeeded <= 0) return { action: 'PASS' };

    const reserveNeeded = (slotsNeeded - 1) * 1;
    const maxSpendable = Math.max(0, botPlayer.gold - reserveNeeded);

    if (maxSpendable <= room.currentBid) {
      return { action: 'PASS' };
    }

    const perceivedValue = this.calculatePerceivedValue(room.currentPokemon, botPlayer, difficulty, room);
    const config = this.getDifficultyConfig(difficulty);

    // If perceived value is 0 (duplicate family, redundant monotype, or useless meme):
    // Bot NEVER bids or raises! Immediately PASS!
    if (perceivedValue <= 0) {
      return { action: 'PASS' };
    }

    const human = room.players.find(p => p.id !== botPlayer.id);
    const humanGold = human ? human.gold : 20;

    // Smart Bluffing / Price Jacking (Only for desirable Pokemon, NEVER for garbage/duplicates)
    const isDesirable = perceivedValue >= 3 || ['Legendary', 'Epic'].includes(room.currentPokemon?.tier);
    const shouldBluff = isDesirable &&
                        Math.random() < config.bluffChance && 
                        room.currentBid < Math.min(perceivedValue + 2, maxSpendable) &&
                        humanGold > room.currentBid + 2;

    const targetLimit = shouldBluff 
      ? Math.min(perceivedValue + 2, maxSpendable)
      : Math.min(perceivedValue, maxSpendable);

    // If current bid has reached or exceeded our target limit: PASS!
    if (room.currentBid >= targetLimit) {
      return { action: 'PASS' };
    }

    // Determine raise amount
    let raiseAmount = room.currentBid + 1;
    if (difficulty === 'hard' && room.currentPokemon?.tier === 'Legendary' && (room.currentBid + 2 <= targetLimit)) {
      raiseAmount = room.currentBid + 2;
    }

    return { action: 'BID', amount: Math.min(raiseAmount, maxSpendable) };
  }

  static decideOpeningBid(room, botPlayer, difficulty = 'medium') {
    const slotsNeeded = 5 - botPlayer.team.length;
    if (slotsNeeded <= 0) return { amount: 1 };

    const reserveNeeded = (slotsNeeded - 1) * 1;
    const maxSpendable = Math.max(0, botPlayer.gold - reserveNeeded);

    const perceivedValue = this.calculatePerceivedValue(room.currentPokemon, botPlayer, difficulty, room);

    // If Pokemon is high tier and Red has plenty of gold, open strong
    if (difficulty === 'hard' && perceivedValue >= 7 && maxSpendable >= 3) {
      return { amount: 2 };
    }

    return { amount: 1 };
  }

  static decideStarvation(room, botPlayer, difficulty = 'medium') {
    const pokemon = room.currentPokemon;
    if (!pokemon) return 'claimFree';

    const pVal = this.calculatePerceivedValue(pokemon, botPlayer, difficulty, room);

    // If duplicate family, monotype overflow, or trash: FORCE GIVE to opponent!
    if (pVal <= 1) {
      return 'forceGive';
    }

    if (['Legendary', 'Epic'].includes(pokemon.tier) || (pokemon.totalStats && pokemon.totalStats >= 420)) {
      return 'claimFree';
    }

    return pVal >= 3 ? 'claimFree' : 'forceGive';
  }

  static decideLineup(botPlayer) {
    if (!botPlayer.team || botPlayer.team.length === 0) return [];

    const team = [...botPlayer.team];
    if (team.length <= 2) return team;

    // Tactical Positioning:
    // Slot 1 (Lead / Öncü): Fast offensive sweeper (high Speed + highest offensive stat)
    const leadScore = (p) => (p.stats?.speed || 50) * 1.5 + Math.max(p.stats?.attack || 50, p.stats?.sp_attack || 50);
    const sortedByLead = [...team].sort((a, b) => leadScore(b) - leadScore(a));
    const lead = sortedByLead[0];

    // Remove lead from remaining
    const remaining = team.filter(p => p.id !== lead.id);

    // Slot 5 (Anchor / Son Kale): Tankiest finisher (highest HP * 1.8 + Defense * 1.2 + Legendary bonus)
    const anchorScore = (p) => (p.stats?.hp || 50) * 1.8 + (p.stats?.defense || 50) * 1.2 + (p.tier === 'Legendary' ? 80 : 0);
    const sortedByAnchor = [...remaining].sort((a, b) => anchorScore(b) - anchorScore(a));
    const anchor = sortedByAnchor[0];

    // Middle fighters (Slots 2, 3, 4) sorted by total battle power
    const middle = remaining.filter(p => p.id !== anchor.id).sort((a, b) => {
      const scoreA = (a.totalStats || 400);
      const scoreB = (b.totalStats || 400);
      return scoreB - scoreA;
    });

    return [lead, ...middle, anchor];
  }
}
