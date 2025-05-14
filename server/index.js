import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.VITE_APP_URL || "*",
    methods: ["GET", "POST"]
  }
});

// Store active games
const games = new Map();

// Generate a random number 1-75 that hasn't been called yet
const generateRandomNumber = (calledNumbers) => {
  const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
  const availableNumbers = allNumbers.filter(num => !calledNumbers.includes(num));
  
  if (availableNumbers.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * availableNumbers.length);
  return availableNumbers[randomIndex];
};

// Generate a bingo card
const generateBingoCard = () => {
  const card = {
    id: uuidv4(),
    cells: Array(5).fill(null).map(() => Array(5).fill(null)),
  };
  
  // B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
  const ranges = [
    [1, 15],  // B column
    [16, 30], // I column
    [31, 45], // N column
    [46, 60], // G column
    [61, 75], // O column
  ];
  
  // For each column
  for (let col = 0; col < 5; col++) {
    const [min, max] = ranges[col];
    const numbers = new Set();
    
    // Generate 5 unique numbers for each column
    while (numbers.size < 5) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      numbers.add(num);
    }
    
    // Assign numbers to cells
    const columnNumbers = Array.from(numbers);
    for (let row = 0; row < 5; row++) {
      // Free space in the middle
      if (col === 2 && row === 2) {
        card.cells[row][col] = { number: 0, marked: true };
      } else {
        card.cells[row][col] = { number: columnNumbers[row], marked: false };
      }
    }
  }
  
  return card;
};

// Start number calling for single player game
const startSinglePlayerGame = (gameId) => {
  const game = games.get(gameId);
  if (!game || game.status !== 'playing') return;

  game.numberCallInterval = setInterval(() => {
    // Stop calling if game is over
    if (game.status === 'finished') {
      clearInterval(game.numberCallInterval);
      return;
    }
    
    // Call a random number
    const number = generateRandomNumber(game.calledNumbers);
    
    // If all numbers have been called, end the game
    if (number === null) {
      game.status = 'finished';
      clearInterval(game.numberCallInterval);
      return;
    }
    
    game.calledNumbers.push(number);
    game.currentNumber = number;
    
    // Notify player of the called number
    io.to(gameId).emit('numberCalled', { gameId, number });
    
    // Send updated game state
    io.to(gameId).emit('gameState', {
      id: gameId,
      name: game.name,
      players: game.players,
      calledNumbers: game.calledNumbers,
      currentNumber: game.currentNumber,
      status: game.status,
      winner: game.winner,
      isSinglePlayer: true
    });
  }, 3000); // Call numbers every 3 seconds for single player
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Create single player game
  socket.on('createSinglePlayerGame', ({ gameId, name }) => {
    console.log(`Creating single player game ${gameId}: ${name}`);
    
    games.set(gameId, {
      id: gameId,
      name,
      players: [],
      calledNumbers: [],
      currentNumber: null,
      status: 'waiting',
      winner: null,
      numberCallInterval: null,
      isSinglePlayer: true
    });
    
    io.emit('gameCreated');
  });

  // Join a game
  socket.on('joinGame', ({ gameId, userId, playerName }) => {
    console.log(`Player ${playerName} (${userId}) joining game ${gameId}`);
    
    socket.join(gameId);
    
    // Initialize game if it doesn't exist
    if (!games.has(gameId)) {
      games.set(gameId, {
        id: gameId,
        players: [],
        calledNumbers: [],
        currentNumber: null,
        status: 'waiting',
        winner: null,
        numberCallInterval: null
      });
    }
    
    const game = games.get(gameId);
    
    // Check if player already exists
    const existingPlayerIndex = game.players.findIndex(p => p.id === userId);
    
    if (existingPlayerIndex === -1) {
      // Add new player with generated card
      game.players.push({
        id: userId,
        name: playerName,
        card: generateBingoCard(),
        hasWon: false
      });
    }
    
    // For single player games, start immediately when player joins
    if (game.isSinglePlayer && game.status === 'waiting') {
      game.status = 'playing';
      startSinglePlayerGame(gameId);
    }
    
    // Send updated game state to all players in the room
    io.to(gameId).emit('gameState', {
      id: gameId,
      name: game.name,
      players: game.players,
      calledNumbers: game.calledNumbers,
      currentNumber: game.currentNumber,
      status: game.status,
      winner: game.winner,
      isSinglePlayer: game.isSinglePlayer
    });
    
    // Notify lobby of updated player count
    io.emit('gameUpdated');
  });
  
  // Leave a game
  socket.on('leaveGame', ({ gameId, userId }) => {
    if (!games.has(gameId)) return;
    
    const game = games.get(gameId);
    
    // Remove player from game
    game.players = game.players.filter(p => p.id !== userId);
    
    // If no players left, clean up the game
    if (game.players.length === 0) {
      if (game.numberCallInterval) {
        clearInterval(game.numberCallInterval);
      }
      games.delete(gameId);
      io.emit('gameUpdated');
      return;
    }
    
    // Send updated game state to all players in the room
    io.to(gameId).emit('gameState', {
      id: gameId,
      name: game.name,
      players: game.players,
      calledNumbers: game.calledNumbers,
      currentNumber: game.currentNumber,
      status: game.status,
      winner: game.winner,
      isSinglePlayer: game.isSinglePlayer
    });
    
    // Notify lobby of updated player count
    io.emit('gameUpdated');
  });
  
  // Create a game
  socket.on('createGame', ({ gameId, name }) => {
    console.log(`Creating game ${gameId}: ${name}`);
    
    games.set(gameId, {
      id: gameId,
      name,
      players: [],
      calledNumbers: [],
      currentNumber: null,
      status: 'waiting',
      winner: null,
      numberCallInterval: null,
      isSinglePlayer: false
    });
    
    // Notify lobby of new game
    io.emit('gameCreated');
  });
  
  // Start a game
  socket.on('startGame', ({ gameId }) => {
    if (!games.has(gameId)) return;
    
    const game = games.get(gameId);
    
    if (!game.isSinglePlayer && game.players.length < 2) return;
    
    game.status = 'playing';
    
    // Start calling numbers
    game.numberCallInterval = setInterval(() => {
      // Stop calling if game is over
      if (game.status === 'finished') {
        clearInterval(game.numberCallInterval);
        return;
      }
      
      // Call a random number
      const number = generateRandomNumber(game.calledNumbers);
      
      // If all numbers have been called, end the game
      if (number === null) {
        game.status = 'finished';
        clearInterval(game.numberCallInterval);
        return;
      }
      
      game.calledNumbers.push(number);
      game.currentNumber = number;
      
      // Notify players of the called number
      io.to(gameId).emit('numberCalled', { gameId, number });
      
      // Send updated game state
      io.to(gameId).emit('gameState', {
        id: gameId,
        name: game.name,
        players: game.players,
        calledNumbers: game.calledNumbers,
        currentNumber: game.currentNumber,
        status: game.status,
        winner: game.winner,
        isSinglePlayer: game.isSinglePlayer
      });
    }, game.isSinglePlayer ? 3000 : 5000);
    
    // Send initial game state to all players
    io.to(gameId).emit('gameState', {
      id: gameId,
      name: game.name,
      players: game.players,
      calledNumbers: game.calledNumbers,
      currentNumber: game.currentNumber,
      status: game.status,
      winner: game.winner,
      isSinglePlayer: game.isSinglePlayer
    });
    
    // Notify lobby of game status change
    io.emit('gameUpdated');
  });
  
  // Player won
  socket.on('playerWon', ({ gameId, userId, playerName }) => {
    if (!games.has(gameId)) return;
    
    const game = games.get(gameId);
    
    // Mark player as winner
    const winningPlayer = game.players.find(p => p.id === userId);
    if (winningPlayer) {
      winningPlayer.hasWon = true;
      game.winner = winningPlayer;
    }
    
    // End the game
    game.status = 'finished';
    if (game.numberCallInterval) {
      clearInterval(game.numberCallInterval);
    }
    
    // Notify all players of the win
    io.to(gameId).emit('gameWon', { gameId, userId, playerName });
    
    // Send updated game state
    io.to(gameId).emit('gameState', {
      id: gameId,
      name: game.name,
      players: game.players,
      calledNumbers: game.calledNumbers,
      currentNumber: game.currentNumber,
      status: game.status,
      winner: game.winner,
      isSinglePlayer: game.isSinglePlayer
    });
    
    // Notify lobby of game status change
    io.emit('gameUpdated');
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});