import React from 'react';
import { Flame, Zap, Droplets, Sparkles, Wind, Skull, Swords, Snowflake } from 'lucide-react';

export default function ElementalVFX({ type = 'Normal' }) {
  switch (type) {
    case 'Fire':
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 vfx-fire">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 blur-xl opacity-80 animate-pulse" />
            <Flame className="w-32 h-32 text-amber-300 drop-shadow-[0_0_20px_#ef4444]" />
            <Flame className="absolute w-24 h-24 text-red-500 drop-shadow-[0_0_30px_#f97316] animate-spin" />
          </div>
        </div>
      );

    case 'Water':
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 vfx-water">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-700 via-cyan-500 to-sky-300 blur-xl opacity-80" />
            <Droplets className="w-32 h-32 text-cyan-200 drop-shadow-[0_0_20px_#3b82f6]" />
            <div className="absolute w-36 h-36 border-4 border-cyan-400 rounded-full animate-ping opacity-75" />
          </div>
        </div>
      );

    case 'Electric':
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 vfx-electric">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-yellow-400/40 blur-2xl" />
            <Zap className="w-36 h-36 text-amber-300 drop-shadow-[0_0_30px_#eab308] transform rotate-12" />
            <Zap className="absolute w-28 h-28 text-white drop-shadow-[0_0_20px_#facc15] transform -rotate-12" />
          </div>
        </div>
      );

    case 'Grass':
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 vfx-grass">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/40 blur-xl" />
            <Wind className="w-32 h-32 text-emerald-300 drop-shadow-[0_0_25px_#22c55e]" />
            <Sparkles className="absolute w-24 h-24 text-lime-200 animate-spin" />
          </div>
        </div>
      );

    case 'Ice':
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 vfx-ice">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-sky-400/40 blur-xl" />
            <Snowflake className="w-32 h-32 text-sky-200 drop-shadow-[0_0_30px_#38bdf8] animate-spin" />
            <div className="absolute w-32 h-32 border-2 border-white rounded-lg transform rotate-45 animate-ping opacity-60" />
          </div>
        </div>
      );

    case 'Psychic':
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 vfx-psychic">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 blur-2xl opacity-90" />
            <div className="w-32 h-32 border-4 border-pink-400 rounded-full animate-ping" />
            <div className="absolute w-20 h-20 border-2 border-purple-300 rounded-full animate-spin" />
          </div>
        </div>
      );

    case 'Poison':
    case 'Ghost':
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 vfx-psychic">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-purple-900/70 blur-2xl" />
            <Skull className="w-28 h-28 text-purple-300 drop-shadow-[0_0_30px_#a855f7]" />
          </div>
        </div>
      );

    default:
      // Normal, Fighting, Rock, Ground, Flying, Steel, Dragon
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 vfx-slash">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl" />
            <Swords className="w-32 h-32 text-amber-200 drop-shadow-[0_0_25px_#f59e0b] transform rotate-45" />
            <div className="absolute w-40 h-1 bg-white shadow-[0_0_15px_#ffffff] transform -rotate-45" />
            <div className="absolute w-40 h-1 bg-amber-300 shadow-[0_0_15px_#f59e0b] transform rotate-45" />
          </div>
        </div>
      );
  }
}
