import React, { useState } from 'react';
import { Play, Users, Copy, Check, Swords, Volume2, VolumeX, Bot, ArrowLeft, Coins, TrendingUp, AlertTriangle, Shield } from 'lucide-react';
import { sound } from '../utils/sound.js';

export default function Lobby({
  room,
  socket,
  playerId,
  onMuteToggle,
  isMuted,
  onLeaveRoom
}) {
  const [name, setName] = useState(localStorage.getItem('poke_name') || 'Eğitmen');
  const [gameMode, setGameMode] = useState('solo'); // 'solo' | 'multiplayer'
  const [difficulty, setDifficulty] = useState('medium'); // 'easy' | 'medium' | 'hard'
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

  const handleStartBotGame = () => {
    if (!name.trim()) return setError('Lütfen bir eğitmen adı girin!');
    setError('');
    sound.playBid();
    socket.emit('START_BOT_GAME', {
      name: name.trim(),
      difficulty
    });
  };

  const handleAddBotToRoom = () => {
    if (!room) return;
    sound.playBid();
    socket.emit('ADD_BOT_TO_ROOM', {
      code: room.code,
      difficulty
    });
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
    <div className="max-w-4xl w-full mx-auto px-4 py-4 md:py-8 select-none">
      
      {/* --- TOP BRANDING HEADER --- */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/30 border border-red-500/30">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-wider">
                POKÉAUCTION
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                KANTO LEAGUE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              1v1 Canlı Kör Takım Açık Artırması & Savaş Simülatörü
            </p>
          </div>
        </div>

        <button
          onClick={onMuteToggle}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {!room ? (
        /* --- MAIN DASHBOARD: EQUAL HEIGHT COLUMNS, MOBILE REVERSED ORDER --- */
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          
          {/* LEFT: Game Mechanics Overview (Mobile: order-2, Desktop: order-1) */}
          <div className="order-2 md:order-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800/80">
                <Shield className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-black uppercase text-slate-200 tracking-wider">
                  Turnuva Dinamikleri
                </h2>
              </div>

              {/* 4 Sleek Game Rule Tiles */}
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition">
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-white">20 Altın Başlangıç Bütçesi</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
                    Her antrenör maça 20 altınla başlar. Teklif verirken bütçeni 5 Pokémon'luk kadroya yetecek şekilde paylaştırmalısın.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-white">Kademeli Havuz & Ödüllendirme</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
                    Turlar ilerledikçe Epik ve Efsanevi Pokémon ihtimali katlanarak artar. Altınını idareli kullanan antrenör son turlarda ödüllendirilir.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-white">İflas & Zorunlu İteleme Cezası</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
                    Parası biten teklif veremez. Parası olan rakip, çıkan Pokémon'u ya bedava alır ya da rakibin kadrosuna zorla zayıf kart öteler.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition">
                  <div className="flex items-center gap-2 mb-1">
                    <Swords className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-white">5v5 Otomatik Meydan Savaşı</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
                    Kadrolar tamamlandığında gizli taktik dizilimi yapılır ve resmi hasar/tür animasyonlarıyla 5v5 otomatik şampiyona maçı simüle edilir.
                  </p>
                </div>
              </div>
            </div>


          </div>

          {/* RIGHT: Actions & Setup (Mobile: order-1, Desktop: order-2) */}
          <div className="order-1 md:order-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl flex flex-col justify-between h-full space-y-5">
            <div>
              {/* Trainer Name Input */}
              <div className="mb-4">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Eğitmen Adı
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  maxLength={16}
                  placeholder="Eğitmen adını yaz..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold text-sm focus:outline-none focus:border-red-500 transition"
                />
              </div>

              {error && (
                <div className="mb-4 p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Segmented Mode Selector: Solo vs Multiplayer */}
              <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4">
                <button
                  type="button"
                  onClick={() => setGameMode('solo')}
                  className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    gameMode === 'solo'
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  Tek Kişilik (AI)
                </button>

                <button
                  type="button"
                  onClick={() => setGameMode('multiplayer')}
                  className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    gameMode === 'multiplayer'
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Çok Oyunculu
                </button>
              </div>

              {/* Mode-Specific Content */}
              {gameMode === 'solo' ? (
                /* --- SOLO MODE CONTROLS --- */
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Rakip Eğitmen & Zorluk
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Brock */}
                    <button
                      type="button"
                      onClick={() => setDifficulty('easy')}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        difficulty === 'easy'
                          ? 'bg-emerald-950/30 border-emerald-500/70 text-white'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="mb-1">
                        <span className="text-xs font-black">Brock</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">Çaylak</span>
                      <span className="text-[9px] text-slate-500 mt-0.5">Temkinli</span>
                    </button>

                    {/* Gary */}
                    <button
                      type="button"
                      onClick={() => setDifficulty('medium')}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        difficulty === 'medium'
                          ? 'bg-amber-950/30 border-amber-500/70 text-white'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="mb-1">
                        <span className="text-xs font-black">Gary</span>
                      </div>
                      <span className="text-[10px] text-amber-400 font-mono">Kurnaz</span>
                      <span className="text-[9px] text-slate-500 mt-0.5">Blöfçü</span>
                    </button>

                    {/* Red */}
                    <button
                      type="button"
                      onClick={() => setDifficulty('hard')}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        difficulty === 'hard'
                          ? 'bg-rose-950/30 border-rose-500/70 text-white'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="mb-1">
                        <span className="text-xs font-black">Red</span>
                      </div>
                      <span className="text-[10px] text-rose-400 font-mono">Şampiyon</span>
                      <span className="text-[9px] text-slate-500 mt-0.5">Agresif</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartBotGame}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Bot className="w-4 h-4" />
                    Antrenmana Başla
                  </button>
                </div>
              ) : (
                /* --- MULTIPLAYER CONTROLS --- */
                <div className="space-y-4">
                  {/* Create Room Button (Clean, no sparkle emoji) */}
                  <button
                    type="button"
                    onClick={handleCreateRoom}
                    className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition cursor-pointer"
                  >
                    Yeni Oda Oluştur
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-800 w-full" />
                    <span className="bg-slate-900 px-2 text-[10px] text-slate-500 uppercase font-mono">veya kod ile katıl</span>
                  </div>

                  {/* Join Room Form */}
                  <form onSubmit={handleJoinRoom} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={4}
                        placeholder="ODA KODU"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-center text-white font-mono font-black tracking-widest text-base uppercase focus:outline-none focus:border-blue-500 transition"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-md shadow-blue-600/30 cursor-pointer flex-shrink-0"
                      >
                        Katıl
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            
          </div>
        </div>
      ) : (
        /* --- INSIDE WAITING ROOM: WITH CLEAN BACK BUTTON --- */
        <div className="max-w-xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl text-center space-y-6">
          
          {/* Room Top Bar with Back Button */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <button
              type="button"
              onClick={onLeaveRoom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition border border-slate-700 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Ana Sayfaya Dön
            </button>

            <span className="text-[11px] font-mono text-slate-400">
              BEKLEME SALONU
            </span>
          </div>

          {/* Room Code Display */}
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">
              Oda Kodu
            </div>
            <div className="inline-flex items-center gap-3 bg-slate-950 border border-slate-700 rounded-xl px-5 py-2.5 shadow-inner">
              <span className="font-mono text-2xl font-black text-amber-400 tracking-widest">
                {room.code}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title="Kodu Kopyala"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Bu kodu arkadaşına göndererek odaya katılmasını sağla.
            </p>
          </div>

          {/* Player Matchup Pods */}
          <div className="grid grid-cols-2 gap-3 text-left">
            {/* Player 1 */}
            <div className="bg-red-950/20 border border-red-500/40 rounded-xl p-4">
              <div className="text-[9px] uppercase font-bold text-red-400 tracking-wider mb-1">
                1. Antrenör (Kırmızı)
              </div>
              <div className="text-base font-black text-white truncate">
                {room.players[0]?.name}
              </div>
              <div className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" /> Hazır
              </div>
            </div>

            {/* Player 2 */}
            <div className={`rounded-xl p-4 border transition-all ${
              room.players[1]
                ? 'bg-blue-950/20 border-blue-500/40'
                : 'bg-slate-950/50 border-dashed border-slate-700'
            }`}>
              <div className="text-[9px] uppercase font-bold text-blue-400 tracking-wider mb-1">
                2. Antrenör (Mavi)
              </div>
              {room.players[1] ? (
                <>
                  <div className="text-base font-black text-white truncate">
                    {room.players[1].name}
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Katıldı
                  </div>
                </>
              ) : (
                <div className="space-y-2 py-0.5">
                  <div className="text-xs font-semibold text-slate-500">
                    Arkadaşın bekleniyor...
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBotToRoom}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/30 border border-indigo-500/40 hover:bg-indigo-600/50 text-indigo-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Bot className="w-3 h-3" />
                    Bot Çağır
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          {isHost ? (
            <button
              type="button"
              onClick={handleStartGame}
              disabled={!isReadyToStart}
              className={`w-full py-3.5 px-6 rounded-xl font-black text-base transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                isReadyToStart
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              {isReadyToStart ? 'AÇIK ARTIRMAYI BAŞLAT' : '2. Oyuncu Bekleniyor'}
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
              <Users className="w-4 h-4 text-blue-400 animate-spin" />
              Oda kurucusunun oyunu başlatması bekleniyor...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
