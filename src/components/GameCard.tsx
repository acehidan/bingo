import { useNavigate } from 'react-router-dom';
import { Users, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameCardProps {
  id: string;
  name: string;
  creatorName: string;
  playerCount: number;
  status: 'waiting' | 'playing' | 'finished';
}

const GameCard = ({ id, name, creatorName, playerCount, status }: GameCardProps) => {
  const navigate = useNavigate();

  const handleJoinGame = () => {
    navigate(`/game/${id}`);
  };

  const statusColors = {
    waiting: 'bg-teal-100 text-teal-800',
    playing: 'bg-primary-100 text-primary-800',
    finished: 'bg-gray-100 text-gray-800',
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:border-primary-300 transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status]}`}>
          {status === 'waiting' ? 'Waiting for players' : 
           status === 'playing' ? 'In progress' : 'Finished'}
        </span>
      </div>
      
      <div className="text-sm text-gray-600 mb-3">
        Created by: {creatorName}
      </div>
      
      <div className="flex items-center text-sm text-gray-700 mb-4">
        <Users className="h-4 w-4 mr-1" />
        <span>{playerCount} players</span>
      </div>
      
      <button
        onClick={handleJoinGame}
        disabled={status === 'finished'}
        className={`
          w-full flex items-center justify-center py-2 px-4 rounded-md text-white font-medium
          ${status === 'finished' 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
          }
        `}
      >
        <PlayCircle className="h-5 w-5 mr-2" />
        {status === 'waiting' ? 'Join Game' : status === 'playing' ? 'Rejoin Game' : 'Game Ended'}
      </button>
    </motion.div>
  );
};

export default GameCard;