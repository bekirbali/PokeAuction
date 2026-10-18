import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Swords, RotateCcw, Sparkles, Skull, Flame } from 'lucide-react';
import { sound } from '../utils/sound.js';

export default function MatchSummary({
  room,
  playerId,
  battleResult,
  socket
}) {
  const isWinner = battleResult.winnerId === playerId;
  const winner = room.players.find(p => p.id === battleResult.winnerId);
  const mvp = battleResult.mvp;

  useEffect(() => {
    if (isWinner) {
      sound.playVictory();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [isWinner]);

  const handleRematch = () => {
    sound.playGavel();
    socket.emit('REQUEST_REMATCH');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-center space-y-8">
      {/* Result Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-white/10 text-xs font-mono uppercase tracking-widest text-slate-400">
          Maç Sona Erdi
        </div>
        <h1 className={`text-5xl sm:text-6xl font-black tracking-tight drop-shadow-xl ${
          isWinner ? 'text-amber-400 animate-bounce' : 'text-slate-400'
        }`}>
          {isWinner ? '🏆 ZAFER!' : '💀 BOZGUN!'}
        </h1>
        <p className="text-slate-300 font-semibold text-lg">
          {isWinner ? 'Tebrikler! Takımın tüm rakiplerini arenadan sildi.' : `${winner?.name} maçı kazandı. Bir dahaki sefere daha iyi draft yap!`}
        </p>
      </div>

      {/* MVP Card Highlight */}
      {mvp && (
        <div className="bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden max-w-md mx-auto">
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-500/40">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            MAÇIN MVP'Sİ
          </div>

          <div className="my-4">
            <img
              src={mvp.sprite}
              alt={mvp.name}
              className="w-32 h-32 object-contain mx-auto drop-shadow-[0_10px_20px_rgba(234,179,8,0.4)]"
            />
            <h3 className="text-2xl font-black text-white mt-2">{mvp.name}</h3>
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
      <div className="flex justify-center gap-4 pt-4">
        <button
          onClick={handleRematch}
          className="py-4 px-8 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-lg shadow-xl shadow-red-600/30 flex items-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          YENİDEN OYNA (RÖVANŞ)
        </button>
      </div>
    </div>
  );
}
