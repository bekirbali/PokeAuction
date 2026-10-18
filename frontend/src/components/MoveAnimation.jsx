import React, { useEffect, useState } from 'react';

export default function MoveAnimation({
  move,
  attackerSide, // 'p1' | 'p2'
  onImpact
}) {
  const [phase, setPhase] = useState('launch'); // 'launch' -> 'impact' -> 'done'

  const isP1 = attackerSide === 'p1';
  // Target coordinates in the widescreen arena:
  // P1 pad is at ~ (24%, 68%)
  // P2 pad is at ~ (76%, 32%)
  const targetX = isP1 ? '76%' : '24%';
  const targetY = isP1 ? '32%' : '68%';
  const travelClass = isP1 ? 'anim-travel-p1-p2' : 'anim-travel-p2-p1';

  const moveName = move?.name || 'Tackle';
  const moveType = move?.type || 'Normal';

  useEffect(() => {
    const impactTimer = setTimeout(() => {
      setPhase('impact');
      if (onImpact) onImpact();
    }, 360);

    const doneTimer = setTimeout(() => {
      setPhase('done');
    }, 950);

    return () => {
      clearTimeout(impactTimer);
      clearTimeout(doneTimer);
    };
  }, [moveName]);

  if (phase === 'done') return null;

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
    Fighting: { color: '#b91c1c', glow: '#f97316', bg: 'from-red-700 via-rose-600 to-amber-600' },
    Ground: { color: '#d97706', glow: '#f59e0b', bg: 'from-amber-700 via-yellow-600 to-orange-500' },
    Rock: { color: '#78716c', glow: '#a8a29e', bg: 'from-stone-600 via-zinc-500 to-neutral-400' },
    Normal: { color: '#94a3b8', glow: '#e2e8f0', bg: 'from-slate-600 via-slate-400 to-slate-200' }
  };

  const theme = themeMap[moveType] || themeMap.Normal;

  // Move Classification
  const isFire = moveType === 'Fire' || ['Flamethrower', 'Fire Blast', 'Ember', 'Fire Spin'].includes(moveName);
  const isElectric = moveType === 'Electric' || ['Thunderbolt', 'Thunder', 'Thunder Shock', 'Zap Cannon', 'Spark'].includes(moveName);
  const isWater = moveType === 'Water' || ['Hydro Pump', 'Surf', 'Water Gun', 'Bubble Beam', 'Waterfall'].includes(moveName);
  const isIce = moveType === 'Ice' || ['Ice Beam', 'Blizzard', 'Ice Punch', 'Aurora Beam'].includes(moveName);
  const isGrass = moveType === 'Grass' || ['Razor Leaf', 'Solar Beam', 'Vine Whip', 'Mega Drain'].includes(moveName);
  const isSlash = ['Slash', 'Dragon Claw', 'Scratch', 'Cut', 'Fury Swipes', 'Shadow Claw', 'X-Scissor', 'Cross Chop'].includes(moveName);
  const isBite = ['Bite', 'Crunch', 'Hyper Fang', 'Super Fang'].includes(moveName);
  const isGhostOrPsychic = ['Psychic', 'Shadow Ball', 'Night Shade', 'Psybeam', 'Hypnosis', 'Confusion', 'Dream Eater'].includes(moveName) || moveType === 'Ghost' || moveType === 'Psychic';
  const isRockOrGround = ['Earthquake', 'Rock Slide', 'Dig', 'Earth Power', 'Rock Throw', 'Fissure'].includes(moveName) || moveType === 'Ground' || moveType === 'Rock';
  const isBeam = ['Hyper Beam', 'Swift', 'Flash Cannon'].includes(moveName);
  const isSplash = moveName === 'Splash';

  // Default to Physical Strike (Body Slam, Tackle, Mega Punch, etc.)
  const isPhysical = !isFire && !isElectric && !isWater && !isIce && !isGrass && !isSlash && !isBite && !isGhostOrPsychic && !isRockOrGround && !isBeam && !isSplash;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden select-none">
      {/* 1. Dramatic Anime Move Callout Banner */}
      <div className="absolute top-4 inset-x-0 flex justify-center z-50 animate-slide-down">
        <div className={`px-6 py-1.5 rounded-2xl bg-gradient-to-r ${theme.bg} text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-black/90 border-2 border-white/50 flex items-center gap-2 transform -skew-x-6 backdrop-blur-md`}>
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <span className="drop-shadow-md">{moveName}</span>
          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-black/40 text-white font-bold ml-1">
            {moveType}
          </span>
        </div>
      </div>

      {/* Screen Strobe Flash for Electric */}
      {isElectric && phase === 'impact' && (
        <div className="absolute inset-0 bg-yellow-200/25 z-40 animate-ping pointer-events-none" />
      )}

      {/* Screen Red Flash for Fire */}
      {isFire && phase === 'impact' && (
        <div className="absolute inset-0 bg-red-600/15 z-40 animate-ping pointer-events-none" />
      )}

      {/* --- 1. FIRE ATTACKS (Flamethrower, Fire Blast) --- */}
      {isFire && (
        <>
          {/* Flying Fireball Stream */}
          <img
            src="/fx/flareball.png"
            alt="fire"
            className={`absolute w-20 h-20 object-contain drop-shadow-[0_0_15px_#ff4500] ${travelClass}`}
          />
          <img
            src="/fx/fireball.png"
            alt="fire"
            className={`absolute w-16 h-16 object-contain drop-shadow-[0_0_12px_#f97316] ${travelClass}`}
            style={{ animationDelay: '0.08s' }}
          />
          <img
            src="/fx/flareball.png"
            alt="fire"
            className={`absolute w-14 h-14 object-contain drop-shadow-[0_0_10px_#eab308] ${travelClass}`}
            style={{ animationDelay: '0.16s' }}
          />

          {/* Impact Blast on Target */}
          {phase === 'impact' && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
              style={{ left: targetX, top: targetY }}
            >
              <img
                src="/fx/flareball.png"
                alt="blast"
                className="w-32 h-32 object-contain anim-impact-burst drop-shadow-[0_0_25px_#ff2200]"
              />
              <img
                src="/fx/impact.png"
                alt="impact"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 object-contain animate-ping"
              />
            </div>
          )}
        </>
      )}

      {/* --- 2. ELECTRIC ATTACKS (Thunderbolt, Thunder) --- */}
      {isElectric && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
          style={{ left: targetX, top: targetY }}
        >
          {/* Giant Sky Lightning Strike */}
          <img
            src="/fx/lightning.png"
            alt="lightning"
            className="w-36 h-64 object-contain anim-lightning-strike drop-shadow-[0_0_30px_#facc15]"
          />
          <img
            src="/fx/electroball.png"
            alt="spark"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 object-contain animate-spin drop-shadow-[0_0_20px_#eab308]"
          />
          {phase === 'impact' && (
            <img
              src="/fx/hitmarker.png"
              alt="hit"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 object-contain anim-impact-burst"
            />
          )}
        </div>
      )}

      {/* --- 3. WATER ATTACKS (Hydro Pump, Surf) --- */}
      {isWater && (
        <>
          <img
            src="/fx/waterwisp.png"
            alt="water"
            className={`absolute w-24 h-24 object-contain drop-shadow-[0_0_18px_#38bdf8] ${travelClass}`}
          />
          <img
            src="/fx/mistball.png"
            alt="water"
            className={`absolute w-16 h-16 object-contain drop-shadow-[0_0_12px_#0284c7] ${travelClass}`}
            style={{ animationDelay: '0.1s' }}
          />
          {phase === 'impact' && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
              style={{ left: targetX, top: targetY }}
            >
              <img
                src="/fx/waterwisp.png"
                alt="splash"
                className="w-36 h-36 object-contain anim-impact-burst drop-shadow-[0_0_25px_#0284c7]"
              />
              <img
                src="/fx/impact.png"
                alt="hit"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 object-contain animate-ping"
              />
            </div>
          )}
        </>
      )}

      {/* --- 4. ICE ATTACKS (Ice Beam, Blizzard) --- */}
      {isIce && (
        <>
          <img
            src="/fx/icicle.png"
            alt="icicle"
            className={`absolute w-20 h-20 object-contain drop-shadow-[0_0_15px_#7dd3fc] ${travelClass}`}
          />
          <img
            src="/fx/iceball.png"
            alt="ice"
            className={`absolute w-14 h-14 object-contain drop-shadow-[0_0_10px_#38bdf8] ${travelClass}`}
            style={{ animationDelay: '0.12s' }}
          />
          {phase === 'impact' && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
              style={{ left: targetX, top: targetY }}
            >
              <img
                src="/fx/iceball.png"
                alt="frost"
                className="w-32 h-32 object-contain anim-impact-burst drop-shadow-[0_0_20px_#bae6fd]"
              />
              <img
                src="/fx/shine.png"
                alt="shine"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 object-contain animate-ping"
              />
            </div>
          )}
        </>
      )}

      {/* --- 5. GRASS ATTACKS (Razor Leaf, Solar Beam) --- */}
      {isGrass && (
        <>
          <img
            src="/fx/leaf1.png"
            alt="leaf"
            className={`absolute w-14 h-14 object-contain drop-shadow-[0_0_12px_#4ade80] ${travelClass}`}
          />
          <img
            src="/fx/leaf2.png"
            alt="leaf"
            className={`absolute w-14 h-14 object-contain drop-shadow-[0_0_12px_#22c55e] ${travelClass}`}
            style={{ animationDelay: '0.08s' }}
          />
          <img
            src="/fx/petal.png"
            alt="petal"
            className={`absolute w-12 h-12 object-contain drop-shadow-[0_0_10px_#86efac] ${travelClass}`}
            style={{ animationDelay: '0.15s' }}
          />
          {phase === 'impact' && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
              style={{ left: targetX, top: targetY }}
            >
              <img
                src="/fx/energyball.png"
                alt="energy"
                className="w-28 h-28 object-contain anim-impact-burst drop-shadow-[0_0_20px_#22c55e]"
              />
            </div>
          )}
        </>
      )}

      {/* --- 6. SLASHING / CLAW ATTACKS (Slash, Dragon Claw) --- */}
      {isSlash && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
          style={{ left: targetX, top: targetY }}
        >
          {/* Dual Diagonal Razor Slashes */}
          <img
            src="/fx/leftslash.png"
            alt="slash1"
            className="w-32 h-32 object-contain anim-slash-1 drop-shadow-[0_0_20px_#ffffff]"
          />
          <img
            src="/fx/rightslash.png"
            alt="slash2"
            className="absolute top-0 left-0 w-32 h-32 object-contain anim-slash-2 drop-shadow-[0_0_20px_#ef4444]"
          />
          {phase === 'impact' && (
            <img
              src="/fx/hitmarker.png"
              alt="hit"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 object-contain animate-ping"
            />
          )}
        </div>
      )}

      {/* --- 7. BITE / CRUNCH ATTACKS --- */}
      {isBite && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
          style={{ left: targetX, top: targetY }}
        >
          {/* Top and Bottom Jaws Clamping Down */}
          <img
            src="/fx/topbite.png"
            alt="topbite"
            className="w-24 h-24 object-contain anim-bite-top drop-shadow-[0_0_15px_#ffffff]"
          />
          <img
            src="/fx/bottombite.png"
            alt="bottombite"
            className="w-24 h-24 object-contain anim-bite-bottom drop-shadow-[0_0_15px_#ffffff]"
          />
          {phase === 'impact' && (
            <img
              src="/fx/impact.png"
              alt="impact"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 object-contain anim-impact-burst"
            />
          )}
        </div>
      )}

      {/* --- 8. GHOST / PSYCHIC ATTACKS (Psychic, Shadow Ball) --- */}
      {isGhostOrPsychic && (
        <>
          <img
            src="/fx/shadowball.png"
            alt="shadowball"
            className={`absolute w-20 h-20 object-contain drop-shadow-[0_0_20px_#a855f7] ${travelClass}`}
          />
          <img
            src="/fx/purplewisp.png"
            alt="wisp"
            className={`absolute w-14 h-14 object-contain drop-shadow-[0_0_15px_#d946ef] ${travelClass}`}
            style={{ animationDelay: '0.08s' }}
          />
          {phase === 'impact' && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
              style={{ left: targetX, top: targetY }}
            >
              <img
                src="/fx/purplewisp.png"
                alt="burst"
                className="w-32 h-32 object-contain anim-impact-burst drop-shadow-[0_0_25px_#a855f7]"
              />
              <img
                src="/fx/hitmarker.png"
                alt="hit"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 object-contain animate-ping"
              />
            </div>
          )}
        </>
      )}

      {/* --- 9. ROCK / GROUND ATTACKS (Earthquake, Rock Slide) --- */}
      {isRockOrGround && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
          style={{ left: targetX, top: targetY }}
        >
          <img
            src="/fx/rocks.png"
            alt="rocks"
            className="w-32 h-32 object-contain anim-rock-erupt drop-shadow-[0_0_20px_#d97706]"
          />
          <img
            src="/fx/rock1.png"
            alt="rock"
            className="absolute top-0 left-0 w-20 h-20 object-contain anim-rock-erupt"
            style={{ animationDelay: '0.08s' }}
          />
          {phase === 'impact' && (
            <img
              src="/fx/impact.png"
              alt="impact"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 object-contain animate-ping"
            />
          )}
        </div>
      )}

      {/* --- 10. SPECIAL BEAMS (Hyper Beam, Swift) --- */}
      {isBeam && (
        <>
          <img
            src="/fx/energyball.png"
            alt="beam"
            className={`absolute w-24 h-24 object-contain drop-shadow-[0_0_30px_#ffffff] ${travelClass}`}
          />
          <img
            src="/fx/shine.png"
            alt="shine"
            className={`absolute w-20 h-20 object-contain drop-shadow-[0_0_20px_#fde047] ${travelClass}`}
            style={{ animationDelay: '0.06s' }}
          />
          {phase === 'impact' && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
              style={{ left: targetX, top: targetY }}
            >
              <img
                src="/fx/shine.png"
                alt="nova"
                className="w-40 h-40 object-contain anim-impact-burst drop-shadow-[0_0_35px_#ffffff]"
              />
            </div>
          )}
        </>
      )}

      {/* --- 11. PHYSICAL ATTACKS (Body Slam, Tackle, Mega Punch) --- */}
      {isPhysical && (
        <>
          <img
            src="/fx/fist.png"
            alt="fist"
            className={`absolute w-16 h-16 object-contain drop-shadow-[0_0_15px_#ffffff] ${travelClass}`}
          />
          {phase === 'impact' && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
              style={{ left: targetX, top: targetY }}
            >
              <img
                src="/fx/impact.png"
                alt="impact"
                className="w-32 h-32 object-contain anim-impact-burst drop-shadow-[0_0_20px_#f97316]"
              />
              <img
                src="/fx/hitmarker.png"
                alt="hit"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 object-contain animate-ping"
              />
            </div>
          )}
        </>
      )}

      {/* --- 12. MAGIKARP SPLASH --- */}
      {isSplash && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
          style={{ left: targetX, top: targetY }}
        >
          <img
            src="/fx/waterwisp.png"
            alt="splash"
            className="w-12 h-12 object-contain animate-bounce drop-shadow-[0_0_10px_#38bdf8]"
          />
          <div className="mt-2 text-xs font-bold text-amber-300 font-mono bg-black/60 px-3 py-1 rounded-full">
            Hiçbir şey olmadı...
          </div>
        </div>
      )}
    </div>
  );
}

