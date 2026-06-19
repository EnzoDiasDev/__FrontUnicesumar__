const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store active games
const games = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Create a new game
  socket.on('create_game', () => {
    const gameId = generateGameId();
    games.set(gameId, {
      whitePlayer: socket.id,
      blackPlayer: null,
      board: null
    });
    
    socket.join(gameId);
    socket.emit('game_joined', { gameId, color: 'white' });
    console.log(`Game created: ${gameId} by ${socket.id}`);
  });

  // Join an existing game
  socket.on('join_game', ({ gameId }) => {
    const game = games.get(gameId);
    
    if (!game) {
      socket.emit('error', 'Game not found');
      return;
    }

    if (game.blackPlayer) {
      socket.emit('error', 'Game is full');
      return;
    }

    game.blackPlayer = socket.id;
    socket.join(gameId);
    socket.emit('game_joined', { gameId, color: 'black' });
    
    // Notify white player that opponent joined
    io.to(game.whitePlayer).emit('opponent_joined');
    console.log(`Player joined game: ${gameId} as black`);
  });

  // Handle move
  socket.on('make_move', ({ gameId, fromRow, fromCol, toRow, toCol, newTurn }) => {
    const game = games.get(gameId);
    if (!game) return;

    // Broadcast move to opponent
    socket.to(gameId).emit('move_made', {
      fromRow,
      fromCol,
      toRow,
      toCol,
      newTurn
    });
  });

  // Handle game over
  socket.on('game_over', ({ gameId, result }) => {
    const game = games.get(gameId);
    if (!game) return;

    socket.to(gameId).emit('game_over', { result });
  });

  // Handle reset game
  socket.on('reset_game', ({ gameId }) => {
    const game = games.get(gameId);
    if (!game) return;

    io.to(gameId).emit('reset_game');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Find and clean up games
    for (const [gameId, game] of games.entries()) {
      if (game.whitePlayer === socket.id || game.blackPlayer === socket.id) {
        const opponentId = game.whitePlayer === socket.id ? game.blackPlayer : game.whitePlayer;
        if (opponentId) {
          io.to(opponentId).emit('opponent_disconnected');
        }
        games.delete(gameId);
        console.log(`Game ${gameId} deleted due to disconnect`);
        break;
      }
    }
  });
});

// Generate random game ID
function generateGameId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
