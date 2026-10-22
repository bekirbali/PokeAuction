import React, { useState, useEffect, useRef } from 'react';
import { FastForward, Play, Pause, Volume2, VolumeX, Menu, X, Info } from 'lucide-react';
import MoveAnimation from './MoveAnimation.jsx';
import TypeRadarModal from './TypeRadarModal.jsx';
import { sound } from '../utils/sound.js';

export default function BattleArena({
  battleData,
  playerId,
  room,
  socket,
  onBattleEnd,
  onMuteToggle,
  isMuted
}) {
  const { team1, team2, timeline, winnerId, mvp, matchId } = battleData;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(() => battleData?.battleSpeed || room?.battleSpeed || 1);
  const [isPaused, setIsPaused] = useState(false);
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef(null);

  const isHost = Boolean(room?.isBotGame || !room || room.players?.[0]?.id === playerId || room.players?.some(p => p.isBot));

  useEffect(() => {
    if (!socket) return;
    const handleSpeedUpdate = ({ speed: newSpeed }) => {
      if (newSpeed) setSpeed(newSpeed);
    };
    socket.on('BATTLE_SPEED_UPDATED', handleSpeedUpdate);
    return () => {
      socket.off('BATTLE_SPEED_UPDATED', handleSpeedUpdate);
    };
  }, [socket]);

  const handleSpeedChange = (newSpeed) => {
    if (!isHost) return;
    setSpeed(newSpeed);
    if (socket) {
      socket.emit('SET_BATTLE_SPEED', { speed: newSpeed });
    }
  };

  // Active Battle State
  const [p1Active, setP1Active] = useState(null);
  const [p2Active, setP2Active] = useState(null);
  const [p1Hp, setP1Hp] = useState(0);
  const [p2Hp, setP2Hp] = useState(0);
  const [p1MaxHp, setP1MaxHp] = useState(100);
  const [p2MaxHp, setP2MaxHp] = useState(100);

  const [p1FaintedCount, setP1FaintedCount] = useState(0);
  const [p2FaintedCount, setP2FaintedCount] = useState(0);

  const [announcement, setAnnouncement] = useState('Pokémon Ligi Şampiyonası Başlıyor...');
  const [damagePopup, setDamagePopup] = useState(null);
  const [shakeTarget, setShakeTarget] = useState(null);
  const [lungeSide, setLungeSide] = useState(null);
  const [hitTarget, setHitTarget] = useState(null);
  const [activeMoveAnim, setActiveMoveAnim] = useState(null);
  const [arenaShake, setArenaShake] = useState(null); // 'crit' | 'earthquake' | null
  const [isCritFlash, setIsCritFlash] = useState(false);

  const timerRef = useRef(null);

  // Stop attack SFX on component unmount
  useEffect(() => {
    return () => {
      sound.stopAttackSound(0);
    };
  }, []);

  // Close mobile settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMobileMenu(false);
      }
    };
    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showMobileMenu]);

  useEffect(() => {
    if (isPaused || currentIndex >= timeline.length) {
      if (currentIndex >= timeline.length && timeline.length > 0) {
        sound.stopAttackSound(80);
        const timer = setTimeout(() => {
          onBattleEnd({ winnerId, mvp, matchId });
        }, 2200);
        return () => clearTimeout(timer);
      }
      return;
    }

    sound.stopAttackSound(60);
    const event = timeline[currentIndex];
    let stepDelay = 2000 / speed;

    if (event.type === 'ENTER_FIELD') {
      stepDelay = 700 / speed;
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

    } else if (event.type === 'TRANSFORM') {
      stepDelay = 1900 / speed;
      const isP1 = event.playerId === team1.id;
      if (isP1) {
        setP1Active(prev => ({
          ...prev,
          name: `Ditto (${event.targetName})`,
          sprite: event.targetPokemon.sprite,
          spriteBack: event.targetPokemon.spriteBack,
          types: event.targetPokemon.types,
          moves: event.targetPokemon.moves
        }));
      } else {
        setP2Active(prev => ({
          ...prev,
          name: `Ditto (${event.targetName})`,
          sprite: event.targetPokemon.sprite,
          spriteBack: event.targetPokemon.spriteBack,
          types: event.targetPokemon.types,
          moves: event.targetPokemon.moves
        }));
      }

      setAnnouncement(`✨ Ditto Transform kullandı! ${event.targetName}'e dönüştü!`);
      sound.playTransform();
      setActiveMoveAnim({
        move: { name: 'Transform', type: 'Normal' },
        attackerSide: isP1 ? 'p1' : 'p2',
        id: currentIndex
      });

      if (event.targetPokemon.cryUrl) {
        setTimeout(() => sound.playCry(event.targetPokemon.cryUrl), 350 / speed);
      }

      setTimeout(() => {
        setActiveMoveAnim(null);
      }, 1100 / speed);

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
      sound.playElementalAttack(event.move.type, event.move.name, speed);

      setActiveMoveAnim({
        move: event.move,
        attackerSide,
        id: currentIndex
      });

      const hitTimeout = setTimeout(() => {
        sound.playHit(event.isCrit, event.effectiveness);
        setHitTarget(targetSide);
        setShakeTarget(targetSide);

        const moveNameLower = (event.move?.name || '').toLowerCase();
        const isGroundMove = event.move?.type === 'Ground' || moveNameLower.includes('earth') || moveNameLower.includes('fissure');
        
        if (isGroundMove) {
          setArenaShake('earthquake');
        } else if (event.isCrit) {
          setArenaShake('crit');
          setIsCritFlash(true);
          setTimeout(() => setIsCritFlash(false), 280);
        }

        if (targetSide === 'p1') {
          setP1Hp(event.defenderRemainingHp);
        } else {
          setP2Hp(event.defenderRemainingHp);
        }

        setDamagePopup({
          target: targetSide,
          damage: event.damage,
          isCrit: event.isCrit,
          effectiveness: event.effectiveness
        });
      }, 380 / speed);

      const resetTimeout = setTimeout(() => {
        setLungeSide(null);
        setActiveMoveAnim(null);
        setHitTarget(null);
        setShakeTarget(null);
        setArenaShake(null);
        setDamagePopup(null);
      }, 1200 / speed);

      timerRef.current = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, stepDelay);

      return () => {
        clearTimeout(hitTimeout);
        clearTimeout(resetTimeout);
        if (timerRef.current) clearTimeout(timerRef.current);
        sound.stopAttackSound(80);
      };

    } else if (event.type === 'FAINT') {
      stepDelay = 750 / speed;
      const isP1 = event.playerId === team1.id;
      const faintedPk = isP1 ? p1Active : p2Active;
      sound.playFaint(faintedPk?.cryUrl);
      if (isP1) {
        setP1FaintedCount(prev => prev + 1);
      } else {
        setP2FaintedCount(prev => prev + 1);
      }
      setAnnouncement(`💀 ${event.pokemon} bayıldı!`);

    } else if (event.type === 'VICTORY') {
      stepDelay = 2200 / speed;
      // Do not play victory music here; it plays on the MatchSummary victory screen to prevent double playback
      const winnerName = event.winnerId === team1.id ? team1.name : team2.name;
      setAnnouncement(`🏆 Zafer ${winnerName}'in!`);
    }

    timerRef.current = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, stepDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      sound.stopAttackSound(80);
    };
  }, [currentIndex, isPaused, speed, timeline]);

  const p1HpPercent = p1MaxHp > 0 ? Math.max(0, (p1Hp / p1MaxHp) * 100) : 0;
  const p2HpPercent = p2MaxHp > 0 ? Math.max(0, (p2Hp / p2MaxHp) * 100) : 0;

  const getHpColor = (percent) => {
    if (percent > 50) return 'bg-emerald-500';
    if (percent > 20) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const LARGE_POKEMON_SLUGS = new Set([
    'onix', 'gyarados', 'snorlax', 'dragonite', 'lapras',
    'charizard', 'blastoise', 'venusaur', 'cloyster', 'arcanine',
    'rhydon', 'kangaskhan', 'golem', 'machamp', 'tauros',
    'aerodactyl', 'articuno', 'zapdos', 'moltres', 'mewtwo',
    'muk', 'exeggutor', 'scyther', 'pinsir', 'tentacruel', 'slowbro'
  ]);

  const TINY_POKEMON_SLUGS = new Set([
    'bulbasaur', 'charmander', 'squirtle', 'caterpie', 'metapod', 'weedle', 'kakuna',
    'pidgey', 'pidgeotto', 'rattata', 'spearow', 'ekans', 'pikachu', 'sandshrew',
    'nidoranf', 'nidoranm', 'nidoran', 'nidorino', 'nidorina', 'clefairy', 'vulpix', 'jigglypuff', 'zubat',
    'oddish', 'paras', 'venonat', 'diglett', 'dugtrio', 'meowth', 'psyduck',
    'mankey', 'growlithe', 'poliwag', 'abra', 'machop', 'bellsprout', 'tentacool',
    'geodude', 'magnemite', 'farfetchd', 'doduo', 'seel', 'grimer', 'shellder',
    'gastly', 'drowzee', 'krabby', 'voltorb', 'exeggcute', 'cubone', 'koffing',
    'horsea', 'goldeen', 'staryu', 'ditto', 'eevee', 'porygon', 'omanyte', 'kabuto', 'dratini', 'mew',
    'jolteon', 'vaporeon', 'flareon'
  ]);

  const isLegendaryPokemon = (p) => p && p.tier === 'Legendary' && (p.slug || p.name || '').toLowerCase() !== 'mew';
  const isLargePokemon = (p) => {
    if (!p) return false;
    const slug = (p.slug || p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (slug === 'mew' || slug === 'jolteon' || slug === 'vaporeon' || slug === 'flareon' || slug === 'nidorino' || slug === 'nidorina') return false;
    return LARGE_POKEMON_SLUGS.has(slug);
  };
  const isTinyPokemon = (p) => {
    if (!p) return false;
    const raw = (p.slug || p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (raw === 'mew') return true;
    if (raw === 'nidoking' || raw === 'nidoqueen') return false;
    return TINY_POKEMON_SLUGS.has(raw) || raw.startsWith('nidoran');
  };

  const getSpriteOffset = (pokemon, isBack = false) => {
    if (!pokemon) return '';
    const slug = (pokemon.slug || pokemon.name || '').toLowerCase();
    if (!isBack && slug === 'mewtwo') return 'translate-x-[10%]';
    return '';
  };

  const getSpriteSize = (pokemon, isBack = false) => {
    if (!pokemon) return 'w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36';
    const isLeg = isLegendaryPokemon(pokemon);
    const isLarge = isLargePokemon(pokemon);
    const isTiny = isTinyPokemon(pokemon);

    if (isLeg) {
      return isBack
        ? 'w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56'
        : 'w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48';
    }
    if (isLarge) {
      return isBack
        ? 'w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48'
        : 'w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44';
    }
    if (isTiny) {
      return isBack
        ? 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32'
        : 'w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24';
    }
    // Standard Pokemon (e.g. Jynx, Alakazam, Gengar, Electabuzz, Raichu)
    return isBack
      ? 'w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40'
      : 'w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36';
  };

  const getAuraClass = (pokemon) => '';

  // Dynamic Player Perspective (Sol taraf veya sağ taraf oyuncunun kendi kimliğine göre SEN / RAKİP olur)
  const isP1You = team1.id === playerId;
  const isP2You = team2.id === playerId;

  const p1Label = isP1You ? `SEN • ${team1.name}` : isP2You ? `RAKİP • ${team1.name}` : `1. OYUNCU • ${team1.name}`;
  const p2Label = isP2You ? `SEN • ${team2.name}` : isP1You ? `RAKİP • ${team2.name}` : `2. OYUNCU • ${team2.name}`;

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
      <div className="flex justify-between items-center bg-slate-900/80 border border-slate-800 rounded-xl px-3 sm:px-4 py-1.5 backdrop-blur-md flex-shrink-0 mb-1.5 sm:mb-2 relative z-30">
        {/* Left: Arena Badge & Match Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 mr-2">
          <span className="text-[9px] sm:text-[10px] uppercase font-black px-2 sm:px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 flex-shrink-0 tracking-wider">
            <span className="sm:hidden">LİG ARENASI</span>
            <span className="hidden sm:inline">POKEMON LİGİ ARENASI</span>
          </span>
          <span className="text-xs text-slate-200 font-bold truncate">
            {team1.name} <span className="text-amber-400 font-black">vs</span> {team2.name}
            <span className="hidden md:inline text-slate-400"> · Meydan Savaşı</span>
          </span>
        </div>

        {/* Right Desktop: Visible Controls */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          {/* Element Radar Button */}
          <button
            onClick={() => {
              setIsPaused(true);
              setIsRadarOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            title="Element Üstünlük Radarı"
          >
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Elementler</span>
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => {
              if (isHost) {
                const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
                handleSpeedChange(nextSpeed);
              }
            }}
            disabled={!isHost}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition ${
              isHost
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 cursor-pointer'
                : 'bg-slate-800/40 text-slate-500 cursor-not-allowed border border-slate-800'
            }`}
            title={isHost ? "Oynatma Hızı" : "Hız ayarı oda kurucusu (Host) kontrolündedir"}
          >
            <FastForward className="w-3 h-3" />
            {speed}x
            {!isHost && <span className="text-[9px] text-slate-500 font-sans font-normal ml-0.5">(Host)</span>}
          </button>

          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused(p => !p)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title={isPaused ? 'Devam Et' : 'Duraklat'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Mute */}
          <button
            onClick={onMuteToggle}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>

        {/* Right Mobile: Hamburger Button & Dropdown Menu */}
        <div className="sm:hidden flex items-center relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMobileMenu(prev => !prev)}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              showMobileMenu
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Savaş Menüsü"
            aria-label="Savaş Menüsü"
          >
            {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Mobile Dropdown Popover */}
          {showMobileMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl z-50 space-y-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Savaş Ayarları
              </div>

              {/* Element Rehberi Button */}
              <button
                type="button"
                onClick={() => {
                  setShowMobileMenu(false);
                  setIsPaused(true);
                  setIsRadarOpen(true);
                }}
                className="w-full py-1.5 px-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs font-bold flex items-center justify-between text-amber-300 hover:bg-amber-950/50 transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>Element Rehberi</span>
                </div>
                <span className="text-[10px] text-amber-400/80 font-mono">15 Tip</span>
              </button>

              {/* Speed Controller */}
              <div className="bg-slate-950/70 rounded-xl p-1.5 border border-slate-800">
                <div className="text-[9px] text-slate-400 font-semibold mb-1 flex items-center justify-between">
                  <span>Hız {!isHost && <span className="text-slate-500 text-[8px]">(Host)</span>}</span>
                  <span className="font-mono text-amber-400 font-bold">{speed}x</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[1, 1.5, 2].map(s => (
                    <button
                      key={s}
                      disabled={!isHost}
                      onClick={() => handleSpeedChange(s)}
                      className={`py-1 rounded-lg text-xs font-mono font-bold transition ${
                        speed === s
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : isHost
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer'
                          : 'bg-slate-900/40 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Pause / Resume */}
              <button
                type="button"
                onClick={() => setIsPaused(p => !p)}
                className={`w-full py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                  isPaused
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <span>{isPaused ? 'Devam Ettir' : 'Duraklat'}</span>
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              {/* Mute Toggle */}
              <button
                type="button"
                onClick={onMuteToggle}
                className="w-full py-1.5 px-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold flex items-center justify-between text-slate-200 hover:bg-slate-700 transition cursor-pointer"
              >
                <span>{isMuted ? 'Sesi Aç' : 'Sesi Kapat'}</span>
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- HORIZONTAL WIDESCREEN BATTLE STADIUM --- */}
      <div className={`relative rounded-3xl overflow-hidden border-2 border-slate-700/80 bg-gradient-to-b from-slate-950 via-[#0a1120] to-slate-950 shadow-2xl flex-1 flex flex-col justify-between p-2.5 sm:p-4 min-h-[360px] sm:min-h-[460px] stadium-container ${
        arenaShake === 'crit' ? 'arena-shake' : arenaShake === 'earthquake' ? 'arena-earthquake' : ''
      }`}>
        
        {/* Critical Radial Strobe Flash Overlay */}
        {isCritFlash && (
          <div className="absolute inset-0 bg-radial from-amber-300/50 via-yellow-400/25 to-transparent pointer-events-none z-50 anim-crit-flash" />
        )}

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
        <div className="absolute inset-x-2 sm:inset-x-6 md:inset-x-12 top-8 sm:top-10 bottom-4 sm:bottom-6 stadium-pitch rounded-[32px] sm:rounded-[48px] overflow-hidden border-2 sm:border-4 border-amber-500/35 bg-gradient-to-r from-[#0d281e] via-[#164732] to-[#0d281e] pointer-events-none">
          {/* Turf Boundary Lines */}
          <div className="absolute inset-2 sm:inset-4 rounded-[28px] sm:rounded-[40px] border-2 border-white/25" />
          <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/20 transform -translate-x-1/2" />

          {/* Giant Center Pokéball Painting */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 rounded-full border-2 sm:border-4 border-white/35 overflow-hidden flex flex-col opacity-50 shadow-inner">
            <div className="flex-1 bg-red-600/70 border-b-2 sm:border-b-4 border-slate-950" />
            <div className="flex-1 bg-slate-200/80 border-t-2 sm:border-t-4 border-slate-950" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-slate-950 border-2 sm:border-4 border-white flex items-center justify-center">
              <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-white shadow-[0_0_12px_#fff]" />
            </div>
          </div>
        </div>

        {/* Authentic Trajectory & Particle Move Animator Overlay */}
        {activeMoveAnim && (
          <MoveAnimation
            key={activeMoveAnim.id}
            move={activeMoveAnim.move}
            attackerSide={activeMoveAnim.attackerSide}
            speed={speed}
          />
        )}

        {/* --- TOP ROW: UNIFIED CARDS (LEFT = SEN / PLAYER 1, RIGHT = RAKİP / PLAYER 2) --- */}
        <div className="flex justify-between items-start z-10 gap-2">
          {/* LEFT: Player 1 (You / Sen) Complete Battle Plate */}
          <div className={`bg-slate-900/95 border-2 ${p1CardBorder} rounded-2xl p-2 sm:p-3 shadow-2xl backdrop-blur-md w-[48%] sm:w-64 md:w-72 transform -skew-x-1 sm:-skew-x-2`}>
            <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-800">
              <span className={`text-[8px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-md border truncate ${p1BadgeClass}`}>
                {p1Label}
              </span>
              <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full border transition-all ${
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
                <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                  <span className="font-black text-xs sm:text-sm text-white truncate">{p1Active.name}</span>
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-300 flex-shrink-0">Lv. 50</span>
                </div>
                <div className="flex gap-1 mb-1 sm:mb-1.5 flex-wrap">
                  {p1Active.types.map(t => (
                    <span key={t} className={`text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.2 rounded type-${t}`}>{t}</span>
                  ))}
                </div>
                {/* Health Meter */}
                <div className="w-full bg-slate-950 h-2 sm:h-3 rounded-full overflow-hidden border border-slate-700 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getHpColor(p1HpPercent)}`}
                    style={{ width: `${p1HpPercent}%` }}
                  />
                </div>
                <div className="text-right text-[9px] sm:text-[11px] font-mono font-black text-slate-300 mt-0.5 sm:mt-1">
                  {p1Hp} / {p1MaxHp} HP
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-500 italic py-1 sm:py-2 text-center">Bekleniyor...</div>
            )}
          </div>

          {/* RIGHT: Player 2 (Opponent / Rakip) Complete Battle Plate */}
          <div className={`bg-slate-900/95 border-2 ${p2CardBorder} rounded-2xl p-2 sm:p-3 shadow-2xl backdrop-blur-md w-[48%] sm:w-64 md:w-72 transform skew-x-1 sm:skew-x-2`}>
            <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-800">
              <span className={`text-[8px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-md border truncate ${p2BadgeClass}`}>
                {p2Label}
              </span>
              <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full border transition-all ${
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
                <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                  <span className="font-black text-xs sm:text-sm text-white truncate">{p2Active.name}</span>
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-300 flex-shrink-0">Lv. 50</span>
                </div>
                <div className="flex gap-1 mb-1 sm:mb-1.5 flex-wrap">
                  {p2Active.types.map(t => (
                    <span key={t} className={`text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.2 rounded type-${t}`}>{t}</span>
                  ))}
                </div>
                {/* Health Meter */}
                <div className="w-full bg-slate-950 h-2 sm:h-3 rounded-full overflow-hidden border border-slate-700 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getHpColor(p2HpPercent)}`}
                    style={{ width: `${p2HpPercent}%` }}
                  />
                </div>
                <div className="text-right text-[9px] sm:text-[11px] font-mono font-black text-slate-300 mt-0.5 sm:mt-1">
                  {p2Hp} / {p2MaxHp} HP
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-500 italic py-1 sm:py-2 text-center">Bekleniyor...</div>
            )}
          </div>
        </div>

        {/* --- CENTER ARENA: COMBATANTS DIRECTLY ANCHORED ON THEIR PEDESTALS --- */}
        <div className="relative flex-1 z-20 pointer-events-none">
          {/* Player 1 Combatant Group (Bottom-Left: Sprite directly standing on glowing green pedestal) */}
          <div
            className="absolute flex flex-col items-center"
            style={{ left: '22%', bottom: '7%', transform: 'translate(-50%, 0)' }}
          >
            {damagePopup?.target === 'p1' && (
              <div className="absolute -top-14 sm:-top-16 flex flex-col items-center pointer-events-none z-40 damage-popup whitespace-nowrap">
                {damagePopup.isCrit && (
                  <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-[10px] sm:text-xs tracking-wider uppercase shadow-[0_0_15px_#f59e0b] border border-white anim-crit-badge mb-0.5">
                    ★ KRİTİK VURUŞ! ★
                  </div>
                )}
                <div className={`font-mono font-black text-xl sm:text-2xl drop-shadow-[0_0_10px_rgba(0,0,0,0.9)] ${
                  damagePopup.isCrit
                    ? 'text-amber-300 drop-shadow-[0_0_12px_#f59e0b]'
                    : damagePopup.effectiveness > 1
                    ? 'text-red-400 drop-shadow-[0_0_10px_#ef4444]'
                    : 'text-slate-200'
                }`}>
                  -{damagePopup.damage} HP
                </div>
                {damagePopup.effectiveness > 1 && !damagePopup.isCrit && (
                  <span className="text-[9px] text-red-300 font-bold bg-red-950/90 px-1.5 py-0.2 rounded-full border border-red-500/40 mt-0.5 shadow-sm">
                    Süper Etkili!
                  </span>
                )}
              </div>
            )}

            {/* Soft Ambient Celestial Radial Aura (Never clips to GIF box!) */}
            {p1Active && (p1Active.tier === 'Legendary' || p1Active.tier === 'Epic') && (
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-0 blur-2xl animate-pulse ${
                  p1Active.tier === 'Legendary'
                    ? 'w-48 h-48 sm:w-64 sm:h-64 bg-amber-400/25'
                    : 'w-40 h-40 sm:w-56 sm:h-56 bg-purple-500/20'
                }`}
              />
            )}

            {p1Active && (
              <img
                src={p1Active.spriteBack || p1Active.sprite}
                alt={p1Active.name}
                className={`${getSpriteSize(p1Active, true)} ${getSpriteOffset(p1Active, true)} pixel-sprite object-contain transition-all duration-300 pointer-events-none select-none relative z-10 ${
                  lungeSide === 'p1' ? 'attacker-lunge-right' : ''
                } ${
                  shakeTarget === 'p1' ? (damagePopup?.isCrit ? 'shake-lg' : 'shake-sm') : ''
                } ${
                  hitTarget === 'p1' ? 'hit-flash' : ''
                } ${p1Hp <= 0 ? 'opacity-0 translate-y-8 duration-350' : 'opacity-100'}`}
              />
            )}
            {/* 3D Battle Pedestal physically anchored at its feet */}
            <div
              className={`relative z-0 ${
                isLegendaryPokemon(p1Active)
                  ? 'w-48 h-12 sm:w-64 sm:h-16 -mt-3 sm:-mt-5'
                  : isLargePokemon(p1Active)
                  ? 'w-44 h-12 sm:w-60 sm:h-14 -mt-3 sm:-mt-4'
                  : isTinyPokemon(p1Active)
                  ? 'w-24 h-7 sm:w-32 sm:h-9 -mt-1.5 sm:-mt-2'
                  : 'w-36 h-10 sm:w-48 sm:h-12 -mt-2 sm:-mt-3'
              } ${p1IsYou ? 'battle-pad-p1' : 'battle-pad-p2'} pointer-events-none`}
            />
          </div>

          {/* Player 2 Combatant Group (Top-Right: Sprite directly standing on glowing blue pedestal) */}
          <div
            className="absolute flex flex-col items-center"
            style={{ left: '76%', top: '22%', transform: 'translate(-50%, 0)' }}
          >
            {damagePopup?.target === 'p2' && (
              <div className="absolute -top-14 sm:-top-16 flex flex-col items-center pointer-events-none z-40 damage-popup whitespace-nowrap">
                {damagePopup.isCrit && (
                  <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-[10px] sm:text-xs tracking-wider uppercase shadow-[0_0_15px_#f59e0b] border border-white anim-crit-badge mb-0.5">
                    ★ KRİTİK VURUŞ! ★
                  </div>
                )}
                <div className={`font-mono font-black text-xl sm:text-2xl drop-shadow-[0_0_10px_rgba(0,0,0,0.9)] ${
                  damagePopup.isCrit
                    ? 'text-amber-300 drop-shadow-[0_0_12px_#f59e0b]'
                    : damagePopup.effectiveness > 1
                    ? 'text-red-400 drop-shadow-[0_0_10px_#ef4444]'
                    : 'text-blue-300'
                }`}>
                  -{damagePopup.damage} HP
                </div>
                {damagePopup.effectiveness > 1 && !damagePopup.isCrit && (
                  <span className="text-[9px] text-red-300 font-bold bg-red-950/90 px-1.5 py-0.2 rounded-full border border-red-500/40 mt-0.5 shadow-sm">
                    Süper Etkili!
                  </span>
                )}
              </div>
            )}

            {/* Soft Ambient Celestial Radial Aura (Never clips to GIF box!) */}
            {p2Active && (p2Active.tier === 'Legendary' || p2Active.tier === 'Epic') && (
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-0 blur-2xl animate-pulse ${
                  p2Active.tier === 'Legendary'
                    ? 'w-40 h-40 sm:w-56 sm:h-56 bg-amber-400/25'
                    : 'w-36 h-36 sm:w-48 sm:h-48 bg-purple-500/20'
                }`}
              />
            )}

            {p2Active && (
              <img
                src={p2Active.sprite}
                alt={p2Active.name}
                className={`${getSpriteSize(p2Active, false)} ${getSpriteOffset(p2Active, false)} pixel-sprite object-contain transition-all duration-300 pointer-events-none select-none relative z-10 ${
                  lungeSide === 'p2' ? 'attacker-lunge-left' : ''
                } ${
                  shakeTarget === 'p2' ? (damagePopup?.isCrit ? 'shake-lg' : 'shake-sm') : ''
                } ${hitTarget === 'p2' ? 'hit-flash' : ''} ${p2Hp <= 0 ? 'opacity-0 translate-y-8 duration-350' : 'opacity-100'}`}
              />
            )}
            {/* 3D Battle Pedestal physically anchored at its feet */}
            <div
              className={`relative z-0 ${
                isLegendaryPokemon(p2Active)
                  ? 'w-40 h-10 sm:w-56 sm:h-14 -mt-2 sm:-mt-4'
                  : isLargePokemon(p2Active)
                  ? 'w-36 h-10 sm:w-48 sm:h-12 -mt-2 sm:-mt-3'
                  : isTinyPokemon(p2Active)
                  ? 'w-20 h-6 sm:w-28 sm:h-8 -mt-1 sm:-mt-2'
                  : 'w-28 h-8 sm:w-36 sm:h-10 -mt-2 sm:-mt-3'
              } ${p2IsYou ? 'battle-pad-p1' : 'battle-pad-p2'} pointer-events-none`}
            />
          </div>
        </div>

        {/* Bottom Spacer */}
        <div className="h-1 sm:h-2 z-10" />
      </div>

      {/* --- BOTTOM ACTION ANNOUNCEMENT BAR --- */}
      <div className="mt-2 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-center shadow-lg backdrop-blur-md flex-shrink-0">
        <span className="font-mono text-xs md:text-sm font-bold text-amber-300 drop-shadow-sm tracking-wide">
          {announcement}
        </span>
      </div>

      {/* Element Effectiveness Radar Modal */}
      <TypeRadarModal isOpen={isRadarOpen} onClose={() => setIsRadarOpen(false)} />
    </div>
  );
}


