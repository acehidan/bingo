import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useGameStore, BingoCard as BingoCardType, Player } from '../stores/gameStore';
import { socket, connectSocket } from '../lib/socket';
import BingoCard from '../components/BingoCard';
import NumberBoard from '../components/NumberBoard';
import PlayerList from '../components/PlayerList';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Loader2, Play, Trophy } from 'lucide-react';
import Confetti from 'react-confetti';

const Game = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { game, setGame, markNumber, checkWin, resetGame } = useGameStore();
  
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Generate a bingo card
  const generateBingoCard = (): BingoCardType => {
    const card: BingoCardType = {
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
      const numbers = new Set<number>();
      
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

  const fetchGameData = async () => {
    if (!id || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        toast.error('Game not found');
        navigate('/lobby');
        return;
      }
      
      // Check if user is the host
      setIsHost(data.created_by === user.id);
      
      // Connect to socket room
      connectSocket(user.id);
      socket.emit('joinGame', {
        gameId: id,
        userId: user.id,
        playerName: user.email?.split('@')[0] || 'Guest',
      });
      
    } catch (error: any) {
      toast.error(error.message || 'Error fetching game data');
      navigate('/lobby');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = () => {
    if (!id) return;
    
    socket.emit('startGame', {
      gameId: id,
    });
    
    toast.success('Game started!');
  };
  
  const handleCellClick = (number: number) => {
    if (game?.status !== 'playing') return;
    
    const isMarked = markNumber(number);
    
    // If this results in a win, emit win event
    if (isMarked && checkWin()) {
      socket.emit('playerWon', {
        gameId: id,
        userId: user?.id,
        playerName: user?.email?.split('@')[0] || 'Guest',
      });
      
      // Show confetti animation
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    fetchGameData();
    
    return () => {
      // Leave the game room when component unmounts
      if (id) {
        socket.emit('leaveGame', {
          gameId: id,
          userId: user?.id,
        });
      }
      
      // Reset game state
      resetGame();
    };
  }, [id, user, resetGame]);

  useEffect(() => {
    if (!id) return;
    
    // Handle socket events
    socket.on('gameState', (gameData) => {
      if (gameData.id === id) {
        setGame(gameData);
      }
    });
    
    socket.on('numberCalled', ({ gameId, number }) => {
      if (gameId === id) {
        markNumber(number);
      }
    });
    
    socket.on('gameWon', ({ gameId, userId, playerName }) => {
      if (gameId === id) {
        toast.success(`${playerName} got BINGO!`);
        
        // If current user won, show confetti
        if (userId === user?.id) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      }
    });
    
    return () => {
      socket.off('gameState');
      socket.off('numberCalled');
      socket.off('gameWon');
    };
  }, [id, user, setGame, markNumber]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        <span className="ml-2 text-lg text-gray-600">Loading game...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
        />
      )}
      
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/lobby')}
          className="flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Lobby
        </button>
        
        {game && (
          <div className="flex items-center">
            <h2 className="text-xl font-bold">{game.name}</h2>
            <span className={`ml-3 px-3 py-1 text-xs rounded-full 
              ${game.status === 'waiting' 
                ? 'bg-teal-100 text-teal-800'
                : game.status === 'playing'
                ? 'bg-primary-100 text-primary-800'
                : 'bg-gray-100 text-gray-800'
              }`}
            >
              {game.status === 'waiting' ? 'Waiting for players' : 
               game.status === 'playing' ? 'Game in progress' : 'Game ended'}
            </span>
          </div>
        )}
        
        {isHost && game?.status === 'waiting' && (
          <button
            onClick={handleStartGame}
            disabled={!game || game.players.length < 2}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Game
            {(!game || game.players.length < 2) && (
              <span className="ml-2 text-xs">
                (Need at least 2 players)
              </span>
            )}
          </button>
        )}
      </div>
      
      {game && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Game status message */}
            {game.status === 'waiting' ? (
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <p className="text-lg">
                  Waiting for the host to start the game...
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {isHost 
                    ? 'You can start the game once at least 2 players have joined'
                    : 'The host will start the game soon'}
                </p>
              </div>
            ) : game.status === 'finished' && game.winner ? (
              <div className="bg-accent-100 p-4 rounded-lg shadow-sm text-center">
                <div className="flex justify-center items-center">
                  <Trophy className="h-6 w-6 text-accent-600 mr-2" />
                  <p className="text-xl font-bold text-accent-900">
                    {game.winner.name} won the game!
                  </p>
                </div>
              </div>
            ) : null}
            
            {/* Bingo board */}
            {game.players.length > 0 && user && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Your Bingo Card</h3>
                {game.players.find(p => p.id === user.id)?.card && (
                  <BingoCard 
                    card={game.players.find(p => p.id === user.id)!.card}
                    readonly={game.status !== 'playing'}
                    onCellClick={handleCellClick}
                    calledNumbers={game.calledNumbers}
                  />
                )}
              </div>
            )}
            
            {/* Number board */}
            {game.status !== 'waiting' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Called Numbers</h3>
                <NumberBoard 
                  calledNumbers={game.calledNumbers}
                  currentNumber={game.currentNumber}
                />
              </div>
            )}
          </div>
          
          {/* Player list sidebar */}
          <div>
            <PlayerList 
              players={game.players}
              currentPlayer={user?.id}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;