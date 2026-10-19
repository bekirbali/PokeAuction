import React from 'react';

export default function PokemonCard({ pokemon, compact = false, showStats = true }) {
  if (!pokemon) return null;

  const tierColors = {
    Legendary: 'border-amber-400 text-amber-300 bg-amber-950/40',
    Epic: 'border-purple-400 text-purple-300 bg-purple-950/40',
    Rare: 'border-blue-400 text-blue-300 bg-blue-950/40',
    Common: 'border-slate-600 text-slate-300 bg-slate-900/40',
    Meme: 'border-orange-500 text-orange-300 bg-orange-950/40'
  };

  if (compact) {
    return (
      <div className={`relative px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border flex items-center gap-1.5 sm:gap-2.5 backdrop-blur-md transition-all duration-200 hover:scale-[1.01] ${tierColors[pokemon.tier] || tierColors.Common}`}>
        <img
          src={pokemon.icon || pokemon.sprite}
          alt={pokemon.name}
          className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-md flex-shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="font-bold text-[11px] sm:text-xs truncate text-white">{pokemon.name}</h4>
            <span className="text-[8px] sm:text-[9px] uppercase font-extrabold px-1 sm:px-1.5 py-0.2 rounded bg-black/60 border border-white/10 flex-shrink-0">
              {pokemon.tier}
            </span>
          </div>
          <div className="flex gap-1 mt-0.5">
            {pokemon.types.map(t => (
              <span key={t} className={`text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.2 rounded-full type-${t}`}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getSpriteOffset = (p) => {
    if (!p) return '';
    const slug = (p.slug || p.name || '').toLowerCase();
    if (slug === 'mewtwo') return 'translate-x-[11%]';
    if (slug === 'gyarados') return 'translate-x-[6%]';
    if (slug === 'arbok') return 'translate-x-[5%]';
    if (slug === 'onix') return '-translate-x-[5%]';
    return '';
  };

  return (
    <div className={`relative rounded-2xl p-2.5 sm:p-4 border backdrop-blur-xl shadow-2xl transition-all duration-300 tier-${pokemon.tier}`}>
      {/* Tier Badge & ID */}
      <div className="flex justify-between items-center mb-0.5 sm:mb-1">
        <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 font-semibold tracking-wider">#{String(pokemon.id).padStart(3, '0')}</span>
        <span className="text-[9px] sm:text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-black/60 border border-white/20 tracking-wider flex items-center gap-1 shadow-inner">
          {pokemon.tier}
        </span>
      </div>

      {/* Animated Sprite */}
      <div className="relative h-16 sm:h-28 flex items-center justify-center my-0.5 sm:my-1">
        <div className="absolute inset-0 bg-radial from-white/10 to-transparent rounded-full blur-xl pointer-events-none" />
        <img
          src={pokemon.sprite}
          alt={pokemon.name}
          className={`max-h-14 sm:max-h-24 max-w-[80%] object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] animate-bounce ${getSpriteOffset(pokemon)}`}
          style={{ animationDuration: '3s' }}
        />
      </div>

      {/* Name & Types */}
      <div className="text-center mb-1 sm:mb-2.5">
        <h3 className="text-base sm:text-xl font-black tracking-wide text-white drop-shadow-md mb-0.5 sm:mb-1">
          {pokemon.name}
        </h3>
        <div className="flex justify-center gap-1.5">
          {pokemon.types.map(t => (
            <span key={t} className={`text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider type-${t}`}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Compact Base Stats Grid */}
      {showStats && (
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5 bg-black/40 rounded-xl p-1.5 sm:p-2 border border-white/10 mb-1 sm:mb-2.5 text-center">
          <div className="bg-slate-900/60 rounded-lg py-0.5 sm:py-1 px-1 sm:px-1.5">
            <span className="text-[8px] sm:text-[9px] text-red-400 font-bold block">HP</span>
            <span className="font-mono font-black text-xs text-white">{pokemon.stats.hp}</span>
          </div>
          <div className="bg-slate-900/60 rounded-lg py-0.5 sm:py-1 px-1 sm:px-1.5">
            <span className="text-[8px] sm:text-[9px] text-orange-400 font-bold block">ATK / DEF</span>
            <span className="font-mono font-black text-xs text-white">{pokemon.stats.attack}/{pokemon.stats.defense}</span>
          </div>
          <div className="bg-slate-900/60 rounded-lg py-0.5 sm:py-1 px-1 sm:px-1.5">
            <span className="text-[8px] sm:text-[9px] text-yellow-400 font-bold block">HIZ</span>
            <span className="font-mono font-black text-xs text-white">{pokemon.stats.speed}</span>
          </div>
        </div>
      )}

      {/* Signature Moves */}
      <div className="space-y-0.5 sm:space-y-1">
        <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider">İmza Saldırılar</div>
        <div className="grid grid-cols-2 gap-1">
          {pokemon.moves.map((m, idx) => (
            <div key={`${m.name}-${idx}`} className="bg-slate-900/70 border border-slate-700/60 rounded-lg px-1.5 sm:px-2 py-0.5 sm:py-1 text-left flex justify-between items-center">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-200 truncate">{m.name}</span>
              <span className="font-mono font-bold text-amber-300 text-[9px] sm:text-[10px] flex-shrink-0 ml-1">
                {m.power > 0 ? `${m.power}G` : 'Stat'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
