import React, { useState } from 'react';
import { X, Sparkles, ShieldAlert, Zap, Target } from 'lucide-react';
import { TYPE_CHART, ALL_TYPES } from '../utils/stats.js';

const TYPE_COLORS = {
  Normal: { bg: '#94a3b8', text: '#ffffff', glow: '#64748b' },
  Fire: { bg: '#ef4444', text: '#ffffff', glow: '#f97316' },
  Water: { bg: '#3b82f6', text: '#ffffff', glow: '#06b6d4' },
  Electric: { bg: '#eab308', text: '#ffffff', glow: '#facc15' },
  Grass: { bg: '#22c55e', text: '#ffffff', glow: '#84cc16' },
  Ice: { bg: '#38bdf8', text: '#ffffff', glow: '#93c5fd' },
  Fighting: { bg: '#dc2626', text: '#ffffff', glow: '#ef4444' },
  Poison: { bg: '#a855f7', text: '#ffffff', glow: '#d946ef' },
  Ground: { bg: '#d97706', text: '#ffffff', glow: '#f59e0b' },
  Flying: { bg: '#0284c7', text: '#ffffff', glow: '#38bdf8' },
  Psychic: { bg: '#ec4899', text: '#ffffff', glow: '#a855f7' },
  Bug: { bg: '#65a30d', text: '#ffffff', glow: '#a3e635' },
  Rock: { bg: '#78716c', text: '#ffffff', glow: '#a8a29e' },
  Ghost: { bg: '#6366f1', text: '#ffffff', glow: '#a855f7' },
  Dragon: { bg: '#4f46e5', text: '#ffffff', glow: '#818cf8' }
};

export default function TypeRadarModal({ isOpen, onClose }) {
  const [selectedType, setSelectedType] = useState('Fire');

  if (!isOpen) return null;

  // Relations for selected type when ATTACKING
  const attacksAgainst = TYPE_CHART[selectedType] || {};
  const strongAgainst = Object.entries(attacksAgainst).filter(([_, m]) => m > 1).map(([t]) => t);
  const weakAgainst = Object.entries(attacksAgainst).filter(([_, m]) => m < 1 && m > 0).map(([t]) => t);
  const noEffectAgainst = Object.entries(attacksAgainst).filter(([_, m]) => m === 0).map(([t]) => t);

  // Relations when DEFENDING as selectedType
  const defendingWeakTo = [];
  const defendingResists = [];
  const defendingImmuneTo = [];

  ALL_TYPES.forEach(atkType => {
    const mult = (TYPE_CHART[atkType] || {})[selectedType];
    if (mult !== undefined) {
      if (mult > 1) defendingWeakTo.push(atkType);
      else if (mult === 0) defendingImmuneTo.push(atkType);
      else if (mult < 1) defendingResists.push(atkType);
    }
  });

  const radius = 135;
  const center = 160;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-wide">ELEMENT ÜSTÜNLÜK RADARI</h3>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">15 Kanto Elementi Etkileşim Rehberi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Scrollable */}
        <div className="overflow-y-auto flex-1 py-3 space-y-4">
          
          {/* Circular Wheel View */}
          <div className="flex justify-center items-center py-2 relative">
            <div className="relative w-[320px] h-[320px] flex items-center justify-center">
              {/* Outer circle track */}
              <div className="absolute inset-4 rounded-full border border-slate-800/80 shadow-inner" />
              <div className="absolute inset-16 rounded-full border border-dashed border-slate-800/40" />

              {/* Center Active Display */}
              <div
                className="absolute z-20 w-24 h-24 rounded-2xl flex flex-col items-center justify-center p-2 text-center shadow-xl border-2 transition-all duration-300"
                style={{
                  backgroundColor: `${TYPE_COLORS[selectedType]?.bg}22`,
                  borderColor: TYPE_COLORS[selectedType]?.bg,
                  boxShadow: `0 0 25px ${TYPE_COLORS[selectedType]?.glow}44`
                }}
              >
                <span className="text-[9px] uppercase tracking-widest font-mono text-slate-400 font-bold">Seçili</span>
                <span className="font-black text-base tracking-wide" style={{ color: TYPE_COLORS[selectedType]?.bg }}>
                  {selectedType}
                </span>
                <span className="text-[8px] font-mono text-slate-300 mt-0.5">Tipi</span>
              </div>

              {/* 15 Types along the wheel */}
              {ALL_TYPES.map((type, idx) => {
                const angle = (idx / ALL_TYPES.length) * 2 * Math.PI - Math.PI / 2;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                const isSelected = selectedType === type;
                const isStrong = strongAgainst.includes(type);
                const isWeak = weakAgainst.includes(type);

                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-extrabold px-2 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'scale-125 z-30 ring-2 ring-white shadow-lg shadow-black/80'
                        : isStrong
                        ? 'ring-1 ring-emerald-400 opacity-100 scale-105'
                        : isWeak
                        ? 'opacity-40 scale-95'
                        : 'opacity-75 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      backgroundColor: TYPE_COLORS[type]?.bg,
                      color: TYPE_COLORS[type]?.text
                    }}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Matchup Panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Attacking Strengths (2x Damage) */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Target className="w-3.5 h-3.5" />
                <span>Saldırırken Süper Etkili (2.0x)</span>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                {strongAgainst.length > 0 ? (
                  strongAgainst.map(t => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm"
                      style={{ backgroundColor: TYPE_COLORS[t]?.bg, color: TYPE_COLORS[t]?.text }}
                    >
                      {t} (+%100)
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-500 italic">Hiçbir tipe 2x vurmaz</span>
                )}
              </div>
            </div>

            {/* Attacking Weaknesses (0.5x or 0x Damage) */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Saldırırken Az Etkili (0.5x / 0x)</span>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                {weakAgainst.concat(noEffectAgainst).length > 0 ? (
                  weakAgainst.map(t => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold opacity-80"
                      style={{ backgroundColor: TYPE_COLORS[t]?.bg, color: TYPE_COLORS[t]?.text }}
                    >
                      {t} (0.5x)
                    </span>
                  )).concat(
                    noEffectAgainst.map(t => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold opacity-40 line-through"
                        style={{ backgroundColor: TYPE_COLORS[t]?.bg, color: TYPE_COLORS[t]?.text }}
                      >
                        {t} (0x)
                      </span>
                    ))
                  )
                ) : (
                  <span className="text-[11px] text-slate-500 italic">Direnç gösteren tip yok</span>
                )}
              </div>
            </div>
          </div>

          {/* Defensive Info Strip */}
          <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-2.5 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-bold text-amber-400">{selectedType}</span> tipindeki Pokémon savunmadayken{' '}
              <span className="text-rose-400 font-semibold">{defendingWeakTo.join(', ') || 'hiçbir tipten'}</span> fazladan hasar alır.
            </div>
            <div className="text-[10px] text-slate-500">
              Direnç: {defendingResists.join(', ') || 'Yok'}
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 text-center text-[10px] text-slate-500 flex-shrink-0">
          İncelemek istediğin elemente çemberden tıklayarak taktiksel avantajı görebilirsin.
        </div>
      </div>
    </div>
  );
}
