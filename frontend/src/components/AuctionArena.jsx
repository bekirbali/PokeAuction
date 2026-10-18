import React, { useState, useEffect } from 'react';
import { Coins, Flame, Ban, CheckCircle, Gift, UserX, Clock, Volume2, VolumeX, Sparkles } from 'lucide-react';
import PokemonCard from './PokemonCard.jsx';
import { sound } from '../utils/sound.js';

export default function AuctionArena({
  room,
  socket,
  playerId,
  onMuteToggle,
  isMuted
}) {
  const [customBid, setCustomBid] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const me = room.players.find(p => p.id === playerId);
  const opp = room.players.find(p => p.id !== playerId);

  const highestBidderName = room.players.find(p => p.id === room.highestBidder)?.name;
  const isHighestBidder = room.highestBidder === playerId;
  const isMyTurn = room.activeTurnPlayerId === playerId;
  const activePlayerName = room.players.find(p => p.id === room.activeTurnPlayerId)?.name;
  const openerName = room.players.find(p => p.id === room.openerPlayerId)?.name;

  const isOpeningPhase = room.roundPhase === 'OPENING';
  const isStarvation = !!room.starvationMode;
  const isRichInStarvation = room.starvationMode?.richPlayerId === playerId;
  const isBrokeInStarvation = room.starvationMode?.brokePlayerId === playerId;

  // Reset submitting lock on turn change or round update
  useEffect(() => {
    setIsSubmitting(false);
  }, [room.activeTurnPlayerId, room.currentPokemon?.id]);

  useEffect(() => {
    if (room.timer <= 3 && room.timer > 0) {
      sound.playTick();
    }
  }, [room.timer]);

  const handleQuickBid = (increment) => {
    if (!isMyTurn || isSubmitting) return;
    const nextAmount = isOpeningPhase ? increment : (room.currentBid || 0) + increment;
    if (nextAmount > me.gold) return;
    setIsSubmitting(true);
    sound.playBid();
    socket.emit('PLACE_BID', { amount: nextAmount });
  };

  const handleCustomBid = (e) => {
    e.preventDefault();
    if (!isMyTurn || isSubmitting) return;
    const val = parseInt(customBid, 10);
    const minVal = isOpeningPhase ? 1 : (room.currentBid || 0) + 1;
    if (isNaN(val) || val < minVal || val > me.gold) return;
    setIsSubmitting(true);
    sound.playBid();
    socket.emit('PLACE_BID', { amount: val });
    setCustomBid('');
  };

  const handlePass = () => {
    if (!isMyTurn || isSubmitting) return;
    setIsSubmitting(true);
    sound.playPass();
    socket.emit('PASS_BID');
  };

  const handleStarvationDecision = (decision) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    sound.playGavel();
    socket.emit('STARVATION_DECIDE', { decision });
  };

  return (
    <div className="h-full max-h-[calc(100vh-2rem)] flex flex-col justify-between max-w-6xl mx-auto px-4 py-2 overflow-hidden select-none">
      {/* Top Bar: Room Info & Mute */}
      <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-1.5 backdrop-blur-md flex-shrink-0 mb-2">
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase font-bold text-slate-400">Oda:</span>
          <span className="font-mono font-bold text-amber-400 tracking-wider text-xs">{room.code}</span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] font-semibold text-slate-300">
            Kadro: <span className="text-red-400 font-bold">{me?.name} ({me?.teamCount}/5)</span> vs <span className="text-blue-400 font-bold">{opp?.name} ({opp?.teamCount}/5)</span>
          </span>
        </div>

        <button
          onClick={onMuteToggle}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>
      </div>

      {/* Main Auction Floor */}
      <div className="grid lg:grid-cols-12 gap-4 items-center flex-1 min-h-0">
        {/* Left Column: Player 1 (You) */}
        <div className={`lg:col-span-3 bg-slate-900/80 border rounded-2xl p-3 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-all ${
          isMyTurn && !isStarvation ? 'border-amber-500/80 shadow-amber-500/10' : 'border-slate-800'
        }`}>
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] uppercase font-bold text-red-400 tracking-wider">Sen</span>
                {isMyTurn && !isStarvation && (
                  <span className="text-[8px] uppercase font-black px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    SIRADA
                  </span>
                )}
              </div>
              <h3 className="text-sm font-black text-white truncate">{me?.name}</h3>
            </div>
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl">
              <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-mono text-xs font-bold text-amber-300">{me?.gold} G</span>
            </div>
          </div>

          {/* Team Slots */}
          <div className="space-y-1.5 flex-1 overflow-hidden">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
              <span>Takımın</span>
              <span className="font-mono">{me?.teamCount}/5</span>
            </div>
            <div className="space-y-1">
              {[0, 1, 2, 3, 4].map(idx => {
                const mon = me?.team[idx];
                return (
                  <div
                    key={idx}
                    className={`h-9 rounded-xl border flex items-center px-2 gap-2 transition-all min-h-[36px] ${
                      mon
                        ? 'bg-slate-800/80 border-slate-700 shadow-sm'
                        : 'border-dashed border-slate-800 bg-slate-950/40 text-slate-600'
                    }`}
                  >
                    {mon ? (
                      <>
                        <img src={mon.icon} alt={mon.name} className="w-7 h-7 object-contain flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate leading-tight">{mon.name}</div>
                          <div className="flex gap-1">
                            {mon.types.map(t => (
                              <span key={t} className={`text-[8px] font-bold px-1 rounded type-${t}`}>{t}</span>
                            ))}
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-amber-400 font-bold flex-shrink-0">{mon.pricePaid}G</span>
                      </>
                    ) : (
                      <span className="text-[10px] italic w-full text-center">Boş Yuva {idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Column: Active Auction Ring */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-2">
          {/* Turn & Status Header */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Açılış:</span>
              <span className="text-amber-400">1 Altın ({openerName})</span>
            </div>

            <div className={`px-3 py-1 rounded-xl font-bold text-[11px] flex items-center gap-1.5 ${
              isMyTurn
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 animate-pulse'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {isMyTurn ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  {isOpeningPhase ? 'AÇILIŞ SIRASI SENDE' : 'SENİN SIRAN'}
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  {isOpeningPhase ? `${openerName} açılış yapıyor...` : `${activePlayerName} düşünüyor...`}
                </>
              )}
            </div>

            <div className={`flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-900 border ${
              room.timer <= 3 ? 'border-red-500 timer-urgent' : 'border-slate-800'
            }`}>
              <span className={`font-mono text-sm font-black ${room.timer <= 3 ? 'text-red-400' : 'text-white'}`}>
                00:{String(room.timer).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* The Revealed Pokemon Card */}
          <div className="max-w-sm mx-auto w-full">
            <PokemonCard pokemon={room.currentPokemon} />
          </div>

          {/* Current Bid Display */}
          <div className="max-w-sm mx-auto w-full bg-black/60 border border-slate-800 rounded-xl px-3 py-1.5 text-center backdrop-blur-md">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-400">Mevcut Teklif:</span>
              <span className="font-mono text-lg font-black text-amber-400">
                {room.currentBid > 0 ? `${room.currentBid} Altın` : 'Açılış Bekleniyor (1G)'}
              </span>
              {room.currentBid > 0 && highestBidderName && (
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                  isHighestBidder ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'
                }`}>
                  ({highestBidderName})
                </span>
              )}
            </div>
          </div>

          {/* Controls: Bidding & Passing or Opening */}
          <div className="max-w-sm mx-auto w-full">
            {isStarvation ? (
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-purple-500/40 rounded-xl p-3 text-center space-y-2 shadow-xl">
                {isRichInStarvation ? (
                  <>
                    <div className="text-amber-400 font-black text-xs flex items-center justify-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      İflas Kuralı: Bedava Al veya Rakibe İtele!
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStarvationDecision('claimFree')}
                        disabled={isSubmitting}
                        className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-[11px] shadow-md flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        Bedavaya Al
                      </button>
                      <button
                        onClick={() => handleStarvationDecision('forceGive')}
                        disabled={isSubmitting}
                        className="py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-[11px] shadow-md flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Rakibe İtele!
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-2 text-xs text-slate-400">
                    <span className="text-red-400 font-bold block">Paran Tükendi!</span>
                    Rakibin bu Pokemon'u sana itelemesi veya alması bekleniyor...
                  </div>
                )}
              </div>
            ) : isOpeningPhase ? (
              /* --- OPENING PHASE CONTROLS --- */
              <div className={`rounded-xl p-2.5 space-y-2 backdrop-blur-xl transition-all border ${
                isMyTurn
                  ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-amber-500/60 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900/60 border-slate-800 opacity-70'
              }`}>
                {isMyTurn ? (
                  <>
                    <button
                      onClick={() => handleQuickBid(1)}
                      disabled={isSubmitting || me.gold < 1}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-md shadow-amber-500/30 flex items-center justify-center gap-2 transition cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <Coins className="w-4 h-4 fill-current" />
                      1 Altınla Açılış Yap
                    </button>
                    <div className="text-[10px] text-slate-400 text-center">
                      Açılışı yaptıktan sonra rakibin ya teklifi 2 altına artıracak ya da 1 altına sana bırakacak.
                    </div>
                  </>
                ) : (
                  <div className="py-2 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span><strong className="text-white">{openerName}</strong> 1 Altınlık zorunlu açılışı yapıyor...</span>
                  </div>
                )}
              </div>
            ) : (
              /* --- BIDDING PHASE CONTROLS --- */
              <div className={`bg-slate-900/90 border rounded-xl p-2.5 space-y-2 backdrop-blur-xl transition-all ${
                isMyTurn ? 'border-amber-500/50 shadow-md shadow-amber-500/10' : 'border-slate-800 opacity-60 pointer-events-none'
              }`}>
                {/* Quick Add Buttons */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 5].map(inc => {
                    const nextVal = (room.currentBid || 0) + inc;
                    const canAfford = nextVal <= me.gold;
                    return (
                      <button
                        key={inc}
                        onClick={() => handleQuickBid(inc)}
                        disabled={!isMyTurn || !canAfford || isSubmitting}
                        className={`py-1.5 rounded-lg font-mono font-bold text-xs transition ${
                          canAfford && isMyTurn && !isSubmitting
                            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 cursor-pointer'
                            : 'bg-slate-950 text-slate-600 border border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        +{inc} ({nextVal}G)
                      </button>
                    );
                  })}
                </div>

                {/* Custom Bid & Pass */}
                <div className="flex gap-1.5">
                  <form onSubmit={handleCustomBid} className="flex-1 flex gap-1.5">
                    <input
                      type="number"
                      min={(room.currentBid || 0) + 1}
                      max={me.gold}
                      disabled={!isMyTurn || isSubmitting}
                      value={customBid}
                      onChange={(e) => setCustomBid(e.target.value)}
                      placeholder={`Teklif (> ${room.currentBid})`}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-amber-400 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!isMyTurn || isSubmitting || !customBid || parseInt(customBid, 10) <= room.currentBid || parseInt(customBid, 10) > me.gold}
                      className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-[11px] transition"
                    >
                      Artır
                    </button>
                  </form>

                  <button
                    onClick={handlePass}
                    disabled={!isMyTurn || isSubmitting}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-[11px] transition flex items-center gap-1 shadow-md shadow-rose-600/30 cursor-pointer"
                  >
                    <Ban className="w-3 h-3" />
                    Pas ({room.currentBid}G'ye Bırak)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Player 2 (Opponent) */}
        <div className={`lg:col-span-3 bg-slate-900/80 border rounded-2xl p-3 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-all ${
          !isMyTurn && !isStarvation ? 'border-amber-500/80 shadow-amber-500/10' : 'border-blue-500/30'
        }`}>
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] uppercase font-bold text-blue-400 tracking-wider">Rakip</span>
                {!isMyTurn && !isStarvation && (
                  <span className="text-[8px] uppercase font-black px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    SIRADA
                  </span>
                )}
              </div>
              <h3 className="text-sm font-black text-white truncate">{opp?.name}</h3>
            </div>
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl">
              <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-mono text-xs font-bold text-amber-300">{opp?.gold} G</span>
            </div>
          </div>

          {/* Opponent Team Slots */}
          <div className="space-y-1.5 flex-1 overflow-hidden">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
              <span>Rakibin Kadrosu</span>
              <span className="font-mono">{opp?.teamCount}/5</span>
            </div>
            <div className="space-y-1">
              {[0, 1, 2, 3, 4].map(idx => {
                const mon = opp?.team[idx];
                return (
                  <div
                    key={idx}
                    className={`h-9 rounded-xl border flex items-center px-2 gap-2 transition-all min-h-[36px] ${
                      mon
                        ? 'bg-slate-800/80 border-slate-700 shadow-sm'
                        : 'border-dashed border-slate-800 bg-slate-950/40 text-slate-600'
                    }`}
                  >
                    {mon ? (
                      <>
                        <img src={mon.icon} alt={mon.name} className="w-7 h-7 object-contain flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate leading-tight">{mon.name}</div>
                          <div className="flex gap-1">
                            {mon.types.map(t => (
                              <span key={t} className={`text-[8px] font-bold px-1 rounded type-${t}`}>{t}</span>
                            ))}
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-amber-400 font-bold flex-shrink-0">{mon.pricePaid}G</span>
                      </>
                    ) : (
                      <span className="text-[10px] italic w-full text-center">Boş Yuva {idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Ticker / History */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-1.5 backdrop-blur-md flex-shrink-0 mt-2 flex justify-between items-center text-[10px] text-slate-400">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="font-bold text-slate-500 uppercase">Son İşlemler:</span>
          {room.history && room.history.length > 0 ? (
            <div className="flex gap-3 truncate">
              {room.history.slice(0, 3).map((h, i) => (
                <span key={i} className="truncate">
                  <strong className="text-white">{h.pokemon.name}</strong> →{' '}
                  <span className="text-amber-400 font-bold">{h.winnerName}</span> ({h.price}G)
                </span>
              ))}
            </div>
          ) : (
            <span className="italic text-slate-600">Açık artırma yeni başladı...</span>
          )}
        </div>
        <div className="font-mono text-slate-500 font-bold">
          Tur {Math.min(10, (me?.teamCount || 0) + (opp?.teamCount || 0) + 1)}/10
        </div>
      </div>
    </div>
  );
}
