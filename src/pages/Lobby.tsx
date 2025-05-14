import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-hot-toast';
import { PlusCircle, Loader2 } from 'lucide-react';
import GameCard from '../components/GameCard';
import { connectSocket, socket } from '../lib/socket';

interface GameRoom {
  id: string;
  name: string;
  created_by: string;
  creator_name: string;
  player_count: number;
  status: 'waiting' | 'playing' | 'finished';
}

const Lobby = () => {
  const { user } = useAuthStore();
  const [games, setGames] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('game_rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setGames(data as GameRoom[]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();

    if (user) {
      // Connect socket with user ID for real-time updates
      connectSocket(user.id);
    }

    // Listen for new game created
    socket.on('gameCreated', () => {
      fetchGames();
    });

    // Listen for game updates (players joined, game status changed)
    socket.on('gameUpdated', () => {
      fetchGames();
    });

    return () => {
      socket.off('gameCreated');
      socket.off('gameUpdated');
    };
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Game Lobby</h1>
        <Link
          to="/create-game"
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Create Game
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          <span className="ml-2 text-lg text-gray-600">Loading games...</span>
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No games available</h2>
          <p className="text-gray-600 mb-6">Be the first to create a game and invite others to play!</p>
          <Link
            to="/create-game"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Create Game
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              id={game.id}
              name={game.name}
              creatorName={game.creator_name}
              playerCount={game.player_count}
              status={game.status}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Lobby;