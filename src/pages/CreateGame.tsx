import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, Users, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { socket } from '../lib/socket';

const CreateGame = () => {
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'single' | 'multi'>('multi');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a game name');
      return;
    }

    try {
      setLoading(true);
      const gameId = uuidv4();
      const creatorName = user?.email?.split('@')[0] || 'Anonymous';
      
      // Create game room in database
      const { error } = await supabase.from('game_rooms').insert({
        id: gameId,
        name: name.trim(),
        created_by: user?.id,
        creator_name: creatorName,
        status: 'waiting',
        player_count: mode === 'single' ? 1 : 0,
        is_single_player: mode === 'single',
      });

      if (error) {
        throw error;
      }

      if (mode === 'multi') {
        // Emit socket event for multiplayer game creation
        socket.emit('createGame', { gameId, name: name.trim() });
      } else {
        // For single player, emit a special event
        socket.emit('createSinglePlayerGame', { gameId, name: name.trim() });
      }

      toast.success('Game created successfully!');
      navigate(`/game/${gameId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/lobby')}
        className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-1" />
        Back to Lobby
      </button>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Game</h1>
        
        <form onSubmit={handleCreateGame}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Game Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter a name for your game"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Mode
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMode('single')}
                className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all
                  ${mode === 'single' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                  }`}
              >
                <User className="h-5 w-5 mr-2" />
                Single Player
              </button>
              <button
                type="button"
                onClick={() => setMode('multi')}
                className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all
                  ${mode === 'multi' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                  }`}
              >
                <Users className="h-5 w-5 mr-2" />
                Multiplayer
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/lobby')}
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400"
            >
              {loading ? (
                <>
                  <Loader2 className="inline-block h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Game'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGame;