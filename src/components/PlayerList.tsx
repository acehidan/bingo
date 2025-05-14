import { User, Trophy } from 'lucide-react';
import { Player } from '../stores/gameStore';

interface PlayerListProps {
  players: Player[];
  currentPlayer?: string;
}

const PlayerList = ({ players, currentPlayer }: PlayerListProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-3">Players ({players.length})</h2>
      <ul className="space-y-2">
        {players.map((player) => (
          <li 
            key={player.id}
            className={`
              flex items-center justify-between p-2 rounded-md
              ${player.id === currentPlayer ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'}
              ${player.hasWon ? 'border-2 border-accent-500' : ''}
            `}
          >
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-500 mr-2" />
              <span className="font-medium">
                {player.name}
                {player.id === currentPlayer && (
                  <span className="ml-2 text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </span>
            </div>
            {player.hasWon && (
              <Trophy className="h-5 w-5 text-accent-500" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;