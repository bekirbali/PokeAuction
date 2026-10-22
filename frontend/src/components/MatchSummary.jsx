import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Swords, RotateCcw, Sparkles, Skull, Flame, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { sound } from '../utils/sound.js';
import { updateStatsOnMatchEnd } from '../utils/stats.js';

export default function MatchSummary({
  room,
  playerId,
  battleResult,
  socket,
  onLeaveRoom
}) {
  const isWinner = battleResult.winnerId === playerId;
  const winner = room.players.find(p => p.id === battleResult.winnerId);
  const mvp = battleResult.mvp;
  const [matchStatOutcome, setMatchStatOutcome] = useState(null);
  const recordedRef = useRef(false);

  useEffect(() => {
    // Generate a deterministic match key for idempotency
    const matchKey = `poke_match_outcome_${battleResult?.matchId || (room?.code + '_' + battleResult?.winnerId)}`;
    const cachedOutcomeStr = sessionStorage.getItem(matchKey);

    if (cachedOutcomeStr) {
      try {
        const parsed = JSON.parse(cachedOutcomeStr);
        setMatchStatOutcome(parsed);
        return;
      } catch (e) {}
    }

    if (recordedRef.current) return;
    recordedRef.current = true;

    // Record rank & streak once per match end
    const isBotMatch = !!(room?.isBotGame || room?.players?.some(p => p.isBot));
    const outcome = updateStatsOnMatchEnd({
      isWinner,
      isBot: isBotMatch,
      botDifficulty: room?.botDifficulty || 'medium'
    });
    setMatchStatOutcome(outcome);
    try {
      sessionStorage.setItem(matchKey, JSON.stringify(outcome));
    } catch (e) {}

    if (isWinner) {
      sound.playVictory();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, []);

  const handleRematch = () => {
    sound.playGavel();
    const humanPlayer = room?.players?.find(p => !p.isBot) || room?.players?.find(p => p.id === playerId);
    socket.emit('REQUEST_REMATCH', {
      roomCode: room?.code,
      isBot: room?.isBotGame,
      difficulty: room?.botDifficulty || 'medium',
      playerName: humanPlayer?.name || 'Eğitmen'
    });
  };

  const getSpriteOffset = (pokemon) => {
    if (!pokemon) return '';
    const slug = (pokemon.slug || pokemon.name || '').toLowerCase();
    if (slug === 'mewtwo') return 'translate-x-[11%]';
    if (slug === 'gyarados') return 'translate-x-[6%]';
    if (slug === 'arbok') return 'translate-x-[5%]';
    if (slug === 'onix') return '-translate-x-[5%]';
    return '';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 text-center space-y-6">
      {/* Result Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-white/10 text-xs font-mono uppercase tracking-widest text-slate-400">
          Maç Sona Erdi
        </div>
        <h1 className={`text-4xl sm:text-6xl font-black tracking-tight drop-shadow-xl ${
          isWinner ? 'text-amber-400 animate-bounce' : 'text-slate-400'
        }`}>
          {isWinner ? '🏆 ZAFER!' : '💀 BOZGUN!'}
        </h1>
        <p className="text-slate-300 font-semibold text-sm sm:text-base">
          {isWinner ? 'Tebrikler! Takımın tüm rakiplerini arenadan sildi.' : `${winner?.name || 'Rakip'} maçı kazandı. Bir dahaki sefere daha iyi draft yap!`}
        </p>

        {/* Clean Rank & Streak Pill Bar */}
        {matchStatOutcome && (
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {/* Mode Tag */}
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300">
              {matchStatOutcome.isBot ? `Bot (${matchStatOutcome.botDifficulty})` : 'PvP Dereceli'}
            </span>

            {/* RP Change */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
              matchStatOutcome.rpChange > 0
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                : matchStatOutcome.rpChange < 0
                ? 'bg-rose-950/40 text-rose-400 border-rose-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {matchStatOutcome.rpChange > 0 ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{matchStatOutcome.rpChange} RP</span>
                </>
              ) : matchStatOutcome.rpChange < 0 ? (
                <>
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>{matchStatOutcome.rpChange} RP</span>
                </>
              ) : (
                <span>0 RP</span>
              )}
              <span className="text-[10px] text-slate-400 font-mono font-normal">({matchStatOutcome.newRp} RP)</span>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/30 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              <span>Seri: {matchStatOutcome.currentStreak}</span>
              {matchStatOutcome.bestStreak > 0 && (
                <span className="text-[10px] text-amber-500/80 font-mono">(En İyi: {matchStatOutcome.bestStreak})</span>
              )}
            </div>

            {/* Current Rank Badge */}
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${matchStatOutcome.rank.bg} ${matchStatOutcome.rank.border} ${matchStatOutcome.rank.color}`}>
              <span>{matchStatOutcome.rank.badge}</span>
              <span>{matchStatOutcome.rank.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* MVP Card Highlight */}
      {mvp && (
        <div className="bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden max-w-md mx-auto">
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-500/40">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            MAÇIN MVP'Sİ
          </div>

          <div className="my-4 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Soft Ambient Radial Halo (Never clips to GIF bounding box) */}
              <div className="absolute inset-0 bg-radial from-amber-400/25 via-amber-500/10 to-transparent rounded-full blur-xl pointer-events-none z-0" />
              {/* Champion Glowing Pedestal / Spotlight */}
              <div className="absolute bottom-2 w-28 h-7 rounded-[50%] bg-radial from-amber-400/40 via-amber-500/20 to-transparent blur-[2px] border border-amber-400/30 shadow-[0_0_25px_rgba(245,158,11,0.6)] pointer-events-none" />
              
              <img
                src={mvp.sprite}
                alt={mvp.name}
                className={`max-w-full max-h-full object-contain pixel-sprite relative z-10 transition-transform ${getSpriteOffset(mvp)}`}
              />
            </div>
            <h3 className="text-2xl font-black text-white mt-2 drop-shadow-md">{mvp.name}</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nakavt (Kills)</span>
              <span className="font-mono text-xl font-black text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                <Skull className="w-4 h-4 text-red-400" />
                {mvp.kills} Düşman
              </span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Toplam Hasar</span>
              <span className="font-mono text-xl font-black text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                <Flame className="w-4 h-4 text-orange-400" />
                {mvp.damageDealt} HP
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        {onLeaveRoom && (
          <button
            onClick={onLeaveRoom}
            className="py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-sm border border-slate-700 flex items-center gap-2 transition cursor-pointer"
          >
            ← Ana Menüye Dön
          </button>
        )}
        <button
          onClick={handleRematch}
          className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-base shadow-xl shadow-red-600/30 flex items-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          YENİDEN OYNA (RÖVANŞ)
        </button>
      </div>
    </div>
  );
}
