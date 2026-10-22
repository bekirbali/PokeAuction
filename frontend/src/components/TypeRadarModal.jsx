import React, { useState } from 'react';
import { X, Info, ShieldAlert, ShieldCheck, Swords, Shield, Target } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('attack'); // 'attack' | 'defense'

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
      <div className="relative w-full max-w-xl bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
              <Info className="w-4 h-4" />
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

        {/* 2-Segment Tab Switcher: Saldırı (Ofansif) vs Savunma (Defansif) */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mt-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('attack')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'attack'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30 border border-red-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Saldırı (Ofansif)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('defense')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'defense'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Savunma (Defansif)</span>
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
                <span className="text-[9px] uppercase tracking-widest font-mono text-slate-400 font-bold">
                  {activeTab === 'attack' ? 'Saldıran' : 'Savunan'}
                </span>
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

                // Tab-specific highlights
                let isAdvantage = false;
                let isDisadvantage = false;
                let isImmune = false;

                if (activeTab === 'attack') {
                  isAdvantage = strongAgainst.includes(type); // 2.0x
                  isDisadvantage = weakAgainst.includes(type); // 0.5x
                  isImmune = noEffectAgainst.includes(type); // 0x
                } else {
                  isDisadvantage = defendingWeakTo.includes(type); // Takes 2x
                  isAdvantage = defendingResists.includes(type); // Resists 0.5x
                  isImmune = defendingImmuneTo.includes(type); // Immune 0x
                }

                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-extrabold px-2 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'scale-125 z-30 ring-2 ring-white shadow-lg shadow-black/80'
                        : isAdvantage
                        ? 'ring-1 ring-emerald-400 opacity-100 scale-105'
                        : isDisadvantage
                        ? 'ring-1 ring-rose-500 opacity-90 scale-95'
                        : isImmune
                        ? 'opacity-30 line-through'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
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

          {/* TAB 1: SALDIRI (OFANSİF) EŞİT AĞIRLIKLI DETAY PANELLERİ */}
          {activeTab === 'attack' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Attacking Strengths (2x Damage) */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Target className="w-3.5 h-3.5" />
                  <span>Süper Etkili (2.0x Hasar)</span>
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
                    <span className="text-[11px] text-slate-500 italic">Hiçbir tipe 2.0x vurmaz</span>
                  )}
                </div>
              </div>

              {/* Attacking Weaknesses (0.5x or 0x Damage) */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Az Etkili / Etkisiz (0.5x / 0x)</span>
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
          )}

          {/* TAB 2: SAVUNMA (DEFANSİF) EŞİT AĞIRLIKLI DETAY PANELLERİ */}
          {activeTab === 'defense' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Defending Weaknesses (Takes 2x Damage) */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Zayıflıklar (2.0x Fazla Hasar Alır)</span>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                  {defendingWeakTo.length > 0 ? (
                    defendingWeakTo.map(t => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm"
                        style={{ backgroundColor: TYPE_COLORS[t]?.bg, color: TYPE_COLORS[t]?.text }}
                      >
                        {t} (2.0x Tehlike)
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">2.0x hasar veren zayıflığı yok</span>
                  )}
                </div>
              </div>

              {/* Defending Resistances (Takes 0.5x or 0x Damage) */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Dirençler & Bağışıklık (0.5x / 0x)</span>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                  {defendingResists.concat(defendingImmuneTo).length > 0 ? (
                    defendingResists.map(t => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold opacity-90"
                        style={{ backgroundColor: TYPE_COLORS[t]?.bg, color: TYPE_COLORS[t]?.text }}
                      >
                        {t} (0.5x Zırh)
                      </span>
                    )).concat(
                      defendingImmuneTo.map(t => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold ring-1 ring-amber-400"
                          style={{ backgroundColor: TYPE_COLORS[t]?.bg, color: TYPE_COLORS[t]?.text }}
                        >
                          {t} (0x Bağışık)
                        </span>
                      ))
                    )
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">Direnç veya bağışıklık yok</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Context Summary Banner */}
          <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-2.5 text-[11px] text-slate-300 flex items-center justify-between">
            {activeTab === 'attack' ? (
              <div>
                <span className="font-bold text-white">{selectedType}</span> türü saldırılar, zayıf olduğu Pokémonlara normal hasarının{' '}
                <span className="text-emerald-400 font-bold">2 katını (%200)</span> vurur.
              </div>
            ) : (
              <div>
                <span className="font-bold text-white">{selectedType}</span> tipindeki Pokémon, dirençli olduğu türlerden sadece{' '}
                <span className="text-blue-400 font-bold">yarım hasar (%50)</span> alır.
              </div>
            )}
          </div>

        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 text-center text-[10px] text-slate-500 flex-shrink-0">
          İncelemek istediğin tipe çemberden tıklayabilir, yukarıdan Saldırı/Savunma modunu değiştirebilirsin.
        </div>
      </div>
    </div>
  );
}
