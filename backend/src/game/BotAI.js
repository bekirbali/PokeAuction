export class BotAI {
  static getDifficultyConfig(difficulty = 'medium') {
    switch (difficulty) {
      case 'easy':
        return {
          name: 'Brock (Çaylak)',
          valMult: 0.8,
          bluffChance: 0.05,
          minDelay: 1800,
          maxDelay: 2800
        };
      case 'hard':
        return {
          name: 'Red (Şampiyon)',
          valMult: 1.15,
          bluffChance: 0.35,
          minDelay: 1000,
          maxDelay: 1800
        };
      case 'medium':
      default:
        return {
          name: 'Gary (Kurnaz)',
          valMult: 1.0,
          bluffChance: 0.20,
          minDelay: 1300,
          maxDelay: 2200
        };
    }
  }

  static getRandomDelay(difficulty = 'medium') {
    const config = this.getDifficultyConfig(difficulty);
    return Math.floor(Math.random() * (config.maxDelay - config.minDelay + 1)) + config.minDelay;
  }

  static calculatePerceivedValue(pokemon, difficulty = 'medium') {
    if (!pokemon) return 1;
    const config = this.getDifficultyConfig(difficulty);

    // 20 Altın ekonomisine göre kalibre edilmiş tavan teklifler
    let baseVal = 2;
    switch (pokemon.tier) {
      case 'Meme':
        baseVal = 1;
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

    const bst = pokemon.totalStats || 400;
    const statBonus = Math.round((bst - 300) / 100);

    let val = Math.max(1, Math.round((baseVal + statBonus) * config.valMult));
    return val;
  }

  static decideBid(room, botPlayer, difficulty = 'medium') {
    const slotsNeeded = 5 - botPlayer.team.length;
    if (slotsNeeded <= 0) return { action: 'PASS' };

    const reserveNeeded = (slotsNeeded - 1) * 1;
    const maxSpendable = Math.max(0, botPlayer.gold - reserveNeeded);

    if (maxSpendable <= room.currentBid) {
      return { action: 'PASS' };
    }

    const perceivedValue = this.calculatePerceivedValue(room.currentPokemon, difficulty);
    const config = this.getDifficultyConfig(difficulty);

    const human = room.players.find(p => p.id !== botPlayer.id);
    const humanGold = human ? human.gold : 20;

    const shouldBluff = Math.random() < config.bluffChance && 
                        room.currentBid < Math.min(perceivedValue + 2, maxSpendable) &&
                        humanGold > room.currentBid + 2;

    const targetLimit = shouldBluff 
      ? Math.min(perceivedValue + 2, maxSpendable)
      : Math.min(perceivedValue, maxSpendable);

    if (room.roundPhase === 'OPENING') {
      return { action: 'BID', amount: 1 };
    }

    if (room.currentBid < targetLimit) {
      let raiseAmount = room.currentBid + 1;
      if (difficulty === 'hard' && room.currentPokemon.tier === 'Legendary' && (room.currentBid + 2 <= targetLimit)) {
        raiseAmount = room.currentBid + 2;
      }
      return { action: 'BID', amount: Math.min(raiseAmount, maxSpendable) };
    }

    return { action: 'PASS' };
  }

  static decideStarvation(room, botPlayer, difficulty = 'medium') {
    const pokemon = room.currentPokemon;
    if (!pokemon) return 'claimFree';

    if (['Legendary', 'Epic', 'Rare'].includes(pokemon.tier) || (pokemon.totalStats && pokemon.totalStats > 400)) {
      return 'claimFree';
    }

    return 'forceGive';
  }

  static decideLineup(botPlayer) {
    if (!botPlayer.team || botPlayer.team.length === 0) return [];
    const sorted = [...botPlayer.team].sort((a, b) => {
      const scoreA = (a.stats?.hp || 50) * 1.5 + (a.stats?.attack || 50) + (a.stats?.speed || 50);
      const scoreB = (b.stats?.hp || 50) * 1.5 + (b.stats?.attack || 50) + (b.stats?.speed || 50);
      return scoreB - scoreA;
    });
    return sorted;
  }
}
