import { BotAI } from './BotAI.js';
﻿import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BattleEngine } from './BattleEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ALL_POKEMON = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/pokemon_gen1.json'), 'utf8'));

export class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  createRoom(hostName, socket) {
    const code = this.generateRoomCode();
    const room = {
      code,
      state: 'LOBBY',
      players: [
        {
          id: socket.id,
          name: hostName || 'Eğitmen 1',
          gold: 20,
          team: [],
          passed: false,
          ready: false,
          lineup: []
        }
      ],
      pool: this.shuffle(ALL_POKEMON),
      usedPokemonIds: new Set(),
      currentPokemon: null,
      currentBid: 0,
      highestBidder: null,
      openerPlayerId: null,
      activeTurnPlayerId: null,
      openingPlayerIdx: 0,
      timer: 8,
      timerInterval: null,
      isResolving: false,
      botActionTimeout: null,
      isBotGame: false,
      botDifficulty: 'medium', // Guard against double execution / race conditions
      history: [],
      battleResult: null,
      starvationMode: null
    };

    this.rooms.set(code, room);
    socket.join(code);
    return room;
  }

    createBotRoom(hostName, socket, difficulty = 'medium') {
    const room = this.createRoom(hostName, socket);
    room.isBotGame = true;
    room.botDifficulty = difficulty;

    const config = BotAI.getDifficultyConfig(difficulty);
    const botPlayer = {
      id: 'bot_' + Math.random().toString(36).substring(2, 9),
      name: config.name,
      gold: 20,
      team: [],
      passed: false,
      ready: true,
      lineup: [],
      isBot: true,
      difficulty
    };

    room.players.push(botPlayer);
    this.startAuction(room);
    return { room, botPlayer };
  }

  addBotToRoom(code, difficulty = 'medium') {
    const room = this.rooms.get(code.toUpperCase());
    if (!room || room.players.length !== 1 || room.state !== 'LOBBY') return null;

    room.isBotGame = true;
    room.botDifficulty = difficulty;

    const config = BotAI.getDifficultyConfig(difficulty);
    const botPlayer = {
      id: 'bot_' + Math.random().toString(36).substring(2, 9),
      name: config.name,
      gold: 20,
      team: [],
      passed: false,
      ready: true,
      lineup: [],
      isBot: true,
      difficulty
    };

    room.players.push(botPlayer);
    return room;
  }

  scheduleBotAction(room) {
    if (!room || room.state !== 'AUCTION' || room.isResolving) return;
    const activePlayer = room.players.find(p => p.id === room.activeTurnPlayerId);
    if (!activePlayer || !activePlayer.isBot) return;

    if (room.botActionTimeout) clearTimeout(room.botActionTimeout);

    const delay = BotAI.getRandomDelay(activePlayer.difficulty || 'medium');
    room.botActionTimeout = setTimeout(() => {
      if (!room || room.isResolving || room.state !== 'AUCTION') return;
      if (room.activeTurnPlayerId !== activePlayer.id) return;

      if (room.roundPhase === 'OPENING') {
        const openingDecision = BotAI.decideOpeningBid(room, activePlayer, activePlayer.difficulty);
        this.handleOpeningBid(room, activePlayer.id, openingDecision.amount || 1);
      } else {
        const decision = BotAI.decideBid(room, activePlayer, activePlayer.difficulty);
        if (decision.action === 'BID') {
          this.handleBid(room, activePlayer.id, decision.amount);
        } else {
          this.handlePass(room, activePlayer.id);
        }
      }
    }, delay);
  }

  joinRoom(code, playerName, socket) {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { error: 'Oda bulunamadı!' };
    if (room.players.length >= 2) return { error: 'Oda dolu!' };
    if (room.state !== 'LOBBY') return { error: 'Oyun zaten başladı!' };

    const player = {
      id: socket.id,
      name: playerName || 'Eğitmen 2',
      gold: 20,
      team: [],
      passed: false,
      ready: false,
      lineup: []
    };

    room.players.push(player);
    socket.join(room.code);
    return { room };
  }

  getRoomBySocket(socketId) {
    for (const room of this.rooms.values()) {
      if (room.players.some(p => p.id === socketId)) {
        return room;
      }
    }
    return null;
  }

  // --- PROGRESSIVE POKEMON DRAFTING ENGINE ---
  // Turlar ilerledikçe Epik ve Efsanevi Pokémon çıkma olasılığı katlanarak artar!
  getUniquePokemon(room) {
    const draftedCount = room.players.reduce((sum, p) => sum + p.team.length, 0);
    const available = ALL_POKEMON.filter(p => !room.usedPokemonIds.has(p.id));

    if (available.length === 0) {
      return ALL_POKEMON[0];
    }

    // Aşamalı İhtimal Dağılımı (Kademeli Rarity Eğrisi)
    // 0-3 Drafted (Erken Turlar): Common & Meme ağırlıklı, altın biriktirme dönemi
    // 4-6 Drafted (Orta Turlar): Rare ağırlıklı, ilk Epik'ler görünür
    // 7-8 Drafted (Geç Turlar): Epik ve Efsanevi şansı ciddi oranda yükselir
    // 9+ Drafted (Final Turları): Mewtwo, Dragonite, Efsanevi Kuşlar ve Starter son formları!
    let tierWeights;
    if (draftedCount <= 3) {
      tierWeights = { Meme: 15, Common: 65, Rare: 20, Epic: 0, Legendary: 0 };
    } else if (draftedCount <= 6) {
      tierWeights = { Meme: 5, Common: 25, Rare: 50, Epic: 20, Legendary: 0 };
    } else if (draftedCount <= 8) {
      tierWeights = { Meme: 0, Common: 10, Rare: 25, Epic: 45, Legendary: 20 };
    } else {
      tierWeights = { Meme: 0, Common: 0, Rare: 10, Epic: 45, Legendary: 45 };
    }

    const roll = Math.random() * 100;
    let cumulative = 0;
    let selectedTier = 'Common';
    for (const [tier, weight] of Object.entries(tierWeights)) {
      cumulative += weight;
      if (roll <= cumulative) {
        selectedTier = tier;
        break;
      }
    }

    // Seçilen tier'dan kullanılmamış bir Pokémon bul
    let candidates = available.filter(p => p.tier === selectedTier);

    // Seçilen tier tükendiyse en yakın uygun tier'dan seç
    if (candidates.length === 0) {
      const fallbackOrder = ['Legendary', 'Epic', 'Rare', 'Common', 'Meme'];
      for (const t of fallbackOrder) {
        const fallbacks = available.filter(p => p.tier === t);
        if (fallbacks.length > 0) {
          candidates = fallbacks;
          break;
        }
      }
    }

    const chosen = candidates[Math.floor(Math.random() * candidates.length)] || available[0];
    room.usedPokemonIds.add(chosen.id);
    return chosen;
  }

  // Safe team adder (Strictly prevents duplicate Pokemon on a team)
  addPokemonToTeam(player, pokemon) {
    if (!player || !pokemon) return false;
    if (player.team.length >= 5) return false;
    if (player.team.some(p => p.id === pokemon.id)) return false;
    player.team.push(pokemon);
    return true;
  }

  // --- AUCTION LOGIC ---
  startAuction(room) {
    room.state = 'AUCTION';
    room.openingPlayerIdx = 0;
    room.usedPokemonIds = new Set();
    this.nextAuctionRound(room);
  }

  nextAuctionRound(room) {
    // Reset resolution lock
    room.isResolving = false;

    // Check if draft is finished
    const p1Full = room.players[0].team.length >= 5;
    const p2Full = room.players[1].team.length >= 5;

    if (p1Full && p2Full) {
      this.startLineupPhase(room);
      return;
    }

    const p1 = room.players[0];
    const p2 = room.players[1];

    // Case 1: If one player is already full (5 Pokemon), remaining slots go to the other
    if (p1.team.length >= 5) {
      room.currentPokemon = this.getUniquePokemon(room);
      this.addPokemonToTeam(p2, room.currentPokemon);
      room.history.unshift({ pokemon: room.currentPokemon, winnerName: p2.name, price: 0, forced: true });
      this.broadcastRoom(room);
      setTimeout(() => this.nextAuctionRound(room), 1200);
      return;
    }
    if (p2.team.length >= 5) {
      room.currentPokemon = this.getUniquePokemon(room);
      this.addPokemonToTeam(p1, room.currentPokemon);
      room.history.unshift({ pokemon: room.currentPokemon, winnerName: p1.name, price: 0, forced: true });
      this.broadcastRoom(room);
      setTimeout(() => this.nextAuctionRound(room), 1200);
      return;
    }

    // Reveal next guaranteed UNIQUE Pokemon
    room.currentPokemon = this.getUniquePokemon(room);
    room.players.forEach(p => p.passed = false);

    // Case 2: Check Starvation (İflas)
    const p1Broke = p1.gold <= 0;
    const p2Broke = p2.gold <= 0;

    if (p1Broke && p2Broke) {
      const target = p1.team.length <= p2.team.length ? p1 : p2;
      this.addPokemonToTeam(target, room.currentPokemon);
      room.history.unshift({ pokemon: room.currentPokemon, winnerName: target.name, price: 0, forced: true });
      this.broadcastRoom(room);
      setTimeout(() => this.nextAuctionRound(room), 1200);
      return;
    }

    if (p1Broke || p2Broke) {
      const richPlayer = p1Broke ? p2 : p1;
      const brokePlayer = p1Broke ? p1 : p2;

      room.starvationMode = {
        richPlayerId: richPlayer.id,
        brokePlayerId: brokePlayer.id
      };
      room.activeTurnPlayerId = richPlayer.id;
      room.timer = this.getTimerDuration(room, 'STARVATION');
      this.startStarvationTimer(room);
      this.broadcastRoom(room);
      if (richPlayer.isBot) {
        setTimeout(() => {
          if (!room.starvationMode || room.isResolving) return;
          const decision = BotAI.decideStarvation(room, richPlayer, richPlayer.difficulty);
          this.handleStarvationDecision(room, richPlayer.id, decision);
        }, 1500);
      }
      return;
    }

    // --- POKER BLIND OPENING BID ---
    room.starvationMode = null;
    const opener = room.players[room.openingPlayerIdx];
    const responder = room.players[1 - room.openingPlayerIdx];

    room.openerPlayerId = opener.id;
    room.roundPhase = 'OPENING';
    room.currentBid = 0;
    room.highestBidder = null;

    room.activeTurnPlayerId = opener.id;
    room.timer = this.getTimerDuration(room, 'OPENING');

    // Switch opener index for the next round
    room.openingPlayerIdx = 1 - room.openingPlayerIdx;

    this.startAuctionTimer(room);
    this.broadcastRoom(room);
    this.scheduleBotAction(room);
  }

  // Dynamic Timer Durations (Solo Bot vs PvP)
  getTimerDuration(room, phase) {
    const hasBot = room.players.some(p => p.isBot);
    switch (phase) {
      case 'OPENING':
        return hasBot ? 8 : 15;
      case 'RESPONSE':
        return hasBot ? 8 : 12;
      case 'RAISE':
        return hasBot ? 6 : 10;
      case 'STARVATION':
        return hasBot ? 10 : 15;
      case 'LINEUP':
        return hasBot ? 20 : 35;
      default:
        return 10;
    }
  }

  startAuctionTimer(room) {
    if (room.timerInterval) clearInterval(room.timerInterval);
    room.timerInterval = setInterval(() => {
      if (room.isResolving) {
        clearInterval(room.timerInterval);
        return;
      }
      room.timer--;
      if (room.timer <= 0) {
        clearInterval(room.timerInterval);
        if (room.roundPhase === 'OPENING') {
          this.handleOpeningBid(room, room.activeTurnPlayerId, 1);
        } else {
          this.handlePass(room, room.activeTurnPlayerId);
        }
      } else {
        this.io.to(room.code).emit('TIMER_TICK', { timer: room.timer });
      }
    }, 1000);
  }

  handleOpeningBid(room, socketId, amount = 1) {
    if (room.state !== 'AUCTION' || room.starvationMode || room.isResolving) return;
    if (room.activeTurnPlayerId !== socketId || room.roundPhase !== 'OPENING') return;

    const player = room.players.find(p => p.id === socketId);
    if (!player || player.team.length >= 5) return;

    const openingAmount = Math.max(1, Math.min(amount, player.gold));
    room.currentBid = openingAmount;
    room.highestBidder = player.id;
    room.roundPhase = 'BIDDING';

    const responder = room.players.find(p => p.id !== socketId);
    room.activeTurnPlayerId = responder.id;
    room.timer = this.getTimerDuration(room, 'RESPONSE');

    this.startAuctionTimer(room);
    this.broadcastRoom(room);
    this.io.to(room.code).emit('BID_PLACED', {
      bidderId: player.id,
      bidderName: player.name,
      amount: openingAmount,
      isOpening: true,
      pokemon: room.currentPokemon
    });
    this.scheduleBotAction(room);
  }

  startStarvationTimer(room) {
    if (room.timerInterval) clearInterval(room.timerInterval);
    room.timerInterval = setInterval(() => {
      if (room.isResolving) {
        clearInterval(room.timerInterval);
        return;
      }
      room.timer--;
      if (room.timer <= 0) {
        clearInterval(room.timerInterval);
        this.handleStarvationDecision(room, room.starvationMode.richPlayerId, 'forceGive');
      } else {
        this.io.to(room.code).emit('TIMER_TICK', { timer: room.timer });
      }
    }, 1000);
  }

  handleBid(room, socketId, amount) {
    if (room.state !== 'AUCTION' || room.starvationMode || room.isResolving) return;
    if (room.activeTurnPlayerId !== socketId) return;

    if (room.roundPhase === 'OPENING') {
      this.handleOpeningBid(room, socketId, amount);
      return;
    }

    const player = room.players.find(p => p.id === socketId);
    if (!player || player.team.length >= 5) return;

    if (amount <= room.currentBid) return;
    if (amount > player.gold) return;

    // Successful Raise!
    room.currentBid = amount;
    room.highestBidder = player.id;

    const opponent = room.players.find(p => p.id !== socketId);
    room.activeTurnPlayerId = opponent.id;
    room.timer = this.getTimerDuration(room, 'RAISE');

    this.startAuctionTimer(room);
    this.broadcastRoom(room);
    this.io.to(room.code).emit('BID_PLACED', {
      bidderId: player.id,
      bidderName: player.name,
      amount,
      pokemon: room.currentPokemon
    });
    this.scheduleBotAction(room);
  }

  handlePass(room, socketId) {
    if (room.state !== 'AUCTION' || room.starvationMode || room.isResolving) return;
    if (room.activeTurnPlayerId !== socketId) return;
    if (room.botActionTimeout) clearTimeout(room.botActionTimeout);

    if (room.roundPhase === 'OPENING') {
      this.handleOpeningBid(room, socketId, 1);
      return;
    }

    // Lock resolution immediately!
    room.isResolving = true;
    if (room.timerInterval) clearInterval(room.timerInterval);

    const passingPlayer = room.players.find(p => p.id === socketId);
    this.io.to(room.code).emit('PLAYER_PASSED', { playerId: passingPlayer.id, name: passingPlayer.name });

    this.resolveAuctionRound(room);
  }

  handleStarvationDecision(room, socketId, decision) {
    if (room.state !== 'AUCTION' || !room.starvationMode || room.isResolving) return;
    if (room.starvationMode.richPlayerId !== socketId) return;

    room.isResolving = true;
    if (room.timerInterval) clearInterval(room.timerInterval);

    const rich = room.players.find(p => p.id === room.starvationMode.richPlayerId);
    const broke = room.players.find(p => p.id === room.starvationMode.brokePlayerId);

    if (decision === 'claimFree') {
      this.addPokemonToTeam(rich, room.currentPokemon);
      room.history.unshift({ pokemon: room.currentPokemon, winnerName: rich.name, price: 0, forced: false });
      this.io.to(room.code).emit('ROUND_WON', {
        winnerId: rich.id,
        winnerName: rich.name,
        pokemon: room.currentPokemon,
        price: 0,
        forced: false
      });
    } else {
      this.addPokemonToTeam(broke, room.currentPokemon);
      room.history.unshift({ pokemon: room.currentPokemon, winnerName: broke.name, price: 0, forced: true });
      this.io.to(room.code).emit('ROUND_WON', {
        winnerId: broke.id,
        winnerName: broke.name,
        pokemon: room.currentPokemon,
        price: 0,
        forced: true
      });
    }

    room.starvationMode = null;
    this.broadcastRoom(room);
    setTimeout(() => this.nextAuctionRound(room), 1200);
  }

  resolveAuctionRound(room) {
    const winner = room.players.find(p => p.id === room.highestBidder);
    if (winner) {
      winner.gold = Math.max(0, winner.gold - room.currentBid);
      this.addPokemonToTeam(winner, room.currentPokemon);

      room.history.unshift({
        pokemon: room.currentPokemon,
        winnerName: winner.name,
        price: room.currentBid,
        forced: false
      });

      this.io.to(room.code).emit('ROUND_WON', {
        winnerId: winner.id,
        winnerName: winner.name,
        pokemon: room.currentPokemon,
        price: room.currentBid
      });
    }

    this.broadcastRoom(room);
    setTimeout(() => this.nextAuctionRound(room), 1200);
  }

  // --- LINEUP PHASE ---
  startLineupPhase(room) {
    if (room.timerInterval) clearInterval(room.timerInterval);
    room.state = 'LINEUP';
    room.timer = this.getTimerDuration(room, 'LINEUP');
    room.players.forEach(p => {
      p.ready = false;
      p.lineup = [...p.team];
    });

    const bot = room.players.find(p => p.isBot);
    if (bot) {
      bot.lineup = BotAI.decideLineup(bot);
      setTimeout(() => {
        if (room.state !== 'LINEUP') return;
        bot.ready = true;
        this.broadcastRoom(room);
        if (room.players.every(p => p.ready)) {
          if (room.timerInterval) clearInterval(room.timerInterval);
          this.startBattlePhase(room);
        }
      }, 1500);
    }

    this.broadcastRoom(room);

    room.timerInterval = setInterval(() => {
      room.timer--;
      if (room.timer <= 0) {
        clearInterval(room.timerInterval);
        this.startBattlePhase(room);
      } else {
        this.io.to(room.code).emit('TIMER_TICK', { timer: room.timer });
      }
    }, 1000);
  }

  handleLineupUpdate(room, socketId, reorderedLineup) {
    if (room.state !== 'LINEUP') return;
    const player = room.players.find(p => p.id === socketId);
    if (!player) return;

    if (Array.isArray(reorderedLineup) && reorderedLineup.length === 5) {
      // Validate that reorderedLineup contains all 5 original drafted Pokemon without duplicates
      const originalIds = new Set(player.team.map(p => p.id));
      const newIds = new Set(reorderedLineup.map(p => p.id));
      if (newIds.size === 5 && [...newIds].every(id => originalIds.has(id))) {
        player.lineup = reorderedLineup;
      }
    }
  }

  handlePlayerReady(room, socketId) {
    if (room.state !== 'LINEUP') return;
    const player = room.players.find(p => p.id === socketId);
    if (!player) return;

    player.ready = true;
    this.broadcastRoom(room);

    if (room.players.every(p => p.ready)) {
      if (room.timerInterval) clearInterval(room.timerInterval);
      this.startBattlePhase(room);
    }
  }

  // --- BATTLE PHASE ---
  startBattlePhase(room) {
    if (room.timerInterval) clearInterval(room.timerInterval);
    room.state = 'BATTLE';

    const p1 = room.players[0];
    const p2 = room.players[1];

    const battleResult = BattleEngine.simulate(p1, p2);
    room.battleResult = battleResult;

    this.broadcastRoom(room);
    this.io.to(room.code).emit('BATTLE_START', {
      team1: { id: p1.id, name: p1.name, lineup: p1.lineup },
      team2: { id: p2.id, name: p2.name, lineup: p2.lineup },
      timeline: battleResult.timeline,
      winnerId: battleResult.winnerId,
      mvp: battleResult.mvp
    });
  }

  handleRematch(room) {
    if (room.timerInterval) clearInterval(room.timerInterval);
    room.state = 'AUCTION';
    room.pool = this.shuffle(ALL_POKEMON);
    room.usedPokemonIds = new Set();
    room.history = [];
    room.battleResult = null;
    room.openingPlayerIdx = 0;
    room.isResolving = false;
    room.players.forEach(p => {
      p.gold = 20;
      p.team = [];
      p.lineup = [];
      p.ready = false;
      p.passed = false;
    });

    this.startAuction(room);
  }

  removePlayer(socketId) {
    const room = this.getRoomBySocket(socketId);
    if (!room) return;

    if (room.timerInterval) clearInterval(room.timerInterval);
    room.players = room.players.filter(p => p.id !== socketId);

    if (room.botActionTimeout) clearTimeout(room.botActionTimeout);
    if (room.players.length === 0 || room.players.every(p => p.isBot)) {
      this.rooms.delete(room.code);
    } else {
      this.io.to(room.code).emit('OPPONENT_DISCONNECTED');
      room.state = 'LOBBY';
      this.broadcastRoom(room);
    }
  }

  broadcastRoom(room) {
    this.io.to(room.code).emit('ROOM_UPDATE', {
      code: room.code,
      state: room.state,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        gold: p.gold,
        teamCount: p.team.length,
        team: p.team,
        ready: p.ready
      })),
      currentPokemon: room.currentPokemon,
      roundPhase: room.roundPhase,
      currentBid: room.currentBid,
      highestBidder: room.highestBidder,
      openerPlayerId: room.openerPlayerId,
      activeTurnPlayerId: room.activeTurnPlayerId,
      timer: room.timer,
      starvationMode: room.starvationMode,
      history: room.history
    });
  }
}
