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
  const totalColumns = 3; // Fixed 3 columns for mobile
  
  // Auto-scroll to focused question
  useEffect(() => {
    if (scrollContainerRef.current) {
      const focusedElement = scrollContainerRef.current.querySelector(`[data-question-index="${currentQuestionIndex}"]`);
      if (focusedElement) {
        focusedElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    }
  }, [currentQuestionIndex]);
  
  const handleQuestionClick = (questionIndex: number) => {
    if (!disabled) {
      onQuestionChange(questionIndex);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
      {/* Questions Grid - Fixed 3 columns, unlimited rows */}
      <div className="overflow-y-auto max-h-[70vh]" ref={scrollContainerRef}>
        <div className="flex gap-2 min-w-max">
          {Array.from({ length: totalColumns }, (_, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-1 flex-shrink-0">
              {/* Column header */}
              <div className="text-center text-sm text-gray-500 mb-1 h-6 font-semibold sticky top-0 bg-white z-10">
                {colIndex + 1}
              </div>

              {/* Generate questions for this column - unlimited */}
              {Array.from({ length: Math.ceil(questions.length / totalColumns) }, (_, rowIndex) => {
                const questionIndex = colIndex * questionsPerColumn + rowIndex;
                if (questionIndex >= questions.length) return null;

                const question = questions[questionIndex];
                const existingAnswer = answers.find(a => a.questionId === question.id);
                const isFocused = questionIndex === currentQuestionIndex;

                return (
                  <div key={question.id} className="relative" data-question-index={questionIndex}>
                    {/* Row number only on first column */}
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
                      onClick={() => handleQuestionClick(questionIndex)}
                    >
                      {/* Question numbers */}
                      <div className="w-12 h-20 flex flex-col border-r border-gray-300">
                        <div className="text-center text-sm font-mono py-1 border-b border-gray-200 flex-1 flex items-center justify-center">
                          {question.num1}
                        </div>
                        <div className="text-center text-sm font-mono py-1 flex-1 flex items-center justify-center">
                          {question.num2}
                        </div>
                      </div>

                      {/* Answer area */}
                      <div className="w-12 h-20 relative flex items-center justify-center">
                        <div className="text-xl font-mono font-bold text-gray-700">
                          {existingAnswer?.answer || ''}
                        </div>

                        {existingAnswer?.wasChanged && (
                          <div className="absolute -right-0.5 -top-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        )}

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

      {/* Progress & Instructions */}
      <div className="mt-4 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(((currentQuestionIndex + 1) / questions.length) * 100, 100)}%` }}
        />
      </div>
      <div className="text-center text-xs text-gray-500 mt-1">
        Soal {currentQuestionIndex + 1} • Unlimited questions available
      </div>

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