import { motion } from 'framer-motion';
import { BingoCard as BingoCardType } from '../stores/gameStore';

interface BingoCardProps {
  card: BingoCardType;
  readonly?: boolean;
  onCellClick?: (number: number) => void;
  calledNumbers?: number[];
}

const BingoCard = ({ card, readonly = false, onCellClick, calledNumbers = [] }: BingoCardProps) => {
  const handleCellClick = (number: number, marked: boolean) => {
    if (readonly || marked) return;
    onCellClick && onCellClick(number);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-3 bg-primary-600 text-white text-center font-bold text-2xl">
        <div className="grid grid-cols-5 gap-1">
          {['B', 'I', 'N', 'G', 'O'].map((letter) => (
            <div key={letter} className="p-2">
              {letter}
            </div>
          ))}
        </div>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-5 gap-1">
          {card.cells.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isCalled = calledNumbers.includes(cell.number);
              const isJustCalled = calledNumbers.length > 0 && calledNumbers[calledNumbers.length - 1] === cell.number;
              
              return (
                <motion.div
                  key={`${rowIndex}-${colIndex}`}
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: isJustCalled ? [1, 1.1, 1] : 1,
                    backgroundColor: cell.marked ? '#8B5CF6' : (isCalled ? '#EDEDFD' : '#FFFFFF')
                  }}
                  transition={{ duration: 0.3 }}
                  className={`
                    aspect-square flex items-center justify-center rounded
                    border-2 cursor-pointer 
                    ${cell.marked 
                      ? 'bg-primary-500 text-white border-primary-600' 
                      : isCalled 
                        ? 'bg-primary-50 border-primary-200 hover:bg-primary-100'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }
                    ${rowIndex === 2 && colIndex === 2 && 'bg-primary-500 text-white border-primary-600'}
                  `}
                  onClick={() => handleCellClick(cell.number, cell.marked)}
                >
                  {rowIndex === 2 && colIndex === 2 ? (
                    <span className="font-bold">FREE</span>
                  ) : (
                    <span className="text-lg font-semibold">{cell.number}</span>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default BingoCard;