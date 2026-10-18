import React, { useState } from 'react';
import { Play, Users, Copy, Check, Sparkles, Swords, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/sound.js';

export default function Lobby({
  room,
  socket,
  playerId,
  onMuteToggle,
  isMuted
}) {
  const [name, setName] = useState(localStorage.getItem('poke_name') || 'Eğitmen');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    localStorage.setItem('poke_name', val);
  };

  const handleCreateRoom = () => {
    if (!name.trim()) return setError('Lütfen bir eğitmen adı girin!');
    setError('');
    sound.playBid();
    socket.emit('CREATE_ROOM', { name: name.trim() });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Lütfen bir eğitmen adı girin!');
    if (!joinCode.trim()) return setError('Lütfen 4 haneli oda kodunu girin!');
    setError('');
    sound.playBid();
    socket.emit('JOIN_ROOM', { code: joinCode.trim().toUpperCase(), name: name.trim() });
  };

  const handleCopyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    sound.playTick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    sound.playGavel();
    socket.emit('START_GAME');
  };

  const isHost = room?.players?.[0]?.id === playerId;
  const isReadyToStart = room?.players?.length === 2;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Navbar */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/30">
            <Swords className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              PokéAuction
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                GEN 1 LIVE
              </span>
            </h1>
            <p className="text-xs text-slate-400">Kör Açık Artırma & Otomatik Dövüş Arenası</p>
          </div>
        </div>

        <button
          onClick={onMuteToggle}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition"
          title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>
      </div>

      {!room ? (
        /* Not in room: Create or Join */
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left: Info Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Nasıl Oynanır?
            </h2>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="font-bold text-amber-400 font-mono">1.</span>
                <span>Her eğitmen maça <strong>100 Altın</strong> bütçeyle başlar.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-400 font-mono">2.</span>
                <span>Ortaya çıkan Gen 1 Pokemon'lar için süre işlerken canlı teklif savaşına girin.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-400 font-mono">3.</span>
                <span><strong>İflas Kuralı:</strong> Parası biten teklif veremez; parası olan Pokemon'u ya bedava alır ya da rakibe zorla iteler!</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-400 font-mono">4.</span>
                <span>5'e 5 takımlar kurulunca gizli dizilim yapılır ve <strong>Meydan Savaşı</strong> başlar!</span>
              </li>
            </ul>

            <div className="mt-6 pt-5 border-t border-slate-800 flex items-center gap-4">
              <div className="text-xs text-slate-400">
                <span className="text-white font-bold">151</span> Kanto Pokemon'u · Canlı WebSocket Eşleşmesi
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Eğitmen Adın
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                maxLength={16}
                placeholder="Örn: Ash Ketchum"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-semibold focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Create Room Button */}
            <button
              onClick={handleCreateRoom}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              Yeni Oda Kur
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase font-bold">veya</span>
            </div>

            {/* Join Room Form */}
            <form onSubmit={handleJoinRoom} className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Var Olan Odaya Katıl
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={4}
                  placeholder="KOD (Örn: XY7K)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-white font-mono font-black tracking-widest text-lg uppercase focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-lg shadow-blue-600/30"
                >
                  Katıl
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Inside Room Waiting Lobby */
        <div className="max-w-2xl mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center space-y-8">
          <div>
            <div className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-1">Oda Kodu</div>
            <div className="inline-flex items-center gap-3 bg-black/50 border border-slate-700/80 rounded-2xl px-6 py-3">
              <span className="font-mono text-3xl font-black text-amber-400 tracking-widest">{room.code}</span>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Kodu Kopyala"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">Bu kodu arkadaşına göndererek odaya katılmasını sağla.</p>
          </div>

          {/* Player Matchup Pods */}
          <div className="grid grid-cols-2 gap-4">
            {/* Player 1 (Red Corner) */}
            <div className="bg-red-950/30 border border-red-500/40 rounded-2xl p-5 text-left relative overflow-hidden">
              <div className="text-[10px] uppercase font-bold text-red-400 tracking-wider mb-2">1. Eğitmen (Kırmızı)</div>
              <div className="text-lg font-black text-white truncate">{room.players[0]?.name}</div>
              <div className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Hazır
              </div>
            </div>

            {/* Player 2 (Blue Corner) */}
            <div className={`rounded-2xl p-5 text-left border relative overflow-hidden transition-all ${
              room.players[1]
                ? 'bg-blue-950/30 border-blue-500/40'
                : 'bg-slate-950/50 border-dashed border-slate-700 animate-pulse'
            }`}>
              <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider mb-2">2. Eğitmen (Mavi)</div>
              {room.players[1] ? (
                <>
                  <div className="text-lg font-black text-white truncate">{room.players[1].name}</div>
                  <div className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Katıldı
                  </div>
                </>
              ) : (
                <div className="text-sm font-semibold text-slate-500 py-2">
                  Arkadaşın bekleniyor...
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          {isHost ? (
            <button
              onClick={handleStartGame}
              disabled={!isReadyToStart}
              className={`w-full py-4 px-6 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-2 ${
                isReadyToStart
                  ? 'bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white shadow-red-600/40 transform hover:-translate-y-0.5 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Play className="w-6 h-6 fill-current" />
              {isReadyToStart ? 'AÇIK ARTIRMAYI BAŞLAT' : '2. Oyuncu Bekleniyor'}
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-sm font-semibold flex items-center justify-center gap-2">
              <Users className="w-4 h-4 text-blue-400 animate-spin" />
              Oda kurucusunun oyunu başlatması bekleniyor...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
