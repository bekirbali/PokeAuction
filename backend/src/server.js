import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { RoomManager } from './game/RoomManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const roomManager = new RoomManager(io);

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeRooms: roomManager.rooms.size });
});

app.get('/api/pokemon', (req, res) => {
  const pPath = path.join(__dirname, 'data/pokemon_gen1.json');
  const data = JSON.parse(fs.readFileSync(pPath, 'utf8'));
  res.json(data);
});

// Serve frontend build in production
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Socket.io Handlers
io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);

  socket.on('CREATE_ROOM', ({ name, settings }) => {
    const room = roomManager.createRoom(name, socket, settings);
    socket.emit('ROOM_CREATED', {
      code: room.code,
      playerId: socket.id
    });
    roomManager.broadcastRoom(room);
  });

  socket.on('JOIN_ROOM', ({ code, name }) => {
    const result = roomManager.joinRoom(code, name, socket);
    if (result.error) {
      socket.emit('ERROR', { message: result.error });
      return;
    }
    socket.emit('ROOM_JOINED', {
      code: result.room.code,
      playerId: socket.id
    });
    roomManager.broadcastRoom(result.room);
  });

  socket.on('START_BOT_GAME', ({ name, difficulty, settings }) => {
    const result = roomManager.createBotRoom(name, socket, difficulty, settings);
    socket.emit('ROOM_CREATED', {
      code: result.room.code,
      playerId: socket.id
    });
    roomManager.broadcastRoom(result.room);
  });

  socket.on('ADD_BOT_TO_ROOM', ({ code, difficulty }) => {
    const room = roomManager.addBotToRoom(code, difficulty);
    if (room) {
      roomManager.broadcastRoom(room);
    }
  });

  socket.on('LEAVE_ROOM', () => {
    roomManager.removePlayer(socket.id);
    socket.emit('ROOM_LEFT');
  });

  socket.on('START_GAME', () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) return;
    if (room.players.length !== 2) {
      socket.emit('ERROR', { message: 'Oyunun başlaması için 2 oyuncu gerekli!' });
      return;
    }
    roomManager.startAuction(room);
  });

  socket.on('PLACE_BID', ({ amount }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) return;
    roomManager.handleBid(room, socket.id, amount);
  });

  socket.on('PASS_BID', () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) return;
    roomManager.handlePass(room, socket.id);
  });

  socket.on('STARVATION_DECIDE', ({ decision }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) return;
    roomManager.handleStarvationDecision(room, socket.id, decision);
  });

  socket.on('UPDATE_LINEUP', ({ lineup }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) return;
    roomManager.handleLineupUpdate(room, socket.id, lineup);
  });

  socket.on('PLAYER_READY', () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) return;
    roomManager.handlePlayerReady(room, socket.id);
  });

  socket.on('PLAYER_UNREADY', () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) return;
    roomManager.handlePlayerUnready(room, socket.id);
  });

  socket.on('SET_BATTLE_SPEED', ({ speed }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) return;
    roomManager.handleSetBattleSpeed(room, socket.id, speed);
  });

  socket.on('REQUEST_REMATCH', (payload) => {
    roomManager.handleRematch(socket, payload);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
    roomManager.removePlayer(socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`⚡ PokéAuction Server running on http://localhost:${PORT}`);
});
