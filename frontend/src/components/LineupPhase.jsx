import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Check, Clock, Volume2, VolumeX, GripVertical } from 'lucide-react';
import PokemonCard from './PokemonCard.jsx';
import { sound } from '../utils/sound.js';

export default function LineupPhase({
  room,
  socket,
  playerId,
  onMuteToggle,
  isMuted
}) {
  const me = room.players.find(p => p.id === playerId);
  const opp = room.players.find(p => p.id !== playerId);

  const [lineup, setLineup] = useState(me?.lineup || me?.team || []);
  const [isReady, setIsReady] = useState(me?.ready || false);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const swapPokemon = (fromIdx, toIdx) => {
    if (isReady) return;
    if (toIdx < 0 || toIdx >= lineup.length) return;

    sound.playTick();
    const updated = [...lineup];
    const temp = updated[fromIdx];
    updated[fromIdx] = updated[toIdx];
    updated[toIdx] = temp;

    setLineup(updated);
    socket.emit('UPDATE_LINEUP', { lineup: updated });
  };

  const handleDragStart = (e, index) => {
    if (isReady) return;
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    setDragOverIdx(null);
    if (draggedIdx === null || draggedIdx === targetIndex || isReady) {
      setDraggedIdx(null);
      return;
    }

    sound.playTick();
    const updated = [...lineup];
    const [moved] = updated.splice(draggedIdx, 1);
    updated.splice(targetIndex, 0, moved);

    setLineup(updated);
    setDraggedIdx(null);
    socket.emit('UPDATE_LINEUP', { lineup: updated });
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleReady = () => {
    sound.playGavel();
    setIsReady(true);
    socket.emit('PLAYER_READY');
  };

  const slotLabels = [
    { title: '1. Öncü (Lead)', desc: 'Arenaya ilk çıkacak Pokémon', color: 'border-red-500/50 bg-red-950/20 text-red-400' },
    { title: '2. Savaşçı', desc: 'İkinci savunma hattı', color: 'border-amber-500/40 bg-amber-950/10 text-amber-400' },
    { title: '3. Savaşçı', desc: 'Takımın bel kemiği', color: 'border-blue-500/40 bg-blue-950/10 text-blue-400' },
    { title: '4. Savaşçı', desc: 'Kritik dönüm noktası', color: 'border-purple-500/40 bg-purple-950/10 text-purple-400' },
    { title: '5. Son Kale (Anchor)', desc: 'Maçı bitirecek son kozun', color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Bar - Clean Typography, No Sparkles/Emojis */}
      <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-3 mb-6 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-black text-white tracking-wide">
            Taktiksel Dizilim Aşaması
          </h2>
          <p className="text-xs text-slate-400">Pokémon'larının sahaya çıkış sırasını belirle. Kartları sürükleyip bırakabilir veya okları kullanabilirsin.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-amber-400 font-bold text-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            {room.timer}s
          </div>

          <button
            onClick={onMuteToggle}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Opponent Status Banner - Clean, No Emojis */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${opp?.ready ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'}`} />
          <span className="text-sm font-semibold text-slate-300">
            {opp?.name}: {opp?.ready ? 'Dizilimini tamamladı, seni bekliyor!' : 'Sıralamasını ayarlıyor...'}
          </span>
        </div>

        <button
          onClick={handleReady}
          disabled={isReady}
          className={`py-2.5 px-6 rounded-xl font-bold text-sm transition shadow-lg flex items-center gap-2 ${
            isReady
              ? 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 cursor-default'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 cursor-pointer'
          }`}
        >
          {isReady ? (
            <>
              <Check className="w-4 h-4" />
              Hazırsın
            </>
          ) : (
            'Dizilimi Onayla'
          )}
        </button>
      </div>

      {/* 5 Pokemon Slot Cards with Drag-and-Drop + Up/Down Arrows */}
      <div className="space-y-3">
        {lineup.map((p, idx) => {
          const isDragging = draggedIdx === idx;
          const isTargeted = dragOverIdx === idx && draggedIdx !== idx;

          return (
            <div
              key={p.id + '-' + idx}
              draggable={!isReady}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragLeave={() => { if (dragOverIdx === idx) setDragOverIdx(null); }}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={`p-3.5 rounded-2xl border backdrop-blur-xl transition-all flex items-center gap-3 select-none ${slotLabels[idx].color} ${
                !isReady ? 'cursor-grab active:cursor-grabbing hover:border-slate-500/80' : ''
              } ${
                isDragging ? 'opacity-35 scale-[0.98] border-dashed border-amber-400/80' : ''
              } ${
                isTargeted ? 'ring-2 ring-amber-400/80 border-amber-400 bg-slate-800/90 scale-[1.01] shadow-xl shadow-amber-500/10' : ''
              }`}
            >
              {/* Drag Handle Indicator */}
              {!isReady && (
                <div
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1 flex-shrink-0 cursor-grab active:cursor-grabbing"
                  title="Sırayı değiştirmek için sürükleyip bırak"
                >
                  <GripVertical className="w-5 h-5" />
                </div>
              )}

              {/* Slot Number & Label */}
              <div className="w-32 flex-shrink-0">
                <span className="font-mono text-xs font-black uppercase tracking-wider block">
                  {slotLabels[idx].title}
                </span>
                <span className="text-[10px] text-slate-400 block">{slotLabels[idx].desc}</span>
              </div>

              {/* Pokemon Compact View */}
              <div className="flex-1 pointer-events-none">
                <PokemonCard pokemon={p} compact showStats />
              </div>

              {/* Reorder Arrows (Accessible Fallback) */}
              {!isReady && (
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); swapPokemon(idx, idx - 1); }}
                    disabled={idx === 0}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition"
                    title="Yukarı Taşı"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); swapPokemon(idx, idx + 1); }}
                    disabled={idx === lineup.length - 1}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition"
                    title="Aşağı Taşı"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
