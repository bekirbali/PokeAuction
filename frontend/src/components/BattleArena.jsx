import React, { useState, useEffect, useRef } from 'react';
import { FastForward, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import MoveAnimation from './MoveAnimation.jsx';
import { sound } from '../utils/sound.js';

export default function BattleArena({
  battleData,
  playerId,
  onBattleEnd,
  onMuteToggle,
  isMuted
}) {
  const { team1, team2, timeline, winnerId, mvp } = battleData;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // Active Battle State
  const [p1Active, setP1Active] = useState(null);
  const [p2Active, setP2Active] = useState(null);
  const [p1Hp, setP1Hp] = useState(0);
  const [p2Hp, setP2Hp] = useState(0);
  const [p1MaxHp, setP1MaxHp] = useState(100);
  const [p2MaxHp, setP2MaxHp] = useState(100);

  const [p1FaintedCount, setP1FaintedCount] = useState(0);
  const [p2FaintedCount, setP2FaintedCount] = useState(0);

  const [announcement, setAnnouncement] = useState('Pokemon Ligi Şampiyonası Başlıyor...');
  const [damagePopup, setDamagePopup] = useState(null);
  const [shakeTarget, setShakeTarget] = useState(null);
  const [lungeSide, setLungeSide] = useState(null);
  const [hitTarget, setHitTarget] = useState(null);
  const [activeMoveAnim, setActiveMoveAnim] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    if (isPaused || currentIndex >= timeline.length) {
      if (currentIndex >= timeline.length && timeline.length > 0) {
        const timer = setTimeout(() => {
          onBattleEnd({ winnerId, mvp });
        }, 2200);
        return () => clearTimeout(timer);
      }
      return;
    }

    const event = timeline[currentIndex];
    let stepDelay = 2000 / speed;

    if (event.type === 'ENTER_FIELD') {
      stepDelay = 1400 / speed;
      const isP1 = event.playerId === team1.id;
      if (isP1) {
        setP1Active(event.pokemon);
        setP1Hp(event.pokemon.currentHp);
        setP1MaxHp(event.pokemon.maxHp);
      } else {
        setP2Active(event.pokemon);
        setP2Hp(event.pokemon.currentHp);
        setP2MaxHp(event.pokemon.maxHp);
      }

      setAnnouncement(`⚡ ${event.pokemon.name} sahaya indi!`);
      sound.playCry(event.pokemon.cryUrl);

    } else if (event.type === 'ATTACK') {
      stepDelay = 2200 / speed;
      const isP1Attacker = event.attackerPlayerId === team1.id;
      const attackerSide = isP1Attacker ? 'p1' : 'p2';
      const targetSide = isP1Attacker ? 'p2' : 'p1';

      let effText = '';
      if (event.effectiveness > 1) effText = ' (Süper Etkili!)';
      if (event.effectiveness < 1 && event.effectiveness > 0) effText = ' (Pek etkili olmadı)';
      if (event.effectiveness === 0) effText = ' (Etki etmedi!)';

      setAnnouncement(`🔥 ${event.attackerPokemon}, ${event.move.name} kullandı!${effText}`);
      setLungeSide(attackerSide);
      sound.playAttack();

      setActiveMoveAnim({
        move: event.move,
        attackerSide,
        id: currentIndex
      });

      const hitTimeout = setTimeout(() => {
        sound.playHit(event.isCrit, event.effectiveness);
        setHitTarget(targetSide);
        setShakeTarget(targetSide);

        if (targetSide === 'p1') {
          setP1Hp(event.defenderRemainingHp);
        } else {
          setP2Hp(event.defenderRemainingHp);
        }

        setDamagePopup({
          target: targetSide,
          text: `-${event.damage} HP${event.isCrit ? ' 💥 KRİTİK!' : ''}`,
          isCrit: event.isCrit
        });
      }, 400 / speed);

      const resetTimeout = setTimeout(() => {
        setLungeSide(null);
        setActiveMoveAnim(null);
        setHitTarget(null);
        setShakeTarget(null);
        setDamagePopup(null);
      }, 1200 / speed);

    } else if (event.type === 'FAINT') {
      stepDelay = 1500 / speed;
      sound.playFaint();
      const isP1 = event.playerId === team1.id;
      if (isP1) {
        setP1FaintedCount(prev => prev + 1);
      } else {
        setP2FaintedCount(prev => prev + 1);
      }
      setAnnouncement(`💀 ${event.pokemon} bayıldı!`);

    } else if (event.type === 'VICTORY') {
      stepDelay = 2200 / speed;
      sound.playVictory();
      const winnerName = event.winnerId === team1.id ? team1.name : team2.name;
      setAnnouncement(`🏆 Zafer ${winnerName}'in!`);
    }

    timerRef.current = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, stepDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isPaused, speed, timeline]);

  const p1HpPercent = p1MaxHp > 0 ? Math.max(0, (p1Hp / p1MaxHp) * 100) : 0;
  const p2HpPercent = p2MaxHp > 0 ? Math.max(0, (p2Hp / p2MaxHp) * 100) : 0;

  const getHpColor = (percent) => {
    if (percent > 50) return 'bg-emerald-500';
    if (percent > 20) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Dynamic Player Perspective (Sol taraf veya sağ taraf oyuncunun kendi kimliğine göre SEN / RAKİP olur)
  const isP1You = team1.id === playerId;
  const isP2You = team2.id === playerId;

  const p1Label = isP1You ? `SEN · ${team1.name}` : isP2You ? `RAKİP · ${team1.name}` : `1. OYUNCU · ${team1.name}`;
  const p2Label = isP2You ? `SEN · ${team2.name}` : isP1You ? `RAKİP · ${team2.name}` : `2. OYUNCU · ${team2.name}`;

  const p1IsYou = isP1You || (!isP1You && !isP2You);
  const p2IsYou = isP2You;

  const p1CardBorder = p1IsYou ? 'border-emerald-500/60' : 'border-blue-500/60';
  const p1BadgeClass = p1IsYou
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  const p1BallActive = p1IsYou ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-blue-500 shadow-blue-500/50';

  const p2CardBorder = p2IsYou ? 'border-emerald-500/60' : 'border-blue-500/60';
  const p2BadgeClass = p2IsYou
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  const p2BallActive = p2IsYou ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-blue-500 shadow-blue-500/50';

  return (
    <div className="h-full max-h-[calc(100vh-2rem)] flex flex-col justify-between max-w-6xl w-full mx-auto px-4 py-2 overflow-hidden select-none">
      {/* Top Header: Controls & Status */}
      <div className="flex justify-between items-center bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-1.5 backdrop-blur-md flex-shrink-0 mb-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
            POKEMON LİGİ ARENASI
          </span>
          <span className="text-xs text-slate-300 font-bold">
            {team1.name} vs {team2.name} · Meydan Savaşı
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed Toggle */}
          <button
            onClick={() => setSpeed(s => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono font-bold flex items-center gap-1 transition"
          >
            <FastForward className="w-3 h-3" />
            {speed}x
          </button>

          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused(p => !p)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Mute */}
          <button
            onClick={onMuteToggle}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* --- HORIZONTAL WIDESCREEN BATTLE STADIUM --- */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700/80 bg-gradient-to-b from-slate-950 via-[#0a1120] to-slate-950 shadow-2xl flex-1 flex flex-col justify-between p-4 min-h-[460px] stadium-container">
        
        {/* Background Stadium Floodlights & Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-1/3 h-full spotlight-left opacity-60" />
          <div className="absolute top-0 right-0 w-1/3 h-full spotlight-right opacity-60" />
          <div className="absolute top-2 inset-x-8 flex justify-between opacity-30 text-[8px] text-white font-mono tracking-widest">
            <span>★ ★ ★ ★ ★ ★ ★</span>
            <span>CHAMPIONSHIP STADIUM</span>
            <span>★ ★ ★ ★ ★ ★ ★</span>
          </div>
        </div>

        {/* --- HORIZONTAL 3D TURF PITCH (POKÉBALL ARENA) --- */}
        <div className="absolute inset-x-6 md:inset-x-12 top-10 bottom-6 stadium-pitch rounded-[48px] overflow-hidden border-4 border-amber-500/35 bg-gradient-to-r from-[#0d281e] via-[#164732] to-[#0d281e] pointer-events-none">
          {/* Turf Boundary Lines */}
          <div className="absolute inset-4 rounded-[40px] border-2 border-white/25" />
          <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/20 transform -translate-x-1/2" />

          {/* Giant Center Pokéball Painting */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4 border-white/35 overflow-hidden flex flex-col opacity-50 shadow-inner">
            <div className="flex-1 bg-red-600/70 border-b-4 border-slate-950" />
            <div className="flex-1 bg-slate-200/80 border-t-4 border-slate-950" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-slate-950 border-4 border-white flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white shadow-[0_0_12px_#fff]" />
            </div>
          </div>
        </div>

        {/* Authentic Trajectory & Particle Move Animator Overlay */}
        {activeMoveAnim && (
          <MoveAnimation
            key={activeMoveAnim.id}
            move={activeMoveAnim.move}
            attackerSide={activeMoveAnim.attackerSide}
          />
        )}

        {/* --- TOP ROW: UNIFIED CARDS (LEFT = SEN / PLAYER 1, RIGHT = RAKİP / PLAYER 2) --- */}
        <div className="flex justify-between items-start z-10">
          {/* LEFT: Player 1 (You / Sen) Complete Battle Plate */}
          <div className={`bg-slate-900/95 border-2 ${p1CardBorder} rounded-2xl p-3 shadow-2xl backdrop-blur-md w-72 transform -skew-x-2`}>
            <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-slate-800">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${p1BadgeClass}`}>
                {p1Label}
              </span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full border transition-all ${
                      i < p1FaintedCount
                        ? 'bg-slate-800 border-slate-700 opacity-30'
                        : `${p1BallActive} border-white shadow-sm`
                    }`}
                    title={i < p1FaintedCount ? 'Bayıldı' : 'Hazır'}
                  />
                ))}
              </div>
            </div>

            {p1Active ? (
              <>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-sm text-white">{p1Active.name}</span>
                  <span className="text-[10px] font-mono font-bold text-amber-300">Lv. 50</span>
                </div>
                <div className="flex gap-1 mb-1.5">
                  {p1Active.types.map(t => (
                    <span key={t} className={`text-[9px] font-bold px-1.5 py-0.2 rounded type-${t}`}>{t}</span>
                  ))}
                </div>
                {/* Health Meter */}
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-700 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getHpColor(p1HpPercent)}`}
                    style={{ width: `${p1HpPercent}%` }}
                  />
                </div>
                <div className="text-right text-[11px] font-mono font-black text-slate-300 mt-1">
                  {p1Hp} / {p1MaxHp} HP
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-500 italic py-2 text-center">Bekleniyor...</div>
            )}
          </div>

          {/* RIGHT: Player 2 (Opponent / Rakip) Complete Battle Plate */}
          <div className={`bg-slate-900/95 border-2 ${p2CardBorder} rounded-2xl p-3 shadow-2xl backdrop-blur-md w-72 transform skew-x-2`}>
            <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-slate-800">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${p2BadgeClass}`}>
                {p2Label}
              </span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full border transition-all ${
                      i < p2FaintedCount
                        ? 'bg-slate-800 border-slate-700 opacity-30'
                        : `${p2BallActive} border-white shadow-sm`
                    }`}
                    title={i < p2FaintedCount ? 'Bayıldı' : 'Hazır'}
                  />
                ))}
              </div>
            </div>

            {p2Active ? (
              <>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-sm text-white">{p2Active.name}</span>
                  <span className="text-[10px] font-mono font-bold text-amber-300">Lv. 50</span>
                </div>
                <div className="flex gap-1 mb-1.5">
                  {p2Active.types.map(t => (
                    <span key={t} className={`text-[9px] font-bold px-1.5 py-0.2 rounded type-${t}`}>{t}</span>
                  ))}
                </div>
                {/* Health Meter */}
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-700 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getHpColor(p2HpPercent)}`}
                    style={{ width: `${p2HpPercent}%` }}
                  />
                </div>
                <div className="text-right text-[11px] font-mono font-black text-slate-300 mt-1">
                  {p2Hp} / {p2MaxHp} HP
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-500 italic py-2 text-center">Bekleniyor...</div>
            )}
          </div>
        </div>

        {/* --- CENTER ARENA: COMBATANTS DIRECTLY ANCHORED ON THEIR PEDESTALS --- */}
        <div className="relative flex-1 z-20 pointer-events-none">
          {/* Player 1 Combatant Group (Bottom-Left: Sprite directly standing on glowing green pedestal) */}
          <div
            className="absolute flex flex-col items-center"
            style={{ left: '20%', bottom: '6%', transform: 'translate(-50%, 0)' }}
          >
            {damagePopup?.target === 'p1' && (
              <div className="absolute -top-12 font-black text-xl text-red-400 font-mono damage-popup z-40">
                {damagePopup.text}
              </div>
            )}

            {p1Active && (
              <img
                src={p1Active.spriteBack || p1Active.sprite}
                alt={p1Active.name}
                className={`w-36 h-36 md:w-44 md:h-44 object-contain drop-shadow-[0_25px_30px_rgba(0,0,0,0.95)] transition-all duration-300 ${
                  lungeSide === 'p1' ? 'attacker-lunge-right' : ''
                } ${
                  shakeTarget === 'p1' ? (damagePopup?.isCrit ? 'shake-lg' : 'shake-sm') : ''
                } ${
                  hitTarget === 'p1' ? 'hit-flash' : ''
                } ${p1Hp <= 0 ? 'opacity-0 translate-y-8 duration-500' : 'opacity-100'}`}
              />
            )}
            {/* 3D Battle Pedestal physically anchored at its feet */}
            <div className={`w-56 h-20 -mt-7 ${p1IsYou ? 'battle-pad-p1 border-emerald-400/80' : 'battle-pad-p2 border-blue-400/80'} border-2 pointer-events-none`} />
          </div>

          {/* Player 2 Combatant Group (Top-Right: Sprite directly standing on glowing blue pedestal) */}
          <div
            className="absolute flex flex-col items-center"
            style={{ left: '78%', top: '16%', transform: 'translate(-50%, 0)' }}
          >
            {damagePopup?.target === 'p2' && (
              <div className="absolute -top-12 font-black text-xl text-blue-400 font-mono damage-popup z-40">
                {damagePopup.text}
              </div>
            )}

            {p2Active && (
              <img
                src={p2Active.sprite}
                alt={p2Active.name}
                className={`w-32 h-32 md:w-36 md:h-36 object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.9)] transition-all duration-300 ${
                  lungeSide === 'p2' ? 'attacker-lunge-left' : ''
                } ${
                  shakeTarget === 'p2' ? (damagePopup?.isCrit ? 'shake-lg' : 'shake-sm') : ''
                } ${
                  hitTarget === 'p2' ? 'hit-flash' : ''
                } ${p2Hp <= 0 ? 'opacity-0 translate-y-8 duration-500' : 'opacity-100'}`}
              />
            )}
            {/* 3D Battle Pedestal physically anchored at its feet */}
            <div className={`w-48 h-16 -mt-6 ${p2IsYou ? 'battle-pad-p1 border-emerald-400/80' : 'battle-pad-p2 border-blue-400/80'} border-2 pointer-events-none`} />
          </div>
        </div>

        {/* Bottom Spacer */}
        <div className="h-2 z-10" />
      </div>

      {/* --- BOTTOM ACTION ANNOUNCEMENT BAR --- */}
      <div className="mt-2 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-center shadow-lg backdrop-blur-md flex-shrink-0">
        <span className="font-mono text-xs md:text-sm font-bold text-amber-300 drop-shadow-sm tracking-wide">
          {announcement}
        </span>
      </div>
    </div>
  );
}


