import React, { useEffect, useRef } from 'react';
import { Question, Answer } from '../types/test';

interface MobileQuestionGridProps {
  questions: Question[];
  answers: Answer[];
  onAnswer: (questionId: string, answer: string) => void;
  currentQuestionIndex: number;
  onQuestionChange: (index: number) => void;
  disabled?: boolean;
}

export function MobileQuestionGrid({ 
  questions, 
  answers, 
  onAnswer, 
  currentQuestionIndex,
  onQuestionChange,
  disabled 
}: MobileQuestionGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const questionsPerColumn = 25;
  const columnsPerView = 3; // Show 3 columns at a time
  
  // Calculate which set of 3 columns to show based on current question
  const currentColumnSet = Math.floor(Math.floor(currentQuestionIndex / 25) / 3);
  const startColumn = currentColumnSet * 3;
  const endColumn = Math.min(startColumn + 3, Math.ceil(questions.length / 25));
  const actualColumns = endColumn - startColumn;
  
  // Get questions for current view (3 columns)
  const visibleQuestions = questions.slice(
    startColumn * 25, 
    endColumn * 25
  );
  
  // Adjust current question index for the visible set
  const adjustedCurrentIndex = currentQuestionIndex - (startColumn * 25);
  
  // Auto-scroll to focused question
  useEffect(() => {
    if (scrollContainerRef.current && adjustedCurrentIndex >= 0) {
      const focusedElement = scrollContainerRef.current.querySelector(`[data-question-index="${adjustedCurrentIndex}"]`);
      if (focusedElement) {
        focusedElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    }
  }, [adjustedCurrentIndex]);
  
  const handleQuestionClick = (localIndex: number) => {
    if (!disabled) {
      const globalIndex = startColumn * 25 + localIndex;
      onQuestionChange(globalIndex);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
      {/* Column Set Navigation */}
      {Math.ceil(questions.length / 75) > 1 && (
        <div className="flex justify-center items-center gap-4 mb-4">
          <button
            onClick={() => {
              if (currentColumnSet > 0) {
                const newIndex = (currentColumnSet - 1) * 75;
                onQuestionChange(newIndex);
              }
            }}
            disabled={currentColumnSet === 0}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          
          <span className="text-sm font-medium text-gray-600">
            Kolom {startColumn + 1}-{endColumn} dari {Math.ceil(questions.length / 25)}
          </span>
          
          <button
            onClick={() => {
              if ((currentColumnSet + 1) * 75 < questions.length) {
                const newIndex = (currentColumnSet + 1) * 75;
                onQuestionChange(newIndex);
              }
            }}
            disabled={(currentColumnSet + 1) * 75 >= questions.length}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
      
      {/* Questions Grid - Current 3 columns */}
      <div className="overflow-x-auto overflow-y-visible" ref={scrollContainerRef}>
        <div className="flex gap-2 justify-center" style={{ minWidth: 'fit-content' }}>
          {Array.from({ length: actualColumns }, (_, colIndex) => (
            <div key={startColumn + colIndex} className="flex flex-col gap-1">
              {/* Column header with numbers */}
              <div className="text-center text-sm text-gray-500 mb-1 h-6 font-semibold">
                {startColumn + colIndex + 1}
              </div>
              
              {Array.from({ length: questionsPerColumn }, (_, rowIndex) => {
                const localQuestionIndex = colIndex * questionsPerColumn + rowIndex;
                const globalQuestionIndex = startColumn * 25 + localQuestionIndex;
                
                if (localQuestionIndex >= visibleQuestions.length) return null;
                
                const question = visibleQuestions[localQuestionIndex];
                const existingAnswer = answers.find(a => a.questionId === question.id);
                const isFocused = globalQuestionIndex === currentQuestionIndex;
                
                return (
                  <div key={question.id} className="relative" data-question-index={localQuestionIndex}>
                    {/* Row number on the left for first column */}
                    {colIndex === 0 && (
                      <div className="absolute -left-8 top-0 h-full flex items-center">
                        <span className="text-sm text-gray-400 font-mono">
                          {rowIndex + 1}
                        </span>
                      </div>
                    )}
                    
                    <div 
                      className={`border-2 flex cursor-pointer transition-all duration-200 ${
                        isFocused 
                          ? 'border-blue-500 bg-blue-50 shadow-lg' 
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                      onClick={() => handleQuestionClick(localQuestionIndex)}
                    >
                      {/* Question numbers stacked vertically */}
                      <div className="w-12 h-20 flex flex-col border-r border-gray-300">
                        <div className="text-center text-sm font-mono py-1 border-b border-gray-200 flex-1 flex items-center justify-center">
                          {question.num1}
                        </div>
                        <div className="text-center text-sm font-mono py-1 flex-1 flex items-center justify-center">
                          {question.num2}
                        </div>
                      </div>
                      
                      {/* Answer display */}
                      <div className="w-12 h-20 relative flex items-center justify-center">
                        <div className="text-xl font-mono font-bold text-gray-700">
                          {existingAnswer?.answer || ''}
                        </div>
                        
                        {/* Correction indicator only */}
                        {existingAnswer?.wasChanged && (
                          <div className="absolute -right-0.5 -top-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        )}
                        
                        {/* Focus indicator */}
                        {isFocused && (
                          <div className="absolute inset-0 border-2 border-blue-400 rounded-sm animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Progress Indicator - Global progress */}
      <div className="mt-4 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(((currentQuestionIndex + 1) / Math.min(questions.length, 300)) * 100, 100)}%` }}
        />
      </div>
      <div className="text-center text-xs text-gray-500 mt-1">
        Soal {currentQuestionIndex + 1} • Unlimited questions available
      </div>
      
      {/* Navigation Instructions */}
      <div className="mt-3 text-center text-xs text-gray-600 bg-blue-50 rounded-lg p-2">
        <div className="font-semibold mb-1">Pola Pengisian:</div>
        <div>Kiri → Tengah → Kanan → Kiri (baris berikutnya)</div>
        <div className="text-xs text-gray-500 mt-1">
          Kerjakan sebanyak mungkin dalam waktu yang tersedia
        </div>
      </div>
    </div>
  );
}