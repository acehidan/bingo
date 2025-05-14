import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface BingoCell {
  number: number;
  marked: boolean;
}

export interface BingoCard {
  id: string;
  cells: BingoCell[][];
}

export interface Player {
  id: string;
  name: string;
  card: BingoCard;
  hasWon: boolean;
}

export interface Game {
  id: string;
  name: string;
  createdBy: string;
  creatorName: string;
  players: Player[];
  calledNumbers: number[];
  currentNumber: number | null;
  status: 'waiting' | 'playing' | 'finished';
  winner: Player | null;
}

interface GameState {
  game: Game | null;
  setGame: (game: Game | null) => void;
  markNumber: (number: number) => void;
  checkWin: () => boolean;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  game: null,
  
  setGame: (game) => set({ game }),
  
  markNumber: (number) => {
    set((state) => {
      if (!state.game) return state;
      
      // Mark the number on the player's card
      const updatedPlayers = state.game.players.map(player => {
        const updatedCard = {...player.card};
        updatedCard.cells = updatedCard.cells.map(row => 
          row.map(cell => 
            cell.number === number ? { ...cell, marked: true } : cell
          )
        );
        return { ...player, card: updatedCard };
      });
      
      // Add to called numbers
      const calledNumbers = [...state.game.calledNumbers];
      if (!calledNumbers.includes(number)) {
        calledNumbers.push(number);
      }
      
      return {
        game: {
          ...state.game,
          players: updatedPlayers,
          calledNumbers,
          currentNumber: number
        }
      };
    });
    
    // Check for win after marking
    const hasWon = get().checkWin();
    return hasWon;
  },
  
  checkWin: () => {
    const { game } = get();
    if (!game) return false;
    
    // Find the current player (first player for now)
    const currentPlayerId = localStorage.getItem('userId');
    const currentPlayer = game.players.find(p => p.id === currentPlayerId);
    
    if (!currentPlayer) return false;
    
    const { cells } = currentPlayer.card;
    const size = cells.length;
    
    // Check rows
    for (let row = 0; row < size; row++) {
      if (cells[row].every(cell => cell.marked)) {
        return true;
      }
    }
    
    // Check columns
    for (let col = 0; col < size; col++) {
      let columnMarked = true;
      for (let row = 0; row < size; row++) {
        if (!cells[row][col].marked) {
          columnMarked = false;
          break;
        }
      }
      if (columnMarked) return true;
    }
    
    // Check diagonals
    let diag1 = true;
    let diag2 = true;
    for (let i = 0; i < size; i++) {
      if (!cells[i][i].marked) diag1 = false;
      if (!cells[i][size - 1 - i].marked) diag2 = false;
    }
    
    return diag1 || diag2;
  },
  
  resetGame: () => set({ game: null }),
}));