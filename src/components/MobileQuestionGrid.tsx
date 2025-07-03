import React, { useState, useEffect, useRef } from 'react';
import { Question, Answer } from '../types/test';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [currentColumnPair, setCurrentColumnPair] = useState(0);
  const [focusedQuestionIndex, setFocusedQuestionIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const questionsPerColumn = 25;
  const totalColumns = 12;
  const columnsPerPage = 2; // Show 2 columns at a time
  const totalPages = Math.ceil(totalColumns / columnsPerPage);
  
  // Auto-scroll to current question's column pair
  useEffect(() => {
    const targetColumnPair = Math.floor(Math.floor(currentQuestionIndex / questionsPerColumn) / columnsPerPage);
    if (targetColumnPair !== currentColumnPair) {
      setCurrentColumnPair(targetColumnPair);
    }
  }, [currentQuestionIndex, questionsPerColumn, columnsPerPage]);
  
  // Auto-scroll to focused question
  useEffect(() => {
    if (scrollContainerRef.current) {
      const focusedElement = scrollContainerRef.current.querySelector(`[data-question-index="${focusedQuestionIndex}"]`);
      if (focusedElement) {
        focusedElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    }
  }, [focusedQuestionIndex, currentColumnPair]);
  
  const handleQuestionClick = (questionIndex: number) => {
    if (!disabled) {
      setFocusedQuestionIndex(questionIndex);
      onQuestionChange(questionIndex);
    }
  };
  
  const handleAnswer = (questionId: string, answer: string, questionIndex: number) => {
    onAnswer(questionId, answer);
    
    // Auto-advance logic: left-right-left-right pattern
    if (answer !== '') {
      const currentColumn = Math.floor(questionIndex / questionsPerColumn);
      const currentRow = questionIndex % questionsPerColumn;
      const currentColumnPairIndex = Math.floor(currentColumn / columnsPerPage);
      const columnInPair = currentColumn % columnsPerPage; // 0 for left, 1 for right
      
      let nextQuestionIndex;
      
      if (columnInPair === 0) {
        // Currently on left column, move to right column same row
        nextQuestionIndex = questionIndex + questionsPerColumn;
      } else {
        // Currently on right column, move to left column next row
        if (currentRow < questionsPerColumn - 1) {
          // Move to next row, left column
          nextQuestionIndex = questionIndex - questionsPerColumn + 1;
        } else {
          // At bottom of right column, move to next column pair, top left
          if (currentColumnPairIndex < totalPages - 1) {
            nextQuestionIndex = (currentColumnPairIndex + 1) * columnsPerPage * questionsPerColumn;
            setCurrentColumnPair(currentColumnPairIndex + 1);
          } else {
            // Stay at current position if at the end
            nextQuestionIndex = questionIndex;
          }
        }
      }
      
      // Ensure we don't go beyond available questions
      if (nextQuestionIndex < questions.length) {
        setTimeout(() => {
          setFocusedQuestionIndex(nextQuestionIndex);
          onQuestionChange(nextQuestionIndex);
        }, 100);
      }
    }
  };
  
  const nextPage = () => {
    if (currentColumnPair < totalPages - 1) {
      setCurrentColumnPair(currentColumnPair + 1);
      // Move focus to first question of new column pair
      const newFocusIndex = (currentColumnPair + 1) * columnsPerPage * questionsPerColumn;
      if (newFocusIndex < questions.length) {
        setFocusedQuestionIndex(newFocusIndex);
        onQuestionChange(newFocusIndex);
      }
    }
  };
  
  const prevPage = () => {
    if (currentColumnPair > 0) {
      setCurrentColumnPair(currentColumnPair - 1);
      // Move focus to first question of previous column pair
      const newFocusIndex = (currentColumnPair - 1) * columnsPerPage * questionsPerColumn;
      setFocusedQuestionIndex(newFocusIndex);
      onQuestionChange(newFocusIndex);
    }
  };
  
  const startColumnIndex = currentColumnPair * columnsPerPage;
  const endColumnIndex = Math.min(startColumnIndex + columnsPerPage, totalColumns);
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
      {/* Page Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevPage}
          disabled={currentColumnPair === 0}
          className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Prev</span>
        </button>
        
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-700">
            Kolom {startColumnIndex + 1}-{endColumnIndex}
          </div>
          <div className="text-xs text-gray-500">
            Halaman {currentColumnPair + 1} dari {totalPages}
          </div>
        </div>
        
        <button
          onClick={nextPage}
          disabled={currentColumnPair === totalPages - 1}
          className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-sm">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Questions Grid - Exact same layout as desktop but only 2 columns */}
      <div className="overflow-x-auto" ref={scrollContainerRef}>
        <div className="flex gap-2 justify-center" style={{ minWidth: 'fit-content' }}>
          {Array.from({ length: endColumnIndex - startColumnIndex }, (_, colIndex) => {
            const actualColumnIndex = startColumnIndex + colIndex;
            
            return (
              <div key={actualColumnIndex} className="flex flex-col gap-1">
                {/* Column header with numbers */}
                <div className="text-center text-sm text-gray-500 mb-1 h-6 font-semibold">
                  {actualColumnIndex + 1}
                </div>
                
                {Array.from({ length: questionsPerColumn }, (_, rowIndex) => {
                  const questionIndex = actualColumnIndex * questionsPerColumn + rowIndex;
                  if (questionIndex >= questions.length) return null;
                  
                  const question = questions[questionIndex];
                  const existingAnswer = answers.find(a => a.questionId === question.id);
                  const isFocused = questionIndex === focusedQuestionIndex;
                  
                  return (
                    <div key={question.id} className="relative" data-question-index={questionIndex}>
                      {/* Row number on the left for first column of the pair */}
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
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                        onClick={() => handleQuestionClick(questionIndex)}
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
                          <div className={`text-xl font-mono font-bold ${
                            existingAnswer?.answer 
                              ? (existingAnswer.isCorrect ? 'text-green-600' : 'text-red-600')
                              : 'text-gray-400'
                          }`}>
                            {existingAnswer?.answer || '?'}
                          </div>
                          
                          {/* Status indicators */}
                          <div className="absolute top-1 right-1 flex flex-col gap-1">
                            {existingAnswer?.answer && (
                              <div className={`w-2 h-2 rounded-full ${
                                existingAnswer.isCorrect ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                            )}
                            {existingAnswer?.wasChanged && (
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                            )}
                          </div>
                          
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
      
      {/* Progress Indicator */}
      <div className="mt-4 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((focusedQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>
      <div className="text-center text-xs text-gray-500 mt-1">
        Soal {focusedQuestionIndex + 1} dari {questions.length}
      </div>
      
      {/* Navigation Instructions */}
      <div className="mt-3 text-center text-xs text-gray-600 bg-blue-50 rounded-lg p-2">
        <div className="font-semibold mb-1">Pola Pengisian:</div>
        <div>Kiri → Kanan → Kiri (baris berikutnya) → Kanan</div>
      </div>
    </div>
  );
}