import React, { useEffect, useState } from 'react';
import BattleCanvasVFX from './BattleCanvasVFX.jsx';

export default function MoveAnimation({
  move,
  attackerSide, // 'p1' | 'p2'
  onImpact,
  speed = 1
}) {
  const [phase, setPhase] = useState('launch'); // 'launch' -> 'impact' -> 'done'

  const moveName = move?.name || 'Tackle';
  const moveType = move?.type || 'Normal';
  const nameLower = moveName.toLowerCase();

  const isElectric = moveType === 'Electric' || nameLower.includes('thunder') || nameLower.includes('zap');
  const isFire = moveType === 'Fire' || nameLower.includes('fire') || nameLower.includes('flame');
  const isSplash = nameLower === 'splash';
  const isFighting =
    moveType === 'Fighting' ||
    nameLower.includes('punch') ||
    nameLower.includes('kick') ||
    nameLower.includes('combat') ||
    nameLower.includes('karate') ||
    nameLower.includes('submission') ||
    nameLower.includes('seismic');
  const isRockOrGround =
    moveType === 'Ground' ||
    moveType === 'Rock' ||
    nameLower.includes('earth') ||
    nameLower.includes('rock') ||
    nameLower.includes('fissure') ||
    nameLower.includes('slide') ||
    nameLower.includes('tomb') ||
    nameLower.includes('quake') ||
    nameLower.includes('dig') ||
    nameLower.includes('mud');

  const targetX = attackerSide === 'p1' ? '76%' : '22%';
  const targetY = attackerSide === 'p1' ? '32%' : '68%';

  useEffect(() => {
    const impactTimer = setTimeout(() => {
      setPhase('impact');
    }, 380 / speed);

    const doneTimer = setTimeout(() => {
      setPhase('done');
    }, 1050 / speed);

    return () => {
      clearTimeout(impactTimer);
      clearTimeout(doneTimer);
    };
  }, [moveName, speed]);

  if (phase === 'done') return null;

  // Complete 15 Gen 1 Move Type Theme Map
  const themeMap = {
    Fire: { color: '#ef4444', glow: '#f97316', bg: 'from-red-600 via-orange-500 to-amber-500' },
    Water: { color: '#3b82f6', glow: '#06b6d4', bg: 'from-blue-600 via-sky-500 to-cyan-400' },
    Electric: { color: '#eab308', glow: '#facc15', bg: 'from-yellow-500 via-amber-400 to-yellow-300' },
    Grass: { color: '#22c55e', glow: '#84cc16', bg: 'from-emerald-600 via-green-500 to-lime-400' },
    Ice: { color: '#38bdf8', glow: '#93c5fd', bg: 'from-sky-500 via-blue-400 to-indigo-300' },
    Psychic: { color: '#ec4899', glow: '#a855f7', bg: 'from-pink-600 via-fuchsia-500 to-purple-600' },
    Ghost: { color: '#6366f1', glow: '#a855f7', bg: 'from-indigo-600 via-purple-600 to-violet-800' },
    Poison: { color: '#a855f7', glow: '#d946ef', bg: 'from-purple-600 via-fuchsia-500 to-pink-600' },
    Dragon: { color: '#4f46e5', glow: '#818cf8', bg: 'from-indigo-700 via-blue-600 to-cyan-500' },
    Fighting: { color: '#dc2626', glow: '#ef4444', bg: 'from-red-800 via-rose-700 to-red-600' },
    Ground: { color: '#d97706', glow: '#f59e0b', bg: 'from-amber-700 via-yellow-600 to-orange-500' },
    Rock: { color: '#78716c', glow: '#a8a29e', bg: 'from-stone-600 via-zinc-500 to-neutral-400' },
    Flying: { color: '#0284c7', glow: '#38bdf8', bg: 'from-sky-600 via-cyan-500 to-blue-500' },
    Bug: { color: '#65a30d', glow: '#a3e635', bg: 'from-lime-600 via-emerald-600 to-lime-500' },
    Normal: { color: '#94a3b8', glow: '#e2e8f0', bg: 'from-slate-600 via-slate-400 to-slate-200' }
  };

  const theme = themeMap[moveType] || themeMap.Normal;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden select-none">
      {/* 1. Dramatic Anime Move Callout Banner */}
      <div className="absolute top-4 inset-x-0 flex justify-center z-50 animate-slide-down pointer-events-none">
        <div className={`px-6 py-1.5 rounded-2xl bg-gradient-to-r ${theme.bg} text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-2xl shadow-black/90 border-2 border-white/50 flex items-center gap-2 transform -skew-x-6 backdrop-blur-md`}>
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <span className="drop-shadow-md">{moveName}</span>
          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-black/40 text-white font-bold ml-1">
            {moveType}
          </span>
        </div>
      </div>

      {/* Screen Strobe Flash on Impact */}
      {isElectric && phase === 'impact' && (
        <div className="absolute inset-0 bg-yellow-200/20 z-40 animate-ping pointer-events-none" />
      )}
      {isFire && phase === 'impact' && (
        <div className="absolute inset-0 bg-red-600/15 z-40 animate-ping pointer-events-none" />
      )}

      {/* 2. Premium 60fps HTML5 Canvas Procedural Particle & Energy Engine */}
      <BattleCanvasVFX
        move={move}
        attackerSide={attackerSide}
        onImpact={onImpact}
        speed={speed}
      />

      {/* 3. Authentic Falling Boulder / Rock Drop on Target */}
      {isRockOrGround && (
        <div
          className="absolute w-32 h-32 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none flex items-center justify-center"
          style={{ left: targetX, top: targetY }}
        >
          {/* Main Giant Rock / Boulder plunging down from sky */}
          <img
            src="/fx/rocks.png"
            alt="falling-rocks"
            className="w-28 h-28 object-contain anim-rock-fall drop-shadow-[0_10px_25px_rgba(0,0,0,0.85)]"
          />

          {/* Secondary Rock Shard */}
          <img
            src="/fx/rock1.png"
            alt="rock-shard"
            className="absolute top-2 right-2 w-12 h-12 object-contain anim-rock-fall"
            style={{ animationDelay: '0.08s' }}
          />

          {/* Impact Dust Burst */}
          {phase === 'impact' && (
            <img
              src="/fx/impact.png"
              alt="impact"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 object-contain anim-impact-burst drop-shadow-[0_0_25px_#f59e0b]"
            />
          )}
        </div>
      )}

      {/* 4. Fighting / Melee Rapid Fist Strike Flurry (Close Combat, Mega Punch) */}
      {isFighting && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
          style={{ left: targetX, top: targetY }}
        >
          {/* Rapid Fist Strikes */}
          <img
            src="/fx/fist.png"
            alt="fist-strike-1"
            className="w-24 h-24 object-contain anim-punch-1 drop-shadow-[0_0_15px_#ef4444]"
          />
          <img
            src="/fx/fist.png"
            alt="fist-strike-2"
            className="absolute top-2 -left-6 w-24 h-24 object-contain anim-punch-2 drop-shadow-[0_0_15px_#dc2626]"
            style={{ animationDelay: '0.08s' }}
          />
          <img
            src="/fx/fist.png"
            alt="fist-strike-3"
            className="absolute -top-6 left-4 w-28 h-28 object-contain anim-punch-3 drop-shadow-[0_0_20px_#ffffff]"
            style={{ animationDelay: '0.16s' }}
          />
          {phase === 'impact' && (
            <img
              src="/fx/impact.png"
              alt="impact"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 object-contain anim-impact-burst drop-shadow-[0_0_20px_#ef4444]"
            />
          )}
        </div>
      )}

      {/* Magikarp Easter Egg */}
      {isSplash && phase === 'impact' && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-50"
          style={{ left: attackerSide === 'p1' ? '77%' : '22%', top: attackerSide === 'p1' ? '32%' : '68%' }}
        >
          <div className="mt-2 text-xs font-bold text-amber-300 font-mono bg-black/75 px-3.5 py-1 rounded-full shadow-xl border border-amber-400/50">
            Hiçbir şey olmadı...
          </div>
        </div>
      )}
    </div>
  );
}
