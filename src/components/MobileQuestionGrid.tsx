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
  
  // Auto-scroll to focused question
  useEffect(() => {
    if (scrollContainerRef.current) {
      const focusedElement = scrollContainerRef.current.querySelector(`[data-question-index="${currentQuestionIndex}"]`);
      if (focusedElement) {
        focusedElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
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
      {/* Questions Grid - Vertical layout for mobile */}
      <div className="max-h-96 overflow-y-auto" ref={scrollContainerRef}>
        <div className="space-y-2">
          {questions.map((question, questionIndex) => {
            const existingAnswer = answers.find(a => a.questionId === question.id);
            const isFocused = questionIndex === currentQuestionIndex;
            
            return (
              <div key={question.id} className="relative" data-question-index={questionIndex}>
                <div 
                  className={`border-2 flex cursor-pointer transition-all duration-200 ${
                    isFocused 
                      ? 'border-blue-500 bg-blue-50 shadow-lg' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  onClick={() => handleQuestionClick(questionIndex)}
                >
                  {/* Question number indicator */}
                  <div className="w-12 h-20 flex items-center justify-center border-r border-gray-300 bg-gray-50">
                    <span className="text-sm font-semibold text-gray-600">
                      {questionIndex + 1}
                    </span>
                  </div>
                  
                  {/* Question numbers stacked vertically */}
                  <div className="w-16 h-20 flex flex-col border-r border-gray-300">
                    <div className="text-center text-lg font-mono py-2 border-b border-gray-200 flex-1 flex items-center justify-center">
                      {question.num1}
                    </div>
                    <div className="text-center text-lg font-mono py-2 flex-1 flex items-center justify-center">
                      {question.num2}
                    </div>
                  </div>
                  
                  {/* Answer display */}
                  <div className="w-16 h-20 relative flex items-center justify-center">
                    <div className="text-2xl font-mono font-bold text-gray-700">
                      {existingAnswer?.answer || ''}
                    </div>
                    
                    {/* Correction indicator */}
                    {existingAnswer?.wasChanged && (
                      <div className="absolute -right-1 -top-1 w-2 h-2 bg-orange-500 rounded-full" />
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
      </div>
      
      {/* Progress Indicator */}
      <div className="mt-4 bg-gray-200 rounded-full h-3">
        <div 
          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>
      <div className="text-center text-sm text-gray-600 mt-2">
        Soal {currentQuestionIndex + 1} dari {questions.length}
      </div>
      
      {/* Instructions */}
      <div className="mt-3 text-center text-xs text-gray-600 bg-blue-50 rounded-lg p-3">
        <div className="font-semibold mb-1">Cara Mengisi:</div>
        <div>Ketuk soal untuk memilih, gunakan keyboard untuk mengisi jawaban</div>
      </div>
    </div>
  );
}