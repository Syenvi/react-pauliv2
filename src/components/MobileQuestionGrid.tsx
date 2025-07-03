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
  const columnsToShow = 3; // Always show 3 columns
  
  // Calculate which questions to show based on current question index
  // Show current question and surrounding context
  const startQuestionIndex = Math.max(0, currentQuestionIndex - 37); // Show some context before
  const endQuestionIndex = Math.min(questions.length, startQuestionIndex + 75); // Show 75 questions (3 columns × 25)
  
  // Adjust if we're near the end
  const actualStartIndex = Math.max(0, endQuestionIndex - 75);
  const visibleQuestions = questions.slice(actualStartIndex, endQuestionIndex);
  
  // Adjust current question index for the visible set
  const adjustedCurrentIndex = currentQuestionIndex - actualStartIndex;
  
  // Auto-scroll to focused question with better centering
  useEffect(() => {
    if (scrollContainerRef.current && adjustedCurrentIndex >= 0 && adjustedCurrentIndex < visibleQuestions.length) {
      const focusedElement = scrollContainerRef.current.querySelector(`[data-question-index="${adjustedCurrentIndex}"]`);
      if (focusedElement) {
        // Calculate the position to center the element
        const container = scrollContainerRef.current;
        const elementRect = focusedElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculate scroll position to center the element
        const elementTop = focusedElement.offsetTop;
        const elementHeight = elementRect.height;
        const containerHeight = containerRect.height;
        
        const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
        
        container.scrollTo({
          top: Math.max(0, scrollTop),
          behavior: 'smooth'
        });
      }
    }
  }, [adjustedCurrentIndex, visibleQuestions.length]);
  
  const handleQuestionClick = (localIndex: number) => {
    if (!disabled) {
      const globalIndex = actualStartIndex + localIndex;
      onQuestionChange(globalIndex);
    }
  };
  
  // Calculate how many columns we actually have
  const actualColumns = Math.min(columnsToShow, Math.ceil(visibleQuestions.length / questionsPerColumn));
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
      {/* Questions Grid - Always 3 columns, scrollable content */}
      <div className="overflow-y-auto max-h-96" ref={scrollContainerRef}>
        <div className="flex gap-2 justify-center">
          {Array.from({ length: actualColumns }, (_, colIndex) => {
            // Calculate the actual column number in the global context
            const globalColumnIndex = Math.floor(actualStartIndex / questionsPerColumn) + colIndex;
            
            return (
              <div key={globalColumnIndex} className="flex flex-col gap-1">
                {/* Column header with numbers */}
                <div className="text-center text-sm text-gray-500 mb-1 h-6 font-semibold sticky top-0 bg-white z-10">
                  {globalColumnIndex + 1}
                </div>
                
                {Array.from({ length: questionsPerColumn }, (_, rowIndex) => {
                  const localQuestionIndex = colIndex * questionsPerColumn + rowIndex;
                  
                  if (localQuestionIndex >= visibleQuestions.length) return null;
                  
                  const question = visibleQuestions[localQuestionIndex];
                  const globalQuestionIndex = actualStartIndex + localQuestionIndex;
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
            );
          })}
        </div>
      </div>
      
      {/* Progress Indicator - Global progress */}
      <div className="mt-4 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(((currentQuestionIndex + 1) / questions.length) * 100, 100)}%` }}
        />
      </div>
      <div className="text-center text-xs text-gray-500 mt-1">
        Soal {currentQuestionIndex + 1} dari {questions.length} • 4000 soal tersedia
      </div>
      
      {/* Navigation Instructions */}
      <div className="mt-3 text-center text-xs text-gray-600 bg-blue-50 rounded-lg p-2">
        <div className="font-semibold mb-1">Pola Pengisian Mobile:</div>
        <div>Kiri → Tengah → Kanan → Kiri (baris berikutnya)</div>
        <div className="text-xs text-gray-500 mt-1">
          Ketuk soal untuk memilih, gunakan keyboard di bawah
        </div>
      </div>
    </div>
  );
}