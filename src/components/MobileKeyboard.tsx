import React from 'react';
import { Delete } from 'lucide-react';

interface MobileKeyboardProps {
  onNumberPress: (number: string) => void;
  onDelete: () => void;
}

export function MobileKeyboard({ onNumberPress, onDelete }: MobileKeyboardProps) {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 p-4 z-50 md:hidden shadow-2xl">
      <div className="max-w-sm mx-auto">
        {/* Numbers Grid */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {numbers.map((number) => (
            <button
              key={number}
              onClick={() => onNumberPress(number)}
              className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xl py-4 rounded-lg transition-all duration-150 shadow-md active:scale-95"
            >
              {number}
            </button>
          ))}
        </div>
        
        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-150 shadow-md flex items-center justify-center gap-2 active:scale-95"
        >
          <Delete className="w-5 h-5" />
          Hapus
        </button>
      </div>
    </div>
  );
}