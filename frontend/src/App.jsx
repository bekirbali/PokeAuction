import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Lobby from './components/Lobby.jsx';
import AuctionArena from './components/AuctionArena.jsx';
import LineupPhase from './components/LineupPhase.jsx';
import BattleArena from './components/BattleArena.jsx';
import MatchSummary from './components/MatchSummary.jsx';
import { sound } from './utils/sound.js';

const BACKEND_URL = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '/';
const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling']
});

export default function App() {
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [battleData, setBattleData] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [notification, setNotification] = useState('');

  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  useEffect(() => {
    socket.on('connect', () => {
      setPlayerId(socket.id);
    });

    socket.on('ROOM_CREATED', ({ code, playerId: pid }) => {
      setPlayerId(pid);
    });

    socket.on('ROOM_JOINED', ({ code, playerId: pid }) => {
      setPlayerId(pid);
    });

    socket.on('ROOM_UPDATE', (updatedRoom) => {
      setRoom(updatedRoom);
      if (updatedRoom.state === 'AUCTION') {
        setBattleData(null);
        setBattleResult(null);
      }
    });

    socket.on('BATTLE_START', (data) => {
      setBattleData(data);
      setBattleResult(null);
    });

    socket.on('TIMER_TICK', ({ timer }) => {
      setRoom(prev => prev ? { ...prev, timer } : prev);
    });

    socket.on('ROOM_LEFT', () => {
      setRoom(null);
      setBattleData(null);
      setBattleResult(null);
    });

    socket.on('OPPONENT_DISCONNECTED', () => {
      triggerNotification('⚠️ Rakibin bağlantısı koptu! Lobiye dönüldü.');
      setBattleData(null);
      setBattleResult(null);
    });

    socket.on('ERROR', ({ message }) => {
      triggerNotification(`❌ ${message}`);
    });

    return () => {
      socket.off('connect');
      socket.off('ROOM_CREATED');
      socket.off('ROOM_JOINED');
      socket.off('ROOM_UPDATE');
      socket.off('BATTLE_START');
      socket.off('TIMER_TICK');
      socket.off('OPPONENT_DISCONNECTED');
      socket.off('ERROR');
    };
  }, []);

  const handleMuteToggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleBattleEnd = (result) => {
    setBattleResult(result);
  };

  return (
    <div className="h-[100dvh] min-h-[100dvh] w-screen overflow-hidden text-slate-100 flex flex-col justify-between selection:bg-red-500 selection:text-white p-1 sm:p-2">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-3 left-1/2 transform -translate-x-1/2 z-50 bg-red-600/90 text-white font-bold px-5 py-2.5 rounded-xl shadow-2xl border border-white/20 text-xs backdrop-blur-md animate-bounce">
          {notification}
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 flex flex-col justify-center overflow-hidden min-h-0">
        {(!room || room.state === 'LOBBY') && (
          <div className="overflow-y-auto max-h-full py-2">
            <Lobby
              room={room}
              socket={socket}
              playerId={playerId}
              onMuteToggle={handleMuteToggle}
              isMuted={isMuted}
            />
          </div>
        )}

        {room?.state === 'AUCTION' && (
          <div className="h-full overflow-y-auto py-0.5 sm:py-1">
            <AuctionArena
              room={room}
              socket={socket}
              playerId={playerId}
              onMuteToggle={handleMuteToggle}
              isMuted={isMuted}
            />
          </div>
        )}

        {room?.state === 'LINEUP' && (
          <div className="overflow-y-auto max-h-full py-2">
            <LineupPhase
              room={room}
              socket={socket}
              playerId={playerId}
              onMuteToggle={handleMuteToggle}
              isMuted={isMuted}
            />
          </div>
        )}

        {room?.state === 'BATTLE' && battleData && (
          battleResult ? (
            <div className="overflow-y-auto max-h-full py-2">
              <MatchSummary
                room={room}
                playerId={playerId}
                battleResult={battleResult}
                socket={socket}
              />
            </div>
          ) : (
            <BattleArena
              battleData={battleData}
              playerId={playerId}
              onBattleEnd={handleBattleEnd}
              onMuteToggle={handleMuteToggle}
              isMuted={isMuted}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="py-0.5 sm:py-1 text-center text-[9px] sm:text-[10px] text-slate-500 font-medium flex-shrink-0">
        ⚡ PokéAuction · 1v1 Canlı Kör Takım Açık Artırması & Savaş Simülatörü
      </footer>
    </div>
  );
}
