import { motion } from 'framer-motion';

interface NumberBoardProps {
  calledNumbers: number[];
  currentNumber: number | null;
}

const NumberBoard = ({ calledNumbers, currentNumber }: NumberBoardProps) => {
  // Generate array of all possible bingo numbers (1-75)
  const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
  
  // Group numbers by column (B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75)
  const columns = {
    B: allNumbers.slice(0, 15),
    I: allNumbers.slice(15, 30),
    N: allNumbers.slice(30, 45),
    G: allNumbers.slice(45, 60),
    O: allNumbers.slice(60, 75)
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold text-center mb-4">Called Numbers</h2>
      
      {currentNumber && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-4 p-4 bg-primary-100 rounded-lg text-center"
        >
          <span className="text-primary-900 font-bold mr-2">
            Current Call:
          </span>
          <span className="text-2xl font-bold text-primary-700">
            {Object.entries(columns).find(([_, numbers]) => 
              numbers.includes(currentNumber)
            )?.[0] || ''}-{currentNumber}
          </span>
        </motion.div>
      )}
      
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(columns).map(([letter, numbers]) => (
          <div key={letter} className="text-center">
            <div className="bg-primary-600 text-white py-2 rounded-t-md font-bold">
              {letter}
            </div>
            <div className="bg-gray-100 rounded-b-md p-1">
              {numbers.map(number => (
                <motion.div
                  key={number}
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: currentNumber === number ? [1, 1.1, 1] : 1,
                    backgroundColor: calledNumbers.includes(number) ? '#8B5CF6' : '#FFFFFF'
                  }}
                  transition={{ duration: 0.3 }}
                  className={`
                    m-1 rounded-full w-8 h-8 mx-auto flex items-center justify-center text-sm
                    ${calledNumbers.includes(number)
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-800'}
                  `}
                >
                  {number}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NumberBoard;